import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function DemoBadge({ className }: { className?: string }) {
  const t = useTranslations("common");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground",
        className,
      )}
    >
      <Info className="size-3" aria-hidden />
      {t("demoBadge")}
    </span>
  );
}
