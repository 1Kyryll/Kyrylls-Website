# Personal Site

Next.js (App Router) + Tailwind v4 rebuild of my personal site — a polished, mobile-optimized
log of books I've read, places I've been, things I've written, and what I'm thinking about now.

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Edit content

All content lives in `lib/data/*.ts` as typed, editable data:

- `books.ts` — your library (covers come from Open Library by ISBN)
- `countries.ts` — places visited (`name` must match the world-atlas country name to light up on the globe)
- `posts.ts` — writing
- `projects.ts` — work
- `notes.ts` — the "Now" wall quotes/thoughts
- `site.ts` — name, email, focus areas, social links

Entries currently marked `// TODO` are placeholders — replace them with your own.

The accent color is the CSS variable `--accent` in `app/globals.css` (default `#d65151`).

## Structure

- `app/*` — one route per section (`/`, `/books`, `/countries`, `/writing`, `/projects`, `/now`, `/contact`)
- `components/*` — section components; interactive islands are `BooksLibrary`, `Globe`, `NoteWall`
- `lib/helpers.ts` — pure helpers (unit-tested in `lib/helpers.test.ts`)
- `public/atlas/countries-110m.json` — vendored world atlas for the globe

The original single-file design (`Personal Site.dc.html`) is kept in the repo as reference; it is not part of the app.

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm start          # serve the production build
npm run typecheck  # tsc --noEmit
npm test           # vitest
```

## Build

```bash
npm run build && npm start
```
