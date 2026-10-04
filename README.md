# Myat Thu, record of service

Portfolio of **Myat Thu**, a Service Desk Analyst in Melbourne working across
Microsoft endpoint, identity and cloud. The resume is drawn as a rack
elevation: a cool drafting sheet, an engineering title block, true 1px
hairlines, and a patch-cable colour code that only ever marks state. It is
deployed to GitHub Pages.

**Live:** https://myatgthu.github.io/resume.io/

## The sheet

One page, read top to bottom the way an elevation is read.

- **Title block.** Name, role, location, availability and the three actions
  (email, LinkedIn, the CV) at monumental scale in the first viewport, with a
  year scale on the left rail and the current post already on the rails.
- **The record.** Four roles as rack units. The date span is the dimension
  label; each employer's mark opens its website in a new tab.
- **Case files.** Three detail callouts: the dock rollout, the service desk
  playbook, the standard device build.
- **Credentials.** Four verified certifications as native `<details>` rows:
  what each covers, where it is used in the record, the credential ID and the
  owner's own verification link. AZ-104 is on the schedule as in preparation.
- **Poker Money.** The side project, with three frames from the app.
- **Study and kit**, then the sign-off with the same three actions.

## The colour code

Colour is state and nothing else: blue for the current post, amber for in
progress, red for escalation, green for verified. Everything else is ink on
the sheet.

## Stack

Vanilla HTML, CSS and JS with no build step and no libraries. The one
authored moment, the datum plotting and the year ticks inking in, is a CSS
animation gated behind an `is-plotting` class that a two-line script in the
`<head>` adds only when the tab is visible and motion is welcome; the
finished sheet is the default state. `main.js` marks the current sheet-index
entry and opens the credential rows for printing, and the page reads
correctly with it blocked.

```
index.html            # the sheet
styles.css            # the drafting sheet, the title block, every component
main.js               # sheet index marker, print expansion of the credentials
assets/               # portrait, logos, photographs, Poker Money frames, CV, font, og image
cv/                   # CV source: cv.html, printed to assets/Myat-Thu-CV.pdf by render.cjs
.github/workflows/    # GitHub Pages: publishes index.html, styles.css, main.js and assets/
PRODUCT.md            # product truth for design work
DESIGN.md             # the design system this sheet is drawn to
.impeccable/          # design brief and review evidence (not published)
.claude/              # Claude Code skills and agents used while building
```

## Accessibility

One `h1`, no skipped heading levels, a skip link, and a visible focus ring on
every control including the credential rows. With reduced motion there is no
opening animation and no smooth scrolling, and the whole record reads top to
bottom with every word in place. Decorative images carry empty alt text and
company marks are named on their links. Every text colour holds at least
4.7:1 on its ground.

## Notes

- Every fact traces to the CV in `assets/`, the owner's verification links,
  or the Poker Money README; nothing on the page is invented.
- Field photographs are Unsplash stock (Jannis Brandt, Viktor Talashuk,
  Samsung Memory), credited on the page.
- `assets/og.png` is rendered from `.impeccable/og.html` with Playwright. Each
  shipped raster's `.json` sidecar records where it came from.
- The CV is designed in `cv/cv.html` and printed to `assets/Myat-Thu-CV.pdf`
  with `NODE_PATH=$(npm root -g) node cv/render.cjs` (needs the Playwright
  package). The Playwright CLI works too, served over HTTP so the font loads:
  `npx playwright pdf --paper-format=A4 http://127.0.0.1:8777/cv/cv.html assets/Myat-Thu-CV.pdf`.
- Design work used the [Impeccable](https://github.com/pbakaus/impeccable),
  taste and web-design-guidelines skills, with Addy Osmani's accessibility and
  seo skills for audits. Impeccable's design-detector hooks are configured per
  machine in `.claude/settings.local.json`, which is not committed; set them up
  with `/impeccable hooks on`. Its engine binary downloads on first run and is
  ignored by git.
