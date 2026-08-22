"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, Circle, ExternalLink, CalendarDays, FileCheck2, BadgePercent, Trophy, MapPin, Languages, Building2, Users, Home, CalendarClock } from "lucide-react";
import type { UniversityWithRelations, Category, ProgramLevel, UniversityWithRelations as U } from "@/lib/types";
import { cn, formatNumber, formatDate, tx } from "@/lib/utils";
import { useMoney } from "@/lib/money";
import { Tabs, TabsContent, TabsList, TabsTrigger, Badge, Segmented, Select, Tooltip } from "@/components/ui/primitives";
import { Map } from "@/components/map/map";
import { ScoreRing } from "./university-card";

const LEVELS: ProgramLevel[] = ["bachelor", "master", "phd", "associate"];
const SOURCE_LABEL: Record<string, string> = { urap: "URAP", the: "THE", qs: "QS", eduways: "Eduways" };

export function UniversityDetail({ u, categories, nearby }: { u: UniversityWithRelations; categories: Category[]; nearby: U[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const sp = useSearchParams();
  const [tab, setTab] = React.useState(sp.get("tab") ?? "overview");

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="sticky top-16 z-30 md:top-[4.5rem]">
        <TabsTrigger value="overview">{t("universities.overview")}</TabsTrigger>
        <TabsTrigger value="programs">{t("universities.programs")} <span className="ms-1 rounded-full bg-surface-2 px-1.5 font-en text-[10px]">{formatNumber(u.programs.length, locale)}</span></TabsTrigger>
        <TabsTrigger value="documents">{t("universities.documents")}</TabsTrigger>
        <TabsTrigger value="scholarships">{t("universities.scholarships")}</TabsTrigger>
        <TabsTrigger value="rankings">{t("universities.rankingsTab")}</TabsTrigger>
        <TabsTrigger value="location">{t("universities.location")}</TabsTrigger>
      </TabsList>

      <TabsContent value="overview"><Overview u={u} /></TabsContent>
      <TabsContent value="programs"><Programs u={u} categories={categories} /></TabsContent>
      <TabsContent value="documents"><Documents u={u} /></TabsContent>
      <TabsContent value="scholarships"><Scholarships u={u} /></TabsContent>
      <TabsContent value="rankings"><Rankings u={u} /></TabsContent>
      <TabsContent value="location"><Location u={u} nearby={nearby} /></TabsContent>
    </Tabs>
  );
}

function Fact({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm"><Icon className="size-5" /></span>
      <span className="min-w-0">
        <span className="block text-[11px] font-medium uppercase tracking-wide text-muted">{label}</span>
        <span className="block truncate text-sm font-bold tabular">{value}</span>
      </span>
    </div>
  );
}

function Overview({ u }: { u: UniversityWithRelations }) {
  const t = useTranslations();
  const locale = useLocale();
  const money = useMoney();
  return (
    <div className="grid gap-8">
      <p className="max-w-3xl text-base leading-8 text-foreground/90">{tx(u.description, locale)}</p>
      {u.highlights && u.highlights.length > 0 && (
        <div>
          <h3 className="mb-3 font-bold">{t("universities.highlights")}</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {u.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-sm"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" />{tx(h, locale)}</li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <h3 className="mb-3 font-bold">{t("universities.keyFacts")}</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Fact icon={BadgePercent} label={t("universities.tuitionRange")} value={`${money.range(u.avg_tuition_min, u.avg_tuition_max)} ${t("common.perYear")}`} />
          <Fact icon={Building2} label={t("universities.type")} value={t(`common.${u.type}`)} />
          <Fact icon={Languages} label={t("universities.languages")} value={u.languages.map((l) => t(`common.${l}` as never)).join(" · ")} />
          <Fact icon={Users} label={t("universities.studentCount")} value={u.student_count ? formatNumber(u.student_count, locale) : "—"} />
          <Fact icon={Trophy} label={t("universities.intlPct")} value={u.intl_student_pct ? `${formatNumber(u.intl_student_pct, locale)}${t("common.percent")}` : "—"} />
          <Fact icon={Home} label={t("universities.dorm")} value={u.has_dorm ? t("common.yes") : t("common.no")} />
          <Fact icon={CalendarClock} label={t("common.founded")} value={formatNumber(u.founded, locale, { useGrouping: false })} />
          <Fact icon={MapPin} label={t("universities.district")} value={u.district ? `${tx(u.district.name, locale)} · ${t(`common.${u.district.side}`)}` : "Istanbul"} />
          <div className="flex items-center gap-3 rounded-2xl bg-surface p-4">
            <ScoreRing value={u.editorial_score} size={44} />
            <span><span className="block text-[11px] font-medium uppercase tracking-wide text-muted">{t("common.score")}</span><span className="block text-sm font-bold">{formatNumber(u.editorial_score, locale)}/100</span></span>
          </div>
        </div>
      </div>
      {u.eduways_discount_pct ? (
        <div className="flex items-center gap-4 rounded-2xl border border-success/30 bg-success/5 p-5">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-success text-white"><BadgePercent className="size-6" /></span>
          <p className="font-semibold text-success">{t("universities.eduwaysDiscount", { pct: formatNumber(u.eduways_discount_pct, locale) })}</p>
        </div>
      ) : null}
    </div>
  );
}

function Programs({ u, categories }: { u: UniversityWithRelations; categories: Category[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const money = useMoney();
  const [level, setLevel] = React.useState<"all" | ProgramLevel>("all");
  const [lang, setLang] = React.useState<"all" | "en" | "tr">("all");
  const [cat, setCat] = React.useState("all");
  const list = u.programs.filter((p) => (level === "all" || p.level === level) && (lang === "all" || (lang === "en" ? p.language !== "tr" : p.language === "tr")) && (cat === "all" || p.category_id === cat));
  const cats = categories.filter((c) => u.programs.some((p) => p.category_id === c.id));
  const grouped = LEVELS.filter((l) => list.some((p) => p.level === l));
  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted">{t("universities.programsIntro", { count: formatNumber(u.programs.length, locale) })}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented size="sm" value={level} onChange={setLevel} options={[{ value: "all", label: t("common.all") }, ...LEVELS.filter((l) => u.programs.some((p) => p.level === l)).map((l) => ({ value: l, label: t(`common.${l}`) }))]} />
          <Segmented size="sm" value={lang} onChange={setLang} options={[{ value: "all", label: t("common.all") }, { value: "en", label: t("common.enShort") }, { value: "tr", label: t("common.trShort") }]} />
          <Select size="sm" value={cat} onValueChange={setCat} className="w-48" options={[{ value: "all", label: t("programs.field") + ": " + t("common.all") }, ...cats.map((c) => ({ value: c.id, label: tx(c.name, locale) }))]} />
        </div>
      </div>
      {grouped.map((lvl) => (
        <div key={lvl} className="mb-8">
          <h3 className="mb-3 flex items-center gap-2 font-bold"><Badge variant="brand">{t(`common.${lvl}`)}</Badge></h3>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr><th className="px-4 py-3 text-start font-semibold">{t("programs.title")}</th><th className="px-4 py-3 text-start font-semibold">{t("programs.language")}</th><th className="px-4 py-3 text-start font-semibold">{t("programs.duration")}</th><th className="px-4 py-3 text-end font-semibold">{t("programs.tuition")}</th></tr>
              </thead>
              <tbody>
                {list.filter((p) => p.level === lvl).map((p) => (
                  <tr key={p.id} className="border-t border-border transition-colors hover:bg-brand-50/40">
                    <td className="px-4 py-3 font-medium">{tx(p.name, locale)}{p.tuition_note && <span className="block text-xs font-normal text-muted">{tx(p.tuition_note, locale)}</span>}</td>
                    <td className="px-4 py-3"><Badge variant={p.language === "tr" ? "outline" : "accent"}>{t(`common.${p.language}` as never)}</Badge></td>
                    <td className="px-4 py-3 tabular">{t("common.years", { count: p.duration_years })}</td>
                    <td className="px-4 py-3 text-end font-bold tabular">{p.tuition_usd === 0 ? t("common.free") : money.usd(p.tuition_usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function Documents({ u }: { u: UniversityWithRelations }) {
  const t = useTranslations();
  const locale = useLocale();
  const levels = LEVELS.filter((l) => u.requirements.some((r) => r.level === l));
  const [level, setLevel] = React.useState<ProgramLevel>(levels[0] ?? "bachelor");
  const req = u.requirements.find((r) => r.level === level);
  if (!req) return <p className="text-muted">{t("universities.noDocs")}</p>;
  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">{t("universities.docsIntro")}</p>
          <Segmented size="sm" value={level} onChange={setLevel} options={levels.map((l) => ({ value: l, label: t(`common.${l}`) }))} />
        </div>
        <ul className="grid gap-2">
          {req.documents.map((d, i) => (
            <li key={i} className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
              {d.required ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" /> : <Circle className="mt-0.5 size-5 shrink-0 text-muted" />}
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{tx(d.name, locale)} {!d.required && <Badge variant="outline" className="ms-1">{t("common.optional")}</Badge>}</p>
                {d.note && <p className="mt-0.5 text-sm text-muted">{tx(d.note, locale)}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-5">
        {req.exams.length > 0 && (
          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-bold"><FileCheck2 className="size-4 text-brand-600" />{t("universities.exams")}</h3>
            <ul className="space-y-3 text-sm">
              {req.exams.map((e, i) => (
                <li key={i}><p className="font-semibold">{e.name}</p>{e.min && <p className="text-muted">{e.min}</p>}{e.note && <p className="text-xs text-muted">{tx(e.note, locale)}</p>}</li>
              ))}
            </ul>
          </div>
        )}
        {req.deadlines.length > 0 && (
          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-bold"><CalendarDays className="size-4 text-brand-600" />{t("universities.deadlines")}</h3>
            <ul className="space-y-2 text-sm">
              {req.deadlines.map((d, i) => (
                <li key={i} className="flex items-center justify-between gap-3"><span>{tx(d.term, locale)}</span><span className="font-semibold tabular">{formatDate(d.date, locale)}</span></li>
              ))}
            </ul>
          </div>
        )}
        {req.notes && <div className="rounded-2xl bg-brand-50 p-5 text-sm leading-7 text-brand-900"><h3 className="mb-1 font-bold">{t("universities.docsNote")}</h3>{tx(req.notes, locale)}</div>}
      </div>
    </div>
  );
}

function Scholarships({ u }: { u: UniversityWithRelations }) {
  const t = useTranslations();
  const locale = useLocale();
  if (!u.scholarships.length) return <p className="text-muted">{t("universities.noScholarships")}</p>;
  const sorted = [...u.scholarships].sort((a, b) => (a.type === "eduways" ? -1 : b.type === "eduways" ? 1 : b.discount_pct - a.discount_pct));
  return (
    <div>
      <p className="mb-5 text-sm text-muted">{t("universities.scholarshipsIntro")}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((s) => (
          <div key={s.id} className={cn("card relative overflow-hidden p-5", s.type === "eduways" && "border-success/40 bg-gradient-to-br from-success/5 to-transparent")}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge variant={s.type === "eduways" ? "success" : s.type === "government" ? "dark" : "brand"}>{s.type === "eduways" ? t("common.eduwaysDeal") : s.type === "government" ? "Türkiye Bursları" : tx(u.name, locale)}</Badge>
                <h3 className="mt-2 font-bold">{tx(s.title, locale)}</h3>
              </div>
              <span className="shrink-0 text-3xl font-extrabold tabular text-gradient">{t("common.upTo")} {formatNumber(s.discount_pct, locale)}{t("common.percent")}</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted">{tx(s.conditions, locale)}</p>
            {s.valid_until && <p className="mt-2 text-xs text-muted">{t("universities.deadlines")}: {formatDate(s.valid_until, locale)}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Rankings({ u }: { u: UniversityWithRelations }) {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <p className="mb-5 text-sm text-muted">{t("universities.rankingsIntro")}</p>
        {u.rankings.length ? (
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted"><tr><th className="px-4 py-3 text-start font-semibold">{t("common.source")}</th><th className="px-4 py-3 text-start font-semibold">{t("rankings.colRank")}</th><th className="px-4 py-3 text-start font-semibold">{t("rankings.colWorld")}</th><th className="px-4 py-3 text-end font-semibold"></th></tr></thead>
              <tbody>
                {u.rankings.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold font-en">{SOURCE_LABEL[r.source]} <span className="text-xs font-normal text-muted">{r.year}</span></td>
                    <td className="px-4 py-3 font-bold tabular">{r.rank_national ? `#${formatNumber(r.rank_national, locale)}` : "—"}</td>
                    <td className="px-4 py-3 tabular">{r.rank_world ? `#${formatNumber(r.rank_world, locale)}` : "—"}</td>
                    <td className="px-4 py-3 text-end">{r.source_url && <a href={r.source_url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"><ExternalLink className="size-3" />{t("common.source")}</a>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-muted">—</p>}
      </div>
      <div className="grid gap-4 self-start">
        <div className="card flex items-center gap-4 p-5"><ScoreRing value={u.editorial_score} size={64} /><div><p className="text-xs font-medium uppercase tracking-wide text-muted">{t("common.score")}</p><p className="text-2xl font-extrabold tabular">{formatNumber(u.editorial_score, locale)}<span className="text-sm text-muted">/100</span></p></div></div>
        <Tooltip content={t("universities.valueScoreHint")}>
          <div className="card flex items-center gap-4 p-5"><ScoreRing value={u.value_score ?? 0} size={64} /><div><p className="text-xs font-medium uppercase tracking-wide text-muted">{t("universities.valueScore")}</p><p className="text-2xl font-extrabold tabular">{formatNumber(u.value_score ?? 0, locale)}<span className="text-sm text-muted">/100</span></p></div></div>
        </Tooltip>
      </div>
    </div>
  );
}

function Location({ u, nearby }: { u: UniversityWithRelations; nearby: U[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const money = useMoney();
  const pins = [
    { id: u.id, lat: u.lat, lng: u.lng, title: tx(u.name, locale), subtitle: u.district ? tx(u.district.name, locale) : undefined, accent: true },
    ...nearby.map((n) => ({ id: n.id, lat: n.lat, lng: n.lng, title: tx(n.name, locale), subtitle: n.district ? tx(n.district.name, locale) : undefined, href: `/${locale === "fa" ? "" : "en/"}universities/${n.slug}`.replace("//", "/") })),
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <p className="mb-4 text-sm text-muted">{t("universities.locationIntro")}</p>
        <Map pins={pins} />
      </div>
      <div className="space-y-4 self-start">
        {u.district && (
          <Link href={`/districts/${u.district.slug}`} className="card block p-5 transition-colors hover:border-brand-300">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">{t("universities.district")}</p>
            <p className="mt-1 text-lg font-bold">{tx(u.district.name, locale)}</p>
            <p className="text-sm text-muted">{t(`common.${u.district.side}`)} · {money.usd(u.district.avg_rent_usd)}{t("districts.perMonth")}</p>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{tx(u.district.description, locale)}</p>
          </Link>
        )}
        {nearby.length > 0 && (
          <div className="card p-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">{t("districts.nearby")}</p>
            <ul className="space-y-2">
              {nearby.map((n) => <li key={n.id}><Link href={`/universities/${n.slug}`} className="text-sm font-medium hover:text-brand-700">{tx(n.name, locale)}</Link></li>)}
            </ul>
          </div>
        )}
        <a href={u.website} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"><ExternalLink className="size-4" />{t("common.website")}</a>
      </div>
    </div>
  );
}
