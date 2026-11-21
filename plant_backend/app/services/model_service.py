"""TensorFlow model service.

TensorFlow is imported lazily inside :meth:`ModelService.load`, so importing the
API (or running unit tests) never pays the framework's startup cost. Predictions
are serialized with a lock and always return probabilities in ``[0, 1]``.
"""

from __future__ import annotations

import json
import threading
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image

from ..config import settings
from .disease_service import disease_service


def _softmax(values: np.ndarray) -> np.ndarray:
    """Numerically stable softmax over the last axis."""
    shifted = values - np.max(values, axis=-1, keepdims=True)
    exps = np.exp(shifted)
    return exps / np.sum(exps, axis=-1, keepdims=True)


class ModelService:
    """Lazy-loaded MobileNetV2 classifier for leaf images."""

    def __init__(
        self,
        model_path: str | Path | None = None,
        class_names_path: str | Path | None = None,
        model_meta_path: str | Path | None = None,
        input_size: tuple[int, int] | None = None,
    ) -> None:
        self._model_path = Path(model_path or settings.model_path)
        self._class_names_path = Path(class_names_path or settings.class_names_path)
        self._meta_path = Path(model_meta_path or settings.model_meta_path)
        self.input_size: tuple[int, int] = tuple(input_size or settings.input_size)
        self._model: Any = None
        self._preprocess_input: Any = None
        self._class_names: list[str] = self._read_class_names()
        self._lock = threading.Lock()
        self._load_lock = threading.Lock()

    # ------------------------------------------------------------------
    # Loading
    # ------------------------------------------------------------------
    def _read_class_names(self) -> list[str]:
        try:
            data = json.loads(self._class_names_path.read_text(encoding="utf-8"))
            if isinstance(data, dict):
                data = data.get("class_names", [])
            if isinstance(data, list):
                names = [str(name) for name in data if str(name).strip()]
                if names:
                    return names
        except (OSError, ValueError, TypeError):
            pass
        return list(disease_service.class_names)

    @property
    def is_loaded(self) -> bool:
        """Whether the Keras model has been loaded successfully."""
        return self._model is not None

    def load(self, warmup: bool = True) -> None:
        """Load the model once; further calls are no-ops."""
        if self.is_loaded:
            return
        with self._load_lock:
            if self.is_loaded:
                return
            try:
                import tensorflow as tf
                from tensorflow.keras.applications import mobilenet_v2
            except Exception as exc:  # pragma: no cover - environment dependent
                raise RuntimeError(f"TensorFlow could not be imported: {exc}") from exc

            if not self._model_path.exists():
                raise RuntimeError(f"Model file not found: {self._model_path}")
            try:
                model = tf.keras.models.load_model(str(self._model_path), compile=False)
            except Exception as exc:
                raise RuntimeError(
                    f"Failed to load model from {self._model_path}: {exc}"
                ) from exc

            self._model = model
            self._preprocess_input = mobilenet_v2.preprocess_input
            if warmup:
                try:
                    self._warmup()
                except Exception:  # pragma: no cover - best-effort only
                    pass

    def _warmup(self) -> None:
        """Run one dummy prediction to initialise lazy graph kernels."""
        width, height = self.input_size
        batch = np.zeros((1, height, width, 3), dtype=np.float32)
        if self._preprocess_input is not None:
            batch = self._preprocess_input(batch)
        self._model.predict(batch, verbose=0)

    # ------------------------------------------------------------------
    # Prediction
    # ------------------------------------------------------------------
    @staticmethod
    def _to_probabilities(raw: np.ndarray) -> np.ndarray:
        """Convert raw outputs (probabilities or logits) to a probability vector."""
        finite = np.nan_to_num(raw.astype(np.float64), nan=0.0, posinf=1.0, neginf=0.0)
        total = float(np.sum(finite))
        looks_like_probs = (
            total > 0.0
            and abs(total - 1.0) < 1e-2
            and bool(np.all(finite >= 0.0))
        )
        probs = finite if looks_like_probs else _softmax(finite)
        probs = np.clip(probs, 0.0, 1.0)
        total = float(np.sum(probs))
        return probs / total if total > 0.0 else probs

    def predict(self, image: Image.Image, top_k: int = 3) -> list[dict[str, Any]]:
        """Return the ``top_k`` predicted classes with confidence in ``[0, 1]``."""
        if not self.is_loaded:
            raise RuntimeError(
                "Model is not loaded. Call model_service.load() before predict()."
            )

        with self._lock:
            num_classes = len(self._class_names) or settings.max_top_k
            try:
                k = int(top_k)
            except (TypeError, ValueError):
                k = settings.default_top_k
            k = max(1, min(k, num_classes))

            width, height = self.input_size
            rgb = image.convert("RGB").resize((width, height), Image.Resampling.LANCZOS)
            batch = np.asarray(rgb, dtype=np.float32)[None, ...]
            if self._preprocess_input is not None:
                batch = self._preprocess_input(batch)

            raw = np.asarray(self._model.predict(batch, verbose=0))
            if raw.ndim > 1:
                raw = raw[0]
            if raw.size == 0:
                return []

            probabilities = self._to_probabilities(raw)
            order = np.argsort(-probabilities)[:k]
            return [
                {
                    "class_name": (
                        self._class_names[int(i)]
                        if int(i) < len(self._class_names)
                        else str(i)
                    ),
                    "confidence": float(np.clip(probabilities[int(i)], 0.0, 1.0)),
                }
                for i in order
            ]

    # ------------------------------------------------------------------
    # Metadata
    # ------------------------------------------------------------------
    def get_model_info(self) -> dict[str, Any]:
        """Return training metadata, or ``{}`` when it cannot be read."""
        try:
            data = json.loads(self._meta_path.read_text(encoding="utf-8"))
        except (OSError, ValueError, TypeError):
            return {}
        if not isinstance(data, dict):
            return {}

        info: dict[str, Any] = dict(data)
        defaults: dict[str, Any] = {
            "architecture": "",
            "framework": "",
            "tf_version": "",
            "num_classes": len(self._class_names),
            "input_size": list(self.input_size),
            "preprocess_fn": "tensorflow.keras.applications.mobilenet_v2.preprocess_input",
            "val_accuracy": None,
            "test_accuracy": None,
            "trained_on": "",
            "date_trained": "",
        }
        for key, value in defaults.items():
            info.setdefault(key, value)
        return info


model_service = ModelService()
