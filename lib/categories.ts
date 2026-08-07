// Fonte única das categorias — consumida pelo Hero (palavras rotativas)
// e pela Fatia 2 (Connect with top experts).
export const HERO_CATEGORIES = [
  "Arte e Design",
  "Business",
  "Moda",
  "Tecnologia",
  "Lifestyle",
  "Gastronomia",
] as const;

export type HeroCategory = (typeof HERO_CATEGORIES)[number];
