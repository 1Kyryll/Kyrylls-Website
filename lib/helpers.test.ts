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
