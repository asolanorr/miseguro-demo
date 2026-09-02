"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { WizardShell } from "@/components/layout/wizard-shell";
import { ConsentNotice } from "@/components/features/quote/consent-notice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { driverSchema } from "@/features/quote/quote.schema";
import type { QuoteDriver } from "@/features/quote/quote.types";
import { useQuoteWizard } from "@/stores/quote-wizard.store";

const driverFieldsSchema = driverSchema.omit({
  consentAccepted: true,
  consentTimestamp: true,
});

type DriverFieldsValues = {
  birthDate: string;
  licenseYears: number | undefined;
  claimsLast3Years: number | undefined;
};

export function DriverForm() {
  const t = useTranslations("quote.driver");
  const router = useRouter();
  const driver = useQuoteWizard((state) => state.driver);
  const setDriver = useQuoteWizard((state) => state.setDriver);

  const [consentAccepted, setConsentAccepted] = useState(
    driver?.consentAccepted ?? false,
  );
  const [consentError, setConsentError] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DriverFieldsValues>({
    // El schema exige licenseYears/claimsLast3Years ya validados como
    // number; el form los maneja como number | undefined mientras el
    // campo está vacío.
    resolver: zodResolver(driverFieldsSchema) as unknown as Resolver<DriverFieldsValues>,
    defaultValues: driver ?? {
      birthDate: "",
      licenseYears: undefined,
      claimsLast3Years: undefined,
    },
  });

  const onSubmit = (values: DriverFieldsValues) => {
    if (!consentAccepted) {
      setConsentError(t("errors.consentAccepted"));
      return;
    }
    setConsentError(undefined);

    const driverData: QuoteDriver = {
      birthDate: values.birthDate,
      licenseYears: values.licenseYears as number,
      claimsLast3Years: values.claimsLast3Years as number,
      consentAccepted: true,
      consentTimestamp: new Date().toISOString(),
    };

    setDriver(driverData);
    router.push("/quote/coverage");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <WizardShell
        title={t("title")}
        description={t("description")}
        backHref="/quote/vehicle"
        isSubmitting={isSubmitting}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="birthDate">{t("birthDate.label")}</Label>
            <Input
              id="birthDate"
              type="date"
              aria-invalid={Boolean(errors.birthDate)}
              {...register("birthDate")}
            />
            <p className="text-xs text-muted-foreground">{t("birthDate.help")}</p>
            {errors.birthDate ? (
              <p className="text-sm text-destructive">{t("errors.birthDate")}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="licenseYears">{t("licenseYears.label")}</Label>
            <Input
              id="licenseYears"
              type="number"
              inputMode="numeric"
              min={0}
              aria-invalid={Boolean(errors.licenseYears)}
              {...register("licenseYears", { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">{t("licenseYears.help")}</p>
            {errors.licenseYears ? (
              <p className="text-sm text-destructive">{t("errors.licenseYears")}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="claimsLast3Years">{t("claimsLast3Years.label")}</Label>
            <Input
              id="claimsLast3Years"
              type="number"
              inputMode="numeric"
              min={0}
              max={5}
              aria-invalid={Boolean(errors.claimsLast3Years)}
              {...register("claimsLast3Years", { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">{t("claimsLast3Years.help")}</p>
            {errors.claimsLast3Years ? (
              <p className="text-sm text-destructive">{t("errors.claimsLast3Years")}</p>
            ) : null}
          </div>

          <ConsentNotice
            checked={consentAccepted}
            onCheckedChange={(checked) => {
              setConsentAccepted(checked);
              if (checked) setConsentError(undefined);
            }}
            error={consentError}
          />
        </div>
      </WizardShell>
    </form>
  );
}
