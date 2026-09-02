import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CheckCircle2, ClipboardList, Scale } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InsurerAvatar } from "@/components/features/quote/insurer-avatar";
import { insurers } from "@/lib/mock-data/insurers";

const SITE_TITLE = "MiSeguro — Comparador de seguros de auto";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("landing.hero");
  const description = t("subtitle");

  return {
    title: SITE_TITLE,
    description,
    openGraph: {
      title: SITE_TITLE,
      description,
      type: "website",
    },
  };
}

const HOW_IT_WORKS_STEPS = ["step1", "step2", "step3"] as const;
const HOW_IT_WORKS_ICONS = [ClipboardList, Scale, CheckCircle2];
const FAQ_ITEMS = ["q1", "q2", "q3", "q4", "q5"] as const;

export default async function Home() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-16 pb-16">
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5 px-4 pt-10 text-center sm:pt-14">
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
          {t("landing.hero.title")}
        </h1>
        <p className="text-base text-muted-foreground">{t("landing.hero.subtitle")}</p>
        <Link href="/quote/profile" className={buttonVariants({ size: "lg" })}>
          {t("landing.hero.cta")}
        </Link>
      </section>

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4">
        <h2 className="text-center text-xl font-semibold text-foreground">
          {t("landing.howItWorks.title")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step, index) => {
            const Icon = HOW_IT_WORKS_ICONS[index];
            return (
              <Card key={step}>
                <CardHeader>
                  <Icon className="size-5 text-primary" aria-hidden />
                  <CardTitle>{t(`landing.howItWorks.steps.${step}.title`)}</CardTitle>
                  <CardDescription>
                    {t(`landing.howItWorks.steps.${step}.description`)}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4">
        <h2 className="text-center text-xl font-semibold text-foreground">
          {t("landing.insurers.title")}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {insurers.map((insurer) => (
            <div
              key={insurer.id}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5"
            >
              <InsurerAvatar name={insurer.name} colorToken={insurer.colorToken} />
              <span className="text-sm text-foreground">{insurer.name}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {t("landing.insurers.note")}
        </p>
      </section>

      <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4">
        <h2 className="text-center text-xl font-semibold text-foreground">
          {t("landing.faq.title")}
        </h2>
        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item) => (
            <Card key={item}>
              <CardContent>
                <h3 className="text-sm font-semibold text-foreground">
                  {t(`landing.faq.items.${item}.question`)}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(`landing.faq.items.${item}.answer`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
