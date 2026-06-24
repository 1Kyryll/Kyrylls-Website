# Personal Site Next.js Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-platform the existing single-file `Personal Site.dc.html` design onto a production Next.js app (App Router + Tailwind v4 + TypeScript) with real routes per section, optimized book-cover loading, and first-class mobile responsiveness.

**Architecture:** App Router with one route per section sharing a layout (header/footer). Static sections are server components reading from typed `lib/data/*.ts`. Three interactive islands are client components: `BooksLibrary` (search/filter/drawer), `Globe` (D3 orthographic, dynamic `ssr:false`), `NoteWall` (drag + localStorage; stacks on mobile). The oklch color system + `--accent` (`#d65151`) live as CSS variables in `globals.css`.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS v4, `next/font` (Space Grotesk + JetBrains Mono), `d3`, `topojson-client`, `polygon-clipping`, vendored `world-atlas` JSON. Tests: Vitest.

---

## File Structure

```
app/
  layout.tsx                 # html/body, fonts, theme, header + footer
  globals.css                # @import tailwind, theme tokens (oklch vars), keyframes
  page.tsx                   # About / Home (server)
  books/page.tsx             # renders <BooksLibrary/>
  countries/page.tsx         # renders <CountriesView/>
  writing/page.tsx           # renders <PostList/>
  projects/page.tsx          # renders <ProjectGrid/>
  now/page.tsx               # renders <NoteWall/>
  contact/page.tsx           # renders <SocialGrid/>
components/
  SiteHeader.tsx             # 'use client' — nav, usePathname, scroll state
  SiteFooter.tsx
  home/Hero.tsx, StatsGrid.tsx, FocusList.tsx, CurrentlyReading.tsx
  books/BooksLibrary.tsx     # 'use client'
  books/BookCover.tsx        # 'use client' — next/image + woven fallback
  books/BookDrawer.tsx       # 'use client'
  countries/CountriesView.tsx# 'use client'
  countries/Globe.tsx        # 'use client' (loaded via dynamic ssr:false)
  countries/globe-draw.ts    # pure-ish D3 draw module (no React)
  writing/PostList.tsx
  projects/ProjectGrid.tsx
  now/NoteWall.tsx           # 'use client'
  contact/SocialGrid.tsx
lib/
  data/books.ts countries.ts posts.ts projects.ts notes.ts site.ts
  theme.ts                   # accent default + palette presets
  helpers.ts                 # chunk, starString, filterBooks, worldStats
  helpers.test.ts
public/
  atlas/countries-110m.json
```

---

## Task 1: Scaffold Next.js + Tailwind v4 project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`
- Create: `vitest.config.ts`

- [ ] **Step 1: Create the Next.js app non-interactively into the current folder**

The folder already contains files (docs, original html, .git), so scaffold into a temp dir and move, or create files manually. Use manual creation to avoid clobbering. Run:

```bash
npm init -y
npm install next@latest react@latest react-dom@latest
npm install -D typescript @types/react @types/node @types/react-dom tailwindcss @tailwindcss/postcss vitest @vitejs/plugin-react jsdom @testing-library/react
npm install d3 topojson-client polygon-clipping
npm install -D @types/d3 @types/topojson-client
```

- [ ] **Step 2: Write `package.json` scripts**

Merge these scripts into `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Write `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "covers.openlibrary.org" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 5: Write `postcss.config.mjs`**

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

- [ ] **Step 6: Write `app/globals.css` with the theme tokens**

```css
@import "tailwindcss";

@theme {
  --font-display: var(--font-space-grotesk), system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), monospace;
}

:root {
  --accent: oklch(0.5775 0.211 17.5);   /* #d65151 */
  --ink: oklch(0.21 0.02 262);
  --muted: oklch(0.52 0.02 262);
  --line: oklch(0.9 0.006 262);
  --surface: oklch(0.995 0.001 255);
  --bg: oklch(0.985 0.003 255);
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-display);
}
::selection { background: oklch(0.58 0.2 255 / 0.18); }
input { font-family: inherit; }
input::placeholder { color: oklch(0.62 0.02 262); }
input:focus { outline: none; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
```

Note: `--accent` is the oklch form of `#d65151`. If a reviewer prefers exactness, `rgb(214 81 81)` is also valid in modern browsers — keep the oklch value, it renders identically here.

- [ ] **Step 7: Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", globals: true },
  resolve: { alias: { "@": __dirname } },
});
```

- [ ] **Step 8: Write minimal `app/layout.tsx` (fonts + theme wiring)**

```tsx
import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Kyryll Pavlenko",
  description: "Software engineer & reader. Books, places, and writing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://covers.openlibrary.org" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 9: Write placeholder `app/page.tsx`**

```tsx
export default function Home() {
  return <main style={{ padding: 32 }}>Home — scaffold OK</main>;
}
```

- [ ] **Step 10: Verify dev build compiles**

Run: `npm run build`
Expected: build completes with no errors; `/` route listed.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js + Tailwind v4 project"
```

---

## Task 2: Data layer + typed schemas (placeholder content)

**Files:**
- Create: `lib/data/site.ts`, `books.ts`, `countries.ts`, `posts.ts`, `projects.ts`, `notes.ts`
- Create: `lib/theme.ts`

- [ ] **Step 1: Write `lib/theme.ts`**

```ts
// Accent default matches the original design (#d65151 / rgb(214,81,81)).
export const ACCENT_DEFAULT = "var(--accent)";

// Optional palette presets carried over from the original (not surfaced in UI).
export const PALETTES = {
  Mint: "oklch(0.62 0.105 162)",
  "Indigo Slate": "oklch(0.5 0.13 264)",
  Pine: "oklch(0.5 0.085 168)",
  Clay: "oklch(0.56 0.11 45)",
  Plum: "oklch(0.5 0.12 350)",
} as const;
```

- [ ] **Step 2: Write `lib/data/site.ts`**

```ts
export interface FocusItem { n: string; label: string; }
export interface Social { label: string; href: string; iconPath: string; }

export const OWNER_NAME = "Kyryll Pavlenko";
export const OWNER_ROLE = "Software Engineer";
export const FIRST_NAME = OWNER_NAME.split(" ")[0];
export const EMAIL = "hello@kyryll.dev"; // TODO: replace with your real contact email

export const focus: FocusItem[] = [
  { n: "01", label: "Backend systems & data" },
  { n: "02", label: "Developer tools" },
  { n: "03", label: "Maps & data visualization" },
  { n: "04", label: "Writing & teaching" },
];

// SVG path data for icons (24x24 viewBox).
export const socials: Social[] = [
  { label: "GitHub", href: "#", iconPath: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" },
  { label: "Twitter", href: "#", iconPath: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { label: "LinkedIn", href: "#", iconPath: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" },
  { label: "RSS", href: "#", iconPath: "M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248S0 22.546 0 20.752s1.456-3.248 3.252-3.248 3.251 1.454 3.251 3.248zM1.677 6.082v4.15c6.988 0 12.65 5.662 12.65 12.65h4.15C18.477 13.668 11.91 7.1 1.677 6.082zm0-6.082v4.15C13.225 4.15 19.85 10.775 19.85 22.323H24C24 8.482 15.518 0 1.677 0z" },
];
```

- [ ] **Step 3: Write `lib/data/books.ts` (placeholder)**

```ts
export interface Book {
  title: string;
  author: string;
  year: number;
  rating: 1 | 2 | 3 | 4 | 5;
  tag: string;
  status?: "reading";
  isbn: string;
  opinion: string;
  takeaway: string;
}

// TODO: replace with your real books.
export const books: Book[] = [
  { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", year: 2025, rating: 5, tag: "Tech", isbn: "9781449373320", opinion: "Placeholder opinion — what you thought of it.", takeaway: "Placeholder takeaway — the one idea that stuck." },
  { title: "The Beginning of Infinity", author: "David Deutsch", year: 2026, rating: 5, tag: "Science", status: "reading", isbn: "9780143121350", opinion: "Placeholder opinion — what you thought of it.", takeaway: "Placeholder takeaway — the one idea that stuck." },
  { title: "The Left Hand of Darkness", author: "Ursula K. Le Guin", year: 2024, rating: 5, tag: "Fiction", isbn: "9780441478125", opinion: "Placeholder opinion — what you thought of it.", takeaway: "Placeholder takeaway — the one idea that stuck." },
];
```

- [ ] **Step 4: Write `lib/data/countries.ts` (placeholder)**

```ts
export interface Country {
  name: string;   // MUST match the world-atlas country name for map highlighting
  code: string;
  flag: string;
  year: number;
  region: string;
  cities: string; // " · "-separated
  note: string;
}

// TODO: replace with the countries you've visited.
// `name` must match the atlas name exactly (e.g. "Ukraine", "Poland").
export const countries: Country[] = [
  { name: "Ukraine", code: "UA", flag: "🇺🇦", year: 2019, region: "Eastern Europe", cities: "Kyiv · Lviv · Odesa", note: "Placeholder note about this country." },
  { name: "Poland", code: "PL", flag: "🇵🇱", year: 2021, region: "Central Europe", cities: "Warsaw · Kraków · Gdańsk", note: "Placeholder note about this country." },
  { name: "Germany", code: "DE", flag: "🇩🇪", year: 2024, region: "Western Europe", cities: "Berlin · Munich", note: "Placeholder note about this country." },
];
```

- [ ] **Step 5: Write `lib/data/posts.ts` and `projects.ts` and `notes.ts` (placeholder)**

`lib/data/posts.ts`:
```ts
export interface Post { date: string; read: string; title: string; excerpt: string; }

// TODO: replace with your real posts.
export const posts: Post[] = [
  { date: "2026-05-12", read: "6 min", title: "Placeholder post title", excerpt: "Placeholder excerpt — one or two sentences summarizing the piece." },
  { date: "2026-03-02", read: "4 min", title: "Another placeholder post", excerpt: "Placeholder excerpt — one or two sentences summarizing the piece." },
];
```

`lib/data/projects.ts`:
```ts
export interface Project { name: string; desc: string; status: "live" | "wip"; tech: string[]; }

// TODO: replace with your real projects.
export const projects: Project[] = [
  { name: "Placeholder Project", desc: "Placeholder description of what it does and why it exists.", status: "live", tech: ["TypeScript", "Next.js"] },
  { name: "Another Project", desc: "Placeholder description of what it does and why it exists.", status: "wip", tech: ["Rust"] },
];
```

`lib/data/notes.ts`:
```ts
export interface Note {
  id: string;
  type: "quote" | "thought";
  text: string;
  author?: string;
  x: number;   // left %, desktop board
  y: number;   // top px, desktop board
  rot: number; // degrees
}

// TODO: replace with your own quotes and thoughts.
export const notes: Note[] = [
  { id: "n1", type: "thought", text: "Placeholder thought — something you're chewing on.", x: 1.5, y: 16, rot: -3 },
  { id: "n2", type: "quote", text: "Placeholder quote goes here.", author: "Author", x: 30, y: 40, rot: 2.5 },
  { id: "n3", type: "thought", text: "Placeholder thought — something you're chewing on.", x: 58, y: 14, rot: -1.5 },
  { id: "n4", type: "quote", text: "Placeholder quote goes here.", author: "Author", x: 20, y: 230, rot: 2 },
];
```

- [ ] **Step 6: Verify typecheck passes**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add typed data layer with placeholder content"
```

---

## Task 3: Pure helpers + tests (TDD)

**Files:**
- Create: `lib/helpers.ts`
- Test: `lib/helpers.test.ts`

- [ ] **Step 1: Write the failing tests**

`lib/helpers.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { chunk, starString, filterBooks, worldStats } from "./helpers";
import type { Book } from "./data/books";

const b = (over: Partial<Book>): Book => ({
  title: "T", author: "A", year: 2020, rating: 4, tag: "Tech",
  isbn: "1", opinion: "o", takeaway: "k", ...over,
});

describe("chunk", () => {
  it("splits into groups of n", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
  it("returns [] for empty", () => {
    expect(chunk([], 5)).toEqual([]);
  });
});

describe("starString", () => {
  it("returns filled + empty stars", () => {
    expect(starString(3)).toEqual({ filled: "★★★", empty: "☆☆" });
  });
});

describe("filterBooks", () => {
  const list = [b({ title: "Dune", author: "Herbert", tag: "Fiction" }), b({ title: "Sapiens", author: "Harari", tag: "History" })];
  it("filters by tag", () => {
    expect(filterBooks(list, "", "History").map((x) => x.title)).toEqual(["Sapiens"]);
  });
  it("All tag returns everything", () => {
    expect(filterBooks(list, "", "All")).toHaveLength(2);
  });
  it("matches title or author case-insensitively", () => {
    expect(filterBooks(list, "herb", "All").map((x) => x.title)).toEqual(["Dune"]);
  });
});

describe("worldStats", () => {
  it("computes percent of 195 and city total", () => {
    const c = [{ cities: "A · B" } as any, { cities: "C" } as any];
    const s = worldStats(c);
    expect(s.cityTotal).toBe(3);
    expect(s.worldPct).toBe("1.0");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `helpers.ts` has no such exports.

- [ ] **Step 3: Implement `lib/helpers.ts`**

```ts
import type { Book } from "./data/books";

export function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

export function starString(rating: number): { filled: string; empty: string } {
  return { filled: "★".repeat(rating), empty: "☆".repeat(5 - rating) };
}

export function filterBooks(list: Book[], query: string, tag: string): Book[] {
  const q = query.trim().toLowerCase();
  return list
    .filter((b) => tag === "All" || b.tag === tag)
    .filter((b) => !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
}

export function worldStats(countries: { cities: string }[]): { worldPct: string; cityTotal: number } {
  const cityTotal = countries.reduce((a, c) => a + c.cities.split("·").length, 0);
  const worldPct = ((countries.length / 195) * 100).toFixed(1);
  return { worldPct, cityTotal };
}

export const coverUrl = (isbn: string, size: "M" | "L") =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg?default=false`;

export function bookTags(list: Book[]): string[] {
  return ["All", ...Array.from(new Set(list.map((b) => b.tag)))];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all helper tests green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add pure helpers with unit tests"
```

---

## Task 4: Site chrome — header (responsive nav) + footer + layout

**Files:**
- Create: `components/SiteHeader.tsx`, `components/SiteFooter.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write `components/SiteHeader.tsx`**

Mobile = horizontally-scrollable mono tab strip; desktop = centered row. Active route via `usePathname`. Background blur appears after scrolling 8px.

```tsx
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
  { href: "/now", label: "Now" },
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
```

- [ ] **Step 2: Add `.no-scrollbar` utility to `app/globals.css`**

Append:
```css
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

- [ ] **Step 3: Write `components/SiteFooter.tsx`**

```tsx
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
```

- [ ] **Step 4: Wire header/footer into `app/layout.tsx`**

Replace the `<body>` contents:
```tsx
      <body>
        <SiteHeader />
        <div className="mx-auto max-w-[1160px] px-5 sm:px-8">{children}</div>
        <SiteFooter />
      </body>
```
Add imports at top:
```tsx
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
```

- [ ] **Step 5: Verify build + nav renders**

Run: `npm run build`
Expected: build passes. (Manual: `npm run dev`, nav bar visible, scrolls horizontally on a narrow window.)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add responsive site header and footer"
```

---

## Task 5: Home / About page

**Files:**
- Create: `components/home/Hero.tsx`, `components/home/StatsGrid.tsx`, `components/home/FocusList.tsx`, `components/home/CurrentlyReading.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write `components/home/StatsGrid.tsx`** (3 stat tiles → 1 col on phone)

```tsx
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
```

- [ ] **Step 2: Write `components/home/FocusList.tsx`**

```tsx
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
```

- [ ] **Step 3: Write `components/home/CurrentlyReading.tsx`**

```tsx
import { books } from "@/lib/data/books";

export default function CurrentlyReading() {
  const reading = books.find((b) => b.status === "reading") ?? books[0];
  return (
    <div>
      <div className="mb-[18px] text-xs tracking-[0.1em]" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>CURRENTLY READING</div>
      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
        <div className="text-xl font-semibold tracking-[-0.01em]">{reading.title}</div>
        <div className="mt-1" style={{ color: "var(--muted)" }}>{reading.author}</div>
        <div className="mt-5 h-[5px] overflow-hidden rounded-full" style={{ background: "oklch(0.92 0.006 262)" }}>
          <div className="h-full rounded-full" style={{ width: "62%", background: "var(--accent)" }} />
        </div>
        <div className="mt-2.5 text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>62% — pg. 248 / 401</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write `components/home/Hero.tsx`** (fluid headline)

```tsx
import { FIRST_NAME, EMAIL } from "@/lib/data/site";

export default function Hero() {
  return (
    <div>
      <div className="mb-7 text-xs tracking-[0.12em]" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>// PERSONAL SITE — 2026</div>
      <h1 className="m-0 mb-7 max-w-[16ch] font-semibold leading-[1.05] tracking-[-0.025em]" style={{ fontSize: "clamp(2rem, 7vw, 3.5rem)" }}>
        Hi, I&apos;m {FIRST_NAME}. I build software and read a lot.
      </h1>
      <p className="m-0 mb-10 max-w-[60ch] text-lg leading-[1.6]" style={{ color: "oklch(0.4 0.02 262)" }}>
        I care about clear systems, good typography, and finishing books. This is my corner of the internet — a log of what I read, where I&apos;ve been, and what I&apos;m thinking about.
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
```

- [ ] **Step 5: Assemble `app/page.tsx`**

```tsx
import Hero from "@/components/home/Hero";
import StatsGrid from "@/components/home/StatsGrid";
import FocusList from "@/components/home/FocusList";
import CurrentlyReading from "@/components/home/CurrentlyReading";
import { books } from "@/lib/data/books";
import { countries } from "@/lib/data/countries";
import { posts } from "@/lib/data/posts";

export default function Home() {
  return (
    <main className="py-12 sm:py-[88px]">
      <Hero />
      <StatsGrid counts={[books.length, countries.length, posts.length]} />
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
        <FocusList />
        <CurrentlyReading />
      </div>
    </main>
  );
}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: passes; `/` renders hero + stats + two columns.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: build home/about page"
```

---

## Task 6: Writing, Projects, Contact pages (static sections)

**Files:**
- Create: `components/writing/PostList.tsx`, `components/projects/ProjectGrid.tsx`, `components/contact/SocialGrid.tsx`
- Create: `app/writing/page.tsx`, `app/projects/page.tsx`, `app/contact/page.tsx`

- [ ] **Step 1: Write `components/writing/PostList.tsx`**

```tsx
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
```

- [ ] **Step 2: Write `components/projects/ProjectGrid.tsx`**

```tsx
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
```

- [ ] **Step 3: Write `components/contact/SocialGrid.tsx`** (4 cols → 2 on phone)

```tsx
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
```

- [ ] **Step 4: Write the three route files**

`app/writing/page.tsx`:
```tsx
import PostList from "@/components/writing/PostList";
export default function Page() { return <PostList />; }
```
`app/projects/page.tsx`:
```tsx
import ProjectGrid from "@/components/projects/ProjectGrid";
export default function Page() { return <ProjectGrid />; }
```
`app/contact/page.tsx`:
```tsx
import SocialGrid from "@/components/contact/SocialGrid";
export default function Page() { return <SocialGrid />; }
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: `/writing`, `/projects`, `/contact` all listed and compile.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add writing, projects, and contact pages"
```

---

## Task 7: Books — optimized covers + library + drawer

**Files:**
- Create: `components/books/BookCover.tsx`, `components/books/BookDrawer.tsx`, `components/books/BooksLibrary.tsx`
- Create: `app/books/page.tsx`

- [ ] **Step 1: Write `components/books/BookCover.tsx`** (optimized loading)

`next/image`, size-appropriate source, lazy by default, woven fallback on error.

```tsx
"use client";
import Image from "next/image";
import { useState } from "react";
import { coverUrl } from "@/lib/helpers";

const WOVEN = "repeating-linear-gradient(135deg, oklch(0.93 0.006 262) 0 11px, oklch(0.955 0.004 262) 11px 22px)";

export default function BookCover({ isbn, title, size = "M", priority = false }: { isbn: string; title: string; size?: "M" | "L"; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="absolute inset-0" style={{ background: WOVEN }}>
      {!failed && (
        <Image
          src={coverUrl(isbn, size)}
          alt={title}
          fill
          sizes={size === "L" ? "120px" : "(max-width: 640px) 45vw, 180px"}
          className="object-cover"
          loading={priority ? undefined : "lazy"}
          priority={priority}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write `components/books/BookDrawer.tsx`**

Bottom sheet on phone, right drawer on `sm+`. Animates open after mount; ESC + backdrop close.

```tsx
"use client";
import { useEffect } from "react";
import type { Book } from "@/lib/data/books";
import { starString } from "@/lib/helpers";
import BookCover from "./BookCover";

export default function BookDrawer({ book, open, onClose }: { book: Book | null; open: boolean; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!book) return null;
  const stars = starString(book.rating);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end sm:items-stretch sm:justify-end transition-opacity duration-300"
      style={{ background: "oklch(0.2 0.02 262 / 0.42)", backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full sm:w-[min(470px,94vw)] max-h-[88vh] sm:max-h-none sm:h-screen flex-col overflow-hidden rounded-t-2xl sm:rounded-none transition-transform duration-500"
        style={{ background: "oklch(0.99 0.002 255)", boxShadow: "-24px 0 60px oklch(0.2 0.02 262 / 0.28)", transform: open ? "translate(0,0)" : "var(--drawer-hidden)", transitionTimingFunction: "cubic-bezier(.22,.8,.28,1)" }}
      >
        <div className="shrink-0 border-b px-7 pb-6 pt-6" style={{ borderColor: "oklch(0.91 0.006 262)", background: "oklch(0.975 0.004 262)" }}>
          <div className="flex items-center justify-between gap-4">
            <div className="text-[11px] tracking-[0.1em]" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{book.tag} · {book.year}</div>
            <button onClick={onClose} className="flex h-[30px] w-[30px] items-center justify-center rounded-full border text-sm" style={{ borderColor: "oklch(0.88 0.008 262)", background: "oklch(0.99 0.002 255)", color: "oklch(0.45 0.02 262)" }}>✕</button>
          </div>
          <div className="mt-5 flex items-end gap-5">
            <div className="relative h-[156px] w-[104px] shrink-0 overflow-hidden rounded-[3px_6px_6px_3px]" style={{ boxShadow: "0 10px 24px oklch(0.2 0.02 262 / 0.26)" }}>
              <BookCover isbn={book.isbn} title={book.title} size="L" priority />
            </div>
            <div className="min-w-0">
              <h3 className="m-0 mb-1.5 text-[22px] font-semibold leading-[1.16] tracking-[-0.02em]">{book.title}</h3>
              <div className="mb-3 text-sm" style={{ color: "oklch(0.5 0.02 262)" }}>{book.author}</div>
              <div className="flex items-center gap-2.5">
                <span className="text-[15px] tracking-[1.5px]"><span style={{ color: "var(--accent)" }}>{stars.filled}</span><span style={{ color: "oklch(0.85 0.006 262)" }}>{stars.empty}</span></span>
                <span className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "oklch(0.5 0.02 262)" }}>{book.rating.toFixed(1)} / 5</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-7">
          <div className="mb-3 text-[11px] tracking-[0.12em]" style={{ fontFamily: "var(--font-mono)", color: "oklch(0.55 0.02 262)" }}>MY TAKE</div>
          <p className="m-0 mb-7 text-[16.5px] leading-[1.65]" style={{ color: "oklch(0.28 0.02 262)" }}>{book.opinion}</p>
          <div className="rounded-[0_10px_10px_0] p-5" style={{ background: "oklch(0.975 0.004 262)", borderLeft: "3px solid var(--accent)" }}>
            <div className="mb-2.5 text-[11px] tracking-[0.12em]" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>WHAT STUCK WITH ME</div>
            <p className="m-0 text-[17px] italic leading-[1.55]" style={{ color: "oklch(0.26 0.02 262)" }}>{book.takeaway}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

Add the hidden-state transform helper to `app/globals.css`:
```css
:root { --drawer-hidden: translateY(100%); }
@media (min-width: 640px) { :root { --drawer-hidden: translateX(100%); } }
```

- [ ] **Step 2b: Run typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Write `components/books/BooksLibrary.tsx`**

State: query, tag, openBook, drawerOpen. Grid 2/3/5 cols. Hover prefetches `-L` cover via an `<link rel="prefetch">`-style new Image().

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { books as ALL } from "@/lib/data/books";
import type { Book } from "@/lib/data/books";
import { filterBooks, bookTags, starString, coverUrl } from "@/lib/helpers";
import BookCover from "./BookCover";
import BookDrawer from "./BookDrawer";

export default function BooksLibrary() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("All");
  const [openBook, setOpenBook] = useState<Book | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout>>();
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  const filtered = filterBooks(ALL, query, tag);
  const tags = bookTags(ALL);

  const open = (b: Book) => {
    setOpenBook(b);
    setDrawerOpen(false);
    clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => setDrawerOpen(true), 40);
  };
  const close = () => {
    setDrawerOpen(false);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenBook(null), 560);
  };
  const prefetch = (isbn: string) => { const img = new Image(); img.src = coverUrl(isbn, "L"); };

  useEffect(() => () => { clearTimeout(openTimer.current); clearTimeout(closeTimer.current); }, []);

  return (
    <section className="py-12 sm:py-16">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-3.5 text-xs tracking-[0.12em]" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>01 — LIBRARY</div>
          <h2 className="m-0 font-semibold leading-[1.05] tracking-[-0.02em]" style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)" }}>Books I&apos;ve read</h2>
        </div>
        <div className="text-[13px]" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>{filtered.length} of {ALL.length} shown</div>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title or author…"
          className="min-w-[220px] flex-1 rounded-[10px] border px-4 py-3 text-[13px]"
          style={{ fontFamily: "var(--font-mono)", borderColor: "var(--line)", background: "var(--surface)", color: "var(--ink)" }}
        />
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => {
            const active = tag === t;
            return (
              <button
                key={t}
                onClick={() => setTag(t)}
                className="whitespace-nowrap rounded-lg border px-3 py-[7px] text-[11px] tracking-[0.03em] transition-colors"
                style={{ fontFamily: "var(--font-mono)", borderColor: active ? "var(--accent)" : "var(--line)", color: active ? "white" : "var(--muted)", background: active ? "var(--accent)" : "transparent" }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-[13px]" style={{ fontFamily: "var(--font-mono)", color: "oklch(0.6 0.02 262)" }}>No books match &quot;{query}&quot;</div>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {filtered.map((b) => {
            const stars = starString(b.rating);
            return (
              <div key={b.isbn + b.title} onClick={() => open(b)} onMouseEnter={() => prefetch(b.isbn)} className="cursor-pointer group">
                <div className="relative overflow-hidden rounded-[3px_7px_7px_3px] transition-transform duration-200 group-hover:-translate-y-2.5" style={{ aspectRatio: "2 / 3", boxShadow: "0 2px 4px oklch(0.2 0.02 262 / 0.10), 0 13px 22px oklch(0.2 0.02 262 / 0.18)" }}>
                  <BookCover isbn={b.isbn} title={b.title} />
                  <div className="pointer-events-none absolute left-0 top-0 h-full w-1.5" style={{ background: "linear-gradient(90deg, oklch(0.2 0.02 262 / 0.28), transparent)" }} />
                  {b.status === "reading" && (
                    <span className="absolute right-2 top-2 rounded-md px-1.5 py-[3px] text-[8px] tracking-[0.08em] text-white" style={{ fontFamily: "var(--font-mono)", background: "oklch(0.6 0.17 150)" }}>READING</span>
                  )}
                </div>
                <div className="mt-3 line-clamp-2 h-[33px] overflow-hidden text-[13px] font-medium leading-[1.25] tracking-[-0.01em]">{b.title}</div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-xs" style={{ color: "oklch(0.55 0.02 262)" }}>{b.author}</span>
                  <span className="whitespace-nowrap text-[11px] tracking-[1px]"><span style={{ color: "var(--accent)" }}>{stars.filled}</span><span style={{ color: "oklch(0.85 0.006 262)" }}>{stars.empty}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BookDrawer book={openBook} open={drawerOpen} onClose={close} />
    </section>
  );
}
```

- [ ] **Step 4: Write `app/books/page.tsx`**

```tsx
import BooksLibrary from "@/components/books/BooksLibrary";
export default function Page() { return <BooksLibrary />; }
```

- [ ] **Step 5: Verify build + typecheck**

Run: `npm run build`
Expected: `/books` compiles; no type errors. (Manual: covers lazy-load as you scroll, drawer slides in, ESC closes.)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add books library with optimized cover loading and drawer"
```

---

## Task 8: Countries — vendored atlas + D3 globe + view

**Files:**
- Create: `public/atlas/countries-110m.json` (downloaded)
- Create: `components/countries/globe-draw.ts`, `components/countries/Globe.tsx`, `components/countries/CountriesView.tsx`
- Create: `app/countries/page.tsx`

- [ ] **Step 1: Vendor the world atlas**

```bash
mkdir -p public/atlas
curl -L -o public/atlas/countries-110m.json https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json
```
Expected: file ~100KB, valid JSON (`node -e "JSON.parse(require('fs').readFileSync('public/atlas/countries-110m.json'))" && echo OK`).

- [ ] **Step 2: Write `components/countries/globe-draw.ts`**

Port the original `drawMap` logic verbatim into a framework-free module. It takes the container node, the atlas, options, and callbacks; returns a cleanup function. (Source: original `drawMap`/`ensureMap`/`rotateToFeature`/tooltip logic.)

```ts
import * as d3 from "d3";
import * as topojson from "topojson-client";
import polygonClipping from "polygon-clipping";

export interface GlobeOptions {
  dark: boolean;
  accent: string;
  visited: Set<string>;
  onSelect: (name: string) => void;
}
export interface GlobeHandle {
  destroy: () => void;
  selectByName: (name: string) => void;
  rebuild: (opts: GlobeOptions) => void;
}

export function createGlobe(node: HTMLElement, world: any, opts: GlobeOptions): GlobeHandle {
  const NS = "http://www.w3.org/2000/svg";
  let rotation: [number, number] = [-28, -22];
  let raf = 0, animSpin = 0;
  let dragging = false, hovering = false, animating = false;
  let cleanupFns: Array<() => void> = [];
  let pathByName: Record<string, { el: SVGPathElement; visited: boolean }> = {};
  let geoEls: { el: SVGPathElement; feature: any }[] = [];
  let borderEls: { el: SVGPathElement; feature: any }[] = [];
  let redraw = () => {};
  let tipEl: HTMLDivElement | null = null;
  let current = opts;

  function build(o: GlobeOptions) {
    current = o;
    const dark = o.dark;
    const accent = o.accent;
    if (raf) cancelAnimationFrame(raf);
    node.innerHTML = "";
    node.style.cursor = "grab";
    node.style.background = dark
      ? "radial-gradient(circle at 50% 42%, oklch(0.26 0.03 262), oklch(0.17 0.02 262) 72%)"
      : "radial-gradient(circle at 50% 42%, oklch(0.995 0.002 255), oklch(0.965 0.004 255) 80%)";

    const land = topojson.feature(world, world.objects.countries) as any;
    const ukFeat = land.features.find((f: any) => f.properties && f.properties.name === "Ukraine");
    if (ukFeat) {
      const crimeaPoly = [[[36.65, 45.35], [36.4, 45.0], [35.5, 44.95], [34.7, 44.45], [33.95, 44.38], [33.45, 44.6], [32.45, 45.4], [33.0, 46.1], [33.6, 46.2], [34.9, 46.05], [35.6, 45.95], [36.2, 45.45], [36.65, 45.35]]];
      try {
        let merged = polygonClipping.union(ukFeat.geometry.coordinates as any, crimeaPoly as any);
        let geom: any = { type: "MultiPolygon", coordinates: merged };
        if (d3.geoArea(geom) > 2 * Math.PI) {
          geom.coordinates = (merged as any).map((poly: any) => poly.map((ring: any) => ring.slice().reverse()));
        }
        geom.coordinates = geom.coordinates
          .map((poly: any) => [poly[0]])
          .filter((poly: any) => d3.geoArea({ type: "Polygon", coordinates: poly } as any) > 1e-7);
        ukFeat.geometry = geom;
      } catch {}
    }

    const w = node.clientWidth || 760, h = node.clientHeight || 520;
    const proj = d3.geoOrthographic().clipAngle(90).rotate(rotation).translate([w / 2, h / 2]).scale(Math.min(w, h) / 2 - 16);
    const path = d3.geoPath(proj);
    const graticule = d3.geoGraticule10();
    const sphere: any = { type: "Sphere" };

    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.display = "block";
    svg.style.touchAction = "none";
    svg.style.shapeRendering = "geometricPrecision";
    const mk = (tag: string) => document.createElementNS(NS, tag) as any;

    const oceanFill = dark ? "oklch(0.235 0.03 255)" : "oklch(0.955 0.011 235)";
    const sph = mk("path"); sph.setAttribute("d", path(sphere) || ""); sph.style.fill = oceanFill; sph.style.stroke = dark ? "oklch(0.42 0.04 255)" : "oklch(0.87 0.012 245)"; sph.style.strokeWidth = "1"; svg.appendChild(sph);
    const gr = mk("path"); gr.setAttribute("fill", "none"); gr.style.stroke = dark ? "oklch(0.34 0.02 255)" : "oklch(0.9 0.008 245)"; gr.style.strokeWidth = "0.5"; svg.appendChild(gr);

    const landFill = dark ? "oklch(0.33 0.018 262)" : "oklch(0.9 0.008 255)";
    const base = (p: any, visited: boolean) => { p.style.fill = visited ? accent : landFill; p.style.stroke = "none"; p.style.filter = "none"; };
    const emph = (p: any, visited: boolean) => { if (visited) { p.style.filter = dark ? "drop-shadow(0 0 7px " + accent + ")" : "brightness(1.07)"; } else { p.style.fill = dark ? "oklch(0.4 0.018 262)" : "oklch(0.84 0.011 255)"; } };

    const landG = mk("g"); svg.appendChild(landG);
    pathByName = {}; geoEls = [];
    land.features.forEach((f: any) => {
      const name = f.properties && f.properties.name;
      const visited = o.visited.has(name);
      const p = mk("path");
      p.style.cursor = visited ? "pointer" : "grab";
      p.style.transition = "fill 0.18s ease, filter 0.18s ease";
      base(p, visited);
      p.addEventListener("mouseenter", () => { hovering = true; emph(p, visited); showTip(name, visited); });
      p.addEventListener("mousemove", (e: any) => moveTip(e));
      p.addEventListener("mouseleave", () => { hovering = false; base(p, visited); hideTip(); });
      if (visited) p.addEventListener("click", (e: any) => { e.stopPropagation(); o.onSelect(name); });
      pathByName[name] = { el: p, visited };
      geoEls.push({ el: p, feature: f });
      landG.appendChild(p);
    });

    const ukGeom = world.objects.countries.geometries.find((g: any) => g.properties && g.properties.name === "Ukraine");
    const borderColor = dark ? "oklch(0.52 0.025 255)" : "oklch(0.72 0.012 255)";
    const meshGeom = topojson.mesh(world, world.objects.countries, (a: any, b: any) => a !== ukGeom && b !== ukGeom);
    const meshEl = mk("path"); meshEl.setAttribute("fill", "none"); meshEl.style.stroke = borderColor; meshEl.style.strokeWidth = "0.7"; meshEl.style.strokeLinejoin = "round"; meshEl.style.strokeLinecap = "round"; meshEl.style.pointerEvents = "none"; svg.appendChild(meshEl);
    borderEls = [{ el: meshEl, feature: meshGeom }];
    if (ukFeat) { const ukLine = mk("path"); ukLine.setAttribute("fill", "none"); ukLine.style.stroke = borderColor; ukLine.style.strokeWidth = "0.7"; ukLine.style.strokeLinejoin = "round"; ukLine.style.pointerEvents = "none"; svg.appendChild(ukLine); borderEls.push({ el: ukLine, feature: ukFeat }); }

    node.appendChild(svg);

    const tip = document.createElement("div");
    tip.style.cssText = "position:absolute;pointer-events:none;opacity:0;transform:translate(-50%,-135%);font-family:var(--font-mono),monospace;font-size:11px;padding:5px 9px;border-radius:7px;background:oklch(0.21 0.02 262);color:white;white-space:nowrap;transition:opacity 0.12s ease;z-index:6;";
    node.appendChild(tip); tipEl = tip;

    redraw = () => {
      proj.rotate(rotation);
      gr.setAttribute("d", path(graticule) || "");
      for (const g of geoEls) g.el.setAttribute("d", path(g.feature) || "");
      for (const b of borderEls) b.el.setAttribute("d", path(b.feature) || "");
    };
    redraw();

    let lastX = 0, lastY = 0; const k = 0.26;
    const onDown = (e: any) => { dragging = true; node.style.cursor = "grabbing"; const pt = e.touches ? e.touches[0] : e; lastX = pt.clientX; lastY = pt.clientY; hideTip(); };
    const onMove = (e: any) => { if (!dragging) return; const pt = e.touches ? e.touches[0] : e; const dx = pt.clientX - lastX, dy = pt.clientY - lastY; lastX = pt.clientX; lastY = pt.clientY; rotation = [rotation[0] + dx * k, Math.max(-78, Math.min(78, rotation[1] - dy * k))]; redraw(); if (e.cancelable) e.preventDefault(); };
    const onUp = () => { dragging = false; node.style.cursor = "grab"; };
    svg.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    svg.addEventListener("touchstart", onDown, { passive: true });
    svg.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    cleanupFns.push(() => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); window.removeEventListener("touchend", onUp); });

    const spin = () => { if (!dragging && !hovering && !animating) { rotation = [rotation[0] + 0.12, rotation[1]]; redraw(); } raf = requestAnimationFrame(spin); };
    raf = requestAnimationFrame(spin);

    function showTip(name: string, visited: boolean) { if (!tipEl) return; tipEl.textContent = visited ? name + " · visited" : name; tipEl.style.opacity = "1"; }
    function moveTip(e: any) { if (!tipEl) return; const r = node.getBoundingClientRect(); tipEl.style.left = (e.clientX - r.left) + "px"; tipEl.style.top = (e.clientY - r.top) + "px"; }
    function hideTip() { if (tipEl) tipEl.style.opacity = "0"; }

    (build as any)._rotateTo = (name: string) => {
      const rec = geoEls.find((g) => g.feature.properties && g.feature.properties.name === name);
      if (!rec) return;
      const c = d3.geoCentroid(rec.feature);
      const target: [number, number] = [-c[0], -c[1]];
      const start = rotation.slice() as [number, number];
      let dl = target[0] - start[0]; dl = ((dl + 180) % 360 + 360) % 360 - 180;
      const dp = target[1] - start[1];
      const dur = 700, t0 = performance.now();
      animating = true;
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        rotation = [start[0] + dl * e, start[1] + dp * e];
        redraw();
        if (t < 1) animSpin = requestAnimationFrame(step); else animating = false;
      };
      animSpin = requestAnimationFrame(step);
    };
  }

  build(opts);

  return {
    destroy() { if (raf) cancelAnimationFrame(raf); if (animSpin) cancelAnimationFrame(animSpin); cleanupFns.forEach((f) => f()); cleanupFns = []; },
    selectByName(name: string) {
      const dark = current.dark;
      Object.values(pathByName).forEach((rec) => { if (rec.visited) { rec.el.style.fill = current.accent; rec.el.style.filter = "none"; rec.el.style.stroke = dark ? "oklch(0.2 0.02 262)" : "oklch(0.99 0.002 255)"; rec.el.style.strokeWidth = "0.6"; } });
      const sel = pathByName[name];
      if (sel) { sel.el.style.filter = dark ? "drop-shadow(0 0 8px " + current.accent + ")" : "brightness(1.1)"; sel.el.style.stroke = dark ? "white" : "oklch(0.3 0.02 262)"; sel.el.style.strokeWidth = "1.5"; }
      (build as any)._rotateTo(name);
    },
    rebuild(o: GlobeOptions) { if (raf) cancelAnimationFrame(raf); if (animSpin) cancelAnimationFrame(animSpin); cleanupFns.forEach((f) => f()); cleanupFns = []; build(o); },
  };
}
```

- [ ] **Step 3: Write `components/countries/Globe.tsx`** (React wrapper)

```tsx
"use client";
import { useEffect, useRef } from "react";
import { createGlobe, type GlobeHandle } from "./globe-draw";

export default function Globe({ dark, visited, selected, onSelect }: { dark: boolean; visited: Set<string>; selected: string | null; onSelect: (n: string) => void }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const handle = useRef<GlobeHandle | null>(null);
  const accent = "rgb(214 81 81)";

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    let alive = true;
    node.innerHTML = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono),monospace;font-size:12px;color:oklch(0.6 0.02 262)">loading atlas…</div>';
    fetch("/atlas/countries-110m.json")
      .then((r) => r.json())
      .then((world) => {
        if (!alive || !nodeRef.current) return;
        handle.current = createGlobe(nodeRef.current, world, { dark, accent, visited, onSelect });
      })
      .catch(() => { if (nodeRef.current) nodeRef.current.innerHTML = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono),monospace;font-size:12px;color:oklch(0.6 0.02 262)">map unavailable — see list →</div>'; });
    return () => { alive = false; handle.current?.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark]);

  useEffect(() => { if (selected) handle.current?.selectByName(selected); }, [selected]);

  return <div ref={nodeRef} className="relative h-[340px] sm:h-[420px] lg:h-[520px] w-full" />;
}
```

- [ ] **Step 4: Write `components/countries/CountriesView.tsx`**

```tsx
"use client";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { countries } from "@/lib/data/countries";
import { worldStats } from "@/lib/helpers";

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
        {[[countries.length, "COUNTRIES"], [`${worldPct}%`, "OF THE WORLD"], [1, "CONTINENT"], [cityTotal, "CITIES"]].map(([v, l]) => (
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
              <div className="my-2.5 flex items-center gap-3 text-[30px] font-semibold tracking-[-0.02em]"><span style={{ fontSize: 30, lineHeight: 1 }}>{sel.flag}</span>{sel.name}</div>
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
                  <span className="flex items-center gap-3"><span style={{ fontSize: 20, lineHeight: 1 }}>{c.flag}</span><span className="text-[15px] font-medium">{c.name}</span></span>
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
```

- [ ] **Step 5: Write `app/countries/page.tsx`**

```tsx
import CountriesView from "@/components/countries/CountriesView";
export default function Page() { return <CountriesView />; }
```

- [ ] **Step 6: Verify build + typecheck**

Run: `npm run build`
Expected: `/countries` compiles, no type errors. (Manual: globe loads, spins, drags, click a visited country → it selects and rotates; vertical page scroll still works when starting a drag off the globe.)

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add countries page with D3 globe and vendored atlas"
```

---

## Task 9: Now — note wall (draggable desktop / stacked mobile)

**Files:**
- Create: `components/now/NoteWall.tsx`
- Create: `app/now/page.tsx`

- [ ] **Step 1: Write `components/now/NoteWall.tsx`**

Desktop: absolute draggable board with localStorage persistence (port of original `boardRef`). Mobile (`< 768px` via matchMedia): single-column stacked, no drag.

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { notes as DATA } from "@/lib/data/notes";

const TINTS = { quote: "oklch(0.97 0.03 250)", thought: "oklch(0.984 0.032 95)" } as const;
const STORE = "wall-notes-v1";

export default function NoteWall() {
  const [isMobile, setIsMobile] = useState(false);
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
      <div className="mb-3.5 text-xs tracking-[0.12em]" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>05 — NOW</div>
      <h2 className="m-0 mb-2.5 font-semibold leading-[1.05] tracking-[-0.02em]" style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)" }}>The wall</h2>
      <p className="m-0 mb-7 text-[13px]" style={{ fontFamily: "var(--font-mono)", color: "oklch(0.55 0.02 262)" }}>Quotes and thoughts I&apos;m pinning lately{isMobile ? "." : " — drag the notes around."}</p>

      {isMobile ? (
        <div className="flex flex-col gap-5">
          {DATA.map((c) => <Card key={c.id} c={c} />)}
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
```

Note: On mobile the stacked `<Card>` wrapper needs the tint background — wrap each mobile card in a `<div style={{ background: TINTS[c.type] }}>` or move the tint into `Card`. Implementation detail: add `style={{ background: TINTS[c.type] }}` to the mobile map's wrapping element. Update the mobile branch to:
```tsx
{DATA.map((c) => (
  <div key={c.id} style={{ background: TINTS[c.type] }} className="rounded-[3px]">
    <Card c={c} />
  </div>
))}
```

- [ ] **Step 2: Write `app/now/page.tsx`**

```tsx
import NoteWall from "@/components/now/NoteWall";
export default function Page() { return <NoteWall />; }
```

- [ ] **Step 3: Verify build + typecheck**

Run: `npm run build`
Expected: `/now` compiles. (Manual: desktop drag works + persists across reload; resize to mobile width → notes stack in one column.)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add now page with draggable/stacked note wall"
```

---

## Task 10: Final verification + polish

**Files:**
- Modify: any with lint/type issues surfaced

- [ ] **Step 1: Full typecheck**

Run: `npm run typecheck`
Expected: zero errors. Fix any `any`-related strict errors surfaced in `globe-draw.ts` by keeping the `any` casts already present.

- [ ] **Step 2: Full test run**

Run: `npm test`
Expected: all helper tests pass.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: all 7 routes compile; no errors or blocking warnings.

- [ ] **Step 4: Responsive manual check (run skill)**

Start `npm run dev`, then verify at 390px (phone) and 1280px (desktop):
- Header nav scrolls horizontally on phone, centered on desktop.
- Books grid: 2 cols phone / 5 cols desktop; drawer = bottom sheet phone / right drawer desktop.
- Countries: stacked phone / side-by-side desktop; globe drags; page still scrolls.
- Now: stacked phone / draggable board desktop.
- Contact socials: 2 cols phone / 4 cols desktop.

- [ ] **Step 5: Update README**

Create `README.md`:
```markdown
# Personal Site

Next.js (App Router) + Tailwind v4 rebuild of my personal site.

## Develop
\`\`\`bash
npm install
npm run dev
\`\`\`

## Edit content
All content lives in `lib/data/*.ts` (books, countries, posts, projects, notes, site).
Replace the placeholder entries marked `// TODO`.

## Build
\`\`\`bash
npm run build && npm start
\`\`\`
```

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: add README and final polish"
```

---

## Notes for the implementer

- **Strict TS + D3:** `globe-draw.ts` deliberately uses `any` casts around d3-geo/topojson/polygon-clipping geometry — these libraries' types don't compose cleanly. Keep the casts; don't fight the type system here.
- **Color exactness:** `--accent` is `#d65151`. Both `rgb(214 81 81)` and the oklch equivalent render identically; the globe uses `rgb(214 81 81)` directly since it injects color into SVG styles.
- **No emoji webfont:** flags render with system emoji. If a reviewer wants the original's `Noto Color Emoji`, that's a follow-up, not in scope.
- **Original files** (`Personal Site.dc.html`, `support.js`, `Canvas.dc.html`) stay in the repo as design reference; they are not imported by the app.
