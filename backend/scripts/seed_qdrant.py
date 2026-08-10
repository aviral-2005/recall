"""
Standalone seed script — can be run directly without starting the server.

Usage (from the backend/ directory):
    python scripts/seed_qdrant.py

Requires .env to be present in the backend/ directory.
"""
import asyncio
import json
import logging
import sys
from pathlib import Path

# Allow importing from app/
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv()

from app.services import embeddings as embed_svc
from app.services import qdrant as qdrant_svc

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)

MEETINGS_FILE = Path(__file__).parent.parent / "app" / "data" / "meetings.json"


async def main():
    memories = json.loads(MEETINGS_FILE.read_text(encoding="utf-8"))
    logger.info("Loaded %d memory chunks", len(memories))

    texts = [m["text"] for m in memories]
    logger.info("Generating embeddings (batch)...")
    vectors = await embed_svc.embed_batch(texts)

    vector_size = len(vectors[0])
    logger.info("Vector dimension: %d", vector_size)

    await qdrant_svc.recreate_collection(vector_size)
    inserted = await qdrant_svc.upsert_memories(memories, vectors)
    logger.info("Done! Inserted %d points into Qdrant.", inserted)


if __name__ == "__main__":
    asyncio.run(main())
