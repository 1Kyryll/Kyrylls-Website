import { OWNER_NAME } from "@/lib/data/site";

export default function SiteFooter() {
  return (
    <footer className="mt-10 border-t" style={{ borderColor: "var(--line)" }}>
      <div
        className="mx-auto flex max-w-[1160px] flex-wrap justify-between gap-3 px-5 py-7 sm:px-8"
        style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.04em", color: "oklch(0.58 0.02 262)" }}
      >
        <span>© 2026 {OWNER_NAME}</span>
        <span>Built with Next.js · Space Grotesk + JetBrains Mono</span>
      </div>
    </footer>
  );
}
