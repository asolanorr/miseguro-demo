"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CoverageForm } from "@/components/features/quote/coverage-form";
import { useQuoteWizard } from "@/stores/quote-wizard.store";

export default function CoveragePage() {
  const router = useRouter();
  const profile = useQuoteWizard((state) => state.profile);
  const vehicle = useQuoteWizard((state) => state.vehicle);
  const driver = useQuoteWizard((state) => state.driver);

  const firstMissingStep = !profile
    ? "/quote/profile"
    : !vehicle
      ? "/quote/vehicle"
      : !driver
        ? "/quote/driver"
        : null;

  useEffect(() => {
    if (firstMissingStep) {
      router.replace(firstMissingStep);
    }
  }, [firstMissingStep, router]);

  if (firstMissingStep) {
    return null;
  }

  return <CoverageForm />;
}
