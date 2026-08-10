"""
Qdrant service — collection management and search.
"""
import logging
from typing import Any
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    ScoredPoint,
)
from app.config import settings

logger = logging.getLogger(__name__)

_client: AsyncQdrantClient | None = None

COLLECTION = settings.qdrant_collection
# Dimension for text-embedding-3-small; adjust if using a different model.
# We detect dimension dynamically on first insert.
_VECTOR_SIZE: int | None = None


def get_client() -> AsyncQdrantClient:
    global _client
    if _client is None:
        kwargs: dict[str, Any] = {"url": settings.qdrant_url}
        if settings.qdrant_api_key:
            kwargs["api_key"] = settings.qdrant_api_key
        _client = AsyncQdrantClient(**kwargs)
    return _client


async def recreate_collection(vector_size: int) -> None:
    """Drop (if exists) and recreate the collection."""
    client = get_client()
    existing = [c.name for c in (await client.get_collections()).collections]
    if COLLECTION in existing:
        logger.info("Deleting existing collection '%s'", COLLECTION)
        await client.delete_collection(COLLECTION)
    logger.info("Creating collection '%s' with dim=%d", COLLECTION, vector_size)
    await client.create_collection(
        collection_name=COLLECTION,
        vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
    )


async def upsert_memories(
    memories: list[dict],
    vectors: list[list[float]],
) -> int:
    """Insert memory points into Qdrant. Returns number inserted."""
    client = get_client()
    points = [
        PointStruct(
            id=i,
            vector=vectors[i],
            payload={
                "meeting_id": memories[i]["meeting_id"],
                "meeting_name": memories[i]["meeting_name"],
                "date": memories[i]["date"],
                "timestamp": memories[i]["timestamp"],
                "speaker": memories[i]["speaker"],
                "text": memories[i]["text"],
                "topic": memories[i]["topic"],
                "memory_type": memories[i]["memory_type"],
            },
        )
        for i in range(len(memories))
    ]
    await client.upsert(collection_name=COLLECTION, points=points)
    logger.info("Upserted %d points into '%s'", len(points), COLLECTION)
    return len(points)


async def search_memories(
    query_vector: list[float],
    top_k: int = 5,
) -> list[ScoredPoint]:
    """Return top_k most relevant memories for the query vector."""
    client = get_client()
    results = await client.search(
        collection_name=COLLECTION,
        query_vector=query_vector,
        limit=top_k,
        with_payload=True,
    )
    logger.info(
        "Qdrant returned %d results. Scores: %s",
        len(results),
        [f"{r.score:.4f}" for r in results],
    )
    for r in results:
        logger.debug(
            "  score=%.4f | speaker=%s | text=%s",
            r.score,
            r.payload.get("speaker"),
            r.payload.get("text", "")[:60],
        )
    return results
