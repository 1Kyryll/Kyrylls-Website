import { posts } from "@/lib/data/posts";

export default function PostList() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mb-3.5 text-xs tracking-[0.12em]" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>03 — JOURNAL</div>
      <h2 className="m-0 mb-9 font-semibold leading-[1.05] tracking-[-0.02em]" style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)" }}>Writing</h2>
      {posts.map((p) => (
        <div key={p.title} className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-2 sm:gap-6 border-t py-6 cursor-pointer" style={{ borderColor: "var(--line)" }}>
          <div className="pt-1 text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>{p.date}<br /><span style={{ color: "oklch(0.68 0.02 262)" }}>{p.read}</span></div>
          <div>
            <h3 className="m-0 mb-2 text-[22px] font-semibold tracking-[-0.01em]">{p.title}</h3>
            <p className="m-0 mb-3 max-w-[62ch] text-base leading-[1.55]" style={{ color: "oklch(0.46 0.02 262)" }}>{p.excerpt}</p>
            <span className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>read →</span>
          </div>
        </div>
      ))}
    </section>
  );
}
