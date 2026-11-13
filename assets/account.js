/* Walsh Classroom: the account page (/account/). Log in, create an account, reset a password, sign out. */
const A = await wc.auth();
const card = document.getElementById("acct-card");
const title = document.getElementById("acct-title");
const lede = document.getElementById("acct-lede");

const params = new URLSearchParams(location.search);
// Only follow "next" back to a page on this site.
const raw = params.get("next") || "";
const next = /^\/(?!\/)/.test(raw) ? raw : "";

function esc(t) { const d = document.createElement("div"); d.textContent = t == null ? "" : String(t); return d.innerHTML; }

const ERRORS = {
  "auth/invalid-credential": "That email and password don't match. Check both, or reset your password.",
  "auth/wrong-password": "That email and password don't match. Check both, or reset your password.",
  "auth/user-not-found": "That email and password don't match. Check both, or reset your password.",
  "auth/invalid-email": "That doesn't look like an email address.",
  "auth/missing-password": "Type your password.",
  "auth/email-already-in-use": "There's already an account with that email. Log in instead.",
  "auth/weak-password": "Use at least 6 characters for your password.",
  "auth/too-many-requests": "Too many tries. Wait a few minutes, then try again.",
  "auth/network-request-failed": "No connection. Check your wifi, then try again."
};
const say = (e) => ERRORS[e && e.code] || "Something went wrong. Try again.";

let mode = params.get("mode") === "create" ? "create" : "login";

function field(id, label, type, auto, extra) {
  return '<div class="field"><label for="' + id + '">' + label + "</label>" +
    '<input id="' + id + '" name="' + id + '" type="' + type + '" autocomplete="' + auto + '" required' + (extra || "") + "></div>";
}

function showForm() {
  title.textContent = mode === "create" ? "Make an account." : mode === "reset" ? "Reset your password." : "Log in.";
  const forms = {
    login:
      field("email", "Email", "email", "username") +
      field("password", "Password", "password", "current-password") +
      '<button class="btn" type="submit">Log in</button>' +
      '<p class="acct-links"><button type="button" class="linkish" data-mode="reset">Forgot your password?</button>' +
      '<button type="button" class="linkish" data-mode="create">New here? Make an account</button></p>',
    create:
      field("name", "Your name", "text", "name") +
      field("email", "Email", "email", "username") +
      field("password", "Password (at least 6 characters)", "password", "new-password", ' minlength="6"') +
      '<button class="btn" type="submit">Make my account</button>' +
      '<p class="acct-links"><button type="button" class="linkish" data-mode="login">Already have an account? Log in</button></p>',
    reset:
      field("email", "Email", "email", "username") +
      '<button class="btn" type="submit">Send me a reset link</button>' +
      '<p class="acct-links"><button type="button" class="linkish" data-mode="login">Back to log in</button></p>'
  };
  card.innerHTML = '<form id="acct-form" novalidate>' + '<p class="acct-msg" id="acct-msg" role="alert"></p>' + forms[mode] + "</form>";
  card.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.mode; showForm(); }));
  const form = document.getElementById("acct-form");
  form.addEventListener("submit", submit);
  const first = form.querySelector("input");
  if (first) first.focus();
}

function message(text, kind) {
  const m = document.getElementById("acct-msg");
  if (!m) return;
  m.textContent = text;
  m.className = "acct-msg" + (kind ? " " + kind : "");
}

async function submit(e) {
  e.preventDefault();
  const form = e.target;
  const v = (k) => (form.elements[k] ? form.elements[k].value.trim() : "");
  const btn = form.querySelector('button[type="submit"]');
  const label = btn.textContent;
  if (!v("email")) return message("Type your email.", "bad");
  if (mode !== "reset" && !form.elements.password.value) return message("Type your password.", "bad");
  btn.disabled = true; btn.textContent = "One moment…";
  try {
    if (mode === "login") {
      await A.signIn(v("email"), form.elements.password.value);
      if (next) { location.href = next; return; }
    } else if (mode === "create") {
      await A.signUp(v("name"), v("email"), form.elements.password.value);
      if (next && !A.isTeacherEmail(v("email"))) { location.href = next; return; }
    } else {
      await A.resetPassword(v("email"));
      message("If there's an account for that email, a reset link is on its way. Check your inbox (and spam).", "ok");
    }
  } catch (err) {
    message(say(err), "bad");
  }
  btn.disabled = false; btn.textContent = label;
}

const ROLE = { student: "Student", teacher: "Teacher", admin: "Admin" };

function showUser(u) {
  title.textContent = "You're logged in.";
  lede.textContent = "This account works in every app on Walsh Classroom.";
  // Only for a .org/.edu account that isn't a teacher yet and hasn't confirmed its email.
  const confirmNote = u.teacherEmail && !u.emailVerified && u.role === "student"
    ? '<div class="callout"><p><strong>Teachers: confirm your email.</strong> Teacher tools switch on once ' + esc(u.email) +
      " is confirmed. Click the link in the email we send you.</p>" +
      '<p><button type="button" class="btn ghost" id="resend">Send me the link</button> ' +
      '<button type="button" class="btn ghost" id="recheck">I clicked it</button></p></div>'
    : "";
  card.innerHTML =
    '<p class="acct-msg" id="acct-msg" role="alert"></p>' +
    '<dl class="acct-facts">' +
    "<div><dt>Name</dt><dd>" + esc(u.name) + "</dd></div>" +
    "<div><dt>Email</dt><dd>" + esc(u.email) + "</dd></div>" +
    '<div><dt>Account</dt><dd><span class="badge">' + esc(ROLE[u.role] || u.role) + "</span></dd></div>" +
    "</dl>" + confirmNote +
    '<div class="acct-actions">' +
    (next ? '<a class="btn" href="' + esc(next) + '">Continue</a>' : '<a class="btn" href="/">Go to the apps</a>') +
    '<button type="button" class="btn ghost" id="logout">Log out</button></div>';
  document.getElementById("logout").addEventListener("click", async () => { await A.logOut(); mode = "login"; });
  const resend = document.getElementById("resend");
  if (resend) resend.addEventListener("click", async () => {
    try { await A.confirmEmail(); message("Sent. Check your inbox (and spam).", "ok"); }
    catch (err) { message(say(err), "bad"); }
  });
  const recheck = document.getElementById("recheck");
  if (recheck) recheck.addEventListener("click", async () => {
    const fresh = await A.refresh();
    if (fresh && !fresh.emailVerified) message("Not confirmed yet. Click the link in the email, then try again.", "bad");
  });
}

A.onChange((u) => {
  if (u) showUser(u);
  else {
    lede.textContent = "One account for every app on Walsh Classroom. Already use Narrative Studio? Same email, same password.";
    showForm();
  }
});
