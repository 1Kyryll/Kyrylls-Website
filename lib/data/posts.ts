export interface Post { date: string; read: string; title: string; excerpt: string; url?: string; }

// Paste each article's URL into `url` (e.g. a Medium/dev.to/blog link).
// Leave it out (or "") and the card stays non-clickable.
export const posts: Post[] = [
  { date: "2026-05-17", read: "10 min", title: "How I implemented locking in my E-commerce system", excerpt: "While implementing a robust E-Commerce System project, I encountered the challenge of proper inventory locking.", url: "https://medium.com/@kyryllupwork/how-i-implemented-locking-in-my-e-commerce-system-cd93c36a4ffb" },
  { date: "2026-06-25", read: "14 min", title: "How I build an AI job searching system?", excerpt: "My latest project is an AI system that automates and simplifies the job-search process for you. Before this, I had no prior hands-on experience with vector databases, RAG, or cloud LLM APIs.", url: "https://x.com/KyryllFRST/status/2070137041711411282?s=20" },
  { date: "2026-05-30", read: "7 min", title: "String Tokenization Problem", excerpt: "Overview of the Trie Data Structure and the String Tokenization problem from an Anthropic interview.", url: "https://medium.com/@kyryllupwork/string-tokenization-problem-prefix-tree-5cdd8e306d92" },
  { date: "2026-05-19", read: "5 min", title: "Everything you need to know about funding in the tech world", excerpt: "With massive global firms like Anthropic, SpaceX and OpenAI heading toward IPOs in the nearest future, it's helpful to know and understand modern financial jargon and basic concepts to keep abreast of the times.", url: "https://medium.com/@kyryllupwork/everything-you-need-to-know-about-funding-in-the-tech-world-ae2cc4cce4b9" },
  { date: "2026-06-14", read: "4 min", title: "Being smart is a curse", excerpt: "My thoughts on why some people overcomplicate things, especially when it comes to making money online and how to fix it.", url: "https://open.substack.com/pub/1kyryll/p/being-smart-is-a-curse?r=8iyfb4&utm_campaign=post-expanded-share&utm_medium=post%20viewer" },
];
