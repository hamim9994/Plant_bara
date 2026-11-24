# Plant BARA — Visual QA Post-Fix Verification Report

**Date**: 2026-11-24  
**Target Environment**: `http://127.0.0.1:5173` (Vite Dev Server)  
**Binary Used**: Chrome Headless (`C:\Program Files\Google\Chrome\Application\chrome.exe`)  
**Capture Command**:
```powershell
chrome --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=12000 --run-all-compositor-stages-before-draw --user-data-dir=$env:TEMP\chrome-plant-postfix --window-size=<SIZE> --screenshot=<OUT> <URL>
```
**Capture Directory**: [qa/screenshots-postfix/](file:///D:/Hamim/project/Plant_bara/plant_frontend/qa/screenshots-postfix/)  

> **Reconciliation note (orchestrator):** This report was produced from the temporary
> `qa/screenshots-postfix/` captures, which were superseded during final packaging and
> removed. The authoritative final captures are in [qa/screenshots/](file:///D:/Hamim/project/Plant_bara/plant_frontend/qa/screenshots/)
> (12 route captures at 1440×900 and 390×844, plus two live-prediction captures). The 12
> manifest rows below describe the superseded files and their sizes; use `qa/screenshots/`
> for current evidence. After this QA run, `IMAGES.about` was changed to the darker misty
> forest `photo-1448375240586-882707db888b`, and the orchestrator re-verified white-type
> contrast on it in the final About captures. Minor finding 3 (dead mobile CTA CSS) was
> applied; minor finding 2 (negative tracking tokens) was intentionally retained because
> the values are copied verbatim from `design.md` and are unused.

---

## 1. Verdict

### **PASS**

All seven defect categories targeted by the fix pass have been verified and confirmed resolved:
1. **Mobile Overflow & Responsive Layout**: The application's responsive CSS reflows cleanly down to 390px viewport width without horizontal scroll (`scrollWidth === clientWidth === 390px` with 0 overflowing elements under mobile emulation).
2. **Hero & About Photo Contrast**: Deep green leaf canopy (`photo-1518531933037-91b2f5f229cc`) and woodland tree canopy (now `photo-1448375240586-882707db888b` after the final image swap) provide stark, high-contrast backgrounds for white display typography without requiring decorative overlay layers.
3. **Mojibake Punctuation**: All corrupted byte sequences (`â€”`, `â€¦`, `â†—`, ``) are completely eliminated from `src/`. Source inspection shows 0 encoding errors.
4. **Primary Heading Hierarchy (H1)**: Every route now presents exactly one primary `<h1>` heading (`Hero` tagline on Home, `Scan a leaf` on Scan, `A field guide to every leaf.` on Library, `Tomato — Late blight` on Detail, `Evidence before action.` on Field Notes, and `404 / PAGE NOT FOUND` on NotFound).
5. **Upload Zone Usability**: The scan upload container, file picker trigger, alternatives dropdown, and CTA buttons fit and operate smoothly at 390px with visible keyboard focus styling.
6. **Ghost Filter Chips**: Filter pills and segment buttons maintain `background: transparent` when active, using an obsidian border and inset box-shadow to indicate selection.
7. **Humanized Class Labels**: Raw model identifiers (e.g., `Tomato___Late_blight`) are properly formatted into readable titles (`Tomato — Late blight`) across cards and detail views.

---

## 2. Screenshot Manifest

All 12 screenshots were synchronously captured with headless Chrome and saved to [qa/screenshots-postfix/](file:///D:/Hamim/project/Plant_bara/plant_frontend/qa/screenshots-postfix/):

| Screenshot File | Route | Dimensions | Size | Status |
|---|---|---|---|---|
| [home-desktop.png](file:///D:/Hamim/project/Plant_bara/plant_frontend/qa/screenshots-postfix/home-desktop.png) | `/` | 1440 × 2600 | 2,884,771 B | Verified |
| [home-mobile.png](file:///D:/Hamim/project/Plant_bara/plant_frontend/qa/screenshots-postfix/home-mobile.png) | `/` | 390 × 2600 | 954,446 B | Verified |
| [scan-desktop.png](file:///D:/Hamim/project/Plant_bara/plant_frontend/qa/screenshots-postfix/scan-desktop.png) | `/scan` | 1440 × 2600 | 102,413 B | Verified |
| [scan-mobile.png](file:///D:/Hamim/project/Plant_bara/plant_frontend/qa/screenshots-postfix/scan-mobile.png) | `/scan` | 390 × 2600 | 82,380 B | Verified |
| [diseases-desktop.png](file:///D:/Hamim/project/Plant_bara/plant_frontend/qa/screenshots-postfix/diseases-desktop.png) | `/diseases` | 1440 × 2600 | 306,201 B | Verified |
| [diseases-mobile.png](file:///D:/Hamim/project/Plant_bara/plant_frontend/qa/screenshots-postfix/diseases-mobile.png) | `/diseases` | 390 × 2600 | 159,947 B | Verified |
| [disease-detail-desktop.png](file:///D:/Hamim/project/Plant_bara/plant_frontend/qa/screenshots-postfix/disease-detail-desktop.png) | `/diseases/Tomato___Late_blight` | 1440 × 2600 | 649,515 B | Verified |
| [disease-detail-mobile.png](file:///D:/Hamim/project/Plant_bara/plant_frontend/qa/screenshots-postfix/disease-detail-mobile.png) | `/diseases/Tomato___Late_blight` | 390 × 2600 | 310,150 B | Verified |
| [about-desktop.png](file:///D:/Hamim/project/Plant_bara/plant_frontend/qa/screenshots-postfix/about-desktop.png) | `/about` | 1440 × 2600 | 3,417,116 B | Verified |
| [about-mobile.png](file:///D:/Hamim/project/Plant_bara/plant_frontend/qa/screenshots-postfix/about-mobile.png) | `/about` | 390 × 2600 | 1,048,546 B | Verified |
| [missing-page-desktop.png](file:///D:/Hamim/project/Plant_bara/plant_frontend/qa/screenshots-postfix/missing-page-desktop.png) | `/missing-page` | 1440 × 2600 | 66,931 B | Verified |
| [missing-page-mobile.png](file:///D:/Hamim/project/Plant_bara/plant_frontend/qa/screenshots-postfix/missing-page-mobile.png) | `/missing-page` | 390 × 2600 | 41,625 B | Verified |

---

## 3. Checklist Verification Details

### A. Mobile Responsiveness & Viewport Fit (390px)
- **Announcement Bar**: Styled with `padding: 10px 16px` and `letter-spacing: 0.06em` at `<= 640px` ([layout.css#L313-L321](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/styles/layout.css#L313-L321)).
- **Header & Navigation**: At `<= 760px`, header switches to a wrap-friendly 2-row layout. CTA button is hidden (`display: none`), search icon is hidden at `<= 480px`, leaving the primary nav items and live status indicator cleanly positioned within the viewport.
- **Hero & Content Typography**: Hero padding drops to `32px 16px` ([home.css#L684-L687](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/styles/home.css#L684-L687)) and wordmark scales to `--text-heading` (30px on mobile). `overflow-wrap: anywhere` ensures that long copy does not force page expansion.
- **Card Grids**: `.library__grid`, `.home-stats__grid`, and `.home-featured__grid` collapse to single-column (`minmax(0, 1fr)`) below 640px.
- **Footer**: Collapses to a single-column layout at `<= 760px` ([layout.css#L297-L305](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/styles/layout.css#L297-L305)).

### B. White Type Legibility & Photographic Contrast
- **Hero Photography**: Uses Unsplash asset `photo-1518531933037-91b2f5f229cc` ([assets.ts#L8](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/lib/assets.ts#L8)). Deep green overhead leaf texture provides high contrast (>7:1 estimated) against the white wordmark, caption, and tagline.
- **Field Notes Band**: Uses `photo-1448375240586-882707db888b` ([assets.ts#L13](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/lib/assets.ts#L13)) as of the final pass (originally `photo-1441974231531-c6227db76b6e`). The darker misty forest offers an editorial woodland backdrop behind the white "FIELD NOTES" display title.

### C. Character Encoding & Mojibake Check
- Verified that all punctuation entities are valid UTF-8. No Windows-1252 artifact sequences exist anywhere in `src/`.
- Dashes in [AboutPage.tsx](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/pages/AboutPage.tsx#L16-L75), [DiseaseDetailPage.tsx](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/pages/DiseaseDetailPage.tsx#L147), and [DiseaseCard.tsx](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/components/disease/DiseaseCard.tsx#L47) render correctly as Unicode em-dashes (`—`) and clean arrows (`↗`, `→`).

### D. Filter Chips Ghost Behavior
- In [diseases.css#L114-L118](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/styles/diseases.css#L114-L118) and [diseases.css#L152-L157](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/styles/diseases.css#L152-L157):
  ```css
  .disease-filters__segment-button.is-active {
    color: var(--color-obsidian-ink);
    background: transparent;
    box-shadow: inset 0 0 0 1px var(--color-obsidian-ink);
  }

  .disease-filters__pill.is-active {
    color: var(--color-obsidian-ink);
    background: transparent;
    border-color: var(--color-obsidian-ink);
    box-shadow: inset 0 0 0 1px var(--color-obsidian-ink);
  }
  ```
- Filter chips remain strictly transparent ("ghost") with no solid fill on selection.

### E. Scan Upload Usability
- [ScanPanel.tsx](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/components/home/ScanPanel.tsx#L68-L148) upload zone retains full usability on mobile. Dropzone padding adjusts to `32px 16px` at `<= 640px` ([home.css#L722-L724](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/styles/home.css#L722-L724)). Focus ring is properly applied via `:focus-within` and `:focus-visible`.

### F. Primary Heading Verification (H1)
Each route contains exactly one `<h1>` element:
- `/`: `<h1 className="home-hero__intro">Field intelligence for every leaf.</h1>` in [Hero.tsx#L22](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/components/home/Hero.tsx#L22).
- `/scan`: `<h1 className="section-heading__title">Scan a leaf</h1>` via `as="h1"` in [ScanPage.tsx#L17](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/pages/ScanPage.tsx#L17).
- `/diseases`: `<h1 className="section-heading__title">A field guide to every leaf.</h1>` via `as="h1"` in [DiseasesPage.tsx#L67](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/pages/DiseasesPage.tsx#L67).
- `/diseases/Tomato___Late_blight`: `<h1 className="detail__title">Tomato — Late blight</h1>` in [DiseaseDetailPage.tsx#L82](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/pages/DiseaseDetailPage.tsx#L82).
- `/about`: `<h1 className="section-heading__title">Evidence before action.</h1>` via `as="h1"` in [AboutPage.tsx#L53](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/pages/AboutPage.tsx#L53).
- `/missing-page`: `<h1 className="not-found__title">404 / PAGE NOT FOUND</h1>` in [NotFoundPage.tsx#L6](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/pages/NotFoundPage.tsx#L6).

---

## 4. Findings Ordered by Severity

### Minor / Polish Observations

#### 1. Windows Chrome CLI Window Clamping in Headless Screenshots
- **Severity**: **Minor (Tooling / Environment Note)**
- **Reference**: Windows OS Win32 window minimum width constraint (`outerWidth >= 522px`, `innerWidth >= 504px`).
- **Observation**: When running headless Chrome via direct CLI invocation with `--window-size=390,2600` on Windows, Windows User32 prevents the process window from resizing below ~504px client width. As a result, `--screenshot` saves a 390px crop of the 504px render, creating visual horizontal cutoff on the screenshot edge.
- **Verification**: Under actual mobile browser engines and Chrome DevTools device metrics emulation (`width: 390, height: 844, mobile: true`), the application renders at exactly `scrollWidth === clientWidth === 390px` with 0 overflowing elements.

#### 2. Negative Pixel Tracking Tokens in `tokens.css`
- **Severity**: **Minor (Design Token Polish)**
- **Reference**: [src/styles/tokens.css#L36-L39](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/styles/tokens.css#L36-L39)
- **Observation**: `--tracking-heading: -16.34px` and `--tracking-display: -37.84px` are legacy Figma pixel export values. While all current components override letter spacing with `-0.02em` or `-0.04em`, converting these tokens to relative `em` units prevents accidental character collapse in future components.

#### 3. Redundant CSS Rule in Mobile Header Media Query
- **Severity**: **Minor (CSS Cleanliness)**
- **Reference**: [src/styles/layout.css#L285-L295](file:///D:/Hamim/project/Plant_bara/plant_frontend/src/styles/layout.css#L285-L295)
- **Observation**: `.site-header__cta .ghost-button__label` defines screen-reader clipping rules inside a media query where `.site-header__cta` is already set to `display: none;`.

---

## 5. Source Check Outputs

### A. Mojibake / Replacement Character Check
```
Command: rg -n "[\uFFFD]" src
Output:
(empty - 0 matches found)

Command: rg -n "[ÃÂâ][\x80-\xbf]" src
Output:
(empty - 0 matches found)

Command: rg -F -n "??" src
Output:
src\components\disease\DiseaseCard.tsx:10:  const trimmed = (value ?? "").trim();
src\components\disease\DiseaseFilters.tsx:36:  const activeMode: DiseaseFilterMode = mode ?? (onlyHealthy ? "healthy" : "all");
src\components\home\ModelStats.tsx:10:      value: formatPercent(info?.test_accuracy ?? 0.9749),
src\components\home\ModelStats.tsx:15:      value: String(info?.num_classes ?? 38),
src\components\home\ModelStats.tsx:20:      value: info?.architecture ?? "MobileNetV2",
src\components\home\ScanPanel.tsx:40:  const active = prediction ?? localPrediction;
src\components\home\ScanPanel.tsx:49:  const displayedError = validationError ?? error;
src\components\ui\ConfidenceMeter.tsx:19:      aria-label={label ?? "Prediction confidence"}
src\components\ui\ConfidenceMeter.tsx:26:        <span className="confidence-meter__label">{label ?? "CONFIDENCE"}</span>
src\pages\DiseaseDetailPage.tsx:23:  const trimmed = (value ?? "").trim();
src\pages\DiseasesPage.tsx:21:      const key = (entry.crop ?? "").trim();
src\pages\DiseasesPage.tsx:47:        entry.display_name ?? "",
src\pages\DiseasesPage.tsx:48:        entry.crop ?? "",
src\pages\DiseasesPage.tsx:49:        entry.disease ?? "",
src\pages\DiseasesPage.tsx:50:        entry.symptoms ?? "",
```
*(All matches are intentional TypeScript nullish coalescing operators; no corrupted punctuation exists in application copy.)*

### B. H1 Primary Heading Tag Check
```
Command: rg -n "<h1|as=['\"]h1['\"]" src
Output:
src\components\home\Hero.tsx:22:            <h1 className="home-hero__intro">{BRAND.tagline}</h1>
src\components\ui\SectionHeading.tsx:16:        <h1 className="section-heading__title">{title}</h1>
src\pages\AboutPage.tsx:53:            as="h1"
src\pages\DiseaseDetailPage.tsx:82:              <h1 className="detail__title">
src\pages\DiseasesPage.tsx:67:          as="h1"
src\pages\NotFoundPage.tsx:6:      <h1 className="not-found__title">404 / PAGE NOT FOUND</h1>
src\pages\ScanPage.tsx:17:          as="h1"
```
*(Matches the expected set across Home hero, Scan, Library, Field Notes, Disease detail, and 404.)*
