"""Image upload helpers.

Validates multipart uploads, decodes bytes into RGB Pillow images (honouring
EXIF orientation), and provides an async reader that enforces the configured
size limit. Decoding is the final authority for ambiguous content types such as
``application/octet-stream``.
"""

from __future__ import annotations

from io import BytesIO
from typing import Any

from PIL import Image, ImageOps

from ..config import settings

_GENERIC_CONTENT_TYPES = frozenset(
    {"", "application/octet-stream", "binary/octet-stream", "application/octetstream"}
)


class InvalidImageError(ValueError):
    """Raised when an upload is empty, too large, or not a valid image."""


def _resolve_settings(settings_obj: Any | None) -> Any:
    return settings if settings_obj is None else settings_obj


def validate_upload(file: Any, settings_obj: Any = None) -> None:
    """Check the declared content type and size of an uploaded file."""
    cfg = _resolve_settings(settings_obj)

    content_type = getattr(file, "content_type", None)
    if isinstance(content_type, str):
        declared = content_type.split(";", 1)[0].strip().lower()
        allowed = {str(item).strip().lower() for item in cfg.allowed_content_types}
        aliases = {item.replace("jpeg", "jpg") for item in allowed}
        if declared and declared not in _GENERIC_CONTENT_TYPES:
            if declared not in allowed and declared not in aliases:
                raise InvalidImageError(f"Unsupported content type: {content_type}")

    size = getattr(file, "size", None)
    if isinstance(size, int):
        max_bytes = int(cfg.max_upload_bytes)
        if size <= 0:
            raise InvalidImageError("Uploaded file is empty")
        if size > max_bytes:
            raise InvalidImageError(
                f"Uploaded file exceeds the {max_bytes} byte limit"
            )


def decode_image(data: bytes) -> Image.Image:
    """Decode image bytes into an RGB Pillow image, applying EXIF orientation."""
    if not data:
        raise InvalidImageError("Uploaded file is empty")
    try:
        with Image.open(BytesIO(data)) as opened:
            image = ImageOps.exif_transpose(opened)
            image.load()
            return image.convert("RGB")
    except Exception as exc:
        raise InvalidImageError("Uploaded file is not a valid image") from exc


async def read_upload(file: Any, settings_obj: Any = None) -> Image.Image:
    """Validate, read (with a bounded read), and decode an uploaded image."""
    cfg = _resolve_settings(settings_obj)
    validate_upload(file, cfg)

    max_bytes = int(cfg.max_upload_bytes)
    try:
        data = await file.read(max_bytes + 1)
    except TypeError:  # pragma: no cover - tolerate simple async readers
        data = await file.read()

    if not data:
        raise InvalidImageError("Uploaded file is empty")
    if len(data) > max_bytes:
        raise InvalidImageError(f"Uploaded file exceeds the {max_bytes} byte limit")
    return decode_image(data)
