"use client";
import { useEffect } from "react";
import type { Book } from "@/lib/data/books";
import { starString } from "@/lib/helpers";
import BookCover from "./BookCover";

export default function BookDrawer({ book, open, onClose }: { book: Book | null; open: boolean; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!book) return null;
  const stars = starString(book.rating);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end sm:items-stretch sm:justify-end transition-opacity duration-300"
      style={{ background: "oklch(0.2 0.02 262 / 0.42)", backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full sm:w-[min(470px,94vw)] max-h-[88vh] sm:max-h-none sm:h-screen flex-col overflow-hidden rounded-t-2xl sm:rounded-none transition-transform duration-500"
        style={{ background: "oklch(0.99 0.002 255)", boxShadow: "-24px 0 60px oklch(0.2 0.02 262 / 0.28)", transform: open ? "translate(0,0)" : "var(--drawer-hidden)", transitionTimingFunction: "cubic-bezier(.22,.8,.28,1)" }}
      >
        <div className="shrink-0 border-b px-7 pb-6 pt-6" style={{ borderColor: "oklch(0.91 0.006 262)", background: "oklch(0.975 0.004 262)" }}>
          <div className="flex items-center justify-between gap-4">
            <div className="text-[11px] tracking-[0.1em]" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{book.tag} · {book.year}</div>
            <button onClick={onClose} className="flex h-[30px] w-[30px] items-center justify-center rounded-full border text-sm" style={{ borderColor: "oklch(0.88 0.008 262)", background: "oklch(0.99 0.002 255)", color: "oklch(0.45 0.02 262)" }}>✕</button>
          </div>
          <div className="mt-5 flex items-end gap-5">
            <div className="relative h-[156px] w-[104px] shrink-0 overflow-hidden rounded-[3px_6px_6px_3px]" style={{ boxShadow: "0 10px 24px oklch(0.2 0.02 262 / 0.26)" }}>
              <BookCover isbn={book.isbn} title={book.title} size="L" priority />
            </div>
            <div className="min-w-0">
              <h3 className="m-0 mb-1.5 text-[22px] font-semibold leading-[1.16] tracking-[-0.02em]">{book.title}</h3>
              <div className="mb-3 text-sm" style={{ color: "oklch(0.5 0.02 262)" }}>{book.author}</div>
              <div className="flex items-center gap-2.5">
                <span className="text-[15px] tracking-[1.5px]"><span style={{ color: "var(--accent)" }}>{stars.filled}</span><span style={{ color: "oklch(0.85 0.006 262)" }}>{stars.empty}</span></span>
                <span className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "oklch(0.5 0.02 262)" }}>{book.rating.toFixed(1)} / 5</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-7">
          <div className="mb-3 text-[11px] tracking-[0.12em]" style={{ fontFamily: "var(--font-mono)", color: "oklch(0.55 0.02 262)" }}>MY TAKE</div>
          <p className="m-0 mb-7 text-[16.5px] leading-[1.65]" style={{ color: "oklch(0.28 0.02 262)" }}>{book.opinion}</p>
          <div className="rounded-[0_10px_10px_0] p-5" style={{ background: "oklch(0.975 0.004 262)", borderLeft: "3px solid var(--accent)" }}>
            <div className="mb-2.5 text-[11px] tracking-[0.12em]" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>WHAT STUCK WITH ME</div>
            <p className="m-0 text-[17px] italic leading-[1.55]" style={{ color: "oklch(0.26 0.02 262)" }}>{book.takeaway}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
