You are the API-contract QA reviewer for the Plant BARA frontend at D:\Hamim\project\Plant_bara\plant_frontend.

The live backend is https://plant-bara.onrender.com . A Vite dev server is already running at http://127.0.0.1:5173 — do not start another.

Read:
- FRONTEND_PLAN.md (contracts)
- ../plant_backend/app/schemas.py
- ../plant_backend/app/api/routes.py
- src/lib/api.ts, src/lib/types.ts, src/hooks/*.ts

Run REAL HTTP tests with curl.exe or PowerShell Invoke-RestMethod:
1. GET /api/v1/health — record status, model_loaded, version
2. GET /api/v1/model/info — record architecture, num_classes, test_accuracy
3. GET /api/v1/diseases — record count and that all entries contain symptoms/treatment/prevention
4. GET /api/v1/diseases/Tomato___Late_blight — record display_name, crop, is_healthy
5. POST /api/v1/predict?top_k=3 — generate a small valid JPEG (you may use D:\Hamim\project\Plant_bara\plant_backend\.venv\Scripts\python.exe with PIL), upload it as multipart field `file`, and record success, prediction.class_name, confidence, alternatives length, processing_time_ms
6. Negative check: predict with a text file or invalid type should return 400 (do not spam the server; one request)
7. Verify the client source: single API_BASE_URL default, all five endpoints used, no mock/hardcoded disease data, encodeURIComponent on detail path, top_k clamped 1–38, multipart field name `file`
8. Verify the production bundle contains https://plant-bara.onrender.com (check dist/assets/*.js after a build; a build already exists)
9. Verify SPA routes /, /scan, /diseases, /about return 200 from the local dev server

STRICT: do NOT edit src/, package.json, configs, or any application file. You may write ONLY:
- qa/opencode-api-qa.md
- temporary files under $env:TEMP

Report:
1. Verdict: PASS or NEEDS FIXES
2. Endpoint table: method, path, status, key fields observed
3. Contract mismatches between backend schemas and frontend types/usages (if any)
4. Evidence that no mock data is used
5. Any risks or follow-ups

If outbound network is blocked in your environment, state it explicitly and still complete all local checks. Write the report to qa/opencode-api-qa.md and print a short summary.
