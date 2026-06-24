"use client";
import { useEffect, useRef, useState } from "react";
import { books as ALL } from "@/lib/data/books";
import type { Book } from "@/lib/data/books";
import { filterBooks, bookTags, starString, coverUrl } from "@/lib/helpers";
import BookCover from "./BookCover";
import BookDrawer from "./BookDrawer";

export default function BooksLibrary() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("All");
  const [openBook, setOpenBook] = useState<Book | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const filtered = filterBooks(ALL, query, tag);
  const tags = bookTags(ALL);

  const open = (b: Book) => {
    setOpenBook(b);
    setDrawerOpen(false);
    clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => setDrawerOpen(true), 40);
  };
  const close = () => {
    setDrawerOpen(false);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenBook(null), 560);
  };
  const prefetch = (isbn: string) => { const img = new Image(); img.src = coverUrl(isbn, "L"); };

  useEffect(() => () => { clearTimeout(openTimer.current); clearTimeout(closeTimer.current); }, []);

  return (
    <section className="py-12 sm:py-16">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-3.5 text-xs tracking-[0.12em]" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>01 — LIBRARY</div>
          <h2 className="m-0 font-semibold leading-[1.05] tracking-[-0.02em]" style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)" }}>Books I&apos;ve read</h2>
        </div>
        <div className="text-[13px]" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>{filtered.length} of {ALL.length} shown</div>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title or author…"
          className="min-w-[220px] flex-1 rounded-[10px] border px-4 py-3 text-[13px]"
          style={{ fontFamily: "var(--font-mono)", borderColor: "var(--line)", background: "var(--surface)", color: "var(--ink)" }}
        />
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => {
            const active = tag === t;
            return (
              <button
                key={t}
                onClick={() => setTag(t)}
                className="whitespace-nowrap rounded-lg border px-3 py-[7px] text-[11px] tracking-[0.03em] transition-colors"
                style={{ fontFamily: "var(--font-mono)", borderColor: active ? "var(--accent)" : "var(--line)", color: active ? "white" : "var(--muted)", background: active ? "var(--accent)" : "transparent" }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-[13px]" style={{ fontFamily: "var(--font-mono)", color: "oklch(0.6 0.02 262)" }}>No books match &quot;{query}&quot;</div>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {filtered.map((b) => {
            const stars = starString(b.rating);
            return (
              <div key={b.isbn + b.title} onClick={() => open(b)} onMouseEnter={() => prefetch(b.isbn)} className="cursor-pointer group">
                <div className="relative overflow-hidden rounded-[3px_7px_7px_3px] transition-transform duration-200 group-hover:-translate-y-2.5" style={{ aspectRatio: "2 / 3", boxShadow: "0 2px 4px oklch(0.2 0.02 262 / 0.10), 0 13px 22px oklch(0.2 0.02 262 / 0.18)" }}>
                  <BookCover isbn={b.isbn} title={b.title} />
                  <div className="pointer-events-none absolute left-0 top-0 h-full w-1.5" style={{ background: "linear-gradient(90deg, oklch(0.2 0.02 262 / 0.28), transparent)" }} />
                  {b.status === "reading" && (
                    <span className="absolute right-2 top-2 rounded-md px-1.5 py-[3px] text-[8px] tracking-[0.08em] text-white" style={{ fontFamily: "var(--font-mono)", background: "oklch(0.6 0.17 150)" }}>READING</span>
                  )}
                </div>
                <div className="mt-3 line-clamp-2 h-[33px] overflow-hidden text-[13px] font-medium leading-[1.25] tracking-[-0.01em]">{b.title}</div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-xs" style={{ color: "oklch(0.55 0.02 262)" }}>{b.author}</span>
                  <span className="whitespace-nowrap text-[11px] tracking-[1px]"><span style={{ color: "var(--accent)" }}>{stars.filled}</span><span style={{ color: "oklch(0.85 0.006 262)" }}>{stars.empty}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BookDrawer book={openBook} open={drawerOpen} onClose={close} />
    </section>
  );
}
