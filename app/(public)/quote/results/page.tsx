"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { WizardShell } from "@/components/layout/wizard-shell";
import { Button } from "@/components/ui/button";
import { DemoNoticeBanner } from "@/components/features/quote/demo-notice-banner";
import { LeadCaptureDialog } from "@/components/features/quote/lead-capture-dialog";
import { QuoteResultsList } from "@/components/features/quote/quote-results-list";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useInsurers } from "@/features/insurers/insurers.hooks";
import { useQuoteResults } from "@/features/quote/quote.hooks";
import { buildQuoteRequest } from "@/features/quote/quote.types";
import { useQuoteWizard } from "@/stores/quote-wizard.store";

function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-3">
        <Skeleton className="h-14 w-full sm:w-56" />
        <Skeleton className="h-14 w-full sm:w-56" />
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-56 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const t = useTranslations("quote.results");

  const profile = useQuoteWizard((state) => state.profile);
  const vehicle = useQuoteWizard((state) => state.vehicle);
  const driver = useQuoteWizard((state) => state.driver);
  const coverage = useQuoteWizard((state) => state.coverage);

  const firstMissingStep = !profile
    ? "/quote/profile"
    : !vehicle
      ? "/quote/vehicle"
      : !driver
        ? "/quote/driver"
        : !coverage
          ? "/quote/coverage"
          : null;

  const request = buildQuoteRequest({ profile, vehicle, driver, coverage });

  useEffect(() => {
    if (firstMissingStep) {
      router.replace(firstMissingStep);
    }
  }, [firstMissingStep, router]);

  const { data: offers, isLoading, isError, refetch } = useQuoteResults(request);
  const { data: insurers } = useInsurers();

  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  if (firstMissingStep || !request) {
    return null;
  }

  const openLeadDialog = (offerId: string | null) => {
    setSelectedOfferId(offerId);
    setLeadDialogOpen(true);
  };

  return (
    <WizardShell title={t("title")} showNav={false} wide>
      <div className="flex flex-col gap-6">
        <DemoNoticeBanner />

        {isLoading || !insurers ? (
          <ResultsSkeleton />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <>
            <QuoteResultsList
              offers={offers ?? []}
              insurers={insurers}
              defaultLevel={request.coverage.level}
              onSelectOffer={(offerId) => openLeadDialog(offerId)}
            />
            <Button
              variant="outline"
              className="self-start"
              onClick={() => openLeadDialog(null)}
            >
              {t("generalCta")}
            </Button>
          </>
        )}
      </div>

      <LeadCaptureDialog
        open={leadDialogOpen}
        onOpenChange={setLeadDialogOpen}
        request={request}
        selectedOfferId={selectedOfferId}
      />
    </WizardShell>
  );
}
