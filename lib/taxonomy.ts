// Client-safe taxonomy shared by server and client components.
// No imports: this module must never drag the server Supabase client into a
// "use client" bundle (lib/creators.ts re-exports from here for convenience).
export type Categoria =
  | "Carreira e Negócios"
  | "Saúde e Bem Estar"
  | "Criatividade"
  | "Gastronomia"
  | "Estilo de Vida"
  | "Tecnologia";

export const categorias: Categoria[] = [
  "Carreira e Negócios",
  "Saúde e Bem Estar",
  "Criatividade",
  "Gastronomia",
  "Estilo de Vida",
  "Tecnologia",
];

export type ProfileArea =
  | "career_business"
  | "lifestyle_fashion"
  | "health_wellness"
  | "technology"
  | "creativity"
  | "gastronomy";

export const AREA_LABEL: Record<ProfileArea, Categoria> = {
  career_business:   "Carreira e Negócios",
  lifestyle_fashion: "Estilo de Vida",
  health_wellness:   "Saúde e Bem Estar",
  technology:        "Tecnologia",
  creativity:        "Criatividade",
  gastronomy:        "Gastronomia",
};

export const CATEGORIA_AREA: Record<Categoria, ProfileArea> = {
  "Carreira e Negócios": "career_business",
  "Estilo de Vida":      "lifestyle_fashion",
  "Saúde e Bem Estar":   "health_wellness",
  "Tecnologia":          "technology",
  "Criatividade":        "creativity",
  "Gastronomia":         "gastronomy",
};
