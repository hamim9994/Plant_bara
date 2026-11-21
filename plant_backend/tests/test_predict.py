"""Tests for POST /api/v1/predict using the fake model service."""

import io
from typing import Any

import pytest
from fastapi.testclient import TestClient
from PIL import Image

PREDICT_URL = "/api/v1/predict"
EXPECTED_TOP = "Tomato___Late_blight"
EXPECTED_SECOND = "Tomato___Early_blight"


def _leaf_png() -> bytes:
    """Create a tiny, valid PNG entirely in memory."""
    buffer = io.BytesIO()
    Image.new("RGB", (8, 8), "green").save(buffer, format="PNG")
    return buffer.getvalue()


def _upload(content: bytes | None = None) -> dict[str, Any]:
    """Build the multipart file mapping expected by TestClient."""
    payload = content if content is not None else _leaf_png()
    return {"file": ("leaf.png", payload, "image/png")}


def test_predict_success(client: TestClient) -> None:
    response = client.post(PREDICT_URL, files=_upload())
    assert response.status_code == 200

    body = response.json()
    for key in ("success", "prediction", "alternatives", "processing_time_ms"):
        assert key in body
    assert body["success"] is True
    assert isinstance(body["processing_time_ms"], (int, float))

    prediction = body["prediction"]
    assert prediction["class_name"] == EXPECTED_TOP
    assert prediction["confidence"] == pytest.approx(0.97)
    # ``is_healthy`` may live on the prediction or alongside it at the top level.
    is_healthy = prediction.get("is_healthy", body.get("is_healthy"))
    assert is_healthy is False

    assert any(item["class_name"] == EXPECTED_SECOND for item in body["alternatives"])


def test_predict_top_k_one_has_no_alternatives(client: TestClient) -> None:
    response = client.post(PREDICT_URL, params={"top_k": 1}, files=_upload())
    assert response.status_code == 200
    body = response.json()
    assert body["prediction"]["class_name"] == EXPECTED_TOP
    assert body["alternatives"] == []


@pytest.mark.parametrize("top_k", [0, 999])
def test_predict_rejects_invalid_top_k(client: TestClient, top_k: int) -> None:
    response = client.post(PREDICT_URL, params={"top_k": top_k}, files=_upload())
    assert response.status_code == 422


def test_predict_rejects_non_image_bytes(client: TestClient) -> None:
    response = client.post(PREDICT_URL, files=_upload(b"this is not a png"))
    assert response.status_code == 400


def test_predict_rejects_empty_file(client: TestClient) -> None:
    response = client.post(PREDICT_URL, files=_upload(b""))
    assert response.status_code == 400
