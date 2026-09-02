"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { VehicleForm } from "@/components/features/quote/vehicle-form";
import { useQuoteWizard } from "@/stores/quote-wizard.store";

export default function VehiclePage() {
  const router = useRouter();
  const profile = useQuoteWizard((state) => state.profile);

  useEffect(() => {
    if (!profile) {
      router.replace("/quote/profile");
    }
  }, [profile, router]);

  if (!profile) {
    return null;
  }

  return <VehicleForm />;
}
