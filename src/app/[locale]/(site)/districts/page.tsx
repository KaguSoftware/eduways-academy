import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MapPin, Wallet } from "lucide-react";
import { getRepo } from "@/lib/repo";
import { cn, formatNumber, tx } from "@/lib/utils";
import { createMoney } from "@/lib/money";
import { PageHeader, CtaBanner } from "@/components/layout/page";
import { Map } from "@/components/map/map";
import { Badge } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "districts" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function DistrictsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const loc = await getLocale();
  const money = createMoney(t, loc);
  const repo = await getRepo();
  const [districts, universities] = await Promise.all([repo.listDistricts(), repo.listUniversities()]);
  const counts = universities.reduce<Record<string, number>>((a, u) => ((a[u.district_id] = (a[u.district_id] ?? 0) + 1), a), {});
  const sorted = [...districts].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0));
  const prefix = loc === "fa" ? "" : "/en";
  const pins = universities.map((u) => ({ id: u.id, lat: u.lat, lng: u.lng, title: tx(u.name, loc), subtitle: u.district ? tx(u.district.name, loc) : undefined, href: `${prefix}/universities/${u.slug}`, accent: u.type === "foundation" }));

  return (
    <>
      <PageHeader title={t("districts.title")} subtitle={t("districts.subtitle")} />
      <section className="container-x py-10">
        <h2 className="mb-4 text-lg font-bold">{t("districts.mapTitle")}</h2>
        <Map pins={pins} className="h-[480px] w-full" />
        <p className="mt-3 flex items-center gap-4 text-xs text-muted"><span className="inline-flex items-center gap-1"><span className="size-3 rounded-full bg-brand-700" />{t("common.public")}</span><span className="inline-flex items-center gap-1"><span className="size-3 rounded-full bg-accent-500" />{t("common.foundation")}</span></p>
      </section>

      {(["european", "asian"] as const).map((side) => (
        <section key={side} className="container-x py-8">
          <h2 className="mb-5 text-2xl font-extrabold tracking-tight">{t(`common.${side}`)}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.filter((d) => d.side === side).map((d, i) => (
              <Reveal key={d.id} delay={i * 0.04}>
                <Link href={`/districts/${d.slug}`} className="group flex h-full flex-col card p-5 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg focus-ring">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold group-hover:text-brand-800">{tx(d.name, loc)}</h3>
                    <Badge variant={side === "european" ? "brand" : "accent"}>{t(`common.${side}`)}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-muted">{tx(d.description, loc)}</p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-muted"><MapPin className="size-3.5" />{t("common.universitiesCount", { count: counts[d.id] ?? 0 })}</span>
                    <span className={cn("inline-flex items-center gap-1 font-bold tabular", d.avg_rent_usd <= 260 ? "text-success" : d.avg_rent_usd >= 420 ? "text-warning" : "text-brand-800")}><Wallet className="size-3.5" />{money.usd(d.avg_rent_usd)}{t("districts.perMonth")}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      ))}
      <CtaBanner compact />
      <span className="hidden">{formatNumber(0, loc)}</span>
    </>
  );
}
