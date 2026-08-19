import { NextResponse } from "next/server";
import { getRepo } from "@/lib/repo";
import { tx, formatUSD } from "@/lib/utils";
import type { SearchHit } from "@/components/layout/command-search";

export const revalidate = 3600;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const locale = searchParams.get("locale") === "en" ? "en" : "fa";
  if (q.length < 2) return NextResponse.json([]);

  const repo = await getRepo();
  const [unis, programs, districts] = await Promise.all([repo.listUniversities({ q }), repo.listPrograms({ q }), repo.listDistricts()]);
  const ql = q.toLowerCase();

  const hits: SearchHit[] = [
    ...unis.slice(0, 6).map((u) => ({
      type: "university" as const,
      title: tx(u.name, locale),
      subtitle: `${u.district ? tx(u.district.name, locale) : ""} · ${formatUSD(u.avg_tuition_min, locale)}+`,
      href: `/universities/${u.slug}`,
    })),
    ...programs.slice(0, 8).map((p) => ({
      type: "program" as const,
      title: tx(p.name, locale),
      subtitle: `${tx(p.university.name, locale)} · ${formatUSD(p.tuition_usd, locale)}`,
      href: `/universities/${p.university.slug}?tab=programs`,
    })),
    ...districts
      .filter((d) => [d.name.fa, d.name.en, d.slug].some((s) => s.toLowerCase().includes(ql)))
      .slice(0, 4)
      .map((d) => ({ type: "district" as const, title: tx(d.name, locale), subtitle: undefined, href: `/districts/${d.slug}` })),
  ];
  return NextResponse.json(hits);
}
