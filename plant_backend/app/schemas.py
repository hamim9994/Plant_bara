"""Pydantic v2 request/response schemas for the crop disease detection API."""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class PredictionItem(BaseModel):
    """A single class prediction (used for the alternatives list)."""

    class_name: str = Field(
        ..., description="Raw model class label, e.g. 'Tomato___Early_blight'."
    )
    display_name: str = Field(..., description="Human-readable name for the class.")
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Prediction confidence in the range [0, 1]."
    )


class PredictionResult(BaseModel):
    """Top prediction enriched with disease information."""

    class_name: str = Field(..., description="Raw model class label.")
    display_name: str = Field(..., description="Human-readable disease/crop name.")
    crop: str = Field(default="Unknown", description="Affected crop.")
    disease: str = Field(default="Unknown", description="Disease name (or 'healthy').")
    is_healthy: bool = Field(default=False, description="Whether the class is a healthy leaf.")
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Prediction confidence in the range [0, 1]."
    )
    symptoms: str = Field(default="", description="Typical symptoms of the disease.")
    treatment: str = Field(default="", description="Recommended treatment advice.")
    prevention: str = Field(default="", description="Recommended prevention advice.")


class PredictResponse(BaseModel):
    """Response body returned by POST /api/v1/predict."""

    success: bool = Field(default=True, description="Whether the prediction succeeded.")
    prediction: PredictionResult = Field(..., description="Top predicted class with details.")
    alternatives: list[PredictionItem] = Field(
        default_factory=list, description="Remaining candidate classes, highest first."
    )
    model: dict[str, Any] = Field(
        default_factory=dict, description="Metadata about the model that made the prediction."
    )
    processing_time_ms: float = Field(
        ..., ge=0.0, description="End-to-end processing time in milliseconds."
    )


class HealthResponse(BaseModel):
    """Response body returned by GET /api/v1/health."""

    status: str = Field(default="ok", description="Service status.")
    model_loaded: bool = Field(..., description="Whether the ML model is ready for inference.")
    version: str = Field(..., description="API version string.")


class ModelInfoResponse(BaseModel):
    """Model metadata; arbitrary keys from the model service pass through unchanged."""

    model_config = ConfigDict(extra="allow")


class DiseaseDetail(BaseModel):
    """Normalized disease information for one model class."""

    class_name: str = Field(..., description="Raw model class label.")
    display_name: str = Field(..., description="Human-readable name for the class.")
    crop: str = Field(default="Unknown", description="Affected crop.")
    disease: str = Field(default="Unknown", description="Disease name (or 'healthy').")
    is_healthy: bool = Field(default=False, description="Whether the class is a healthy leaf.")
    symptoms: str = Field(default="", description="Typical symptoms of the disease.")
    treatment: str = Field(default="", description="Recommended treatment advice.")
    prevention: str = Field(default="", description="Recommended prevention advice.")


class DiseaseListResponse(BaseModel):
    """Response body returned by GET /api/v1/diseases."""

    count: int = Field(default=0, ge=0, description="Number of available classes.")
    diseases: list[dict[str, Any]] = Field(
        default_factory=list, description="One entry per supported model class."
    )
