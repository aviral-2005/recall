"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Minimal ambient types for the Web Speech API, which isn't in TS's default DOM lib.
interface SpeechRecognitionEventLike extends Event {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

interface UseSpeechRecognitionOptions {
  onFinalResult: (transcript: string) => void;
}

export function useSpeechRecognition({ onFinalResult }: UseSpeechRecognitionOptions) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalResultRef = useRef(onFinalResult);
  onFinalResultRef.current = onFinalResult;

  useEffect(() => {
    const SpeechRecognitionCtor =
      typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;
    setIsSupported(!!SpeechRecognitionCtor);
  }, []);

  const start = useCallback(() => {
    const SpeechRecognitionCtor =
      typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;
    if (!SpeechRecognitionCtor) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimTranscript(interim || final);
      if (final.trim()) {
        onFinalResultRef.current(final.trim());
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setInterimTranscript("");
    setIsListening(true);
    recognition.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isSupported, isListening, interimTranscript, start, stop };
}
