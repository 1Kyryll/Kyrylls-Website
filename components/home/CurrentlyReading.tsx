import { books } from "@/lib/data/books";

export default function CurrentlyReading() {
  const reading = books.find((b) => b.status === "reading") ?? books[0];
  return (
    <div>
      <div className="mb-[18px] text-xs tracking-[0.1em]" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>CURRENTLY READING</div>
      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
        <div className="text-xl font-semibold tracking-[-0.01em]">{reading.title}</div>
        <div className="mt-1" style={{ color: "var(--muted)" }}>{reading.author}</div>
        <div className="mt-5 h-[5px] overflow-hidden rounded-full" style={{ background: "oklch(0.92 0.006 262)" }}>
          <div className="h-full rounded-full" style={{ width: "62%", background: "var(--accent)" }} />
        </div>
        <div className="mt-2.5 text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>62% — pg. 248 / 401</div>
      </div>
    </div>
  );
}
