/*
  Walsh Classroom assignments (Phase 4).

  A teacher posts an assignment to a class; students in the class see it, turn it in
  (optionally attaching a project from their own workspace, or a link), and can unsubmit
  and turn in again any time. The teacher sees who turned in, and can mark a submission
  returned with a short note the student sees.

  Loaded on demand by wc.js (wc.assignments) and by the hub's /classes/ page. Like
  classes.js it talks to Firestore's REST API with the person's own token, and the
  security rules (platform/firestore.rules) decide what each person may do.

  Data:
    classrooms/{cid}/assignments/{aid}
      title, instructions, appId (null = any app), link, dueAt (Date or null),
      posted (false = draft), teacherUid, createdAt, updatedAt
    classrooms/{cid}/assignments/{aid}/submissions/{studentUid}
      uid, studentName, status ("turnedIn" | "unsubmitted"), turnedInAt,
      attachment ({kind:"project", appId, path, title} | {kind:"link", url} | null),
      returned, note, returnedAt   (the last three are the teacher's)

  Worked out, not stored (see state()): todo, missing, turnedIn, late, returned.
*/
import * as A from "./auth.js";
import * as C from "./classes.js";

const { getDoc, query, where, commit } = C.rest;

async function me() {
  const u = await A.user();
  if (!u) throw Object.assign(new Error("Log in first."), { code: "signed-out" });
  return u;
}
const isTeacher = (u) => u.role === "teacher" || u.role === "admin";
const aPath = (cid, aid) => "classrooms/" + cid + "/assignments" + (aid ? "/" + aid : "");
const sPath = (cid, aid, uid) => aPath(cid, aid) + "/submissions" + (uid ? "/" + uid : "");
const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 20);
const time = (d) => (d instanceof Date ? d.getTime() : d ? new Date(d).getTime() : 0);

// ---------- Where a submission stands ----------
// "returned"  the teacher returned it and it hasn't been turned in again since
// "turnedIn"  turned in on time (or no due date)
// "late"      turned in after the due date
// "missing"   past due, not turned in
// "todo"      not turned in, not yet due (or no due date)
export function state(assignment, sub, now = Date.now()) {
  const due = time(assignment && assignment.dueAt);
  if (sub && sub.status === "turnedIn") {
    if (sub.returned && time(sub.returnedAt) >= time(sub.turnedInAt)) return "returned";
    return due && time(sub.turnedInAt) > due ? "late" : "turnedIn";
  }
  return due && now > due ? "missing" : "todo";
}
export const LABELS = { todo: "To do", missing: "Missing", turnedIn: "Turned in", late: "Turned in late", returned: "Returned" };

function cleanLink(url) {
  const s = String(url || "").trim();
  if (!s) return null;
  if (!/^https?:\/\/\S+$/i.test(s)) throw new Error("Links need to start with http:// or https://");
  if (s.length > 2000) throw new Error("That link is too long.");
  return s;
}

// ---------- Teachers ----------
// Every assignment in one of my classes (drafts too), newest first, with counts.
export async function forClass(classId, { counts = true } = {}) {
  const list = await query("classrooms/" + classId, { from: [{ collectionId: "assignments" }] });
  if (counts) {
    const roster = await C.roster(classId).catch(() => []);
    await Promise.all(list.map(async (a) => {
      const subs = a.posted ? await submissionsRaw(classId, a.id) : [];
      const onRoster = new Set(roster.map((s) => s.uid));
      const states = subs.filter((s) => onRoster.has(s.id)).map((s) => state(a, s));
      a.counts = {
        students: roster.length,
        turnedIn: states.filter((x) => x === "turnedIn" || x === "late" || x === "returned").length,
        toReview: states.filter((x) => x === "turnedIn" || x === "late").length
      };
    }));
  }
  return list.sort((a, b) => time(b.createdAt) - time(a.createdAt));
}

export async function get(classId, assignmentId) {
  return getDoc(aPath(classId, assignmentId));
}

// Make or edit an assignment. Pass id to edit. posted: false keeps it a draft.
export async function save(classId, fields) {
  const u = await me();
  if (!isTeacher(u)) throw new Error("Only teachers can post assignments.");
  const title = String(fields.title || "").trim();
  if (!title) throw new Error("Give the assignment a title.");
  if (title.length > 200) throw new Error("Keep the title under 200 characters.");
  const c = await getDoc("classrooms/" + classId);
  if (!c) throw new Error("That class isn't there any more.");
  const id = fields.id || newId();
  const data = {
    title,
    instructions: String(fields.instructions || "").trim(),
    appId: fields.appId || null,
    link: cleanLink(fields.link),
    dueAt: fields.dueAt ? new Date(fields.dueAt) : null,
    posted: !!fields.posted,
    teacherUid: c.teacherUid
  };
  await commit([{ set: aPath(classId, id), data, merge: !!fields.id, stamp: fields.id ? ["updatedAt"] : ["createdAt", "updatedAt"] }]);
  return Object.assign({ id }, data);
}

export function post(classId, assignmentId, posted = true) {
  return commit([{ set: aPath(classId, assignmentId), data: { posted: !!posted }, merge: true, stamp: ["updatedAt"] }]);
}

// Delete an assignment and every submission to it (Firestore doesn't do that by itself).
export async function remove(classId, assignmentId) {
  const subs = await submissionsRaw(classId, assignmentId);
  const changes = subs.map((s) => ({ del: sPath(classId, assignmentId, s.id) }));
  changes.push({ del: aPath(classId, assignmentId) });
  for (let i = 0; i < changes.length; i += 400) await commit(changes.slice(i, i + 400));
}

async function submissionsRaw(classId, assignmentId) {
  return query(aPath(classId, assignmentId), { from: [{ collectionId: "submissions" }] });
}

// The roster for one assignment: every student, with their submission (or none) and state.
// Students who turned in and then left the class are listed after, marked left: true.
export async function submissions(classId, assignmentId) {
  const [a, roster, subs] = await Promise.all([
    get(classId, assignmentId), C.roster(classId), submissionsRaw(classId, assignmentId)
  ]);
  const byUid = new Map(subs.map((s) => [s.id, s]));
  const rows = roster.map((s) => {
    const sub = byUid.get(s.uid) || null;
    byUid.delete(s.uid);
    return { uid: s.uid, name: s.name, email: s.email, submission: sub, state: state(a, sub) };
  });
  byUid.forEach((sub, uid) => rows.push({ uid, name: sub.studentName || "Former student", email: "", submission: sub, state: state(a, sub), left: true }));
  return { assignment: a, rows };
}

// Mark a submission returned, with an optional short note the student sees.
export function giveBack(classId, assignmentId, studentUid, note) {
  const n = String(note || "").trim();
  if (n.length > 2000) throw new Error("Keep the note under 2,000 characters.");
  return commit([{ set: sPath(classId, assignmentId, studentUid), data: { returned: true, note: n }, merge: true, stamp: ["returnedAt"] }]);
}

// ---------- Students ----------
// Posted assignments in my classes, with my submission and its state, soonest due first.
// Pass appId to get only assignments for that app (or for any app).
export async function mine({ appId } = {}) {
  const u = await me();
  const classes = await C.enrolled();
  const out = [];
  await Promise.all(classes.map(async (c) => {
    const list = await query("classrooms/" + c.id, { from: [{ collectionId: "assignments" }], where: where("posted", true) }).catch(() => []);
    await Promise.all(list.map(async (a) => {
      if (appId && a.appId && a.appId !== appId) return;
      const sub = await getDoc(sPath(c.id, a.id, u.uid)).catch(() => null);
      out.push(Object.assign(a, { classId: c.id, className: c.name, teacherName: c.teacherName || "", submission: sub, state: state(a, sub) }));
    }));
  }));
  const order = { missing: 0, todo: 1, returned: 2, late: 3, turnedIn: 3 };
  return out.sort((x, y) => (order[x.state] - order[y.state]) || ((time(x.dueAt) || Infinity) - (time(y.dueAt) || Infinity)));
}

// Turn in. attachment: null, {kind:"link", url}, or {kind:"project", appId, path, title}
// where path is inside my own folder, e.g. "users/<my uid>/projects/<id>".
export async function turnIn(classId, assignmentId, attachment = null) {
  const u = await me();
  let att = null;
  if (attachment && attachment.kind === "link") att = { kind: "link", url: cleanLink(attachment.url) };
  else if (attachment && attachment.kind === "project") {
    if (!String(attachment.path || "").startsWith("users/" + u.uid + "/")) throw new Error("You can only attach your own work.");
    att = { kind: "project", appId: attachment.appId || null, path: attachment.path, title: String(attachment.title || "").slice(0, 200) };
  }
  if (att && att.kind === "link" && !att.url) att = null;
  const existing = await getDoc(sPath(classId, assignmentId, u.uid)).catch(() => null);
  const data = { uid: u.uid, studentName: u.name || u.email || "", status: "turnedIn", attachment: att };
  await commit([{ set: sPath(classId, assignmentId, u.uid), data, merge: !!existing, stamp: ["turnedInAt", "updatedAt"] }]);
}

// Take a turn-in back to change it. The teacher's note stays.
export async function unsubmit(classId, assignmentId) {
  const u = await me();
  await commit([{ set: sPath(classId, assignmentId, u.uid), data: { status: "unsubmitted" }, merge: true, stamp: ["updatedAt"] }]);
}
