import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("common");

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <p className="text-base text-muted-foreground">{t("comingSoon")}</p>
    </main>
  );
}
