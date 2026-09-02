"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConsentNotice } from "@/components/features/quote/consent-notice";
import { leadSchema } from "@/features/quote/quote.schema";
import { useSubmitLead } from "@/features/quote/quote.hooks";
import type { QuoteRequest } from "@/features/quote/quote.types";

const leadFieldsSchema = leadSchema.pick({
  email: true,
  fullName: true,
  phone: true,
});

type LeadFieldsValues = {
  email: string;
  fullName: string;
  phone?: string;
};

type LeadCaptureDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: QuoteRequest;
  selectedOfferId: string | null;
};

export function LeadCaptureDialog({
  open,
  onOpenChange,
  request,
  selectedOfferId,
}: LeadCaptureDialogProps) {
  const t = useTranslations("quote.lead");
  const tConsent = useTranslations("consent");

  const [consentAccepted, setConsentAccepted] = useState(false);
  const [consentError, setConsentError] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFieldsValues>({
    resolver: zodResolver(leadFieldsSchema),
    defaultValues: { email: "", fullName: "", phone: undefined },
  });

  const submitLead = useSubmitLead();

  const onSubmit = async (values: LeadFieldsValues) => {
    if (!consentAccepted) {
      setConsentError(tConsent("error"));
      return;
    }
    setConsentError(undefined);

    try {
      await submitLead.mutateAsync({
        email: values.email,
        fullName: values.fullName,
        phone: values.phone || undefined,
        selectedOfferId,
        request,
        consentAccepted: true,
        consentTimestamp: new Date().toISOString(),
      });

      toast.success(t("successToast"));
      reset();
      setConsentAccepted(false);
      onOpenChange(false);
    } catch {
      // No reseteamos el form: un error de red no debe borrar lo que la
      // persona ya escribió.
      toast.error(t("errorToast"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lead-fullName">{t("fullName.label")}</Label>
            <Input
              id="lead-fullName"
              aria-invalid={Boolean(errors.fullName)}
              {...register("fullName")}
            />
            {errors.fullName ? (
              <p className="text-sm text-destructive">{t("errors.fullName")}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lead-email">{t("email.label")}</Label>
            <Input
              id="lead-email"
              type="email"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{t("errors.email")}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lead-phone">{t("phone.label")}</Label>
            <Input
              id="lead-phone"
              type="tel"
              {...register("phone", {
                setValueAs: (value) => (value === "" ? undefined : value),
              })}
            />
          </div>

          <ConsentNotice
            checked={consentAccepted}
            onCheckedChange={(checked) => {
              setConsentAccepted(checked);
              if (checked) setConsentError(undefined);
            }}
            error={consentError}
            id="lead-consent-accepted"
          />

          <Button type="submit" disabled={isSubmitting || submitLead.isPending}>
            {t("submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
