"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DriverForm } from "@/components/features/quote/driver-form";
import { useQuoteWizard } from "@/stores/quote-wizard.store";

export default function DriverPage() {
  const router = useRouter();
  const profile = useQuoteWizard((state) => state.profile);
  const vehicle = useQuoteWizard((state) => state.vehicle);

  const firstMissingStep = !profile
    ? "/quote/profile"
    : !vehicle
      ? "/quote/vehicle"
      : null;

  useEffect(() => {
    if (firstMissingStep) {
      router.replace(firstMissingStep);
    }
  }, [firstMissingStep, router]);

  if (firstMissingStep) {
    return null;
  }

  return <DriverForm />;
}
