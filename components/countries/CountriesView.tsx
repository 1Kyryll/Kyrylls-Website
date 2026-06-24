"use client";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { countries } from "@/lib/data/countries";
import { worldStats } from "@/lib/helpers";
import Flag from "./Flag";

const Globe = dynamic(() => import("./Globe"), { ssr: false });

export default function CountriesView() {
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const visited = useMemo(() => new Set(countries.map((c) => c.name)), []);
  const { worldPct, cityTotal } = worldStats(countries);
  const cq = query.trim().toLowerCase();
  const filtered = countries.filter((c) => !cq || c.name.toLowerCase().includes(cq) || c.code.toLowerCase().includes(cq));
  const sel = countries.find((c) => c.name === selected) || null;

  return (
    <section className="py-12 sm:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-3.5 text-xs tracking-[0.12em]" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>02 — ATLAS</div>
          <h2 className="m-0 font-semibold leading-[1.05] tracking-[-0.02em]" style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)" }}>Countries I&apos;ve visited</h2>
        </div>
        <div className="flex gap-1.5">
          {[{ k: false, l: "Globe · light" }, { k: true, l: "Globe · dark" }].map((m) => {
            const active = dark === m.k;
            return (
              <button key={m.l} onClick={() => setDark(m.k)} className="rounded-lg border px-3 py-2 text-[11px] tracking-[0.03em]" style={{ fontFamily: "var(--font-mono)", borderColor: active ? "var(--ink)" : "var(--line)", color: active ? "white" : "var(--muted)", background: active ? "var(--ink)" : "transparent" }}>{m.l}</button>
            );
          })}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-xl" style={{ background: "var(--line)", border: "1px solid var(--line)" }}>
        {([[countries.length, "COUNTRIES"], [`${worldPct}%`, "OF THE WORLD"], [1, "CONTINENT"], [cityTotal, "CITIES"]] as [React.ReactNode, string][]).map(([v, l]) => (
          <div key={l as string} className="p-5" style={{ background: "var(--surface)" }}>
            <div className="text-[28px] font-semibold">{v}</div>
            <div className="mt-1 text-[11px] tracking-[0.06em]" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>{l}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-5 items-stretch">
        <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: "var(--line)", background: "oklch(0.97 0.004 255)" }}>
          <Globe dark={dark} visited={visited} selected={selected} onSelect={setSelected} />
          <div className="pointer-events-none absolute bottom-3.5 left-4 z-[2] flex gap-4 text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "oklch(0.5 0.02 262)" }}>
            <span className="flex items-center gap-1.5"><span className="h-[11px] w-[11px] rounded-[3px]" style={{ background: "var(--accent)" }} />Visited</span>
            <span className="hidden sm:inline">Drag to spin · click a country</span>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          {sel && (
            <div className="rounded-2xl border p-6" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
              <div className="flex items-center justify-between">
                <div className="text-xs tracking-[0.08em]" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{sel.code} · {sel.year}</div>
                <button onClick={() => setSelected(null)} className="text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "oklch(0.6 0.02 262)" }}>✕ clear</button>
              </div>
              <div className="my-2.5 flex items-center gap-3 text-[30px] font-semibold tracking-[-0.02em]"><Flag code={sel.code} height={26} />{sel.name}</div>
              <div className="mb-4 text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>{sel.region}</div>
              <div className="mb-4 text-[13px]" style={{ fontFamily: "var(--font-mono)", color: "oklch(0.45 0.02 262)" }}>{sel.cities}</div>
              <p className="m-0 text-[15px] leading-[1.6]" style={{ color: "oklch(0.4 0.02 262)" }}>{sel.note}</p>
            </div>
          )}

          <div className="flex-1 rounded-2xl border p-4" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter countries…" className="mb-3 w-full rounded-[9px] border px-3 py-2.5 text-xs" style={{ fontFamily: "var(--font-mono)", borderColor: "var(--line)", background: "var(--bg)", color: "var(--ink)" }} />
            {filtered.map((c) => {
              const active = selected === c.name;
              return (
                <button key={c.code} onClick={() => setSelected(c.name)} className="mb-1 flex w-full items-center justify-between rounded-[10px] border px-3 py-2.5 text-left" style={{ borderColor: active ? "var(--accent)" : "transparent", background: active ? "oklch(0.58 0.2 255 / 0.08)" : "transparent" }}>
                  <span className="flex items-center gap-3"><Flag code={c.code} height={18} /><span className="text-[15px] font-medium">{c.name}</span></span>
                  <span className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "oklch(0.58 0.02 262)" }}>{c.year}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
