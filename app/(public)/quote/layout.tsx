"use client";

import { useEffect, type ReactNode } from "react";
import { WizardStepper } from "@/components/layout/wizard-stepper";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuoteWizard } from "@/stores/quote-wizard.store";

export default function QuoteLayout({ children }: { children: ReactNode }) {
  const hasHydrated = useQuoteWizard((state) => state.hasHydrated);

  useEffect(() => {
    useQuoteWizard.persist.rehydrate();
  }, []);

  if (!hasHydrated) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <>
      <WizardStepper />
      {children}
    </>
  );
}
