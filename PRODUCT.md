# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Potential employers: recruiters and hiring managers filling IT support,
service desk and modern workplace roles in Melbourne. They arrive from a
CV, a LinkedIn profile or a job application, skim first, and need to learn
quickly who Myat is, what he has run, what he is certified in, and how to
reach him. (The owner's brief: "paint a picture for potential employers".)

## Product Purpose

Myat Thu's personal resume site. Success is an employer taking one of three
actions: emailing him, opening his LinkedIn profile, or downloading the CV.

## Positioning

A working Service Desk Analyst and second-level escalation point who came
up through retail IT at national scale (400+ stores, 40 to 50 tickets a day)
and whose habit is turning a repeat problem into a written process: the dock
rollout, the service-desk playbook, the standard device build. Microsoft
endpoint, cloud and identity certifications back the practice.

## Operating Context

Read on desktop and phone, usually after a CV or LinkedIn visit. Served as a
static site from GitHub Pages at https://myatgthu.github.io/resume.io/.

## Capabilities and Constraints

- One page. The owner asked for the separate pages to be combined into one.
- No "About me" section. The owner removed it.
- Company logos stay on the record, and each opens that company's website in
  a new tab.
- Each certification expands in place on the credentials schedule: what it
  covers, where it is used in current and previous roles, the date it was
  earned, the credential ID, and the owner's own verification link. Show the
  earned date only; the owner chose to leave expiry to the verification page.
- LinkedIn profile linked: https://www.linkedin.com/in/myat-george-thu/
- No em dashes anywhere in the copy.
- Type must be comfortably large; the owner flagged small text before.
- Scrollbars hidden on both axes.
- Personal data limited to name, location and email on purpose.
- Static HTML, CSS and JS with no libraries and no build step: the owner
  asked for nothing slow or heavy, so GSAP, ScrollTrigger, Lenis and
  three.js are all removed. Deployed by the GitHub Pages workflow on push
  to main.

## Brand Commitments

- Name: Myat Thu. Email: myatgeorgethu@gmail.com. Location: Melbourne,
  Australia.
- Portrait at assets/portrait.jpg; company logos in assets/logos/; the CV at
  assets/Myat-Thu-CV.pdf (printed from cv/cv.html) is the authoritative source
  for role history.

## Evidence on Hand

- Roles: IPH Limited, Service Desk Analyst (commenced 5 May 2025); The Reject
  Shop, IT Support Analyst (2023 to 2025); Azured Consulting, Support
  Engineer (2022); MYER, Office Support Assistant (2019 to 2024).
- The IPH role detail comes from the owner's position description: ANZ
  region, reports to the Service Delivery Manager (ANZ), Information
  Technology, Melbourne (City), permanent full time. The title is Service Desk
  Analyst, as on the offer letter; do not use any other variant. Only role
  facts are used from that document; nothing else from it goes on the site
  or into this repository.
- Certifications: MD-102, AZ-900, SC-900, Google IT Support Professional;
  AZ-104 (Azure Administrator Associate) in progress.
- Study: RMIT BBus Information Systems (2019 to 2021), RMIT Diploma of IT
  (2018), Trinity College Foundation IT (2016 to 2017).
- Case files: dock standardisation, service-desk playbook, modern device
  builds.
- Field-report photographs are Unsplash stock (Jannis Brandt, Viktor
  Talashuk, Samsung Memory), credited on the page.
- Verification links, supplied by the owner: MD-102 (earned 23 Nov 2024),
  AZ-900 (2 Nov 2022), SC-900 (26 Oct 2023) on Microsoft Learn; Google IT
  Support (4 Jun 2023) on Coursera.
- Side project: Poker Money (pokermoney.org), a free app that settles private
  home poker games. Facts come from the MyatGThu/poker-tracker README: built
  by four people with the owner as lead contributor, vanilla JS on a
  Cloudflare Worker and D1, installable and offline, Android TWA, verified
  sign-up, server-enforced roles, tenant isolation, 380 tests in 16 suites,
  no ads or tracking. Co-builders stay unnamed on the site.
- Trinity College crest: the College shield cropped from the owner-supplied
  lockup.
- Confirmed by the owner: open to full-time and contract roles in
  Melbourne, and replies within a day. Open to work in 2026.
- Visual world, chosen by the owner: a rack elevation drawing. A cool
  drafting sheet, engineering title block, U-numbered rails, and a
  patch-cable colour code used only for state. The Nolan descent, the four
  dream levels, the dream clock, the film credits, the totem framing and all
  3D are retired, along with the earlier Snyder bronze world.
- Withdrawn by the owner: any claim of studying in a live lab tenant.
- Absent, never to be fabricated: testimonials, employer quotes, metrics
  beyond the CV and the Poker Money README, photographs of his actual
  workplace.

## Product Principles

1. Every claim traces to the CV. Spectacle may dramatize a fact, never
   inflate one.
2. Contact is always one action away.
3. The show serves the record: each flourish lands on something real.
4. Ambitious and still accessible: fast, keyboard reachable, readable on a
   phone, calm under reduced motion.

## Accessibility & Inclusion

A full reduced-motion path, native disclosure elements that work with
JavaScript blocked, large readable type, no autoplaying sound. The opening is
gated so the finished state is the default, which keeps a background tab or a
blocked script from showing a blank page.
