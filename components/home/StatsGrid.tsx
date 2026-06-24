import Link from "next/link";

const tiles = [
  { href: "/books", label: "BOOKS LOGGED →" },
  { href: "/countries", label: "COUNTRIES VISITED →" },
  { href: "/writing", label: "THINGS WRITTEN →" },
];

export default function StatsGrid({ counts }: { counts: [number, number, number] }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-px overflow-hidden rounded-2xl"
      style={{ background: "var(--line)", border: "1px solid var(--line)" }}
    >
      {tiles.map((t, i) => (
        <Link key={t.href} href={t.href} className="p-6 sm:p-7" style={{ background: "var(--surface)" }}>
          <div className="text-4xl font-semibold tracking-[-0.02em]">{counts[i]}</div>
          <div className="mt-1.5 text-xs tracking-[0.06em]" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>{t.label}</div>
        </Link>
      ))}
    </div>
  );
}
