import { describe, it, expect } from "vitest";
import { slugify, escapeXml, buildFeedItems, renderRss } from "./feed";
import type { Post } from "./data/posts";
import type { Book } from "./data/books";

const base = "https://example.com";

const post = (over: Partial<Post>): Post => ({
  date: "2026-01-01", read: "5 min", title: "T", excerpt: "E", ...over,
});
const book = (over: Partial<Book>): Book => ({
  title: "T", author: "A", year: 2020, rating: 4, tag: "Tech",
  isbn: "1", opinion: "o", takeaway: "k", ...over,
});

describe("slugify", () => {
  it("lowercases and dashes non-alphanumerics", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });
  it("trims leading/trailing dashes", () => {
    expect(slugify("  --Wow--  ")).toBe("wow");
  });
});

describe("escapeXml", () => {
  it("escapes the five XML entities", () => {
    expect(escapeXml(`a & b < c > d "e" 'f'`)).toBe("a &amp; b &lt; c &gt; d &quot;e&quot; &apos;f&apos;");
  });
});

describe("buildFeedItems", () => {
  it("merges posts and books sorted newest first", () => {
    const items = buildFeedItems(
      [post({ date: "2026-03-01", title: "Newer post" })],
      [book({ year: 2025, title: "Old book" }), book({ year: 2026, title: "New book" })],
      base
    );
    expect(items.map((i) => i.title)).toEqual(["Newer post", "New book — A", "Old book — A"]);
  });

  it("builds writing links/guids/categories from posts", () => {
    const [it0] = buildFeedItems([post({ title: "My Post" })], [], base);
    expect(it0.link).toBe(`${base}/writing`);
    expect(it0.guid).toBe(`${base}/writing#my-post`);
    expect(it0.category).toBe("Writing");
  });

  it("uses a post's url for link and guid when present", () => {
    const url = "https://medium.com/@me/my-post";
    const [it0] = buildFeedItems([post({ title: "My Post", url })], [], base);
    expect(it0.link).toBe(url);
    expect(it0.guid).toBe(url);
  });

  it("builds book links/guids and folds in the takeaway", () => {
    const [it0] = buildFeedItems([], [book({ isbn: "999", opinion: "Great.", takeaway: "Be different." })], base);
    expect(it0.link).toBe(`${base}/books`);
    expect(it0.guid).toBe(`${base}/books#999`);
    expect(it0.category).toBe("Books");
    expect(it0.description).toBe("Great. Takeaway: Be different.");
  });
});

describe("renderRss", () => {
  const xml = renderRss(buildFeedItems([post({ title: "Hi & bye" })], [], base), base);

  it("is a well-formed RSS 2.0 channel with a self link", () => {
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain(`<atom:link href="${base}/rss.xml" rel="self"`);
  });
  it("escapes item content", () => {
    expect(xml).toContain("<title>Hi &amp; bye</title>");
  });
  it("emits RFC-822 pubDate", () => {
    expect(xml).toMatch(/<pubDate>[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT<\/pubDate>/);
  });
});
