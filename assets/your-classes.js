/* Walsh Classroom: "Your classes" on the home page. Hidden when signed out; nothing changes for visitors. */
(function () {
  "use strict";
  var section = document.getElementById("your-classes");
  var body = document.getElementById("yc-body");
  if (!section || !window.wc || !wc.onAuth) return;
  var esc = window.WCSite.esc;

  function chips(ids, byId) {
    var list = (ids || []).map(function (id) { return byId[id]; }).filter(Boolean);
    if (!list.length) return "";
    return '<div class="cls-apps">' + list.map(function (a) {
      return '<a class="chip" href="' + esc(a.href) + '" style="--c:' + esc(a.color) + '"><span class="dot" aria-hidden="true"></span>' + esc(a.name) + "</a>";
    }).join("") + "</div>";
  }

  function render(data, apps) {
    var byId = {};
    apps.forEach(function (a) { byId[a.id] = a; });
    var cards = [];
    data.teaching.forEach(function (c) {
      cards.push('<article class="cls-card"><span class="badge">Teaching</span><h3>' + esc(c.name) + "</h3>" +
        '<p class="cls-meta">Code <strong class="yc-code">' + esc(c.code) + "</strong>" +
        (c.students == null ? "" : " &middot; " + c.students + (c.students === 1 ? " student" : " students")) + "</p>" +
        chips(c.apps, byId) + '<p class="cls-actions"><a class="linkish" href="/classes/">Manage</a></p></article>');
    });
    data.enrolled.forEach(function (c) {
      cards.push('<article class="cls-card"><h3>' + esc(c.name) + "</h3>" +
        (c.teacherName ? '<p class="cls-meta">Teacher: ' + esc(c.teacherName) + "</p>" : "") +
        chips(c.apps, byId) + "</article>");
    });
    var teacher = data.user.role === "teacher" || data.user.role === "admin";
    if (!cards.length) {
      body.innerHTML = teacher
        ? '<div class="empty"><p>You don\'t have a class yet.</p><p><a class="btn" href="/classes/">Make a class</a></p></div>'
        : '<div class="empty"><p>Got a class code from your teacher?</p><p><a class="btn" href="/classes/">Join a class</a></p></div>';
    } else {
      body.innerHTML = '<div class="cls-grid">' + cards.join("") + "</div>" +
        (teacher ? '<p class="yc-more"><a class="btn ghost" href="/classes/">Make a class</a></p>' : "");
    }
    section.hidden = false;
  }

  wc.onAuth(function (u) {
    if (!u) { section.hidden = true; body.innerHTML = ""; return; }
    Promise.all([wc.classes(), wc.apps()]).then(function (r) {
      if (r[0].user) render(r[0], r[1].filter(function (a) { return !a.hidden; }));
    }).catch(function () { section.hidden = true; });
  });
})();
