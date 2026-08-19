import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Trophy, BadgePercent, Wallet, Languages, Landmark, Building2, ArrowUpRight } from "lucide-react";
import { getRepo } from "@/lib/repo";
import { tx } from "@/lib/utils";
import { PageHeader, CtaBanner, SectionHeader } from "@/components/layout/page";
import { RankingTable, rankingList } from "@/components/rankings/ranking-table";
import { DynamicIcon } from "@/components/home/sections";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "rankings" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function RankingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const loc = await getLocale();
  const repo = await getRepo();
  const [all, categories] = await Promise.all([repo.listUniversities(), repo.listCategories()]);

  const cards = [
    { key: "overall", icon: Trophy, label: t("rankings.overall") },
    { key: "best-value", icon: BadgePercent, label: t("rankings.bestValue") },
    { key: "cheapest", icon: Wallet, label: t("rankings.cheapest") },
    { key: "english-taught", icon: Languages, label: t("rankings.englishTaught") },
    { key: "public", icon: Landmark, label: t("rankings.public") },
    { key: "private", icon: Building2, label: t("rankings.private") },
  ];

  return (
    <>
      <PageHeader title={t("rankings.title")} subtitle={t("rankings.subtitle")} />
      <section className="container-x py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ key, icon: Icon, label }) => (
            <Link key={key} href={`/rankings/${key}`} className="group flex items-center gap-4 card p-5 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg focus-ring">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white"><Icon className="size-6" /></span>
              <span className="flex-1 font-bold">{label}</span>
              <ArrowUpRight className="size-5 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold">{t("rankings.byField")}</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link key={c.id} href={`/rankings/field-${c.slug}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 focus-ring">
                <DynamicIcon name={c.icon ?? "Sparkles"} className="size-4 text-brand-600" />{tx(c.name, loc)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-6">
        <SectionHeader title={t("rankings.overall")} subtitle={t("rankings.sourceNote")} href="/rankings/overall" linkLabel={t("rankings.viewFull")} />
        <RankingTable list={rankingList("overall", all, categories).slice(0, 15)} metricKey="overall" />
      </section>

      <section className="container-x py-10">
        <div className="card p-6 md:p-8">
          <h2 className="text-xl font-bold">{t("rankings.methodology")}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">{t("rankings.methodologyBody")}</p>
        </div>
      </section>
      <CtaBanner compact />
    </>
  );
}
