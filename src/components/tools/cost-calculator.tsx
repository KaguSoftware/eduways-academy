"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { BookOpen, CircleDollarSign, GraduationCap, MapPin } from "lucide-react";
import { DynamicIcon } from "@/components/home/sections";
import type { District } from "@/lib/types";
import type { I18nText } from "@/lib/utils";
import { formatNumber, tx } from "@/lib/utils";
import { useMoney } from "@/lib/money";
import { Select, Segmented, Slider, Field } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export interface CalcUniversity { id: string; slug: string; name: I18nText; avg_tuition_min: number; avg_tuition_max: number; has_dorm: boolean; district_id: string; eduways_discount_pct: number | null; programs: { id: string; name: I18nText; tuition_usd: number; level: string; language: string; icon?: string | null }[] }

const LIVING = { basic: 250, normal: 380, comfort: 600 } as const;
const HOUSING_MULT = { dorm: 0.8, shared: 1, studio: 1.9 } as const;
const ONE_TIME = 900; // visa + ikamet + insurance + deposits (USD, indicative)

/** Select row: leading icon + truncating label. Mirrors the programs explorer. */
function OptionRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span>
      <span className="truncate">{label}</span>
    </span>
  );
}

function Bar({ label, value, color, max, hint }: { label: string; value: number; color: string; max: number; hint?: string }) {
  const money = useMoney();
  return (
    <div>
      <div className="flex items-end justify-between gap-3 text-sm">
        <span className="min-w-0"><span className="text-muted">{label}</span>{hint && <span className="block text-xs text-muted/80">({hint})</span>}</span>
        <span className="shrink-0 font-bold tabular">{money.usd(value)}</span>
      </div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-surface-2"><motion.div className={`h-full w-full origin-left rounded-full ${color}`} initial={{ scaleX: 0 }} animate={{ scaleX: value / max }} transition={{ type: "spring", stiffness: 120, damping: 20 }} /></div>
    </div>
  );
}

export function CostCalculator({ universities, districts }: { universities: CalcUniversity[]; districts: District[] }) {
  const t = useTranslations("calculator");
  const tc = useTranslations("common");
  const locale = useLocale();
  const money = useMoney();
  const [uniSlug, setUniSlug] = React.useState(universities[0]?.slug ?? "");
  const uni = universities.find((u) => u.slug === uniSlug) ?? universities[0];
  const [programId, setProgramId] = React.useState("any");
  const [districtId, setDistrictId] = React.useState(uni?.district_id ?? districts[0]?.id);
  const [housing, setHousing] = React.useState<keyof typeof HOUSING_MULT>("shared");
  const [lifestyle, setLifestyle] = React.useState<keyof typeof LIVING>("normal");
  const [discount, setDiscount] = React.useState(uni?.eduways_discount_pct ?? 0);

  React.useEffect(() => {
    setProgramId("any");
    setDistrictId(uni?.district_id ?? districts[0]?.id);
    setDiscount(uni?.eduways_discount_pct ?? 0);
  }, [uni, districts]);

  const district = districts.find((d) => d.id === districtId) ?? districts[0];
  const program = uni?.programs.find((p) => p.id === programId);
  const listTuition = program ? program.tuition_usd : Math.round(((uni?.avg_tuition_min ?? 0) + (uni?.avg_tuition_max ?? 0)) / 2);
  const tuition = Math.round(listTuition * (1 - discount / 100));
  const rentMonthly = Math.round((district?.avg_rent_usd ?? 300) * HOUSING_MULT[housing] * (housing === "dorm" && !uni?.has_dorm ? 1.1 : 1));
  const livingMonthly = LIVING[lifestyle];
  const rent = rentMonthly * 12;
  const living = livingMonthly * 12;
  const total = tuition + rent + living + ONE_TIME;
  const max = Math.max(tuition, rent, living, ONE_TIME, 1);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <div className="card grid gap-6 p-6 md:p-8">
        <Field label={t("university")} className="gap-2.5">
          <Select value={uniSlug} onValueChange={setUniSlug} options={universities.map((u) => ({ value: u.slug, label: <OptionRow icon={<GraduationCap className="size-4 text-brand-600" />} label={tx(u.name, locale)} /> }))} />
        </Field>
        <Field label={t("program")} className="gap-2.5">
          <Select value={programId} onValueChange={setProgramId} options={[{ value: "any", label: <OptionRow icon={<BookOpen className="size-4 text-brand-600" />} label={t("anyProgram")} /> }, ...(uni?.programs ?? []).map((p) => ({ value: p.id, label: <OptionRow icon={p.icon ? <DynamicIcon name={p.icon} className="size-4 text-brand-600" /> : <BookOpen className="size-4 text-brand-600" />} label={`${tx(p.name, locale)} · ${tc(p.level as never)} · ${money.usd(p.tuition_usd)}`} /> }))]} />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t("district")} className="gap-2.5">
            <Select value={districtId} onValueChange={setDistrictId} options={districts.map((d) => ({ value: d.id, label: <OptionRow icon={<MapPin className="size-4 text-brand-600" />} label={`${tx(d.name, locale)} · ${money.usd(d.avg_rent_usd)}`} /> }))} />
          </Field>
          <Field label={t("housing")} className="gap-2.5">
            <Segmented animated value={housing} onChange={setHousing} options={[{ value: "dorm", label: t("housingDorm") }, { value: "shared", label: t("housingShared") }, { value: "studio", label: t("housingStudio") }]} className="w-full [&>button]:flex-1" size="sm" />
          </Field>
        </div>
        <Field label={t("lifestyle")} className="gap-2.5">
          <Segmented animated value={lifestyle} onChange={setLifestyle} options={[{ value: "basic", label: t("lifestyleBasic") }, { value: "normal", label: t("lifestyleNormal") }, { value: "comfort", label: t("lifestyleComfort") }]} className="w-full [&>button]:flex-1" />
        </Field>
        <Field label={<span className="flex items-center justify-between"><span>{t("discount")}</span><span className="font-bold tabular text-success">{formatNumber(discount, locale)}{tc("percent")}</span></span>} className="gap-2.5">
          <Slider value={[discount]} onValueChange={([v]) => setDiscount(v)} min={0} max={75} step={5} />
        </Field>
      </div>

      <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white shadow-lg">
          <div className="pointer-events-none absolute -end-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
          <p className="text-sm font-medium text-white/80">{t("total")}</p>
          <motion.p key={total} initial={{ opacity: 0.5, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-4xl font-extrabold tabular tracking-tight">{money.usd(total)}</motion.p>
          <p className="mt-1 text-xs text-white/75">{t("perMonth", { amount: money.usd(rentMonthly + livingMonthly) })}</p>
          <Button asChild className="mt-5 w-full bg-white text-brand-900 hover:bg-brand-50"><Link href={{ pathname: "/consultation", query: { university: uni?.slug } }}><CircleDollarSign className="size-4" />{t("getQuote")}</Link></Button>
        </div>
        <div className="card space-y-5 p-6">
          <Bar label={t("tuition")} value={tuition} color="bg-brand-600" max={max} />
          <Bar label={t("rent")} value={rent} color="bg-accent-500" max={max} />
          <Bar label={t("living")} value={living} color="bg-brand-300" max={max} />
          <Bar label={t("oneTime")} hint={t("oneTimeHint")} value={ONE_TIME} color="bg-warning" max={max} />
          {discount > 0 && <p className="text-xs text-success">− {money.usd(listTuition - tuition)} {t("discount")}</p>}
          <p className="border-t border-border pt-3 text-xs leading-5 text-muted">{t("disclaimer")}</p>
        </div>
      </div>
    </div>
  );
}
