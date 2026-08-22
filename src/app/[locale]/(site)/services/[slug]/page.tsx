import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MessageCircle, Sparkles } from "lucide-react";
import { getRepo } from "@/lib/repo";
import { routing } from "@/i18n/routing";
import { tx, whatsappLink } from "@/lib/utils";
import { PageHeader, CtaBanner } from "@/components/layout/page";
import { DynamicIcon } from "@/components/home/sections";
import { Button } from "@/components/ui/button";

export const revalidate = 3600;

export async function generateStaticParams() {
  const repo = await getRepo();
  const s = await repo.listServices();
  return routing.locales.flatMap((locale) => s.map((x) => ({ locale, slug: x.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const repo = await getRepo();
  const s = await repo.getService(slug);
  return s ? { title: tx(s.title, locale), description: tx(s.summary, locale) } : {};
}

export default async function ServicePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const loc = await getLocale();
  const repo = await getRepo();
  const [s, all] = await Promise.all([repo.getService(slug), repo.listServices()]);
  if (!s) notFound();
  const title = tx(s.title, loc);
  const wa = whatsappLink(t("services.waMessage", { title }));

  return (
    <>
      <PageHeader eyebrow={<><DynamicIcon name={s.icon} className="size-3.5" />{t("nav.services")}</>} title={title} subtitle={tx(s.summary, loc)} crumbs={[{ label: t("nav.home"), href: "/" }, { label: t("nav.services"), href: "/services" }, { label: title }]}>
        <div className="flex flex-wrap gap-2">
          <Button asChild><Link href="/consultation"><Sparkles className="size-4" />{t("services.cta")}</Link></Button>
          <Button asChild variant="whatsapp"><a href={wa} target="_blank" rel="noopener"><MessageCircle className="size-4" />{t("common.whatsapp")}</a></Button>
        </div>
      </PageHeader>
      <section className="container-x grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <article className="space-y-10">
          <p className="text-base leading-8 text-foreground/90 md:text-lg">{tx(s.body, loc)}</p>
          {s.steps && s.steps.length > 0 && (
            <div>
              <h2 className="mb-5 text-xl font-bold">{t("services.howItWorks")}</h2>
              <ol className="grid gap-4 sm:grid-cols-2">
                {s.steps.map((st, i) => (
                  <li key={i} className="card flex gap-4 p-5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient font-en font-extrabold text-white">{i + 1}</span>
                    <span><span className="block font-bold">{tx(st.title, loc)}</span><span className="mt-1 block text-sm leading-6 text-muted">{tx(st.body, loc)}</span></span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {s.price_note && (
            <div className="rounded-2xl border border-success/30 bg-success/5 p-5"><h2 className="font-bold text-success">{t("services.pricing")}</h2><p className="mt-1 text-sm">{tx(s.price_note, loc)}</p></div>
          )}
        </article>
        <aside className="space-y-3 lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t("nav.services")}</p>
          {all.map((x) => (
            <Link key={x.id} href={`/services/${x.slug}`} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${x.slug === s.slug ? "border-brand-300 bg-brand-50 text-brand-900" : "border-border hover:border-brand-200 hover:bg-surface"}`}>
              <DynamicIcon name={x.icon} className="size-4 text-brand-600" />{tx(x.title, loc)}
            </Link>
          ))}
        </aside>
      </section>
      <CtaBanner compact />
    </>
  );
}
