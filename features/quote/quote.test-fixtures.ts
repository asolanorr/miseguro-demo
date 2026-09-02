import type { QuoteRequest } from "./quote.types";

export const sampleQuoteRequest: QuoteRequest = {
  profile: {
    provinceId: "san-jose",
    cantonId: "san-jose-escazu",
    hasCurrentInsurance: false,
    purchaseIntent: "now",
  },
  vehicle: {
    year: 2020,
    makeId: "toyota",
    modelId: "toyota-corolla",
    trimId: "toyota-corolla-lx",
    ownership: "owned",
    use: "commuting",
    annualKm: 15_000,
  },
  driver: {
    birthDate: "1990-05-15",
    licenseYears: 10,
    claimsLast3Years: 0,
    consentAccepted: true,
    consentTimestamp: "2026-01-01T00:00:00.000Z",
  },
  coverage: {
    level: "extended",
    preferredDeductibleCrc: null,
  },
};
