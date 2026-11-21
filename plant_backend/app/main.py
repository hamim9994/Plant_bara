"""FastAPI application entry point for the AI Crop Disease Detection API."""

import inspect
import logging
import os
from contextlib import asynccontextmanager
from typing import Any, AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.services.model_service import model_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger(__name__)

DESCRIPTION = (
    "Upload a crop leaf image and receive a disease prediction with practical "
    "symptoms, treatment and prevention advice. The model is loaded lazily at "
    "startup; if loading fails the API stays up and reports the model as unavailable."
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Load the ML model at startup without preventing the API from starting."""
    try:
        result = model_service.load()
        if inspect.isawaitable(result):
            await result
    except Exception:
        logger.exception("Model failed to load at startup; prediction requests will return 503")
    yield


app = FastAPI(
    title="AI Crop Disease Detection API",
    version="1.0.0",
    description=DESCRIPTION,
    lifespan=lifespan,
)

_raw_origins = os.getenv("CORS_ORIGINS", "*")
origins = [origin.strip() for origin in _raw_origins.split(",") if origin.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/", include_in_schema=False)
async def root() -> dict[str, Any]:
    """Welcome endpoint with links to the docs and health check."""
    return {
        "message": "Welcome to the AI Crop Disease Detection API",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
