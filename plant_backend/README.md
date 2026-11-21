# AI Crop Disease Detection Backend

FastAPI backend for a crop-disease detection and smart-farming dashboard. A farmer uploads a leaf photo; the service preprocesses it, runs a fine-tuned **MobileNetV2** trained on **38 PlantVillage classes**, and returns the top prediction plus plain-language symptoms, treatment and prevention advice.

The trained model used at runtime is **`phase1_artifacts/best_model.keras`** (97.49% test accuracy). The API never requires a database: class names and disease information are read from JSON files in `phase1_artifacts/`.

## Features

- Multipart `POST /api/v1/predict` with configurable `top_k` (1–38).
- Normalized disease details for every class (crop, disease, healthy flag, symptoms, treatment, prevention).
- Upload validation: content type, decoded image and size are checked before inference.
- CORS configured for a local frontend, plus health and model-information endpoints.
- Graceful startup: if the model cannot be loaded, the app still runs. `/api/v1/health` reports `"model_loaded": false` and `/api/v1/predict` returns **503** until the model is available.

## Folder structure

```
plant_backend/
├── app/
│   ├── __init__.py
│   ├── config.py               # settings from environment variables
│   ├── schemas.py              # Pydantic request/response models
│   ├── main.py                 # app, CORS, lifespan (loads the model)
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py           # /api/v1 endpoints and DI providers
│   ├── services/
│   │   ├── __init__.py
│   │   ├── model_service.py    # image preprocessing + top-k prediction
│   │   └── disease_service.py  # disease-info lookup/normalization
│   └── utils/
│       ├── __init__.py
│       └── image.py            # upload validation and PIL decoding
├── tests/                      # fast, hermetic tests (faked services)
├── phase1_artifacts/           # trained model + class/disease metadata
├── .env.example                # documented environment variables
├── start.bat                   # one-click Windows launcher
├── requirements.txt
├── README.md
├── AGENT_PLAN.md               # backend implementation plan
└── START_BAT_PLAN.md           # launcher design notes
```

## Quick start — run the backend from scratch

### Windows shortcut (recommended)

Just double-click **`start.bat`**. It checks the requirements, installs them only if missing or changed, then starts the API at <http://127.0.0.1:8000/docs>. Keep the window open while using the API and press `Ctrl+C` to stop. See `START_BAT_PLAN.md` for the exact flow.

### Manual steps

Open **PowerShell** in the project folder (`D:\Hamim\project\plant_backend`) and follow these steps in order.

### 1. Create and activate the virtual environment (once)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If activation is blocked by your execution policy, skip activation and use `.\.venv\Scripts\python.exe -m ...` in the commands below instead.

### 2. Install the requirements

```powershell
pip install -r requirements.txt
```

Without activating the venv, use:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

This installs FastAPI, Uvicorn, TensorFlow 2.21, Pillow, NumPy, `python-multipart`, pytest and httpx **into the local `.venv` only** — nothing is installed globally. On Windows, `ml_dtypes` is pinned to `0.5.4` because `0.7.0`'s DLL is blocked by some Application Control policies.

### 3. (Optional) configure the app

```powershell
copy .env.example .env
```

The defaults already match this repository layout, so this step is optional.

### 4. Start the server

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Equivalent command without activating the venv:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Keep this terminal open** while you use the API. Startup loads the ~27 MB Keras model, so allow 10–20 seconds before the first request succeeds. Stop the server with `Ctrl+C`.

### 5. Open the API

- Swagger UI (interactive): <http://127.0.0.1:8000/docs>
- ReDoc: <http://127.0.0.1:8000/redoc>
- Health check: <http://127.0.0.1:8000/api/v1/health>

If the page cannot be reached, confirm the server is still running and that nothing else is using port 8000. To access it from another device, start with `--host 0.0.0.0` and use that machine's IP instead of `127.0.0.1`.

## Configuration

| Variable | Default | Description |
|---|---|---|
| `MODEL_PATH` | `phase1_artifacts/best_model.keras` | Keras model loaded at startup. |
| `CLASS_NAMES_PATH` | `phase1_artifacts/class_names.json` | Ordered 38-class label list. |
| `DISEASE_INFO_PATH` | `phase1_artifacts/disease_info.json` | Normalized disease reference data. |
| `MODEL_META_PATH` | `phase1_artifacts/model_meta.json` | Architecture/accuracy metadata. |
| `INPUT_SIZE` | `224x224` | Model input resolution. |
| `MAX_UPLOAD_BYTES` | `10485760` | Maximum upload size in bytes (10 MiB). |
| `ALLOWED_CONTENT_TYPES` | `image/jpeg,image/png,image/webp,image/bmp` | Accepted upload MIME types. |
| `CORS_ORIGINS` | `*` | Comma-separated allowed browser origins. |
| `DEFAULT_TOP_K` | `3` | Number of predictions returned when `top_k` is omitted (1–38). |
| `MAX_TOP_K` | `38` | Upper bound for the `top_k` query parameter. |

On Windows machines with strict Application Control policies, `ml_dtypes` is pinned to `0.5.4` in `requirements.txt` because the `0.7.0` DLL is blocked by policy. Both versions satisfy TensorFlow 2.21.

## API endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/` | Welcome message and docs link. |
| `GET` | `/api/v1/health` | Service status and `model_loaded` flag. |
| `GET` | `/api/v1/model/info` | Architecture, input size and training metadata. |
| `POST` | `/api/v1/predict` | Predict from a multipart `file` upload; optional `top_k` query (1–38). |
| `GET` | `/api/v1/diseases` | List all 38 classes with display names. |
| `GET` | `/api/v1/diseases/{class_name}` | Detail for one class (class name may contain `/`). |

Error codes: **400** invalid/oversized/non-image upload, **404** unknown class, **422** invalid query parameter, **503** model not loaded.

### Predict example

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/predict?top_k=3" \
  -H "Accept: application/json" \
  -F "file=@/path/to/leaf.jpg;type=image/jpeg"
```

Example response (trimmed):

```json
{
  "success": true,
  "prediction": {
    "class_name": "Tomato___Late_blight",
    "confidence": 0.97,
    "is_healthy": false
  },
  "alternatives": [
    {"class_name": "Tomato___Early_blight", "confidence": 0.02}
  ],
  "processing_time_ms": 12.4
}
```

## Tests

```bash
python -m pytest -q
```

The tests use `fastapi.testclient.TestClient` **without** its context manager, so the application lifespan never runs and the real TensorFlow model is never loaded. Model and disease services are replaced with deterministic fakes through dependency overrides; the disease-service tests exercise the real `DiseaseService` against the JSON artifacts only.
