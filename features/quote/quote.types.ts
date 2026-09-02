export type CoverageLevel = "liability" | "extended" | "full";
export type VehicleUse = "commuting" | "pleasure" | "business";
export type OwnershipType = "owned" | "financed" | "leased";

export type QuoteProfile = {
  provinceId: string;
  cantonId: string;
  hasCurrentInsurance: boolean;
  purchaseIntent: "now" | "exploring";
};

export type QuoteVehicle = {
  year: number;
  makeId: string;
  modelId: string;
  trimId: string;
  ownership: OwnershipType;
  use: VehicleUse;
  annualKm: number;
};

export type QuoteDriver = {
  birthDate: string; // ISO (YYYY-MM-DD)
  licenseYears: number;
  claimsLast3Years: number;
  consentAccepted: true;
  consentTimestamp: string; // ISO
};

export type QuoteCoverage = {
  level: CoverageLevel;
  preferredDeductibleCrc: number | null;
};

export type QuoteRequest = {
  profile: QuoteProfile;
  vehicle: QuoteVehicle;
  driver: QuoteDriver;
  coverage: QuoteCoverage;
};

export type QuoteOffer = {
  id: string;
  insurerId: string;
  coverageLevel: CoverageLevel;
  monthlyPremiumCrc: number;
  annualPremiumCrc: number;
  deductibleCrc: number;
  includedFeatures: string[]; // claves bajo coverage.features.*
  isDemo: true;
};

export type QuoteProvider = (request: QuoteRequest) => Promise<QuoteOffer[]>;

/** Estado del wizard: parcial por naturaleza, hasta que los 4 pasos se completan. */
export type QuoteWizardState = {
  profile: QuoteProfile | null;
  vehicle: QuoteVehicle | null;
  driver: QuoteDriver | null;
  coverage: QuoteCoverage | null;
};

/**
 * Único puente entre estado parcial del wizard y un QuoteRequest completo.
 * Devuelve null si falta cualquiera de los cuatro bloques.
 */
export function buildQuoteRequest(state: QuoteWizardState): QuoteRequest | null {
  const { profile, vehicle, driver, coverage } = state;

  if (!profile || !vehicle || !driver || !coverage) {
    return null;
  }

  return { profile, vehicle, driver, coverage };
}

export type LeadInput = {
  email: string;
  fullName: string;
  phone?: string;
  selectedOfferId: string | null;
  request: QuoteRequest;
  consentAccepted: true;
  consentTimestamp: string;
};
