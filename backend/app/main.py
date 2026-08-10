"""
Recall — voice-first meeting memory assistant.
FastAPI application entry point.
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import health, seed, ask, transcribe

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Recall",
    description="Voice-first meeting memory assistant. Powered by Qdrant + LLM + Rime.",
    version="1.0.0",
)

# CORS — allow configured frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health.router)
app.include_router(seed.router, prefix="/api")
app.include_router(ask.router, prefix="/api")
app.include_router(transcribe.router, prefix="/api")

logger.info("Recall backend started. Qdrant: %s | Collection: %s", settings.qdrant_url, settings.qdrant_collection)
