"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WizardShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  /** Muestra el pie de navegación (Atrás / Continuar). Default: true. */
  showNav?: boolean;
  /** Si se define, muestra el botón "Atrás" navegando a esta ruta. */
  backHref?: string;
  continueLabel?: string;
  isSubmitting?: boolean;
  /**
   * Los 4 pasos del wizard son formularios angostos (max-w-2xl). Resultados
   * es una tabla comparativa: necesita más aire en desktop o queda apretada
   * con scroll horizontal aunque sobre pantalla.
   */
  wide?: boolean;
};

export function WizardShell({
  title,
  description,
  children,
  showNav = true,
  backHref,
  continueLabel,
  isSubmitting = false,
  wide = false,
}: WizardShellProps) {
  const t = useTranslations("common");
  const router = useRouter();

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-6 px-4 py-8",
        wide ? "max-w-5xl" : "max-w-2xl",
      )}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {children}

      {showNav ? (
        <div className="flex items-center justify-between gap-3 pt-2">
          {backHref ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(backHref)}
            >
              {t("back")}
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={isSubmitting}>
            {continueLabel ?? t("continue")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
