---
name: Myat Thu, The Director's Cut
description: A resume shot as a feature film. Letterbox matte, bronze and ember grade, molten gold as the only light.
colors:
  black: "#0b0906"
  pitch: "#050403"
  umber: "#1a130d"
  bronze: "#b07a3c"
  gold: "#f2c572"
  ember: "#ff8a3d"
  bone: "#efe6d6"
  bone-dim: "#ddd3c3"
  ash: "#a8998a"
typography:
  display:
    fontFamily: "Cinzel, Trajan Pro, Times New Roman, serif"
    fontSize: "clamp(56px, 14.2vw, 250px)"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "0.035em"
  display-act:
    fontFamily: "Cinzel, Trajan Pro, Times New Roman, serif"
    fontSize: "clamp(64px, 13vw, 220px)"
    fontWeight: 700
    lineHeight: 0.88
    letterSpacing: "0.05em"
  headline:
    fontFamily: "Cinzel, Trajan Pro, Times New Roman, serif"
    fontSize: "clamp(40px, 7.4vw, 124px)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "0.01em"
  title:
    fontFamily: "Cinzel, Trajan Pro, Times New Roman, serif"
    fontSize: "clamp(30px, 3.6vw, 52px)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.02em"
  title-sm:
    fontFamily: "Cinzel, Trajan Pro, Times New Roman, serif"
    fontSize: "clamp(21px, 1.7vw, 25px)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0.02em"
  body-lede:
    fontFamily: "Barlow, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(18px, 1.55vw, 22px)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Barlow, Helvetica Neue, Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: "Barlow, Helvetica Neue, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.2em"
  label-button:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.16em"
  label-title-card:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(17px, 1.9vw, 26px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.52em"
rounded:
  none: "0"
  hairline: "2px"
  round: "50%"
spacing:
  gutter: "clamp(20px, 5vw, 72px)"
  matte: "52px"
  matte-mobile: "46px"
  control-height: "48px"
  act-tail: "clamp(80px, 12vw, 180px)"
components:
  button-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.black}"
    typography: "{typography.label-button}"
    rounded: "{rounded.none}"
    padding: "0 22px"
    height: "48px"
  button-gold-hover:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.black}"
  button-bronze:
    backgroundColor: "rgba(5, 4, 3, 0.55)"
    textColor: "{colors.bone}"
    typography: "{typography.label-button}"
    rounded: "{rounded.none}"
    padding: "0 22px"
    height: "48px"
  button-bronze-hover:
    backgroundColor: "{colors.bronze}"
    textColor: "{colors.black}"
  kit-tag:
    textColor: "{colors.bone}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "9px 14px"
  matte-bar:
    backgroundColor: "{colors.pitch}"
    textColor: "{colors.ash}"
    typography: "{typography.label}"
    height: "{spacing.matte}"
    padding: "0 clamp(20px, 5vw, 72px)"
  notice-plaque:
    backgroundColor: "{colors.umber}"
    textColor: "{colors.bone}"
    rounded: "{rounded.none}"
    padding: "8px"
    width: "min(680px, 100%)"
  notice-link:
    textColor: "{colors.gold}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "48px"
  notice-link-hover:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.black}"
---

# Design System: Myat Thu, The Director's Cut

## Overview

**Creative North Star: "The Director's Cut"**

The page is a film print, not a page. Everything plays inside a 2.39:1 letterbox: two pitch-black matte bars pinned top and bottom carry the navigation, the running act, a timecode and the first actions, and the picture between them is graded crushed black with molten gold as the single light source. Sections are acts. Each act opens on a full-viewport title card in carved Roman capitals, and every sequence rides one easing curve, the speed ramp: time slams in, hangs in slow motion, then whips out. A WebGL light field of god rays, smoke and embers runs behind the picture, and its clock follows the ramp, so the embers freeze whenever a title hangs.

Density is cinematic: one idea per frame, huge display type, long dark pauses, and reading text set large (19px body, 15px floor for every label) because the owner has flagged small type before. Materials are physical and warm: hammered bronze shields carry company marks, struck bronze coins carry certifications, photographs are pushed into a sepia, high-contrast bronze grade with a soft-light bronze wash and a vignette. Film grain sits over everything at 7.5% opacity. Nothing is rounded except metal, which is round.

Every module degrades. Without JavaScript, WebGL or motion the acts print as a plain readable document: beats become one quiet list, cards drop their full-viewport height, and the cold open and flare never appear.

**Key Characteristics:**
- A fixed letterbox matte (52px, 46px under 760px) that thickens to true 2.39:1 during title cards and relaxes to reading height between them.
- One light: gold and ember glow from above and below; there is no cool color anywhere.
- Carved Roman display capitals, condensed tracked credit labels, a plain humanist sans for reading.
- Square corners on every rectangle; circles only for struck or hammered metal.
- The speed ramp as the single motion grammar, with a reduced-motion path that removes it entirely.

## Colors

A monochrome warm grade: near-black umbers lit by a single bronze-to-gold light, with ember as the heat in the glow and no cool hue at all.

### Primary
- **Molten Gold** (gold): the only light source. Display names, act numerals, credit headings, the primary button, focus rings, text selection, the scrub progress line, active states and hover color for every text link. The most used token in the build by a wide margin.

### Secondary
- **Cast Bronze** (bronze): the metal. Hairline rules and borders (at 18% to 70% alpha on dark), slate dots, list tick marks, the title-card flanking rules, the soft-light wash over photographs, and the hover fill of the outline button.

### Tertiary
- **Ember** (ember): heat, never fill. Appears only as glow: the low sun at the foot of the page background (12%), the halo under gold display type (26% to 30%), the lens flare, the shield impact ring, and the molten forge blank. Never a text or surface color.

### Neutral
- **Crushed Black** (black): the page ground and the ink on gold and bronze fills.
- **Pitch** (pitch): the matte bars, the cold-open shutters, and at 55% to 97% alpha every dark scrim (button rest fill, scene-selection overlay, notice backdrop, photo vignettes).
- **Umber** (umber): the only raised surface: the notice plaque, and the placeholder behind photographs while they load.
- **Bone** (bone): primary text, headings that are not gold, and the matte's active links.
- **Dimmed Bone** (bone-dim): secondary reading text in lists, notes and the forge line, one step down from bone so the lead line of a block leads.
- **Ash** (ash): metadata and chrome: matte labels, slates, role meta, photo credits, certification summaries, inactive credit roll labels.

### Named Rules
**The One Light Rule.** Gold is the only light. Anything that glows, is selected, is focused or is hovered turns gold; ember may only appear as the glow around gold, never as its own fill or text.

**The Warm Grade Rule.** Every neutral is a warm umber. Pure grey, pure white text and any cool hue are outside the grade; the brightest text is bone.

**The Alpha Bronze Rule.** Bronze dividers are drawn as bronze at reduced alpha on black (about 0.18 for quiet row rules, 0.35 for section rules, 0.45 to 0.7 for control borders), not as separate grey tokens.

## Typography

**Display Font:** Cinzel (with Trajan Pro, Times New Roman, serif), self-hosted, weight 700 throughout.
**Body Font:** Barlow (with Helvetica Neue, Arial, sans-serif), 400, 400 italic, 600.
**Label/Mono Font:** Barlow Condensed (with Arial Narrow, sans-serif), 600, always uppercase and widely tracked.

**Character:** Carved Roman capitals for everything that is a title, credit-block condensed caps for everything that is a slate or credit, and a plain, open sans for anything the visitor actually reads. The display face announces; the body face never performs.

### Hierarchy
- **Display** (Cinzel 700, clamp(56px, 14.2vw, 250px), 0.9, 0.035em): the name on the opening title, set near full width in gold. One per page.
- **Display Act** (Cinzel 700, clamp(64px, 13vw, 220px), 0.88, 0.05em): act numerals on title cards, gold with ember halo. 18vw on phones.
- **Headline** (Cinzel 700, clamp(40px, 7.4vw, 124px), 1.02): trailer beats and the post-credits line, balanced, max 16ch.
- **Title** (Cinzel 700, clamp(30px, 3.6vw, 52px), 1.05, 0.02em): role titles, scene headings, the notice title. Credits heading and section heads in the training act use the same face at their own clamps.
- **Title Small** (Cinzel 700, clamp(21px, 1.7vw, 25px), 1.25): certification names under coins.
- **Body Lede** (Barlow 400, clamp(18px, 1.55vw, 22px), 1.5): loglines and act ledes, centered, 44 to 52ch.
- **Body** (Barlow 400, 19px, 1.65; 18px under 760px): default reading text, 60ch max. Italic is reserved for scene context lines and photo credits.
- **Body Small** (Barlow 400, 18px, 1.5): list points and note definitions in dimmed bone. 17px is the lowest reading size in the build.
- **Label** (Barlow Condensed 600, 15px, 1, 0.2em, uppercase): matte, slates, meta rows, note terms, credit roll terms. Tracking flexes from 0.12em (tags) to 0.3em (cast credit) by role; size never drops below 15px.
- **Label Title Card** (Barlow Condensed 600, clamp(17px, 1.9vw, 26px), 0.52em, uppercase): the act name under the numeral, flanked by bronze rules; 0.32em on phones.

### Named Rules
**The Three Voices Rule.** Cinzel titles, Barlow Condensed credits, Barlow reads. A face never borrows another's job: no condensed body copy, no Cinzel labels, no tracked caps in paragraphs.

**The Fifteen Floor Rule.** No HTML label, caption or chrome text is set below 15px, and no reading text below 17px.

**The Wide-Track Balance Rule.** Any label tracked at 0.3em or more is padded on the left by its own tracking value so the block centers optically.

## Layout

The viewport is the frame. Two fixed matte bars (`--mt` / `--mb`, 52px, 46px under 760px) sit at z-index 60 and every full-height section pads itself by the matte height plus its own air, so content never slides under the bars. During title cards the script widens the mattes toward a true 2.39:1 frame (capped at 16% of viewport height each) and eases them back with expo.out.

Horizontal rhythm comes from one gutter, clamp(20px, 5vw, 72px), used for every section's side padding and for the matte. Acts are a stack of full-viewport (100svh) moments: opening title, trailer beats, five act title cards each followed by content, end credits, post-credits. Each act closes with clamp(80px, 12vw, 180px) of dark air.

Content widths are capped per act rather than globally: 1240px for the lead, 1180px for the record and the vault, 1280px for field reports, 1120px for training, 760px for the credit roll, 680px for the notice. Two-column compositions use fractional minmax grids (0.85fr / 1fr lead, 1.25fr / 0.9fr scenes, a clamp(150px, 16vw, 210px) shield column for roles) and alternate sides scene by scene.

Breakpoints: 980px collapses the lead and scenes to one column and the vault to two; 760px shrinks the matte, hides the running act label and scrubber, stacks roles, notes and credits, and centers everything; 420px tightens the vault and buttons.

## Elevation & Depth

Depth is light, not layers. The page has one flat ground lit by radial gradients (gold from above, ember from below) and a WebGL light field; elements separate from it by glow and by deep, soft, downward drop shadows as if lit from above. There is no mid-level card elevation system: things are either on the ground, or they are heavy objects (photographs, shields, coins, the notice plaque) casting long soft shadows.

### Shadow Vocabulary
- **Gold halo** (`text-shadow: 0 22px 70px rgba(255, 138, 61, 0.3)`): under gold display type only (name, act numerals, post-credits line), 0.26 to 0.3 alpha.
- **Print drop** (`box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.8)`): under framed photographs (portrait and scene shots).
- **Metal drop** (`filter: drop-shadow(0 22px 26px rgba(0, 0, 0, 0.85))`): under shields and coins, following the alpha of the rendered metal; deepens to 0 30px 34px on hover.
- **Plaque drop** (`box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.9)`): the certification notice, the highest object.
- **Matte seam** (`box-shadow: 0 1px 0 rgba(176, 122, 60, 0.18)`): a one-pixel bronze seam where each matte bar meets the picture.

### Named Rules
**The Lit From Above Rule.** Every shadow falls downward and is soft and long. Light comes from the top of the frame (god rays, the gold radial, the highlight on the portrait), so no shadow is cast sideways or upward.

**The Grain On Top Rule.** Film grain (7.5% opacity, warm fractal noise, stepping at 0.9s only on fine pointers with motion allowed) sits above the picture and below the cold open. It is never louder than the image.

## Shapes

Rectangles are square: buttons, tags, frames, the notice plaque and every border have zero radius. The only small radius is a 2px softening on focus outlines and school logo tiles. Circles are reserved for metal and light: shield bosses, coins, the forge blank, slate dots and meta bullets (4px to 5px bronze dots). Lines are hairlines: 1px bronze rules, 1.5px list ticks and hamburger strokes, and a 1px gold-to-transparent cue line. Frames take film proportions: 2.39:1 for scene shots, 4:5 for the portrait. The scene-selection overlay opens as a horizontal iris (clip-path from a center slit to full frame), matching the letterbox.

## Components

### Buttons
Tactile, squared, credit-block caps.
- **Shape:** square corners (0), 48px minimum height, 0 22px padding (0 16px under 420px), 18px stroked SVG icon leading with a 10px gap.
- **Gold (primary):** gold fill, black ink. One per action row, always the email action. Hover lifts to bone fill.
- **Bronze outline:** 70% bronze hairline on a 55% pitch scrim, bone text. Hover fills solid bronze with black ink. LinkedIn and Download CV.
- **Hover / Focus:** 0.25s color and border transition on the out curve; active nudges down 1px; focus is the global 2px gold outline at 4px offset.
- **Notice link:** a bronze-bordered gold-text variant inside the notice, filling gold with black ink on hover.

### Chips
- **Kit tags:** 45% bronze hairline border, no fill, 9px 14px padding, label type at 0.12em in bone. Static, not interactive.

### Cards / Containers
- **Notice plaque:** umber surface, 1px solid bronze outer border, 8px mat, then an inner 35% bronze border with clamp(24px, 4vw, 44px) padding: a framed double-rule plaque. Rises 18px and scales from 0.97 on open (0.45s out curve). Close is a 44px square bronze-outline button that fills gold on hover.
- **Use rows:** inside the notice, 30% bronze hairline boxes on a 35% pitch scrim, 14px 16px padding.
- There are no generic content cards; content sits on the ground separated by bronze rules.

### Navigation
- **Matte bars:** top bar carries the Cinzel wordmark (16px, 0.16em), the running act name in gold (swapping with a 0.25s fade), and the Scenes menu button; bottom bar carries a tabular timecode, a 1px scrubber filling gold with scroll, and the email and LinkedIn actions. Links are bone, hovering gold. Under 760px the act label, scrubber and link text hide, leaving icons.
- **Scene selection:** a 97% pitch full-screen overlay that irises open from the horizon. Rows pair a gold Cinzel act numeral with a bone credit-caps title, separated by 30% bronze rules; the title turns gold on hover or focus.

### Title Card (signature)
A full-viewport act opener: gold Cinzel numeral over a bone credit-caps act name flanked by bronze rules. With motion it slams in from blur and scale, hangs while scaling 7% in slow motion, then whips out sideways with a stretch and blur. With reduced motion it is a static heading with generous top padding.

### Shield (signature)
A rendered hammered-bronze plate (assets/material/shield.webp) with a cream enamel boss inside a double bronze ring carrying the company logo. It links to the company site. It locks into its column with a small shake and an expanding gold impact ring; hover tilts it -4deg and lifts 4px.

### Coin (signature)
A struck bronze coin (assets/material/coin.webp) as an SVG with the certification name set around the rim on a text path and the code struck in Cinzel at the center. It is a button that opens the notice. Hover and focus tilt it in 3D (rotateX 10deg, rotateY -14deg); a specular glint sweeps across it once on entry.

### Aspis (signature)
A real-time 3D bronze hoplite shield (aspis.js, Three.js r186) on a fixed canvas between the light field and the page. Procedural geometry only: a lathe-turned dome and rolled rim, a polished groove ring, forty rivets, and an MT monogram extruded in molten gold and bent onto the curve of the dome. The bronze is hammered (a tiled dent bump map) and lit like the grade: a warm studio environment with one gold softbox overhead and a dim front bounce, a warm key from the upper left, an ember rim light from behind. A billboarded sun sits behind the shield, and god rays are its quarter-resolution occlusion smeared toward the light and added back, never painted. The cold open raises the shield out of the dark on the speed ramp; the scroll then holds on five tableaux (the title, high behind the name; a looming low angle; raking light on the hammer marks; the eclipse, face crushed to silhouette with a corona; the hero from above) with a cubic ease that hangs on each frame and whips between them, then fades out after the last beat. Portrait screens shrink the shield and its sun together so every composition holds. Beat slams jolt the camera. Reduced motion, no WebGL2 and Save-Data get assets/aspis.webp, the rendered poster frame, held behind the name.

### Dailies (signature)
Act IV lays three real app screens on a strip of 35mm dailies: a pitch strip tilted -3deg, backlit gold sprocket holes along both edges, edge print in ash credit caps, and portrait frames held in a 40% bronze hairline with a light warm grade (UI captures are lightly graded, never pushed to the photograph grade, so the product stays legible). The reel and the sprocket rows run with the scroll on the speed ramp, hanging while the strip is centered. Without the script the frames scroll sideways with snap; under reduced motion the strip lies flat. A one-sheet follows: the title in gold Cinzel that slams in once, a tracked tagline, a logline and outline buttons, beside a notes list.

### Framed Shot
Photographs are graded, never raw: sepia and contrast filter, a bronze soft-light wash at 42%, a gold top light and a pitch vignette. Every stock image carries an italic ash photo credit beneath its script.

### Slates and Credits
Small ash credit-caps lines that name a frame: the opening slate in the top-left corner of the title frame, shot slates under photographs (scene number in gold, subject in ash), the cast credit under the portrait, and the end-credit roll (ash terms right-aligned against bone values). They label frames from the corner or from below; none is stacked as a heading prefix.

## Do's and Don'ts

### Do:
- **Do** keep gold (#f2c572) as the only lit color: hover, focus, selection, active and progress all resolve to gold.
- **Do** set every title in Cinzel 700 and every label in Barlow Condensed 600 uppercase at 15px or larger with 0.12em to 0.3em tracking.
- **Do** keep reading text in Barlow at 17px or larger, bone for lead lines and dimmed bone for supporting lines.
- **Do** keep rectangles square and reserve circles for metal, light and slate dots.
- **Do** grade every photograph (sepia and contrast filter, 42% bronze soft-light, vignette) and frame scene shots at 2.39:1.
- **Do** route every timed sequence through the speed ramp and give each a reduced-motion path that shows the final state with no movement.
- **Do** pad every full-height section by the matte height so nothing plays under the bars.

### Don't:
- **Don't** introduce a cool hue, a pure grey or pure white text; the grade is warm umber to bone.
- **Don't** use ember (#ff8a3d) as a fill or text color; it exists only as glow.
- **Don't** round buttons, tags, frames or plaques.
- **Don't** add mid-level card elevation or sideways shadows; objects are either on the ground or heavy and lit from above.
- **Don't** stack a small tracked label above a heading as a prefix; slates label frames from a corner or from below.
- **Don't** use em dashes in any copy.
