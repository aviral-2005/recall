"use client";

import { useCallback, useRef, useState } from "react";
import MicButton from "@/components/MicButton";
import QueryChips from "@/components/QueryChips";
import AnswerPanel from "@/components/AnswerPanel";
import MemoryCard from "@/components/MemoryCard";
import RetrievalBadge from "@/components/RetrievalBadge";
import { askRecall, resolveAudioSrc, RecallApiError } from "@/lib/api";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";
import type { AskResponse, MicState } from "@/lib/types";

export default function Home() {
  const [micState, setMicState] = useState<MicState>("idle");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AskResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const submitQuery = useCallback(async (q: string) => {
    if (!q.trim()) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setQuery(q);
    setErrorMessage(null);
    setResult(null);
    setMicState("processing");

    try {
      const data = await askRecall(q, controller.signal);
      setResult(data);
      setMicState("complete");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const message = err instanceof RecallApiError ? err.message : "Something went wrong. Try again.";
      setErrorMessage(message);
      setMicState("error");
    }
  }, []);

  const { isSupported, isListening, interimTranscript, start, stop } = useSpeechRecognition({
    onFinalResult: (transcript) => {
      stop();
      submitQuery(transcript);
    },
  });

  const handleMicClick = () => {
    if (micState === "processing") return;

    if (isListening) {
      stop();
      setMicState("idle");
      return;
    }

    if (!isSupported) {
      setErrorMessage(
        "Voice input isn't supported in this browser. Try Chrome, or use an example question below."
      );
      setMicState("error");
      return;
    }

    setErrorMessage(null);
    setResult(null);
    setQuery("");
    setMicState("listening");
    start();
  };

  const isBusy = micState === "listening" || micState === "processing";
  const audioSrc = result ? resolveAudioSrc(result.audio) : null;

  return (
    <main className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center px-6 pb-24 pt-16 sm:pt-24">
      {/* Ambient backdrop signature: sonar contour lines behind the hero */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden">
        <svg viewBox="0 0 800 400" className="h-[420px] w-[900px] opacity-[0.15]" fill="none">
          {[80, 140, 200, 260, 320].map((r) => (
            <circle key={r} cx="400" cy="140" r={r} stroke="#5EEAD4" strokeWidth="1" />
          ))}
        </svg>
      </div>

      <header className="flex flex-col items-center text-center">
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink-primary sm:text-4xl">
          Recall
        </h1>
        <p className="mt-2 text-sm text-ink-muted sm:text-base">Talk to your meeting history.</p>
      </header>

      <div className="mt-14">
        <MicButton state={micState} onClick={handleMicClick} disabled={micState === "processing"} />
      </div>

      <div className="mt-6 h-6 text-center">
        {isListening && interimTranscript && (
          <p className="animate-fade-in font-mono text-sm text-ink-muted">&ldquo;{interimTranscript}&rdquo;</p>
        )}
        {!isBusy && !result && !errorMessage && (
          <p className="font-mono text-sm text-ink-faint">&ldquo; What did Raj commit to doing? &rdquo;</p>
        )}
      </div>

      <div className="mt-10 w-full">
        <QueryChips onSelect={submitQuery} disabled={isBusy} />
      </div>

      {errorMessage && (
        <div className="animate-fade-up mt-10 w-full rounded-xl border border-red-400/25 bg-red-400/5 px-5 py-4 text-center">
          <p className="text-sm text-red-300">{errorMessage}</p>
        </div>
      )}

      {result && (
        <div className="mt-12 w-full space-y-8">
          {query && (
            <p className="text-center font-mono text-xs uppercase tracking-[0.16em] text-ink-faint">
              &ldquo;{query}&rdquo;
            </p>
          )}

          <AnswerPanel answer={result.answer} audioSrc={audioSrc} />

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-medium text-ink-primary">Retrieved Memories</h2>
              <RetrievalBadge count={result.memories.length} />
            </div>

            {result.memories.length === 0 ? (
              <p className="rounded-xl border border-base-border bg-base-surface p-4 text-sm text-ink-muted">
                No matching memories were found for this query.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {result.memories.map((memory, i) => (
                  <MemoryCard key={`${memory.meeting_id}-${i}`} memory={memory} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
