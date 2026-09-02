"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { WizardShell } from "@/components/layout/wizard-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useVehicleMakes,
  useVehicleModels,
  useVehicleTrims,
} from "@/features/catalog/catalog.hooks";
import { vehicleSchema } from "@/features/quote/quote.schema";
import type { OwnershipType, QuoteVehicle, VehicleUse } from "@/features/quote/quote.types";
import { VEHICLE_YEAR_MAX, VEHICLE_YEAR_MIN } from "@/lib/constants";
import { useQuoteWizard } from "@/stores/quote-wizard.store";

const VEHICLE_YEARS = Array.from(
  { length: VEHICLE_YEAR_MAX - VEHICLE_YEAR_MIN + 1 },
  (_, index) => VEHICLE_YEAR_MAX - index,
);

const OWNERSHIP_OPTIONS: OwnershipType[] = ["owned", "financed", "leased"];
const USE_OPTIONS: VehicleUse[] = ["commuting", "pleasure", "business"];

type VehicleFormValues = Omit<QuoteVehicle, "year" | "annualKm"> & {
  year: number | undefined;
  annualKm: number | undefined;
};

export function VehicleForm() {
  const t = useTranslations("quote.vehicle");
  const router = useRouter();
  const vehicle = useQuoteWizard((state) => state.vehicle);
  const setVehicle = useQuoteWizard((state) => state.setVehicle);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    // El schema exige year/annualKm ya validados como number; el form los
    // maneja como number | undefined mientras el campo está vacío.
    resolver: zodResolver(vehicleSchema) as unknown as Resolver<VehicleFormValues>,
    defaultValues: vehicle ?? {
      year: undefined,
      makeId: "",
      modelId: "",
      trimId: "",
      ownership: "owned",
      use: "commuting",
      annualKm: undefined,
    },
  });

  const year = watch("year");
  const makeId = watch("makeId");
  const modelId = watch("modelId");

  const { data: makes } = useVehicleMakes(year);
  const { data: models } = useVehicleModels(makeId || undefined);
  const { data: trims } = useVehicleTrims(modelId || undefined);

  // Select (Base UI) necesita `items` para resolver la etiqueta mostrada en
  // el trigger; sin esto, muestra el value crudo (el id) en vez del name.
  const yearItems = useMemo(
    () => VEHICLE_YEARS.map((vehicleYear) => ({ value: String(vehicleYear), label: String(vehicleYear) })),
    [],
  );
  const makeItems = useMemo(
    () => makes?.map((make) => ({ value: make.id, label: make.name })) ?? [],
    [makes],
  );
  const modelItems = useMemo(
    () => models?.map((model) => ({ value: model.id, label: model.name })) ?? [],
    [models],
  );
  const trimItems = useMemo(
    () => trims?.map((trim) => ({ value: trim.id, label: trim.name })) ?? [],
    [trims],
  );

  const onSubmit = (values: VehicleFormValues) => {
    setVehicle(values as QuoteVehicle);
    router.push("/quote/driver");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <WizardShell
        title={t("title")}
        description={t("description")}
        backHref="/quote/profile"
        isSubmitting={isSubmitting}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="year">{t("year.label")}</Label>
            <Controller
              control={control}
              name="year"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => {
                    field.onChange(Number(value));
                    setValue("makeId", "");
                    setValue("modelId", "");
                    setValue("trimId", "");
                  }}
                  items={yearItems}
                >
                  <SelectTrigger id="year" className="w-full" aria-invalid={Boolean(errors.year)}>
                    <SelectValue placeholder={t("year.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_YEARS.map((vehicleYear) => (
                      <SelectItem key={vehicleYear} value={String(vehicleYear)}>
                        {vehicleYear}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground">{t("year.help")}</p>
            {errors.year ? <p className="text-sm text-destructive">{t("errors.year")}</p> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="makeId">{t("make.label")}</Label>
            <Controller
              control={control}
              name="makeId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("modelId", "");
                    setValue("trimId", "");
                  }}
                  disabled={!year}
                  items={makeItems}
                >
                  <SelectTrigger id="makeId" className="w-full" aria-invalid={Boolean(errors.makeId)}>
                    <SelectValue placeholder={t("make.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {makes?.map((make) => (
                      <SelectItem key={make.id} value={make.id}>
                        {make.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground">{t("make.help")}</p>
            {errors.makeId ? (
              <p className="text-sm text-destructive">{t("errors.makeId")}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="modelId">{t("model.label")}</Label>
            <Controller
              control={control}
              name="modelId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("trimId", "");
                  }}
                  disabled={!makeId}
                  items={modelItems}
                >
                  <SelectTrigger id="modelId" className="w-full" aria-invalid={Boolean(errors.modelId)}>
                    <SelectValue placeholder={t("model.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {models?.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground">{t("model.help")}</p>
            {errors.modelId ? (
              <p className="text-sm text-destructive">{t("errors.modelId")}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="trimId">{t("trim.label")}</Label>
            <Controller
              control={control}
              name="trimId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!modelId}
                  items={trimItems}
                >
                  <SelectTrigger id="trimId" className="w-full" aria-invalid={Boolean(errors.trimId)}>
                    <SelectValue placeholder={t("trim.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {trims?.map((trim) => (
                      <SelectItem key={trim.id} value={trim.id}>
                        {trim.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground">{t("trim.help")}</p>
            {errors.trimId ? (
              <p className="text-sm text-destructive">{t("errors.trimId")}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("ownership.label")}</Label>
            <Controller
              control={control}
              name="ownership"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  {OWNERSHIP_OPTIONS.map((value) => (
                    <div key={value} className="flex items-center gap-2">
                      <RadioGroupItem value={value} id={`ownership-${value}`} />
                      <Label htmlFor={`ownership-${value}`} className="font-normal">
                        {t(`ownership.options.${value}`)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
            <p className="text-xs text-muted-foreground">{t("ownership.help")}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("use.label")}</Label>
            <Controller
              control={control}
              name="use"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  {USE_OPTIONS.map((value) => (
                    <div key={value} className="flex items-center gap-2">
                      <RadioGroupItem value={value} id={`use-${value}`} />
                      <Label htmlFor={`use-${value}`} className="font-normal">
                        {t(`use.options.${value}`)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
            <p className="text-xs text-muted-foreground">{t("use.help")}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="annualKm">{t("annualKm.label")}</Label>
            <Input
              id="annualKm"
              type="number"
              inputMode="numeric"
              min={0}
              aria-invalid={Boolean(errors.annualKm)}
              {...register("annualKm", { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">{t("annualKm.help")}</p>
            {errors.annualKm ? (
              <p className="text-sm text-destructive">{t("errors.annualKm")}</p>
            ) : null}
          </div>
        </div>
      </WizardShell>
    </form>
  );
}
