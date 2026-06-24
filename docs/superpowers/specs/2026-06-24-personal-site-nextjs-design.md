# Personal Site — Next.js Rebuild Design

**Date:** 2026-06-24
**Owner:** Kyryll Pavlenko (kyryllupwork@gmail.com)
**Source:** `Personal Site.dc.html` — a single-file design built in a custom design-tool format (`DCLogic` class + `sc-for`/`sc-if` templating). Design is final; this is a faithful re-platform onto Next.js with first-class mobile support.

## Goal

Rebuild the existing 7-section personal site as a production Next.js app (App Router + Tailwind v4 + TypeScript), preserving the visual design and interactions exactly, while making every section work well on mobile.

## Decisions (locked)

- **Routing:** Real routes (App Router), one per section. Not single-page client state.
- **Content:** Replace sample data with 2–3 placeholder entries per dataset, each marked `// TODO: replace with your real <data>`. Typed schemas mirror the original exactly.
- **Hosting:** Standard Next.js build (Vercel / Node). No static-export constraints.
- **Accent color:** `#d65151` / `rgb(214, 81, 81)` is the default `--accent`.
- **Mobile notes:** Stacked single-column on mobile; draggable corkboard on desktop only.
- **Tailwind:** v4 (CSS-first `@theme`, native oklch).

## Stack & dependencies

- **Framework:** Next.js (App Router), TypeScript.
- **Styling:** Tailwind CSS v4. The oklch color system + accent live as CSS custom properties in `globals.css`; Tailwind `@theme` exposes tokens.
- **Fonts:** `next/font/google` self-hosting **Space Grotesk** (display/body) and **JetBrains Mono** (mono accents). Country flags use emoji (system) — no Noto Color Emoji webfont dependency.
- **Map:** `d3-geo`, `d3-geo` companions as needed (`d3` umbrella acceptable), `topojson-client`, `polygon-clipping`. World atlas **vendored** to `public/atlas/countries-110m.json` (no runtime CDN fetch).
- **Animations:** CSS transitions + keyframes only (`fadeUp`, `pulse`, drawer slide, note settle). No framer-motion.

## Project structure

```
app/
  layout.tsx          # html/body, fonts, --accent, <SiteHeader/> + <SiteFooter/>
  globals.css         # theme tokens (oklch vars), keyframes, base resets
  page.tsx            # About / Home
  books/page.tsx
  countries/page.tsx
  writing/page.tsx
  projects/page.tsx
  now/page.tsx
  contact/page.tsx
components/
  SiteHeader.tsx      # responsive nav, active route via usePathname()
  SiteFooter.tsx
  home/StatsGrid.tsx
  home/CurrentlyReading.tsx
  books/BooksLibrary.tsx   # 'use client' — search, tag filter, drawer state
  books/BookCover.tsx      # 3D cover, OpenLibrary image w/ onError hide
  books/BookDrawer.tsx     # bottom sheet (mobile) / right drawer (desktop)
  countries/CountriesView.tsx  # 'use client' — query, selection, layout
  countries/Globe.tsx          # 'use client', dynamic ssr:false — D3 orthographic
  writing/PostList.tsx
  projects/ProjectGrid.tsx
  now/NoteWall.tsx         # 'use client' — drag + localStorage; mobile stack
  contact/SocialGrid.tsx
lib/
  data/books.ts        # Book[] + type, placeholder entries
  data/countries.ts    # Country[] + type
  data/posts.ts        # Post[] + type
  data/projects.ts     # Project[] + type
  data/notes.ts        # Note[] + type
  data/site.ts         # owner name, email, focus list, socials
  theme.ts             # accent default + palette presets
  helpers.ts           # chunk(), starString(), filter helpers (unit-tested)
public/
  atlas/countries-110m.json
```

## Data model (TypeScript)

Mirrors the original objects:

- `Book { title; author; year; rating: 1-5; tag; status?: 'reading'; isbn; opinion; takeaway }`
- `Country { name; code; flag; year; region; cities; note }`
- `Post { date; read; title; excerpt }`
- `Project { name; desc; status: 'live' | 'wip'; tech: string[] }`
- `Note { id; type: 'quote' | 'thought'; text; author?; x; y; rot }`
- `site = { ownerName, email, focus: {n,label}[], socials: {label,href,iconPath}[] }`

Derived values (stars, cover URLs, shelf chunks, world %, city totals, status colors) computed in components/helpers, not stored.

## Interaction islands

### BooksLibrary (`'use client'`)
- State: `query`, `tag`, `openBook`, `drawerOpen`.
- Filter by tag + case-insensitive title/author match; chunk into shelves of 5 (desktop) — grid handles column count responsively, chunking only used where the design groups shelves.
- Drawer: open animates in after a tick (matches original 40ms→open, 560ms close teardown); ESC closes; backdrop click closes; inner click stops propagation.

### Cover loading (optimized)
The original eagerly loaded a full-size (`-L`) background image for every visible book. Optimizations:
- **Size-appropriate sources:** grid thumbnails request OpenLibrary `-M.jpg` (medium, ~180px); the drawer detail requests `-L.jpg`. Cuts grid payload several-fold.
- **`next/image`** for covers with `remotePatterns` allowing `covers.openlibrary.org`: gives automatic lazy-loading (only loads as covers scroll into view), responsive `sizes`, async decode, and width/height to prevent layout shift. Grid covers use `loading="lazy"`; the currently-reading / above-the-fold cover may use `priority`.
- **Graceful fallback:** `onError` swaps to the woven-paper placeholder (the existing repeating-gradient) so missing/invalid ISBNs never show a broken image. `?default=false` keeps OpenLibrary from returning its blank 1px image.
- **Drawer prefetch:** when a book row is hovered/focused (desktop) the `-L` detail cover is prefetched so the drawer opens with the image already warming.
- **Preconnect** to `covers.openlibrary.org` in `<head>` to shave the TLS handshake on first cover.

### Globe (`'use client'`, `dynamic(..., { ssr:false })`)
- Port `drawMap`/`ensureMap`/`drawing` logic verbatim: orthographic projection, ocean sphere + graticule, land fills, single border mesh, **Crimea polygon unioned into Ukraine** (winding fix + hole/sliver cleanup), hover tooltip, drag-to-spin, idle auto-spin, click-to-select with eased rotate-to-centroid.
- Atlas loaded from vendored `public/atlas/countries-110m.json`. Failure → fallback message; country list remains usable.
- `light`/`dark` globe style toggle preserved.
- Touch: `touch-action: none` on the SVG only (so the globe captures drags) while the rest of the page scrolls normally; responsive size recompute on resize (rebuild like original).

### NoteWall (`'use client'`)
- **Desktop (`md+`):** absolute-positioned draggable corkboard (600px), pointer + touch drag, clamp within bounds, settle at slight random tilt, persist `{left,top,rot}` per note id to `localStorage['wall-notes-v1']`. Verbatim port of `boardRef` logic.
- **Mobile (`< md`):** single-column stacked notes (no absolute positioning, no overlap), drag disabled; pins/tints/quote-vs-thought styling preserved. Detected via a CSS breakpoint / matchMedia guard so the drag handlers don't wire on small screens.
- No localStorage → default positions (original try/catch behavior).

### SiteHeader
- `md+`: centered mono nav row.
- `< md`: horizontally-scrollable sticky tab strip; active route highlighted. Scroll shadow/blur background on page scroll (port of `scrolled` state via a scroll listener).

## Responsive rules (Tailwind breakpoints)

| Element | Desktop | Tablet `md` | Phone (base) |
|---|---|---|---|
| Section padding | 64–88px | 48–64px | 32–48px |
| Hero h1 | 56px | `clamp` | `clamp(2rem, 8vw, 2.25rem)` |
| Home stats grid | 3 cols | 3 cols | 1 col |
| Home focus/reading | 2 cols | 2 cols | 1 col |
| Book grid | 5 cols | 3 cols | 2 cols |
| Book drawer | 470px right slide | right slide | full-width bottom sheet |
| Countries | 1.7fr/1fr | stacked | stacked |
| Globe height | 520px | ~420px | ~340px |
| Contact socials | 4 cols | 2 cols | 2 cols |

## Error handling

- Globe atlas fetch failure → inline "map unavailable — see list" message; list + selection still work.
- Book cover image error → `<img>` hidden, woven fallback shows.
- `localStorage` read/write wrapped in try/catch → defaults on failure.
- Globe libs not yet loaded → component shows "loading atlas…" until ready (dynamic import + client-only render avoids SSR window access).

## Testing & verification

- `lib/helpers.ts` pure functions unit-tested: `chunk`, `starString(rating)`, `filterBooks(query, tag)`, world-percent / city-total math.
- `next build` + `tsc --noEmit` pass with no errors.
- Responsive visual check via the run skill at desktop + mobile widths; verify globe drag, book drawer, note wall (drag on desktop / stack on mobile).

## Out of scope (YAGNI)

- Markdown/CMS-backed blog (data stays in typed TS files).
- Real backend, auth, analytics.
- Palette-switcher UI (presets exist in `theme.ts`; accent is a single default).
- Dark mode for the whole site (only the globe's light/dark toggle is in scope, as in the original).
