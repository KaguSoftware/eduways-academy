"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, MotionConfig, useInView, useReducedMotion, type Variants } from "motion/react";
import { Link, useRouter } from "@/i18n/navigation";
import { Search, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import type { SiteSettings } from "@/lib/types";
import { HeroAura } from "@/components/home/hero-aura";

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(5px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", duration: 0.6, bounce: 0 } },
};

export function Hero({ stats }: { stats: SiteSettings["stats"] }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [major, setMajor] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query: Record<string, string> = {};
    if (major) query.q = major;
    router.push({ pathname: "/programs", query });
  };

  const supportStats = [
    { v: stats.partner_universities, suffix: "+", label: t("home.statsUniversities") },
    { v: stats.years_active, suffix: "", label: t("home.statsYears") },
    { v: stats.satisfaction_pct, suffix: t("common.percent"), label: t("home.statsSatisfaction") },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <section className="relative flex flex-1 flex-col overflow-hidden">
        <HeroAura className="pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(65%_60%_at_50%_20%,black,transparent)]" />

        <div className="container-x relative grid flex-1 content-center items-center gap-10 pb-12 pt-10 md:pb-16 md:pt-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.h1 variants={rise} className="max-w-2xl text-4xl font-extrabold leading-[1.25] tracking-tight text-brand-950 md:text-6xl md:leading-[1.14]">
              {t.rich("home.heroTitle", { accent: (c) => <span className="text-brand-600">{c}</span> })}
            </motion.h1>

            <motion.form variants={rise} onSubmit={submit} className="mt-7 max-w-xl">
              <label htmlFor="hero-major" className="flex items-center gap-2 text-sm font-bold text-brand-950">
                {t("home.finderQuestionMajor")}
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-full border border-border bg-white p-1.5 shadow-md transition-shadow focus-within:border-brand-300 focus-within:shadow-lg">
                <span className="ms-3 text-muted"><Search className="size-5" /></span>
                <input
                  id="hero-major"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder={t("home.finderMajorPlaceholder")}
                  aria-describedby="hero-finder-hint"
                  className="h-11 w-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted/70 md:text-base"
                />
                <Button type="submit" size="md" variant="dark" className="shrink-0">{t("home.finderSubmit")}</Button>
              </div>
              <p id="hero-finder-hint" className="mt-2 ps-1 text-xs text-muted">{t("home.finderHint")}</p>
            </motion.form>

            <motion.div variants={rise} className="mt-6 flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link href="/consultation"><Sparkles className="size-5" />{t("home.heroCtaPrimary")}</Link>
              </Button>
              <Button asChild variant="link" size="md">
                <Link href="/universities">{t("home.heroCtaSecondary")}<ArrowRight className="size-4 rtl:hidden" /><ArrowLeft className="size-4 ltr:hidden" /></Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" animate="show" className="lg:ps-10">
            <motion.div variants={rise}>
              <p className="text-[clamp(4rem,7.6vw,7rem)] font-extrabold leading-none tracking-tighter text-brand-950">
                <Counter to={stats.students_placed} />
                <span className="text-accent-500">+</span>
              </p>
              <p className="mt-3 text-base font-bold text-muted lg:text-lg">{t("home.statsStudents")}</p>
            </motion.div>

            <motion.ul variants={stagger} className="mt-8 grid grid-cols-3 gap-x-5 border-t border-border pt-5 lg:mt-9 lg:pt-6">
              {supportStats.map((s) => (
                <motion.li key={s.label} variants={rise}>
                  <p className="text-[clamp(1.5rem,2.4vw,2.125rem)] font-extrabold leading-none tracking-tight text-brand-900 tabular">
                    {formatNumber(s.v, locale)}
                    <span className="text-accent-500">{s.suffix}</span>
                  </p>
                  <p className="mt-2 text-xs font-semibold text-muted lg:text-sm">{s.label}</p>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}

/** Count-up that starts in view; snaps instantly under reduced motion. */
function Counter({ to }: { to: number }) {
  const locale = useLocale();
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [v, setV] = React.useState(0);

  React.useEffect(() => {
    if (!inView || reduced) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1200;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, to]);

  return <span ref={ref} className="tabular">{formatNumber(reduced ? to : v, locale)}</span>;
}
