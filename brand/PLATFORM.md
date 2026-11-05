# How Walsh Classroom works

Working record from the design pass (Nov 2026). Companion to DESIGN.md. Not built yet.

## Decisions (Tom, Nov 5 2026)
1. **One landing page for everyone.** Visitors browse it without signing in. Signing in sends you to the student view or the teacher view, based on your account type.
2. **The hub handles accounts.** You sign in once and get access to every app. Accounts have a type, student or teacher; the teacher role is no longer hard-coded the way Narrative Studio does it.
   - Teachers create classes and assign work to them.
   - Students join classes and see the work assigned to them.
   - Teachers can open a read-only view of a student's work.
3. **What goes on the hub:** apps for now. Later, other resources such as handouts and reference pages.
4. **Grouping:** by type (App / Game / Tool). This drives the filters.
5. **Visibility** is tied to accounts: some apps or items are public, some need sign-in, some are only for classes they're assigned to, some are teacher-only, and some are hidden.
6. **Explainers:**
   - For teachers deciding whether to use an app: one page per app.
   - For students: a help page with an FAQ and a tutorial for each app.
7. **Shared navigation:** a Walsh Classroom bar that stays on screen inside every app.
8. **App list:** built both ways. It's generated automatically from tagged repos, and Tom's overrides (in apps.js) win.

## Architecture

### Shared sign-in
Every app is served from one origin (https://walshclassroom.com), so apps on the same Firebase project share one sign-in session automatically.
- Proposed: **one Firebase project for the whole platform.**
- Recommended: reuse Narrative Studio's existing project, so current student accounts and work carry over and nothing needs migrating.

### Platform script
`walshclassroom.com/platform/wc.js` is hosted in the hub repo, and each app adds it with one `<script>` tag. It provides:
- the persistent nav bar (logo, app name, the user's name, a back link to the hub, sign-out)
- `wc.user()`, `wc.role()`, `wc.classes()` and `wc.assignments()`, so apps never write their own login screens

Because the script lives in the hub repo, a fix there updates every app at once.

This was chosen over wrapping apps in an iframe, which would break deep links, fullscreen and mobile layout.

### Roles
- Each user has a `users/{uid}` document with `role: student | teacher | admin`. Firestore rules stop users from setting their own role.
- **Teacher accounts:** someone requests teacher access, and an admin (Tom) approves it. This needs no paid plan or Cloud Functions.
- **Student accounts:** students sign up with email and password and join a class with a join code.

### Data model (sketch)
| Collection | Contents |
|---|---|
| `users/{uid}` | name, email, role |
| `classes/{id}` | name, teacherUids, joinCode, studentUids |
| `assignments/{id}` | classId, appId, title, instructions, due date, optional activity link |
| `apps/{appId}/work/{docId}` | ownerUid, classIds, plus app-specific data |

Rules for work documents: the owner can read and write. A teacher of any class in `classIds` can read.

### App contract
To join the platform, an app does three things:
1. adds `wc.js`
2. uses the platform sign-in
3. saves student work under its own `apps/{appId}/work` path with `ownerUid`

### Visibility
The code of every app is public on GitHub Pages; only listing and data access can be restricted. "Teacher-only" and "class-only" control who can see an item and its data. The rules enforce this, not hidden URLs.

## Build phases
1. New design: landing page, explainers, student help, `wc.js` (nav bar only), app-list automation.
2. Platform accounts: sign-in on the hub, the bar shows the user, and Narrative Studio moves to the platform sign-in.
3. Roles and classes: teacher approval, class creation, join codes, the student and teacher views.
4. Assignments and the teacher's read-only view of student work, app by app.

## Locked (Tom, Nov 5 2026)
- The platform uses **Narrative Studio's Firebase project**, so existing accounts and work carry over.
- **Teacher access:** someone requests it, and Tom (admin) approves.
- **Student accounts:** students sign up themselves, then join a class with a class code.
- The architecture above is accepted.

## Still to check
- Check with ACS whether a student data privacy agreement is needed once other teachers' students sign up.

## Phase 1: built (Nov 5 2026, not yet published)
- Hub pages: `/` (apps), `/teachers/` and `/teachers/<id>/` (explainers), `/help/` (student FAQ and per-app help), and `404.html`.
- `platform/wc.js` draws the bar and provides `wc.apps()`, `wc.app(id)` and `wc.current()`.
- The app list comes from `data/repos.json` (built daily by `.github/workflows/app-list.yml` from repos tagged `walshclassroom`) merged with `apps.js`, where `apps.js` wins.
- Note for Phase 2+: Narrative Studio already has class codes, teacher invite codes (`T-XXXX-XXXX`), a read-only teacher view and passage comments. The platform's class model should take over from these features, not run alongside them.
