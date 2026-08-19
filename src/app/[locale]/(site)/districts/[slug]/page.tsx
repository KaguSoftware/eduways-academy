import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2, Wallet, MapPin } from "lucide-react";
import { getRepo } from "@/lib/repo";
import { routing } from "@/i18n/routing";
import { formatUSD, tx } from "@/lib/utils";
import { slimUniversity } from "@/lib/dto";
import { PageHeader, CtaBanner } from "@/components/layout/page";
import { Map } from "@/components/map/map";
import { UniversityCard } from "@/components/university/university-card";
import { Badge } from "@/components/ui/primitives";

export const revalidate = 3600;

export async function generateStaticParams() {
  const repo = await getRepo();
  const ds = await repo.listDistricts();
  return routing.locales.flatMap((locale) => ds.map((d) => ({ locale, slug: d.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const repo = await getRepo();
  const d = await repo.getDistrict(slug);
  if (!d) return {};
  const t = await getTranslations({ locale, namespace: "districts" });
  return { title: `${tx(d.name, locale)} · ${t("title")}`, description: tx(d.description, locale).slice(0, 160) };
}

export default async function DistrictPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const loc = await getLocale();
  const repo = await getRepo();
  const [d, all] = await Promise.all([repo.getDistrict(slug), repo.listUniversities()]);
  if (!d) notFound();
  const here = all.filter((u) => u.district_id === d.id);
  const dist = (a: { lat: number; lng: number }) => Math.hypot(a.lat - d.lat, a.lng - d.lng);
  const nearby = all.filter((u) => u.district_id !== d.id).sort((a, b) => dist(a) - dist(b)).slice(0, 4);
  const prefix = loc === "fa" ? "" : "/en";
  const pins = [...here, ...nearby].map((u) => ({ id: u.id, lat: u.lat, lng: u.lng, title: tx(u.name, loc), subtitle: u.district ? tx(u.district.name, loc) : undefined, href: `${prefix}/universities/${u.slug}`, accent: u.district_id === d.id }));
  const name = tx(d.name, loc);

  return (
    <>
      <PageHeader
        eyebrow={<><MapPin className="size-3.5" />{t(`common.${d.side}`)}</>}
        title={name}
        subtitle={tx(d.description, loc)}
        crumbs={[{ label: t("nav.home"), href: "/" }, { label: t("nav.districts"), href: "/districts" }, { label: name }]}
      >
        <div className="flex flex-wrap gap-3">
          <Badge variant="brand" className="px-3 py-2 text-sm"><Wallet className="size-4" />{t("districts.avgRent")}: {formatUSD(d.avg_rent_usd, loc)}{t("districts.perMonth")}</Badge>
          <Badge variant="accent" className="px-3 py-2 text-sm">{t("common.universitiesCount", { count: here.length })}</Badge>
        </div>
      </PageHeader>

      <section className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
        <Map pins={pins} className="h-[440px] w-full" center={[d.lat, d.lng]} zoom={12} />
        <div className="space-y-5">
          {d.highlights && d.highlights.length > 0 && (
            <div className="card p-5">
              <h2 className="mb-3 font-bold">{t("districts.highlights")}</h2>
              <ul className="space-y-2 text-sm">{d.highlights.map((h, i) => <li key={i} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" />{tx(h, loc)}</li>)}</ul>
            </div>
          )}
          <div className="card p-5">
            <h2 className="mb-3 font-bold">{t("districts.nearby")}</h2>
            <ul className="space-y-2 text-sm">{nearby.map((u) => <li key={u.id}>{tx(u.name, loc)} <span className="text-xs text-muted">· {u.district ? tx(u.district.name, loc) : ""}</span></li>)}</ul>
          </div>
        </div>
      </section>

      {here.length > 0 && (
        <section className="container-x py-6">
          <h2 className="mb-6 text-2xl font-extrabold tracking-tight">{t("districts.universitiesHere")}</h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{here.map((u, i) => <UniversityCard key={u.id} u={slimUniversity(u)} index={i} />)}</div>
        </section>
      )}
      <CtaBanner compact />
    </>
  );
}
