/*
  Walsh Classroom platform script.

  Add this one line to an app's index.html, just before </body>:

    <script src="/platform/wc.js" defer></script>

  It draws the Walsh Classroom bar along the top of the app, and pushes the page down to make room.
  If the app has its own position:fixed header at top:0, give that header
  `top: var(--wc-bar-height, 0px)` so it sits under the bar.

  Options (attributes on the script tag):
    data-bar="off"      no bar; just load the app registry (the hub pages use this)
    data-offset="none"  draw the bar but don't push the page down

  Also gives apps and hub pages:
    wc.apps()        Promise of the full app list (generated repo list merged with apps.js overrides)
    wc.app(id)       Promise of one app, by id (its repo name)
    wc.current()     Promise of the app this page belongs to, or null
  Sign-in helpers (wc.user, wc.role, wc.classes, wc.assignments) arrive in Phase 2.
*/
(function () {
  "use strict";
  if (window.wc && window.wc.__loaded) return;
  var script = document.currentScript;
  var ORIGIN = script ? new URL(script.src, location.href).origin : location.origin;
  var BAR_H = 44;
  var PALETTE = ["#4A35B5", "#0F6B52", "#0B5874", "#A82E64", "#B34A26"];

  function idFromHref(href) {
    var m = /^\/([^\/?#]+)\/?/.exec(href || "");
    return m ? m[1] : null;
  }
  function titleCase(slug) {
    return String(slug).replace(/[-_]+/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }
  function loadScript(src) {
    return new Promise(function (resolve) {
      if (window.WC_APPS) return resolve();
      var s = document.createElement("script");
      s.src = src; s.onload = s.onerror = function () { resolve(); };
      document.head.appendChild(s);
    });
  }

  var registry = null;
  function apps() {
    if (registry) return registry;
    var generated = fetch(ORIGIN + "/data/repos.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : { apps: [] }; })
      .catch(function () { return { apps: [] }; });
    var overrides = loadScript(ORIGIN + "/apps.js").then(function () { return window.WC_APPS || []; });
    registry = Promise.all([generated, overrides]).then(function (res) {
      var byId = {}, order = [];
      function put(entry) {
        var id = entry.id || idFromHref(entry.href) || String(entry.name || "").toLowerCase().replace(/\W+/g, "-");
        if (!byId[id]) { byId[id] = { id: id }; order.push(id); }
        Object.keys(entry).forEach(function (k) { if (entry[k] !== undefined) byId[id][k] = entry[k]; });
      }
      (res[0].apps || []).forEach(function (repo) {
        var base = { id: repo.id, name: titleCase(repo.id), description: repo.description, href: "/" + repo.id + "/" };
        put(Object.assign(base, repo.manifest || {}));
      });
      // apps.js wins: anything set there overrides the generated list, and its order comes first.
      var manual = res[1].map(function (a) { put(a); return a.id || idFromHref(a.href); });
      order = manual.concat(order.filter(function (id) { return manual.indexOf(id) < 0; }));
      return order.map(function (id, i) {
        var a = byId[id];
        a.kind = a.kind || "App";
        a.status = a.status || "live";
        a.tags = a.tags || [];
        a.color = a.color || PALETTE[i % PALETTE.length];
        a.tagline = a.tagline || a.description || "";
        return a;
      });
    });
    return registry;
  }
  function app(id) { return apps().then(function (list) { return list.filter(function (a) { return a.id === id; })[0] || null; }); }
  function current() {
    var id = idFromHref(location.pathname);
    return id ? app(id) : Promise.resolve(null);
  }

  window.wc = { __loaded: true, apps: apps, app: app, current: current, origin: ORIGIN };

  // ---------- The bar ----------
  if (script && script.getAttribute("data-bar") === "off") return;

  var CSS =
    ":host{all:initial}" +
    ".bar{position:fixed;top:0;left:0;right:0;height:" + BAR_H + "px;z-index:2147483000;display:flex;align-items:stretch;" +
    "background:#0B0B0C;color:#fff;font:700 14px/1 'Atkinson Hyperlegible',system-ui,sans-serif;border-bottom:3px solid var(--c,#4A35B5);box-sizing:border-box}" +
    "a{color:inherit;text-decoration:none;display:flex;align-items:center;gap:8px;padding:0 14px}" +
    "a:hover{background:#fff;color:#0B0B0C}" +
    "a:focus-visible{outline:3px solid #8F7EF2;outline-offset:-3px}" +
    ".home{padding:0 14px 0 0;gap:0}" +
    ".home:hover{background:none;color:#fff}.home:hover .word{background:#fff;color:#0B0B0C}" +
    ".sq{width:" + (BAR_H - 3) + "px;height:100%;background:#4A35B5;display:grid;place-items:center}" +
    ".mk{width:20px;height:28px;background:#fff;-webkit-mask:url(" + ORIGIN + "/assets/logo/beard-mark-simple.svg) center/contain no-repeat;mask:url(" + ORIGIN + "/assets/logo/beard-mark-simple.svg) center/contain no-repeat}" +
    ".word{font:800 12px/1 Unbounded,'Arial Black',sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:0 12px;height:100%;display:flex;align-items:center}" +
    ".app{display:flex;align-items:center;gap:8px;padding:0 14px;border-left:1.5px solid #3A3A3E;min-width:0}" +
    ".dot{width:12px;height:12px;background:var(--c,#4A35B5);flex:none}" +
    ".name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".right{margin-left:auto;display:flex}" +
    ".right a{border-left:1.5px solid #3A3A3E}" +
    "@media (max-width:640px){.word{display:none}.right .all span{display:none}}";

  function draw(cur) {
    var host = document.createElement("div");
    host.id = "wc-bar";
    var root = host.attachShadow({ mode: "open" });
    var color = cur && cur.color ? cur.color : "#4A35B5";
    var helpHref = ORIGIN + "/help/" + (cur ? "#" + cur.id : "");
    root.innerHTML =
      "<style>" + CSS + "</style>" +
      '<nav class="bar" style="--c:' + color + '" aria-label="Walsh Classroom">' +
      '<a class="home" href="' + ORIGIN + '/" title="Walsh Classroom home"><span class="sq"><span class="mk"></span></span><span class="word">Walsh Classroom</span></a>' +
      (cur ? '<span class="app"><span class="dot"></span><span class="name"></span></span>' : "") +
      '<span class="right"><a href="' + helpHref + '">Help</a>' +
      '<a class="all" href="' + ORIGIN + '/">&#8592;<span>All apps</span></a></span></nav>';
    if (cur) root.querySelector(".name").textContent = cur.name;
    document.body.insertBefore(host, document.body.firstChild);
    document.documentElement.style.setProperty("--wc-bar-height", BAR_H + "px");
    if (!script || script.getAttribute("data-offset") !== "none") {
      var pad = parseFloat(getComputedStyle(document.documentElement).paddingTop) || 0;
      document.documentElement.style.paddingTop = (pad + BAR_H) + "px";
      document.documentElement.style.scrollPaddingTop = BAR_H + "px";
    }
  }
  function start() { current().then(draw, function () { draw(null); }); }
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
