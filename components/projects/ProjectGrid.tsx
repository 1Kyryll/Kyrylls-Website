import { projects } from "@/lib/data/projects";

export default function ProjectGrid() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mb-3.5 text-xs tracking-[0.12em]" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>04 — WORK</div>
      <h2 className="m-0 mb-9 font-semibold leading-[1.05] tracking-[-0.02em]" style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)" }}>Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((pr) => (
          <div key={pr.name} className="flex min-h-[190px] flex-col rounded-2xl border p-6" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
            <div className="mb-3.5 flex items-center justify-between">
              <span className="text-xl font-semibold tracking-[-0.01em]">{pr.name}</span>
              <span className="text-[11px]" style={{ fontFamily: "var(--font-mono)", color: pr.status === "live" ? "oklch(0.6 0.17 150)" : "oklch(0.7 0.15 70)" }}>● {pr.status}</span>
            </div>
            <p className="m-0 mb-auto text-[15px] leading-[1.55]" style={{ color: "oklch(0.46 0.02 262)" }}>{pr.desc}</p>
            <div className="mt-[18px] flex flex-wrap gap-1.5">
              {pr.tech.map((t) => (
                <span key={t} className="rounded-md border px-2.5 py-[3px] text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "oklch(0.5 0.02 262)", borderColor: "var(--line)" }}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
