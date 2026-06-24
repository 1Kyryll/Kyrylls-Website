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
  { name: "Ukraine", code: "UA", year: "Born", region: "Eastern Europe", cities: "Kyiv · Lviv · Dnipro · Zaporizhzhia · Crimea", note: "My homecountry. Visited Crimea in 2012, too many cities to list." },
  { name: "Poland", code: "PL", year: "Live", region: "Central Europe", cities: "Warsaw · Łódź · Gdańsk", note: "Country I am living at the moment. Probably the best one out of all I have visited." },
  { name: "Germany", code: "DE", year: 2025, region: "Western Europe", cities: "Berlin", note: "Dirty. Multicultural. Would like to visit Germany again." },
  { name: "Montenegro", code: "ME", year: 2025, region: "Eastern Europe", cities: "Bar · Kotor", note: "Amazing scenery, landscapes and sea."},
  { name: "Bulgaria", code: "BG", year: 2026, region: "Eastern Europe", cities: "Burgas · Nessebar", note: "Poorly maintained, messy. People's mentality is indifferent and easygoing. Yet the sea and the old town were nice."},
];
