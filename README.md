# walshclassroom.com

The hub for Mr. Walsh's classroom apps, games and tools. It's hosted free on GitHub Pages.
For the design decisions, see [brand/DESIGN.md](brand/DESIGN.md). For how the platform works and the build plan, see [brand/PLATFORM.md](brand/PLATFORM.md).

## How it works

This repo is named `twalsh95.github.io`, which makes it your GitHub **user site**. It has the custom domain walshclassroom.com, so GitHub also serves **every repo of yours that has Pages turned on** at `walshclassroom.com/<repo-name>/`:

| Repo                 | Address                                       |
|----------------------|-----------------------------------------------|
| twalsh95.github.io   | walshclassroom.com (this hub)                 |
| narrative-studio-2   | walshclassroom.com/narrative-studio-2/        |
| guide-match          | walshclassroom.com/guide-match/               |
| triton-alumni-portal | walshclassroom.com/triton-alumni-portal/ (hidden: no card) |

## Files

```
index.html             Home page: the hero, the app strip, and the app cards
teachers/              "For teachers": index.html lists the explainers; one page per app at teachers/<id>/
help/                  Student help: general FAQ plus a section for each app
404.html               "This scene didn't make the final cut."
apps.js                YOUR OVERRIDES for the app list, plus each app's explainer and help text
data/repos.json        The automatic app list (rebuilt by GitHub every day; don't edit by hand)
platform/wc.js         The Walsh Classroom bar for apps, and the app-list loader
assets/wc.css          Shared styles (colors, type, components)
assets/site.js         Shared header, footer, theme toggle and app cards
assets/pages.js        Draws the explainer and help pages from the app list
assets/logo/           The beard mark: beard-mark.svg (one color), beard-mark-simple.svg (small sizes), beard-mark-two-tone.svg
favicon.svg            The browser-tab icon (switches for dark mode)
scripts/build-app-list.mjs     Builds data/repos.json and the explainer pages
.github/workflows/app-list.yml Runs that script daily, and whenever apps.js changes
brand/                 Design and platform notes, plus your original logo files
publish-site.bat       Double-click to publish your changes
```

## Add an app

**The automatic way:**
1. In the app's repo, go to Settings > Pages and deploy from the `main` branch.
2. On the repo's main page, click the gear next to **About** and add the topic `walshclassroom`.
3. Optional: add a `walshclassroom.json` file to the repo root with any of the fields described at the top of `apps.js`. For example:
   ```json
   { "name": "Virtual Claymation Studio", "kind": "App", "color": "#0B5874", "icon": "clay",
     "tagline": "Pose clay characters and shoot stop-motion in your browser." }
   ```
4. Add the bar to the app (see below).

The app appears within a day. To make it appear now, go to the Actions tab, choose **Update app list**, then click **Run workflow**.

**The manual way, or to change how an app looks:** edit `apps.js`, then run `publish-site.bat`. Anything set in `apps.js` wins over the automatic list, and the order there sets the order on the home page.

**Explainers and help:** add an `about` section (the teacher explainer) and a `help` section (student help) to the app's entry in `apps.js`. The Narrative Studio entry shows the format. The explainer page at `/teachers/<id>/` is created automatically the next time the workflow runs. To create it right away, run `node scripts/build-app-list.mjs --offline`.

## Add the Walsh Classroom bar to an app

Add one line to the app's `index.html`, just before `</body>`:

```html
<script src="/platform/wc.js" defer></script>
```

The bar sits at the top of the app and pushes the page down 44px. If the app has its own header pinned to the top (`position: fixed` or `sticky` with `top: 0`), change that header's `top` to `var(--wc-bar-height, 0px)` so it sits under the bar.

## Notes

- Email/password sign-in (what Narrative Studio uses) works on any domain. If an app ever uses Google sign-in or email-link sign-in, add `walshclassroom.com` under Firebase console > Authentication > Settings > Authorized domains.
- The daily workflow commits as `github-actions[bot]`. If its commits ever stop showing up on the live site, check the Actions tab for a failed **pages build and deployment** run.
