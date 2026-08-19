import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getRepo } from "@/lib/repo";
import { PageHeader, CtaBanner } from "@/components/layout/page";
import { ProgramExplorer } from "@/components/programs/program-explorer";
import { Skeleton } from "@/components/ui/primitives";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "programs" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ProgramsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("programs");
  const repo = await getRepo();
  const [programs, categories, universities] = await Promise.all([repo.listPrograms(), repo.listCategories(), repo.listUniversities()]);
  const rows = programs.map((p) => ({ ...p, faculty: { fa: "", en: "" }, university: { id: p.university.id, slug: p.university.slug, name: p.university.name, short_name: p.university.short_name, type: p.university.type, logo_url: p.university.logo_url } }));
  return (
    <>
      <PageHeader eyebrow={`${programs.length}+`} title={t("title")} subtitle={t("subtitle")} />
      <Suspense fallback={<div className="container-x py-10"><Skeleton className="h-96" /></div>}>
        <ProgramExplorer programs={rows} categories={categories} universities={universities.map((u) => ({ id: u.id, slug: u.slug, name: u.name }))} />
      </Suspense>
      <CtaBanner compact />
    </>
  );
}
