export interface Country {
  name: string;   // MUST match the world-atlas country name for map highlighting
  code: string;   // ISO 3166-1 alpha-2 code; drives the flag image and the · label
  year: number | string; // visit year, or any short label like "Born"
  region: string;
  cities: string; // " · "-separated
  note: string;
}

// TODO: replace with the countries you've visited.
// `name` must match the atlas name exactly (e.g. "Ukraine", "Poland").
// `year` can be a number (2021) or any short text ("Born", "Lived").
export const countries: Country[] = [
  { name: "Ukraine", code: "UA", year: "Born", region: "Eastern Europe", cities: "Kyiv · Lviv · Odesa", note: "Placeholder note about this country." },
  { name: "Poland", code: "PL", year: 2021, region: "Central Europe", cities: "Warsaw · Kraków · Gdańsk", note: "Placeholder note about this country." },
  { name: "Germany", code: "DE", year: 2024, region: "Western Europe", cities: "Berlin · Munich", note: "Placeholder note about this country." },
];
