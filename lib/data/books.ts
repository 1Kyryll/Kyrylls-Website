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
