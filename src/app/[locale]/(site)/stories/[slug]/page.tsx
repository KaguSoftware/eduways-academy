import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Quote, GraduationCap, ArrowUpRight } from "lucide-react";
import { getRepo } from "@/lib/repo";
import { routing } from "@/i18n/routing";
import { formatNumber, tx, formatDate } from "@/lib/utils";
import { PageHeader, CtaBanner } from "@/components/layout/page";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export const revalidate = 3600;

export async function generateStaticParams() {
  const repo = await getRepo();
  const s = await repo.listStories();
  return routing.locales.flatMap((locale) => s.map((x) => ({ locale, slug: x.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const repo = await getRepo();
  const s = await repo.getStory(slug);
  return s ? { title: `${s.student_name} — ${s.university ? tx(s.university.name, locale) : ""}`, description: tx(s.quote, locale) } : {};
}

export default async function StoryPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const loc = await getLocale();
  const repo = await getRepo();
  const s = await repo.getStory(slug);
  if (!s) notFound();
  return (
    <>
      <PageHeader eyebrow={<><GraduationCap className="size-3.5" />{s.year_enrolled && t("stories.enrolled", { year: formatNumber(s.year_enrolled, loc, { useGrouping: false }) })}</>} title={s.student_name} subtitle={`${s.university ? tx(s.university.name, loc) : ""} · ${tx(s.program, loc)}`} crumbs={[{ label: t("nav.home"), href: "/" }, { label: t("nav.stories"), href: "/stories" }, { label: s.student_name }]} />
      <section className="container-x grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <article>
          <blockquote className="relative rounded-3xl bg-brand-50 p-8 text-xl font-semibold leading-9 text-brand-900">
            <Quote className="absolute -top-4 start-6 size-9 text-accent-500" />
            {tx(s.quote, loc)}
          </blockquote>
          <div className="prose mt-8 max-w-none text-base leading-8 text-foreground/90">{tx(s.body, loc)}</div>
          <p className="mt-6 text-xs text-muted">{formatDate(s.published_at, loc)}</p>
        </article>
        {s.university && (
          <aside className="card self-start p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t("programs.university")}</p>
            <p className="mt-1 text-lg font-bold">{tx(s.university.name, loc)}</p>
            <div className="mt-2 flex gap-1.5">{s.country && <Badge variant="outline">{t("stories.from", { country: t(`consultation.countries.${s.country}` as never) })}</Badge>}</div>
            <Button asChild variant="secondary" className="mt-4 w-full"><Link href={`/universities/${s.university.slug}`}>{t("programs.viewUniversity")}<ArrowUpRight className="size-4 rtl:-scale-x-100" /></Link></Button>
          </aside>
        )}
      </section>
      <CtaBanner compact />
    </>
  );
}
