import type { Memory } from "@/lib/types";

const TYPE_STYLES: Record<string, string> = {
  commitment: "text-amber border-amber/30 bg-amber/5",
  decision: "text-signal border-signal/30 bg-signal/5",
  discussion: "text-ink-muted border-base-border bg-base-surface2",
};

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function MemoryCard({ memory, index }: { memory: Memory; index: number }) {
  const typeStyle = TYPE_STYLES[memory.memory_type ?? ""] ?? TYPE_STYLES.discussion;

  return (
    <div
      className="animate-fade-up rounded-xl border border-base-border bg-base-surface p-4
        transition-colors duration-200 hover:border-signal/25"
      style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-sm font-medium text-ink-primary">{memory.meeting_name}</h3>
        {memory.memory_type && (
          <span className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${typeStyle}`}>
            {memory.memory_type}
          </span>
        )}
      </div>

      <div className="mt-1.5 flex items-center gap-2 font-mono text-[11px] text-ink-faint">
        <span>{formatDate(memory.date)}</span>
        <span className="text-base-border">·</span>
        <span>{memory.timestamp}</span>
        <span className="text-base-border">·</span>
        <span className="text-ink-muted">{memory.speaker}</span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        <span className="text-signal/70">&ldquo;</span>
        {memory.text}
        <span className="text-signal/70">&rdquo;</span>
      </p>
    </div>
  );
}
