import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { getRepo } from "@/lib/repo";
import { routing } from "@/i18n/routing";
import { tx } from "@/lib/utils";
import { PageHeader, CtaBanner } from "@/components/layout/page";
import { RankingTable, rankingList, type RankingKey } from "@/components/rankings/ranking-table";

export const revalidate = 3600;
const FIXED = ["overall", "best-value", "cheapest", "english-taught", "public", "private"] as const;

export async function generateStaticParams() {
  const repo = await getRepo();
  const cats = await repo.listCategories();
  const keys = [...FIXED, ...cats.map((c) => `field-${c.slug}`)];
  return routing.locales.flatMap((locale) => keys.map((category) => ({ locale, category })));
}

async function titleFor(key: string, locale: string) {
  const t = await getTranslations({ locale, namespace: "rankings" });
  const map: Record<string, string> = { overall: t("overall"), "best-value": t("bestValue"), cheapest: t("cheapest"), "english-taught": t("englishTaught"), public: t("public"), private: t("private") };
  if (map[key]) return map[key];
  const repo = await getRepo();
  const cats = await repo.listCategories();
  const c = cats.find((c) => `field-${c.slug}` === key);
  return c ? `${t("byField")}: ${tx(c.name, locale)}` : null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string }> }): Promise<Metadata> {
  const { locale, category } = await params;
  const title = await titleFor(category, locale);
  const t = await getTranslations({ locale, namespace: "rankings" });
  return title ? { title: `${title} · ${t("title")}`, description: t("subtitle") } : {};
}

export default async function RankingCategoryPage({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const { locale, category } = await params;
  setRequestLocale(locale);
  const title = await titleFor(category, locale);
  if (!title) notFound();
  const t = await getTranslations();
  const loc = await getLocale();
  const repo = await getRepo();
  const [all, categories] = await Promise.all([repo.listUniversities(), repo.listCategories()]);
  const list = rankingList(category as RankingKey, all, categories);

  return (
    <>
      <PageHeader title={title} subtitle={t("rankings.sourceNote")} crumbs={[{ label: t("nav.home"), href: "/" }, { label: t("nav.rankings"), href: "/rankings" }, { label: title }]} />
      <section className="container-x py-10">
        <RankingTable list={list} metricKey={category as RankingKey} />
        <p className="mt-6 text-xs text-muted">{t("rankings.methodologyBody")}</p>
        {loc !== locale ? null : null}
      </section>
      <CtaBanner compact />
    </>
  );
}
