"use client";

import { MicState } from "@/lib/types";

interface MicButtonProps {
  state: MicState;
  onClick: () => void;
  disabled?: boolean;
}

const WAVE_DELAYS = [0, 0.12, 0.24, 0.36, 0.48];

export default function MicButton({ state, onClick, disabled }: MicButtonProps) {
  const isListening = state === "listening";
  const isProcessing = state === "processing";
  const isComplete = state === "complete";
  const isError = state === "error";

  const ringColor = isError ? "border-red-400/40" : "border-signal/40";
  const coreGradient = isError
    ? "from-red-400/20 to-red-500/5"
    : isListening
    ? "from-signal/30 to-signal/5"
    : "from-signal/15 to-transparent";

  return (
    <div className="relative flex flex-col items-center gap-5">
      <div className="relative flex h-40 w-40 items-center justify-center">
        {isListening && (
          <>
            <span className="absolute inline-flex h-full w-full animate-sonar-ping rounded-full border border-signal/50" />
            <span
              className="absolute inline-flex h-full w-full animate-sonar-ping rounded-full border border-signal/40"
              style={{ animationDelay: "0.5s" }}
            />
            <span
              className="absolute inline-flex h-full w-full animate-sonar-ping rounded-full border border-signal/30"
              style={{ animationDelay: "1s" }}
            />
          </>
        )}

        <button
          onClick={onClick}
          disabled={disabled || isProcessing}
          aria-label={
            isListening ? "Stop listening" : isProcessing ? "Processing your question" : "Ask a question by voice"
          }
          className={`group relative flex h-32 w-32 items-center justify-center rounded-full border-2 ${ringColor}
            bg-gradient-to-b ${coreGradient} bg-base-surface
            shadow-[0_0_40px_-8px_rgba(94,234,212,0.25)]
            transition-all duration-300 ease-out
            hover:scale-[1.03] hover:shadow-[0_0_56px_-8px_rgba(94,234,212,0.4)]
            active:scale-[0.98]
            disabled:cursor-wait disabled:hover:scale-100
            focus-visible:outline-offset-4`}
        >
          {isProcessing ? (
            <div className="flex items-end gap-[3px] h-8">
              {WAVE_DELAYS.map((delay, i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-signal animate-wave-bar origin-bottom"
                  style={{ height: "28px", animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          ) : isComplete ? (
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-signal" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : isError ? (
            <svg viewBox="0 0 24 24" className="h-9 w-9 text-red-400" fill="none">
              <path
                d="M12 8v5M12 16h.01M4.5 19h15a1 1 0 00.87-1.5l-7.5-13a1 1 0 00-1.74 0l-7.5 13A1 1 0 004.5 19z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className={`h-10 w-10 transition-colors ${isListening ? "text-signal" : "text-ink-primary group-hover:text-signal"}`}
              fill="none"
            >
              <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
              <path
                d="M5 11a7 7 0 0014 0M12 18v3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
        {isListening
          ? "Listening…"
          : isProcessing
          ? "Retrieving memory…"
          : isComplete
          ? "Answered"
          : isError
          ? "Something went wrong"
          : "Ask your meeting memory"}
      </p>
    </div>
  );
}
