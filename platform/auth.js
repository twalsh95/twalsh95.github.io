/*
  Walsh Classroom sign-in (Phase 2).

  Loaded on demand by wc.js. Uses Narrative Studio's Firebase project, so every
  existing account works here. The hub and the apps share one origin
  (walshclassroom.com), so signing in once signs you in everywhere.

  Two rules keep this from fighting with an app that runs its own Firebase:
    - It reuses the default Firebase app if the page already made one, and the
      config matches, so Firebase hands back the same app and the same sign-in.
    - It never starts Firestore. The role is read through Firestore's REST API
      with the user's own token, so apps keep full control of their Firestore
      settings (Narrative Studio turns on offline persistence, which has to
      happen before anything else touches Firestore).
*/
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, sendPasswordResetEmail, sendEmailVerification, updateProfile
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Public web config (not a secret: Firebase web configs ship to every browser).
const CONFIG = {
  apiKey: "AIzaSyClzB9zJGEDptWLy8BNrnD0QAdVRJDbk1E",
  authDomain: "narrative-studio-backend.firebaseapp.com",
  projectId: "narrative-studio-backend",
  storageBucket: "narrative-studio-backend.firebasestorage.app",
  messagingSenderId: "465446631091",
  appId: "1:465446631091:web:fe86a6f49d8e8e947d22c6"
};

const app = getApps().length ? getApp() : initializeApp(CONFIG);
const auth = getAuth(app);

// Teacher emails: .org and .edu (confirmed by email link). See brand/PLATFORM.md.
export function isTeacherEmail(email) {
  return /\.(org|edu)$/i.test(String(email || "").split("@")[1] || "");
}

// The profile Narrative Studio keeps: users/{uid}/profile/main.
async function readProfile(u) {
  if (!u) return null;
  try {
    const token = await u.getIdToken();
    const url = "https://firestore.googleapis.com/v1/projects/" + CONFIG.projectId +
      "/databases/(default)/documents/users/" + u.uid + "/profile/main";
    const r = await fetch(url, { headers: { Authorization: "Bearer " + token } });
    if (!r.ok) return null;
    const f = (await r.json()).fields || {};
    const val = (k) => f[k] ? (f[k].stringValue !== undefined ? f[k].stringValue : f[k].booleanValue) : undefined;
    return { role: val("role"), isAdmin: !!val("isAdmin"), displayName: val("displayName") };
  } catch (e) {
    return null;
  }
}

function shape(u, p) {
  if (!u) return null;
  const role = p && p.isAdmin && p.role === "teacher" ? "admin" : (p && p.role) || "student";
  return {
    uid: u.uid,
    email: u.email,
    name: u.displayName || (p && p.displayName) || u.email,
    emailVerified: u.emailVerified,
    teacherEmail: isTeacherEmail(u.email),
    role
  };
}

let current;                      // undefined until Firebase reports, then a user or null
const listeners = new Set();
function publish(v) { current = v; listeners.forEach((fn) => { try { fn(v); } catch (e) {} }); }

const ready = new Promise((resolve) => {
  onAuthStateChanged(auth, async (u) => { publish(shape(u, await readProfile(u))); resolve(); });
});

export function user() { return ready.then(() => current); }
export function onChange(fn) {
  listeners.add(fn);
  if (current !== undefined) fn(current);
  return () => listeners.delete(fn);
}
export async function refresh() {
  if (auth.currentUser) await auth.currentUser.reload();
  publish(shape(auth.currentUser, await readProfile(auth.currentUser)));
  return current;
}

// Emailed links come back to the account page when that domain is allowed in
// Firebase; if it isn't, Firebase's own page handles the link instead.
async function withReturn(send) {
  try { await send({ url: location.origin + "/account/" }); }
  catch (e) {
    if (e && /continue-uri|unauthorized/i.test(e.code || "")) await send(undefined);
    else throw e;
  }
}

export async function signIn(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
  return refresh();
}
export async function signUp(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(cred.user, { displayName: name });
  if (isTeacherEmail(email)) await withReturn((s) => sendEmailVerification(cred.user, s)).catch(() => {});
  return refresh();
}
export function resetPassword(email) {
  return withReturn((s) => sendPasswordResetEmail(auth, email, s));
}
export function confirmEmail() {
  if (!auth.currentUser) return Promise.resolve();
  return withReturn((s) => sendEmailVerification(auth.currentUser, s));
}
export function logOut() { return signOut(auth); }
