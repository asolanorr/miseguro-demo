import { describe, expect, it } from "vitest";
import {
  coverageSchema,
  driverSchema,
  leadSchema,
  profileSchema,
  quoteRequestSchema,
  vehicleSchema,
} from "./quote.schema";
import { sampleQuoteRequest } from "./quote.test-fixtures";

describe("profileSchema", () => {
  it("accepts a valid profile", () => {
    expect(profileSchema.safeParse(sampleQuoteRequest.profile).success).toBe(true);
  });

  it("rejects an empty provinceId", () => {
    expect(
      profileSchema.safeParse({ ...sampleQuoteRequest.profile, provinceId: "" }).success,
    ).toBe(false);
  });

  it("rejects an invalid purchaseIntent", () => {
    expect(
      profileSchema.safeParse({ ...sampleQuoteRequest.profile, purchaseIntent: "maybe" })
        .success,
    ).toBe(false);
  });
});

describe("vehicleSchema", () => {
  it("accepts a valid vehicle", () => {
    expect(vehicleSchema.safeParse(sampleQuoteRequest.vehicle).success).toBe(true);
  });

  it("rejects a year before the catalog range", () => {
    expect(
      vehicleSchema.safeParse({ ...sampleQuoteRequest.vehicle, year: 2005 }).success,
    ).toBe(false);
  });

  it("rejects a year after the catalog range", () => {
    expect(
      vehicleSchema.safeParse({ ...sampleQuoteRequest.vehicle, year: 2030 }).success,
    ).toBe(false);
  });

  it("rejects a negative annualKm", () => {
    expect(
      vehicleSchema.safeParse({ ...sampleQuoteRequest.vehicle, annualKm: -1 }).success,
    ).toBe(false);
  });

  it("rejects an invalid use", () => {
    expect(
      vehicleSchema.safeParse({ ...sampleQuoteRequest.vehicle, use: "racing" }).success,
    ).toBe(false);
  });
});

describe("driverSchema", () => {
  it("accepts a valid driver", () => {
    expect(driverSchema.safeParse(sampleQuoteRequest.driver).success).toBe(true);
  });

  it("rejects a driver younger than the minimum age", () => {
    expect(
      driverSchema.safeParse({ ...sampleQuoteRequest.driver, birthDate: "2015-01-01" })
        .success,
    ).toBe(false);
  });

  it("rejects a malformed birthDate", () => {
    expect(
      driverSchema.safeParse({ ...sampleQuoteRequest.driver, birthDate: "15/05/1990" })
        .success,
    ).toBe(false);
  });

  it("rejects consentAccepted: false", () => {
    expect(
      driverSchema.safeParse({ ...sampleQuoteRequest.driver, consentAccepted: false })
        .success,
    ).toBe(false);
  });

  it("rejects a negative claimsLast3Years", () => {
    expect(
      driverSchema.safeParse({ ...sampleQuoteRequest.driver, claimsLast3Years: -1 })
        .success,
    ).toBe(false);
  });
});

describe("coverageSchema", () => {
  it("accepts a valid coverage with a null deductible", () => {
    expect(coverageSchema.safeParse(sampleQuoteRequest.coverage).success).toBe(true);
  });

  it("accepts a valid coverage with a preferred deductible", () => {
    expect(
      coverageSchema.safeParse({ level: "full", preferredDeductibleCrc: 300_000 }).success,
    ).toBe(true);
  });

  it("rejects an invalid level", () => {
    expect(
      coverageSchema.safeParse({ level: "premium", preferredDeductibleCrc: null }).success,
    ).toBe(false);
  });
});

describe("quoteRequestSchema", () => {
  it("accepts a full valid request", () => {
    expect(quoteRequestSchema.safeParse(sampleQuoteRequest).success).toBe(true);
  });

  it("rejects a request missing the vehicle block", () => {
    const { vehicle: _vehicle, ...rest } = sampleQuoteRequest;
    expect(quoteRequestSchema.safeParse(rest).success).toBe(false);
  });
});

describe("leadSchema", () => {
  const baseLead = {
    email: "persona@example.com",
    fullName: "Persona Ejemplo",
    selectedOfferId: "aseguradora-central-extended",
    request: sampleQuoteRequest,
    consentAccepted: true as const,
    consentTimestamp: "2026-01-01T00:00:00.000Z",
  };

  it("accepts a valid lead without phone", () => {
    expect(leadSchema.safeParse(baseLead).success).toBe(true);
  });

  it("accepts a valid lead with phone", () => {
    expect(leadSchema.safeParse({ ...baseLead, phone: "8888-8888" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(leadSchema.safeParse({ ...baseLead, email: "not-an-email" }).success).toBe(
      false,
    );
  });

  it("rejects consentAccepted: false", () => {
    expect(leadSchema.safeParse({ ...baseLead, consentAccepted: false }).success).toBe(
      false,
    );
  });

  it("rejects an empty fullName", () => {
    expect(leadSchema.safeParse({ ...baseLead, fullName: "" }).success).toBe(false);
  });
});
