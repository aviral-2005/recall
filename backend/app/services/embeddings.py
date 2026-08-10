"""
Embedding service — wraps an OpenAI-compatible embeddings API.
"""
import logging
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger(__name__)


def _make_client() -> AsyncOpenAI:
    """Always create a fresh client from current settings (avoids stale cached credentials)."""
    return AsyncOpenAI(
        api_key=settings.effective_embeddings_api_key,
        base_url=settings.effective_embeddings_base_url,
    )


async def embed_text(text: str) -> list[float]:
    """Return a single embedding vector for *text*."""
    client = _make_client()
    logger.debug("Embedding text (first 80 chars): %s", text[:80])
    response = await client.embeddings.create(
        model=settings.embeddings_model,
        input=text,
    )
    return response.data[0].embedding


async def embed_batch(texts: list[str]) -> list[list[float]]:
    """
    Return embeddings for a list of texts in a single API call.

    NOTE: The Gemini API (and some other providers) return d.index as None,
    so we cannot sort by it. Instead we send texts one-by-one in a loop to
    guarantee ordering, OR we trust the provider returns them in input order
    (which Gemini does) and skip the sort entirely.

    For safety we embed each text individually so ordering is always guaranteed,
    at the cost of N API calls instead of 1. For a ~20-item seed this is fine.
    """
    client = _make_client()
    logger.info("Embedding batch of %d texts (sequential)", len(texts))
    results = []
    for i, text in enumerate(texts):
        logger.debug("Embedding [%d/%d]: %s", i + 1, len(texts), text[:60])
        response = await client.embeddings.create(
            model=settings.embeddings_model,
            input=text,
        )
        results.append(response.data[0].embedding)
    return results

