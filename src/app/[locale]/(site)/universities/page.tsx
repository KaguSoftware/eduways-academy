import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getRepo } from "@/lib/repo";
import { slimUniversity } from "@/lib/dto";
import { PageHeader, CtaBanner } from "@/components/layout/page";
import { UniversityExplorer } from "@/components/university/university-explorer";
import { Skeleton } from "@/components/ui/primitives";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "universities" });
  return { title: t("title"), description: t("subtitle"), alternates: { canonical: locale === "fa" ? "/universities" : "/en/universities" } };
}

export default async function UniversitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("universities");
  const repo = await getRepo();
  const [universities, districts, categories] = await Promise.all([repo.listUniversities(), repo.listDistricts(), repo.listCategories()]);

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Suspense fallback={<div className="container-x grid gap-5 py-10 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64" />)}</div>}>
        <UniversityExplorer universities={universities.map(slimUniversity)} districts={districts} categories={categories} />
      </Suspense>
      <CtaBanner compact />
    </>
  );
}
