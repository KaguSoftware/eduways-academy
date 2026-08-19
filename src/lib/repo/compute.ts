import type { District, Program, Ranking, Scholarship, University, UniversityWithRelations, AdmissionRequirement } from "@/lib/types";

/** Best (lowest) national rank across sources. */
export function bestRank(rankings: Ranking[]): number | null {
  const ranks = rankings.map((r) => r.rank_national).filter((n): n is number => typeof n === "number");
  return ranks.length ? Math.min(...ranks) : null;
}

/**
 * Value score 0–100: rewards good rank and low tuition.
 * rankScore: 100 at rank 1 → ~0 at rank 150 (log scale). tuitionScore: 100 at $1k → 0 at $35k (log scale).
 */
export function valueScore(rank: number | null, tuitionMid: number, editorial: number): number {
  const r = rank ?? 150;
  const rankScore = Math.max(0, 100 - (Math.log(r) / Math.log(150)) * 100);
  const t = Math.min(Math.max(tuitionMid, 1000), 35000);
  const tuitionScore = Math.max(0, 100 - ((Math.log(t) - Math.log(1000)) / (Math.log(35000) - Math.log(1000))) * 100);
  return Math.round(rankScore * 0.4 + tuitionScore * 0.45 + editorial * 0.15);
}

export interface HydrateCtx {
  districts: District[];
  programs: Program[];
  requirements: AdmissionRequirement[];
  scholarships: Scholarship[];
  rankings: Ranking[];
}

export function hydrate(u: University, ctx: HydrateCtx): UniversityWithRelations {
  const rankings = ctx.rankings.filter((r) => r.university_id === u.id);
  const rank = bestRank(rankings);
  const mid = (u.avg_tuition_min + u.avg_tuition_max) / 2;
  return {
    ...u,
    district: ctx.districts.find((d) => d.id === u.district_id),
    programs: ctx.programs.filter((p) => p.university_id === u.id),
    requirements: ctx.requirements.filter((r) => r.university_id === u.id),
    scholarships: ctx.scholarships.filter((s) => s.university_id === u.id || s.university_id === null),
    rankings,
    best_rank: rank,
    value_score: valueScore(rank, mid, u.editorial_score),
  };
}
