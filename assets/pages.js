/* Walsh Classroom: renders the teacher explainer pages and the student help page from the app list. */
(function () {
  "use strict";
  var S = window.WCSite, esc = S.esc;
  var main = document.getElementById("main");
  var page = window.WC_PAGE || {};
  function list(items, tag) {
    return items && items.length ? "<" + tag + ">" + items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</" + tag + ">" : "";
  }
  function todo(items) {
    return items && items.length
      ? '<div class="todo"><strong>Still to add:</strong>' + list(items, "ul") + "</div>" : "";
  }

  // ---------- /teachers/<id>/ ----------
  function explainer(a) {
    if (!a || !a.about) {
      main.innerHTML = '<section class="page-head"><div class="wrap"><a class="crumb" href="/teachers/">&#8592; All explainers</a><h1 class="display">No explainer yet.</h1></div></section>';
      return;
    }
    var ab = a.about, d = ab.details || {};
    document.title = a.name + " for teachers | Walsh Classroom";
    var facts = Object.keys(d).map(function (k) { return "<div><dt>" + esc(k) + "</dt><dd>" + esc(d[k]) + "</dd></div>"; }).join("");
    var open = a.status === "soon" ? '<span class="btn" aria-disabled="true">Coming soon</span>' : '<a class="btn" href="' + esc(a.href) + '">Open ' + esc(a.name) + "</a>";
    main.innerHTML =
      '<section class="page-head app" style="--c:' + esc(a.color) + '"><div class="wrap">' +
      '<a class="crumb" href="/teachers/">&#8592; All explainers</a>' +
      '<p class="eyebrow">' + esc(a.kind) + " &middot; For teachers</p>" +
      '<h1 class="display">' + esc(a.name) + "</h1>" +
      '<p class="lede">' + esc(a.tagline) + "</p></div></section>" +
      '<section class="section"><div class="wrap layout"><div class="prose">' +
      "<h2>What it is</h2><p>" + esc(ab.summary) + "</p>" +
      (ab.students ? "<h2>What students do</h2>" + list(ab.students, "ol") : "") +
      (ab.classroom ? "<h2>Using it in class</h2>" + list(ab.classroom, "ul") : "") +
      (ab.todo && ab.todo.length ? "<h2>Coming to this page</h2>" + todo(ab.todo) : "") +
      '<h2>Students need help?</h2><p>Send them to the <a href="/help/#' + esc(a.id) + '">' + esc(a.name) + " help section</a>.</p>" +
      "</div>" +
      '<aside class="facts" aria-label="Quick facts"><dl>' + facts + '</dl><div class="open">' + open + "</div></aside>" +
      "</div></section>";
  }

  // ---------- /teachers/ ----------
  function teachers(apps) {
    var withAbout = apps.filter(function (a) { return a.about; });
    document.getElementById("explainers").innerHTML = withAbout.map(function (a) {
      return '<article class="card" style="--c:' + esc(a.color) + '">' +
        '<div class="block"><span class="initials" aria-hidden="true">' + esc(S.initials(a.name)) + "</span>" + (S.icons[a.icon] || S.icons.sparkle) + "</div>" +
        '<div class="body"><h3>' + esc(a.name) + "</h3><p class=\"desc\">" + esc(a.about.summary) + "</p>" +
        '<div class="meta"><span class="badge kind">' + esc(a.kind) + "</span>" + a.tags.map(function (t) { return '<span class="badge">' + esc(t) + "</span>"; }).join("") + "</div>" +
        '<div class="actions"><a class="btn" href="/teachers/' + esc(a.id) + '/">Read the explainer</a></div></div></article>';
    }).join("") || '<p class="empty">No explainers yet.</p>';
  }

  // ---------- /help/ ----------
  function faq(items) {
    return (items || []).map(function (f) {
      return '<details class="faq"><summary>' + esc(f.q) + '</summary><div class="a"><p>' + esc(f.a) + "</p></div></details>";
    }).join("");
  }
  function help(apps) {
    var withHelp = apps.filter(function (a) { return a.help; });
    document.getElementById("toc").innerHTML = withHelp.map(function (a) {
      return '<a class="chip" href="#' + esc(a.id) + '" style="border-left:10px solid ' + esc(a.color) + '">' + esc(a.name) + "</a>";
    }).join("");
    document.getElementById("app-help").innerHTML = withHelp.map(function (a) {
      return '<section id="' + esc(a.id) + '" class="app-help" style="scroll-margin-top:96px">' +
        '<h2 style="display:flex;align-items:center;gap:12px"><span style="width:20px;height:20px;background:' + esc(a.color) + ';border:1.5px solid var(--ink);flex:none"></span>' + esc(a.name) + "</h2>" +
        (a.help.steps ? "<h3>Getting started</h3>" + list(a.help.steps, "ol") : "") +
        (a.help.faq ? "<h3>Common questions</h3>" + faq(a.help.faq) : "") +
        '<p style="margin-top:20px"><a class="btn" href="' + esc(a.href) + '">Open ' + esc(a.name) + "</a></p></section>";
    }).join("");
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  }

  wc.apps().then(function (all) {
    var apps = all.filter(function (a) { return !a.hidden; });
    if (page.type === "explainer") explainer(apps.filter(function (a) { return a.id === page.app; })[0]);
    else if (page.type === "teachers") teachers(apps);
    else if (page.type === "help") help(apps);
  });
})();
