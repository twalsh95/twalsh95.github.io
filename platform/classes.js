/*
  Walsh Classroom classes (Phase 3).

  The site's classes are Narrative Studio's `classrooms`: same documents, same join codes.
  Loaded on demand by wc.js (wc.classes()) and by the /classes/ page.

  Like auth.js, this never starts the Firestore SDK. It talks to Firestore's REST API with
  the signed-in person's own token, so it can't clash with an app's Firestore settings,
  and the security rules (platform/firestore.rules) decide what each person may do.

  Data:
    classrooms/{id}                 name, code, teacherUid, teacherName, apps[], archived
    classrooms/{id}/members/{uid}   displayName, email, joinedAt
    classrooms/{id}/shared/{uid_projectId}   projects a student shares with the class
    classAccess/{teacherUid}_{studentUid}    lets that teacher read that student's work
*/
import * as A from "./auth.js";

const API = "https://firestore.googleapis.com/v1/";
const ROOT = "projects/" + A.projectId + "/databases/(default)/documents";
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // same as Narrative Studio

// ---------- Firestore REST plumbing ----------
function enc(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
  if (typeof v === "object") return { mapValue: { fields: encFields(v) } };
  return { stringValue: String(v) };
}
function encFields(o) { const f = {}; Object.keys(o).forEach((k) => { f[k] = enc(o[k]); }); return f; }
function dec(v) {
  if (!v) return null;
  if ("stringValue" in v) return v.stringValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("timestampValue" in v) return new Date(v.timestampValue);
  if ("nullValue" in v) return null;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(dec);
  if ("mapValue" in v) return decFields(v.mapValue.fields || {});
  return null;
}
function decFields(f) { const o = {}; Object.keys(f || {}).forEach((k) => { o[k] = dec(f[k]); }); return o; }
function docOut(d) { return Object.assign({ id: d.name.split("/").pop(), _path: d.name.split("/documents/")[1] }, decFields(d.fields)); }

async function call(method, url, body) {
  const t = await A.token();
  if (!t) throw Object.assign(new Error("Log in first."), { code: "signed-out" });
  const r = await fetch(API + url, {
    method,
    headers: Object.assign({ Authorization: "Bearer " + t }, body ? { "Content-Type": "application/json" } : {}),
    body: body ? JSON.stringify(body) : undefined
  });
  if (r.status === 404) return null;
  const j = r.status === 204 ? {} : await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = new Error((j.error && j.error.message) || ("Request failed (" + r.status + ")"));
    e.code = r.status === 403 ? "denied" : "failed";
    throw e;
  }
  return j;
}
async function getDoc(path) { const d = await call("GET", ROOT + "/" + path); return d && d.fields ? docOut(d) : null; }
async function query(parent, structuredQuery) {
  const rows = await call("POST", ROOT + (parent ? "/" + parent : "") + ":runQuery", { structuredQuery });
  return (rows || []).filter((r) => r.document).map((r) => docOut(r.document));
}
function where(field, value) {
  return { fieldFilter: { field: { fieldPath: field }, op: "EQUAL", value: enc(value) } };
}
function and(...filters) { return filters.length === 1 ? filters[0] : { compositeFilter: { op: "AND", filters } }; }
// One atomic write of several changes. Each change: {set: path, data, stamp: [fields]} or {del: path}.
function commit(changes) {
  const writes = changes.map((c) => {
    if (c.del) return { delete: ROOT + "/" + c.del };
    const w = { update: { name: ROOT + "/" + c.set, fields: encFields(c.data) } };
    if (c.merge) w.updateMask = { fieldPaths: Object.keys(c.data) };
    if (c.stamp) w.updateTransforms = c.stamp.map((f) => ({ fieldPath: f, setToServerValue: "REQUEST_TIME" }));
    return w;
  });
  return call("POST", ROOT + ":commit", { writes });
}

// ---------- Who's asking ----------
async function me() {
  const u = await A.user();
  if (!u) throw Object.assign(new Error("Log in first."), { code: "signed-out" });
  return u;
}
const isTeacher = (u) => u.role === "teacher" || u.role === "admin";

function newCode() {
  let c = "";
  for (let i = 0; i < 8; i++) { if (i === 4) c += "-"; c += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]; }
  return c;
}
export function normalizeCode(raw) {
  const s = String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return s.length === 8 ? s.slice(0, 4) + "-" + s.slice(4) : String(raw || "").toUpperCase().trim();
}

// ---------- Reading ----------
// Classes I teach, newest first, with student counts.
export async function teaching({ includeArchived = false } = {}) {
  const u = await me();
  if (!isTeacher(u)) return [];
  const list = await query("", { from: [{ collectionId: "classrooms" }], where: where("teacherUid", u.uid) });
  const out = list.filter((c) => includeArchived || !c.archived);
  await Promise.all(out.map(async (c) => {
    c.apps = c.apps || [];
    try { c.students = (await roster(c.id)).length; } catch (e) { c.students = null; }
    // Older classes (made in Narrative Studio) have no teacherName; fill it in so students can see it.
    if (!c.teacherName && u.name) {
      c.teacherName = u.name;
      commit([{ set: "classrooms/" + c.id, data: { teacherName: u.name }, merge: true }]).catch(() => {});
    }
  }));
  return out.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

// Classes I'm a student in.
export async function enrolled() {
  const u = await me();
  const open = await query("", { from: [{ collectionId: "classrooms" }], where: where("archived", false) });
  const mine = [];
  await Promise.all(open.map(async (c) => {
    if (c.teacherUid === u.uid) return;
    const m = await getDoc("classrooms/" + c.id + "/members/" + u.uid).catch(() => null);
    if (m) mine.push(Object.assign(c, { apps: c.apps || [], joinedAt: m.joinedAt }));
  }));
  return mine.sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

// Both, for wc.classes() and the home page.
export async function mine() {
  const u = await A.user();
  if (!u) return { user: null, teaching: [], enrolled: [] };
  const [t, e] = await Promise.all([teaching(), enrolled()]);
  ensureAccess(u, e).catch(() => {});
  return { user: u, teaching: t, enrolled: e };
}

// A class's roster (its teacher and Tom only; the rules enforce it).
export async function roster(classId) {
  const list = await query("classrooms/" + classId, { from: [{ collectionId: "members" }] });
  return list.map((m) => ({ uid: m.id, name: m.displayName || m.email || "Student", email: m.email || "", joinedAt: m.joinedAt }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ---------- Teachers ----------
export async function create({ name, apps }) {
  const u = await me();
  if (!isTeacher(u)) throw new Error("Only teachers can make a class.");
  if (!String(name || "").trim()) throw new Error("Give the class a name.");
  let code = newCode();
  for (let i = 0; i < 5; i++) {
    const clash = await query("", { from: [{ collectionId: "classrooms" }], where: where("code", code), limit: 1 });
    if (!clash.length) break;
    code = newCode();
  }
  const id = Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 20);
  await commit([{
    set: "classrooms/" + id,
    data: { name: name.trim(), code, teacherUid: u.uid, teacherName: u.name || "", apps: apps || [], archived: false, schemaVersion: 1 },
    stamp: ["createdAt", "updatedAt"]
  }]);
  return { id, name: name.trim(), code, apps: apps || [], students: 0, archived: false };
}

export function update(classId, fields) {
  const allowed = {};
  ["name", "apps", "archived"].forEach((k) => { if (k in fields) allowed[k] = fields[k]; });
  return commit([{ set: "classrooms/" + classId, data: allowed, merge: true, stamp: ["updatedAt"] }]);
}

// Remove a student from one of my classes. Their access record goes too, unless
// they're still in another class of mine.
export async function remove(classId, studentUid) {
  const u = await me();
  const changes = [{ del: "classrooms/" + classId + "/members/" + studentUid }];
  const others = (await teaching({ includeArchived: true })).filter((c) => c.id !== classId);
  let stillMine = false;
  for (const c of others) {
    if (await getDoc("classrooms/" + c.id + "/members/" + studentUid).catch(() => null)) { stillMine = true; break; }
  }
  if (!stillMine) changes.push({ del: "classAccess/" + u.uid + "_" + studentUid });
  const shared = await query("classrooms/" + classId, { from: [{ collectionId: "shared" }], where: where("ownerUid", studentUid) }).catch(() => []);
  shared.forEach((s) => changes.push({ del: "classrooms/" + classId + "/shared/" + s.id }));
  return commit(changes);
}

// ---------- Students ----------
export async function join(rawCode) {
  const u = await me();
  const code = normalizeCode(rawCode);
  const found = await query("", {
    from: [{ collectionId: "classrooms" }],
    where: and(where("code", code), where("archived", false)),
    limit: 1
  });
  if (!found.length) throw new Error("No class has that code. Check it with your teacher.");
  const c = found[0];
  if (c.teacherUid === u.uid) throw new Error("That's your own class. Share the code with your students.");
  // Two steps: the rules only allow the access record once the membership exists.
  // If the second step fails, ensureAccess() makes the record on the next visit.
  await commit([
    { set: "classrooms/" + c.id + "/members/" + u.uid, data: { displayName: u.name || u.email, email: u.email || "" }, stamp: ["joinedAt"] }
  ]);
  await commit([
    { set: "classAccess/" + c.teacherUid + "_" + u.uid,
      data: { teacherUid: c.teacherUid, studentUid: u.uid, classroomId: c.id, studentName: u.name || u.email },
      stamp: ["updatedAt"] }
  ]).catch(() => {});
  return Object.assign(c, { apps: c.apps || [] });
}

export async function leave(classId) {
  const u = await me();
  const classes = await enrolled();
  const c = classes.find((x) => x.id === classId);
  if (!c) return;
  const changes = [{ del: "classrooms/" + classId + "/members/" + u.uid }];
  // Keep the teacher's access if I'm still in another of their classes.
  if (!classes.some((x) => x.id !== classId && x.teacherUid === c.teacherUid)) {
    changes.push({ del: "classAccess/" + c.teacherUid + "_" + u.uid });
  }
  const shared = await query("classrooms/" + classId, { from: [{ collectionId: "shared" }], where: where("ownerUid", u.uid) }).catch(() => []);
  shared.forEach((s) => changes.push({ del: "classrooms/" + classId + "/shared/" + s.id }));
  return commit(changes);
}

// Students who joined before Phase 3 have no access record yet. Make the missing ones.
async function ensureAccess(u, classes) {
  for (const c of classes) {
    const key = "classAccess/" + c.teacherUid + "_" + u.uid;
    if (await getDoc(key).catch(() => null)) continue;
    await commit([{ set: key, data: { teacherUid: c.teacherUid, studentUid: u.uid, classroomId: c.id, studentName: u.name || u.email }, stamp: ["updatedAt"] }]);
  }
}
