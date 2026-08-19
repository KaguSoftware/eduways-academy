import type { Metadata } from "next";
import { Suspense } from "react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Clock, ShieldCheck, BadgePercent, MessageCircle } from "lucide-react";
import { getRepo } from "@/lib/repo";
import { tx, whatsappLink } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page";
import { ConsultationForm } from "@/components/forms/consultation-form";
import { Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "consultation" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ConsultationPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ university?: string }> }) {
  const { locale } = await params;
  const { university } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();
  const loc = await getLocale();
  const repo = await getRepo();
  const uni = university ? await repo.getUniversity(university) : null;

  return (
    <>
      <PageHeader title={t("consultation.title")} subtitle={t("consultation.subtitle")} />
      <section className="container-x grid gap-10 py-12 lg:grid-cols-[1fr_340px]">
        <Suspense fallback={<Skeleton className="h-[560px]" />}>
          <ConsultationForm universityName={uni ? tx(uni.name, loc) : undefined} />
        </Suspense>
        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          {[
            { icon: Clock, title: t("home.process1Title"), body: t("home.process1Body") },
            { icon: BadgePercent, title: t("home.why2Title"), body: t("home.why2Body") },
            { icon: ShieldCheck, title: t("home.why4Title"), body: t("home.why4Body") },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="card flex gap-4 p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon className="size-5" /></span>
              <span><span className="block font-bold">{title}</span><span className="mt-1 block text-sm leading-6 text-muted">{body}</span></span>
            </div>
          ))}
          <Button asChild variant="whatsapp" size="lg" className="w-full"><a href={whatsappLink(t("common.whatsappMessage"))} target="_blank" rel="noopener"><MessageCircle className="size-5" />{t("common.whatsapp")}</a></Button>
        </aside>
      </section>
    </>
  );
}
