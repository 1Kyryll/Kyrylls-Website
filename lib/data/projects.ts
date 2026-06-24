export interface Project { name: string; desc: string; status: "live" | "wip"; tech: string[]; }

// TODO: replace with your real projects.
export const projects: Project[] = [
  { name: "Placeholder Project", desc: "Placeholder description of what it does and why it exists.", status: "live", tech: ["TypeScript", "Next.js"] },
  { name: "Another Project", desc: "Placeholder description of what it does and why it exists.", status: "wip", tech: ["Rust"] },
];
