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
