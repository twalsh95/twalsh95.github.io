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
- Each user has a profile at `users/{uid}/profile/main` (the one Narrative Studio already kept) with `role: student | teacher`, plus `isAdmin` and `isMaster` flags. The Firestore rules (`platform/firestore.rules`) stop anyone setting their own role; Tom's account is the master, by account ID.
- **Teacher accounts:** an account whose email ends in `.org` or `.edu` becomes a teacher on sign-up, once it has confirmed the email (Firebase sends a link, and `email_verified` must be true). The Firestore rules enforce this from the sign-in token (`request.auth.token.email` and `request.auth.token.email_verified`), so the app alone can't grant it. Anyone else (another domain, or a student account that needs teacher tools) gets an invite code from Tom, who asks at help@walshclassroom.com. Students at ACS have `.charter` emails, so they don't match. Accepted risk: some schools give students `.org` or `.edu` addresses; Tom can demote an account from the admin panel. This needs no paid plan or Cloud Functions.
- **Student accounts:** students sign up with email and password and join a class with a join code.

### Data model (sketch)
| Collection | Contents |
|---|---|
| `users/{uid}/profile/main` | name, email, role, isAdmin, isMaster |
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
2. Platform accounts: sign-in on the hub, the bar shows the user, Narrative Studio moves to the platform sign-in, and teacher accounts from verified `.org`/`.edu` emails (plus invite codes for everyone else). Needs Tom's current Firestore rules from the Firebase console.
3. Roles and classes: class creation, join codes, the student and teacher views, and the admin mail feature (below).
4. Assignments and the teacher's read-only view of student work, app by app.

## Locked (Tom, Nov 5 2026)
- The platform uses **Narrative Studio's Firebase project**, so existing accounts and work carry over.
- **Teacher access** (changed Nov 12 2026): verified `.org` and `.edu` emails become teachers on sign-up; everyone else uses an invite code from Tom.
- **Student accounts:** students sign up themselves, then join a class with a class code.
- The architecture above is accepted.

## Email
- **help@walshclassroom.com** forwards to Tom's inbox through Cloudflare Email Routing (free). It's listed on the Teachers page. Setup is Tom's, in the Cloudflare dashboard.
- **Outgoing mail, first step (no code):** add help@walshclassroom.com as a "Send mail as" address in Gmail, using the SMTP server of a free email-sending service (Brevo or Resend). Cloudflare only receives mail; it can't send it. The service has Tom add a few DNS records in Cloudflare so the mail isn't marked as spam.
- **Admin mail feature (Phase 3):** a Send email panel for admin accounts in the hub. The page can't send mail on its own, so it calls a small Cloudflare Worker (free tier) that checks the Firebase sign-in token is an admin's, then sends through the same email service's API. Uses: replying to help requests, sending teacher invite codes, class announcements. Never sends to students without a reason a school would sign off on (check with ACS first).

## Still to check
- Check with ACS whether a student data privacy agreement is needed once other teachers' students sign up.

## Phase 1: built (Nov 5 2026, published)
- Hub pages: `/` (apps), `/teachers/` and `/teachers/<id>/` (explainers), `/help/` (student FAQ and per-app help), and `404.html`.
- `platform/wc.js` draws the bar and provides `wc.apps()`, `wc.app(id)` and `wc.current()`.
- The app list comes from `data/repos.json` (built daily by `.github/workflows/app-list.yml` from repos tagged `walshclassroom`) merged with `apps.js`, where `apps.js` wins.
- Note for Phase 2+: Narrative Studio already has class codes, teacher invite codes (`T-XXXX-XXXX`), a read-only teacher view and passage comments. The platform's class model should take over from these features, not run alongside them.

## Phase 2: built (Nov 12-13 2026, live)
- `/account/`: log in, make an account, reset a password, and a signed-in view (name, email, Student/Teacher/Admin). It sends people back to the page they came from (`?next=`).
- A Log in button in the hub header, and a Log in link (the person's name, once signed in) in the bar inside every app.
- `platform/auth.js`, loaded on demand by `wc.js`: `wc.user()`, `wc.role()`, `wc.onAuth()`, `wc.signOut()`, `wc.signInUrl()`. It reuses the page's Firebase app and reads the role over Firestore's REST API, so apps keep control of their own Firestore settings.
- Narrative Studio's own login form is gone. Signed-out visitors go to the hub's account page and come back. One sign-in covers the whole site, because the hub and the apps share walshclassroom.com.
- Security rules (published Nov 13 2026, copy in `platform/firestore.rules`): roles are protected; a confirmed .org/.edu email makes a teacher; invite codes, comment templates and teacher tips work again; teachers can make their own classrooms. Tested in the Rules Playground before publishing.
- Not yet tested live: redeeming an invite code (needs a second, non-teacher account), and the full log out / log in round trip through Narrative Studio.
- Still Tom-only until Phase 3: reading student workspaces and comments.
