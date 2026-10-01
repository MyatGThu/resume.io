---
name: Myat Thu, Going Under
description: A resume as a Nolan descent. Graphite with no blue, bone white type in one variable face, warmth only from practical sodium light, Tenet red only inside the inversion.
colors:
  void: "#0b0b0c"
  pitch: "#050505"
  graphite: "#171717"
  ash: "#9b9993"
  stone: "#cfccc6"
  bone: "#ecebe7"
  sodium: "#f0a43a"
  forward: "#e5533d"
  plate: "#e4e2dc"
  paper: "#f5f4f0"
  ink: "#161616"
  rule: "#c9c7c1"
  print-ash: "#5f5d58"
  print-label: "#3a3936"
typography:
  display:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(42px, 8.4vw, 148px)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "0.2em"
    fontVariation: "'wdth' 125"
  display-card:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(38px, 7.6vw, 136px)"
    fontWeight: 200
    lineHeight: 1
    letterSpacing: "0.16em"
    fontVariation: "'wdth' 125"
  beat:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(36px, 6.2vw, 104px)"
    fontWeight: 300
    lineHeight: 1.06
    letterSpacing: "0.02em"
    fontVariation: "'wdth' 112"
  headline:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(28px, 3.4vw, 50px)"
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: "0.12em"
    fontVariation: "'wdth' 125"
  title:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(30px, 3.2vw, 46px)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 112"
  title-plain:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(24px, 2.3vw, 32px)"
    fontWeight: 600
    lineHeight: 1.15
    fontVariation: "'wdth' 100"
  body-lead:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(21px, 1.9vw, 26px)"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.65
    fontFeature: "'tnum' 1"
    fontVariation: "'wdth' 100"
  label:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.18em"
    fontVariation: "'wdth' 75"
  label-card:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(15px, 1.3vw, 18px)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.3em"
    fontVariation: "'wdth' 75"
rounded:
  none: "0px"
spacing:
  matte: "48px"
  gutter: "clamp(20px, 5vw, 72px)"
  room-max: "1240px"
  room-gap: "clamp(110px, 14vw, 200px)"
  level-tail: "clamp(90px, 12vw, 180px)"
  control-height: "48px"
components:
  button-key:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.void}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 22px"
    height: "48px"
  button-key-hover:
    backgroundColor: "{colors.sodium}"
    textColor: "{colors.void}"
  button-ghost:
    backgroundColor: "rgba(5, 5, 5, 0.5)"
    textColor: "{colors.bone}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 22px"
    height: "48px"
  button-ghost-hover:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.void}"
  matte-bar:
    backgroundColor: "{colors.pitch}"
    textColor: "{colors.ash}"
    typography: "{typography.label}"
    height: "48px"
    padding: "0 clamp(20px, 5vw, 72px)"
  kit-tag:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "9px 14px"
  logo-plate:
    backgroundColor: "{colors.plate}"
    rounded: "{rounded.none}"
    padding: "14%"
  notice-card:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.bone}"
    rounded: "{rounded.none}"
    padding: "clamp(26px, 4vw, 46px)"
    width: "min(680px, 100%)"
---

# Design System: Myat Thu, Going Under

## Overview

**Creative North Star: "Going Under"**

Scrolling is a descent. The page starts in reality at a table under one lamp, goes under through a short trailer of beats, and walks four dream levels (The City, The Hotel, The Inversion, Limbo) before the kick returns it to reality with the top still spinning. Every level shares one graphite world and one variable face; what changes per level is the light field behind the page, the speed of time on the matte clock, and the way content enters. The visual system is the camera and the grade, not the set dressing.

The world is graphite with no blue. Near-black ground, concrete greys, bone white type. The only warmth is practical light, a sodium amber lamp, used for focus, hover and the lamp itself. Tenet red marks forward time and lives only inside the inversion. Typography is Archivo alone, stretched wide and thin for title cards, condensed for the chrome that frames the film, and set at normal width for reading. Density is low and type is large: body copy is 19px and no reading text drops below 15px.

Framing is the signature. A 35mm matte sits at the top and bottom of the viewport, carrying the name, the current level, the dream clock and contact. On every level card the bars retract and the card fills the frame like an IMAX shot, then the bars return. A live, machined steel spinning top (Three.js) opens and closes the film.

**Key Characteristics:**
- Graphite and bone, no blue anywhere, warmth only from practical light.
- One variable face (Archivo) at three widths: 125% for title cards, 75% for chrome, 100% for reading.
- Square corners throughout; hairline bone rules at low alpha do the dividing.
- A fixed 35mm matte that retracts to full frame on level cards.
- A WebGL light field behind the page, one world per level, stilled under reduced motion.
- Evidence imagery graded to monochrome; colour returns only on interaction.

## Colors

A near-neutral graphite ramp with a faint warm cast, one practical-light amber, and one time-coded red.

### Primary
- **Bone White** (bone): All primary type, the key button fill, the depth bar, matte highlights and selection background. It is the light the page reads by.

### Secondary
- **Sodium Lamp** (sodium): Practical light only. Focus outlines (2px, 4px offset), hover on the key button, matte links, menu button and level list entries, the caret, and the radial lamp glow on the body without WebGL. Also the amber in the shader (lamp cone, city street light, hotel sconces, limbo fire).

### Tertiary
- **Forward Red** (forward): Tenet red. The matte clock when time runs backwards, the Poker Money tagline, and the inversion's card descriptor. Never outside the inversion.

### Neutral
- **Void** (void): The ground. Page background, theme colour, button text on bone.
- **Pitch** (pitch): Matte bars, the cold open, the dailies strip, scrims (levels menu at 0.97, notice backdrop at 0.86) and the end cut to black.
- **Graphite** (graphite): The only raised surface. Notice card, portrait and shot frames before the image loads.
- **Ash** (ash): Metadata and chrome: slates, credits labels, dates, the clock rate, photo credits. 6.9:1 on void.
- **Stone** (stone): Supporting reading text: loglines, story paragraphs, notes, role points.
- **Logo Plate** (plate): The pale card behind company and school logos so their marks read on the dark; lightens to #f3f2ee on hover.
- **Paper, Ink, Rule, Print Ash, Print Label** (paper, ink, rule, print-ash, print-label): The printed CV only. Pale paper in graphite ink under a pitch title band; rules at rule, dates at print-ash, organisations at print-label.

### Named Rules
**The No Blue Rule.** Nothing in the world carries a blue hue: not the greys, not the shader, not the photographs. Greys sit at a faint warm cast (hue near 90 in OKLCH, chroma under 0.01).

**The Practical Light Rule.** Sodium is light, not paint. It appears where something is lit or answered (focus, hover, the lamp), and never as a section fill, border colour or text colour at rest.

**The Forward Time Rule.** Forward red appears only inside the inversion. Outside it, emphasis is bone against stone or ash.

## Typography

**Display Font:** Archivo variable (weight 100 to 900, width 62% to 125%), with Helvetica Neue and Arial
**Body Font:** Archivo at 100% width
**Label/Mono Font:** Archivo at 75% width, uppercase

**Character:** One family plays every role by changing width. Wide thin capitals read as title cards; condensed tracked capitals read as edge code and slates; plain width reads as the record.

### Hierarchy
- **Display** (300, clamp(42px, 8.4vw, 148px), 1, width 125%, tracking 0.2em): The name in reality, uppercase.
- **Display Card** (200, clamp(38px, 7.6vw, 136px), 1, width 125%, tracking 0.16em): Level card titles. The end line uses the same voice at clamp(36px, 6.4vw, 112px).
- **Beat** (300, clamp(36px, 6.2vw, 104px), 1.06, width 112%): The trailer beats, one fact held at a time, max 18ch.
- **Headline** (300, clamp(28px, 3.4vw, 50px), 1.05, width 125%, tracking 0.12em, uppercase): Room headings, followed by a hairline that runs to the edge.
- **Title** (400, clamp(30px, 3.2vw, 46px), 1.08, width 112%): Field report headings, notice titles, training headings.
- **Title Plain** (600, clamp(24px, 2.3vw, 32px), 1.15, width 100%): Role titles and certificate names.
- **Body Lead** (400, clamp(21px, 1.9vw, 26px), 1.45): The first paragraph of the lead story and the logline band (18px to 22px).
- **Body** (400, 19px, 1.65; 18px under 760px): Reading text, 44ch to 60ch measure, tabular figures throughout.
- **Label** (600, 15px, width 75%, tracking 0.18em, uppercase): All chrome: matte, buttons, slates, notes terms, credits labels, kit tags, certificate codes.
- **Label Card** (600, clamp(15px, 1.3vw, 18px), width 75%, tracking 0.3em, uppercase): The single descriptor line beneath a level card title.

### Named Rules
**The One Face Rule.** Archivo is the only family, on the site and in the printed CV. Hierarchy comes from width and weight, never from a second face.

**The Optical Centre Rule.** Centred, widely tracked capitals carry a negative right margin (or matching left padding) equal to their letter-spacing so the trailing track does not push them off centre.

**The Fifteen Pixel Floor.** No text on screen is smaller than 15px. The owner flagged small type; labels gain tracking, not shrinkage.

## Layout

The page is a vertical film. Full-viewport frames (100svh) carry the title, the trailer, each level card, the credits and the kick; between cards, rooms hold the record at a max width of 1240px with a fluid side gutter of clamp(20px, 5vw, 72px). The fixed matte reserves 48px top and bottom (46px under 760px), and full-frame sections pad by the matte height so nothing sits under the bars.

Rooms follow each other at clamp(110px, 14vw, 200px); a level ends with clamp(90px, 12vw, 180px) of dark before the next card. Within rooms, content sits on two-column grids (lead 0.8fr / 1fr, scene 1.25fr / 0.9fr alternating sides, sheet 0.95fr / 1fr, training 1fr / 1fr, roles 150px to 200px plate column) with gaps scaled by clamp. Certificates sit four across, two under 980px. Definition lists (notes, credits roll) pair a narrow condensed term column with a reading column and stack under 760px.

Breakpoints: 980px collapses the two-column rooms; 760px shrinks the matte, hides the level label, depth bar and scroll cue, and tightens title tracking; 420px tightens buttons and certificates; portrait aspect (at most 1/1) moves the spinning top's still frame below the name.

## Elevation & Depth

Depth is light, not lift. The page is flat bone type on void, with depth supplied by the WebGL light field behind it, a fine animated grain (6% opacity) above it, and scrims of pitch. Shadows are long, soft and dark, used only on photographic frames and the one raised notice, as if objects hang in a dark room under an overhead lamp.

### Shadow Vocabulary
- **Frame hang** (`box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.85)`): Portrait and field report frames (the shot uses -24px spread).
- **Strip hang** (`box-shadow: 0 40px 90px -30px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(236, 235, 231, 0.08)`): The tilted dailies strip.
- **Notice lift** (`box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.9)`): The certificate notice over its pitch scrim.
- **Totem cast** (`filter: drop-shadow(0 26px 24px rgba(0, 0, 0, 0.8))`): Totem objects, which are cut-out rasters.

### Named Rules
**The Graphite Only Rule.** Graphite is the only raised surface colour. Anything that floats above the page is graphite with a bone hairline at 0.16 alpha; nothing is lighter than graphite except a logo plate.

**The Field Behind Rule.** The light field is ambience, never content. It sits at z-index 0 behind everything, is pointer-transparent, and freezes to a single frame under reduced motion.

## Shapes

Every corner is square (0px): buttons, tags, frames, plates, notices, matte. Dividers are 1px bone hairlines at low alpha (0.08 on the matte, 0.1 to 0.14 between rows, 0.18 under headings, 0.26 on tags, 0.42 on ghost buttons). Images are cropped to film formats: 2.39:1 for field reports, 4:5 for the portrait, 3:2 for logo plates, phone-height frames on the dailies strip. Icons are 18px line drawings with square caps and mitred joins at 1.5px stroke, drawn in currentColor. The printed CV's round bullet dots are its one curve.

## Components

### Buttons
Blunt and lit from inside.
- **Shape:** Square (0px), 48px tall, 22px side padding, 10px icon gap, condensed label voice.
- **Key:** Bone fill with void text; one per frame, always the email action. Hover turns it sodium.
- **Ghost:** Half-pitch fill with a bone hairline at 0.42; hover floods it bone with void text. Active nudges 1px down.
- **Verify link:** Inside the notice, a full bone outline ghost that floods bone on hover.
- **Focus:** Sodium outline, 2px, 4px offset, on every control.

### Chips
- **Kit tags:** Transparent with a bone hairline at 0.26, 9px by 14px, label voice at 0.12em tracking. Static, not interactive.

### Cards / Containers
- **Level card:** A full-viewport frame with a raster plate at 0.9 opacity under a void gradient scrim, the title in Display Card and one Label Card descriptor below. City, Hotel and Inversion carry plates; Limbo is currently drawn by the shader alone, its plate (assets/levels/limbo.webp) pending.
- **Notice (certificate):** Graphite, bone hairline at 0.16, Notice lift shadow, max 680px, rises 16px in 0.4s. Close control is a 44px square outline. Usage entries inside are half-pitch panels with a 0.14 hairline.
- **Logo plate:** Pale plate behind a grayscale logo; hover lightens the plate and returns the logo to colour. Each opens the company site.

### Navigation
- **Matte:** Fixed pitch bars at top and bottom, condensed label voice in ash. Top carries the wordmark (125% width, 0.32em tracking), the live level name and the Levels menu button (two lines that cross on open). Bottom carries the dream clock, a 1px depth bar and contact. Bars retract on level cards unless focus is inside them.
- **Levels menu:** A pitch scrim at 0.97 that opens from a horizontal slit (clip-path inset 50% to 0 in 0.55s). Entries are wide thin titles over condensed descriptions, divided by hairlines; hover and focus light the title sodium.

### Dream Clock
The bottom matte's clock reads hours, minutes and seconds in tabular figures beside a rate: ×1 in reality, ×20 in the City, ×400 in the Hotel, Reverse in the Inversion (counting down and turning forward red), and ∞ with dashes in Limbo.

### Spinning Top
A Three.js machined steel top (metalness 1, roughness 0.24, warm grey #d6d2ca) on a pool of lamplight, lit by a warm key light (#ffc98a) and a bone rim. A WebP poster frame stands in without WebGL or under reduced motion.

### Dailies Strip
The side project shown as a pitch film strip, tilted -3deg (-2deg on phones, flat under reduced motion), with sprocket rows of bone dashes and condensed edge code. App frames are desaturated to 0.55 and travel with the scroll.

## Do's and Don'ts

### Do:
- **Do** keep every surface in the graphite ramp (void, pitch, graphite) with bone, stone and ash for type.
- **Do** reserve sodium for focus, hover and lamplight, and forward red for the inversion.
- **Do** set every word in Archivo, choosing width by role: 125% titles, 75% chrome, 100% reading.
- **Do** keep corners square and divide with 1px bone hairlines at 0.08 to 0.26 alpha.
- **Do** grade evidence photographs and logos to grayscale (contrast 1.22 to 1.32, brightness 0.8 to 0.82) and let colour return only on interaction.
- **Do** frame each level with a full-viewport card that retracts the matte, and keep the matte reachable by focus.
- **Do** give every motion a calm path: the field freezes, the cold open is skipped, cards and notices appear without travel.

### Don't:
- **Don't** introduce any blue, including cool greys, link blue or blue-tinted shader light.
- **Don't** use forward red outside the inversion, or sodium as a resting fill or text colour.
- **Don't** add a second typeface or a serif display; hierarchy is width and weight within Archivo.
- **Don't** round corners on controls, frames or containers.
- **Don't** set screen text below 15px.
- **Don't** put a small tracked label above a heading; the level card's single descriptor sits below its title.
- **Don't** use hard offset shadows; depth is soft hang or light.
