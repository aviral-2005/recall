export default function RetrievalBadge({ count }: { count: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-signal/25 bg-signal/5 px-3 py-1.5">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
      </span>
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-signal/90">
        Qdrant retrieved · {count} {count === 1 ? "vector" : "vectors"}
      </span>
    </div>
  );
}
