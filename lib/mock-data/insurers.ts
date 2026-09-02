import type { Insurer } from "@/types";

/**
 * Aseguradoras ficticias para la demo (docs/mvp-plan.md §1.2). Nombres
 * inventados a propósito: nunca usar INS, Mapfre, ASSA, Quálitas, Oceánica
 * ni Lafise aquí.
 */
export const insurers: Insurer[] = [
  {
    id: "aseguradora-central",
    name: "Aseguradora Central",
    slug: "aseguradora-central",
    rating: 4.5,
    colorToken: "insurer-1",
  },
  {
    id: "grupo-volcan-seguros",
    name: "Grupo Volcán Seguros",
    slug: "grupo-volcan-seguros",
    rating: 4.2,
    colorToken: "insurer-2",
  },
  {
    id: "pacifico-seguros",
    name: "Pacífico Seguros",
    slug: "pacifico-seguros",
    rating: 4.0,
    colorToken: "insurer-3",
  },
  {
    id: "aurora-seguros",
    name: "Aurora Seguros",
    slug: "aurora-seguros",
    rating: 4.7,
    colorToken: "insurer-4",
  },
  {
    id: "coral-seguros",
    name: "Coral Seguros",
    slug: "coral-seguros",
    rating: 3.8,
    colorToken: "insurer-5",
  },
  {
    id: "meseta-seguros",
    name: "Meseta Seguros",
    slug: "meseta-seguros",
    rating: 4.3,
    colorToken: "insurer-6",
  },
];
