import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import { getRepo } from "@/lib/repo";
import { formatNumber, tx } from "@/lib/utils";
import { PageHeader, CtaBanner } from "@/components/layout/page";
import { WhySection, ProcessSection, StoriesSection } from "@/components/home/sections";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const loc = await getLocale();
  const repo = await getRepo();
  const [s, stories] = await Promise.all([repo.getSettings(), repo.listStories()]);
  const stats = [
    [s.stats.students_placed, "+", t("home.statsStudents")],
    [s.stats.partner_universities, "+", t("home.statsUniversities")],
    [s.stats.years_active, "", t("home.statsYears")],
    [s.stats.satisfaction_pct, t("common.percent"), t("home.statsSatisfaction")],
  ] as const;
  return (
    <>
      <PageHeader title={t("about.title")} subtitle={t("about.subtitle")} />
      <section className="container-x grid items-center gap-10 py-16 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">{t("about.missionTitle")}</h2>
          <p className="mt-4 text-base leading-8 text-muted">{t("about.missionBody")}</p>
          <h3 className="mt-8 font-bold">{t("about.valuesTitle")}</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {[1, 2, 3, 4].map((n) => <li key={n} className="flex items-start gap-2 rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-sm"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" />{t(`about.value${n}` as never)}</li>)}
          </ul>
        </div>
        <div className="relative">
          <div className="grid grid-cols-2 gap-4">
            {stats.map(([v, suf, label]) => (
              <div key={label} className="card p-6 text-center"><p className="text-4xl font-extrabold tabular text-gradient">{formatNumber(v, loc)}{suf}</p><p className="mt-1 text-sm text-muted">{label}</p></div>
            ))}
          </div>
          <Image src="/brand/logo.jpg" alt="Eduways" width={96} height={96} className="absolute -bottom-6 -end-6 size-24 rounded-full shadow-lg ring-4 ring-white" />
        </div>
      </section>
      <WhySection />
      <ProcessSection />
      <StoriesSection stories={stories} />
      <section className="container-x py-16">
        <h2 className="text-2xl font-extrabold tracking-tight">{t("about.officeTitle")}</h2>
        <p className="mt-2 text-muted">{tx(s.address, loc)} · {t("contact.hoursValue")}</p>
      </section>
      <CtaBanner compact />
    </>
  );
}
