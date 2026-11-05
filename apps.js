/*
  ============================================================
  THE APP LIST: your overrides.

  Most apps can now be added WITHOUT editing this file:
    1. In the app's GitHub repo, turn on Pages (Settings > Pages).
    2. Add the topic "walshclassroom" to the repo (the gear next to "About" on the repo page).
    3. Optional: add a walshclassroom.json file to the repo with any of the fields below.
  Once a day, GitHub rebuilds the list (data/repos.json) and the app shows up.

  Use this file when you want to change how an app looks without touching its repo,
  or to list something that isn't one of your repos. Anything set here wins.
  The order here is the order on the home page; apps found automatically go after these.
  ============================================================

  Fields (all optional except name and href):

    id          Short id. Defaults to the repo name in href ("/guide-match/" -> "guide-match").
    name        Title on the card.
    tagline     One short line under the title.
    description Two or three sentences. Plain language for students.
    href        Where Open goes. A repo with Pages on is "/<repo-name>/". Anything else: "https://...".
    kind        "App", "Game", or "Tool". Drives the filter buttons.
    tags        Short labels: classes, skills.
    status      "live", "beta" (works, still changing), or "soon" (not clickable yet).
    icon        book, clay, film, camera, pencil, palette, puzzle, sparkle, grid
    color       The app's color. Match the app's own design.
    note        Small print on the card, e.g. "Sign in required."
    hidden      true = no card anywhere. The app still works for anyone with the link.
    about       The teacher explainer at /teachers/<id>/ (see the examples below).
    help        The student help section at /help/#<id>.
*/

window.WC_APPS = [
  {
    name: "Narrative Studio",
    tagline: "Plan, build, and write your story in one place.",
    description:
      "A writing workspace for stories and screenplays. Build characters, locations, scenes, and your world, arrange an outline, then write in a story or screenplay editor.",
    href: "/narrative-studio-2/",
    kind: "App",
    tags: ["Writing", "Screenwriting"],
    status: "live",
    icon: "book",
    color: "#52B788",
    note: "Sign in required.",
    about: {
      summary:
        "Narrative Studio is where students build a story before they write it. Characters, locations, props, and world-building each get their own space, the outline and beat board turn that material into structure, and the Writing Desk is where the draft happens, in story or screenplay format.",
      students: [
        "Start a project from a template: feature film, short film, TV spec, pilot, or narrative story.",
        "Build character profiles (identity, appearance, voice, backstory, psychology, story role), locations, props, and world rules.",
        "Arrange the story on an outline and a beat board, then break it into scenes.",
        "Write the draft at the Writing Desk."
      ],
      classroom: [
        "Students join your class with a class code.",
        "You can open a student's project in a read-only view, comment on specific passages, and leave written feedback.",
        "Students can reply to your comments inside the app."
      ],
      details: {
        "Best for": "Screenwriting, creative writing, pre-production",
        "Sign-in": "Email and password. Students make their own account.",
        "Saves": "Automatically, to the student's account",
        "Devices": "Any modern browser. Chromebooks are fine."
      },
      todo: [
        "Screenshots of the Writing Desk and the beat board",
        "A sample lesson or assignment that uses it",
        "How a teacher gets a teacher account today (invite code from Tom)"
      ]
    },
    help: {
      steps: [
        "Go to walshclassroom.com and open Narrative Studio.",
        "First time? Choose Create Account and sign up with your email and a password. Next time, just Sign In.",
        "Join your class with the class code your teacher gives you.",
        "Start a new project and pick the template that matches your assignment.",
        "Build first, write second: add characters and locations, then outline, then open the Writing Desk."
      ],
      faq: [
        { q: "I forgot my password.", a: "Tell your teacher, who can help you get back in." },
        { q: "Did my work save?", a: "Yes. Narrative Studio saves to your account as you work. Sign in on any computer and your project is there." },
        { q: "Where do I see my teacher's comments?", a: "Open your project. Comments show up next to the passage they're about, and you can reply to them." }
      ]
    }
  },
  {
    name: "Guide Match",
    tagline: "Spot the composition guide in each photo.",
    description:
      "Drag the right composition guide onto five photos, line it up, then pick the clue that proves it. Three levels per photo.",
    href: "/guide-match/",
    kind: "Game",
    tags: ["Photography", "Composition"],
    status: "live",
    icon: "grid",
    color: "#FF7A3D",
    about: {
      summary:
        "Guide Match is a short game for practicing composition. Students see five photos and work through three levels on each one: name the composition guide, fit it to the photo, then explain why it's the right one.",
      students: [
        "Level 1, Match it: drag a guide onto the photo. One point for a right first try.",
        "Level 2, Fit it: move and resize the guide so it lines up. One bonus point.",
        "Level 3, Say why: pick the clue that proves it. One bonus point."
      ],
      classroom: [
        "No sign-in and nothing saved, so it works as a quick warm-up or exit ticket on any device.",
        "Level 3 is the one worth talking about: ask students to defend the clue they picked."
      ],
      details: {
        "Best for": "Photography, composition, visual literacy",
        "Sign-in": "None",
        "Saves": "Nothing is saved or sent anywhere",
        "Devices": "Any browser. Tap works as well as drag."
      },
      todo: [
        "Which composition guides are in the game",
        "How long a round usually takes in class",
        "A screenshot of a finished round"
      ]
    },
    help: {
      steps: [
        "Open Guide Match and press Start.",
        "Drag a guide onto the photo (or tap it).",
        "Move and resize it until it lines up with the photo.",
        "Pick the clue that proves your answer."
      ],
      faq: [
        { q: "Does my score save?", a: "No. Nothing in Guide Match is saved. If your teacher wants your score, screenshot the end screen." },
        { q: "Dragging doesn't work on my device.", a: "Tap the guide instead. It works the same way." }
      ]
    }
  },
  {
    // Live at walshclassroom.com/triton-alumni-portal/ but not shown anywhere on the hub.
    name: "Triton Alumni Portal",
    href: "/triton-alumni-portal/",
    kind: "App",
    hidden: true
  }

  /* Example of an upcoming app. Remove the slashes and stars around it to show it.
  ,{
    name: "Virtual Claymation Studio",
    tagline: "Pose clay characters and shoot stop-motion in your browser.",
    description: "Build a clay character, pose it frame by frame, light the set, and export an image sequence for Premiere.",
    href: "/virtual-claymation-studio/",
    kind: "App",
    tags: ["Videography", "Animation"],
    status: "soon",
    icon: "clay",
    color: "#0B5874"
  }
  */
];
