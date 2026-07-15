# Myat Thu — Portfolio

An interactive, motion-rich personal portfolio for **Myat Thu**, an IT
professional specialising in the Microsoft modern workplace (Intune, Entra ID,
cloud administration). Built as a static site and deployed to GitHub Pages.

**Live:** https://myatgthu.github.io/resume.io/

## Design

- Minimal-elegant editorial direction with luxurious motion.
- Typeface: **Outfit** (self-hosted, variable).
- Warm "bone" palette with a single terracotta accent and dark feature sections.

## Interaction

- Smooth inertia scrolling (Lenis) and scroll-triggered reveals (GSAP / ScrollTrigger).
- Fullscreen animated menu, custom cursor with contextual labels, magnetic buttons.
- Text-scramble hover effect, scroll-driven word reveal, animated counters,
  velocity-reactive marquee, parallax, and 3D card tilt.
- Rotating "open to work" badge.
- Fully accessible: honours `prefers-reduced-motion` and degrades gracefully
  without JavaScript; semantic HTML and keyboard support throughout.

## Structure

```
index.html          # markup
styles.css          # design system + sections
main.js             # Lenis + GSAP motion, menu, scramble, cursor
assets/fonts/       # self-hosted Outfit (woff2)
vendor/             # GSAP, ScrollTrigger, Lenis (vendored, no CDN)
.github/workflows/  # GitHub Pages deployment
.claude/skills/     # Claude Code skills collection (from earlier task)
```

## Notes

- The portrait is a placeholder and the employer entries use styled wordmarks —
  drop in real images/logos to swap them.
- Personal data is intentionally limited to name, location, and email.
