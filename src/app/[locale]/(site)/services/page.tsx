import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { getRepo } from "@/lib/repo";
import { tx } from "@/lib/utils";
import { PageHeader, CtaBanner } from "@/components/layout/page";
import { DynamicIcon, ProcessSection } from "@/components/home/sections";
import { Reveal } from "@/components/ui/reveal";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");
  const loc = await getLocale();
  const repo = await getRepo();
  const services = await repo.listServices();
  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <section className="container-x grid gap-5 py-12 md:grid-cols-2">
        {services.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.05}>
            <Link href={`/services/${s.slug}`} className="group flex h-full gap-5 card p-6 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg focus-ring">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-md"><DynamicIcon name={s.icon} className="size-7" /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2"><h2 className="text-lg font-bold group-hover:text-brand-800">{tx(s.title, loc)}</h2><ArrowUpRight className="size-5 shrink-0 text-muted rtl:-scale-x-100" /></span>
                <p className="mt-1.5 text-sm leading-7 text-muted">{tx(s.summary, loc)}</p>
                {s.price_note && <p className="mt-3 text-xs font-semibold text-success">{tx(s.price_note, loc)}</p>}
              </span>
            </Link>
          </Reveal>
        ))}
      </section>
      <ProcessSection />
      <CtaBanner compact />
    </>
  );
}
