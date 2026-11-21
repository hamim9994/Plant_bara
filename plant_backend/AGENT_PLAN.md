# Agent Plan — Phase 2 Backend (AI Crop Disease Detection)

## Situation
- `plan.md` describes the target: FastAPI + TensorFlow MobileNetV2 (38 classes) backend.
- Phase 1 artifacts exist in `phase1_artifacts/` (model, class names, disease info, metadata).
- There is **no backend Python code yet**, despite `plan.md` saying "basic FastAPI structure created".
- Available agent runtimes detected: `codex`, `agy`, `opencode` (CLI) plus in-harness `explore` / `general` subagents.
- Execution strategy: use the in-harness `general` agents in parallel, with disjoint file ownership, then integrate and verify locally.

## Target folder structure
```
plant_backend/
├── app/
│   ├── __init__.py
│   ├── config.py               # settings / paths / env vars
│   ├── schemas.py              # Pydantic request/response models
│   ├── main.py                 # FastAPI app, lifespan, CORS, root route
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py           # all /api/v1 endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── model_service.py    # load model, preprocess image, top-k predict
│   │   └── disease_service.py  # load JSON, normalize + lookup disease info
│   └── utils/
│       ├── __init__.py
│       └── image.py            # upload validation + PIL decode
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_health.py
│   ├── test_predict.py
│   └── test_disease_service.py
├── phase1_artifacts/            # existing ML artifacts (read-only except disease_info.json)
├── .env.example
├── requirements.txt
├── README.md
└── AGENT_PLAN.md
```

## API contract
| Method | Path | Purpose |
|---|---|---|
| GET | `/` | welcome JSON + docs link |
| GET | `/api/v1/health` | status, model_loaded flag |
| GET | `/api/v1/model/info` | architecture, input size, accuracy, training metadata |
| POST | `/api/v1/predict` | multipart `file` upload, `top_k` query (1..38), returns top prediction + info + alternatives |
| GET | `/api/v1/diseases` | list all 38 classes with display names |
| GET | `/api/v1/diseases/{class_name:path}` | detail for one class |

Errors: 400 invalid/oversized/non-image upload, 404 unknown class, 503 model not loaded.

## Agent assignments (parallel, disjoint files)

### Agent A — `services-core`
Owns: `app/__init__.py`, `app/config.py`, `app/services/__init__.py`, `app/services/model_service.py`, `app/services/disease_service.py`, `app/utils/__init__.py`, `app/utils/image.py`.

Must expose these stable interfaces:
- `app.config.settings` + `get_settings()`; attributes: `model_path`, `class_names_path`, `disease_info_path`, `model_meta_path`, `input_size` (tuple 224,224), `max_upload_bytes`, `allowed_content_types`, `default_top_k`, `max_top_k`.
- `app.services.disease_service.DiseaseService` with `class_names` property, `get_info(class_name) -> dict | None`, `list_diseases() -> list[dict]`, `get_display_name(class_name) -> str`, and module singleton `disease_service`.
  - Normalized info keys: `class_name`, `display_name`, `crop`, `disease`, `is_healthy`, `symptoms`, `treatment`, `prevention`.
- `app.services.model_service.ModelService` with `load()`, `is_loaded`, `predict(image, top_k) -> list[{"class_name": str, "confidence": float}]`, `get_model_info() -> dict`, and module singleton `model_service`.
  - Lazy-import TensorFlow inside `load()`; `load_model(..., compile=False)`; `mobilenet_v2.preprocess_input`; thread lock around predict.
- `app.utils.image.InvalidImageError`, `validate_upload(file, settings_obj=None)`, `decode_image(data)`, `async read_upload(file, settings_obj=None) -> PIL.Image.Image`.

### Agent B — `api-layer`
Owns: `app/schemas.py`, `app/api/__init__.py`, `app/api/routes.py`, `app/main.py`.

Must expose:
- `app.main.app` (FastAPI) with CORS and lifespan that calls `model_service.load()` inside try/except (never crash startup on model failure).
- `app.api.routes.router` with prefix `/api/v1`, dependency providers `get_model_service()` and `get_disease_service()` (so tests can override).
- Pydantic models: `PredictionItem`, `PredictionResult`, `PredictResponse`, `HealthResponse`, `ModelInfoResponse`, `DiseaseDetail`, `DiseaseListResponse`.

### Agent C — `tests-docs`
Owns: `tests/*`, `README.md`, `.env.example`, `requirements.txt`.

Must: use `TestClient(app)` **without** context manager (avoid real model load in tests), override `get_model_service` with a fake, cover health, predict success, bad upload, disease lookup; document setup/run in README; add `fastapi`, `uvicorn`, `python-multipart`, `pytest`, `httpx` to requirements.

### Agent D — `disease-content`
Owns: `phase1_artifacts/disease_info.json` only.

Must: keep all 38 existing keys and structure; fill `symptoms`, `treatment`, `prevention` with concise, practical, plain-text agronomic advice (currently all empty). Do not change other JSON files.

## Integration checklist (after agents finish)
1. `python -m compileall -q app tests`
2. `python -m pytest -q`
3. Start server: `uvicorn app.main:app --host 127.0.0.1 --port 8000`
4. Smoke test `/api/v1/health`, `/api/v1/model/info`, `/api/v1/diseases`, and a real `/api/v1/predict` with a sample leaf image.
5. Fix any mismatches found at the seams.
