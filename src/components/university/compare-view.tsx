"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { X, Plus, Check, Minus, AlertTriangle } from "lucide-react";
import type { UniversityWithRelations } from "@/lib/types";
import type { I18nText } from "@/lib/utils";
import { cn, formatNumber, tx } from "@/lib/utils";
import { useMoney } from "@/lib/money";
import { Select, Empty } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { UniversityLogo, ScoreRing } from "./university-card";
import { useCompare } from "./compare-context";

type Lite = { id: string; slug: string; name: I18nText };
type CompareRow = { label: string; render: (u: UniversityWithRelations) => React.ReactNode; best?: (u: UniversityWithRelations) => number };

export function CompareView({ all, initial }: { all: Lite[]; initial: UniversityWithRelations[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const money = useMoney();
  const router = useRouter();
  const { slugs, toggle, remove } = useCompare();
  const [items, setItems] = React.useState(initial);

  // Sync URL ↔ context. If URL empty but context has items, load them.
  React.useEffect(() => {
    const urlSlugs = initial.map((i) => i.slug);
    if (urlSlugs.length === 0 && slugs.length > 0) router.replace({ pathname: "/universities/compare", query: { u: slugs.join(",") } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugs.length]);
  React.useEffect(() => setItems(initial), [initial]);

  const add = (slug: string) => {
    if (items.some((i) => i.slug === slug)) return;
    const next = [...items.map((i) => i.slug), slug].slice(-3);
    if (!slugs.includes(slug)) toggle(slug);
    router.push({ pathname: "/universities/compare", query: { u: next.join(",") } });
  };
  const del = (slug: string) => {
    remove(slug);
    const next = items.filter((i) => i.slug !== slug).map((i) => i.slug);
    router.push(next.length ? { pathname: "/universities/compare", query: { u: next.join(",") } } : "/universities/compare");
  };

  const options = all.filter((a) => !items.some((i) => i.slug === a.slug)).map((a) => ({ value: a.slug, label: tx(a.name, locale) }));
  const yes = <Check className="mx-auto size-5 text-success" />;
  const no = <Minus className="mx-auto size-5 text-muted" />;

  const rows: CompareRow[] = [
    { label: t("universities.type"), render: (u) => t(`common.${u.type}`) },
    { label: t("universities.district"), render: (u) => (u.district ? `${tx(u.district.name, locale)} · ${t(`common.${u.district.side}`)}` : "—") },
    { label: t("universities.tuitionRange"), render: (u) => money.range(u.avg_tuition_min, u.avg_tuition_max), best: (u) => -u.avg_tuition_min },
    { label: t("rankings.colRank"), render: (u) => (u.best_rank ? `#${formatNumber(u.best_rank, locale)}` : "—"), best: (u) => -(u.best_rank ?? 999) },
    { label: t("common.score"), render: (u) => <ScoreRing value={u.editorial_score} size={44} />, best: (u) => u.editorial_score },
    { label: t("universities.valueScore"), render: (u) => <ScoreRing value={u.value_score ?? 0} size={44} />, best: (u) => u.value_score ?? 0 },
    { label: t("universities.languages"), render: (u) => u.languages.map((l) => t(`common.${l}` as never)).join(" · ") },
    { label: t("nav.programs"), render: (u) => formatNumber(u.programs.length, locale), best: (u) => u.programs.length },
    { label: t("universities.englishTaught"), render: (u) => formatNumber(u.programs.filter((p) => p.language !== "tr").length, locale), best: (u) => u.programs.filter((p) => p.language !== "tr").length },
    { label: t("universities.studentCount"), render: (u) => (u.student_count ? formatNumber(u.student_count, locale) : "—") },
    { label: t("universities.intlPct"), render: (u) => (u.intl_student_pct ? `${formatNumber(u.intl_student_pct, locale)}${t("common.percent")}` : "—"), best: (u) => u.intl_student_pct ?? 0 },
    { label: t("universities.dorm"), render: (u) => (u.has_dorm ? yes : no) },
    { label: t("common.eduwaysDeal"), render: (u) => (u.eduways_discount_pct ? `${t("common.upTo")} ${formatNumber(u.eduways_discount_pct, locale)}${t("common.percent")}` : no), best: (u) => u.eduways_discount_pct ?? 0 },
    { label: t("common.founded"), render: (u) => formatNumber(u.founded, locale, { useGrouping: false }) },
  ];

  const cols = items.length === 1 ? "grid-cols-1" : items.length === 2 ? "grid-cols-2" : "grid-cols-3";
  const isBest = (r: CompareRow, u: UniversityWithRelations) =>
    !!r.best && items.length > 1 && r.best(u) === Math.max(...items.map((i) => r.best!(i)));

  return (
    <section className="container-x py-10">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Plus className="size-4 text-brand-600" />
          <Select options={options} placeholder={t("universities.compareAdd")} onValueChange={add} className="w-72" disabled={items.length >= 3} />
        </div>
        <p className="text-sm text-muted">{t("universities.compareBar", { count: items.length })} / 3</p>
      </div>

      {items.length === 1 && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p><span className="font-semibold">{t("universities.compareNeedMore")}</span> — {t("universities.compareNeedMoreHint")}</p>
        </div>
      )}

      {items.length === 0 ? (
        <Empty title={t("universities.compareEmpty")} action={<Button asChild variant="secondary"><Link href="/universities">{t("nav.universities")}</Link></Button>} />
      ) : (
        <>
        {/* Phones: metrics stack downwards so the page only ever scrolls up/down; the
            university header stays pinned so every column keeps its identity. */}
        <div className="md:hidden">
          <div className="sticky top-16 z-20 -mx-5 border-b border-border bg-background/95 px-5 py-2 backdrop-blur">
            <div className={cn("grid gap-2", cols)}>
              {items.map((u) => (
                <div key={u.id} className="relative flex flex-col items-center gap-1 rounded-2xl bg-surface px-2 py-2 text-center">
                  <button onClick={() => del(u.slug)} className="absolute inset-e-0.5 top-0.5 flex size-6 items-center justify-center rounded-full text-muted hover:text-danger focus-ring" aria-label={t("common.remove")}><X className="size-3" /></button>
                  <UniversityLogo name={u.short_name || u.name.en} logo={u.logo_url} size={32} />
                  <Link href={`/universities/${u.slug}`} className="line-clamp-2 text-[11px] font-bold leading-tight hover:text-brand-700">{u.short_name || tx(u.name, locale)}</Link>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {rows.map((r) => (
              <div key={r.label} className="rounded-2xl border border-border px-3 py-2">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{r.label}</p>
                <div className={cn("grid items-center gap-2", cols)}>
                  {items.map((u) => (
                    <div key={u.id} className={cn("flex min-h-9 items-center justify-center rounded-xl px-1 py-1 text-center text-sm font-medium leading-tight tabular", isBest(r, u) && "bg-success/5 font-bold text-success")}>{r.render(u)}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden overflow-hidden rounded-3xl border border-border md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface">
                <th className="w-48 px-4 py-4 text-start text-xs font-semibold uppercase tracking-wide text-muted"></th>
                {items.map((u) => (
                  <th key={u.id} className="px-4 py-4 text-center align-top">
                    <div className="relative mx-auto flex max-w-[220px] flex-col items-center gap-2">
                      <button onClick={() => del(u.slug)} className="absolute -end-2 -top-2 flex size-7 items-center justify-center rounded-full border border-border bg-background text-muted hover:text-danger focus-ring" aria-label={t("common.remove")}><X className="size-3.5" /></button>
                      <UniversityLogo name={u.short_name || u.name.en} logo={u.logo_url} size={56} />
                      <Link href={`/universities/${u.slug}`} className="font-bold leading-snug hover:text-brand-700">{tx(u.name, locale)}</Link>
                    </div>
                  </th>
                ))}
                {Array.from({ length: 3 - items.length }).map((_, i) => <th key={i} className="px-4 py-4 text-center text-xs text-muted">{t("universities.compareAdd")}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-border">
                  <th className="px-4 py-3 text-start text-xs font-semibold text-muted">{r.label}</th>
                  {items.map((u) => (
                    <td key={u.id} className={cn("px-4 py-3 text-center font-medium tabular", isBest(r, u) && "bg-success/5 text-success font-bold")}>{r.render(u)}</td>
                  ))}
                  {Array.from({ length: 3 - items.length }).map((_, i) => <td key={i} />)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </section>
  );
}
