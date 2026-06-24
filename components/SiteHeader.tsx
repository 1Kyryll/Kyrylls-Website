"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV: { href: string; label: string }[] = [
  { href: "/", label: "About" },
  { href: "/books", label: "Books" },
  { href: "/countries", label: "Countries" },
  { href: "/writing", label: "Writing" },
  { href: "/projects", label: "Projects" },
  { href: "/wall", label: "Wall" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled((window.scrollY || 0) > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-colors duration-200"
      style={{
        background: scrolled ? "oklch(0.985 0.003 255 / 0.78)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--line)" : "transparent"}`,
      }}
    >
      <div className="mx-auto max-w-[1160px] h-16 px-5 sm:px-8 flex items-center justify-center">
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-lg px-3 py-[7px] text-xs tracking-[0.04em] transition-colors"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: active ? "var(--ink)" : "var(--muted)",
                  background: active ? "oklch(0.93 0.006 262)" : "transparent",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
