import { focus } from "@/lib/data/site";

export default function FocusList() {
  return (
    <div>
      <div className="mb-[18px] text-xs tracking-[0.1em]" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>FOCUS</div>
      {focus.map((f) => (
        <div key={f.n} className="flex items-baseline gap-3.5 py-[13px] text-base border-t" style={{ borderColor: "var(--line)" }}>
          <span className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{f.n}</span>
          <span>{f.label}</span>
        </div>
      ))}
    </div>
  );
}
