import { describe, expect, it } from "vitest";
import { buildQuoteRequest, type QuoteWizardState } from "./quote.types";
import { sampleQuoteRequest } from "./quote.test-fixtures";

const emptyState: QuoteWizardState = {
  profile: null,
  vehicle: null,
  driver: null,
  coverage: null,
};

describe("buildQuoteRequest", () => {
  it("returns null when every block is missing", () => {
    expect(buildQuoteRequest(emptyState)).toBeNull();
  });

  it("returns null when only some blocks are present", () => {
    const partial: QuoteWizardState = {
      ...emptyState,
      profile: sampleQuoteRequest.profile,
      vehicle: sampleQuoteRequest.vehicle,
    };
    expect(buildQuoteRequest(partial)).toBeNull();
  });

  it("returns null when only the last block is missing", () => {
    const partial: QuoteWizardState = {
      profile: sampleQuoteRequest.profile,
      vehicle: sampleQuoteRequest.vehicle,
      driver: sampleQuoteRequest.driver,
      coverage: null,
    };
    expect(buildQuoteRequest(partial)).toBeNull();
  });

  it("returns the full request when all four blocks are present", () => {
    const complete: QuoteWizardState = {
      profile: sampleQuoteRequest.profile,
      vehicle: sampleQuoteRequest.vehicle,
      driver: sampleQuoteRequest.driver,
      coverage: sampleQuoteRequest.coverage,
    };
    expect(buildQuoteRequest(complete)).toEqual(sampleQuoteRequest);
  });
});
