import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { AboutHero } from "@/components/sections/about/AboutHero";
import { DarsSection } from "@/components/sections/about/DarsSection";
import { UstadSection } from "@/components/sections/about/UstadSection";
import { ADSASection } from "@/components/sections/about/ADSASection";
import { SUFFASection } from "@/components/sections/about/SUFFASection";
import { SUHBASection } from "@/components/sections/about/SUHBASection";
import { AboutCTA } from "@/components/sections/about/AboutCTA";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "AboutPage.hero" });
  return {
    title: `${t("heading")} — Grand Jeelani Conference`,
    description: t("description"),
  };
}

export default function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <main className="bg-[var(--surface)] min-h-screen">
      <AboutHero />
      <DarsSection />
      <UstadSection />
      <ADSASection />
      <SUFFASection />
      <SUHBASection />
      <AboutCTA />
    </main>
  );
}
