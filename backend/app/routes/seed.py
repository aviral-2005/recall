"""
Seed route — loads meetings.json, generates embeddings, and populates Qdrant.
Calling POST /api/seed recreates the collection from scratch.
"""
import json
import logging
from pathlib import Path
from fastapi import APIRouter, HTTPException
from app.models import SeedResponse
from app.services import embeddings as embed_svc
from app.services import qdrant as qdrant_svc

logger = logging.getLogger(__name__)
router = APIRouter()

MEETINGS_FILE = Path(__file__).parent.parent / "data" / "meetings.json"


@router.post("/seed", response_model=SeedResponse)
async def seed():
    """Recreate Qdrant collection and insert all demo meeting memories."""
    try:
        memories: list[dict] = json.loads(MEETINGS_FILE.read_text(encoding="utf-8"))
        logger.info("Loaded %d memory chunks from meetings.json", len(memories))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load meetings.json: {e}")

    # Embed all memory texts in a single batched call
    texts = [m["text"] for m in memories]
    try:
        vectors = await embed_svc.embed_batch(texts)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding failed: {e}")

    vector_size = len(vectors[0])
    logger.info("Embedding dimension: %d", vector_size)

    # Recreate collection and insert
    try:
        await qdrant_svc.recreate_collection(vector_size)
        inserted = await qdrant_svc.upsert_memories(memories, vectors)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Qdrant insert failed: {e}")

    return SeedResponse(status="seeded", inserted=inserted)
