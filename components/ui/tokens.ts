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

  // Semantic
  red:    "#D93B3B",
  green:  "#5FAD8E",
} as const;

export type Tokens = typeof tokens;
