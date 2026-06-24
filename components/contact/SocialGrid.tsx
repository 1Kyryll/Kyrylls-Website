import { socials, EMAIL } from "@/lib/data/site";

export default function SocialGrid() {
  return (
    <section className="py-16 sm:py-[88px]">
      <div className="mb-3.5 text-xs tracking-[0.12em]" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>06 — CONTACT</div>
      <h2 className="m-0 mb-6 max-w-[18ch] font-semibold leading-[1.05] tracking-[-0.02em]" style={{ fontSize: "clamp(2rem, 7vw, 2.75rem)" }}>Say hello. I read every message.</h2>
      <a href={`mailto:${EMAIL}`} className="mb-12 inline-block pb-0.5 text-[22px] no-underline" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", borderBottom: "2px solid var(--accent)" }}>{EMAIL}</a>
      <div className="grid max-w-[620px] grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-xl" style={{ background: "var(--line)", border: "1px solid var(--line)" }}>
        {socials.map((s) => (
          <a key={s.label} href={s.href} className="flex items-center gap-2.5 p-5 no-underline transition-colors" style={{ background: "var(--surface)", color: "oklch(0.32 0.02 262)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="var(--accent)" className="block shrink-0"><path d={s.iconPath} /></svg>
            <span>{s.label}</span>
            <span className="ml-auto" style={{ color: "oklch(0.62 0.02 262)" }}>↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}
