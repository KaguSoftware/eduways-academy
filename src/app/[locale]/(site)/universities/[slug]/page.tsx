import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ExternalLink, MapPin, Sparkles, MessageCircle, BadgePercent } from "lucide-react";
import { getRepo } from "@/lib/repo";
import { routing } from "@/i18n/routing";
import { formatNumber, formatRange, tx, whatsappLink } from "@/lib/utils";
import { UniversityDetail } from "@/components/university/university-detail";
import { UniversityLogo, UniversityCard } from "@/components/university/university-card";
import { UniversityJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Badge, Skeleton } from "@/components/ui/primitives";
import { CompareToggle } from "@/components/university/compare-toggle";
import { slimUniversity } from "@/lib/dto";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const repo = await getRepo();
  const unis = await repo.listUniversities();
  return routing.locales.flatMap((locale) => unis.map((u) => ({ locale, slug: u.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const repo = await getRepo();
  const u = await repo.getUniversity(slug);
  if (!u) return {};
  const t = await getTranslations({ locale, namespace: "universities" });
  const title = tx(u.name, locale);
  const description = tx(u.description, locale).slice(0, 160);
  const path = `/universities/${slug}`;
  return {
    title: `${title} — ${t("documents")}, ${t("programs")}, ${t("scholarships")}`,
    description,
    alternates: { canonical: locale === "fa" ? path : `/en${path}`, languages: { fa: path, en: `/en${path}` } },
    openGraph: { title, description, type: "article" },
  };
}

export default async function UniversityPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const repo = await getRepo();
  const [u, all, categories] = await Promise.all([repo.getUniversity(slug), repo.listUniversities(), repo.listCategories()]);
  if (!u) notFound();

  const dist = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => Math.hypot(a.lat - b.lat, a.lng - b.lng);
  const nearby = all.filter((x) => x.id !== u.id).sort((a, b) => dist(a, u) - dist(b, u)).slice(0, 5);
  const similar = all.filter((x) => x.id !== u.id && x.type === u.type).sort((a, b) => Math.abs(a.editorial_score - u.editorial_score) - Math.abs(b.editorial_score - u.editorial_score)).slice(0, 3);
  const name = tx(u.name, locale);
  const wa = whatsappLink(locale === "fa" ? `سلام ادیوویز! درباره پذیرش در ${name} سوال دارم.` : `Hello Eduways! I have a question about admission to ${name}.`);

  return (
    <>
      <UniversityJsonLd u={u} locale={locale} />
      <BreadcrumbJsonLd items={[{ name: t("nav.home"), url: "/" }, { name: t("nav.universities"), url: "/universities" }, { name, url: `/universities/${u.slug}` }]} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
        <div className="container-x relative py-10 md:py-14">
          <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-700">{t("nav.home")}</Link><span>/</span>
            <Link href="/universities" className="hover:text-brand-700">{t("nav.universities")}</Link><span>/</span>
            <span className="text-foreground">{u.short_name ?? name}</span>
          </nav>
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-5">
              <UniversityLogo name={u.short_name || u.name.en} logo={u.logo_url} size={84} className="rounded-3xl text-2xl" />
              <div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant={u.type === "public" ? "success" : "accent"}>{t(`common.${u.type}`)}</Badge>
                  {u.best_rank && <Badge variant="dark">#{formatNumber(u.best_rank, locale)} TR</Badge>}
                  {u.eduways_discount_pct ? <Badge variant="success"><BadgePercent className="size-3" />{t("common.upTo")} {formatNumber(u.eduways_discount_pct, locale)}٪ {t("common.discount")}</Badge> : null}
                </div>
                <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-brand-950 md:text-4xl">{name}</h1>
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                  {u.district && <span className="inline-flex items-center gap-1"><MapPin className="size-4" />{tx(u.district.name, locale)} · {t(`common.${u.district.side}`)}</span>}
                  <span>{t("common.founded")} {formatNumber(u.founded, locale, { useGrouping: false })}</span>
                  <a href={u.website} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-brand-700 hover:underline"><ExternalLink className="size-3.5" />{t("common.website")}</a>
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <CompareToggle slug={u.slug} />
              <Button asChild variant="whatsapp"><a href={wa} target="_blank" rel="noopener"><MessageCircle className="size-4" />{t("common.whatsapp")}</a></Button>
              <Button asChild><Link href={{ pathname: "/consultation", query: { university: u.slug } }}><Sparkles className="size-4" />{t("universities.applyCta")}</Link></Button>
            </div>
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              [t("universities.tuitionRange"), `${formatRange(u.avg_tuition_min, u.avg_tuition_max, locale)}`],
              [t("common.programsCount", { count: u.programs.length }), `${formatNumber(u.programs.filter((p) => p.language !== "tr").length, locale)} EN`],
              [t("common.score"), `${formatNumber(u.editorial_score, locale)}/100`],
              [t("universities.valueScore"), `${formatNumber(u.value_score ?? 0, locale)}/100`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-border bg-white/70 px-4 py-3 backdrop-blur"><dt className="text-[11px] font-medium uppercase tracking-wide text-muted">{k}</dt><dd className="mt-0.5 text-base font-extrabold tabular">{v}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-x grid gap-10 py-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <Suspense fallback={<Skeleton className="h-96" />}>
            <UniversityDetail u={u} categories={categories} nearby={nearby.map(slimUniversity)} />
          </Suspense>
        </div>
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white shadow-lg">
            <div className="pointer-events-none absolute -end-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
            <h3 className="text-xl font-extrabold">{t("universities.applyCta")}</h3>
            <p className="mt-2 text-sm leading-7 text-white/85">{t("universities.applyBody")}</p>
            <div className="mt-5 grid gap-2">
              <Button asChild className="bg-white text-brand-900 hover:bg-brand-50"><Link href={{ pathname: "/consultation", query: { university: u.slug } }}><Sparkles className="size-4" />{t("home.ctaButton")}</Link></Button>
              <Button asChild variant="whatsapp"><a href={wa} target="_blank" rel="noopener"><MessageCircle className="size-4" />{t("common.whatsapp")}</a></Button>
            </div>
          </div>
          {u.scholarships.filter((s) => s.type === "eduways").map((s) => (
            <div key={s.id} className="card border-success/30 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-success">{t("common.eduwaysDeal")}</p>
              <p className="mt-1 text-2xl font-extrabold tabular">{t("common.upTo")} {formatNumber(s.discount_pct, locale)}٪</p>
              <p className="mt-1 text-sm text-muted">{tx(s.conditions, locale)}</p>
            </div>
          ))}
        </aside>
      </section>

      {similar.length > 0 && (
        <section className="container-x py-10">
          <h2 className="mb-6 text-2xl font-extrabold tracking-tight">{t("universities.similar")}</h2>
          <div className="grid gap-5 md:grid-cols-3">{similar.map((s, i) => <UniversityCard key={s.id} u={slimUniversity(s)} index={i} compact />)}</div>
        </section>
      )}
    </>
  );
}
