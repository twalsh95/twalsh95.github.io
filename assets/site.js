/* Walsh Classroom: shared script for hub pages (header, footer, theme, app cards). Needs /platform/wc.js. */
(function () {
  "use strict";
  var root = document.documentElement;

  // ---------- Theme: follows the device until you pick one ----------
  try { var saved = localStorage.getItem("wc_theme"); if (saved) root.dataset.theme = saved; } catch (e) {}
  function isDark() {
    return root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  }
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="miter" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';

  function esc(t) { var d = document.createElement("div"); d.textContent = t == null ? "" : String(t); return d.innerHTML; }

  // ---------- Header + footer ----------
  var here = location.pathname.replace(/index\.html$/, "");
  function navLink(href, label, cls) {
    var cur = (href === "/" ? here === "/" : here.indexOf(href) === 0) ? ' aria-current="page"' : "";
    return '<a href="' + href + '"' + cur + (cls ? ' class="' + cls + '"' : "") + ">" + label + "</a>";
  }
  var header = document.getElementById("site-header");
  if (header) {
    header.className = "site-header";
    header.innerHTML =
      '<div class="wrap">' +
      '<a class="lockup" href="/" aria-label="Walsh Classroom home"><span class="sq"><span class="mark simple"></span></span><span class="word">Walsh Classroom</span></a>' +
      '<nav class="nav" aria-label="Main">' + navLink("/", "Apps") + navLink("/classes/", "Classes", "opt") + navLink("/teachers/", "For teachers", "opt") + navLink("/help/", "Help") + "</nav>" +
      '<a class="login" id="login-btn" href="/account/"' + (here.indexOf("/account/") === 0 ? ' aria-current="page"' : "") + '><span>Log in</span></a>' +
      '<button class="icon-btn" id="theme-btn" type="button"></button>' +
      "</div>";
    var btn = document.getElementById("theme-btn");
    var paint = function () {
      var dark = isDark();
      btn.innerHTML = dark ? SUN : MOON;
      btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    };
    paint();
    btn.addEventListener("click", function () {
      root.dataset.theme = isDark() ? "light" : "dark";
      try { localStorage.setItem("wc_theme", root.dataset.theme); } catch (e) {}
      paint();
    });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", paint);
  }
  // Log in button: becomes the person's name once they're signed in.
  var login = document.getElementById("login-btn");
  if (login && window.wc && wc.onAuth) {
    wc.onAuth(function (u) {
      login.querySelector("span").textContent = u ? u.name : "Log in";
      login.title = u ? "Signed in as " + u.email : "";
    });
  }
  var footer = document.getElementById("site-footer");
  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML =
      '<div class="wrap"><span class="mark" aria-hidden="true"></span>' +
      "<p>Made by Tom Walsh for his media arts classes.<br>No ads, no subscriptions. &copy; " + new Date().getFullYear() + "</p>" +
      '<nav aria-label="Footer">' + '<a href="/">Apps</a><a href="/teachers/">For teachers</a><a href="/help/">Help</a></nav></div>';
  }

  // ---------- App cards ----------
  var s = 'viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"';
  var ICONS = {
    book: '<svg ' + s + '><path d="M24 12c-4-3-10-4-16-3v27c6-1 12 0 16 3 4-3 10-4 16-3V9c-6-1-12 0-16 3z"/><path d="M24 12v27"/></svg>',
    clay: '<svg ' + s + '><circle cx="24" cy="14" r="7"/><path d="M12 42c0-9 5-16 12-16s12 7 12 16z"/></svg>',
    film: '<svg ' + s + '><rect x="7" y="9" width="34" height="30"/><path d="M15 9v30M33 9v30M7 18h8M7 30h8M33 18h8M33 30h8"/></svg>',
    camera: '<svg ' + s + '><path d="M6 16h8l3-5h14l3 5h8v22H6z"/><circle cx="24" cy="26" r="7"/></svg>',
    pencil: '<svg ' + s + '><path d="M10 38l4-11 20-20 7 7-20 20z"/><path d="M29 12l7 7"/></svg>',
    palette: '<svg ' + s + '><path d="M24 7a17 17 0 1 0 0 34c3 0 4-2 3-4s0-5 3-5h5c4 0 6-3 6-7C41 14 33 7 24 7z"/><circle cx="16" cy="20" r="2"/><circle cx="24" cy="15" r="2"/><circle cx="32" cy="20" r="2"/></svg>',
    puzzle: '<svg ' + s + '><path d="M10 14h8a4 4 0 1 1 8 0h8v8a4 4 0 1 1 0 8v8H26a4 4 0 1 0-8 0h-8V30a4 4 0 1 0 0-8z"/></svg>',
    sparkle: '<svg ' + s + '><path d="M24 6l4 14 14 4-14 4-4 14-4-14-14-4 14-4z"/></svg>',
    grid: '<svg ' + s + '><rect x="8" y="8" width="13" height="13"/><rect x="27" y="8" width="13" height="13"/><rect x="8" y="27" width="13" height="13"/><rect x="27" y="27" width="13" height="13"/></svg>'
  };
  var STATUS = { beta: "Beta", soon: "Coming soon" };
  function initials(name) {
    var w = String(name || "?").split(/\s+/).filter(Boolean);
    return (w.length > 1 ? w[0][0] + w[1][0] : String(name).slice(0, 2)).toUpperCase();
  }
  function card(a) {
    var soon = a.status === "soon";
    var badge = STATUS[a.status] ? '<span class="badge ' + a.status + '">' + STATUS[a.status] + "</span>" : "";
    var tags = a.tags.map(function (t) { return '<span class="badge">' + esc(t) + "</span>"; }).join("");
    var open = soon
      ? '<span class="btn" aria-disabled="true">Coming soon</span>'
      : '<a class="btn" href="' + esc(a.href) + '">Open<span class="sr" style="position:absolute;left:-9999px"> ' + esc(a.name) + "</span></a>";
    var about = a.about ? '<a class="btn ghost" href="/teachers/' + esc(a.id) + '/">About</a>' : "";
    return '<article class="card" style="--c:' + esc(a.color) + '">' +
      '<div class="block">' + badge + '<span class="initials" aria-hidden="true">' + esc(initials(a.name)) + "</span>" + (ICONS[a.icon] || ICONS.sparkle) + "</div>" +
      '<div class="body"><h3>' + esc(a.name) + "</h3>" +
      (a.tagline ? '<p class="tagline">' + esc(a.tagline) + "</p>" : "") +
      (a.description && a.description !== a.tagline ? '<p class="desc">' + esc(a.description) + "</p>" : "") +
      '<div class="meta"><span class="badge kind"' + (a.kindColor ? ' style="--k:' + esc(a.kindColor) + '"' : "") + ">" + esc(a.kind) + "</span>" + tags + "</div>" +
      (a.note ? '<p class="note">' + esc(a.note) + "</p>" : "") +
      '<div class="actions">' + open + about + "</div></div></article>";
  }

  window.WCSite = { esc: esc, card: card, icons: ICONS, initials: initials };
})();
