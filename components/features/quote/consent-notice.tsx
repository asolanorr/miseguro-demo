"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ConsentNoticeProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
  id?: string;
};

export function ConsentNotice({
  checked,
  onCheckedChange,
  error,
  id = "consent-accepted",
}: ConsentNoticeProps) {
  const t = useTranslations("consent");

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "flex items-start gap-3 rounded-lg border bg-muted/40 p-4",
          error ? "border-destructive" : "border-border",
        )}
      >
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          aria-invalid={Boolean(error)}
          className="mt-0.5"
        />
        <Label
          htmlFor={id}
          className="text-sm leading-relaxed font-normal text-foreground"
        >
          {t("notice")}
        </Label>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
