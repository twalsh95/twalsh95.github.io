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
    kind        Which bin the app goes in: "Studio", "Game", "Tool", or "Material" (see WC_CATEGORIES at the bottom).
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
    kind: "Studio",
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
        "Guides": "Rule of Thirds, Leading lines, Framing, Symmetry",
        "Sign-in": "None",
        "Saves": "Nothing is saved or sent anywhere",
        "Devices": "Any browser. Tap works as well as drag."
      },
      todo: [
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
    name: "Virtual Claymation Studio",
    tagline: "Pose clay characters and shoot stop-motion in your browser.",
    description:
      "Pose a clay puppet one small move at a time, frame the shot with a real camera, capture each frame, and play it back. Onion skin shows where the last frame was.",
    href: "/virtual-claymation-studio/",
    kind: "Studio",
    tags: ["Videography", "Animation"],
    status: "beta",
    icon: "clay",
    color: "#4A6FE3",
    note: "Early test build. Large download: give it a moment to load the first time.",
    about: {
      summary:
        "Virtual Claymation Studio is a 3D stop-motion studio that runs in the browser. It replaces the logistics of a real-clay unit (lost clay, lost frames, camera mix-ups, inconsistent lighting) so class time goes to the skills that carry into video: frames, timing, framing, and telling a story in images. I'm building it for the opening unit of my Videography course.",
      students: [
        "Pose a clay puppet with Bend, Twist, Move, Lift, and Squash, in small increments.",
        "Frame the shot through a locked shot camera, using real camera moves: pan and tilt, truck and pedestal, dolly, and zoom with a lens readout.",
        "Capture a frame, adjust the pose, capture again. Onion skin shows the last one or three frames as ghosts.",
        "Play the sequence back at a chosen frame rate, then export the frames for editing in Premiere."
      ],
      classroom: [
        "The planned unit runs about 15 class days: tutorial levels, pre-production, a final project, and a screening with critique.",
        "Tutorial levels pair a stop-motion skill with a video skill (frame rate, timing, shot sizes, lighting, cutting), and hand more of the story to the student as they go.",
        "The final project brief is simple: there needs to be a character, and something needs to happen to that character."
      ],
      details: {
        "Best for": "Videography, animation, intro to video",
        "Sign-in": "None yet. Accounts and cloud saves are planned.",
        "Status": "Early test build. Tutorial levels are in development.",
        "Devices": "A laptop with a mouse and keyboard. Chromebooks may need the site allowed by IT."
      },
      todo: [
        "Screenshots of posing and the shot camera",
        "The tutorial levels, once they're built",
        "Unit materials: vocabulary, rubric, and standards"
      ]
    },
    help: {
      steps: [
        "Open Virtual Claymation Studio and wait for it to load. The first load takes the longest.",
        "Pick a tool (Bend, Twist, Move, Lift, or Squash), then click a part of the puppet and drag to pose it.",
        "Switch to Camera View to see exactly what the shot camera will capture.",
        "Press Capture Frame (or the space bar) to save a frame, make a small change, and capture again.",
        "Press Play to watch your animation."
      ],
      faq: [
        { q: "It's stuck loading.", a: "The studio is a big download. Give it up to a minute on school wifi. If it still won't load, refresh the page." },
        { q: "My puppet jumps between frames.", a: "Make smaller changes between captures, and turn on onion skin so you can see where the last frame was." },
        { q: "I captured a frame by mistake.", a: "Use Delete Last Frame. Undo only works on posing, not on captured frames." },
        { q: "Does my project save?", a: "This is an early test version. Use Save Project before you leave, and ask your teacher where to keep the file." }
      ]
    }
  },
  {
    // The page is premiere_cheatsheet.html, not index.html, so href points at the file.
    id: "premiere-cheat-sheet",
    name: "Premiere Podcast Editing",
    tagline: "Sync your cameras and audio, step by step.",
    description:
      "A two-page cheat sheet for the podcast final project: start a Premiere project, import your folder, mark the clap, then sync every camera to the audio.",
    href: "/premiere-cheat-sheet/premiere_cheatsheet.html",
    kind: "Material",
    tags: ["Podcasting", "Premiere Pro"],
    status: "live",
    icon: "film",
    color: "#3A7FC2"
  },
  {
    // Live at walshclassroom.com/triton-alumni-portal/ but not shown anywhere on the hub.
    name: "Triton Alumni Portal",
    href: "/triton-alumni-portal/",
    kind: "App",
    hidden: true
  }

];

/*
  THE CATEGORIES (the bins on the home page, and the color strip in the hero).
  Each app's "kind" picks its bin. Bins show in this order, and only when they have an app in them.
  The colors here are the category's color. Each app keeps its own color on its card.
*/
window.WC_CATEGORIES = [
  { kind: "Studio", label: "Studios", color: "#8F7EF2", blurb: "Make something from start to finish." },
  { kind: "Game",   label: "Games",   color: "#E05A93", blurb: "Practice one skill, fast." },
  { kind: "Tool",   label: "Tools",   color: "#3BA3C2", blurb: "Quick help with one job." },
  { kind: "Material", label: "Classroom materials", color: "#3DB487", blurb: "Handouts and references to keep open while you work." }
];
