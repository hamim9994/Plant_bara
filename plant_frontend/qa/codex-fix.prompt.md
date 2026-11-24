# Codex fix task — Plant BARA frontend

Read `qa/fix-list.md` in this directory and implement items 1–8. Skip item 9 (header transparency) entirely. This is the only writing phase; QA agents are read-only.

## Constraints

- Edit only files under `plant_frontend/src/`. Do not touch `package.json`, configs, `dist/`, or QA reports.
- Preserve the design system: tokens only, no gradients, no card shadows, ghost pill buttons, bronze only as the physical seal accent.
- Use literal UTF-8 punctuation (`—`, `…`, `↗`). Do not introduce mojibake.
- Do not attempt network requests or live API calls; the API layer is already verified and must not change.
- Do not redesign. Make the smallest correct changes.

## Implementation notes

1. Mobile overflow (390px):
   - In `src/styles/layout.css` `@media (max-width: 760px)`: hide `.site-header__cta` with `display: none` (SCAN exists in the nav), add `min-width: 0` and `flex-wrap: wrap` to `.site-header__nav` and `.site-header__actions`, and let the nav take the full available row if needed.
   - Add `@media (max-width: 480px) { .site-header__search { display: none; } }`.
   - At `<=640px`, reduce `.announcement-bar` padding to `10px 16px` and letter-spacing to `0.06em`.
   - In `src/styles/base.css`, add `overflow-x: clip` on `body` as a final guard (do not use `hidden`).
   - Add `min-width: 0` to flex/grid children that hold long text and `overflow-wrap: anywhere` on hero caption/description, section intros, filter rows, and card titles. Ensure `.disease-filters__crops` wraps.
2. Images: in `src/lib/assets.ts` set `hero` to `https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=2000&q=80` and `about` to `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80`. Keep `process` unchanged. Do not add overlays.
3. Mojibake: fix the 10 occurrences across `AboutPage.tsx`, `DiseaseDetailPage.tsx`, `DiseasesPage.tsx`. Verify `grep -n "â" src` returns nothing.
4. H1s: add `as?: "h1" | "h2"` to `SectionHeading` (default `h2`), render that tag, and pass `as="h1"` on ScanPage, DiseasesPage, AboutPage. Home already has its own H1; disease detail already has its own H1.
5. Focus: add `.home-scan__dropzone:focus-within { outline: 1px solid var(--color-obsidian-ink); outline-offset: 3px; }` in `home.css`.
6. Filter chips: replace filled active states (`.disease-filters__pill.is-active`, `.disease-filters__segment-button.is-active`) with transparent background + obsidian border/inset outline + obsidian text. Keep all states ghost.
7. Live dot: change `.site-header__status--live .site-header__status-dot` to `background: var(--color-obsidian-ink)`.
8. Raw class keys: use `humanizeClass(disease.disease)` for the disease label in `DiseaseCard`, and in the detail intro sentence use `humanizeClass(disease.disease)` instead of the raw underscore value.

## Verify

- `npm run typecheck`
- `npm run build`
- Confirm no `â` remains in `src`.
- Write `qa/codex-fix-report.md` with: files changed, what changed, commands run, and any remaining risk. Do not claim visual verification you did not perform.
