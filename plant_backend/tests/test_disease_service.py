"""Tests for the real DiseaseService backed by the phase1 artifact JSON files."""

from app.services.disease_service import DiseaseService

KNOWN_CLASS = "Tomato___Late_blight"
HEALTHY_CLASS = "Tomato___healthy"
UNKNOWN_CLASS = "Definitely___Not_A_Real_Class"
FALLBACK_CLASS = "Unknown___Class"


def test_class_names_are_loaded() -> None:
    names = DiseaseService().class_names
    assert len(names) == 38
    assert KNOWN_CLASS in names
    assert HEALTHY_CLASS in names


def test_get_info_for_known_class() -> None:
    info = DiseaseService().get_info(KNOWN_CLASS)
    assert info is not None
    assert info["class_name"] == KNOWN_CLASS
    assert info["crop"] == "Tomato"
    assert info["is_healthy"] is False


def test_get_info_for_healthy_class() -> None:
    info = DiseaseService().get_info(HEALTHY_CLASS)
    assert info is not None
    assert info["is_healthy"] is True


def test_get_info_for_unknown_class() -> None:
    assert DiseaseService().get_info(UNKNOWN_CLASS) is None


def test_list_diseases_returns_all_classes() -> None:
    diseases = DiseaseService().list_diseases()
    assert len(diseases) == 38
    assert all("class_name" in item for item in diseases)


def test_get_display_name_and_fallback() -> None:
    service = DiseaseService()

    display_name = service.get_display_name(KNOWN_CLASS)
    assert isinstance(display_name, str)
    assert "Tomato" in display_name

    fallback = service.get_display_name(FALLBACK_CLASS)
    assert isinstance(fallback, str)
    assert fallback.strip()
    assert "Unknown" in fallback
