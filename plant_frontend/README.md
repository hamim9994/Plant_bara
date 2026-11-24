# PLANT BARA — frontend

React + TypeScript + Vite client for the Plant BARA crop-disease API at
`https://plant-bara.onrender.com/`. The visual system follows `../design.md`
(editorial apothecary: parchment surfaces, black ink type, ghost pill buttons,
bronze reserved for the seal accent, no gradients or card shadows).

## Run

```bash
npm install
npm run dev        # http://127.0.0.1:5173
npm run typecheck
npm run build
npm run preview
```

The API base defaults to the deployed backend. To point at a local backend or a
staging deployment, copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page: hero, model stats, scan panel, method, featured library |
| `/scan` | Dedicated leaf scan with ranked prediction and field note |
| `/diseases` | Searchable 38-class library with crop, health and text filters |
| `/diseases/:className` | Disease detail: symptoms, treatment, prevention, related notes |
| `/about` | Field notes, method, live model metadata |
| `*` | 404 page |

## Structure

- `src/lib/` — API client, response types, formatting, image/brand assets.
- `src/hooks/` — health, model info, disease list/detail, prediction.
- `src/components/` — layout chrome, home/scan panels, disease cards, UI primitives.
- `src/pages/` — route pages.
- `src/styles/` — tokens, base, layout, UI, home and disease styles.
- `qa/` — plan QA reports, reproducible capture scripts and screenshots.

## QA

- `qa/final-qa-summary.md` — consolidated verification and findings.
- `qa/screenshots/` — final desktop (1440×900) and mobile (390×844) captures.
- `qa/screenshots-pre-fix/` — earlier QA captures retained for comparison.
- `qa/capture-cdp.mjs` — full-page screenshot harness using Chrome DevTools Protocol.
- `qa/e2e-predict.mjs` — uploads a test image through the real UI and checks the live model response.

Screenshots and fonts load from Unsplash and Google Fonts; offline environments
fall back to system fonts and blank imagery by design.
