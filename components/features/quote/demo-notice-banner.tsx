import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Banner permanente de la pantalla de resultados (docs/mvp-plan.md §1.1).
 * A propósito no tiene botón de cerrar ni ninguna forma de ocultarlo -- solo
 * se ajustó el peso visual (franja delgada en vez de caja sólida) para que
 * pese menos en la pantalla sin dejar de estar siempre presente.
 */
export function DemoNoticeBanner() {
  const t = useTranslations("quote.results");

  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-md border-l-4 border-warning bg-warning/10 px-3 py-2 text-xs text-foreground"
    >
      <Info className="size-3.5 shrink-0 text-warning" aria-hidden />
      <span>{t("demoNotice")}</span>
    </div>
  );
}
