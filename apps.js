/*
  ============================================================
  THE APP LIST. This is the only file you need to edit to add,
  remove, or update a tile on walshclassroom.com.
  ============================================================

  Each app is one { ... } block. Fields:

    name        Title on the tile.
    tagline     One short line under the title.
    description Two or three sentences. Plain language for students.
    href        Where the tile goes. For any of your GitHub repos with Pages
                turned on, that's "/<repo-name>/" (e.g. "/narrative-studio-2/").
                Anything else: a full link ("https://...").
    kind        "App", "Game", or "Tool". Drives the filter buttons.
    tags        Short labels: class names, skills, etc.
    status      "live", "beta" (works, still changing), or "soon" (not clickable yet).
    icon        One of: book, clay, film, camera, pencil, palette, puzzle, sparkle, grid
    color       Tile accent color.
    note        Optional small print, e.g. browser requirements.
    hidden      Optional. true = no tile on the home page. The app still works
                at its address for anyone who has the link.

  To add a new app: turn on Pages in that app's repo (Settings > Pages),
  copy a block below, change the fields, then run publish-site.bat.
*/

window.WC_APPS = [
  {
    name: "Narrative Studio",
    tagline: "Plan, build, and write your story in one place.",
    description:
      "A writing workspace for stories and screenplays. Build characters, locations, scenes, and your world, arrange an outline, then write in a story or screenplay editor.",
    href: "/narrative-studio-2/",
    kind: "App",
    tags: ["Writing", "Screenwriting", "Storytelling"],
    status: "live",
    icon: "book",
    color: "#2d6a4f",
    note: "Sign in required."
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
    color: "#ca8a04"
  },
  {
    // Live at walshclassroom.com/triton-alumni-portal/ but not shown on the home page.
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
    color: "#0f766e"
  }
  */
];
