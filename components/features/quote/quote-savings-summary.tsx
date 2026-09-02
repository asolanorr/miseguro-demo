import { useTranslations } from "next-intl";
import type { QuoteOffer } from "@/features/quote/quote.types";
import { formatCrc } from "@/lib/utils";

type QuoteSavingsSummaryProps = {
  offers: QuoteOffer[];
};

export function QuoteSavingsSummary({ offers }: QuoteSavingsSummaryProps) {
  const t = useTranslations("quote.results.savings");

  if (offers.length === 0) {
    return null;
  }

  const sorted = [...offers].sort((a, b) => a.annualPremiumCrc - b.annualPremiumCrc);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  const differenceCrc = highest.annualPremiumCrc - lowest.annualPremiumCrc;

  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-3">
      <div>
        <p className="text-xs text-muted-foreground">{t("lowest")}</p>
        <p className="text-lg font-semibold text-foreground">
          {formatCrc(lowest.annualPremiumCrc)}
        </p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{t("highest")}</p>
        <p className="text-lg font-semibold text-foreground">
          {formatCrc(highest.annualPremiumCrc)}
        </p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{t("difference")}</p>
        <p className="text-lg font-semibold text-success">
          {formatCrc(differenceCrc)}
        </p>
      </div>
    </div>
  );
}
