"use client";

import { useEffect, useRef, useState } from "react";

interface AnswerPanelProps {
  answer: string;
  audioSrc: string | null;
}

export default function AnswerPanel({ answer, audioSrc }: AnswerPanelProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setAudioError(false);
  }, [audioSrc]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
    } else {
      el.play().catch(() => setAudioError(true));
    }
  };

  return (
    <div className="animate-fade-up rounded-2xl border border-base-border bg-base-surface p-6 shadow-[0_0_60px_-24px_rgba(94,234,212,0.2)]">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-signal" />
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-signal/80">Recall</span>
      </div>

      <p className="mt-3 font-display text-xl leading-snug text-ink-primary sm:text-2xl">
        {answer}
      </p>

      {audioSrc && (
        <div className="mt-5">
          <button
            onClick={togglePlay}
            className="inline-flex items-center gap-2.5 rounded-full border border-signal/30 bg-signal/5 px-4 py-2
              text-sm text-signal transition-colors duration-200 hover:bg-signal/10
              disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M7 5v14l12-7L7 5z" />
              </svg>
            )}
            {isPlaying ? "Pause" : "Play response"}
          </button>
          {audioError && (
            <p className="mt-2 font-mono text-[11px] text-red-400/80">
              Audio couldn&apos;t play. The response is still shown above.
            </p>
          )}
          <audio
            ref={audioRef}
            src={audioSrc}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onError={() => setAudioError(true)}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
