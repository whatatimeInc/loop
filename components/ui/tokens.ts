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
  lime:   "#EAEA68",
  limeHover: "#FAF9D1",

  // Semantic
  red:    "#D93B3B",
  green:  "#5FAD8E",
} as const;

export type Tokens = typeof tokens;
