import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import * as Icons from "lucide-react";
import { ShieldCheck, BadgePercent, Plane, Languages, ArrowUpRight, Quote, MapPin, Diamond } from "lucide-react";
import { InstagramIcon as Instagram } from "@/components/ui/icons";
import type { UniversityWithRelations, Service, Story, District, Post, Faq, University } from "@/lib/types";
import { cn, formatNumber, formatUSD, tx, formatDate } from "@/lib/utils";
import { SectionHeader } from "@/components/layout/page";
import { UniversityCard, UniversityLogo } from "@/components/university/university-card";
import { Button } from "@/components/ui/button";
import { Badge, Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";

type IconName = keyof typeof Icons;
export function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons[name as IconName] ?? Icons.Sparkles) as React.ComponentType<{ className?: string }>;
  return <Cmp className={className} />;
}

/* ───────── Trust marquee ───────── */
const MARQUEE_MIN_ITEMS = 40;
export function TrustMarquee({ universities }: { universities: University[] }) {
  const copies = universities.length > 0 ? Math.max(2, Math.ceil(MARQUEE_MIN_ITEMS / universities.length)) : 2;
  const list = Array.from({ length: copies }, () => universities).flat();
  return (
    // The whole strip is locked to `ltr`. Under RTL the browser anchors an over-wide track to
    // the right edge of the frame, so the negative translate walks it out of view and the loop
    // breaks halfway through; forcing the direction makes both locales scroll identically.
    <div dir="ltr" className="relative overflow-hidden border-y border-border bg-background py-5">
      {/* The strip is not a `.container-x`, so lift the logos above the graduation trail
          ourselves; the edge fade is a mask (paints nothing) rather than gradient overlays,
          which would sit above the trail and hide it at the strip's ends. */}
      <div className="relative z-[2] [mask-image:linear-gradient(to_right,transparent,#000_6rem,#000_calc(100%-6rem),transparent)]">
        <div
          className="flex w-max animate-marquee hover:[animation-play-state:paused]"
          style={{ "--marquee-end": `-${100 / copies}%` } as React.CSSProperties}
        >
          {list.map((u, i) => (
            // Spacing rides on the item instead of a flex `gap`: a gap is dropped after the last
            // slot, so one copy is narrower than 1/copies of the track and the wrap jumps. With
            // the trailing space baked into every item the translate lands exactly on a seam.
            <div key={u.id + i} className="flex shrink-0 items-center gap-10 pr-10">
              {/* `auto` lets a wordmark take the width it needs — the strip scrolls sideways,
                  so there is no reason to squeeze every mark into the same square. */}
              <UniversityLogo name={u.short_name || u.name.en} logo={u.logo_url} size={40} fit="auto" className="text-xs" />
              <Diamond aria-hidden className="size-2 shrink-0 fill-border text-border" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────── Why ───────── */
export async function WhySection() {
  const t = await getTranslations("home");
  const items = [
    { icon: ShieldCheck, title: t("why1Title"), body: t("why1Body") },
    { icon: BadgePercent, title: t("why2Title"), body: t("why2Body") },
    { icon: Plane, title: t("why3Title"), body: t("why3Body") },
    { icon: Languages, title: t("why4Title"), body: t("why4Body") },
  ];
  return (
    <section className="container-x py-20">
      <SectionHeader title={t("whyTitle")} subtitle={t("whySubtitle")} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, body }, i) => (
          <Reveal key={title} delay={i * 0.07}>
            <div className="group card h-full p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-brand-200">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-md transition-transform group-hover:scale-110"><Icon className="size-6" /></div>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────── Featured universities ───────── */
export async function FeaturedUniversities({ universities }: { universities: UniversityWithRelations[] }) {
  const t = await getTranslations();
  return (
    <section className="bg-surface py-20">
      <div className="container-x">
        <SectionHeader title={t("home.featuredTitle")} subtitle={t("home.featuredSubtitle")} href="/universities" linkLabel={t("common.viewAll")} />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {universities.map((u, i) => <UniversityCard key={u.id} u={u} index={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ───────── Process ───────── */
export async function ProcessSection() {
  const t = await getTranslations("home");
  const steps = [1, 2, 3, 4, 5].map((n) => ({ title: t(`process${n}Title` as never), body: t(`process${n}Body` as never) }));
  return (
    <section className="container-x py-20">
      <SectionHeader title={t("processTitle")} subtitle={t("processSubtitle")} align="center" />
      <ol className="relative grid gap-6 md:grid-cols-5">
        <div className="pointer-events-none absolute inset-x-[10%] top-7 hidden h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-accent-400 md:block" />
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.08}>
            <li className="relative flex flex-col items-center text-center">
              <span className="relative z-10 flex size-14 items-center justify-center rounded-full border-4 border-background bg-brand-gradient font-en text-lg font-extrabold text-white shadow-md">{i + 1}</span>
              <h3 className="mt-4 font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted">{s.body}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

/* ───────── Rankings preview ───────── */
export async function RankingsPreview({ top, bestValue }: { top: UniversityWithRelations[]; bestValue: UniversityWithRelations[] }) {
  const t = await getTranslations();
  const locale = await getLocale();
  const Table = ({ title, rows, metric, href }: { title: string; rows: UniversityWithRelations[]; metric: (u: UniversityWithRelations) => string; href: string }) => (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="font-bold">{title}</h3>
        <Link href={href as never} className="text-xs font-semibold text-brand-700 hover:underline">{t("rankings.viewFull")}</Link>
      </div>
      <ol>
        {rows.map((u, i) => (
          <li key={u.id}>
            <Link href={`/universities/${u.slug}`} className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-brand-50/60">
              <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full font-en text-sm font-extrabold", i < 3 ? "bg-brand-gradient text-white" : "bg-surface text-muted")}>{formatNumber(i + 1, locale)}</span>
              <UniversityLogo name={u.short_name || u.name.en} logo={u.logo_url} size={36} className="rounded-xl text-xs" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{tx(u.name, locale)}</span>
                <span className="block text-xs text-muted">{t(`common.${u.type}`)} · {u.district ? tx(u.district.name, locale) : ""}</span>
              </span>
              <span className="text-sm font-bold tabular text-brand-800">{metric(u)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
  return (
    <section className="bg-surface py-20">
      <div className="container-x">
        <SectionHeader title={t("home.rankingsTitle")} subtitle={t("home.rankingsSubtitle")} href="/rankings" linkLabel={t("common.viewAll")} />
        <div className="grid gap-6 lg:grid-cols-2">
          <Table title={t("rankings.overall")} rows={top} metric={(u) => (u.best_rank ? `#${formatNumber(u.best_rank, locale)}` : "—")} href="/rankings" />
          <Table title={t("rankings.bestValue")} rows={bestValue} metric={(u) => `${formatNumber(u.value_score ?? 0, locale)}/100`} href="/rankings/best-value" />
        </div>
      </div>
    </section>
  );
}

/* ───────── Services ───────── */
export async function ServicesSection({ services }: { services: Service[] }) {
  const t = await getTranslations();
  const locale = await getLocale();
  return (
    <section className="container-x py-20">
      <SectionHeader title={t("home.servicesTitle")} subtitle={t("home.servicesSubtitle")} href="/services" linkLabel={t("common.viewAll")} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.05}>
            <Link href={`/services/${s.slug}`} className="group flex h-full flex-col card p-5 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg focus-ring">
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-gradient group-hover:text-white"><DynamicIcon name={s.icon} className="size-5" /></span>
                <ArrowUpRight className="size-4 text-muted opacity-0 transition-all group-hover:opacity-100 rtl:-scale-x-100" />
              </div>
              <h3 className="mt-4 font-bold">{tx(s.title, locale)}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted">{tx(s.summary, locale)}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────── Stories ───────── */
export async function StoriesSection({ stories }: { stories: (Story & { university?: University })[] }) {
  const t = await getTranslations();
  const locale = await getLocale();
  return (
    <section className="relative overflow-hidden bg-brand-950 py-20 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_10%,color-mix(in_oklab,var(--brand-600)_40%,transparent),transparent)]" />
      <div className="container-x relative">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight md:text-4xl">{t("home.storiesTitle")}</h2>
            <p className="mt-2 text-sm text-white/70 md:text-base">{t("home.storiesSubtitle")}</p>
          </div>
          <Link href="/stories" className="text-sm font-semibold text-accent-300 hover:underline">{t("common.viewAll")}</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {stories.slice(0, 3).map((s, i) => (
            <Reveal key={s.id} delay={i * 0.08}>
              <Link href={`/stories/${s.slug}`} className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-colors hover:bg-white/10 focus-ring">
                <Quote className="size-7 text-accent-400" />
                <p className="mt-4 flex-1 text-base leading-8">{tx(s.quote, locale)}</p>
                <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                  <span className="flex size-10 items-center justify-center rounded-full bg-brand-gradient font-bold">{s.student_name.slice(0, 1)}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{s.student_name}</span>
                    <span className="block truncate text-xs text-white/60">{s.university ? tx(s.university.name, locale) : ""} · {tx(s.program, locale)} · {s.year_enrolled}</span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Districts ───────── */
export async function DistrictsSection({ districts, counts }: { districts: District[]; counts: Record<string, number> }) {
  const t = await getTranslations();
  const locale = await getLocale();
  return (
    <section className="container-x py-20">
      <SectionHeader title={t("home.districtsTitle")} subtitle={t("home.districtsSubtitle")} href="/districts" linkLabel={t("common.viewAll")} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {districts.map((d, i) => (
          <Reveal key={d.id} delay={i * 0.05}>
            <Link href={`/districts/${d.slug}`} className="group relative flex h-44 flex-col justify-end overflow-hidden rounded-3xl bg-brand-900 p-5 text-white focus-ring">
              <div className={cn("absolute inset-0 opacity-90 transition-transform duration-500 group-hover:scale-105", d.side === "european" ? "bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950" : "bg-gradient-to-br from-accent-600 via-brand-700 to-brand-950")} />
              <div className="absolute inset-0 bg-grid opacity-20" />
              <div className="relative">
                <Badge className="bg-white/15 text-white">{t(`common.${d.side}`)}</Badge>
                <h3 className="mt-2 text-xl font-bold">{tx(d.name, locale)}</h3>
                <p className="mt-1 flex items-center gap-3 text-xs text-white/75">
                  <span className="flex items-center gap-1"><MapPin className="size-3.5" />{t("common.universitiesCount", { count: counts[d.id] ?? 0 })}</span>
                  <span>{formatUSD(d.avg_rent_usd, locale)}{t("districts.perMonth")}</span>
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────── Blog ───────── */
export async function BlogSection({ posts }: { posts: Post[] }) {
  const t = await getTranslations();
  const locale = await getLocale();
  return (
    <section className="bg-surface py-20">
      <div className="container-x">
        <SectionHeader title={t("home.blogTitle")} href="/blog" linkLabel={t("common.viewAll")} />
        <div className="grid gap-5 md:grid-cols-3">
          {posts.slice(0, 3).map((p, i) => (
            <Reveal key={p.id} delay={i * 0.07}>
              <Link href={`/blog/${p.slug}`} className="group flex h-full flex-col card overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg focus-ring">
                <div className="h-2 bg-brand-gradient" />
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap gap-1.5">{p.tags.slice(0, 2).map((tag) => <Badge key={tag} variant="brand" className="font-en">{tag}</Badge>)}</div>
                  <h3 className="mt-3 text-lg font-bold leading-snug group-hover:text-brand-800">{tx(p.title, locale)}</h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-7 text-muted">{tx(p.excerpt, locale)}</p>
                  <p className="mt-4 text-xs text-muted">{formatDate(p.published_at, locale)} · {t("blog.readingTime", { minutes: p.reading_minutes ?? 5 })}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── FAQ ───────── */
export async function FaqSection({ faqs, title }: { faqs: Faq[]; title?: string }) {
  const t = await getTranslations();
  const locale = await getLocale();
  return (
    <section className="container-x py-20">
      <SectionHeader title={title ?? t("home.faqTitle")} href="/faq" linkLabel={t("common.viewAll")} />
      {/* Each column is its own grid, so an opened answer only pushes the cards below it in
          that column — a row-based grid would stretch the untouched card beside it. On mobile
          the wrappers are `display: contents`, which drops the split and lets the single root
          column fall back to the real question order (carried by the `order` style). */}
      <Accordion type="single" collapsible className="grid items-start gap-3 md:grid-cols-2">
        {[0, 1].map((col) => (
          <div key={col} className="contents md:grid md:content-start md:gap-3">
            {faqs.map((f, i) => ({ f, i })).filter(({ i }) => i % 2 === col).map(({ f, i }) => (
              <AccordionItem key={f.id} value={f.id} style={{ order: i }}>
                <AccordionTrigger>{tx(f.question, locale)}</AccordionTrigger>
                <AccordionContent>{tx(f.answer, locale)}</AccordionContent>
              </AccordionItem>
            ))}
          </div>
        ))}
      </Accordion>
    </section>
  );
}

/* ───────── Instagram ───────── */
export async function InstagramSection({ url }: { url: string }) {
  const t = await getTranslations("home");
  return (
    <section className="container-x pb-20">
      <a href={url} target="_blank" rel="noopener" className="group flex flex-col items-center justify-between gap-6 rounded-3xl border border-border bg-gradient-to-r from-pink-50 via-white to-brand-50 p-8 transition-all hover:shadow-lg md:flex-row focus-ring">
        <div className="flex items-center gap-5">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white shadow-md transition-transform group-hover:scale-110"><Instagram className="size-7" /></span>
          <div>
            <h3 className="text-xl font-bold">{t("instagramTitle")}</h3>
            <p className="mt-1 text-sm text-muted">{t("instagramBody")}</p>
          </div>
        </div>
        <Button variant="dark" size="lg" className="pointer-events-none font-en">{t("instagramButton")}</Button>
      </a>
    </section>
  );
}
