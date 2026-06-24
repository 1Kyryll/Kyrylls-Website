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
  { id: "n1", type: "quote", text: "Simple is complicated enough.", author: "Elon Musk", x: 1.5, y: 16, rot: -3 },
  { id: "n2", type: "thought", text: "Don't be a fool with a tool.", x: 30, y: 40, rot: 2.5 },
  { id: "n3", type: "thought", text: "I might switch to writing posts on X articles.", x: 58, y: 14, rot: -1.5 },
];
