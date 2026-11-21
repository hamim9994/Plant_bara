"""Application configuration.

Settings are read from environment variables (with sensible defaults) using
:mod:`os` and :mod:`pathlib`; no ``pydantic-settings`` dependency is required.
A single immutable :class:`Settings` instance is available both as ``settings``
and through :func:`get_settings`.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = PROJECT_ROOT / "phase1_artifacts"

_DEFAULT_ALLOWED_CONTENT_TYPES: tuple[str, ...] = (
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/bmp",
)


def _env_path(name: str, default: Path) -> Path:
    """Return an environment-overridden path, expanded for the user home."""
    value = os.getenv(name)
    return Path(value).expanduser() if value else default


def _env_int(name: str, default: int, minimum: int = 1) -> int:
    """Return a positive integer from the environment or ``default``."""
    value = os.getenv(name)
    if value is None:
        return default
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default
    return parsed if parsed >= minimum else default


def _env_input_size(name: str, default: tuple[int, int]) -> tuple[int, int]:
    """Parse an optional ``WxH`` / ``W,H`` environment override."""
    value = os.getenv(name)
    if not value:
        return default
    cleaned = value.replace("x", ",").replace("X", ",").replace(" ", "")
    parts = cleaned.split(",")
    if len(parts) != 2:
        return default
    try:
        size = (int(parts[0]), int(parts[1]))
    except ValueError:
        return default
    return size if all(dim > 0 for dim in size) else default


def _env_content_types(name: str, default: tuple[str, ...]) -> tuple[str, ...]:
    """Parse an optional comma-separated list of allowed MIME types."""
    value = os.getenv(name)
    if not value:
        return default
    types = tuple(item.strip().lower() for item in value.split(",") if item.strip())
    return types or default


@dataclass(frozen=True)
class Settings:
    """Immutable container for runtime configuration."""

    model_path: Path
    class_names_path: Path
    disease_info_path: Path
    model_meta_path: Path
    input_size: tuple[int, int] = (224, 224)
    max_upload_bytes: int = 10 * 1024 * 1024
    allowed_content_types: tuple[str, ...] = _DEFAULT_ALLOWED_CONTENT_TYPES
    default_top_k: int = 3
    max_top_k: int = 38

    @classmethod
    def from_env(cls) -> "Settings":
        """Build a settings instance from the current environment."""
        default_top_k = _env_int("DEFAULT_TOP_K", 3)
        max_top_k = _env_int("MAX_TOP_K", 38)
        if default_top_k > max_top_k:
            default_top_k = max_top_k
        return cls(
            model_path=_env_path("MODEL_PATH", ARTIFACTS_DIR / "best_model.keras"),
            class_names_path=_env_path("CLASS_NAMES_PATH", ARTIFACTS_DIR / "class_names.json"),
            disease_info_path=_env_path("DISEASE_INFO_PATH", ARTIFACTS_DIR / "disease_info.json"),
            model_meta_path=_env_path("MODEL_META_PATH", ARTIFACTS_DIR / "model_meta.json"),
            input_size=_env_input_size("INPUT_SIZE", (224, 224)),
            max_upload_bytes=_env_int("MAX_UPLOAD_BYTES", 10 * 1024 * 1024),
            allowed_content_types=_env_content_types(
                "ALLOWED_CONTENT_TYPES", _DEFAULT_ALLOWED_CONTENT_TYPES
            ),
            default_top_k=default_top_k,
            max_top_k=max_top_k,
        )


settings = Settings.from_env()


def get_settings() -> Settings:
    """Return the process-wide settings singleton."""
    return settings
