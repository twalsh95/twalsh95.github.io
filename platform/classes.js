/*
  Walsh Classroom classes (Phase 3).

  The site's classes are Narrative Studio's `classrooms`: same documents, same join codes.
  Loaded on demand by wc.js (wc.classes()) and by the /classes/ page.

  Like auth.js, this never starts the Firestore SDK. It talks to Firestore's REST API with
  the signed-in person's own token, so it can't clash with an app's Firestore settings,
  and the security rules (platform/firestore.rules) decide what each person may do.

  Data:
    classrooms/{id}                 name, code, teacherUid, teacherName, apps[], archived
    classrooms/{id}/members/{uid}   displayName, email, code, joinedAt
    classrooms/{id}/shared/{uid_projectId}   projects a student shares with the class
    classAccess/{teacherUid}_{studentUid}    lets that teacher read that student's work
    classCodes/{code}               classroomId, teacherUid (Phase 3.1: look up by code, never list)
    enrollments/{classroomId}_{uid} classroomId, uid, teacherUid (Phase 3.1: a student's own classes)

  Phase 3.1: classes are readable only by their teacher, their students and Tom. Until
  the Phase 3.1 rules are published, every function here falls back to the old way
  (listing classes) when the new collections are refused, so it works under both.
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

// ---------- Phase 3.1 records ----------
const enrollmentKey = (classId, uid) => "enrollments/" + classId + "_" + uid;
function setCode(c) {
  return commit([{ set: "classCodes/" + c.code, data: { classroomId: c.id, teacherUid: c.teacherUid } }]);
}
function setEnrollment(classId, uid, teacherUid) {
  return commit([{ set: enrollmentKey(classId, uid), data: { classroomId: classId, uid, teacherUid }, stamp: ["updatedAt"] }]);
}

// ---------- Reading ----------
// Classes I teach, newest first, with student counts.
export async function teaching({ includeArchived = false } = {}) {
  const u = await me();
  if (!isTeacher(u)) return [];
  const all = await query("", { from: [{ collectionId: "classrooms" }], where: where("teacherUid", u.uid) });
  const out = all.filter((c) => includeArchived || !c.archived);
  const rosters = {};
  await Promise.all(out.map(async (c) => {
    c.apps = c.apps || [];
    try { rosters[c.id] = await roster(c.id); c.students = rosters[c.id].length; } catch (e) { c.students = null; }
    // Older classes (made in Narrative Studio) have no teacherName; fill it in so students can see it.
    if (!c.teacherName && u.name) {
      c.teacherName = u.name;
      commit([{ set: "classrooms/" + c.id, data: { teacherName: u.name }, merge: true }]).catch(() => {});
    }
  }));
  ensureTeacherRecords(u, all, rosters).catch(() => {});
  return out.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

// Fill in Phase 3.1 records for classes made before them: a join code for every open
// class, and an enrollment for every student on a roster. Quietly does nothing until
// the Phase 3.1 rules are published.
async function ensureTeacherRecords(u, classes, rosters) {
  for (const c of classes) {
    if (c.archived || !c.code) continue;
    const have = await getDoc("classCodes/" + c.code);
    if (!have) await setCode(c);
  }
  const existing = new Set((await query("", { from: [{ collectionId: "enrollments" }], where: where("teacherUid", u.uid) }))
    .map((e) => e.classroomId + "_" + e.uid));
  for (const c of classes) {
    for (const s of rosters[c.id] || []) {
      if (!existing.has(c.id + "_" + s.uid)) await setEnrollment(c.id, s.uid, c.teacherUid).catch(() => {});
    }
  }
}

// Classes I'm a student in.
export async function enrolled() {
  const u = await me();
  let rows;
  try {
    rows = await query("", { from: [{ collectionId: "enrollments" }], where: where("uid", u.uid) });
  } catch (e) {
    if (e.code === "denied") return enrolledOldWay(u);   // Phase 3.1 rules not published yet
    throw e;
  }
  if (!rows.length) rows = await enrollmentsFromAccess(u);
  const mine = [];
  await Promise.all(rows.map(async (e) => {
    const m = await getDoc("classrooms/" + e.classroomId + "/members/" + u.uid).catch(() => null);
    if (!m) {   // removed by the teacher since: tidy the stale record
      commit([{ del: enrollmentKey(e.classroomId, u.uid) }]).catch(() => {});
      return;
    }
    const c = await getDoc("classrooms/" + e.classroomId).catch(() => null);
    if (c && !c.archived) mine.push(Object.assign(c, { apps: c.apps || [], joinedAt: m.joinedAt }));
  }));
  return mine.sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

// A student who joined before enrollments existed: their teacher-access records name a
// class they joined. Make the missing enrollments from those.
async function enrollmentsFromAccess(u) {
  const access = await query("", { from: [{ collectionId: "classAccess" }], where: where("studentUid", u.uid) }).catch(() => []);
  const rows = [];
  for (const a of access) {
    if (!a.classroomId) continue;
    const m = await getDoc("classrooms/" + a.classroomId + "/members/" + u.uid).catch(() => null);
    if (!m) continue;
    await setEnrollment(a.classroomId, u.uid, a.teacherUid).catch(() => {});
    rows.push({ classroomId: a.classroomId });
  }
  return rows;
}

// Before the Phase 3.1 rules: list open classes and check each for my membership.
async function enrolledOldWay(u) {
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
    if (!(await codeTaken(code))) break;
    code = newCode();
  }
  const id = Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 20);
  await commit([{
    set: "classrooms/" + id,
    data: { name: name.trim(), code, teacherUid: u.uid, teacherName: u.name || "", apps: apps || [], archived: false, schemaVersion: 1 },
    stamp: ["createdAt", "updatedAt"]
  }]);
  await setCode({ id, code, teacherUid: u.uid }).catch(() => {});   // refused before Phase 3.1; filled in later
  return { id, name: name.trim(), code, apps: apps || [], students: 0, archived: false };
}
async function codeTaken(code) {
  try { return !!(await getDoc("classCodes/" + code)); }
  catch (e) {   // before Phase 3.1
    const clash = await query("", { from: [{ collectionId: "classrooms" }], where: where("code", code), limit: 1 });
    return clash.length > 0;
  }
}

export async function update(classId, fields) {
  const allowed = {};
  ["name", "apps", "archived"].forEach((k) => { if (k in fields) allowed[k] = fields[k]; });
  await commit([{ set: "classrooms/" + classId, data: allowed, merge: true, stamp: ["updatedAt"] }]);
  // An archived class can't be joined: its code goes, and comes back on restore.
  if ("archived" in allowed) {
    const c = await getDoc("classrooms/" + classId);
    if (c && c.code) {
      const op = allowed.archived ? commit([{ del: "classCodes/" + c.code }]) : setCode(c);
      await op.catch(() => {});
    }
  }
}

// Remove a student from one of my classes. Their access record goes too, unless
// they're still in another class of mine.
export async function remove(classId, studentUid) {
  const u = await me();
  const changes = [{ del: "classrooms/" + classId + "/members/" + studentUid }];
  commit([{ del: enrollmentKey(classId, studentUid) }]).catch(() => {});   // separate: refused before Phase 3.1
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
  const NOPE = "No class has that code. Check it with your teacher.";
  // Phase 3.1: look the code up directly. Before those rules, find the class by listing.
  let classId, teacherUid, c = null;
  try {
    const hit = await getDoc("classCodes/" + code);
    if (!hit) throw new Error(NOPE);
    classId = hit.classroomId; teacherUid = hit.teacherUid;
  } catch (e) {
    if (e.code !== "denied") throw e;
    const found = await query("", {
      from: [{ collectionId: "classrooms" }],
      where: and(where("code", code), where("archived", false)),
      limit: 1
    });
    if (!found.length) throw new Error(NOPE);
    c = found[0]; classId = c.id; teacherUid = c.teacherUid;
  }
  if (teacherUid === u.uid) throw new Error("That's your own class. Share the code with your students.");
  // Membership first (it carries the code, which the rules check); the class itself is
  // readable once I'm in it. The access record and enrollment need the membership too.
  // If either later step fails, the next visit fills it in.
  await commit([
    { set: "classrooms/" + classId + "/members/" + u.uid, data: { displayName: u.name || u.email, email: u.email || "", code }, stamp: ["joinedAt"] }
  ]);
  if (!c) c = await getDoc("classrooms/" + classId);
  await commit([
    { set: "classAccess/" + teacherUid + "_" + u.uid,
      data: { teacherUid, studentUid: u.uid, classroomId: classId, studentName: u.name || u.email },
      stamp: ["updatedAt"] }
  ]).catch(() => {});
  await setEnrollment(classId, u.uid, teacherUid).catch(() => {});
  return Object.assign(c || { id: classId, name: "your class" }, { apps: (c && c.apps) || [] });
}

export async function leave(classId) {
  const u = await me();
  const classes = await enrolled();
  const c = classes.find((x) => x.id === classId);
  if (!c) return;
  const changes = [{ del: "classrooms/" + classId + "/members/" + u.uid }];
  // The enrollment goes too (once the Phase 3.1 rules are live; before that, deleting a
  // record the rules don't know about would fail the whole change, so it's separate).
  commit([{ del: enrollmentKey(classId, u.uid) }]).catch(() => {});
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
