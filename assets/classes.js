/* Walsh Classroom: the classes page (/classes/). Students join and leave; teachers make and manage classes. */
const C = await wc.classesModule();
const A = await wc.auth();
const root = document.getElementById("cls-root");
const S = window.WCSite;
const esc = S.esc;

const allApps = (await wc.apps()).filter((a) => !a.hidden && a.status !== "soon");
const appById = Object.fromEntries(allApps.map((a) => [a.id, a]));

function appChips(ids) {
  const list = (ids || []).map((id) => appById[id]).filter(Boolean);
  if (!list.length) return "";
  return '<div class="cls-apps">' + list.map((a) =>
    '<a class="chip" href="' + esc(a.href) + '" style="--c:' + esc(a.color) + '"><span class="dot" aria-hidden="true"></span>' + esc(a.name) + "</a>"
  ).join("") + "</div>";
}
function appPicker(name, selected) {
  return '<fieldset class="cls-pick"><legend>Apps this class uses <span class="note">(optional)</span></legend>' +
    allApps.map((a) =>
      '<label><input type="checkbox" name="' + name + '" value="' + esc(a.id) + '"' + ((selected || []).includes(a.id) ? " checked" : "") + "> " + esc(a.name) + "</label>"
    ).join("") + "</fieldset>";
}
function say(el, text, kind) { el.textContent = text; el.className = "acct-msg" + (kind ? " " + kind : ""); }
const ERR = (e) => (e && e.code === "denied") ? "You don't have permission to do that." : (e && e.message) || "Something went wrong. Try again.";

// ---------- Students ----------
function studentSection(enrolled) {
  return '<section class="cls-block" aria-labelledby="in-title">' +
    '<h2 class="display" id="in-title">Classes you\'re in</h2>' +
    '<form class="acct-card cls-join" id="join-form" novalidate>' +
    '<p class="acct-msg" id="join-msg" role="alert"></p>' +
    '<div class="field"><label for="join-code">Class code</label>' +
    '<input id="join-code" name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCD-1234" required></div>' +
    '<button class="btn" type="submit">Join</button></form>' +
    (enrolled.length
      ? '<div class="cls-grid">' + enrolled.map((c) =>
          '<article class="cls-card"><h3>' + esc(c.name) + "</h3>" +
          (c.teacherName ? '<p class="cls-meta">Teacher: ' + esc(c.teacherName) + "</p>" : "") +
          appChips(c.apps) +
          '<p class="cls-actions"><button type="button" class="linkish" data-leave="' + esc(c.id) + '" data-name="' + esc(c.name) + '">Leave this class</button></p></article>'
        ).join("") + "</div>"
      : '<p class="empty">You\'re not in a class yet. Ask your teacher for the code.</p>') +
    "</section>";
}

// ---------- Teachers ----------
function teacherSection(teaching, showArchived) {
  const open = teaching.filter((c) => !c.archived), archived = teaching.filter((c) => c.archived);
  return '<section class="cls-block" aria-labelledby="teach-title">' +
    '<h2 class="display" id="teach-title">Classes you teach</h2>' +
    '<form class="acct-card cls-make" id="make-form" novalidate>' +
    '<p class="acct-msg" id="make-msg" role="alert"></p>' +
    '<div class="field"><label for="make-name">Class name</label><input id="make-name" name="name" placeholder="Screenwriting, Period 5" required></div>' +
    appPicker("apps") +
    '<button class="btn" type="submit">Make the class</button></form>' +
    (open.length ? '<div class="cls-list">' + open.map(teacherCard).join("") + "</div>"
      : '<p class="empty">No classes yet. Make one above, then give your students the code.</p>') +
    (archived.length
      ? '<details class="faq cls-archived"' + (showArchived ? " open" : "") + '><summary>Archived classes (' + archived.length + ')</summary><div class="a">' +
        archived.map((c) => '<p><strong>' + esc(c.name) + '</strong> <button type="button" class="linkish" data-restore="' + esc(c.id) + '">Restore</button></p>').join("") +
        "</div></details>" : "") +
    "</section>";
}
function teacherCard(c) {
  return '<article class="cls-panel" data-id="' + esc(c.id) + '">' +
    '<div class="cls-panel-head"><div><h3>' + esc(c.name) + "</h3>" +
    '<p class="cls-meta">' + (c.students == null ? "" : c.students + (c.students === 1 ? " student" : " students")) + "</p>" +
    appChips(c.apps) + "</div>" +
    '<div class="cls-code"><span class="cls-code-label">Code</span><span class="cls-code-value">' + esc(c.code) + "</span>" +
    '<button type="button" class="btn ghost" data-copy="' + esc(c.code) + '">Copy</button></div></div>' +
    '<p class="acct-msg" role="alert"></p>' +
    '<div class="acct-actions"><button type="button" class="btn ghost" data-roster="' + esc(c.id) + '">See students</button>' +
    '<button type="button" class="btn ghost" data-apps="' + esc(c.id) + '">Change apps</button>' +
    '<button type="button" class="btn ghost" data-archive="' + esc(c.id) + '" data-name="' + esc(c.name) + '">Archive</button></div>' +
    '<div class="cls-drawer" hidden></div></article>';
}

// ---------- Page ----------
let state = { teaching: [], enrolled: [] };
async function load(opts) {
  const u = await A.user();
  if (!u) {
    root.innerHTML = '<div class="acct-card"><p>Log in to join a class or see the ones you\'re in.</p>' +
      '<p><a class="btn" href="' + esc(wc.signInUrl()) + '">Log in</a></p></div>';
    return;
  }
  const teacher = u.role === "teacher" || u.role === "admin";
  const [teaching, enrolled] = await Promise.all([teacher ? C.teaching({ includeArchived: true }) : [], C.enrolled()]);
  state = { teaching, enrolled };
  root.innerHTML = (teacher ? teacherSection(teaching, opts && opts.showArchived) : "") +
    (!teacher || enrolled.length ? studentSection(enrolled) : "");
  wire(u);
}

function wire(u) {
  const join = document.getElementById("join-form");
  if (join) join.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("join-msg"), btn = join.querySelector("button");
    const code = join.elements.code.value;
    if (!code.trim()) return say(msg, "Type the class code.", "bad");
    btn.disabled = true; btn.textContent = "Joining…";
    try { const c = await C.join(code); await load(); say(document.getElementById("join-msg"), "You're in " + c.name + ".", "ok"); }
    catch (err) { say(msg, ERR(err), "bad"); btn.disabled = false; btn.textContent = "Join"; }
  });

  const make = document.getElementById("make-form");
  if (make) make.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("make-msg"), btn = make.querySelector('button[type="submit"]');
    const name = make.elements.name.value.trim();
    const apps = [...make.querySelectorAll('input[name="apps"]:checked')].map((i) => i.value);
    if (!name) return say(msg, "Give the class a name.", "bad");
    btn.disabled = true; btn.textContent = "Making it…";
    try { const c = await C.create({ name, apps }); await load(); say(document.getElementById("make-msg"), "Made " + c.name + ". Its code is " + c.code + ".", "ok"); }
    catch (err) { say(msg, ERR(err), "bad"); btn.disabled = false; btn.textContent = "Make the class"; }
  });

  root.querySelectorAll("[data-leave]").forEach((b) => b.addEventListener("click", async () => {
    if (!confirm("Leave " + b.dataset.name + "? Your teacher won't see your work any more. You can rejoin with the code.")) return;
    b.disabled = true;
    try { await C.leave(b.dataset.leave); await load(); } catch (err) { alert(ERR(err)); b.disabled = false; }
  }));

  root.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = "Copied"; setTimeout(() => { b.textContent = "Copy"; }, 1500); }
    catch (e) { b.textContent = b.dataset.copy; }
  }));

  root.querySelectorAll("[data-archive]").forEach((b) => b.addEventListener("click", async () => {
    if (!confirm("Archive " + b.dataset.name + "? Its code stops working. Students and their work stay, and you can restore it later.")) return;
    try { await C.update(b.dataset.archive, { archived: true }); await load(); } catch (err) { alert(ERR(err)); }
  }));
  root.querySelectorAll("[data-restore]").forEach((b) => b.addEventListener("click", async () => {
    try { await C.update(b.dataset.restore, { archived: false }); await load({ showArchived: true }); } catch (err) { alert(ERR(err)); }
  }));

  root.querySelectorAll("[data-roster]").forEach((b) => b.addEventListener("click", async () => {
    const panel = b.closest(".cls-panel"), drawer = panel.querySelector(".cls-drawer");
    if (!drawer.hidden && drawer.dataset.kind === "roster") { drawer.hidden = true; b.textContent = "See students"; return; }
    drawer.dataset.kind = "roster"; drawer.hidden = false; drawer.innerHTML = "<p>Loading…</p>"; b.textContent = "Hide students";
    try {
      const list = await C.roster(b.dataset.roster);
      drawer.innerHTML = list.length
        ? '<table class="cls-roster"><thead><tr><th scope="col">Student</th><th scope="col">Email</th><th scope="col"><span class="sr-only">Remove</span></th></tr></thead><tbody>' +
          list.map((s) => "<tr><td>" + esc(s.name) + "</td><td>" + esc(s.email) + '</td><td><button type="button" class="linkish" data-remove="' + esc(s.uid) + '" data-name="' + esc(s.name) + '">Remove</button></td></tr>').join("") +
          "</tbody></table>"
        : '<p class="empty">Nobody has joined yet. Share the code.</p>';
      drawer.querySelectorAll("[data-remove]").forEach((r) => r.addEventListener("click", async () => {
        if (!confirm("Remove " + r.dataset.name + " from this class? You won't see their work any more (unless they're in another of your classes). Their work stays in their account.")) return;
        r.disabled = true;
        try { await C.remove(b.dataset.roster, r.dataset.remove); r.closest("tr").remove(); }
        catch (err) { alert(ERR(err)); r.disabled = false; }
      }));
    } catch (err) { drawer.innerHTML = '<p class="acct-msg bad">' + esc(ERR(err)) + "</p>"; }
  }));

  root.querySelectorAll("[data-apps]").forEach((b) => b.addEventListener("click", () => {
    const panel = b.closest(".cls-panel"), drawer = panel.querySelector(".cls-drawer");
    const c = state.teaching.find((x) => x.id === b.dataset.apps);
    if (!drawer.hidden && drawer.dataset.kind === "apps") { drawer.hidden = true; return; }
    drawer.dataset.kind = "apps"; drawer.hidden = false;
    drawer.innerHTML = '<form class="cls-apps-form">' + appPicker("apps-" + c.id, c.apps) + '<button class="btn" type="submit">Save apps</button></form>';
    drawer.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const apps = [...drawer.querySelectorAll('input[type="checkbox"]:checked')].map((i) => i.value);
      try { await C.update(c.id, { apps }); await load(); } catch (err) { say(panel.querySelector(".acct-msg"), ERR(err), "bad"); }
    });
  }));
}

A.onChange(() => load().catch((err) => { root.innerHTML = '<p class="acct-msg bad">' + esc(ERR(err)) + "</p>"; }));
