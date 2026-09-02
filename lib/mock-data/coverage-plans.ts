import type { CoverageLevel } from "@/features/quote/quote.types";

export type CoveragePlanRecord = {
  level: CoverageLevel;
  /** Prima anual base en colones, antes de aplicar los factores de la cotización. */
  baseAnnualPremiumCrc: number;
  /** Deducible base en colones, antes de la variación por aseguradora/preferencia. */
  baseDeductibleCrc: number;
  /** Claves i18n bajo coverage.features.*, no texto. */
  includedFeatures: string[];
};

export const coveragePlans: CoveragePlanRecord[] = [
  {
    level: "liability",
    baseAnnualPremiumCrc: 180_000,
    baseDeductibleCrc: 150_000,
    includedFeatures: [
      "coverage.features.thirdPartyLiability",
      "coverage.features.legalAssistance",
    ],
  },
  {
    level: "extended",
    baseAnnualPremiumCrc: 420_000,
    baseDeductibleCrc: 300_000,
    includedFeatures: [
      "coverage.features.thirdPartyLiability",
      "coverage.features.legalAssistance",
      "coverage.features.theft",
      "coverage.features.fire",
      "coverage.features.naturalDisaster",
    ],
  },
  {
    level: "full",
    baseAnnualPremiumCrc: 780_000,
    baseDeductibleCrc: 500_000,
    includedFeatures: [
      "coverage.features.thirdPartyLiability",
      "coverage.features.legalAssistance",
      "coverage.features.theft",
      "coverage.features.fire",
      "coverage.features.naturalDisaster",
      "coverage.features.collisionOwnDamage",
      "coverage.features.roadsideAssistance",
      "coverage.features.replacementVehicle",
    ],
  },
];
