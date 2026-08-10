export type MemoryType = "commitment" | "decision" | "discussion" | string;

export interface Memory {
  meeting_id: string;
  meeting_name: string;
  date: string; // ISO date, e.g. "2026-08-05"
  timestamp: string; // e.g. "00:14"
  speaker: string;
  text: string;
  memory_type?: MemoryType;
}

export interface AskResponse {
  query: string;
  answer: string;
  audio?: string; // URL or base64 string
  memories: Memory[];
}

export type MicState = "idle" | "listening" | "processing" | "complete" | "error";
