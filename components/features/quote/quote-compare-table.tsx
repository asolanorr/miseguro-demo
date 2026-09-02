import { useTranslations } from "next-intl";
import { DemoBadge } from "@/components/ui/demo-badge";
import { InsurerAvatar } from "@/components/features/quote/insurer-avatar";
import type { Insurer } from "@/types";
import type { QuoteOffer } from "@/features/quote/quote.types";
import { formatCrc } from "@/lib/utils";

type QuoteCompareTableProps = {
  offers: QuoteOffer[];
  insurersById: Map<string, Insurer>;
};

export function QuoteCompareTable({ offers, insurersById }: QuoteCompareTableProps) {
  const t = useTranslations("quote.results");
  const tFeatures = useTranslations();

  return (
    <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-muted/60 text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">{t("table.insurer")}</th>
            <th className="px-4 py-3 font-medium">{t("table.monthly")}</th>
            <th className="px-4 py-3 font-medium">{t("table.annual")}</th>
            <th className="px-4 py-3 font-medium">{t("table.deductible")}</th>
            <th className="px-4 py-3 font-medium">{t("table.includes")}</th>
            <th className="px-4 py-3 font-medium">{t("table.demo")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {offers.map((offer) => {
            const insurer = insurersById.get(offer.insurerId);
            return (
              <tr key={offer.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <InsurerAvatar
                      name={insurer?.name ?? "?"}
                      colorToken={insurer?.colorToken ?? ""}
                    />
                    <div>
                      <p className="font-medium text-foreground">{insurer?.name}</p>
                      {insurer ? (
                        <p className="text-xs text-muted-foreground">
                          {t("rating", { rating: insurer.rating.toFixed(1) })}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-foreground">
                  {formatCrc(offer.monthlyPremiumCrc)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatCrc(offer.annualPremiumCrc)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatCrc(offer.deductibleCrc)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <ul className="flex flex-col gap-0.5">
                    {offer.includedFeatures.map((featureKey) => (
                      <li key={featureKey}>{tFeatures(featureKey)}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-3">
                  <DemoBadge />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
