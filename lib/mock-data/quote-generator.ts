import { VEHICLE_YEAR_MAX } from "@/lib/constants";
import { hashString } from "@/lib/utils";
import type { QuoteOffer, QuoteRequest } from "@/features/quote/quote.types";
import { coveragePlans } from "./coverage-plans";
import { insurers } from "./insurers";
import { vehicleMakes } from "./vehicle-catalog";

/**
 * Factor fijo por aseguradora (±18%), para que la comparación entre
 * ofertas tenga dispersión (docs/mvp-plan.md §2.5). No depende del request:
 * es una propiedad constante de cada aseguradora demo.
 */
const INSURER_PRICE_FACTORS: Record<string, number> = {
  "aseguradora-central": 0.82,
  "grupo-volcan-seguros": 0.89,
  "pacifico-seguros": 0.96,
  "aurora-seguros": 1.04,
  "coral-seguros": 1.11,
  "meseta-seguros": 1.18,
};

/**
 * Año de referencia fijo (no `new Date()`) para que la antigüedad del
 * vehículo y la edad del conductor no cambien con el reloj real: la misma
 * QuoteRequest debe producir siempre las mismas ofertas, sin fecha de
 * vencimiento. Coincide con el techo del catálogo de vehículos.
 */
const REFERENCE_YEAR = VEHICLE_YEAR_MAX;

function mulberry32(seed: number): () => number {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundToNearest(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function vehicleAgeMultiplier(vehicleYear: number): number {
  const age = Math.max(0, REFERENCE_YEAR - vehicleYear);
  return Math.max(0.7, 1 - 0.02 * age);
}

function driverAgeMultiplier(birthDate: string): number {
  const birthYear = Number(birthDate.slice(0, 4));
  const age = REFERENCE_YEAR - birthYear;
  if (age < 25) return 1.35;
  if (age > 65) return 1.15;
  return 1.0;
}

function licenseYearsMultiplier(licenseYears: number): number {
  if (licenseYears < 3) return 1.2;
  if (licenseYears <= 10) return 1.05;
  return 1.0;
}

function vehicleUseMultiplier(use: QuoteRequest["vehicle"]["use"]): number {
  return { pleasure: 0.95, commuting: 1.0, business: 1.25 }[use];
}

function annualKmMultiplier(annualKm: number): number {
  if (annualKm <= 10_000) return 0.9;
  if (annualKm <= 20_000) return 1.0;
  if (annualKm <= 30_000) return 1.1;
  return 1.2;
}

function claimsMultiplier(claimsLast3Years: number): number {
  return 1 + 0.18 * claimsLast3Years;
}

const HIGH_TRAFFIC_PROVINCES = new Set(["san-jose", "alajuela"]);

function provinceMultiplier(provinceId: string): number {
  return HIGH_TRAFFIC_PROVINCES.has(provinceId) ? 1.08 : 1.0;
}

/**
 * Genera ofertas de demostración para una QuoteRequest. Pura y
 * determinista: la semilla del PRNG se deriva del propio request, así que
 * el mismo input produce siempre el mismo output.
 */
export function generateMockOffers(request: QuoteRequest): QuoteOffer[] {
  const random = mulberry32(hashString(JSON.stringify(request)));

  const make = vehicleMakes.find((m) => m.id === request.vehicle.makeId);
  const valueMultiplier = make?.valueMultiplier ?? 1;

  const sharedMultiplier =
    valueMultiplier *
    vehicleAgeMultiplier(request.vehicle.year) *
    driverAgeMultiplier(request.driver.birthDate) *
    licenseYearsMultiplier(request.driver.licenseYears) *
    vehicleUseMultiplier(request.vehicle.use) *
    annualKmMultiplier(request.vehicle.annualKm) *
    claimsMultiplier(request.driver.claimsLast3Years) *
    provinceMultiplier(request.profile.provinceId);

  const offers: QuoteOffer[] = [];

  for (const insurer of insurers) {
    const insurerFactor = INSURER_PRICE_FACTORS[insurer.id] ?? 1;

    for (const plan of coveragePlans) {
      const priceNoise = 0.95 + random() * 0.1;
      const deductibleNoise = 0.85 + random() * 0.3;

      let deductibleCrc = plan.baseDeductibleCrc * deductibleNoise;
      if (request.coverage.preferredDeductibleCrc != null) {
        deductibleCrc =
          (deductibleCrc + request.coverage.preferredDeductibleCrc) / 2;
      }
      deductibleCrc = roundToNearest(deductibleCrc, 5_000);

      const deductibleFactor = clamp(
        1 - 0.15 * ((deductibleCrc - plan.baseDeductibleCrc) / plan.baseDeductibleCrc),
        0.7,
        1.3,
      );

      const annualPremiumCrc = roundToNearest(
        plan.baseAnnualPremiumCrc *
          sharedMultiplier *
          insurerFactor *
          deductibleFactor *
          priceNoise,
        1_000,
      );
      const monthlyPremiumCrc = roundToNearest(annualPremiumCrc / 12, 100);

      offers.push({
        id: `${insurer.id}-${plan.level}`,
        insurerId: insurer.id,
        coverageLevel: plan.level,
        monthlyPremiumCrc,
        annualPremiumCrc,
        deductibleCrc,
        includedFeatures: plan.includedFeatures,
        isDemo: true,
      });
    }
  }

  return offers;
}
