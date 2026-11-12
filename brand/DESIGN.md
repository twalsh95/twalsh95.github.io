# Walsh Classroom design decisions

Working record from the design pass (Nov 2026). The full brand guide (tokens, logo rules, components, voice) is the Walsh Classroom design system: https://claude.ai/artifact/5XgMEsDNj5RAhG1GU3Exor . When the two disagree, update both.

## Direction
Clean and modern with a little quirk. Committed color and hard contrast, with no pastels and no
"AI default" softness. The quirk comes from type, the mascot and copy, not from themed gimmicks.

## Type
- Headings and wordmark: **Unbounded** (700/800)
- Accents (card titles, small flourishes): **Young Serif**
- Body: **Atkinson Hyperlegible**

## Color
| Role | Light | Dark | Use |
|---|---|---|---|
| Page | `#FFFFFF` | `#0E0E10` | True white / near-black, hard contrast |
| Section band | `#F0F0F2` | `#17171A` | Neutral, behind the app grid |
| Ink | `#0B0B0C` | `#F4F4F5` | Text, borders, solid buttons |
| Ink 2 | `#3A3A3E` | `#BDBDC4` | Supporting text |
| Violet (primary) | `#4A35B5` / deep `#3B2A9E` | `#8F7EF2` | Brand, hero accent line, links |
| Green (secondary) | `#0F6B52` | `#3DB487` | Tags, active states |
| Blue (accent) | `#0B5874` | `#3BA3C2` | Explainers, info |
| Raspberry (accent) | `#A82E64` | `#E05A93` | Whimsy moments (404, mascot) |
| Rust (accent) | `#B34A26` | `#E5784F` | Small badges only |

App colors match each app's own design: Narrative Studio `#52B788`, Guide Match `#FF7A3D`.

## Components
- **Hero:** ink (near-black) block, white Unbounded headline, second line in violet. A full-width category strip along the bottom: one block per category (Studios, Games, Tools) in the category color, each jumping to its bin on the page. Apps keep their own colors on their cards.
- **Wordmark lockup:** solid "WC" square joined to an outlined "Walsh Classroom" box.
- **Borders:** 1.5px solid ink. Square corners throughout; no pills, no hairlines.
- **App cards:** full app-color block on top with initials in Unbounded, a 1.5px ink rule under it, title in Young Serif, short description, category label, and a solid ink "Open" button.
- **Buttons and active filters:** solid ink blocks.
- **Category bins:** the app grid is grouped by category. Each bin has a 10px bar in the category color, a heading, and a one-line blurb. Category colors live in `WC_CATEGORIES` in apps.js: Studios #8F7EF2, Games #E05A93, Tools #3BA3C2.
- **Status badges:** Beta / Coming soon. No standing "More on the way" tile.
- **Line icons:** kept.
- **Hover:** slight lift; none with reduced motion.
- **Theme:** follows the device, with a toggle that remembers the choice.

## Logo
- Primary: the lockup (violet beard square joined to the boxed "WALSH CLASSROOM" in Unbounded 800), outlined: `assets/logo/walsh-classroom-logo.svg`, `-dark`, `-solid`.
- Tile: `walsh-classroom-tile.svg` and `-dark` for avatars and app icons.
- Secondary: the beard mark, redrawn as one-color vector with the strands cut out: `beard-mark-ink.svg`, `-white`, `-violet`; `beard-mark-simple.svg` below 48px.
- Favicon: `favicon.svg`, the simple mark on a violet tile, switching for dark mode.

## Copy
- 404: "This scene didn't make the final cut," with the mascot.
- Headline and intro copy: still placeholder, to be drafted in Tom's voice.

## Site function
See PLATFORM.md for accounts, classes, the shared nav bar, explainers and the app list.
