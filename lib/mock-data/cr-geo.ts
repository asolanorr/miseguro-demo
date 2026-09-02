export type ProvinceRecord = {
  id: string;
  name: string;
};

export type CantonRecord = {
  id: string;
  provinceId: string;
  name: string;
};

export const provinces: ProvinceRecord[] = [
  { id: "san-jose", name: "San José" },
  { id: "alajuela", name: "Alajuela" },
  { id: "cartago", name: "Cartago" },
  { id: "heredia", name: "Heredia" },
  { id: "guanacaste", name: "Guanacaste" },
  { id: "puntarenas", name: "Puntarenas" },
  { id: "limon", name: "Limón" },
];

const rawCantons: Record<string, string[]> = {
  "san-jose": [
    "San José",
    "Escazú",
    "Desamparados",
    "Puriscal",
    "Tarrazú",
    "Aserrí",
    "Mora",
    "Goicoechea",
    "Santa Ana",
    "Alajuelita",
    "Vázquez de Coronado",
    "Acosta",
    "Tibás",
    "Moravia",
    "Montes de Oca",
    "Turrubares",
    "Dota",
    "Curridabat",
    "Pérez Zeledón",
    "León Cortés",
  ],
  alajuela: [
    "Alajuela",
    "San Ramón",
    "Grecia",
    "San Mateo",
    "Atenas",
    "Naranjo",
    "Palmares",
    "Poás",
    "Orotina",
    "San Carlos",
    "Zarcero",
    "Sarchí",
    "Upala",
    "Los Chiles",
    "Guatuso",
    "Río Cuarto",
  ],
  cartago: [
    "Cartago",
    "Paraíso",
    "La Unión",
    "Jiménez",
    "Turrialba",
    "Alvarado",
    "Oreamuno",
    "El Guarco",
  ],
  heredia: [
    "Heredia",
    "Barva",
    "Santo Domingo",
    "Santa Bárbara",
    "San Rafael",
    "San Isidro",
    "Belén",
    "Flores",
    "San Pablo",
    "Sarapiquí",
  ],
  guanacaste: [
    "Liberia",
    "Nicoya",
    "Santa Cruz",
    "Bagaces",
    "Carrillo",
    "Cañas",
    "Abangares",
    "Tilarán",
    "Nandayure",
    "La Cruz",
    "Hojancha",
  ],
  puntarenas: [
    "Puntarenas",
    "Esparza",
    "Buenos Aires",
    "Montes de Oro",
    "Osa",
    "Quepos",
    "Golfito",
    "Coto Brus",
    "Parrita",
    "Corredores",
    "Garabito",
    "Monteverde",
    "Puerto Jiménez",
  ],
  limon: ["Limón", "Pococí", "Siquirres", "Talamanca", "Matina", "Guácimo"],
};

const DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const cantons: CantonRecord[] = Object.entries(rawCantons).flatMap(
  ([provinceId, names]) =>
    names.map((name) => ({
      id: `${provinceId}-${slugify(name)}`,
      provinceId,
      name,
    })),
);
