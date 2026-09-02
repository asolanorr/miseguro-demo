"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const STEPS = [
  { href: "/quote/profile", labelKey: "profile" },
  { href: "/quote/vehicle", labelKey: "vehicle" },
  { href: "/quote/driver", labelKey: "driver" },
  { href: "/quote/coverage", labelKey: "coverage" },
  { href: "/quote/results", labelKey: "results" },
] as const;

export function WizardStepper() {
  const t = useTranslations("quote.stepper");
  const pathname = usePathname();

  const currentIndex = Math.max(
    0,
    STEPS.findIndex((step) => step.href === pathname),
  );

  return (
    <ol className="mx-auto flex w-full max-w-2xl items-center gap-2 px-4 pt-6">
      {STEPS.map((step, index) => {
        const isLastStep = index === STEPS.length - 1;
        const status =
          index < currentIndex || (index === currentIndex && isLastStep)
            ? "completed"
            : index === currentIndex
              ? "current"
              : "upcoming";

        return (
          <li key={step.href} className="flex flex-1 items-center gap-2">
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                  status === "completed" && "bg-primary text-primary-foreground",
                  status === "current" &&
                    "border-2 border-primary text-primary",
                  status === "upcoming" &&
                    "border border-border text-muted-foreground",
                )}
                aria-hidden
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  "hidden text-center text-xs sm:block",
                  status === "upcoming" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {t(step.labelKey)}
              </span>
            </div>
            {index < STEPS.length - 1 ? (
              <span
                className={cn(
                  "h-px flex-1",
                  index < currentIndex ? "bg-primary" : "bg-border",
                )}
                aria-hidden
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
