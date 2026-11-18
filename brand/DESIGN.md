# Walsh Classroom design decisions

Working record from the design pass (Nov 2026). The full brand guide (tokens, logo rules, components, voice) is the Walsh Classroom design system: https://claude.ai/artifact/5XgMEsDNj5RAhG1GU3Exor . When the two disagree, update both.

## Direction
Clean and modern with a little quirk. Committed color and hard contrast, with no pastels and no
"AI default" softness. The quirk comes from type, the mascot and copy, not from themed gimmicks.

## Type (changed Nov 18 2026, with Tom's new wordmark)
Young Serif is now the brand's lead face. Each family has one job:
- **Wordmark and headings:** **Young Serif** (400). Section and bin headings (`h2`), prose `h2`, app names on cards.
- **Titles:** **Unbounded** (800). The hero and page titles (`h1`), card initials, class codes. Short punchy lines only.
- **Subheadings and labels:** **Schibsted Grotesk** (700). Prose `h3`, bin blurbs, card taglines, and every uppercase label: eyebrows, badges, the category strip, table and form labels. Labels at .06 to .08em tracking.
- **Body:** **Atkinson Hyperlegible** (400/700). Everything students read.
Chosen from a side-by-side specimen (Atkinson Hyperlegible Next Bold was the runner-up): https://claude.ai/artifact/1kZie4GLhtHMupV7Lx7931

## Brand palette
Six colors, each standing for a part of how a media arts class works. Pick a color for something new by its meaning first. Deep values are for light mode; bright values are for fills under dark text and for dark mode. Cool colors lead; raspberry and rust are accents.

| Color | Deep | Bright | Stands for | Where |
|---|---|---|---|---|
| Ink and white | `#0B0B0C` | `#FFFFFF` | The blank page: where every project starts | Grounds, text, rules, the hero |
| Violet (primary) | `#4A35B5` | `#8F7EF2` | Imagination: the idea before anything is made | Logo square, links, focus ring, hero line, Studios |
| Green | `#0F6B52` | `#3DB487` | Growth: practice turning into skill | Classroom materials |
| Blue | `#0B5874` | `#3BA3C2` | Guidance: clear help, the teacher explaining | For teachers surfaces, Tools |
| Raspberry | `#A82E64` | `#E05A93` | Play: practice, the joke | Skill builders, Coming soon, the 404 beard |
| Rust | `#B34A26` | `#E5784F` | The workshop: work in progress, said honestly | Beta badges, small marks only |

Categories wear their meaning: Studios = Imagination, Skill builders = Play, Tools = Guidance, Classroom materials = Growth. Rust is the one still open (fits a projects or works-in-progress category). Don't invent a new color for a category.

## Color in use
| Role | Light | Dark | Use |
|---|---|---|---|
| Page | `#FFFFFF` | `#0E0E10` | True white / near-black, hard contrast |
| Section band | `#F0F0F2` | `#17171A` | Neutral, behind the app grid |
| Ink | `#0B0B0C` | `#F4F4F5` | Text, borders, solid buttons |
| Ink 2 | `#3A3A3E` | `#BDBDC4` | Supporting text |
| Brand colors | deep value | bright value | See the brand palette above. Violet deep hover: `#3B2A9E` |

App colors aren't brand colors. They match each app's own design: Narrative Studio `#52B788`, Guide Match `#FF7A3D`, Virtual Claymation Studio `#4A6FE3`, Premiere Podcast Editing `#3A7FC2` (lightened from `#2E75B6` for contrast). Light Lab `#F2A93B` (its key-light amber), Premiere Basics Missions `#C98A1E` (a deeper gold, so it doesn't read as Light Lab's amber). When an app color sits close to a brand color, keep that app out of the matching category's bin.

## Components
- **Hero:** ink (near-black) block, white Unbounded headline, second line in violet. A full-width category strip along the bottom: one block per category (Studios, Skill builders, Tools, Classroom materials) in the category color, each jumping to its bin on the page. Apps keep their own colors on their cards.
- **Wordmark lockup:** solid "WC" square joined to an outlined "Walsh Classroom" box.
- **Borders:** 1.5px solid ink. Square corners throughout; no pills, no hairlines.
- **App cards:** full app-color block on top with initials in Unbounded, a 1.5px ink rule under it, title in Young Serif, short description, category label, and a solid ink "Open" button.
- **Buttons and active filters:** solid ink blocks.
- **Category bins:** the app grid is grouped by category. Each bin has a 10px bar in the category color, a heading, and a one-line blurb. Category colors live in `WC_CATEGORIES` in apps.js: Studios #8F7EF2, Skill builders #E05A93, Tools #3BA3C2, Classroom materials #3DB487.
- **Status badges:** Beta / Coming soon. No standing "More on the way" tile.
- **Line icons:** kept.
- **Hover:** slight lift; none with reduced motion.
- **Theme:** follows the device, with a toggle that remembers the choice.

## Logo
- Primary (Nov 18 2026): **Tom's wordmark**. Lowercase "walshclassroom" in Young Serif, split across an outlined white field ("walsh" in color, with the beard pressed against the left border) and a solid color block ("classroom" in white). The overlap at the h/c seam is deliberate: each half grows out of the other. Files: `assets/logo/walshclassroom-wordmark-violet.svg` (the brand mark, in the site header), plus `-green`, `-rust`, `-raspberry`. Rebuilt from Tom's Canva file so the frame and block share one top and bottom edge; outline 3.75 units. Violet is primary for now; green is Tom's favorite and a possible future primary. Dark versions (`-dark.svg`, all four colors) follow the dark-theme rule: the left field is see-through, "walsh", the beard and the outline use the color's bright value, and "classroom" is near-black (#0B0B0C) on the bright block (white on the bright values would fall to about 3:1). The site header swaps between the two with the theme, including the site's own toggle.
- Previous lockup (violet beard square joined to the boxed "WALSH CLASSROOM" in Unbounded 800), kept for reference: `assets/logo/walsh-classroom-logo.svg`, `-dark`, `-solid`.
- Tile: `walsh-classroom-tile.svg` and `-dark` for avatars and app icons.
- Secondary: the beard mark, redrawn as one-color vector with the strands cut out: `beard-mark-ink.svg`, `-white`, `-violet`; `beard-mark-simple.svg` below 48px.
- Favicon: `favicon.svg`, the simple mark on a violet tile, switching for dark mode.

## Copy
- 404: "This scene didn't make the final cut," with the mascot.
- Headline and intro copy: still placeholder, to be drafted in Tom's voice.

## Site function
See PLATFORM.md for accounts, classes, the shared nav bar, explainers and the app list.
