# Myat Thu · Going Under

Portfolio of **Myat Thu**, a Service Desk Analyst in Melbourne working across
Microsoft endpoint, identity and cloud. The resume is a descent through four
dream levels, after Christopher Nolan's The Dark Knight, Inception, Tenet and
The Odyssey, and is deployed to GitHub Pages.

**Live:** https://myatgthu.github.io/resume.io/

## The descent

One page. You wake in reality, go under through the trailer, walk four
levels, and come back up with the kick.

- **Cold open.** Black frame, "A Myat Thu film" tracking out, a five second
  countdown, then a hard cut: the name folds up off the floor the way a
  street does in a dream. It can be skipped and plays once per tab.
- **Reality.** A machined steel spinning top, rendered live in Three.js,
  spins on a dark table under one lamp beneath the name.
- **Going under.** Trailer intertitles, one fact at a time, each landing with
  a jolt. The camera rises overhead and watches the top spin.
- **The City** (The Dark Knight). The lead and the record. Roles light up
  like windows, floor by floor; each employer's mark opens its website.
- **The Hotel** (Inception). Field reports. Gravity turns: each frame rotates
  in from the wall as the corridor rolls behind it.
- **The Inversion** (Tenet). The side project, Poker Money, on a strip of
  dailies running the wrong way, and the totems: four certifications kept as
  Cobb's top, Arthur's die, Ariadne's bishop and Eames's poker chip. Check
  one for what it covers, where it works, when it was earned, and Myat's
  verification link. Entropy runs backwards here, and so does the clock.
- **Limbo** (Inception, The Odyssey). The training and the end credits, over
  a grey sea with one fire on the shore. No clock.
- **The kick.** The top is back, wobbling. The page cuts to black before it
  falls: "Still spinning." Then email, LinkedIn, the CV, and a way back up.

## The signatures

- **Time dilation.** The light field slows level by level, and the matte
  clock runs in dream time: twenty times faster in the city, four hundred in
  the hotel, backwards in the inversion, and not at all in limbo.
- **The IMAX switch.** Reading happens between thin 35mm bars. On every
  level card the bars leave the frame and the level's plate fills it.
- **Hard cuts.** Titles do not fade out; they end.

## The grade

Graphite, with no blue anywhere: near-black, concrete greys, bone white type.
Warmth comes only from practical light (a lamp, a fire, sodium streetlight).
Tenet red marks forward time, and only inside the inversion. One variable
face, Archivo: expanded thin capitals for titles, condensed capitals for
chrome, plain for reading.

## Stack

Vanilla HTML, CSS and JS with no build step. GSAP, ScrollTrigger and Lenis
are vendored; the light field is one raw WebGL fragment shader that blends a
look per level. The spinning top is the only Three.js on the page:
`vendor/three.min.js` is three r186 tree-shaken to the names `totem.js`
imports (rebuild it with esbuild if that list changes), loaded with a dynamic
`import()` after first paint.

```
index.html            # the descent
styles.css            # the grade, the matte, every level's material
main.js               # level clock, light field, cold open, level motion, notice
totem.js              # the 3D spinning top: lathe, lamp, shots, wobble, the cut
assets/               # portrait, logos, photographs, level plates, totems, CV, font
cv/                   # CV source: cv.html, printed to the PDF by render.cjs
vendor/               # GSAP, ScrollTrigger, Lenis, three.js (tree-shaken)
.github/workflows/    # GitHub Pages: publishes only the files above
PRODUCT.md            # product truth for design work
.impeccable/          # design brief, totem generator, review evidence (not published)
.claude/              # Claude Code skills and agents used while building
```

## Accessibility

With reduced motion there is no cold open, no scroll pinning and no moving
light or top: a rendered poster of the top stands in, and the whole record
reads top to bottom with every word in place. The page is readable without
JavaScript or WebGL. Totems and the levels menu are keyboard reachable, the
certification notice is a labelled dialog that traps focus, closes on Escape
and returns focus, and every text colour holds at least 5.3:1 on its ground.

## Notes

- Every fact traces to the CV in `assets/`, the owner's verification links,
  or the Poker Money README; nothing on the page is invented.
- The City, Hotel and Inversion plates were generated with ElevenLabs
  (Seedream); each file's sidecar holds its exact prompt. The totems and the
  top are procedural Three.js renders (`.impeccable/totems.js`, `totem.js`).
- Field report photographs are Unsplash stock (Jannis Brandt, Viktor
  Talashuk, Samsung Memory), credited on the page and in the end credits.
- The CV is designed in `cv/cv.html` and printed to `assets/Myat-Thu-CV.pdf`
  with `NODE_PATH=$(npm root -g) node cv/render.cjs` (needs Playwright).
- Design work used the [Impeccable](https://github.com/pbakaus/impeccable)
  skill. Its automatic design-detector hooks are not enabled; turn them on
  with `/impeccable hooks on` if wanted.
