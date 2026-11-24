# Plant BARA — consolidated fix list (post-QA)

Sources: independent visual review (1440px + 390px screenshots), Copilot design QA (`qa/copilot-design-qa.md`), OpenCode API QA (`qa/opencode-api-qa.md`). agy visual QA is still pending; append its confirmed items before the final Codex pass.

## Blockers / major

1. **Mobile horizontal overflow (390px).**
   - Cause: `.site-header__nav` + `.site-header__actions` + CTA cannot fit on one row; the page gains horizontal scroll, clipping the announcement bar, hero caption, hero description, and page headings.
   - Evidence: mobile screenshots show the search icon and CTA off-screen; announcement and hero copy cut at the right edge.
   - Fix in `src/styles/layout.css` @media (max-width: 760px):
     - keep the two-row header, but make `.site-header__nav` and `.site-header__actions` fit: `flex-wrap: wrap`, `min-width: 0`, gap `12px`.
     - hide `.site-header__cta` at <=760px (SCAN already exists in the nav).
     - hide `.site-header__search` at <=480px.
     - reduce announcement padding to `12px 16px` at <=640px and letter-spacing to `0.06em`.
   - Add `min-width: 0` to grid/flex children in `home.css` and `diseases.css` where long text can overflow; allow `overflow-wrap: anywhere` on hero caption/description, section intros, and card titles.

2. **Image contrast fails in the hero and Field Notes band.**
   - Hero: white copy sits on bright gold grass; Field Notes: white wordmark on a near-white plant photo.
   - Fix `src/lib/assets.ts`:
     - hero -> `https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=2000&q=80` (dark green leaf canopy, white type legible)
     - about -> `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80` (dark forest path)
     - process image can stay (`photo-1530836369250-ef72a3f5cda8`, seedlings).
   - Do not add gradient overlays; the photo itself must provide contrast.

3. **Double-encoded punctuation (mojibake) in source.**
   - `src/pages/AboutPage.tsx`: `â€”` -> `—`, `â€¦` -> `…` (6 occurrences).
   - `src/pages/DiseaseDetailPage.tsx`: `â€¦` -> `…`, `â†—` -> `↗` (2 occurrences).
   - `src/pages/DiseasesPage.tsx`: `â€¦` -> `…` (1 occurrence).
   - Verify with `grep -n "â€" src` returning nothing. All other files already use correct UTF-8.

4. **Missing H1 on primary routes.**
   - `SectionHeading` always renders `h2`; Scan, Library, and Field Notes pages have no H1.
   - Add an optional `as?: "h1" | "h2"` prop to `src/components/ui/SectionHeading.tsx` (default `h2`) and pass `as="h1"` for the primary heading on `ScanPage`, `DiseasesPage`, `AboutPage`.
   - Home already has an H1 in `Hero`; disease detail already has an H1.

5. **Upload control lacks visible keyboard focus.**
   - Add `.home-scan__dropzone:focus-within { outline: 1px solid var(--color-obsidian-ink); outline-offset: 3px; }` in `src/styles/home.css`.
   - Optionally add `.home-scan__pick` outline when the hidden input is focused.

## Minor

6. **Filter chips use filled black active states.**
   - `src/styles/diseases.css`: active `.disease-filters__pill` and `.disease-filters__segment-button` should stay transparent with a black outline cue, not a black fill.
   - Suggested: active = `border-color: obsidian; box-shadow: inset 0 0 0 1px obsidian; color: obsidian; background: transparent;` (or underline). Keep all states ghost.

7. **Live status dot uses Alpine Forest outside the announcement bar.**
   - `src/styles/layout.css:131-133`: change live dot to `--color-obsidian-ink`; offline dot stays `--color-stone`. No green outside the top strip.

8. **Raw class keys leak into copy.**
   - `src/components/disease/DiseaseCard.tsx`: meta line shows `LATE_BLIGHT`; use `humanizeClass(disease.disease)` for the disease label.
   - `src/pages/DiseaseDetailPage.tsx:88`: intro reads "Late_blight is a tomato class"; use `humanizeClass(disease.disease)`.
   - Keep `cropFromClass` for crops.

9. **Header is not transparent over the hero.**
   - Optional / low priority. The header precedes the hero in normal flow, so its transparent state shows the white canvas.
   - If implemented safely, add a home-only class and offset the hero by the measured header height; do not introduce layout shift or break sticky behaviour. Skip if risky.

## Explicitly rejected QA finding

- Copilot finding #6 (hero wordmark should be plantin 300) is **not** applied. `design.md` Hero Photography Block explicitly specifies "Massive practice 88px white wordmark". Keep `--font-practice` 600.

## Verification after fixes

1. `npm run typecheck`
2. `npm run build`
3. Restart the dev server, re-capture 1440px and 390px screenshots for `/`, `/scan`, `/diseases`, `/diseases/Tomato___Late_blight`, `/about`, `/missing-page`.
4. Confirm: no horizontal scroll at 390px; all pages have exactly one H1; no `â€` in source; hero/about white type is legible; filters remain ghost; keyboard focus ring appears on the upload zone.
5. Confirm live API still returns 38 diseases and a valid prediction (OpenCode QA already passed; no API code changes are expected).
