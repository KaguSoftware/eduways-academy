"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link, useRouter } from "@/i18n/navigation";
import { Search, Sparkles, ArrowRight, ArrowLeft, ShieldCheck, BadgePercent, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import type { SiteSettings } from "@/lib/types";

export function Hero({ stats }: { stats: SiteSettings["stats"] }) {
  const t = useTranslations("home");
  const locale = useLocale();
  const router = useRouter();
  const [q, setQ] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push({ pathname: "/universities", query: q ? { q } : {} });
  };

  const statItems = [
    { v: stats.students_placed, suffix: "+", label: t("statsStudents") },
    { v: stats.partner_universities, suffix: "+", label: t("statsUniversities") },
    { v: stats.years_active, suffix: "", label: t("statsYears") },
    { v: stats.satisfaction_pct, suffix: "٪", label: t("statsSatisfaction") },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(70%_60%_at_50%_20%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-40 start-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rtl:translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--brand-300)_45%,transparent),transparent)] blur-2xl" />
      <div className="pointer-events-none absolute -end-40 top-20 size-96 rounded-full bg-accent-400/20 blur-3xl animate-float" />

      <div className="container-x relative grid items-center gap-12 pb-16 pt-12 md:pb-24 md:pt-20 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-brand-800 shadow-sm backdrop-blur">
            <span className="size-2 rounded-full bg-accent-500 animate-pulse" />
            {t("heroEyebrow")}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }} className="mt-5 text-4xl font-extrabold leading-[1.15] tracking-tight text-brand-950 md:text-6xl md:leading-[1.1]">
            {t.rich("heroTitle", { accent: (c) => <span className="text-gradient">{c}</span> })}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }} className="mt-6 max-w-xl text-base leading-8 text-muted md:text-lg">
            {t("heroSubtitle")}
          </motion.p>

          <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} onSubmit={submit} className="mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border bg-white p-1.5 shadow-md focus-within:border-brand-300 focus-within:shadow-lg">
            <span className="ms-3 text-muted"><Search className="size-5" /></span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchPlaceholder")} className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted/70 md:text-base" />
            <Button type="submit" size="md" className="shrink-0">{t("searchButton")}</Button>
          </motion.form>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.28 }} className="mt-5 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/consultation"><Sparkles className="size-5" />{t("heroCtaPrimary")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/universities">{t("heroCtaSecondary")}<ArrowRight className="size-4 rtl:hidden" /><ArrowLeft className="size-4 ltr:hidden" /></Link>
            </Button>
          </motion.div>
          <p className="mt-5 text-xs text-muted">{t("trustLine")}</p>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }} className="relative">
          <div className="relative mx-auto max-w-md rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-4">
              {statItems.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.08 }} className="rounded-2xl bg-gradient-to-br from-brand-50 to-white p-4 ring-1 ring-brand-100">
                  <p className="text-3xl font-extrabold tracking-tight text-brand-900 tabular">
                    <Counter to={s.v} locale={locale} />{s.suffix}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted">{s.label}</p>
                </motion.div>
              ))}
            </div>
            <ul className="mt-5 space-y-2.5">
              {[
                { icon: ShieldCheck, text: t("why1Title") },
                { icon: BadgePercent, text: t("why2Title") },
                { icon: Plane, text: t("why3Title") },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-sm font-medium shadow-sm ring-1 ring-border">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-brand-gradient text-white"><Icon className="size-4" /></span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -start-6 -z-10 size-40 rounded-full bg-brand-300/40 blur-2xl" />
          <div className="pointer-events-none absolute -end-4 -top-6 -z-10 size-32 rounded-full bg-accent-400/40 blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
}

function Counter({ to, locale }: { to: number; locale: string }) {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1200;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{formatNumber(v, locale)}</>;
}
