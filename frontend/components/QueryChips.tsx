"use client";

const EXAMPLE_QUERIES = [
  "What did Raj commit to doing?",
  "Why did we choose PostgreSQL?",
  "When did we discuss authentication?",
  "What decisions did we make about the backend?",
];

interface QueryChipsProps {
  onSelect: (query: string) => void;
  disabled?: boolean;
}

export default function QueryChips({ onSelect, disabled }: QueryChipsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
      {EXAMPLE_QUERIES.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          disabled={disabled}
          className="rounded-full border border-base-border bg-base-surface px-4 py-2 text-sm text-ink-muted
            transition-colors duration-200
            hover:border-signal/40 hover:text-ink-primary hover:bg-base-surface2
            disabled:cursor-not-allowed disabled:opacity-40"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
