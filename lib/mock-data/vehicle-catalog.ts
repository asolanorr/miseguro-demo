import { VEHICLE_YEAR_MAX, VEHICLE_YEAR_MIN } from "@/lib/constants";

export type VehicleMakeRecord = {
  id: string;
  name: string;
  /** 0.9–1.4, usado por el generador de cotizaciones (lib/mock-data/quote-generator.ts). */
  valueMultiplier: number;
};

export type VehicleModelRecord = {
  id: string;
  makeId: string;
  name: string;
};

export type VehicleTrimRecord = {
  id: string;
  modelId: string;
  name: string;
};

export const vehicleYears: number[] = Array.from(
  { length: VEHICLE_YEAR_MAX - VEHICLE_YEAR_MIN + 1 },
  (_, i) => VEHICLE_YEAR_MAX - i,
);

export const vehicleMakes: VehicleMakeRecord[] = [
  { id: "toyota", name: "Toyota", valueMultiplier: 1.15 },
  { id: "hyundai", name: "Hyundai", valueMultiplier: 1.0 },
  { id: "nissan", name: "Nissan", valueMultiplier: 1.0 },
  { id: "mitsubishi", name: "Mitsubishi", valueMultiplier: 0.95 },
  { id: "suzuki", name: "Suzuki", valueMultiplier: 0.9 },
  { id: "kia", name: "Kia", valueMultiplier: 1.0 },
  { id: "honda", name: "Honda", valueMultiplier: 1.25 },
  { id: "mazda", name: "Mazda", valueMultiplier: 1.2 },
  { id: "chevrolet", name: "Chevrolet", valueMultiplier: 0.95 },
  { id: "ford", name: "Ford", valueMultiplier: 1.05 },
];

export const vehicleModels: VehicleModelRecord[] = [
  // Toyota
  { id: "toyota-corolla", makeId: "toyota", name: "Corolla" },
  { id: "toyota-yaris", makeId: "toyota", name: "Yaris" },
  { id: "toyota-rav4", makeId: "toyota", name: "RAV4" },
  { id: "toyota-hilux", makeId: "toyota", name: "Hilux" },
  { id: "toyota-corolla-cross", makeId: "toyota", name: "Corolla Cross" },
  // Hyundai
  { id: "hyundai-accent", makeId: "hyundai", name: "Accent" },
  { id: "hyundai-elantra", makeId: "hyundai", name: "Elantra" },
  { id: "hyundai-tucson", makeId: "hyundai", name: "Tucson" },
  { id: "hyundai-santa-fe", makeId: "hyundai", name: "Santa Fe" },
  { id: "hyundai-creta", makeId: "hyundai", name: "Creta" },
  // Nissan
  { id: "nissan-versa", makeId: "nissan", name: "Versa" },
  { id: "nissan-sentra", makeId: "nissan", name: "Sentra" },
  { id: "nissan-kicks", makeId: "nissan", name: "Kicks" },
  { id: "nissan-x-trail", makeId: "nissan", name: "X-Trail" },
  // Mitsubishi
  { id: "mitsubishi-mirage", makeId: "mitsubishi", name: "Mirage" },
  { id: "mitsubishi-outlander", makeId: "mitsubishi", name: "Outlander" },
  { id: "mitsubishi-l200", makeId: "mitsubishi", name: "L200" },
  { id: "mitsubishi-asx", makeId: "mitsubishi", name: "ASX" },
  // Suzuki
  { id: "suzuki-swift", makeId: "suzuki", name: "Swift" },
  { id: "suzuki-vitara", makeId: "suzuki", name: "Vitara" },
  { id: "suzuki-ertiga", makeId: "suzuki", name: "Ertiga" },
  // Kia
  { id: "kia-rio", makeId: "kia", name: "Rio" },
  { id: "kia-soluto", makeId: "kia", name: "Soluto" },
  { id: "kia-sportage", makeId: "kia", name: "Sportage" },
  { id: "kia-seltos", makeId: "kia", name: "Seltos" },
  { id: "kia-sorento", makeId: "kia", name: "Sorento" },
  // Honda
  { id: "honda-civic", makeId: "honda", name: "Civic" },
  { id: "honda-cr-v", makeId: "honda", name: "CR-V" },
  { id: "honda-hr-v", makeId: "honda", name: "HR-V" },
  { id: "honda-fit", makeId: "honda", name: "Fit" },
  // Mazda
  { id: "mazda-2", makeId: "mazda", name: "Mazda2" },
  { id: "mazda-3", makeId: "mazda", name: "Mazda3" },
  { id: "mazda-cx-5", makeId: "mazda", name: "CX-5" },
  { id: "mazda-cx-30", makeId: "mazda", name: "CX-30" },
  // Chevrolet
  { id: "chevrolet-onix", makeId: "chevrolet", name: "Onix" },
  { id: "chevrolet-spark", makeId: "chevrolet", name: "Spark" },
  { id: "chevrolet-tracker", makeId: "chevrolet", name: "Tracker" },
  { id: "chevrolet-groove", makeId: "chevrolet", name: "Groove" },
  // Ford
  { id: "ford-ecosport", makeId: "ford", name: "EcoSport" },
  { id: "ford-ranger", makeId: "ford", name: "Ranger" },
  { id: "ford-territory", makeId: "ford", name: "Territory" },
];

const TRIM_LADDER = ["LX", "EX", "Limited"];

export const vehicleTrims: VehicleTrimRecord[] = vehicleModels.flatMap((model) =>
  TRIM_LADDER.map((name) => ({
    id: `${model.id}-${name.toLowerCase()}`,
    modelId: model.id,
    name,
  })),
);
