"""Version 1 API routes for health, model metadata, prediction and disease data."""

import logging
import math
import time
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.concurrency import run_in_threadpool

from app.config import settings
from app.schemas import (
    DiseaseDetail,
    DiseaseListResponse,
    HealthResponse,
    ModelInfoResponse,
    PredictionItem,
    PredictionResult,
    PredictResponse,
)
from app.services.disease_service import disease_service as default_disease_service
from app.services.model_service import model_service as default_model_service
from app.utils.image import InvalidImageError, read_upload

logger = logging.getLogger(__name__)

API_VERSION = "1.0.0"

router = APIRouter(prefix="/api/v1", tags=["crop-disease-detection"])


# Dependencies are thin wrappers so tests can override them via dependency_overrides.
def get_model_service() -> Any:
    """Return the shared model service singleton."""
    return default_model_service


def get_disease_service() -> Any:
    """Return the shared disease information service singleton."""
    return default_disease_service


def _as_text(value: Any) -> str:
    """Normalize service text values to a plain string."""
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, (list, tuple)):
        return "\n".join(str(item) for item in value)
    return str(value)


def _confidence(value: Any) -> float:
    """Coerce a model score to a finite float in [0, 1]."""
    try:
        score = float(value)
    except (TypeError, ValueError):
        return 0.0
    if not math.isfinite(score):
        return 0.0
    return min(1.0, max(0.0, score))


def _safe_info(disease_service: Any, class_name: str) -> dict[str, Any]:
    """Look up disease info without letting a lookup failure break a request."""
    try:
        info = disease_service.get_info(class_name)
    except Exception:
        logger.exception("Disease lookup failed for class %s", class_name)
        return {}
    return info if isinstance(info, dict) else {}


def _display_name(disease_service: Any, class_name: str, info: dict[str, Any]) -> str:
    """Resolve a human-readable name, with progressively graceful fallbacks."""
    candidate = info.get("display_name")
    if candidate:
        return str(candidate)
    try:
        candidate = disease_service.get_display_name(class_name)
    except Exception:
        candidate = None
    if candidate:
        return str(candidate)
    return class_name.replace("___", " - ").replace("_", " ")


def _class_fallback(class_name: str) -> tuple[str, str]:
    """Derive rough crop/disease labels from a raw class name."""
    parts = class_name.split("___", 1)
    crop = parts[0].replace("_", " ") if parts and parts[0] else "Unknown"
    disease = parts[1].replace("_", " ") if len(parts) > 1 and parts[1] else "Unknown"
    return crop, disease


def _model_meta(model_service: Any) -> dict[str, Any]:
    """Read model metadata defensively."""
    try:
        info = model_service.get_model_info()
    except Exception:
        logger.exception("Could not read model metadata")
        return {}
    return info if isinstance(info, dict) else {}


@router.get("/health", response_model=HealthResponse, summary="Service health check")
async def health(model_service: Any = Depends(get_model_service)) -> HealthResponse:
    """Report API status and whether the model is ready for inference."""
    return HealthResponse(
        status="ok",
        model_loaded=bool(getattr(model_service, "is_loaded", False)),
        version=API_VERSION,
    )


@router.get("/model/info", response_model=ModelInfoResponse, summary="Model metadata")
async def model_info(model_service: Any = Depends(get_model_service)) -> ModelInfoResponse:
    """Return training metadata for the loaded model."""
    info = _model_meta(model_service)
    if not info:
        info = {
            "detail": "Model metadata is not available (the model may not be loaded yet).",
            "input_size": list(settings.input_size),
        }
    return ModelInfoResponse.model_validate(info)


@router.post("/predict", response_model=PredictResponse, summary="Classify a leaf image")
async def predict(
    file: UploadFile = File(..., description="Leaf image upload (JPEG, PNG, etc.)"),
    top_k: int = Query(
        settings.default_top_k,
        ge=1,
        le=settings.max_top_k,
        description="Number of candidate classes to return.",
    ),
    model_service: Any = Depends(get_model_service),
    disease_service: Any = Depends(get_disease_service),
) -> PredictResponse:
    """Validate an uploaded image, run inference and return enriched predictions."""
    started = time.perf_counter()
    try:
        image = await read_upload(file)
        raw_predictions = await run_in_threadpool(model_service.predict, image, top_k)
    except InvalidImageError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        logger.warning("Model inference unavailable: %s", exc)
        raise HTTPException(status_code=503, detail="Model is not loaded") from exc
    except HTTPException:
        raise
    except Exception:
        logger.exception("Prediction failed unexpectedly")
        raise HTTPException(status_code=500, detail="Prediction failed. Please try again.") from None

    candidates = [
        item
        for item in (raw_predictions or [])
        if isinstance(item, dict) and item.get("class_name")
    ][:top_k]
    if not candidates:
        logger.error("Model returned no usable predictions")
        raise HTTPException(status_code=503, detail="Model returned no predictions")

    top = candidates[0]
    class_name = str(top["class_name"])
    info = _safe_info(disease_service, class_name)
    display_name = _display_name(disease_service, class_name, info)
    fallback_crop, fallback_disease = _class_fallback(class_name)

    prediction = PredictionResult(
        class_name=class_name,
        display_name=display_name,
        crop=_as_text(info.get("crop")) or fallback_crop,
        disease=_as_text(info.get("disease")) or fallback_disease,
        is_healthy=bool(info.get("is_healthy", False)),
        confidence=_confidence(top.get("confidence")),
        symptoms=_as_text(info.get("symptoms")),
        treatment=_as_text(info.get("treatment")),
        prevention=_as_text(info.get("prevention")),
    )

    alternatives: list[PredictionItem] = []
    for item in candidates[1:]:
        alt_name = str(item["class_name"])
        alt_info = _safe_info(disease_service, alt_name)
        alternatives.append(
            PredictionItem(
                class_name=alt_name,
                display_name=_display_name(disease_service, alt_name, alt_info),
                confidence=_confidence(item.get("confidence")),
            )
        )

    meta = _model_meta(model_service)
    model_payload: dict[str, Any] = {
        "name": meta.get("name") or meta.get("architecture") or "MobileNetV2",
        "architecture": meta.get("architecture") or meta.get("name") or "MobileNetV2",
        "input_size": meta.get("input_size") or list(settings.input_size),
        "version": meta.get("version") or API_VERSION,
    }

    processing_time_ms = round((time.perf_counter() - started) * 1000, 2)
    return PredictResponse(
        success=True,
        prediction=prediction,
        alternatives=alternatives,
        model=model_payload,
        processing_time_ms=max(0.0, processing_time_ms),
    )


@router.get("/diseases", response_model=DiseaseListResponse, summary="List known disease classes")
async def list_diseases(
    disease_service: Any = Depends(get_disease_service),
) -> DiseaseListResponse:
    """Return every supported class with its human-readable information."""
    try:
        diseases = disease_service.list_diseases() or []
    except Exception:
        logger.exception("Could not list disease classes")
        diseases = []
    entries = [item for item in diseases if isinstance(item, dict)]
    return DiseaseListResponse(count=len(entries), diseases=entries)


@router.get(
    "/diseases/{class_name:path}",
    response_model=DiseaseDetail,
    summary="Get details for one disease class",
)
async def get_disease(
    class_name: str,
    disease_service: Any = Depends(get_disease_service),
) -> DiseaseDetail:
    """Return normalized information for a single model class."""
    info = _safe_info(disease_service, class_name)
    if not info:
        raise HTTPException(status_code=404, detail=f"Disease class '{class_name}' was not found")

    fallback_crop, fallback_disease = _class_fallback(class_name)
    return DiseaseDetail(
        class_name=_as_text(info.get("class_name")) or class_name,
        display_name=_display_name(disease_service, class_name, info),
        crop=_as_text(info.get("crop")) or fallback_crop,
        disease=_as_text(info.get("disease")) or fallback_disease,
        is_healthy=bool(info.get("is_healthy", False)),
        symptoms=_as_text(info.get("symptoms")),
        treatment=_as_text(info.get("treatment")),
        prevention=_as_text(info.get("prevention")),
    )
