"use client";
import { useEffect, useRef, useState } from "react";
import { notes as DATA } from "@/lib/data/notes";

const TINTS = { quote: "oklch(0.97 0.03 250)", thought: "oklch(0.984 0.032 95)" } as const;
const STORE = "wall-notes-v1";

export default function NoteWall() {
  const [isMobile, setIsMobile] = useState(false);
  // Bumped once after saved positions load so the board re-renders with them on reload.
  const [, setHydrated] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<Record<string, { left: number; top: number; rot: number }>>({});
  const zTop = useRef(20);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    try { posRef.current = JSON.parse(localStorage.getItem(STORE) || "{}") || {}; } catch { posRef.current = {}; }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const node = boardRef.current;
    if (!node) return;
    let drag: any = null;
    const pt = (e: any) => (e.touches && e.touches[0] ? e.touches[0] : e);
    const onDown = (e: any) => {
      const note = e.target.closest("[data-note-id]");
      if (!note) return;
      const nr = note.getBoundingClientRect();
      const p = pt(e);
      drag = { note, id: note.dataset.noteId, dx: p.clientX - nr.left, dy: p.clientY - nr.top, br: node.getBoundingClientRect() };
      note.style.zIndex = String(++zTop.current);
      note.style.cursor = "grabbing";
      note.style.transition = "none";
      note.style.transform = "rotate(0deg) scale(1.04)";
      if (e.cancelable) e.preventDefault();
    };
    const onMove = (e: any) => {
      if (!drag) return;
      const p = pt(e);
      const bw = drag.br.width, bh = drag.br.height;
      let x = Math.max(0, Math.min(p.clientX - drag.br.left - drag.dx, bw - 212));
      let y = Math.max(0, Math.min(p.clientY - drag.br.top - drag.dy, bh - 70));
      drag._lp = (x / bw) * 100; drag._tp = y;
      drag.note.style.left = drag._lp + "%";
      drag.note.style.top = y + "px";
      if (e.cancelable) e.preventDefault();
    };
    const onUp = () => {
      if (!drag) return;
      drag.note.style.cursor = "grab";
      drag.note.style.transition = "transform 0.22s cubic-bezier(.2,.8,.3,1.2), box-shadow 0.18s ease";
      const rot = (Math.random() < 0.5 ? -1 : 1) * (1.5 + Math.random() * 2.5);
      drag.note.style.transform = "rotate(" + rot + "deg)";
      if (drag._lp != null) {
        posRef.current[drag.id] = { left: drag._lp, top: drag._tp, rot };
        try { localStorage.setItem(STORE, JSON.stringify(posRef.current)); } catch {}
      }
      drag = null;
    };
    node.addEventListener("mousedown", onDown);
    node.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      node.removeEventListener("mousedown", onDown);
      node.removeEventListener("touchstart", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [isMobile]);

  const Card = ({ c }: { c: typeof DATA[number] }) => (
    <div className="relative rounded-[3px] px-[17px] pb-[15px] pt-[18px] cursor-grab" style={{ boxShadow: "0 1px 2px oklch(0.2 0.02 262 / 0.10), 0 10px 22px oklch(0.2 0.02 262 / 0.13)" }}>
      <div className="absolute left-1/2 top-[-7px] h-[13px] w-[13px] -ml-[6.5px] rounded-full" style={{ background: c.type === "quote" ? "var(--accent)" : "oklch(0.7 0.16 50)", boxShadow: "0 2px 3px oklch(0.2 0.02 262 / 0.4), inset 0 -2px 2px oklch(0.2 0.02 262 / 0.25), inset 0 2px 2px white" }} />
      {c.type === "quote" ? (
        <>
          <div className="text-[15.5px] italic leading-[1.45] tracking-[-0.01em]" style={{ color: "oklch(0.24 0.02 262)" }}>&ldquo;{c.text}&rdquo;</div>
          <div className="mt-3 text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>— {c.author}</div>
        </>
      ) : (
        <div className="text-[15px] leading-[1.5]" style={{ color: "oklch(0.28 0.02 262)" }}>{c.text}</div>
      )}
    </div>
  );

  return (
    <section className="py-12 sm:py-16">
      <div className="mb-3.5 text-xs tracking-[0.12em]" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>05 — WALL</div>
      <h2 className="m-0 mb-2.5 font-semibold leading-[1.05] tracking-[-0.02em]" style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)" }}>The wall</h2>
      <p className="m-0 mb-7 text-[13px]" style={{ fontFamily: "var(--font-mono)", color: "oklch(0.55 0.02 262)" }}>Quotes and thoughts I&apos;m pinning lately{isMobile ? "." : " — drag the notes around."}</p>

      {isMobile ? (
        <div className="flex flex-col gap-5">
          {DATA.map((c) => (
            <div key={c.id} style={{ background: TINTS[c.type] }} className="rounded-[3px]">
              <Card c={c} />
            </div>
          ))}
        </div>
      ) : (
        <div ref={boardRef} className="relative h-[600px] overflow-hidden rounded-2xl border" style={{ borderColor: "var(--line)", backgroundColor: "oklch(0.978 0.004 255)", backgroundImage: "radial-gradient(oklch(0.88 0.008 262) 1px, transparent 1px)", backgroundSize: "22px 22px" }}>
          {DATA.map((c) => {
            const pos = posRef.current[c.id] || { left: c.x, top: c.y, rot: c.rot };
            return (
              <div key={c.id} data-note-id={c.id} className="absolute w-[212px]" style={{ left: pos.left + "%", top: pos.top + "px", transform: `rotate(${pos.rot}deg)`, background: TINTS[c.type], touchAction: "none", zIndex: 5 }}>
                <Card c={c} />
              </div>
            );
          })}
          <div className="pointer-events-none absolute bottom-3 right-4 text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "oklch(0.6 0.02 262)" }}>drag to rearrange · saved automatically</div>
        </div>
      )}
    </section>
  );
}
