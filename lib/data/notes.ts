export interface Note {
  id: string;
  type: "quote" | "thought";
  text: string;
  author?: string;
  x: number;   // left %, desktop board
  y: number;   // top px, desktop board
  rot: number; // degrees
}

// TODO: replace with your own quotes and thoughts.
export const notes: Note[] = [
  { id: "n1", type: "thought", text: "Placeholder thought — something you're chewing on.", x: 1.5, y: 16, rot: -3 },
  { id: "n2", type: "quote", text: "Placeholder quote goes here.", author: "Author", x: 30, y: 40, rot: 2.5 },
  { id: "n3", type: "thought", text: "Placeholder thought — something you're chewing on.", x: 58, y: 14, rot: -1.5 },
  { id: "n4", type: "quote", text: "Placeholder quote goes here.", author: "Author", x: 20, y: 230, rot: 2 },
];
