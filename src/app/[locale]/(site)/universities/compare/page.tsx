import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getRepo } from "@/lib/repo";
import { PageHeader, CtaBanner } from "@/components/layout/page";
import { CompareView } from "@/components/university/compare-view";
import { slimUniversity } from "@/lib/dto";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "universities" });
  return { title: t("compareTitle"), description: t("compareSubtitle") };
}

export default async function ComparePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ u?: string }> }) {
  const { locale } = await params;
  const { u } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("universities");
  const repo = await getRepo();
  const all = await repo.listUniversities();
  const selected = (u ?? "").split(",").filter(Boolean);

  return (
    <>
      <PageHeader title={t("compareTitle")} subtitle={t("compareSubtitle")} />
      <CompareView all={all.map((x) => ({ id: x.id, slug: x.slug, name: x.name }))} initial={all.filter((x) => selected.includes(x.slug)).map((x) => ({ ...slimUniversity(x), scholarships: x.scholarships, rankings: x.rankings }))} />
      <CtaBanner compact />
    </>
  );
}
