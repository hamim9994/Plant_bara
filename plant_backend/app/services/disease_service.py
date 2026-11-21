"""Disease metadata service.

Loads class names and disease descriptions from the Phase 1 JSON artifacts and
exposes a small, stable lookup API used by the HTTP layer. All file access is
defensive: missing or malformed artifacts degrade to empty/default data instead
of raising at import time.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from ..config import settings

INFO_KEYS: tuple[str, ...] = (
    "class_name",
    "display_name",
    "crop",
    "disease",
    "is_healthy",
    "symptoms",
    "treatment",
    "prevention",
)


def derive_display_name(class_name: str) -> str:
    """Return a human-readable name for a raw dataset class name."""
    return str(class_name).replace("___", " — ").replace("_", " ")


def _split_class_name(class_name: str) -> tuple[str, str]:
    """Split ``Crop___Disease`` into readable crop and disease parts."""
    crop, _, disease = str(class_name).partition("___")
    return crop.replace("_", " ").strip(), disease.replace("_", " ").strip()


def _as_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "y"}
    return bool(value)


def _as_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, (list, tuple)):
        return " ".join(_as_text(item) for item in value).strip()
    return str(value)


class DiseaseService:
    """Read-only, in-memory view of the disease information artifacts."""

    def __init__(
        self,
        class_names_path: str | Path | None = None,
        disease_info_path: str | Path | None = None,
    ) -> None:
        self._class_names_path = Path(class_names_path or settings.class_names_path)
        self._disease_info_path = Path(disease_info_path or settings.disease_info_path)
        self._class_names: list[str] = []
        self._info: dict[str, dict[str, Any]] = {}
        self.reload()

    # ------------------------------------------------------------------
    # Loading
    # ------------------------------------------------------------------
    def reload(self) -> None:
        """Re-read the artifact files (useful if content is updated on disk)."""
        self._class_names = self._load_class_names()
        self._info = self._load_info()

    def _load_class_names(self) -> list[str]:
        try:
            data = json.loads(self._class_names_path.read_text(encoding="utf-8"))
        except (OSError, ValueError, TypeError):
            return []
        if isinstance(data, dict):
            data = data.get("class_names", [])
        if not isinstance(data, list):
            return []
        return [str(name) for name in data if str(name).strip()]

    def _load_info(self) -> dict[str, dict[str, Any]]:
        try:
            data = json.loads(self._disease_info_path.read_text(encoding="utf-8"))
        except (OSError, ValueError, TypeError):
            return {}
        if not isinstance(data, dict):
            return {}
        return {
            str(key): value if isinstance(value, dict) else {}
            for key, value in data.items()
        }

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    @property
    def class_names(self) -> list[str]:
        """All known class names, in artifact order."""
        if self._class_names:
            return list(self._class_names)
        return list(self._info.keys())

    def _resolve_key(self, class_name: Any) -> str | None:
        if not isinstance(class_name, str):
            return None
        key = class_name.strip()
        known = set(self._info) | set(self._class_names)
        if key in known:
            return key
        lowered = key.lower()
        for candidate in known:
            if candidate.lower() == lowered:
                return candidate
        # Tolerate a display-style separator (e.g. "Apple — Apple scab").
        normalized = key.replace(" — ", "___").replace("–", "-")
        return normalized if normalized in known else None

    def get_info(self, class_name: str) -> dict[str, Any] | None:
        """Return normalized information for ``class_name``, or ``None``."""
        key = self._resolve_key(class_name)
        if key is None:
            return None
        raw = self._info.get(key, {})
        crop, disease = _split_class_name(key)
        is_healthy = (
            _as_bool(raw["is_healthy"])
            if "is_healthy" in raw
            else "healthy" in key.lower()
        )
        return {
            "class_name": key,
            "display_name": _as_text(raw.get("display_name")) or derive_display_name(key),
            "crop": _as_text(raw.get("crop")) or crop,
            "disease": _as_text(raw.get("disease")) or disease,
            "is_healthy": is_healthy,
            "symptoms": _as_text(raw.get("symptoms")),
            "treatment": _as_text(raw.get("treatment")),
            "prevention": _as_text(raw.get("prevention")),
        }

    def list_diseases(self) -> list[dict[str, Any]]:
        """Return normalized information for every known class."""
        result: list[dict[str, Any]] = []
        for name in self.class_names:
            info = self.get_info(name)
            if info is not None:
                result.append(info)
        return result

    def get_display_name(self, class_name: str) -> str:
        """Return a display name, deriving one when metadata is missing."""
        info = self.get_info(class_name)
        if info is not None and info.get("display_name"):
            return str(info["display_name"])
        return derive_display_name(class_name)


disease_service = DiseaseService()
