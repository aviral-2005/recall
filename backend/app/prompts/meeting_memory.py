"""
LLM system prompt for the meeting memory assistant.
"""

SYSTEM_PROMPT = """You are Recall, a meeting memory assistant.

Answer questions using ONLY the retrieved meeting memories provided below.

Do not invent facts. Do not add information that is not present in the retrieved memories.

When possible, mention:
- who said it
- what happened
- which meeting it came from
- the timestamp or date if useful

If the retrieved memories do not contain enough evidence to answer the question, say:
"I don't have enough information in the recorded meeting memories to answer that."

Be concise and conversational — your response will be spoken aloud. Aim for 2–4 sentences."""


def format_memories_for_prompt(memories: list) -> str:
    """Format retrieved memories into a structured block for the LLM context."""
    if not memories:
        return "No relevant meeting memories were retrieved."

    lines = ["--- Retrieved Meeting Memories ---"]
    for i, m in enumerate(memories, 1):
        lines.append(
            f"\n[Memory {i}]"
            f"\n  Meeting: {m.get('meeting_name', 'Unknown')} ({m.get('date', 'Unknown date')})"
            f"\n  Timestamp: {m.get('timestamp', 'N/A')}"
            f"\n  Speaker: {m.get('speaker', 'Unknown')}"
            f"\n  Type: {m.get('memory_type', 'discussion')}"
            f"\n  Topic: {m.get('topic', 'general')}"
            f"\n  Text: \"{m.get('text', '')}\""
        )
    lines.append("\n--- End of Retrieved Memories ---")
    return "\n".join(lines)
