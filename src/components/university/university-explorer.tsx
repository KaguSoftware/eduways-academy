"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ArrowDownAZ, ArrowDownNarrowWide, ArrowUpNarrowWide, Sparkles, Trophy, Layers, MapPin } from "lucide-react";
import type { UniversityWithRelations, District, Category } from "@/lib/types";
import { cn, tx } from "@/lib/utils";
import { useMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Select, Segmented, Slider, SearchInput, Badge, Empty, Dialog, DialogContent, DialogTrigger, DialogClose, Checkbox, FilterGroup, FilterPill } from "@/components/ui/primitives";
import { UniversityCard } from "./university-card";
import { DynamicIcon } from "@/components/home/sections";

type Sort = "score" | "tuitionAsc" | "tuitionDesc" | "rank" | "name";
type Type = "all" | "public" | "foundation";
type Side = "all" | "european" | "asian";

/** Select option row: leading icon + label, matching the programs sort menu. */
function OptionRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span>
      <span className="truncate">{label}</span>
    </span>
  );
}

const TUITION_MIN = 1000;
const TUITION_MAX = 35000;
const TUITION_STEP = 500;

/** A range covering the whole scale means "any tuition" — no restriction applied. */
const isAnyTuition = (min: number, max: number) => min <= TUITION_MIN && max >= TUITION_MAX;

type Filters = { type: Type; side: Side; lang: string; district: string; category: string; minTuition: number; maxTuition: number; dorm: boolean };
const EMPTY: Filters = { type: "all", side: "all", lang: "all", district: "all", category: "all", minTuition: TUITION_MIN, maxTuition: TUITION_MAX, dorm: false };

/** Does a university pass every filter except the ones named in `skip`? */
function matches(u: UniversityWithRelations, f: Filters, skip: keyof Filters | null = null) {
  if (skip !== "type" && f.type !== "all" && u.type !== f.type) return false;
  if (skip !== "side" && f.side !== "all" && u.district?.side !== f.side) return false;
  if (skip !== "lang" && f.lang !== "all" && !u.languages.includes(f.lang)) return false;
  if (skip !== "district" && f.district !== "all" && u.district?.slug !== f.district) return false;
  if (skip !== "category" && f.category !== "all" && !u.programs.some((p) => p.category_id === f.category)) return false;
  if (skip !== "minTuition" && skip !== "maxTuition" && !isAnyTuition(f.minTuition, f.maxTuition)) {
    // Keep a university when its own tuition range overlaps the selected one.
    if (u.avg_tuition_min > f.maxTuition || u.avg_tuition_max < f.minTuition) return false;
  }
  if (skip !== "dorm" && f.dorm && !u.has_dorm) return false;
  return true;
}

export function UniversityExplorer({ universities, districts, categories }: { universities: UniversityWithRelations[]; districts: District[]; categories: Category[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const money = useMoney();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [q, setQ] = React.useState(sp.get("q") ?? "");
  const [f, setF] = React.useState<Filters>({
    type: (sp.get("type") as Type) || "all",
    side: (sp.get("side") as Side) || "all",
    lang: sp.get("lang") || "all",
    district: sp.get("district") || "all",
    category: sp.get("category") || "all",
    minTuition: Number(sp.get("min")) || TUITION_MIN,
    maxTuition: Number(sp.get("max")) || TUITION_MAX,
    dorm: sp.get("dorm") === "1",
  });
  const [sort, setSort] = React.useState<Sort>((sp.get("sort") as Sort) || "score");
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((prev) => ({ ...prev, [k]: v }));

  // keep URL shareable
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (f.type !== "all") params.set("type", f.type);
    if (f.side !== "all") params.set("side", f.side);
    if (f.lang !== "all") params.set("lang", f.lang);
    if (f.district !== "all") params.set("district", f.district);
    if (f.category !== "all") params.set("category", f.category);
    if (f.minTuition > TUITION_MIN) params.set("min", String(f.minTuition));
    if (f.maxTuition < TUITION_MAX) params.set("max", String(f.maxTuition));
    if (f.dorm) params.set("dorm", "1");
    if (sort !== "score") params.set("sort", sort);
    const qs = params.toString();
    const id = setTimeout(() => router.replace((qs ? `${pathname}?${qs}` : pathname) as never, { scroll: false }), 250);
    return () => clearTimeout(id);
  }, [q, f, sort, pathname, router]);

  const searched = React.useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return universities;
    return universities.filter((u) =>
      [u.name.fa, u.name.en, u.short_name ?? "", u.district?.name.fa ?? "", u.district?.name.en ?? ""].join(" ").toLowerCase().includes(ql),
    );
  }, [universities, q]);

  const filtered = React.useMemo(() => {
    const list = searched.filter((u) => matches(u, f));
    const by: Record<Sort, (a: UniversityWithRelations, b: UniversityWithRelations) => number> = {
      score: (a, b) => b.editorial_score - a.editorial_score,
      tuitionAsc: (a, b) => a.avg_tuition_min - b.avg_tuition_min,
      tuitionDesc: (a, b) => b.avg_tuition_max - a.avg_tuition_max,
      rank: (a, b) => (a.best_rank ?? 999) - (b.best_rank ?? 999),
      name: (a, b) => tx(a.name, locale).localeCompare(tx(b.name, locale), locale),
    };
    return [...list].sort(by[sort]);
  }, [searched, f, sort, locale]);

  /** How many results a facet value would yield, ignoring that facet's own selection. */
  const countFor = React.useCallback(
    (key: keyof Filters, predicate: (u: UniversityWithRelations) => boolean) =>
      searched.reduce((n, u) => (matches(u, f, key) && predicate(u) ? n + 1 : n), 0),
    [searched, f],
  );

  const reset = () => { setF(EMPTY); setQ(""); };

  // Applied filters, as removable pills.
  const pills = React.useMemo(() => {
    const out: { key: string; label: string; clear: () => void }[] = [];
    if (f.type !== "all") out.push({ key: "type", label: t(`common.${f.type}`), clear: () => set("type", "all") });
    if (f.side !== "all") out.push({ key: "side", label: t(`common.${f.side}`), clear: () => set("side", "all") });
    if (f.lang !== "all") out.push({ key: "lang", label: t(`common.${f.lang}`), clear: () => set("lang", "all") });
    if (f.district !== "all") out.push({ key: "district", label: tx(districts.find((d) => d.slug === f.district)?.name ?? { fa: f.district, en: f.district }, locale), clear: () => set("district", "all") });
    if (f.category !== "all") out.push({ key: "category", label: tx(categories.find((c) => c.id === f.category)?.name ?? { fa: f.category, en: f.category }, locale), clear: () => set("category", "all") });
    if (!isAnyTuition(f.minTuition, f.maxTuition)) {
      const label =
        f.minTuition <= TUITION_MIN
          ? `${t("common.upTo")} ${money.usd(f.maxTuition)}`
          : f.maxTuition >= TUITION_MAX
            ? `${money.usd(f.minTuition)}+`
            : `${money.usd(f.minTuition)} – ${money.usd(f.maxTuition)}`;
      out.push({ key: "tuition", label, clear: () => setF((prev) => ({ ...prev, minTuition: TUITION_MIN, maxTuition: TUITION_MAX })) });
    }
    if (f.dorm) out.push({ key: "dorm", label: t("common.dorm"), clear: () => set("dorm", false) });
    return out;
  }, [f, districts, categories, locale, t, money]);

  const activeCount = pills.length;

  const Panel = (
    <div className="flex flex-col gap-4">
      <FilterGroup title={t("universities.filterType")}>
        <Segmented
          animated
          value={f.type}
          onChange={(v) => set("type", v)}
          className="w-full [&>button]:flex-1"
          size="sm"
          options={[
            { value: "all" as Type, label: t("common.all") },
            { value: "public" as Type, label: t("common.public") },
            { value: "foundation" as Type, label: t("common.foundation") },
          ]}
        />
      </FilterGroup>

      <FilterGroup title={t("universities.filterSide")}>
        <Segmented
          animated
          value={f.side}
          onChange={(v) => set("side", v)}
          className="w-full [&>button]:flex-1"
          size="sm"
          options={[
            { value: "all" as Side, label: t("common.all") },
            { value: "european" as Side, label: t("common.european") },
            { value: "asian" as Side, label: t("common.asian") },
          ]}
        />
      </FilterGroup>

      <FilterGroup title={t("universities.filterLanguage")}>
        <Segmented
          animated
          value={f.lang}
          onChange={(v) => set("lang", v)}
          className="w-full [&>button]:flex-1"
          size="sm"
          options={[
            { value: "all", label: t("common.all") },
            { value: "en", label: t("common.en") },
            { value: "tr", label: t("common.tr") },
          ]}
        />
      </FilterGroup>

      <FilterGroup title={t("programs.field")}>
        <Select
          size="sm"
          ariaLabel={t("programs.field")}
          value={f.category}
          onValueChange={(v) => set("category", v)}
          options={[
            { value: "all", label: <OptionRow icon={<Layers className="size-4 text-brand-600" />} label={t("universities.allFields")} /> },
            ...categories.map((c) => {
              const n = countFor("category", (u) => u.programs.some((p) => p.category_id === c.id));
              return {
                value: c.id,
                label: <OptionRow icon={<DynamicIcon name={c.icon ?? "Sparkles"} className="size-4 text-brand-600" />} label={`${tx(c.name, locale)} · ${n}`} />,
                disabled: n === 0,
              };
            }),
          ]}
        />
      </FilterGroup>

      <FilterGroup title={t("universities.filterDistrict")}>
        <Select
          size="sm"
          ariaLabel={t("universities.filterDistrict")}
          value={f.district}
          onValueChange={(v) => set("district", v)}
          options={[
            { value: "all", label: <OptionRow icon={<MapPin className="size-4 text-brand-600" />} label={t("universities.allDistricts")} /> },
            ...districts.map((d) => {
              const n = countFor("district", (u) => u.district?.slug === d.slug);
              return {
                value: d.slug,
                label: <OptionRow icon={<MapPin className="size-4 text-brand-600" />} label={`${tx(d.name, locale)} · ${n}`} />,
                disabled: n === 0,
              };
            }),
          ]}
        />
      </FilterGroup>

      <FilterGroup
        title={t("universities.filterTuitionShort")}
        action={
          <span className="text-xs font-bold tabular text-brand-800">
            {isAnyTuition(f.minTuition, f.maxTuition)
              ? t("universities.anyTuition")
              : `${money.usd(f.minTuition)} – ${money.usd(f.maxTuition)}`}
          </span>
        }
      >
        <div className="flex flex-col gap-3">
          <Slider
            value={[f.minTuition, f.maxTuition]}
            onValueChange={([lo, hi]) => setF((prev) => ({ ...prev, minTuition: lo, maxTuition: hi }))}
            min={TUITION_MIN}
            max={TUITION_MAX}
            step={TUITION_STEP}
            minStepsBetweenThumbs={1}
            aria-label={t("universities.filterTuition")}
          />
          <div className="flex items-baseline justify-between gap-2 text-[11px] text-muted">
            <span className="tabular">{money.usd(TUITION_MIN)}</span>
            <span className="tabular">{money.usd(TUITION_MAX)}+</span>
          </div>
        </div>
      </FilterGroup>

      <FilterGroup title={t("universities.filterCampus")}>
        <Checkbox checked={f.dorm} onCheckedChange={(v) => set("dorm", v === true)} label={<span className="flex items-center gap-1.5">{t("common.dorm")}<span className="tabular text-[11px] text-muted">{countFor("dorm", (u) => u.has_dorm)}</span></span>} />
      </FilterGroup>
    </div>
  );

  return (
    <div className="container-x grid gap-8 py-10 lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block">
        {/* Capped to the viewport so a tall filter list scrolls inside the card
            instead of running past the bottom of a short window. */}
        <div className="sticky top-24 card flex max-h-[calc(100dvh-7rem)] flex-col bg-surface/40 p-4">
          <div className="mb-4 flex shrink-0 items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-bold"><SlidersHorizontal className="size-4 text-brand-600" />{t("common.filters")}</h2>
            {activeCount > 0 && (
              <button type="button" onClick={reset} className="rounded-lg px-1.5 py-1 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-800 focus-ring">
                {t("common.clear")}
              </button>
            )}
          </div>
          <div className="scrollbar-subtle min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl border border-border bg-background py-3.5 pe-1.5 ps-3">{Panel}</div>
        </div>
      </aside>
      <div>
        <div className="sticky top-20 z-30 -mx-2 mb-6 rounded-xl border border-border bg-surface/60 px-3 py-2.5 md:top-[5.5rem] md:-mx-0 md:rounded-2xl md:px-5 md:py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <SearchInput
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("home.searchPlaceholder")}
                className="h-10 pe-28 text-[13px] md:h-11 md:pe-32 md:text-sm"
                endIcon={
                  <span className="pointer-events-none flex items-center gap-3">
                    <span aria-hidden className="h-5 w-px bg-border" />
                    <span className="whitespace-nowrap text-xs text-muted">{t("common.results", { count: filtered.length })}</span>
                  </span>
                }
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Select size="sm" ariaLabel={t("common.sortBy")} value={sort} onValueChange={(v) => setSort(v as Sort)} className="h-10 w-auto flex-1 md:h-11 md:w-52 md:flex-none" options={[
                { value: "score", label: <OptionRow icon={<Sparkles className="size-4 text-brand-600" />} label={t("universities.sortScore")} /> },
                { value: "name", label: <OptionRow icon={<ArrowDownAZ className="size-4 text-brand-600" />} label={t("universities.sortName")} /> },
                { value: "rank", label: <OptionRow icon={<Trophy className="size-4 text-brand-600" />} label={t("universities.sortRank")} /> },
                { value: "tuitionAsc", label: <OptionRow icon={<ArrowDownNarrowWide className="size-4 text-brand-600" />} label={t("universities.sortTuitionAsc")} /> },
                { value: "tuitionDesc", label: <OptionRow icon={<ArrowUpNarrowWide className="size-4 text-brand-600" />} label={t("universities.sortTuitionDesc")} /> },
              ]} />
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 flex-1 rounded-lg md:h-11 md:flex-none lg:hidden"><SlidersHorizontal className="size-4 text-brand-600" />{t("common.filters")}{activeCount > 0 && <Badge variant="brand">{activeCount}</Badge>}</Button>
                </DialogTrigger>
                <DialogContent side="bottom" heading={t("common.filters")}>
                  <div className="rounded-2xl border border-border bg-background px-3 py-3.5">{Panel}</div>
                  <div className="sticky -bottom-1 -mx-1 mt-5 flex items-center gap-2 border-t border-border bg-background px-1 pb-1 pt-3">
                    <DialogClose asChild>
                      <Button className="min-w-0 flex-1 transition-[flex-basis] duration-300 ease-out" size="sm">{t("universities.showResults", { count: filtered.length })}</Button>
                    </DialogClose>
                    {/* Always mounted so the sibling "show results" button can ease into its new
                        width instead of snapping when the clear action appears. */}
                    <div
                      aria-hidden={activeCount === 0}
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-out",
                        activeCount > 0 ? "ms-0 max-w-40 opacity-100" : "-ms-2 max-w-0 opacity-0",
                      )}
                    >
                      <Button variant="ghost" size="sm" onClick={reset} tabIndex={activeCount > 0 ? undefined : -1} className="whitespace-nowrap">
                        <X className="size-4" />
                        {t("common.clear")}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {pills.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {pills.map((p) => <FilterPill key={p.key} label={p.label} onRemove={p.clear} />)}
              <button type="button" onClick={reset} className="rounded-lg px-1.5 py-1 text-xs font-semibold text-muted underline-offset-2 transition-colors hover:text-foreground hover:underline focus-ring">
                {t("common.clear")}
              </button>
            </div>
          )}

        </div>

        {filtered.length === 0 ? (
          <Empty title={t("common.noResults")} action={<Button variant="secondary" onClick={reset}>{t("common.reset")}</Button>} />
        ) : (
          <div className={cn("grid gap-5 md:grid-cols-2 2xl:grid-cols-3")}>
            {filtered.map((u, i) => <UniversityCard key={u.id} u={u} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
