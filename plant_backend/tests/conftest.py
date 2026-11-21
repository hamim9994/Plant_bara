"""Shared pytest fixtures for the API test suite.

The ``TestClient`` is deliberately created *without* a ``with`` block. Entering
the client context would run the application lifespan, which loads the real
TensorFlow model from ``phase1_artifacts/best_model.keras``. Keeping the client
outside the context keeps the tests fast, hermetic and independent of the model
file. The model and disease services are replaced with deterministic fakes via
FastAPI dependency overrides.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.api.routes import get_disease_service, get_model_service
from app.main import app

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DISEASE_INFO_PATH = PROJECT_ROOT / "phase1_artifacts" / "disease_info.json"

NORMALIZED_KEYS = (
    "class_name",
    "display_name",
    "crop",
    "disease",
    "is_healthy",
    "symptoms",
    "treatment",
    "prevention",
)


class FakeModelService:
    """Deterministic stand-in for ``ModelService``: no TensorFlow, no file IO."""

    is_loaded = True

    _RESULTS = [
        {"class_name": "Tomato___Late_blight", "confidence": 0.97},
        {"class_name": "Tomato___Early_blight", "confidence": 0.02},
    ]

    def load(self) -> None:  # pragma: no cover - not exercised by the tests
        """No-op; the fake is always loaded."""
        return None

    def predict(self, image: Any, top_k: int = 3) -> list[dict[str, Any]]:
        """Return the fixed ranking, truncated to ``top_k``."""
        return [dict(item) for item in self._RESULTS[:top_k]]

    def get_model_info(self) -> dict[str, Any]:
        """Return a small, stable info payload."""
        return {
            "architecture": "FakeMobileNetV2",
            "input_size": [224, 224],
            "num_classes": 38,
            "test_accuracy": 0.9749,
        }


class FakeDiseaseService:
    """Stand-in for ``DiseaseService`` backed by the real disease-info JSON.

    Only the read-only ``phase1_artifacts/disease_info.json`` file is used; no
    TensorFlow import and no real model file are involved.
    """

    def __init__(self) -> None:
        raw = json.loads(DISEASE_INFO_PATH.read_text(encoding="utf-8"))
        self._info: dict[str, dict[str, Any]] = {}
        for class_name, payload in raw.items():
            item = {key: payload.get(key) for key in NORMALIZED_KEYS}
            item["class_name"] = class_name
            if not item["display_name"]:
                item["display_name"] = class_name.replace("___", " — ").replace("_", " ")
            if not item["crop"]:
                item["crop"] = class_name.split("___", 1)[0]
            if item["is_healthy"] is None:
                item["is_healthy"] = class_name.endswith("___healthy")
            self._info[class_name] = item

    @property
    def class_names(self) -> list[str]:
        """All known class names in artifact order."""
        return list(self._info)

    def get_info(self, class_name: str) -> dict[str, Any] | None:
        """Return a normalized copy of the info dict, or ``None``."""
        item = self._info.get(class_name)
        return dict(item) if item is not None else None

    def list_diseases(self) -> list[dict[str, Any]]:
        """Return normalized info for every class."""
        return [dict(item) for item in self._info.values()]

    def get_display_name(self, class_name: str) -> str:
        """Return the stored display name, with a readable fallback."""
        item = self.get_info(class_name)
        if item and item.get("display_name"):
            return str(item["display_name"])
        return class_name.replace("___", " — ").replace("_", " ")


@pytest.fixture
def fake_model_service() -> FakeModelService:
    """Provide the deterministic model fake."""
    return FakeModelService()


@pytest.fixture
def fake_disease_service() -> FakeDiseaseService:
    """Provide the deterministic disease-info fake."""
    return FakeDiseaseService()


@pytest.fixture(autouse=True)
def override_service_dependencies(
    fake_model_service: FakeModelService,
    fake_disease_service: FakeDiseaseService,
):
    """Install fake service dependencies for every test, then clean up."""
    app.dependency_overrides[get_model_service] = lambda: fake_model_service
    app.dependency_overrides[get_disease_service] = lambda: fake_disease_service
    try:
        yield
    finally:
        app.dependency_overrides.clear()


@pytest.fixture
def client():
    """Build an API client without running the lifespan (no real model load)."""
    client = TestClient(app)
    return client
