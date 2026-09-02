import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { DemoBadge } from "@/components/ui/demo-badge";
import { InsurerAvatar } from "@/components/features/quote/insurer-avatar";
import type { Insurer } from "@/types";
import type { QuoteOffer } from "@/features/quote/quote.types";
import { formatCrc } from "@/lib/utils";

type QuoteOfferCardProps = {
  offer: QuoteOffer;
  insurer: Insurer | undefined;
};

export function QuoteOfferCard({ offer, insurer }: QuoteOfferCardProps) {
  const t = useTranslations("quote.results");
  const tFeatures = useTranslations();

  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <InsurerAvatar name={insurer?.name ?? "?"} colorToken={insurer?.colorToken ?? ""} />
          <div>
            <p className="text-sm font-semibold text-foreground">{insurer?.name}</p>
            {insurer ? (
              <p className="text-xs text-muted-foreground">
                {t("rating", { rating: insurer.rating.toFixed(1) })}
              </p>
            ) : null}
          </div>
        </div>
        <DemoBadge />
      </div>

      <div>
        <p className="text-2xl font-semibold text-foreground">
          {formatCrc(offer.monthlyPremiumCrc)}
          <span className="text-sm font-normal text-muted-foreground"> {t("perMonth")}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {formatCrc(offer.annualPremiumCrc)} {t("perYear")}
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        {t("deductible")}: {formatCrc(offer.deductibleCrc)}
      </p>

      <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
        {offer.includedFeatures.map((featureKey) => (
          <li key={featureKey}>• {tFeatures(featureKey)}</li>
        ))}
      </ul>
    </Card>
  );
}
