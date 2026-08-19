"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import type { Program, University, Category, ProgramLevel } from "@/lib/types";
import { cn, formatNumber, formatUSD, tx } from "@/lib/utils";
import { SearchInput, Select, Segmented, Slider, Badge, Empty } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { UniversityLogo } from "@/components/university/university-card";

type Row = Program & { university: Pick<University, "id" | "slug" | "name" | "short_name" | "type" | "logo_url"> };
const LEVELS: ProgramLevel[] = ["bachelor", "master", "phd"];
const PAGE = 30;

export function ProgramExplorer({ programs, categories, universities }: { programs: Row[]; categories: Category[]; universities: Pick<University, "id" | "slug" | "name">[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const sp = useSearchParams();
  const [q, setQ] = React.useState(sp.get("q") ?? "");
  const [level, setLevel] = React.useState<"all" | ProgramLevel>((sp.get("level") as never) || "all");
  const [lang, setLang] = React.useState<"all" | "en" | "tr">((sp.get("lang") as never) || "all");
  const [cat, setCat] = React.useState(sp.get("category") ? `cat-${sp.get("category")}` : "all");
  const [uni, setUni] = React.useState(sp.get("university") || "all");
  const [max, setMax] = React.useState(35000);
  const [sort, setSort] = React.useState<"tuitionAsc" | "tuitionDesc" | "name">("tuitionAsc");
  const [page, setPage] = React.useState(1);

  const list = React.useMemo(() => {
    const ql = q.trim().toLowerCase();
    const out = programs.filter((p) => {
      if (level !== "all" && p.level !== level) return false;
      if (lang !== "all" && (lang === "en" ? p.language === "tr" : p.language !== "tr")) return false;
      if (cat !== "all" && p.category_id !== cat) return false;
      if (uni !== "all" && p.university.slug !== uni) return false;
      if (p.tuition_usd > max) return false;
      if (ql) {
        const hay = [p.name.fa, p.name.en, p.university.name.fa, p.university.name.en, p.university.short_name ?? ""].join(" ").toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
    out.sort(sort === "tuitionAsc" ? (a, b) => a.tuition_usd - b.tuition_usd : sort === "tuitionDesc" ? (a, b) => b.tuition_usd - a.tuition_usd : (a, b) => tx(a.name, locale).localeCompare(tx(b.name, locale), locale));
    return out;
  }, [programs, q, level, lang, cat, uni, max, sort, locale]);

  React.useEffect(() => setPage(1), [q, level, lang, cat, uni, max, sort]);
  const shown = list.slice(0, page * PAGE);

  return (
    <section className="container-x py-10">
      <div className="card mb-6 grid gap-4 p-5 md:grid-cols-[1.4fr_1fr_1fr]">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("programs.placeholder")} className="md:col-span-3" />
        <Select value={cat} onValueChange={setCat} options={[{ value: "all", label: `${t("programs.field")}: ${t("common.all")}` }, ...categories.map((c) => ({ value: c.id, label: tx(c.name, locale) }))]} />
        <Select value={uni} onValueChange={setUni} options={[{ value: "all", label: `${t("programs.university")}: ${t("common.all")}` }, ...universities.map((u) => ({ value: u.slug, label: tx(u.name, locale) }))]} />
        <Select value={sort} onValueChange={(v) => setSort(v as never)} options={[{ value: "tuitionAsc", label: t("universities.sortTuitionAsc") }, { value: "tuitionDesc", label: t("universities.sortTuitionDesc") }, { value: "name", label: t("universities.sortName") }]} />
        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <Segmented size="sm" value={level} onChange={setLevel} options={[{ value: "all", label: t("common.all") }, ...LEVELS.map((l) => ({ value: l, label: t(`common.${l}`) }))]} />
          <Segmented size="sm" value={lang} onChange={setLang} options={[{ value: "all", label: t("common.all") }, { value: "en", label: t("common.en") }, { value: "tr", label: t("common.tr") }]} />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-xs"><span className="font-semibold uppercase tracking-wide text-muted">{t("programs.maxTuition")}</span><span className="font-bold tabular text-brand-800">{max >= 35000 ? t("common.all") : formatUSD(max, locale)}</span></div>
          <Slider value={[max]} onValueChange={([v]) => setMax(v)} min={1000} max={35000} step={500} />
        </div>
      </div>

      <p className="mb-4 text-sm text-muted">{t("common.results", { count: list.length })}</p>
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
                  <th className="hidden px-4 py-3 text-start font-semibold sm:table-cell">{t("programs.level")}</th>
                  <th className="hidden px-4 py-3 text-start font-semibold lg:table-cell">{t("programs.language")}</th>
                  <th className="px-4 py-3 text-end font-semibold">{t("programs.tuition")}</th>
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
                    <td className="hidden px-4 py-3 sm:table-cell"><Badge variant="brand">{t(`common.${p.level}`)}</Badge></td>
                    <td className="hidden px-4 py-3 lg:table-cell"><Badge variant={p.language === "tr" ? "outline" : "accent"}>{t(`common.${p.language}` as never)}</Badge></td>
                    <td className="px-4 py-3 text-end font-bold tabular">
                      {p.tuition_usd === 0 ? t("common.free") : formatUSD(p.tuition_usd, locale)}
                      <Link href={`/universities/${p.university.slug}?tab=programs`} className="ms-2 inline-flex text-muted opacity-0 transition-opacity group-hover:opacity-100" aria-label={t("programs.viewUniversity")}><ArrowUpRight className="size-4 rtl:-scale-x-100" /></Link>
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
