import { useTranslations } from "next-intl";
import { APP_NAME } from "@/lib/constants";

export function SiteFooter() {
  const t = useTranslations("common.footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted-foreground">
        {"©"} {year} {APP_NAME}. {t("rights")}
      </div>
    </footer>
  );
}
