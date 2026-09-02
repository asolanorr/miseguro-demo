"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("common.errorState");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-lg font-semibold text-foreground">{t("title")}</p>
      <p className="text-sm text-muted-foreground">{t("description")}</p>
      <Button onClick={() => reset()}>{t("retry")}</Button>
    </div>
  );
}
