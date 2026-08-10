"""
LLM service — generates grounded answers from retrieved memories.
"""
import logging
from openai import AsyncOpenAI
from app.config import settings
from app.prompts.meeting_memory import SYSTEM_PROMPT, format_memories_for_prompt

logger = logging.getLogger(__name__)

def _make_client() -> AsyncOpenAI:
    """Always create a fresh client from current settings."""
    return AsyncOpenAI(
        api_key=settings.llm_api_key,
        base_url=settings.llm_base_url,
    )


async def generate_answer(query: str, memories: list[dict]) -> str:
    """
    Generate a grounded answer using ONLY the retrieved memories.
    Never sends the full meeting database — only the top-k retrieved chunks.
    """
    client = _make_client()
    memories_block = format_memories_for_prompt(memories)

    user_message = (
        f"Question: {query}\n\n"
        f"{memories_block}\n\n"
        "Please answer the question using only the retrieved memories above."
    )

    logger.info(
        "Calling LLM with %d memories for query: %s", len(memories), query
    )

    response = await client.chat.completions.create(
        model=settings.llm_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.2,
        max_tokens=300,
    )

    answer = response.choices[0].message.content.strip()
    logger.info("LLM answer: %s", answer)
    return answer
