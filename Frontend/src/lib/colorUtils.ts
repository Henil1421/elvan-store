/* ── Color name → CSS color mapping for product swatches ── */

const COLOR_MAP: Record<string, string> = {
  red: "#ef4444", maroon: "#800000", crimson: "#dc143c", scarlet: "#ff2400",
  orange: "#f97316", coral: "#ff7f50", peach: "#ffdab9", salmon: "#fa8072",
  yellow: "#eab308", gold: "#ffd700", amber: "#f59e0b", lemon: "#fff44f",
  green: "#22c55e", olive: "#808000", lime: "#84cc16", emerald: "#50c878",
  "dark green": "#006400", "forest green": "#228b22", mint: "#98ff98", sage: "#bcb88a",
  teal: "#14b8a6", cyan: "#06b6d4", aqua: "#00ffff", turquoise: "#40e0d0",
  blue: "#3b82f6", navy: "#000080", "royal blue": "#4169e1", "sky blue": "#87ceeb",
  "light blue": "#add8e6", indigo: "#4f46e5", cobalt: "#0047ab",
  purple: "#a855f7", violet: "#8b5cf6", lavender: "#e6e6fa", plum: "#dda0dd",
  magenta: "#ec4899", pink: "#f472b6", "hot pink": "#ff69b4", rose: "#fb7185",
  fuchsia: "#d946ef", mauve: "#e0b0ff",
  brown: "#92400e", tan: "#d2b48c", beige: "#f5f5dc", khaki: "#c3b091",
  chocolate: "#7b3f00", coffee: "#6f4e37", camel: "#c19a6b", rust: "#b7410e",
  white: "#ffffff", ivory: "#fffff0", cream: "#fffdd0", snow: "#fffafa",
  black: "#000000", charcoal: "#36454f", grey: "#9ca3af", gray: "#9ca3af",
  "light grey": "#d1d5db", "light gray": "#d1d5db", "dark grey": "#4b5563", "dark gray": "#4b5563",
  silver: "#c0c0c0", "off white": "#f5f5f0", "off-white": "#f5f5f0",
  burgundy: "#800020", wine: "#722f37", "dark red": "#8b0000",
  mustard: "#ffdb58", champagne: "#f7e7ce",
  "light green": "#90ee90", "light pink": "#ffb6c1",
  "dark blue": "#00008b",
  multicolor: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
  multi: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
};

export function getColorHex(colorName: string): string | null {
  const key = colorName.toLowerCase().trim();
  return COLOR_MAP[key] ?? null;
}

/** Extract color option values from a product */
export function getProductColors(options: { name: string; values: string }[]): string[] {
  const colorOption = options.find(
    (o) => ["color", "colour", "colors", "colours"].includes(o.name.toLowerCase().trim())
  );
  if (!colorOption) return [];
  return colorOption.values
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}
