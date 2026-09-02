import { describe, expect, it } from "vitest";
import type { QuoteRequest } from "@/features/quote/quote.types";
import { sampleQuoteRequest } from "@/features/quote/quote.test-fixtures";
import { generateMockOffers } from "./quote-generator";
import { insurers } from "./insurers";

// Nombres reales que nunca deben aparecer: docs/mvp-plan.md §1.2.
const REAL_INSURER_NAMES = [
  "ins",
  "mapfre",
  "assa",
  "qualitas",
  "quálitas",
  "oceanica",
  "oceánica",
  "lafise",
];

describe("generateMockOffers", () => {
  it("is deterministic: the same request produces the same output over 100 runs", () => {
    const first = generateMockOffers(sampleQuoteRequest);
    for (let i = 0; i < 100; i++) {
      expect(generateMockOffers(sampleQuoteRequest)).toEqual(first);
    }
  });

  it("returns offers for all three coverage levels", () => {
    const offers = generateMockOffers(sampleQuoteRequest);
    const levels = new Set(offers.map((offer) => offer.coverageLevel));
    expect(levels).toEqual(new Set(["liability", "extended", "full"]));
  });

  it("returns one offer per insurer per coverage level", () => {
    const offers = generateMockOffers(sampleQuoteRequest);
    expect(offers).toHaveLength(insurers.length * 3);
  });

  it("marks every offer as isDemo: true", () => {
    const offers = generateMockOffers(sampleQuoteRequest);
    expect(offers.every((offer) => offer.isDemo === true)).toBe(true);
  });

  it("keeps premiums within a reasonable range", () => {
    const offers = generateMockOffers(sampleQuoteRequest);
    for (const offer of offers) {
      expect(offer.annualPremiumCrc).toBeGreaterThan(50_000);
      expect(offer.annualPremiumCrc).toBeLessThan(5_000_000);
      expect(offer.monthlyPremiumCrc).toBeGreaterThan(0);
      expect(offer.deductibleCrc).toBeGreaterThan(0);
    }
  });

  it("shows price dispersion between insurers for the same coverage level", () => {
    const offers = generateMockOffers(sampleQuoteRequest).filter(
      (offer) => offer.coverageLevel === "extended",
    );
    const uniquePrices = new Set(offers.map((offer) => offer.annualPremiumCrc));
    expect(uniquePrices.size).toBeGreaterThan(1);
  });

  it("produces different offers for a materially different request", () => {
    const other: QuoteRequest = {
      ...sampleQuoteRequest,
      vehicle: { ...sampleQuoteRequest.vehicle, year: 2012 },
      driver: { ...sampleQuoteRequest.driver, claimsLast3Years: 3 },
    };
    expect(generateMockOffers(sampleQuoteRequest)).not.toEqual(
      generateMockOffers(other),
    );
  });

  it("lowers the premium as the preferred deductible increases", () => {
    const lowDeductible = generateMockOffers({
      ...sampleQuoteRequest,
      coverage: { ...sampleQuoteRequest.coverage, preferredDeductibleCrc: 50_000 },
    }).find((offer) => offer.insurerId === "aseguradora-central" && offer.coverageLevel === "extended")!;

    const highDeductible = generateMockOffers({
      ...sampleQuoteRequest,
      coverage: { ...sampleQuoteRequest.coverage, preferredDeductibleCrc: 1_000_000 },
    }).find((offer) => offer.insurerId === "aseguradora-central" && offer.coverageLevel === "extended")!;

    expect(highDeductible.deductibleCrc).toBeGreaterThan(lowDeductible.deductibleCrc);
    expect(highDeductible.annualPremiumCrc).toBeLessThan(lowDeductible.annualPremiumCrc);
  });
});

describe("insurers", () => {
  it("uses only fictitious names, never a real Costa Rican insurer", () => {
    for (const insurer of insurers) {
      const normalized = insurer.name.toLowerCase();
      for (const real of REAL_INSURER_NAMES) {
        expect(normalized).not.toContain(real);
      }
    }
  });
});
