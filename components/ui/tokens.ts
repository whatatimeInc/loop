// Design tokens — fonte única de verdade para cor e tipografia do DS

export const tokens = {
  // Backgrounds
  bg:     "#FCFBF8", // surface padrão (inputs, cards)
  beige:  "#F4F2EB", // page background
  card:   "#FFFFFF",

  // Borders
  border: "#E4E2D9",
  borderSubtle: "#DAD9D5",

  // Text
  dark:   "#272618",
  muted:  "#626053",
  faint:  "#AEADA4",

  // Brand
  lime:      "#F8F586",   // brand-primary
  limeLight: "#EAEA68",   // brand-light / hover
  limeHover: "#FAF9D1",   // brand-inactive

  // Neutral olive surface (brand-neutral-600) — solid folder face, banner card
  neutral600: "#8E8857",

  // Glass — base tint for frosted overlays on dark surfaces
  glassDark: "#514F41",

  // Semantic
  red:    "#D93B3B",
  green:  "#5FAD8E",
} as const;

export type Tokens = typeof tokens;

/** Hex token → rgba() with the given alpha. Keeps colours out of components. */
export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
    16,
  );
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
