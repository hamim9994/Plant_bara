# AGENTS.md

This repository holds two independently run apps. There is no root manifest, CI, or shared task runner.

- `plant_backend/` — FastAPI + TensorFlow Keras crop-disease API (Python 3.10+).
- `plant_frontend/` — Vite + React 18 + TypeScript SPA. The root `design.md` is its visual source of truth.

Each app's `README.md` has setup detail; the notes below are the non-obvious parts.

## Backend — `plant_backend/`

```powershell
cd plant_backend
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- Use the local `.venv` directly; PowerShell activation may be blocked by policy. `start.bat` is the one-click launcher: it creates the venv, installs only when the `requirements.txt` hash changes, and serves on port 8000 without `--reload`.
- Tests are fast and never load TensorFlow or the model. `tests/conftest.py` builds `TestClient` without a `with` block so the lifespan does not run; preserve that pattern.
- Run one file with `.\.venv\Scripts\python.exe -m pytest tests\test_predict.py -q` (add `-k <name>` to narrow further).
- Runtime model is `phase1_artifacts/best_model.keras`; startup can take 10–20 s. If it is missing the API still starts, but `/api/v1/predict` returns 503 and health reports `model_loaded: false`. The root `best_plant_model.keras` is not referenced.
- `app/config.py` reads env vars once at import into a frozen settings object. The `ml_dtypes==0.5.4` pin is intentional for Windows Application Control.
- Predict accepts multipart field `file` plus `top_k` (1–38); disease detail uses the `{class_name:path}` route converter.

## Frontend — `plant_frontend/`

```powershell
cd plant_frontend
npm run dev        # http://127.0.0.1:5173
npm run typecheck
npm run build      # runs tsc --noEmit before vite build
```

- There is no lint or unit-test setup; `typecheck` and `build` are the static gates.
- The API base defaults to deployed `https://plant-bara.onrender.com/`. There is no Vite proxy, so local backend testing requires `VITE_API_BASE_URL=http://127.0.0.1:8000/` in `plant_frontend/.env`. The Render free tier can cold-start.
- QA harnesses require the dev server on `127.0.0.1:5173` and hardcode Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe` (edit the constant if Chrome lives elsewhere):
  - `qa/capture-cdp.mjs` captures six routes at 1440×900 and 390×844 into `%TEMP%\plant-qa-cdp`.
  - `qa/e2e-predict.mjs` needs a JPEG at `%TEMP%\opencode-plantbara-test.jpg`, uploads it through the real UI, and calls the live backend.
- Do not trust headless Chrome `--window-size` below ~500 px on Windows; the OS clamps it. Use CDP device emulation as `capture-cdp.mjs` does.
- Keep copy UTF-8. Editing punctuation through PowerShell/agent CLIs has produced mojibake (`â€”`, `â€¦`); after copy changes run `rg -n "â|Ã|Â|�" src` and expect no matches.
- Follow `design.md`; `FRONTEND_PLAN.md` §5 summarizes the rules. Non-negotiables: ghost pill buttons, no gradients or heavy card shadows, bronze only for the seal accent, and the 88 px hero lockup in practice 600.
- Raw classes look like `Crop___Disease`; use the helpers in `src/lib/format.ts` (`humanizeClass`, etc.) instead of showing raw keys.
