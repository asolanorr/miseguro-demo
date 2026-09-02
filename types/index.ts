export type Insurer = {
  id: string;
  name: string;
  slug: string;
  /** 0-5, un decimal. Única fuente de verdad del rating. */
  rating: number;
  /** Nombre de token de @theme (p. ej. "insurer-1"), nunca un hex. */
  colorToken: string;
};
