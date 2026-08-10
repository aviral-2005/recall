# Recall — Voice-First Meeting Memory Assistant

**Hackathon prototype.** Ask questions about past meetings. Get grounded, spoken answers backed by Qdrant vector search.

---

## How It Works

```
User query (text or voice)
  │
  ▼
Embed query (OpenAI-compatible embeddings)
  │
  ▼
Search Qdrant (cosine similarity, top-5)
  │
  ▼
Retrieved meeting memories (with scores)
  │
  ▼
LLM (only sees retrieved memories — NOT the full database)
  │
  ▼
Grounded answer
  │
  ▼
Rime TTS → base64 MP3 audio
  │
  ▼
API response: { query, answer, audio, memories }
```

---

## Setup

### 1. Prerequisites

- Python 3.11+
- Qdrant running locally **or** a Qdrant Cloud cluster
- OpenAI API key (or any OpenAI-compatible provider)
- Rime API key (optional — audio is skipped if not set)

### 2. Run Qdrant locally (Docker)

```bash
docker run -p 6333:6333 qdrant/qdrant
```

Qdrant dashboard → http://localhost:6333/dashboard

### 3. Install dependencies

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Configure environment

```bash
cp .env.example .env
# Edit .env and fill in your API keys
```

Minimum required:
```
QDRANT_URL=http://localhost:6333
LLM_API_KEY=sk-...
```

### 5. Seed Qdrant

**Option A — via the API (server must be running):**
```bash
curl -X POST http://localhost:8000/api/seed
```

**Option B — standalone script:**
```bash
cd backend
python scripts/seed_qdrant.py
```

### 6. Start the server

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Interactive API docs → http://localhost:8000/docs

---

## API Endpoints

### `GET /health`
```bash
curl http://localhost:8000/health
```
```json
{"status": "ok"}
```

---

### `POST /api/seed`
Recreates the `meeting_memories` Qdrant collection and inserts all demo data.
```bash
curl -X POST http://localhost:8000/api/seed
```
```json
{"status": "seeded", "inserted": 21}
```

---

### `POST /api/ask`
The core endpoint. Runs the full RAG pipeline.
```bash
curl -X POST http://localhost:8000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What did Raj commit to doing?"}'
```

```json
{
  "query": "What did Raj commit to doing?",
  "answer": "Raj committed to two things: in the Architecture Meeting on August 5th, he said he'd take care of the authentication layer. In the Deployment Planning Meeting on August 7th, he committed to handling the Render deployment.",
  "audio": "<base64-encoded MP3 or null>",
  "memories": [
    {
      "meeting_id": "architecture-001",
      "meeting_name": "Architecture Meeting",
      "date": "2026-08-05",
      "timestamp": "00:14",
      "speaker": "Raj",
      "text": "I'll take care of the authentication layer.",
      "topic": "authentication",
      "memory_type": "commitment",
      "score": 0.91
    }
  ]
}
```

**All demo queries:**
```bash
curl -X POST http://localhost:8000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "Why did we choose PostgreSQL?"}'

curl -X POST http://localhost:8000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "When did we discuss authentication?"}'

curl -X POST http://localhost:8000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What decisions did we make about the backend?"}'
```

---

### `POST /api/transcribe`
Upload audio and get the transcript.
```bash
curl -X POST http://localhost:8000/api/transcribe \
  -F "audio=@/path/to/recording.webm"
```
```json
{"text": "What did Raj commit to doing?"}
```

---

## Frontend Integration

Minimal example (fetch):
```js
// Text query
const res = await fetch("http://localhost:8000/api/ask", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: "What did Raj commit to doing?" }),
});
const data = await res.json();

// data.answer — the text answer
// data.memories — the retrieved Qdrant chunks (with scores)
// data.audio — base64 MP3; play it like this:
if (data.audio) {
  const audio = new Audio("data:audio/mp3;base64," + data.audio);
  audio.play();
}

// Voice input
const formData = new FormData();
formData.append("audio", audioBlob, "recording.webm");
const sttRes = await fetch("http://localhost:8000/api/transcribe", {
  method: "POST",
  body: formData,
});
const { text } = await sttRes.json();
// then pass text to /api/ask
```

---

## Project Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI app, CORS, route registration
│   ├── config.py        # Pydantic settings from .env
│   ├── models.py        # Request/response models
│   ├── data/
│   │   └── meetings.json        # 21 seed memory chunks (3 meetings)
│   ├── prompts/
│   │   └── meeting_memory.py    # System prompt + memory formatter
│   ├── routes/
│   │   ├── health.py
│   │   ├── seed.py
│   │   ├── ask.py
│   │   └── transcribe.py
│   └── services/
│       ├── embeddings.py   # OpenAI-compatible embeddings
│       ├── qdrant.py       # Collection management + search
│       ├── llm.py          # Grounded answer generation
│       ├── rime.py         # TTS (graceful fallback)
│       └── stt.py          # Whisper-compatible transcription
├── scripts/
│   └── seed_qdrant.py   # Standalone seed script
├── requirements.txt
├── .env.example
└── README.md
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `QDRANT_URL` | Yes | Qdrant instance URL |
| `QDRANT_API_KEY` | Cloud only | Qdrant Cloud API key |
| `LLM_API_KEY` | Yes | OpenAI or compatible API key |
| `LLM_BASE_URL` | No | Defaults to OpenAI |
| `LLM_MODEL` | No | Defaults to `gpt-4o-mini` |
| `EMBEDDINGS_API_KEY` | No | Defaults to LLM_API_KEY |
| `EMBEDDINGS_MODEL` | No | Defaults to `text-embedding-3-small` |
| `RIME_API_KEY` | No | Rime TTS — audio skipped if absent |
| `RIME_SPEAKER` | No | Defaults to `aurora` |
| `STT_API_KEY` | No | Defaults to LLM_API_KEY |
| `CORS_ORIGINS` | No | Comma-separated allowed origins |
