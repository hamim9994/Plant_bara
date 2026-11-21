# Project Plan: AI Crop Disease Detection Backend

## 1. Project Overview
We are building the backend for an AI-based Crop Disease Detection and Smart Farming Assistance System. A farmer uploads a leaf image via a frontend dashboard. The backend processes the image, predicts the disease, and returns detailed treatment info.

## 2. Tech Stack
- **Backend Framework:** FastAPI (Python)
- **ML Framework:** TensorFlow / Keras (TensorFlow 2.21.0)
- **Model Architecture:** MobileNetV2 (Fine-tuned, 38 classes)
- **Image Processing:** Pillow (PIL), NumPy, `tf.keras.applications.mobilenet_v2.preprocess_input`
- **Data Storage:** JSON files (no database needed for now)

## 3. Current Status
- **Phase 1 (ML Training):** ✅ COMPLETE.
  - Model achieves 97.49% test accuracy.
  - Artifacts are saved in `phase1_artifacts/`.
- **Phase 2 (Backend API):** ✅ COMPLETE.
  - FastAPI app, image validation, model inference, disease-info lookup, CORS and error handling implemented.
  - 14 automated tests pass; verified end-to-end with the real `best_model.keras` (health, metadata, 38-class list, disease detail and a real `/api/v1/predict` call).
  - `ml_dtypes` pinned to 0.5.4 because the 0.7.0 Windows DLL is blocked by Application Control on this machine.

## 4. Directory Structure
```
plant_backend/
├── app/
│   ├── main.py                 # FastAPI app, CORS, startup model load
│   ├── config.py               # env-driven settings
│   ├── schemas.py              # Pydantic response models
│   ├── api/routes.py           # /api/v1 endpoints
│   ├── services/
│   │   ├── model_service.py    # MobileNetV2 loading + top-k prediction
│   │   └── disease_service.py  # JSON disease-info lookup
│   └── utils/image.py          # upload validation + PIL decoding
├── tests/                      # pytest suite (faked services)
├── phase1_artifacts/            # model, classes, disease info, metadata
├── requirements.txt
├── .env.example
├── README.md
└── AGENT_PLAN.md               # parallel agent assignments
```

## 5. API Endpoints
- `GET /api/v1/health`
- `GET /api/v1/model/info`
- `POST /api/v1/predict?top_k=3` (multipart `file`)
- `GET /api/v1/diseases`
- `GET /api/v1/diseases/{class_name}`

Run locally: `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`
Tests: `python -m pytest -q`