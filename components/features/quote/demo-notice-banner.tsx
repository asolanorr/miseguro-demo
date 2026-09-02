import { useTranslations } from "next-intl";

/**
 * Banner permanente de la pantalla de resultados (docs/mvp-plan.md §1.1).
 * A propósito no tiene botón de cerrar ni ninguna forma de ocultarlo.
 */
export function DemoNoticeBanner() {
  const t = useTranslations("quote.results");

  return (
    <div
      role="status"
      className="rounded-lg border border-warning bg-warning px-4 py-3 text-sm font-medium text-warning-foreground"
    >
      {t("demoNotice")}
    </div>
  );
}
