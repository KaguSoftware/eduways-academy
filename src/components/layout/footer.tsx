import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import { InstagramIcon as Instagram } from "@/components/ui/icons";
import type { SiteSettings } from "@/lib/types";
import { tx, whatsappLink } from "@/lib/utils";

export async function Footer({ settings }: { settings: SiteSettings }) {
  const t = await getTranslations();
  const locale = await getLocale();
  const year = new Date().getFullYear();

  const explore = [
    ["universities", "/universities"],
    ["programs", "/programs"],
    ["rankings", "/rankings"],
    ["districts", "/districts"],
    ["calculator", "/calculator"],
    ["compare", "/universities/compare"],
  ] as const;
  const company = [
    ["services", "/services"],
    ["stories", "/stories"],
    ["blog", "/blog"],
    ["faq", "/faq"],
    ["about", "/about"],
    ["contact", "/contact"],
  ] as const;

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border bg-surface">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--brand-200)_55%,transparent),transparent)]" />
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        <div className="space-y-5">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/brand/logo.jpg" alt="Eduways Academy" width={48} height={48} className="size-12 rounded-full" />
            <span className="flex flex-col leading-none">
              <span className="text-lg font-extrabold tracking-tight text-brand-900">EDUWAYS</span>
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Academy · Istanbul</span>
            </span>
          </Link>
          <p className="max-w-sm text-sm leading-7 text-muted">{t("footer.about")}</p>
          <div className="flex gap-2">
            <a href={whatsappLink(t("common.whatsappMessage"))} target="_blank" rel="noopener" className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-[#25D366] hover:text-[#25D366] focus-ring" aria-label="WhatsApp"><MessageCircle className="size-5" /></a>
            <a href={settings.instagram_url} target="_blank" rel="noopener" className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-pink-500 hover:text-pink-500 focus-ring" aria-label="Instagram"><Instagram className="size-5" /></a>
            {settings.email && <a href={`mailto:${settings.email}`} className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-brand-400 hover:text-brand-700 focus-ring" aria-label="Email"><Mail className="size-5" /></a>}
          </div>
        </div>

        <FooterCol title={t("nav.explore")} items={explore.map(([k, href]) => ({ label: t(`nav.${k}`), href }))} />
        <FooterCol title={t("nav.company")} items={company.map(([k, href]) => ({ label: t(`nav.${k}`), href }))} />

        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-900">{t("contact.title")}</h3>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex items-start gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" /><span>{tx(settings.address, locale)}</span></li>
            <li className="flex items-start gap-2.5"><MessageCircle className="mt-0.5 size-4 shrink-0 text-brand-600" /><span className="font-en" dir="ltr">+{settings.whatsapp_number}</span></li>
            {settings.email && <li className="flex items-start gap-2.5"><Mail className="mt-0.5 size-4 shrink-0 text-brand-600" /><span className="font-en">{settings.email}</span></li>}
          </ul>
          <p className="text-xs text-muted">{t("contact.hoursValue")}</p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted sm:flex-row">
          <p>© {year} Eduways Academy · {t("footer.rights")}</p>
          <p className="flex items-center gap-4">
            <span>{t("footer.madeIn")}</span>
            <Link href="/privacy" className="hover:text-foreground">{t("footer.privacy")}</Link>
            <Link href="/terms" className="hover:text-foreground">{t("footer.terms")}</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-brand-900">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href as never} className="text-sm text-muted transition-colors hover:text-brand-700">{i.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
