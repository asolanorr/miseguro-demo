"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuoteCompareTable } from "@/components/features/quote/quote-compare-table";
import { QuoteOfferCard } from "@/components/features/quote/quote-offer-card";
import { QuoteSavingsSummary } from "@/components/features/quote/quote-savings-summary";
import type { CoverageLevel, QuoteOffer } from "@/features/quote/quote.types";
import type { Insurer } from "@/types";

type SortOption = "priceAsc" | "priceDesc" | "rating";

type QuoteResultsListProps = {
  offers: QuoteOffer[];
  insurers: Insurer[];
  defaultLevel: CoverageLevel;
  onSelectOffer: (offerId: string) => void;
};

const LEVELS: CoverageLevel[] = ["liability", "extended", "full"];

export function QuoteResultsList({
  offers,
  insurers,
  defaultLevel,
  onSelectOffer,
}: QuoteResultsListProps) {
  const t = useTranslations("quote.results");
  const tLevels = useTranslations("coverage.levels");

  const [level, setLevel] = useState<CoverageLevel>(defaultLevel);
  const [sortBy, setSortBy] = useState<SortOption>("priceAsc");

  // Select (Base UI) necesita `items` para resolver la etiqueta mostrada en
  // el trigger; sin esto, muestra el value crudo en vez de la traducción.
  const levelItems = useMemo(
    () => LEVELS.map((lvl) => ({ value: lvl, label: tLevels(`${lvl}.name`) })),
    [tLevels],
  );
  const sortItems = useMemo(
    () => [
      { value: "priceAsc", label: t("filters.sortOptions.priceAsc") },
      { value: "priceDesc", label: t("filters.sortOptions.priceDesc") },
      { value: "rating", label: t("filters.sortOptions.rating") },
    ],
    [t],
  );

  const insurersById = useMemo(
    () => new Map(insurers.map((insurer) => [insurer.id, insurer])),
    [insurers],
  );

  const filteredAndSorted = useMemo(() => {
    const filtered = offers.filter((offer) => offer.coverageLevel === level);
    const sorted = [...filtered];

    if (sortBy === "priceAsc") {
      sorted.sort((a, b) => a.annualPremiumCrc - b.annualPremiumCrc);
    } else if (sortBy === "priceDesc") {
      sorted.sort((a, b) => b.annualPremiumCrc - a.annualPremiumCrc);
    } else {
      sorted.sort((a, b) => {
        const ratingA = insurersById.get(a.insurerId)?.rating ?? 0;
        const ratingB = insurersById.get(b.insurerId)?.rating ?? 0;
        return ratingB - ratingA;
      });
    }

    return sorted;
  }, [offers, level, sortBy, insurersById]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="level-filter">{t("filters.level")}</Label>
          <Select
            value={level}
            onValueChange={(value) => setLevel(value as CoverageLevel)}
            items={levelItems}
          >
            <SelectTrigger id="level-filter" className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((lvl) => (
                <SelectItem key={lvl} value={lvl}>
                  {tLevels(`${lvl}.name`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sort-select">{t("filters.sort")}</Label>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
            items={sortItems}
          >
            <SelectTrigger id="sort-select" className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priceAsc">{t("filters.sortOptions.priceAsc")}</SelectItem>
              <SelectItem value="priceDesc">{t("filters.sortOptions.priceDesc")}</SelectItem>
              <SelectItem value="rating">{t("filters.sortOptions.rating")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <QuoteSavingsSummary offers={filteredAndSorted} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden">
        {filteredAndSorted.map((offer) => (
          <QuoteOfferCard
            key={offer.id}
            offer={offer}
            insurer={insurersById.get(offer.insurerId)}
            onSelect={() => onSelectOffer(offer.id)}
          />
        ))}
      </div>

      <QuoteCompareTable
        offers={filteredAndSorted}
        insurersById={insurersById}
        onSelectOffer={onSelectOffer}
      />
    </div>
  );
}
