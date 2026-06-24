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
  { title: "Zero to One", author: "Peter Thiel", year: 2026, rating: 5, tag: "Business & Finance", isbn: "9780753555200", opinion: "Probably the best book I've read so far. It represents my core values and lays the foundation of my view on entrepreneurship. There are a lot of key takeaways here, but the most important one, in my opinion, is this:", takeaway: "Be truly different. Don't imitate what others do." },
  { title: "Laughing at Wall Street", author: "Chris Camillo", year: 2026, rating: 5, tag: "Business & Finance", status: "reading", isbn: "9781429989664", opinion: "A very interesting and unique book. The author mainly argues that Wall Street is a generational scam and that the industry is rigged. Later on, he presents his own approach to investing and to catching life-changing opportunities.", takeaway: "Look at the world around you and let what you notice guide your investing decisions." },
  { title: "The Almanack of Naval Ravikant", author: "Eric Jorgenson", year: 2026, rating: 4, tag: "Lifestyle", isbn: "9781544514208", opinion: "A very solid book about life and how to make it better. The author uses a lot of Naval's tweets as the key takeaways and highlights of what he covers. This book actually encouraged me to start meditating and to reconsider my approach to my mental health. The concept of leverage is also described pretty accurately, from my perspective. Some parts overlap with Peter Thiel's 'Zero to One' — for example, the idea that you need to be different in order to succeed.", takeaway: "Wealth creation and happiness aren't mystical luck or genetic traits; they are specific, learnable skills." },
  { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", year: 2025, rating: 3, tag: "Business & Finance", isbn: "9780446677455", opinion: "It is overhyped, yet I can't say that it is a bad book. For a teenager searching for their purpose and vocation in life, it is the best book to start off with. A lot of its concepts directly overlap with those in 'The Almanack of Naval Ravikant'.", takeaway: "The wealthy don't work for money; they make money work for them." },
  { title: "The Richest Man in Babylon", author: "George Samuel Clason", year: 2025, rating: 3, tag: "Business & Finance", isbn: "9780451205360", opinion: "Some of the wealth-building concepts listed in this book are obsolete in the modern world. Even so, it was helpful in shaping how I think about managing my finances (it literally explains how a man grew wealthy simply by paying attention to his money).", takeaway: "Wealth is built on consistent, long-term discipline rather than luck." },
  { title: "Atomic Habits", author: "James Clear", year: 2026, rating: 4, tag: "Lifestyle", isbn: "9780735211292", opinion: "Indeed a helpful book for getting rid of unwanted habits and building the ones you want. It forces a real mindset shift in how you perceive the way your brain and habits actually work, and what drives your behaviors. It didn't change my own habits drastically, but I believe it could help other people do so.", takeaway: "Massive transformations come from the compound effect of tiny, daily routines rather than drastic overnight changes." },
  { title: "Leading with Character and Competence", author: "Timothy R. Clark", year: 2025, rating: 5, tag: "Lifestyle", isbn: "9781626567733", opinion: "Honestly, the details of this one have faded for me — I read it a while ago and don't remember it as vividly as the others. What stuck with me is its core idea: that real leadership rests on two pillars, character and competence, and that you genuinely need both. A solid read, even if it didn't leave as lasting an impression on me as some of the other books here.", takeaway: "Effective leadership comes from balancing who you are (character) with what you can do (competence) — neither is enough on its own." },
];
