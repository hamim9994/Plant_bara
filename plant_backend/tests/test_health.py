"""Smoke tests for the root and health endpoints."""

from fastapi.testclient import TestClient


def test_health_reports_ok_and_model_loaded(client: TestClient) -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["model_loaded"] is True


def test_root_endpoint(client: TestClient) -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)
