---
name: Myat Thu, Record of Service
description: A resume drawn as a rack elevation. A cool drafting sheet with a title block at monumental scale, one variable face in condensed caps for annotation, true 1px hairlines, and a patch-cable colour code that only ever marks state.
colors:
  sheet: "#eceef0"
  sheet-2: "#e4e7ea"
  sheet-3: "#dadee2"
  ink: "#10161c"
  ink-2: "#39434c"
  ink-3: "#5b656e"
  rule: "#aeb6bd"
  rule-2: "#c8ced3"
  blue: "#1557c0"
  amber: "#a04a06"
  red: "#c6302b"
  green: "#126b41"
typography:
  name:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.75rem, 8vw, 5rem)"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 92"
  close:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.8rem, 4.2vw, 3.1rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.032em"
  part:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.6rem, 3.2vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.028em"
  role:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.2rem, 2.2vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  lede:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.0625rem, 1.5vw, 1.1875rem)"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "0"
  body:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  ui:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0"
  value:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
    fontVariation: "'wdth' 100"
  annotation:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.1em"
    textTransform: "uppercase"
    fontVariation: "'wdth' 80"
rounded:
  all: "0"
spacing:
  s1: "8px"
  s2: "16px"
  s3: "24px"
  s4: "32px"
  s5: "48px"
  s6: "64px"
  s7: "96px"
  s8: "128px"
components:
  - Control
  - Title block
  - Rack unit
  - Credential row
  - Case file plate
  - Drawing strip
  - Legend
  - Signature plate
---

# Design System: Myat Thu, Record of Service

## Overview

The record drawn as the document this trade actually signs off: a dimensioned
elevation with a title block, not a styled CV. It refuses both of the ruts a
support engineer's portfolio falls into, the dark terminal and the sidebar with
skill bars, by borrowing the one document format the audience reads every week.

The visitor lands on a full-bleed drafting sheet. A scale runs the full height
of the left edge carrying the years, a tick for every year from 2026 to 2019.
The current post, IPH Limited, is already on the rails. A datum line crosses
the sheet, and under it the title block sits lower right at monumental scale
with the name, the role, the three actions and three fields. Then the sheet is
read downward: four roles as rack units with their date spans as dimensions,
three case files as detail callouts, five certifications as a schedule, Poker
Money as the one detail drawn out, study and kit as a short schedule, and a
sign-off with a signature plate.

This world replaces "Going Under", the Nolan descent that preceded it. The four
dream levels, the dream clock, the film credits, the totem framing and every
piece of 3D are retired at the owner's instruction, along with GSAP,
ScrollTrigger, Lenis and three.js. What ships is `index.html`, `styles.css`,
`main.js` and `assets/`. There is no build step.

## Colors

The sheet is cool on purpose. Cream was the obvious ground for a document and
it is exactly why this one is not cream: a blue-grey sheet reads as a working
drawing rather than stationery.

### Primary

`ink #10161c` on `sheet #eceef0`. 15.6:1. Every heading, every control border,
the datum, and the title block outline.

### Secondary

`blue #1557c0`, patch blue. The current post and nothing else: the square
swatch on the two live units, the live unit's date span, the "Current" label,
and the underline on the sheet index entry you are reading.

### Tertiary

`amber #a04a06` in progress, `green #126b41` verified, `red #c6302b`
escalation. Each appears only as a flag or a legend swatch. Red is held in
reserve and is currently unused on the page, which is the point: it is the
escalation colour.

### Neutral

`ink-2 #39434c` for body copy at 8.7:1, `ink-3 #5b656e` for annotation at
5.1:1, `rule #aeb6bd` and `rule-2 #c8ced3` for hairlines, `sheet-2 #e4e7ea`
for the one filled surface, the title block.

### Named Rules

- Colour marks state. A colour used for emphasis, decoration or mood is a
  defect, not a variation.
- The legend in the first viewport is the only place the code is spelled out.
  Because it is spelled out once, nothing else needs a caption.
- No surface, border or heading is ever tinted with a patch colour.
- The ground never warms toward cream.

## Typography

One typeface, Archivo variable, self-hosted at `assets/fonts/archivo.woff2`.
It carries the whole sheet through two voices: condensed caps at `wdth 80` for
every label, and the plain width for everything meant to be read, which
includes the values a recruiter looks up (dates, issuers, credential IDs, photo
credits). `font-variant-numeric: tabular-nums` is set on `body`, so every date,
dimension and credential ID lines up in its column without further thought.
Nothing on the sheet renders under 12px.

### Hierarchy

| Role | Size | Use |
|---|---|---|
| name | clamp(2.75rem, 8vw, 5rem) | The name in the title block. The one monumental element. On a short viewport it also steps down with the height: clamp(2.75rem, min(8vw, 11.5vh), 5rem). |
| close | clamp(1.8rem, 4.2vw, 3.1rem) | The sign-off statement. |
| part | clamp(1.6rem, 3.2vw, 2.5rem) | The record, Case files, Credentials, Poker Money, Study and kit. |
| role | clamp(1.2rem, 2.2vw, 1.5rem) | A job title on a rack unit, a case file heading, the live unit in the first view. |
| lede | clamp(1.0625rem, 1.5vw, 1.1875rem) | One paragraph under a part heading, the role under the name, the sign-off line. |
| body | 17px / 1.6 (16px at 900px and below) | Scope paragraphs, bullets. |
| ui | 16px | Controls, spec values, organisation and school names, credential names, the title block fields. |
| value | 13px, plain width | Dates, issuers, credential IDs, the "to now" span, photo credits, kit chips. Sentence case, tabular. |
| annotation | 12px caps, 0.1em | Every label: the sheet index, dimension and spec labels, flags, captions, the legend, the year scale, drawing number, revision and sheet fields. |

### Named Rules

- Reading columns are capped at `--measure`, 68ch. Only the elevation, the
  schedule and the rules run the full width of the sheet.
- Annotation is never used as body copy and body copy is never set in caps.
  A value (a date, an issuer, an ID, a credit) is not annotation: it is plain
  width and sentence case at 13px.
- The small steps are exactly two, 12px and 13px. There is no 10px, 10.5px or
  11px anywhere.
- No second typeface, no monospace, no system display stack.
- No kicker or eyebrow above a heading, ever.

## Layout

A single centred sheet, `--sheet-max` 1280px, with a fluid gutter of
`clamp(20px, 5vw, 72px)`. Everything spaces on an 8px base through `--s1` to
`--s8`. Parts are separated by 128px of padding and a 1px rule that runs the
full sheet width, which is why every rule on the page shares one right edge.

The first viewport is a grid of three rows: the scale and the live unit, the
datum, then the legend and the title block side by side. The scale is absolute
and spans the whole hero, so the datum crosses it the way a datum crosses a
scale on a real elevation. It is to scale: a tick for every year, 2026 at the
top to 2019 at the bottom, evenly spaced from 6% to 94% of its height. A year
label sits on a sheet-coloured plate above the datum, so where the two meet the
label knocks the line out instead of being struck through.

The hero vertical budget is three custom properties on `.hero` (`--hero-pt`,
`--hero-pb`, `--hero-top`) that the padding, the first row and the scale rail
all read. At 860px of viewport height or less they tighten together with the
datum margins, the block padding and the name, so the title block, with its
three actions directly under the role, sits fully inside the first view from
1366x657 up, and the actions are on screen at 1024x700, 1280x720 and on a
320x568 phone.

Breakpoints: 1080px drops the drawing title from the strip, 900px stacks every
two-column arrangement, 720px grows the strip to a 44px touch target and cuts
the sheet index to three entries, 560px makes the controls full width and folds
the signature plate. The max-height 860px query tightens the hero.

## Elevation & Depth

There is none. The stylesheet contains no `box-shadow` at all. Depth is carried
by hairlines, by the one filled surface, and by space.

### Named Rules

- No shadow, no gradient, no glass, no blur, no rounded corner.
- `--radius` does not exist. Every corner on the sheet is square.
- If two things need separating, use a 1px rule or use space.

## Shapes

Squares and lines. Rack rails, year ticks, leader lines on bullets, bordered
plates around photographs, square legend swatches, the same 10px blue square
repeated on the two live units, and a square portrait plate. There is no
circle and no thick stripe anywhere on the page.

## Components

### Control

`.ctl` is the only interactive shape: a 48px drawn button with a 1px ink
border. `.ctl--key` is the filled variant and there is exactly one per frame,
always email. It fills ink on hover and patch blue when it is the key control.
`.ctl--sm` is the 38px variant used inside an opened credential.

### Title block

`.block` is the only filled surface on the sheet. Name, role, the three
actions, three fields as a definition list, and a revision strip. The actions
sit directly under the role so they are on screen at first paint on a laptop.
It owns the first viewport at full scale.

### Rack unit

`.unit` is one role. The date span sits in its own 150px column as the
dimension label, a 13px value in the plain width; the body carries the logo
plate, the role, the organisation with its annotations, a scope paragraph and
leader-line bullets. `data-state="live"` turns the dimension blue and ends it
with the legend blue swatch. The live unit in the first view carries the same
swatch beside its "Current" label, so both live units wear one identical marker.

### Credential row

`.cred` wraps a native `<details>`. No JavaScript is involved: the summary is
the row, the plus rotates to a cross when open, and the row still works with
scripts blocked. Every row carries the same five fields in the same order, so
the schedule scans in one pass. The issuer, date and credential ID are values
(13px, plain width); the code and the flag are labels. The AZ-104 row is a
static variant with no disclosure because there is nothing yet to verify: its
date reads "Pending" and its flag "In progress", the legend word for amber.

### Case file plate

`.file__shot` is a bordered plate holding a grayscale photograph with its
subject annotated beneath. The plate keeps the same width whichever side of the
alternation it falls on.

### Drawing strip

`.strip` is fixed at the top carrying the drawing number, the drawing title and
the sheet index. Every destination is visible; the current part is underlined
in patch blue by an IntersectionObserver in `main.js`. Below 1080px the drawing
title drops. At 720px and below the index shows three entries, Record,
Credentials and Contact, because six no longer fit beside the drawing number;
it never scrolls, so no label is ever cut, and every link is 44px tall. The
other three parts are a scroll away. While one of them is current, `main.js`
puts the underline on the nearest entry above it that is on screen, so a hidden
link never carries the mark and the index still names the stretch of the page
the reader is in. The first entry is named "Record" to match its heading.

### Legend

`.legend` is the key, bottom left of the first viewport under the datum. Three
swatches, three words: Current, Verified, In progress. The amber state is
called "In progress" everywhere it appears.

### Signature plate

`.sign` closes the sheet: a square grayscale portrait, who drew it and where,
and the drawing fields closing on the right edge.

## Motion

One authored moment and one state duration. On load the datum draws itself
across the sheet over 900ms and the year ticks ink in behind it on a 90ms
stagger. Everything else is a 180ms transition on
`cubic-bezier(0.2, 0, 0, 1)`.

The opening is gated behind an `.is-plotting` class that `main.js` adds only
when the tab is visible and reduced motion is not requested. The stylesheet's
default is the finished state. This matters: animation frames are suspended in
a background tab, so an entrance that started from `opacity: 0` would hand a
visitor a blank sheet. It is also why nothing animates on scroll.

## Do's and Don'ts

### Do:

- Draw a component rather than style a box: rails, leader lines, plates, a
  legend, a revision block.
- Put a number in tabular figures and give it a column.
- Label with condensed caps at 12px, and set the values a recruiter reads in
  the plain width at 13px.
- Give a photograph a bordered plate and an annotated caption, in grayscale.
- Use a native element when one exists.
- Keep one filled control per frame, always email.
- Cap a new reading column at the measure.

### Don't:

- Don't add a kicker or an eyebrow above a heading.
- Don't set any text under 12px, and don't mark a unit with a side stripe: the
  live marker is the square swatch.
- Don't tint a surface, a border or a heading with a patch colour.
- Don't introduce a second typeface, a monospace face, or a system display
  stack.
- Don't reach for a shadow or a radius to separate two things.
- Don't hide a destination behind a hover, an overlay or a gesture.
- Don't animate on scroll, and don't reintroduce a library to do it.
- Don't warm the ground toward cream.
- Don't invent a claim. Every fact traces to the CV, the signed position
  description or the Poker Money README.
