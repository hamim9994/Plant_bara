# A-WARE / Plant BARA — Frontend Plan

**Goal:** Build `plant_frontend/` — an editorial, photography-led React SPA for the deployed FastAPI crop-disease backend at <https://plant-bara.onrender.com/>.

**Design source:** `../design.md` (A-WARE style reference). Tokens, type scale, surfaces, ghost pill buttons, parchment showcase zones, hero photography, hairline rules, ultra-restrained bronze accent. Brand wordmark is adapted from `A-WARE` to `PLANT BARA`; the visual language stays identical.

**Backend source:** `../plant_backend/app/schemas.py` + `app/api/routes.py`. Live API verified: `/api/v1/health` → `{"status":"ok","model_loaded":true,"version":"1.0.0"}`; `/api/v1/diseases` → 38 entries.

---

## 1. Product scope (screens)

| # | Route | Purpose | Key API calls |
|---|-------|---------|---------------|
| 1 | `/` | Home: announcement bar, hero photography, single-leaf scan CTA, model stats band, "how it works", featured disease library, footer | `GET /api/v1/health`, `GET /api/v1/model/info`, `GET /api/v1/diseases` |
| 2 | `/scan` | Dedicated scanner: drag/drop or browse a leaf photo, preview, `top_k` selector, submit, result with confidence, symptoms / treatment / prevention, alternatives | `POST /api/v1/predict?top_k=N` |
| 3 | `/diseases` | Searchable/filterable 38-class library, crop pills, healthy/diseased toggle, cards link to detail | `GET /api/v1/diseases` |
| 4 | `/diseases/:className` | One class: editorial detail page with symptoms, treatment, prevention, related links | `GET /api/v1/diseases/{class_name}` |
| 5 | `/about` | Field notes: model metadata (97.49% accuracy, MobileNetV2, PlantVillage, 38 classes), mission copy, process | `GET /api/v1/model/info` |
| 6 | `*` | Minimal 404 page with ghost pill home link | — |

**Header nav mapping:** `SCAN` → `/scan`, `LIBRARY` → `/diseases`, `FIELD NOTES` → `/about`. Brand mark centered → `/`. Right side: live model-status dot (from `useHealth`) + search icon linking to `/diseases` + a ghost pill "SCAN A LEAF" (replaces the original login/cart icons, which have no backend equivalent).

**No invented backend features:** no auth, no cart, no database, no history. All content comes from the five real endpoints.

---

## 2. Tech stack

- React 18.3 + TypeScript 5.x
- Vite 6 + `@vitejs/plugin-react`
- `react-router-dom` v6 (BrowserRouter in `main.tsx`, `<Routes>` in `App.tsx`)
- Plain CSS with the design tokens as CSS custom properties (no utility framework needed)
- `fetch` only — no axios
- Google Fonts via `<link>` in `index.html`: Cormorant Garamond (plantin substitute), Inter (practice), JetBrains Mono (lab-mono), with the fallbacks from `design.md`

---

## 3. Target tree / file ownership

Parallel agents own **disjoint files**. Never edit a file owned by another agent.

### Agent A — `scaffold`
Owns:
```
plant_frontend/package.json
plant_frontend/index.html
plant_frontend/vite.config.ts
plant_frontend/tsconfig.json
plant_frontend/tsconfig.node.json
plant_frontend/vite-env.d.ts
plant_frontend/.gitignore
plant_frontend/.env.example
plant_frontend/README.md
plant_frontend/src/main.tsx
plant_frontend/src/styles/tokens.css
plant_frontend/src/styles/base.css
```

### Agent B — `data-layer`
Owns:
```
plant_frontend/src/lib/types.ts
plant_frontend/src/lib/api.ts
plant_frontend/src/lib/format.ts
plant_frontend/src/lib/assets.ts
plant_frontend/src/hooks/useHealth.ts
plant_frontend/src/hooks/useDiseases.ts
plant_frontend/src/hooks/useDiseaseDetail.ts
plant_frontend/src/hooks/useModelInfo.ts
plant_frontend/src/hooks/usePrediction.ts
```

### Agent C — `ui-layout`
Owns:
```
plant_frontend/src/components/ui/GhostButton.tsx
plant_frontend/src/components/ui/SectionHeading.tsx
plant_frontend/src/components/ui/FeatureList.tsx
plant_frontend/src/components/ui/ConfidenceMeter.tsx
plant_frontend/src/components/ui/StatusNote.tsx
plant_frontend/src/components/ui/InfoBlock.tsx
plant_frontend/src/components/layout/AnnouncementBar.tsx
plant_frontend/src/components/layout/Header.tsx
plant_frontend/src/components/layout/Footer.tsx
plant_frontend/src/components/layout/PageShell.tsx
plant_frontend/src/styles/layout.css
plant_frontend/src/styles/ui.css
```

### Agent D — `home-scan`
Owns:
```
plant_frontend/src/components/home/Hero.tsx
plant_frontend/src/components/home/ScanPanel.tsx
plant_frontend/src/components/home/ResultPanel.tsx
plant_frontend/src/components/home/HowItWorks.tsx
plant_frontend/src/components/home/ModelStats.tsx
plant_frontend/src/components/home/FeaturedDiseases.tsx
plant_frontend/src/pages/HomePage.tsx
plant_frontend/src/pages/ScanPage.tsx
plant_frontend/src/styles/home.css
```

### Agent E — `library-routing`
Owns:
```
plant_frontend/src/components/disease/DiseaseCard.tsx
plant_frontend/src/components/disease/DiseaseFilters.tsx
plant_frontend/src/pages/DiseasesPage.tsx
plant_frontend/src/pages/DiseaseDetailPage.tsx
plant_frontend/src/pages/AboutPage.tsx
plant_frontend/src/pages/NotFoundPage.tsx
plant_frontend/src/App.tsx
plant_frontend/src/styles/diseases.css
```

---

## 4. Shared contracts (import these exact names)

### `src/lib/types.ts` (B)
```ts
export interface PredictionItem { class_name: string; display_name: string; confidence: number }
export interface PredictionResult {
  class_name: string; display_name: string; crop: string; disease: string;
  is_healthy: boolean; confidence: number;
  symptoms: string; treatment: string; prevention: string;
}
export interface PredictResponse {
  success: boolean; prediction: PredictionResult;
  alternatives: PredictionItem[];
  model: Record<string, unknown>;
  processing_time_ms: number;
}
export interface HealthResponse { status: string; model_loaded: boolean; version: string }
export interface ModelInfo {
  architecture?: string; framework?: string; tf_version?: string;
  num_classes?: number; class_names?: string[]; input_size?: number[];
  val_accuracy?: number; test_accuracy?: number; trained_on?: string;
  epochs_head?: number; epochs_fine?: number; date_trained?: string;
  [key: string]: unknown;
}
export interface DiseaseEntry {
  class_name: string; display_name: string; crop: string; disease: string;
  is_healthy: boolean; symptoms: string; treatment: string; prevention: string;
}
export interface DiseaseListResponse { count: number; diseases: DiseaseEntry[] }
```

### `src/lib/api.ts` (B)
```ts
export const API_BASE_URL: string;             // import.meta.env.VITE_API_BASE_URL ?? "https://plant-bara.onrender.com"
export class ApiRequestError extends Error { status: number }
export const api: {
  getHealth(signal?: AbortSignal): Promise<HealthResponse>;
  getModelInfo(signal?: AbortSignal): Promise<ModelInfo>;
  getDiseases(signal?: AbortSignal): Promise<DiseaseListResponse>;
  getDisease(className: string, signal?: AbortSignal): Promise<DiseaseEntry>;
  predict(file: File, topK?: number, signal?: AbortSignal): Promise<PredictResponse>;
};
```
`predict` uses `FormData` with field name `file` (multipart) and query `top_k` (default 3, clamp 1–38). Parse non-2xx JSON `{ detail }` into `ApiRequestError` with the HTTP status and a human message.

### `src/lib/format.ts` (B)
```ts
export function formatPercent(value: number): string;      // 0.9749 -> "97.5%"
export function formatMs(value: number): string;           // 12.4 -> "12 ms"
export function cropFromClass(className: string): string;  // "Tomato___Early_blight" -> "Tomato"
export function diseasePath(className: string): string;    // "/diseases/" + encodeURIComponent(className)
export function humanizeClass(className: string): string;  // fallback display name
```

### `src/lib/assets.ts` (B)
```ts
export const BRAND = {
  name: "PLANT BARA",
  short: "PLANT/BARA",
  tagline: "Field intelligence for every leaf.",
  description: "An apothecary of crop health: photograph a leaf, read the evidence, act with confidence.",
} as const;
export const IMAGES = {
  hero: string,        // dark outdoor field photograph URL
  process: string,     // greenhouse / greenhouse row photograph URL
  about: string,       // close-up leaf photograph URL
} as const;
```
Use stable `images.unsplash.com/photo-...?auto=format&fit=crop&w=...&q=80` URLs.

### Hooks (B) — all return plain objects, no context provider
```ts
useHealth():        { health: HealthResponse | null; loading: boolean; error: string | null; refresh: () => void }
useModelInfo():     { info: ModelInfo | null; loading: boolean; error: string | null }
useDiseases():      { diseases: DiseaseEntry[]; loading: boolean; error: string | null; refresh: () => void }
useDiseaseDetail(className: string | undefined):
                    { disease: DiseaseEntry | null; loading: boolean; error: string | null }
usePrediction():    { result: PredictResponse | null; loading: boolean; error: string | null;
                      previewUrl: string | null; submit: (file: File, topK?: number) => Promise<void>;
                      reset: () => void }
```
Every hook must handle unmount/abort cleanly, expose error strings (never throw to render), and call the live API at `API_BASE_URL`.

### UI components (C)
```ts
GhostButton({ children, to?, href?, onClick?, type?, disabled?, className?, arrow? }: GhostButtonProps)
  // renders <Link> when `to`, <a> when `href`, otherwise <button>. arrow defaults true.

SectionHeading({ eyebrow?, title, intro?, align?: "center" | "left" }: SectionHeadingProps)
FeatureList({ items: string[] }: { items: string[] })
ConfidenceMeter({ value, label? }: { value: number; label?: string })
StatusNote({ kind: "loading" | "error" | "empty", message: string }: StatusNoteProps)
InfoBlock({ label, children }: { label: string; children: React.ReactNode })

AnnouncementBar()          // alpine forest strip, centered lab-mono 12px
Header()                   // transparent → white on scroll, live status dot from useHealth
Footer()                   // linen band, hairline top border, lab-mono copyright
PageShell({ children }: { children: React.ReactNode })  // announcement + header + <main> + footer
```
All of C's components import their own CSS: `import "../styles/layout.css"` / `import "../styles/ui.css"` (only once each, in `Header.tsx` and `GhostButton.tsx` respectively is fine). Do **not** put CSS imports in `main.tsx`.

### Feature components (D)
```ts
Hero()                 // full-bleed photography, 70vh, oversized wordmark, ghost CTA to /scan
ScanPanel()            // drag/drop + file input + preview + top_k select + submit via usePrediction
ResultPanel({ result }: { result: PredictResponse })
HowItWorks()           // 3-step editorial rows
ModelStats()           // calls useModelInfo(); 97.49% / 38 classes / MobileNetV2 stats band
FeaturedDiseases()     // calls useDiseases(); 3 cards using DiseaseCard from E, links to /diseases
HomePage()
ScanPage()
```
D imports `DiseaseCard` from `../components/disease/DiseaseCard` (contract below). D owns `src/styles/home.css`, imported once in `HomePage.tsx`.

### Feature components (E)
```ts
DiseaseCard({ disease }: { disease: DiseaseEntry })   // parchment surface, diagonal lab-mono tag, name, link
DiseaseFilters({ query, onQueryChange, crop, onCropChange, onlyHealthy, onOnlyHealthyChange, crops, count }: DiseaseFiltersProps)
DiseasesPage()
DiseaseDetailPage()      // useParams()["className"], useDiseaseDetail(...)
AboutPage()              // useModelInfo() + BRAND/IMAGES
NotFoundPage()
App()                    // <Routes> only; BrowserRouter lives in main.tsx (A)
```
E owns `src/styles/diseases.css`, imported once in `DiseasesPage.tsx`.

---

## 5. Design rules (from `design.md` — non-negotiable)

- Surfaces: only `#ffffff` page canvas, `#f7f5ee` parchment showcase zones, `#ece9df` linen footer, `#205f4b` announcement bar. No grey backgrounds.
- Text `#000000`; secondary `#403e3c`; hairline 1px borders `#000000` / `#888783`.
- Bronze `#a77a41` **only** as a physical award/seal accent on product/result badges — never for buttons, links, hover states, or text.
- Every action is a **ghost pill**: 32px radius, 1px black border, transparent fill, uppercase practice 600 16px, 0.04em tracking, trailing arrow. No filled coloured CTA.
- Uppercase labels: 0.10em tracking, lab-mono 12px or practice 14px.
- Body copy: left-aligned, max-width 640–720px, 16–18px, -0.02em tracking. Centred text is only for editorial headers and the announcement bar.
- Display type: Cormorant Garamond 300 with tight tracking; practice 600 (never above 600).
- Section gap 96px; page max-width 1400px; card padding 32px; element gap 24px.
- Product/result emphasis uses generous whitespace and a soft diffuse shadow (`0 8px 20px rgba(0,0,0,0.08)`) only on image-like elements. No card drop shadows.
- Diagonal `-10deg` lab-mono tag for NEW / HEALTHY / DISEASE annotations.
- Full-bleed photography with **no gradient or colour overlay**. Use dark image + white type directly.
- Section rhythm: alternate full-bleed image band → centred editorial block → two-column split → three-column row. Never repeat the same layout twice in a row.
- Responsive: mobile-first breakpoints at 640 / 900 / 1200px; nav collapses to a labelled row; grids become 1 column.

---

## 6. Integration & verification (after all agents finish)

1. `npm install` in `plant_frontend/`
2. `npx tsc --noEmit` — fix type/import seams
3. `npm run build` — production bundle
4. `npm run dev -- --host 127.0.0.1` — smoke test in browser: `/`, `/scan` (upload a leaf image), `/diseases`, `/diseases/Tomato___Late_blight`, `/about`
5. Confirm every request targets `https://plant-bara.onrender.com/` (override locally with `VITE_API_BASE_URL`)
6. Run `npm run build` again after any seam fixes

---

## 7. Agent work distribution summary

| Agent | Scope | Files | Depends on |
|-------|-------|-------|------------|
| A `scaffold` | build config, tokens, entry | 11 | none |
| B `data-layer` | API client, hooks, formatting, assets | 9 | A (`vite-env.d.ts`) |
| C `ui-layout` | design-system components, chrome | 12 | B (hooks/types), A (tokens) |
| D `home-scan` | landing + scanner + result | 9 | B, C, E (`DiseaseCard`) |
| E `library-routing` | library, detail, about, 404, router | 8 | B, C |

All five run in parallel; each writes only its own files. Integration happens centrally after they finish.
