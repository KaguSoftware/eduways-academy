import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getRepo } from "@/lib/repo";
import { PageHeader, CtaBanner } from "@/components/layout/page";
import { CostCalculator } from "@/components/tools/cost-calculator";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "calculator" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function CalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("calculator");
  const repo = await getRepo();
  const [universities, districts, categories] = await Promise.all([repo.listUniversities(), repo.listDistricts(), repo.listCategories()]);
  const catIcon = new Map(categories.map((c) => [c.id, c.icon]));
  const calcUnis = universities
    .sort((a, b) => b.editorial_score - a.editorial_score)
    .map((u) => ({ id: u.id, slug: u.slug, name: u.name, avg_tuition_min: u.avg_tuition_min, avg_tuition_max: u.avg_tuition_max, has_dorm: u.has_dorm, district_id: u.district_id, eduways_discount_pct: u.eduways_discount_pct ?? null, programs: u.programs.map((p) => ({ id: p.id, name: p.name, tuition_usd: p.tuition_usd, level: p.level, language: p.language, icon: catIcon.get(p.category_id) ?? null })) }));
  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <section className="container-x py-12"><CostCalculator universities={calcUnis} districts={districts} /></section>
      <CtaBanner compact />
    </>
  );
}
