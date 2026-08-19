"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import type { UniversityWithRelations, District, Category } from "@/lib/types";
import { cn, formatUSD, tx } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, Segmented, Slider, SearchInput, Badge, Empty, Dialog, DialogContent, DialogTrigger, Checkbox } from "@/components/ui/primitives";
import { UniversityCard } from "./university-card";

type Sort = "score" | "tuitionAsc" | "tuitionDesc" | "rank" | "name";

export function UniversityExplorer({ universities, districts, categories }: { universities: UniversityWithRelations[]; districts: District[]; categories: Category[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [q, setQ] = React.useState(sp.get("q") ?? "");
  const [type, setType] = React.useState<"all" | "public" | "foundation">((sp.get("type") as never) || "all");
  const [side, setSide] = React.useState<"all" | "european" | "asian">((sp.get("side") as never) || "all");
  const [lang, setLang] = React.useState<string>(sp.get("lang") || "all");
  const [district, setDistrict] = React.useState<string>(sp.get("district") || "all");
  const [category, setCategory] = React.useState<string>(sp.get("category") || "all");
  const [maxTuition, setMaxTuition] = React.useState<number>(Number(sp.get("max")) || 35000);
  const [dorm, setDorm] = React.useState(sp.get("dorm") === "1");
  const [sort, setSort] = React.useState<Sort>((sp.get("sort") as Sort) || "score");

  // keep URL shareable
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type !== "all") params.set("type", type);
    if (side !== "all") params.set("side", side);
    if (lang !== "all") params.set("lang", lang);
    if (district !== "all") params.set("district", district);
    if (category !== "all") params.set("category", category);
    if (maxTuition < 35000) params.set("max", String(maxTuition));
    if (dorm) params.set("dorm", "1");
    if (sort !== "score") params.set("sort", sort);
    const qs = params.toString();
    const id = setTimeout(() => router.replace((qs ? `${pathname}?${qs}` : pathname) as never, { scroll: false }), 250);
    return () => clearTimeout(id);
  }, [q, type, side, lang, district, category, maxTuition, dorm, sort, pathname, router]);

  const filtered = React.useMemo(() => {
    const ql = q.trim().toLowerCase();
    const list = universities.filter((u) => {
      if (type !== "all" && u.type !== type) return false;
      if (side !== "all" && u.district?.side !== side) return false;
      if (lang !== "all" && !u.languages.includes(lang)) return false;
      if (district !== "all" && u.district?.slug !== district) return false;
      if (category !== "all" && !u.programs.some((p) => p.category_id === category)) return false;
      if (u.avg_tuition_min > maxTuition) return false;
      if (dorm && !u.has_dorm) return false;
      if (ql) {
        const hay = [u.name.fa, u.name.en, u.short_name ?? "", u.district?.name.fa ?? "", u.district?.name.en ?? ""].join(" ").toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
    const by: Record<Sort, (a: UniversityWithRelations, b: UniversityWithRelations) => number> = {
      score: (a, b) => b.editorial_score - a.editorial_score,
      tuitionAsc: (a, b) => a.avg_tuition_min - b.avg_tuition_min,
      tuitionDesc: (a, b) => b.avg_tuition_max - a.avg_tuition_max,
      rank: (a, b) => (a.best_rank ?? 999) - (b.best_rank ?? 999),
      name: (a, b) => tx(a.name, locale).localeCompare(tx(b.name, locale), locale),
    };
    return list.sort(by[sort]);
  }, [universities, q, type, side, lang, district, category, maxTuition, dorm, sort, locale]);

  const reset = () => { setQ(""); setType("all"); setSide("all"); setLang("all"); setDistrict("all"); setCategory("all"); setMaxTuition(35000); setDorm(false); setSort("score"); };
  const activeCount = [type !== "all", side !== "all", lang !== "all", district !== "all", category !== "all", maxTuition < 35000, dorm].filter(Boolean).length;

  const Filters = (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t("universities.filterType")}</p>
        <Segmented value={type} onChange={setType} options={[{ value: "all", label: t("common.all") }, { value: "public", label: t("common.public") }, { value: "foundation", label: t("common.foundation") }]} className="w-full [&>button]:flex-1" size="sm" />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t("universities.filterSide")}</p>
        <Segmented value={side} onChange={setSide} options={[{ value: "all", label: t("common.all") }, { value: "european", label: t("common.european") }, { value: "asian", label: t("common.asian") }]} className="w-full [&>button]:flex-1" size="sm" />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t("universities.filterLanguage")}</p>
        <Segmented value={lang} onChange={setLang} options={[{ value: "all", label: t("common.all") }, { value: "en", label: t("common.en") }, { value: "tr", label: t("common.tr") }]} className="w-full [&>button]:flex-1" size="sm" />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t("universities.filterDistrict")}</p>
        <Select value={district} onValueChange={setDistrict} options={[{ value: "all", label: t("common.all") }, ...districts.map((d) => ({ value: d.slug, label: tx(d.name, locale) }))]} />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t("programs.field")}</p>
        <Select value={category} onValueChange={setCategory} options={[{ value: "all", label: t("common.all") }, ...categories.map((c) => ({ value: c.id, label: tx(c.name, locale) }))]} />
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t("universities.filterTuition")}</p>
          <span className="text-xs font-bold tabular text-brand-800">{maxTuition >= 35000 ? t("common.all") : formatUSD(maxTuition, locale)}</span>
        </div>
        <Slider value={[maxTuition]} onValueChange={([v]) => setMaxTuition(v)} min={1000} max={35000} step={500} />
      </div>
      <Checkbox checked={dorm} onCheckedChange={(v) => setDorm(v === true)} label={t("common.dorm")} />
      {activeCount > 0 && <Button variant="ghost" size="sm" onClick={reset}><X className="size-4" />{t("common.reset")}</Button>}
    </div>
  );

  return (
    <div className="container-x grid gap-8 py-10 lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 card p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold"><SlidersHorizontal className="size-4 text-brand-600" />{t("common.filters")}</h2>
          {Filters}
        </div>
      </aside>
      <div>
        <div className="sticky top-16 z-30 -mx-5 mb-6 glass px-5 py-3 md:top-[4.5rem] md:-mx-0 md:rounded-2xl md:border md:border-border">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1"><SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("home.searchPlaceholder")} /></div>
            <div className="flex items-center gap-2">
              <Select size="sm" ariaLabel={t("common.sortBy")} value={sort} onValueChange={(v) => setSort(v as Sort)} className="w-44" options={[
                { value: "score", label: t("universities.sortScore") },
                { value: "rank", label: t("universities.sortRank") },
                { value: "tuitionAsc", label: t("universities.sortTuitionAsc") },
                { value: "tuitionDesc", label: t("universities.sortTuitionDesc") },
                { value: "name", label: t("universities.sortName") },
              ]} />
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden"><SlidersHorizontal className="size-4" />{t("common.filters")}{activeCount > 0 && <Badge variant="brand">{activeCount}</Badge>}</Button>
                </DialogTrigger>
                <DialogContent side="bottom" heading={t("common.filters")}>{Filters}</DialogContent>
              </Dialog>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">{t("common.results", { count: filtered.length })}</p>
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
