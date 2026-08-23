import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Quote, GraduationCap } from "lucide-react";
import { getRepo } from "@/lib/repo";
import { formatNumber, tx } from "@/lib/utils";
import { PageHeader, CtaBanner } from "@/components/layout/page";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/primitives";
import { Pager } from "@/components/ui/pager";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "stories" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function StoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const loc = await getLocale();
  const repo = await getRepo();
  const stories = await repo.listStories();
  return (
    <>
      <PageHeader title={t("stories.title")} subtitle={t("stories.subtitle")} />
      <section className="container-x py-12">
        <Pager perPage={6}>
          {stories.map((s, i) => (
            <Reveal key={s.id} delay={(i % 6) * 0.05}>
              <Link href={`/stories/${s.slug}`} className="group flex h-full flex-col card p-6 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg focus-ring">
                <Quote className="size-7 text-accent-500" />
                <p className="mt-4 flex-1 text-base leading-8">{tx(s.quote, loc)}</p>
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-gradient font-bold text-white">{s.student_name.slice(0, 1)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{s.student_name}</span>
                    <span className="block truncate text-xs text-muted">{s.university ? tx(s.university.name, loc) : ""} · {tx(s.program, loc)}</span>
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.year_enrolled && <Badge variant="brand"><GraduationCap className="size-3" />{t("stories.enrolled", { year: formatNumber(s.year_enrolled, loc, { useGrouping: false }) })}</Badge>}
                  {s.country && <Badge variant="outline">{t("stories.from", { country: t(`consultation.countries.${s.country}` as never) })}</Badge>}
                </div>
              </Link>
            </Reveal>
          ))}
        </Pager>
      </section>
      <CtaBanner compact />
    </>
  );
}
