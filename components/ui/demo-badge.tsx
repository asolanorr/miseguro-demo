import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DemoBadge({ className }: { className?: string }) {
  const t = useTranslations("common");

  return (
    <Badge
      variant="outline"
      className={cn("border-warning bg-warning text-warning-foreground", className)}
    >
      {t("demoBadge")}
    </Badge>
  );
}
