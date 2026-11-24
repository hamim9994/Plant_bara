# OpenCode API QA — Plant BARA Frontend

**Date:** 2026-11-24  
**Scope:** Read-only QA review of `D:\Hamim\project\Plant_bara\plant_frontend` against live backend `https://plant-bara.onrender.com` and backend contracts in `../plant_backend/app/schemas.py`, `../plant_backend/app/api/routes.py`.  
**Constraints honored:** No edits to `src/`, `package.json`, configs, or application files. Only `qa/opencode-api-qa.md` and temp files under `$env:TEMP` were written.

## Verdict

**PASS** (with minor non-blocking notes)

Live API endpoints returned expected data, the frontend client uses the real API base URL and required request shapes, no mock/hardcoded disease data was found in source, the production bundle contains the production backend URL, and local SPA routes returned 200.

## Endpoint Table (Real HTTP Tests)

| Method | Path | Status | Key fields observed |
|---|---|---:|---|
| GET | `/api/v1/health` | 200 | `status="ok"`, `model_loaded=true`, `version="1.0.0"` |
| GET | `/api/v1/model/info` | 200 | `architecture="MobileNetV2"`, `framework="tensorflow.keras"`, `num_classes=38`, `test_accuracy=0.9749285648446862`, `val_accuracy=0.9749285578727722`, `input_size=[224,224]`, `class_names` length 38 |
| GET | `/api/v1/diseases` | 200 | `count=38`, `diseases` length 38; spot-checked all entries have `class_name`, `display_name`, `crop`, `disease`, `is_healthy`, `symptoms`, `treatment`, `prevention` |
| GET | `/api/v1/diseases/Tomato___Late_blight` | 200 | `class_name="Tomato___Late_blight"`, `display_name="Tomato �?? Late blight"`, `crop="Tomato"`, `disease="Late_blight"`, `is_healthy=false`, symptoms/treatment/prevention present |
| POST | `/api/v1/predict?top_k=3` | 200 | multipart field `file` (224x224 JPEG generated via PIL in backend venv); `success=true`, `prediction.class_name="Tomato___Septoria_leaf_spot"`, `prediction.confidence=0.5711235853307449`, `alternatives` length 2, `processing_time_ms=722.82`, `model.architecture="MobileNetV2"` |
| POST | `/api/v1/predict?top_k=3` (negative) | 400 | uploaded `bad.txt` as `text/plain`; response `{"detail":"Unsupported content type: text/plain"}` |

## Contract Check (Backend Schemas vs Frontend Types/Usages)

| Area | Backend (`schemas.py`/`routes.py`) | Frontend (`src/lib/types.ts`, `src/lib/api.ts`, hooks) | Result |
|---|---|---|---|
| Health | `HealthResponse{status:str, model_loaded:bool, version:str}` | `HealthResponse` matches; `useHealth` calls `api.getHealth()` | Match |
| Model info | `ModelInfoResponse` with `extra="allow"` | `ModelInfo` has optional known fields + `[key:string]:unknown`; `useModelInfo` calls `api.getModelInfo()` | Match (permissive) |
| Disease detail | `DiseaseDetail` has required class/display/crop/disease/is_healthy/symptoms/treatment/prevention | `DiseaseEntry` matches; `useDiseaseDetail` calls `api.getDisease(className)` | Match |
| Disease list | `DiseaseListResponse{count:int, diseases:list[dict[str,Any]]}` | `DiseaseListResponse{count:number, diseases:DiseaseEntry[]}`; `useDiseases` uses `data.diseases` | Compatible/runtime match; backend schema is looser than frontend type |
| Predict request | `POST /predict`, `file` UploadFile, `top_k` query `ge=1 le=settings.max_top_k`, default from settings | `api.predict` sends `FormData` with `file`, clamps `top_k` to 1-38, default 3, URL `/api/v1/predict?top_k=...` | Match |
| Predict response | `PredictResponse{success,prediction,alternatives,model,processing_time_ms}`; prediction/alternatives fields match | `PredictResponse`, `PredictionResult`, `PredictionItem` match observed payload | Match |
| Error detail | FastAPI HTTPException/detail, validation detail shapes | `ApiRequestError` parses string detail, array validation detail, and detail.message; hooks expose error strings | Match/defensive |

**Contract mismatches found:** No blocking mismatches. Minor note: backend declares `DiseaseListResponse.diseases` as `list[dict[str, Any]]` while frontend types it as `DiseaseEntry[]`; live payload conforms to `DiseaseEntry` shape, so this is a schema looseness rather than a runtime mismatch.

## Client Source Verification

- **Single API base URL default:** `src/lib/api.ts` defines `DEFAULT_BASE_URL = "https://plant-bara.onrender.com/"`, reads `VITE_API_BASE_URL` defensively, exports `API_BASE_URL` with trailing slash trimmed. No other API base URL/default found in `src/lib` or `src/hooks`.
- **All five endpoints used:** `api.getHealth` -> `/api/v1/health`; `api.getModelInfo` -> `/api/v1/model/info`; `api.getDiseases` -> `/api/v1/diseases`; `api.getDisease` -> `/api/v1/diseases/${encodeURIComponent(className)}`; `api.predict` -> `/api/v1/predict?top_k=${clampTopK(topK)}`.
- **No mock/hardcoded disease data:** `rg` search for `mock|fixture|sample|hardcoded|dummy` in `src/lib src/hooks src/pages src/components` returned no matches. Hooks call live API through `src/lib/api.ts`.
- **`encodeURIComponent` on detail path:** confirmed in `api.getDisease` (`/api/v1/diseases/${encodeURIComponent(className)}`).
- **`top_k` clamped 1–38:** `MIN_TOP_K=1`, `MAX_TOP_K=38`, `DEFAULT_TOP_K=3`, `clampTopK` uses `Math.min(MAX_TOP_K, Math.max(MIN_TOP_K, Math.trunc(topK)))` and handles non-finite values.
- **Multipart field name `file`:** `body.append("file", file)` in `api.predict`.

## Build / SPA Verification

- **Production bundle contains production API URL:** `dist/assets/index-HbIdOomT.js` contains `https://plant-bara.onrender.com/` (confirmed via `Select-String` and content inspection). Existing build was inspected as requested; no rebuild performed.
- **SPA routes on local dev server (`http://127.0.0.1:5173`)**:
  - `/` -> 200
  - `/scan` -> 200
  - `/diseases` -> 200
  - `/about` -> 200

## Mock-Data Evidence

No mock, fixture, sample, hardcoded, or dummy disease data patterns were found in frontend source (`src/lib`, `src/hooks`, `src/pages`, `src/components`). Data flow is through `src/lib/api.ts` to live `/api/v1/*` endpoints, consumed by hooks (`useHealth`, `useModelInfo`, `useDiseases`, `useDiseaseDetail`, `usePrediction`).

## Risks / Follow-ups

- **Non-blocking schema looseness:** Backend `DiseaseListResponse.diseases` is typed as `list[dict[str, Any]]`; frontend expects `DiseaseEntry[]`. Runtime payload matches, but tightening backend schema to `list[DiseaseDetail]` would improve contract clarity.
- **Display-name encoding artifact:** Live responses include `�??` / `�` in some `display_name` strings (e.g., `Tomato �?? Late blight`). This appears to be backend/data encoding behavior; frontend renders returned strings as-is.
- **Predict test used synthetic image:** A generated 224x224 green JPEG was used for the required real HTTP predict test. The endpoint returned a valid `200` prediction payload; confidence/content is not meaningful for diagnosis quality.
- **External dependency:** QA relied on live Render backend availability and existing local Vite dev server. Outbound network was available in this environment; no blocked-network limitation was encountered.

## Temp Files Created

- `$env:TEMP\opencode-plantbara-test.jpg` — small valid JPEG for predict test
- `$env:TEMP\opencode-plantbara-bad.txt` — invalid-type negative predict test
