# Recall — Frontend

Voice-first meeting memory demo. Ask a question out loud (or tap an example),
and Recall returns a grounded answer, the retrieved meeting memories, and a
spoken response.

This is the frontend only. It expects a backend running `POST /api/ask` (see
API contract below). It never talks to Qdrant, Rime, or an LLM directly —
that all lives behind the backend.

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS
- Web Speech API for voice input (Chrome/Edge; falls back to example query chips elsewhere)
- No auth, no database, no state library — `useState` only

## Setup

```bash
npm install
cp .env.local.example .env.local
# edit .env.local and set NEXT_PUBLIC_BACKEND_URL to your backend's origin
npm run dev
```

Open http://localhost:3000.

For a production-style run:

```bash
npm run build
npm run start
```

## Configuring the backend URL

Set `NEXT_PUBLIC_BACKEND_URL` in `.env.local` (see `.env.local.example`).
It must be reachable from the browser (this is a client-side call), and
should be the backend's origin with no trailing slash, e.g.:

```
NEXT_PUBLIC_BACKEND_URL=https://recall-backend.example.com
```

Defaults to `http://localhost:8000` if unset.

## API contract

`POST {BACKEND_URL}/api/ask`

Request:

```json
{ "query": "What did Raj commit to doing?" }
```

Response:

```json
{
  "query": "What did Raj commit to doing?",
  "answer": "Raj committed to handling the authentication layer in the architecture meeting and the Render deployment in the deployment meeting.",
  "audio": "https://.../response.mp3",
  "memories": [
    {
      "meeting_id": "arch-001",
      "meeting_name": "Architecture Meeting",
      "date": "2026-08-05",
      "timestamp": "00:14",
      "speaker": "Raj",
      "text": "I'll take care of the authentication layer.",
      "memory_type": "commitment"
    }
  ]
}
```

`audio` may be:
- an absolute URL (`https://...`)
- a path on the backend origin (`/audio/xyz.mp3`)
- a raw base64-encoded MP3 string
- a `data:audio/...;base64,...` URI

All four are handled automatically (`lib/api.ts` → `resolveAudioSrc`).

## Demo flow

1. Tap the mic. Speak a question, e.g. "What did Raj commit to doing?"
   - States: idle → listening (live transcript shown) → processing → complete
2. If mic permissions aren't available, use one of the four example chips
   below the mic — same flow, skips speech recognition.
3. Answer appears with a "Play response" button (plays the backend's audio).
4. Retrieved memory cards appear below, each showing meeting, date,
   timestamp, speaker, and the source line — with a small "Qdrant retrieved"
   badge so retrieval is visible during the demo.
5. Errors (backend unreachable, bad response, mic unsupported) show inline
   without breaking the page.

## Project structure

```
recall-frontend/
├── app/
│   ├── layout.tsx        # fonts, metadata, root shell
│   ├── page.tsx           # main screen — all demo orchestration
│   └── globals.css        # base styles, reduced-motion support
├── components/
│   ├── MicButton.tsx      # idle/listening/processing/complete/error states
│   ├── QueryChips.tsx     # example question shortcuts
│   ├── AnswerPanel.tsx    # grounded answer + play response
│   ├── MemoryCard.tsx     # single retrieved memory
│   └── RetrievalBadge.tsx # "Qdrant retrieved · N vectors" indicator
├── lib/
│   ├── types.ts               # Memory / AskResponse / MicState
│   ├── api.ts                 # askRecall(), resolveAudioSrc()
│   └── useSpeechRecognition.ts# Web Speech API hook
├── .env.local.example
├── tailwind.config.ts
└── package.json
```
