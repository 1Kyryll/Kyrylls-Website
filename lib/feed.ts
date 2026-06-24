import type { Post } from "./data/posts";
import type { Book } from "./data/books";
import { OWNER_NAME } from "./data/site";

export interface FeedItem {
  title: string;
  link: string;
  guid: string;
  category: string;
  description: string;
  date: Date;
}

/** Production origin, no trailing slash. Set NEXT_PUBLIC_SITE_URL in your host's env. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Combine writing posts and book notes into one feed, newest first. */
export function buildFeedItems(posts: Post[], books: Book[], base: string): FeedItem[] {
  const postItems: FeedItem[] = posts.map((p) => ({
    title: p.title,
    link: p.url || `${base}/writing`,
    guid: p.url || `${base}/writing#${slugify(p.title)}`,
    category: "Writing",
    description: p.excerpt,
    date: new Date(`${p.date}T00:00:00Z`),
  }));

  const bookItems: FeedItem[] = books.map((b) => ({
    title: `${b.title} — ${b.author}`,
    link: `${base}/books`,
    guid: `${base}/books#${b.isbn}`,
    category: "Books",
    description: `${b.opinion} Takeaway: ${b.takeaway}`.trim(),
    date: new Date(Date.UTC(b.year, 0, 1)),
  }));

  return [...postItems, ...bookItems].sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function renderRss(items: FeedItem[], base: string): string {
  const title = `${OWNER_NAME} — Writing & Books`;
  const description = "New writing and book notes from Kyryll Pavlenko.";
  const lastBuild = (items[0]?.date ?? new Date()).toUTCString();

  const entries = items
    .map(
      (it) => `    <item>
      <title>${escapeXml(it.title)}</title>
      <link>${escapeXml(it.link)}</link>
      <guid isPermaLink="false">${escapeXml(it.guid)}</guid>
      <category>${escapeXml(it.category)}</category>
      <description>${escapeXml(it.description)}</description>
      <pubDate>${it.date.toUTCString()}</pubDate>
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(base)}</link>
    <description>${escapeXml(description)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${escapeXml(`${base}/rss.xml`)}" rel="self" type="application/rss+xml" />
${entries}
  </channel>
</rss>
`;
}
