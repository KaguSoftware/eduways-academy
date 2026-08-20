"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { MapPin, GitCompareArrows, Check, BadgePercent, Trophy } from "lucide-react";
import type { UniversityWithRelations } from "@/lib/types";
import { cn, formatNumber, formatRange, tx } from "@/lib/utils";
import { Badge, Tooltip } from "@/components/ui/primitives";
import { logoAspect, logoPlate, logoShape } from "@/data/seed/university-logos";
import { useCompare } from "./compare-context";

/**
 * Optical size-matching: a 5:1 wordmark drawn at the same cap height as a disc reads far
 * heavier, so wide marks lose height as they gain width. Anything up to 1.5:1 is untouched.
 */
const opticalScale = (aspect: number) => Math.min(1, Math.sqrt(1.5 / Math.max(aspect, 1.5)));

export function UniversityLogo({
  name,
  logo,
  size = 56,
  className,
  fit = "square",
}: {
  name: string;
  logo?: string | null;
  size?: number;
  className?: string;
  /** `square` locks a fixed square slot so rows stay gridded; `auto` lets the slot take the
   *  mark's own proportions — use it where the layout can spare horizontal room. */
  fit?: "square" | "auto";
}) {
  // The frame follows the mark: a disc gets a round backing, a wordmark a rectangular one,
  // and a logo that ships its own opaque background gets a plate in that colour clipped to
  // the artwork. The image is always `object-contain`, so nothing is ever cropped — in
  // `auto` the slot widens to meet the mark instead of squeezing the mark into a square.
  if (logo) {
    const shape = logoShape(logo);
    const plate = logoPlate(logo);
    const aspect = logoAspect(logo);
    // Discs and near-square marks keep a square slot even in `auto`, so a round backing
    // stays a circle rather than stretching into a pill.
    const square = fit === "square" || shape === "round" || aspect <= 1.2;
    const pad = plate ? 0 : Math.round(size * (fit === "auto" ? 0.1 : shape === "wide" ? 0.03 : 0.08));
    const width = square ? size : Math.round((size - pad * 2) * opticalScale(aspect) * aspect) + pad * 2;
    // Radius tracks the slot so a 32px marquee chip isn't rounded like a 56px card tile.
    const radius = shape === "round" ? 9999 : Math.min(16, Math.round(size * 0.26));

    return (
      <div style={{ width, height: size }} className={cn("relative shrink-0", className)}>
        <span
          aria-hidden
          style={{ borderRadius: radius, ...(plate ? { background: plate } : undefined) }}
          className={cn("absolute inset-0", !plate && "bg-white")}
        />
        <Image
          src={logo}
          alt={name}
          fill
          sizes={`${width}px`}
          // Plates are clipped to the slot so their hard corners pick up the backing radius.
          style={{ padding: pad, borderRadius: radius }}
          className="object-contain"
        />
      </div>
    );
  }
  const initials = name.replace(/[()]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div style={{ width: size, height: size }} className={cn("flex shrink-0 items-center justify-center rounded-2xl bg-brand-gradient font-en text-lg font-extrabold text-white shadow-sm", className)} aria-hidden>
      {initials}
    </div>
  );
}

export function ScoreRing({ value, size = 48, label }: { value: number; size?: number; label?: string }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} title={label}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--surface-2)" strokeWidth={5} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="url(#ring)" strokeWidth={5} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * value) / 100} />
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--brand-600)" />
            <stop offset="100%" stopColor="var(--accent-500)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute font-en text-xs font-extrabold text-brand-900 tabular">{value}</span>
    </div>
  );
}

export function UniversityCard({ u, index = 0, compact = false }: { u: UniversityWithRelations; index?: number; compact?: boolean }) {
  const locale = useLocale();
  const t = useTranslations();
  const { has, toggle } = useCompare();
  const selected = has(u.slug);
  const name = tx(u.name, locale);
  const englishCount = u.programs.filter((p) => p.language !== "tr").length;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group relative flex flex-col card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand-200", selected && "border-brand-400 ring-2 ring-brand-100")}
    >
      <div className="flex items-start gap-4">
        <UniversityLogo name={u.short_name || u.name.en} logo={u.logo_url} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={u.type === "public" ? "brand" : "accent"}>{t(`common.${u.type}`)}</Badge>
            {u.is_featured && <Badge variant="warning"><Trophy className="size-3" />{t("universities.featured")}</Badge>}
            {u.eduways_discount_pct ? <Badge variant="success"><BadgePercent className="size-3" />{t("common.upTo")} {formatNumber(u.eduways_discount_pct, locale)}٪</Badge> : null}
          </div>
          <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug">
            <Link href={`/universities/${u.slug}`} className="after:absolute after:inset-0 focus-ring rounded-lg">{name}</Link>
          </h3>
          {u.district && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin className="size-3.5" />{tx(u.district.name, locale)} · {t(`common.${u.district.side}`)}</p>
          )}
        </div>
        <Tooltip content={t("common.score")}>
          <div><ScoreRing value={u.editorial_score} /></div>
        </Tooltip>
      </div>

      {!compact && (
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted">{tx(u.description, locale)}</p>
      )}

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label={t("common.tuition")} value={formatRange(u.avg_tuition_min, u.avg_tuition_max, locale)} small />
        <Stat label={t("rankings.colRank")} value={u.best_rank ? `#${formatNumber(u.best_rank, locale)}` : "—"} />
        <Stat label={t("common.programsCount", { count: u.programs.length })} value={englishCount ? `${formatNumber(englishCount, locale)} EN` : "TR"} />
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted">{u.languages.map((l) => t(`common.${l}` as never)).join(" · ")}</span>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); toggle(u.slug); }}
          className={cn("relative z-10 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-ring", selected ? "border-brand-600 bg-brand-600 text-white" : "border-border text-muted hover:border-brand-300 hover:text-brand-800")}
          aria-pressed={selected}
        >
          {selected ? <Check className="size-3.5" /> : <GitCompareArrows className="size-3.5" />}
          {selected ? t("universities.compareRemove") : t("universities.compareAdd")}
        </button>
      </div>
    </motion.article>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-xl bg-surface px-2 py-2">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className={cn("mt-0.5 font-bold tabular", small ? "text-[11px]" : "text-sm")}>{value}</dd>
    </div>
  );
}
