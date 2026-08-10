import type { AskResponse } from "./types";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "") || "http://localhost:8000";

export class RecallApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RecallApiError";
  }
}

export async function askRecall(query: string, signal?: AbortSignal): Promise<AskResponse> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal,
    });
  } catch {
    throw new RecallApiError(
      "Couldn't reach the Recall backend. Check that it's running and BACKEND_URL is correct."
    );
  }

  if (!res.ok) {
    throw new RecallApiError(`Backend responded with an error (${res.status}).`);
  }

  let data: AskResponse;
  try {
    data = await res.json();
  } catch {
    throw new RecallApiError("Backend returned a response that couldn't be parsed.");
  }

  if (!data || typeof data.answer !== "string" || !Array.isArray(data.memories)) {
    throw new RecallApiError("Backend response was missing expected fields.");
  }

  return data;
}

/**
 * Resolves the audio field from the backend into a playable URL.
 * Handles: absolute/relative URL strings, and raw or data-uri base64 strings.
 */
export function resolveAudioSrc(audio?: string): string | null {
  if (!audio) return null;

  if (audio.startsWith("data:audio")) return audio;

  if (/^https?:\/\//i.test(audio) || audio.startsWith("/")) {
    return audio.startsWith("/") ? `${BACKEND_URL}${audio}` : audio;
  }

  // Assume raw base64-encoded audio (mp3) if it's not a URL or data-uri already.
  return `data:audio/mpeg;base64,${audio}`;
}
