"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight, ArrowDownAZ, ArrowDownNarrowWide, ArrowUpNarrowWide, GraduationCap } from "lucide-react";
import type { Program, University, Category, ProgramLevel } from "@/lib/types";
import { cn, formatNumber, formatRange, formatUSD, tx } from "@/lib/utils";
import { Select, Segmented, Slider, Badge, Empty } from "@/components/ui/primitives";
import { ProgramSearch, type Suggestion } from "@/components/programs/program-search";
import { DynamicIcon } from "@/components/home/sections";
import { Button } from "@/components/ui/button";
import { UniversityLogo } from "@/components/university/university-card";

type Row = Program & { university: Pick<University, "id" | "slug" | "name" | "short_name" | "type" | "logo_url"> };
const LEVELS: ProgramLevel[] = ["bachelor", "master", "phd"];
const PAGE = 30;
const TUITION_MIN = 0;
const TUITION_MAX = 35000;

/** Labelled filter control: caption above the box, matching the max-tuition slider. */
function Filter({ label, value, children, className }: { label: React.ReactNode; value?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {/* logical padding, so captions inset from the control's rounded edge and mirror in RTL */}
      <div className="mb-1 flex items-center justify-between px-2 text-xs">
        <span className="font-semibold uppercase tracking-wide text-muted">{label}</span>
        {value && <span className="font-bold tabular text-brand-800">{value}</span>}
      </div>
      {children}
    </div>
  );
}

/** Select row: leading icon (or logo) + truncating label. */
function OptionRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span>
      <span className="truncate">{label}</span>
    </span>
  );
}

/** Field select row: category icon, same set as the rankings by-field chips. */
function FieldOption({ icon, label }: { icon: string; label: string }) {
  return <OptionRow icon={<DynamicIcon name={icon} className="size-4 text-brand-600" />} label={label} />;
}

/** Lowercase + fold Arabic/Persian letter variants and Turkish/Latin diacritics ("koc" finds "Koç"). */
function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // Latin combining accents (ç, ş, ğ, ü…)
    .replace(/[يى]/g, "ی") // ي/ى → ی
    .replace(/ك/g, "ک") // ك → ک
    .replace(/[ً-ٰٟ‌‏]/g, "") // harakat, ZWNJ, marks
    .trim();
}

export function ProgramExplorer({ programs, categories, universities }: { programs: Row[]; categories: Category[]; universities: Pick<University, "id" | "slug" | "name">[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const sp = useSearchParams();
  const [q, setQ] = React.useState(sp.get("q") ?? "");
  const [level, setLevel] = React.useState<"all" | ProgramLevel>((sp.get("level") as never) || "all");
  const [lang, setLang] = React.useState<"all" | "en" | "tr">((sp.get("lang") as never) || "all");
  const [cat, setCat] = React.useState(sp.get("category") ? `cat-${sp.get("category")}` : "all");
  const [uni, setUni] = React.useState(sp.get("university") || "all");
  const [range, setRange] = React.useState<[number, number]>([TUITION_MIN, TUITION_MAX]);
  const [sort, setSort] = React.useState<"tuitionAsc" | "tuitionDesc" | "name">("tuitionAsc");
  const [page, setPage] = React.useState(1);

  const list = React.useMemo(() => {
    const ql = norm(q);
    const out = programs.filter((p) => {
      if (level !== "all" && p.level !== level) return false;
      if (lang !== "all" && (lang === "en" ? p.language === "tr" : p.language !== "tr")) return false;
      if (cat !== "all" && p.category_id !== cat) return false;
      if (uni !== "all" && p.university.slug !== uni) return false;
      if (p.tuition_usd < range[0] || p.tuition_usd > range[1]) return false;
      if (ql) {
        const hay = norm([p.name.fa, p.name.en, p.university.name.fa, p.university.name.en, p.university.short_name ?? ""].join(" "));
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
    out.sort(sort === "tuitionAsc" ? (a, b) => a.tuition_usd - b.tuition_usd : sort === "tuitionDesc" ? (a, b) => b.tuition_usd - a.tuition_usd : (a, b) => tx(a.name, locale).localeCompare(tx(b.name, locale), locale));
    return out;
  }, [programs, q, level, lang, cat, uni, range, sort, locale]);

  /** Inline autocomplete: every program, field and university, narrowed to what's typed.
      With an empty box this is the full browsable list, so the dropdown scrolls. */
  const suggestions = React.useMemo<Suggestion[]>(() => {
    const ql = norm(q);

    // an empty query matches everything, all at equal rank
    const rank = (hay: string) => {
      if (!ql) return 0;
      const h = norm(hay);
      return h.startsWith(ql) ? 0 : h.includes(ql) ? 1 : -1;
    };

    const progs = new Map<string, { label: string; count: number; rank: number }>();
    const cats = new Map<string, { label: string; count: number; rank: number }>();
    const unis = new Map<string, { label: string; count: number; rank: number }>();

    const bump = (m: Map<string, { label: string; count: number; rank: number }>, key: string, label: string, r: number) => {
      const hit = m.get(key);
      if (hit) {
        hit.count += 1;
        hit.rank = Math.min(hit.rank, r);
      } else m.set(key, { label, count: 1, rank: r });
    };

    const catById = new Map(categories.map((c) => [c.id, c]));

    for (const p of programs) {
      const label = tx(p.name, locale);
      const r = Math.max(rank(p.name.fa), rank(p.name.en));
      if (r >= 0) bump(progs, label.toLowerCase(), label, r);

      const c = catById.get(p.category_id ?? "");
      if (c) {
        const cr = Math.max(rank(c.name.fa), rank(c.name.en));
        if (cr >= 0) bump(cats, c.id, tx(c.name, locale), cr);
      }

      const ur = Math.max(rank(p.university.name.fa), rank(p.university.name.en), rank(p.university.short_name ?? ""));
      if (ur >= 0) bump(unis, p.university.slug, tx(p.university.name, locale), ur);
    }

    const take = <T,>(m: Map<string, { label: string; count: number; rank: number }>, make: (key: string, v: { label: string; count: number }) => T) =>
      [...m.entries()]
        .sort((a, b) => a[1].rank - b[1].rank || b[1].count - a[1].count || a[1].label.localeCompare(b[1].label, locale))
        .map(([key, v]) => make(key, v));

    return [
      ...take(progs, (_k, v) => ({ kind: "program" as const, value: v.label, label: v.label, subtitle: t("common.programsCount", { count: v.count }) })),
      ...take(cats, (id, v) => ({ kind: "field" as const, value: "", label: v.label, subtitle: `${t("programs.field")} · ${t("common.programsCount", { count: v.count })}`, category: id })),
      ...take(unis, (slug, v) => ({ kind: "university" as const, value: "", label: v.label, subtitle: `${t("programs.university")} · ${t("common.programsCount", { count: v.count })}`, university: slug })),
    ];
  }, [programs, categories, q, locale, t]);

  const applySuggestion = (s: Suggestion) => {
    setQ(s.value);
    if (s.category) setCat(s.category);
    if (s.university) setUni(s.university);
  };

  React.useEffect(() => setPage(1), [q, level, lang, cat, uni, range, sort]);
  const isFullRange = range[0] <= TUITION_MIN && range[1] >= TUITION_MAX;
  const shown = list.slice(0, page * PAGE);

  return (
    <section className="container-x py-10">
      <div className="card mb-6 grid gap-4 p-5 md:grid-cols-[1.4fr_1fr_1fr]">
        <ProgramSearch value={q} onChange={setQ} onPick={applySuggestion} suggestions={suggestions} placeholder={t("programs.placeholder")} count={t("common.results", { count: list.length })} className="md:col-span-3" />
        <Filter label={t("programs.university")}>
          <Select
            ariaLabel={t("programs.university")}
            value={uni}
            onValueChange={setUni}
            options={[
              { value: "all", label: <OptionRow icon={<GraduationCap className="size-4 text-brand-600" />} label={t("common.all")} /> },
              ...universities.map((u) => ({ value: u.slug, label: <OptionRow icon={<GraduationCap className="size-4 text-brand-600" />} label={tx(u.name, locale)} /> })),
            ]}
          />
        </Filter>
        <Filter label={t("programs.field")}>
          <Select
            ariaLabel={t("programs.field")}
            value={cat}
            onValueChange={setCat}
            options={[
              { value: "all", label: <FieldOption icon="Layers" label={t("common.all")} /> },
              ...categories.map((c) => ({ value: c.id, label: <FieldOption icon={c.icon ?? "Sparkles"} label={tx(c.name, locale)} /> })),
            ]}
          />
        </Filter>
        <Filter label={t("common.sortBy")}>
          <Select
            ariaLabel={t("common.sortBy")}
            value={sort}
            onValueChange={(v) => setSort(v as never)}
            options={[
              { value: "name", label: <OptionRow icon={<ArrowDownAZ className="size-4 text-brand-600" />} label={t("universities.sortName")} /> },
              { value: "tuitionAsc", label: <OptionRow icon={<ArrowDownNarrowWide className="size-4 text-brand-600" />} label={t("universities.sortTuitionAsc")} /> },
              { value: "tuitionDesc", label: <OptionRow icon={<ArrowUpNarrowWide className="size-4 text-brand-600" />} label={t("universities.sortTuitionDesc")} /> },
            ]}
          />
        </Filter>
        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <Segmented size="sm" ariaLabel={t("programs.level")} value={level} onChange={setLevel} options={[{ value: "all", label: t("common.all") }, ...LEVELS.map((l) => ({ value: l, label: t(`common.${l}`) }))]} />
          <Segmented size="sm" ariaLabel={t("programs.language")} value={lang} onChange={setLang} options={[{ value: "all", label: t("common.all") }, { value: "en", label: t("common.en") }, { value: "tr", label: t("common.tr") }]} />
        </div>
        <Filter label={t("programs.tuition")} value={isFullRange ? t("common.all") : formatRange(range[0], range[1], locale)}>
          <Slider value={range} onValueChange={([lo, hi]) => setRange([lo, hi])} min={TUITION_MIN} max={TUITION_MAX} step={500} minStepsBetweenThumbs={1} />
        </Filter>
      </div>

      {list.length === 0 ? (
        <Empty title={t("common.noResults")} />
      ) : (
        <>
          <div className="overflow-hidden rounded-3xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 text-start font-semibold">{t("programs.title")}</th>
                  <th className="hidden px-4 py-3 text-start font-semibold md:table-cell">{t("programs.university")}</th>
                  <th className="hidden px-4 py-3 text-center font-semibold sm:table-cell">{t("programs.level")}</th>
                  <th className="hidden px-4 py-3 text-center font-semibold lg:table-cell">{t("programs.language")}</th>
                  <th className="whitespace-nowrap px-4 py-3 text-center font-semibold">{t("programs.tuition")}</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.id} className="group border-t border-border transition-colors hover:bg-brand-50/40">
                    <td className="px-4 py-3">
                      <Link href={`/universities/${p.university.slug}?tab=programs`} className="font-semibold group-hover:text-brand-800">{tx(p.name, locale)}</Link>
                      <span className="block text-xs text-muted md:hidden">{tx(p.university.name, locale)} · {t(`common.${p.level}`)}</span>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <Link href={`/universities/${p.university.slug}`} className="inline-flex items-center gap-2 hover:text-brand-800">
                        <UniversityLogo name={p.university.short_name || p.university.name.en} logo={p.university.logo_url} size={28} className="rounded-lg text-[10px]" />
                        <span className="line-clamp-1">{tx(p.university.name, locale)}</span>
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-center sm:table-cell"><Badge variant="brand">{t(`common.${p.level}`)}</Badge></td>
                    <td className="hidden px-4 py-3 text-center lg:table-cell"><Badge variant={p.language === "tr-en" ? "purple" : p.language === "tr" ? "warning" : "accent"}>{t(`common.${p.language}` as never)}</Badge></td>
                    {/* the hover arrow is taken out of flow, so only the price is centred under the header */}
                    <td className="relative whitespace-nowrap px-4 py-3 text-center font-bold tabular">
                      {p.tuition_usd === 0 ? t("common.free") : formatUSD(p.tuition_usd, locale)}
                      <Link href={`/universities/${p.university.slug}?tab=programs`} className="absolute inset-y-0 end-2 inline-flex items-center text-muted opacity-0 transition-opacity group-hover:opacity-100" aria-label={t("programs.viewUniversity")}><ArrowUpRight className="size-4 rtl:-scale-x-100" /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {shown.length < list.length && (
            <div className="mt-6 flex justify-center"><Button variant="outline" onClick={() => setPage((p) => p + 1)}>{t("common.viewAll")} ({formatNumber(list.length - shown.length, locale)})</Button></div>
          )}
        </>
      )}
    </section>
  );
}
