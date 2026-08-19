import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, ChevronLeft, MessageCircle, Sparkles } from "lucide-react";
import { cn, whatsappLink } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function PageHeader({ eyebrow, title, subtitle, children, className, crumbs }: { eyebrow?: React.ReactNode; title: React.ReactNode; subtitle?: React.ReactNode; children?: React.ReactNode; className?: string; crumbs?: { label: string; href?: string }[] }) {
  return (
    <section className={cn("relative overflow-hidden border-b border-border bg-surface", className)}>
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
      <div className="container-x relative py-12 md:py-16">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronLeft className="size-3 rtl:rotate-0 ltr:rotate-180" />}
                {c.href ? <Link href={c.href as never} className="hover:text-brand-700">{c.label}</Link> : <span className="text-foreground">{c.label}</span>}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">{eyebrow}</p>}
        <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-brand-950 md:text-5xl animate-fade-up">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-base leading-8 text-muted md:text-lg animate-fade-up [animation-delay:80ms]">{subtitle}</p>}
        {children && <div className="mt-6 animate-fade-up [animation-delay:160ms]">{children}</div>}
      </div>
    </section>
  );
}

export function SectionHeader({ title, subtitle, href, linkLabel, align = "start" }: { title: React.ReactNode; subtitle?: React.ReactNode; href?: string; linkLabel?: string; align?: "start" | "center" }) {
  return (
    <div className={cn("mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between", align === "center" && "items-center text-center md:flex-col md:items-center")}>
      <div className={cn(align === "center" && "mx-auto max-w-2xl")}>
        <h2 className="text-2xl font-extrabold tracking-tight text-brand-950 md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-sm leading-7 text-muted md:text-base">{subtitle}</p>}
      </div>
      {href && linkLabel && (
        <Button asChild variant="link" className="text-sm font-semibold">
          <Link href={href as never}>
            {linkLabel}
            <ArrowRight className="size-4 rtl:hidden" />
            <ArrowLeft className="size-4 ltr:hidden" />
          </Link>
        </Button>
      )}
    </div>
  );
}

export async function CtaBanner({ title, body, compact = false }: { title?: string; body?: string; compact?: boolean }) {
  const t = await getTranslations();
  return (
    <section className={cn("container-x", compact ? "my-12" : "my-20")}>
      <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-12 text-white shadow-lg md:px-14 md:py-16">
        <div className="pointer-events-none absolute -end-20 -top-24 size-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -start-10 size-72 rounded-full bg-accent-400/30 blur-3xl" />
        <div className="relative grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-2xl font-extrabold leading-tight md:text-4xl">{title ?? t("home.ctaTitle")}</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/85 md:text-base">{body ?? t("home.ctaBody")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Button asChild size="lg" className="bg-white text-brand-900 shadow-lg hover:bg-brand-50">
              <Link href="/consultation"><Sparkles className="size-5" />{t("home.ctaButton")}</Link>
            </Button>
            <Button asChild size="lg" variant="whatsapp">
              <a href={whatsappLink(t("common.whatsappMessage"))} target="_blank" rel="noopener"><MessageCircle className="size-5" />{t("common.whatsapp")}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
