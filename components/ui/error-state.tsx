"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  const t = useTranslations("common.errorState");

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-6 py-8 text-center">
      <p className="text-sm font-medium text-foreground">{title ?? t("title")}</p>
      <p className="text-sm text-muted-foreground">{description ?? t("description")}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("retry")}
        </Button>
      ) : null}
    </div>
  );
}
