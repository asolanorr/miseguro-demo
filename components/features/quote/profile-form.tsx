"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { WizardShell } from "@/components/layout/wizard-shell";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCantons, useProvinces } from "@/features/catalog/catalog.hooks";
import { profileSchema } from "@/features/quote/quote.schema";
import type { QuoteProfile } from "@/features/quote/quote.types";
import { useQuoteWizard } from "@/stores/quote-wizard.store";

export function ProfileForm() {
  const t = useTranslations("quote.profile");
  const router = useRouter();
  const profile = useQuoteWizard((state) => state.profile);
  const setProfile = useQuoteWizard((state) => state.setProfile);

  const { data: provinces } = useProvinces();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuoteProfile>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile ?? {
      provinceId: "",
      cantonId: "",
      hasCurrentInsurance: false,
      purchaseIntent: "now",
    },
  });

  const provinceId = watch("provinceId");
  const { data: cantons } = useCantons(provinceId || undefined);

  // Select (Base UI) necesita `items` para resolver la etiqueta mostrada en
  // el trigger; sin esto, muestra el value crudo (el id) en vez del name.
  const provinceItems = useMemo(
    () => provinces?.map((province) => ({ value: province.id, label: province.name })) ?? [],
    [provinces],
  );
  const cantonItems = useMemo(
    () => cantons?.map((canton) => ({ value: canton.id, label: canton.name })) ?? [],
    [cantons],
  );

  const onSubmit = (values: QuoteProfile) => {
    setProfile(values);
    router.push("/quote/vehicle");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <WizardShell title={t("title")} description={t("description")} isSubmitting={isSubmitting}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="provinceId">{t("province.label")}</Label>
            <Controller
              control={control}
              name="provinceId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("cantonId", "");
                  }}
                  items={provinceItems}
                >
                  <SelectTrigger id="provinceId" className="w-full" aria-invalid={Boolean(errors.provinceId)}>
                    <SelectValue placeholder={t("province.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces?.map((province) => (
                      <SelectItem key={province.id} value={province.id}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground">{t("province.help")}</p>
            {errors.provinceId ? (
              <p className="text-sm text-destructive">{t("errors.provinceId")}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cantonId">{t("canton.label")}</Label>
            <Controller
              control={control}
              name="cantonId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!provinceId}
                  items={cantonItems}
                >
                  <SelectTrigger id="cantonId" className="w-full" aria-invalid={Boolean(errors.cantonId)}>
                    <SelectValue placeholder={t("canton.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {cantons?.map((canton) => (
                      <SelectItem key={canton.id} value={canton.id}>
                        {canton.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground">{t("canton.help")}</p>
            {errors.cantonId ? (
              <p className="text-sm text-destructive">{t("errors.cantonId")}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Controller
              control={control}
              name="hasCurrentInsurance"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="hasCurrentInsurance"
                    checked={field.value}
                    onCheckedChange={(value) => field.onChange(value === true)}
                  />
                  <Label htmlFor="hasCurrentInsurance" className="font-normal">
                    {t("hasCurrentInsurance.label")}
                  </Label>
                </div>
              )}
            />
            <p className="text-xs text-muted-foreground">{t("hasCurrentInsurance.help")}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("purchaseIntent.label")}</Label>
            <Controller
              control={control}
              name="purchaseIntent"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="now" id="purchaseIntent-now" />
                    <Label htmlFor="purchaseIntent-now" className="font-normal">
                      {t("purchaseIntent.options.now")}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="exploring" id="purchaseIntent-exploring" />
                    <Label htmlFor="purchaseIntent-exploring" className="font-normal">
                      {t("purchaseIntent.options.exploring")}
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
            <p className="text-xs text-muted-foreground">{t("purchaseIntent.help")}</p>
          </div>
        </div>
      </WizardShell>
    </form>
  );
}
