# Plant BARA — final QA summary

**Date:** 2026-11-24  
**Scope:** `plant_frontend/` against the live backend `https://plant-bara.onrender.com/`  
**Verdict:** **PASS — release-ready frontend.** All blocking findings from the design and visual QA passes are resolved. Two QA suggestions were deliberately rejected (documented below).

## Verification evidence

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASS (`tsc --noEmit` for app and node configs) |
| `npm run build` | PASS — 68 modules, CSS 38.01 kB (gzip 5.51 kB), JS 199.62 kB (gzip 63.83 kB) |
| Live API contract QA | PASS — health, model info, 38 diseases, disease detail, multipart predict, 400 on bad content type |
| Browser E2E upload | PASS — real file input, preview, live prediction, no console/UI error |
| Responsive width | PASS — `scrollWidth === clientWidth` at 390×844 and 1440×900 on all six routes |
| UTF-8 copy | PASS — `rg -n "â|Ã|Â|�" src` returns nothing |
| H1 structure | PASS — Home hero, Scan, Library, Field Notes and disease detail each expose one H1 |
| Independent post-fix visual QA | PASS — agy re-verified all seven fix categories (overflow, contrast, UTF-8, H1s, upload, ghost filters, class labels) |

### Live prediction through the UI

Selected `opencode-plantbara-test.jpg` through `#home-scan-file`, previewed it, clicked **ANALYZE LEAF**, and received:

- Title: **Tomato — Septoria leaf spot**
- Labels: **Tomato / Septoria leaf spot**
- Confidence: **57.1%**
- Alternatives: Strawberry — healthy (15.1%), Grape — healthy (9.0%)
- Footer: MobileNetV2 · ~725 ms
- Errors: none

Captured at `qa/screenshots/scan-result-desktop.png` and `scan-result-mobile.png`.

## Findings resolved

| Finding | Source | Resolution |
| --- | --- | --- |
| Mojibake (`â€”`, `â€¦`, `â†—`) in 10 places | Copilot, agy, visual review | Replaced with `—`, `…`, `↗` in `AboutPage`, `DiseaseDetailPage`, `DiseasesPage`; verified clean |
| Mobile header/hero clipping | Copilot, visual review | Header CTA hidden ≤760px, search hidden ≤480px, nav/actions wrap with `min-width: 0`, announcement padding/tracking reduced, `overflow-x: clip` guard |
| Long words/text overflowing narrow columns | Copilot | `overflow-wrap: anywhere` and `min-width: 0` on hero, headings, filters, cards and scan copy |
| Hero/About photo contrast | Copilot, visual review | Hero → dark leaf canopy; About → dark misty forest; detail photo → leaf canopy. No overlay or gradient added, per `design.md` |
| Missing H1 on Scan/Library/Field Notes | Copilot | `SectionHeading` gained `as="h1"|"h2"`; primary headings use `h1` |
| Upload zone had no keyboard focus ring | Copilot | `.home-scan__dropzone:focus-within` outline added |
| Filled black active filter chips | Copilot | Active segment/pill states are transparent with an obsidian inset outline |
| Live status dot used Alpine Forest | Copilot | Now obsidian; green remains exclusive to the announcement strip |
| Raw class keys in copy | Copilot | `humanizeClass()` used in cards, detail intro and prediction labels (`Septoria_leaf_spot` → “Septoria leaf spot”) |
| Section intros/announcement not centered | True-390px review | Removed the global `p { text-align: left }` reset that overrode container centering |
| Hero caption orphan (“38 / CLASSES”) | True-390px review | “38 CLASSES” wrapped in a `nowrap` span; now breaks cleanly before the number |
| `100vw` full-bleed About band | agy | Replaced with `width: 100%`; no scrollbar risk |
| Dead mobile CTA label CSS | agy | Removed |
| Hero CTA hover low contrast | agy | Hover now inverts to white fill + obsidian text; focus outline is white |
| Missing standard `line-clamp` | agy | Added alongside `-webkit-line-clamp` |

## Deliberately not applied

- **Negative pixel tracking tokens** (`--tracking-heading: -16.34px`, `--tracking-display: -37.84px`): these are copied verbatim from `design.md` and are currently unused. Changing them would diverge from the design source.
- **Transparent header over the hero**: skipped as low-value/high-risk for sticky layout. The header is transparent at rest but sits above the hero in normal flow.
- **Copilot’s hero-font finding**: rejected. `design.md` explicitly specifies the 88px hero lockup in practice 600, not plantin 300.

## Residual notes

- Unsplash photography and Google Fonts require network access; offline environments fall back to system fonts and missing imagery.
- The Render free tier can cold-start; the UI shows `OFFLINE`/loading states while the health and data requests settle.
- QA used Chrome DevTools device emulation (390×844), not physical devices.
- No unit-test suite was added; functional coverage is the live API QA plus the browser upload E2E.

## Artifacts

- `qa/screenshots/` — final 1440×900 and 390×844 full-page captures for all routes, plus prediction results.
- `qa/screenshots-pre-fix/` — earlier QA captures retained for comparison.
- `qa/opencode-api-qa.md` — live endpoint and contract audit.
- `qa/copilot-design-qa.md` — design system and accessibility audit.
- `qa/agy-visual-qa.md` — post-fix visual/responsive verification (PASS, with artifact reconciliation note).
- `qa/codex-fix-report.md` — integration/fix pass, including the follow-up correction note.
- `qa/fix-list.md` — consolidated fix brief used for the Codex pass.
- `qa/capture-cdp.mjs`, `qa/e2e-predict.mjs` — reproducible QA harnesses.
