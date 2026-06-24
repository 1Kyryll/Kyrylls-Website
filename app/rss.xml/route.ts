import { posts } from "@/lib/data/posts";
import { books } from "@/lib/data/books";
import { buildFeedItems, renderRss, siteUrl } from "@/lib/feed";

export const dynamic = "force-static";

export function GET() {
  const base = siteUrl();
  const items = buildFeedItems(posts, books, base);
  const xml = renderRss(items, base);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
