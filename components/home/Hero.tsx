import { FIRST_NAME, EMAIL } from "@/lib/data/site";

export default function Hero() {
  return (
    <div>
      <div className="mb-7 text-xs tracking-[0.12em]" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>// PERSONAL SITE — 2026</div>
      <h1 className="m-0 mb-7 max-w-[16ch] font-semibold leading-[1.05] tracking-[-0.025em]" style={{ fontSize: "clamp(2rem, 7vw, 3.5rem)" }}>
        Hi, I&apos;m {FIRST_NAME}. I build software and show my story.
      </h1>
      <p className="m-0 mb-10 max-w-[60ch] text-lg leading-[1.6]" style={{ color: "oklch(0.4 0.02 262)" }}>
        I care about technology, science and medias. This is my corner of the internet — a log of what I read, where I&apos;ve been, and what I&apos;m thinking about.
      </p>
      <div className="mb-16 flex flex-wrap gap-x-7 gap-y-2 text-[13px]" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
        <span className="flex items-center gap-2">
          <span className="h-[7px] w-[7px] rounded-full" style={{ background: "oklch(0.6 0.17 150)", animation: "pulse 2.4s ease infinite" }} />
          Available for work
        </span>
        <span>↳ Warsaw, PL</span>
        <span>↳ {EMAIL}</span>
      </div>
    </div>
  );
}
