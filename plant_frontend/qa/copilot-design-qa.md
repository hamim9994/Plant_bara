# Plant BARA design QA

**Verdict: NEEDS FIXES**

## Findings

### Major

1. **Photo contrast fails in the hero and Field Notes band.** `src/lib/assets.ts:10-13`, `src/styles/home.css:6-12, 83-87`, `src/styles/diseases.css:436-461` — The sunny hero leaves white copy and its CTA over bright gold grass; the Field Notes title is white on a near-white image. Use darker, naturally contrasty photographs/crops with no overlay; keep white type only where the image itself is dark.
2. **Mobile content is clipped.** `src/styles/layout.css:250-285`, `src/styles/home.css:649-667`, `src/styles/diseases.css:112-128` — At 390px, the header’s right actions/CTA, long hero text, scan/detail/404 copy, and footer text overflow; the library heading and crop controls also run past the viewport (`qa/screenshots/home-mobile.png`, `qa/screenshots/library-mobile.png`). Reflow the header into fitting rows with a visible labeled scan action; set flex/grid children to `min-width: 0` and allow headings, captions, body text, and filter pills to wrap.
3. **Primary route headings skip H1.** `src/components/ui/SectionHeading.tsx:10-14`, used by `src/pages/ScanPage.tsx:12-16`, `src/pages/DiseasesPage.tsx:62-67`, and `src/pages/AboutPage.tsx:48-54` — These pages render their main title as H2, leaving no H1. Support a page-title level and render H1 for each route’s primary heading; retain H2 for subsequent sections.
4. **The upload control has no visible keyboard-focus indicator.** `src/components/home/ScanPanel.tsx:115-127`, `src/styles/home.css:205-243` — The focusable file input is clipped to 1px and its label does not reflect focus. Add a `:focus-visible`/`:focus-within` treatment that visibly outlines the “CHOOSE A LEAF IMAGE” pill whenever the input receives keyboard focus.
5. **Library filter actions depart from the ghost-pill contract.** `src/styles/diseases.css:84-109, 118-140` — Selected status and crop controls become solid black, and these controls lack the prescribed practice 600/0.04em action styling and trailing arrow. Keep all states transparent and outlined; show selection with a non-filled cue while retaining the required action treatment.

### Minor

6. **Hero wordmark uses the wrong display face and weight.** `src/styles/home.css:33-40` — The lockup is Inter/practice 600 instead of the required Cormorant/plantin 300 display treatment. Use `--font-plantin`, weight 300, and tight tracking for the wordmark.
7. **Forest green appears outside the announcement bar.** `src/styles/layout.css:131-133` — The live-status dot reuses `#205f4b`; keep that color confined to the announcement bar and render the status indicator in ink/graphite.
8. **The header is not actually transparent over the hero.** `src/components/layout/PageShell.tsx:10-13`, `src/styles/layout.css:35-46` — The header precedes the hero in normal flow, so its transparent background shows the white page canvas rather than photography. Overlay it at the hero’s top edge before switching to white on scroll, without obscuring the announcement bar.

## What works well

- The core white/parchment/linen surfaces, hairline rules, restrained shadows, and announcement/footer treatments closely follow the reference.
- Section spacing and the home page’s photo, split, editorial, and three-column layouts create a clear editorial rhythm.
- Global focus-visible styling, associated form labels, descriptive image text, and ARIA state/status patterns provide a solid accessibility foundation.
