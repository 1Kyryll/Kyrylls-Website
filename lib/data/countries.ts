export interface Country {
  name: string;   // MUST match the world-atlas country name for map highlighting
  code: string;
  flag: string;
  year: number;
  region: string;
  cities: string; // " · "-separated
  note: string;
}

// TODO: replace with the countries you've visited.
// `name` must match the atlas name exactly (e.g. "Ukraine", "Poland").
export const countries: Country[] = [
  { name: "Ukraine", code: "UA", flag: "🇺🇦", year: 2019, region: "Eastern Europe", cities: "Kyiv · Lviv · Odesa", note: "Placeholder note about this country." },
  { name: "Poland", code: "PL", flag: "🇵🇱", year: 2021, region: "Central Europe", cities: "Warsaw · Kraków · Gdańsk", note: "Placeholder note about this country." },
  { name: "Germany", code: "DE", flag: "🇩🇪", year: 2024, region: "Western Europe", cities: "Berlin · Munich", note: "Placeholder note about this country." },
];
