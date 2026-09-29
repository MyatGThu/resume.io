# Myat Thu · The Director's Cut

Portfolio of **Myat Thu**, a Service Desk Analyst in Melbourne working across
Microsoft endpoint, identity and cloud. The resume is shot as a feature film
and deployed to GitHub Pages.

**Live:** https://myatgthu.github.io/resume.io/

## The film

One page, read as a movie: a cold open, five acts, and end credits.

- **Cold open.** A studio-style ident, an anamorphic flare across the lens,
  the letterbox bars slamming open, then the name forged out of embers. It
  runs about five seconds, can be skipped, and plays once per tab.
- **The short version.** Trailer intertitles, one fact at a time: four
  hundred stores, forty to fifty tickets a day, one escalation point.
- **Act I, The Lead.** The casting frame and the story.
- **Act II, The Record.** Four roles, each carried on a hammered bronze shield
  bearing the employer's mark. The shield flies in and locks; press it to open
  that company's website.
- **Act III, Field Reports.** Three case files as graded 2.39:1 shots with
  scene slates and script notes. Stock photographs, credited.
- **Act IV, The Immortals.** Four certifications struck as bronze coins. Press
  one for what it covers, where it is used in the record, and the official
  certification page. SC-300 glows in the forge.
- **Act V, The Training.** Study and the armoury.
- **End credits and the post-credits scene.** The whole record as rolling
  credits, then email, LinkedIn and the CV.

## The signature: the speed ramp

Every sequence rides one curve: fast, then slow motion, then fast. Title
cards slam in, hang in the air, and whip out as you scroll. The light field
behind the page (god rays through smoke, embers in three depths, heat rings
on every slam) runs on its own clock, and that clock drops to bullet time
whenever a title hangs, so the embers freeze with it.

## The grade

Bronze and ember throughout: crushed black, smoke, bronze, and molten gold as
the only light. Carved Roman capitals (Cinzel) for title cards, a condensed
credit-block sans (Barlow Condensed) for slates and credits, Barlow for
reading. The letterbox matte is the chrome: the act name and scene selection
live in the top bar, a running timecode and progress scrub in the bottom.

## Stack

Vanilla HTML, CSS and JS with no build step. GSAP, ScrollTrigger and Lenis
are vendored; the light field is a single raw WebGL fragment shader.

```
index.html            # the film
styles.css            # the grade and every act's material
main.js               # speed-ramp clock, light field, cold open, acts, credits
assets/               # portrait, logos, photographs, CV, self-hosted fonts
vendor/               # GSAP, ScrollTrigger, Lenis
.github/workflows/    # GitHub Pages: publishes only the files above
PRODUCT.md            # product truth for design work
.impeccable/          # design brief and review evidence (not published)
.claude/              # Claude Code skills and agents used while building
```

## Accessibility

With reduced motion there is no cold open, no scroll pinning and no moving
light: the whole record reads top to bottom with every word in place. The
page is readable without JavaScript or WebGL. Coins and the scene menu are
keyboard reachable, the certification notice is a labelled dialog that traps
focus, closes on Escape and returns focus, and every text colour holds at
least 5.7:1 on its ground.

## Notes

- Every fact traces to the CV in `assets/`; nothing on the page is invented.
- Field report photographs are Unsplash stock (Jannis Brandt, Viktor
  Talashuk, Samsung Memory), credited on the page and in the end credits.
  Each image file carries its origin in its metadata.
- Certification links point at the official certification pages; swap in
  personal verification links to make the coins prove the badge.
- Design work used the [Impeccable](https://github.com/pbakaus/impeccable)
  skill. Its automatic design-detector hooks are not enabled; turn them on
  with `/impeccable hooks on` if wanted.
