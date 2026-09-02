"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { WizardShell } from "@/components/layout/wizard-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { coveragePlans } from "@/lib/mock-data/coverage-plans";
import { coverageSchema } from "@/features/quote/quote.schema";
import type { QuoteCoverage } from "@/features/quote/quote.types";
import { useQuoteWizard } from "@/stores/quote-wizard.store";

export function CoverageForm() {
  const t = useTranslations("quote.coverage");
  const tShared = useTranslations();
  const router = useRouter();
  const coverage = useQuoteWizard((state) => state.coverage);
  const setCoverage = useQuoteWizard((state) => state.setCoverage);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuoteCoverage>({
    resolver: zodResolver(coverageSchema),
    defaultValues: coverage ?? { level: "extended", preferredDeductibleCrc: null },
  });

  const onSubmit = (values: QuoteCoverage) => {
    setCoverage(values);
    router.push("/quote/results");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <WizardShell
        title={t("title")}
        description={t("description")}
        backHref="/quote/driver"
        isSubmitting={isSubmitting}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <Label>{t("level.label")}</Label>
            <Controller
              control={control}
              name="level"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="gap-3">
                  {coveragePlans.map((plan) => (
                    <Label
                      key={plan.level}
                      htmlFor={`level-${plan.level}`}
                      className="flex cursor-pointer flex-col gap-2 rounded-lg border border-border p-4 font-normal has-[[data-checked]]:border-primary has-[[data-checked]]:ring-2 has-[[data-checked]]:ring-primary/20"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-foreground">
                            {tShared(`coverage.levels.${plan.level}.name`)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {tShared(`coverage.levels.${plan.level}.description`)}
                          </span>
                        </div>
                        <RadioGroupItem value={plan.level} id={`level-${plan.level}`} />
                      </div>
                      <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                        {plan.includedFeatures.map((featureKey) => (
                          <li key={featureKey}>• {tShared(featureKey)}</li>
                        ))}
                      </ul>
                    </Label>
                  ))}
                </RadioGroup>
              )}
            />
            <p className="text-xs text-muted-foreground">{t("level.help")}</p>
            {errors.level ? (
              <p className="text-sm text-destructive">{t("errors.level")}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="preferredDeductibleCrc">
              {t("preferredDeductibleCrc.label")}
            </Label>
            <Input
              id="preferredDeductibleCrc"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={t("preferredDeductibleCrc.placeholder")}
              aria-invalid={Boolean(errors.preferredDeductibleCrc)}
              {...register("preferredDeductibleCrc", {
                setValueAs: (value) => (value === "" ? null : Number(value)),
              })}
            />
            <p className="text-xs text-muted-foreground">
              {t("preferredDeductibleCrc.help")}
            </p>
            {errors.preferredDeductibleCrc ? (
              <p className="text-sm text-destructive">
                {t("errors.preferredDeductibleCrc")}
              </p>
            ) : null}
          </div>
        </div>
      </WizardShell>
    </form>
  );
}
