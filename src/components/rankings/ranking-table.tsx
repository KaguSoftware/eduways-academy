import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { UniversityWithRelations, Category } from "@/lib/types";
import { cn, formatNumber, formatRange, tx } from "@/lib/utils";
import { UniversityLogo, ScoreRing } from "@/components/university/university-card";
import { Badge } from "@/components/ui/primitives";

export type RankingKey = "overall" | "best-value" | "cheapest" | "english-taught" | "public" | "private" | `field-${string}`;

export function rankingList(key: RankingKey, all: UniversityWithRelations[], categories: Category[]) {
  const ranked = all.filter((u) => u.best_rank);
  switch (key) {
    case "overall":
      return [...ranked].sort((a, b) => (a.best_rank ?? 999) - (b.best_rank ?? 999));
    case "best-value":
      return [...all].sort((a, b) => (b.value_score ?? 0) - (a.value_score ?? 0));
    case "cheapest":
      return [...all].sort((a, b) => a.avg_tuition_min - b.avg_tuition_min);
    case "english-taught":
      return [...all].filter((u) => u.programs.some((p) => p.language !== "tr")).sort((a, b) => b.programs.filter((p) => p.language !== "tr").length * b.editorial_score - a.programs.filter((p) => p.language !== "tr").length * a.editorial_score);
    case "public":
      return ranked.filter((u) => u.type === "public").sort((a, b) => (a.best_rank ?? 999) - (b.best_rank ?? 999));
    case "private":
      return ranked.filter((u) => u.type === "foundation").sort((a, b) => (a.best_rank ?? 999) - (b.best_rank ?? 999));
    default: {
      const slug = key.replace("field-", "");
      const cat = categories.find((c) => c.slug === slug);
      if (!cat) return [];
      return [...all]
        .filter((u) => u.programs.some((p) => p.category_id === cat.id))
        .sort((a, b) => (a.best_rank ?? 150) * (1 / (a.editorial_score || 1)) - (b.best_rank ?? 150) * (1 / (b.editorial_score || 1)));
    }
  }
}

export async function RankingTable({ list, metricKey }: { list: UniversityWithRelations[]; metricKey: RankingKey }) {
  const t = await getTranslations();
  const locale = await getLocale();
  const metric = (u: UniversityWithRelations) => {
    if (metricKey === "best-value") return `${formatNumber(u.value_score ?? 0, locale)}/100`;
    if (metricKey === "cheapest") return formatRange(u.avg_tuition_min, u.avg_tuition_max, locale);
    if (metricKey === "english-taught") return `${formatNumber(u.programs.filter((p) => p.language !== "tr").length, locale)} EN`;
    return u.best_rank ? `#${formatNumber(u.best_rank, locale)}` : "—";
  };
  return (
    <div className="overflow-x-auto rounded-3xl border border-border">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="w-14 px-4 py-3 text-center font-semibold">#</th>
            <th className="px-4 py-3 text-start font-semibold">{t("rankings.colUniversity")}</th>
            <th className="px-4 py-3 text-center font-semibold">{metricKey === "best-value" ? t("rankings.colValue") : metricKey === "cheapest" ? t("rankings.colTuition") : metricKey === "english-taught" ? t("rankings.colPrograms") : t("rankings.colRank")}</th>
            <th className="px-4 py-3 text-center font-semibold">{t("rankings.colType")}</th>
            <th className="px-4 py-3 text-center font-semibold">{t("rankings.colTuition")}</th>
            <th className="px-4 py-3 text-center font-semibold">{t("rankings.colScore")}</th>
            <th className="px-4 py-3 text-center font-semibold">{t("rankings.colValue")}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((u, i) => (
            <tr key={u.id} className="group border-t border-border transition-colors hover:bg-brand-50/40">
              <td className="px-4 py-3"><span className={cn("mx-auto flex size-8 items-center justify-center rounded-full font-en text-sm font-extrabold", i < 3 ? "bg-brand-gradient text-white" : "bg-surface text-muted")}>{formatNumber(i + 1, locale)}</span></td>
              <td className="px-4 py-3">
                <Link href={`/universities/${u.slug}`} className="flex items-center gap-3">
                  <UniversityLogo name={u.short_name || u.name.en} logo={u.logo_url} size={36} className="rounded-xl text-xs" />
                  <span><span className="block font-semibold group-hover:text-brand-800">{tx(u.name, locale)}</span><span className="block text-xs text-muted">{u.district ? tx(u.district.name, locale) : ""}</span></span>
                </Link>
              </td>
              <td className="px-4 py-3 text-center font-extrabold tabular text-brand-800">{metric(u)}</td>
              <td className="px-4 py-3 text-center"><Badge variant={u.type === "public" ? "success" : "accent"}>{t(`common.${u.type}`)}</Badge></td>
              <td className="px-4 py-3 text-center tabular">{formatRange(u.avg_tuition_min, u.avg_tuition_max, locale)}</td>
              <td className="px-4 py-3"><div className="flex justify-center"><ScoreRing value={u.editorial_score} size={36} /></div></td>
              <td className="px-4 py-3"><div className="flex justify-center"><ScoreRing value={u.value_score ?? 0} size={36} /></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
