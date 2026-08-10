"""
Ask route — the core demo endpoint.

Flow:
  1. Embed the user query.
  2. Search Qdrant for top-k relevant memories.
  3. Send ONLY the retrieved memories to the LLM.
  4. Call Rime TTS for the spoken answer (gracefully skipped if unconfigured).
  5. Return answer + audio (base64) + retrieved memories with scores.
"""
import logging
from fastapi import APIRouter, HTTPException
from app.models import AskRequest, AskResponse, MeetingMemory
from app.services import embeddings as embed_svc
from app.services import qdrant as qdrant_svc
from app.services import llm as llm_svc
from app.services import rime as rime_svc

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/ask", response_model=AskResponse)
async def ask(request: AskRequest):
    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query must not be empty.")

    logger.info("Received query: %s", query)

    # Step 1: Embed the query
    try:
        query_vector = await embed_svc.embed_text(query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding failed: {e}")

    # Step 2: Retrieve top-5 memories from Qdrant
    try:
        results = await qdrant_svc.search_memories(query_vector, top_k=5)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Qdrant search failed: {e}")

    if not results:
        logger.warning("Qdrant returned no results for query: %s", query)

    # Step 3: Build memory objects with scores for logging + response
    memories_raw = []
    memories_for_response = []
    for hit in results:
        payload = hit.payload or {}
        memories_raw.append(payload)
        memories_for_response.append(
            MeetingMemory(
                meeting_id=payload.get("meeting_id", ""),
                meeting_name=payload.get("meeting_name", ""),
                date=payload.get("date", ""),
                timestamp=payload.get("timestamp", ""),
                speaker=payload.get("speaker", ""),
                text=payload.get("text", ""),
                topic=payload.get("topic", ""),
                memory_type=payload.get("memory_type", "discussion"),
                score=round(hit.score, 4),
            )
        )

    # Step 4: Generate grounded answer from LLM using ONLY retrieved memories
    try:
        answer = await llm_svc.generate_answer(query, memories_raw)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM generation failed: {e}")

    # Step 5: TTS via Rime (best-effort — does not fail the request)
    audio_b64 = await rime_svc.synthesize(answer)
    if audio_b64 is None:
        logger.info("No audio generated (Rime not configured or failed).")

    return AskResponse(
        query=query,
        answer=answer,
        audio=audio_b64,
        memories=memories_for_response,
    )
