import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { MessageCircle, Mail, MapPin, Clock, Phone } from "lucide-react";
import { getRepo } from "@/lib/repo";
import { tx, whatsappLink } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page";
import { InstagramIcon } from "@/components/ui/icons";
import { Map } from "@/components/map/map";
import { FaqSection } from "@/components/home/sections";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const loc = await getLocale();
  const repo = await getRepo();
  const [s, faqs] = await Promise.all([repo.getSettings(), repo.listFaqs()]);
  const items = [
    { icon: MessageCircle, label: t("contact.whatsapp"), value: `+${s.whatsapp_number}`, href: whatsappLink(t("common.whatsappMessage")), accent: "hover:border-[#25D366] hover:text-[#25D366]" },
    { icon: InstagramIcon, label: t("contact.instagram"), value: "@eduways.academytr", href: s.instagram_url, accent: "hover:border-pink-500 hover:text-pink-500" },
    { icon: Mail, label: t("contact.email"), value: s.email ?? "", href: s.email ? `mailto:${s.email}` : undefined, accent: "hover:border-brand-400 hover:text-brand-700" },
    { icon: Phone, label: t("contact.phone"), value: s.phone ?? "", href: s.phone ? `tel:${s.phone.replace(/\s/g, "")}` : undefined, accent: "hover:border-brand-400 hover:text-brand-700" },
  ].filter((i) => i.value);
  return (
    <>
      <PageHeader title={t("contact.title")} subtitle={t("contact.subtitle")} />
      <section className="container-x grid gap-8 py-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {items.map(({ icon: Icon, label, value, href, accent }) => (
            <a key={label} href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noopener" className={`card flex items-center gap-4 p-5 transition-colors focus-ring ${accent}`}>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-surface"><Icon className="size-6" /></span>
              <span><span className="block text-xs font-semibold uppercase tracking-wide text-muted">{label}</span><span className="block font-en font-bold" dir="ltr">{value}</span></span>
            </a>
          ))}
          <div className="card flex items-center gap-4 p-5"><span className="flex size-12 items-center justify-center rounded-2xl bg-surface"><MapPin className="size-6" /></span><span><span className="block text-xs font-semibold uppercase tracking-wide text-muted">{t("contact.address")}</span><span className="block font-bold">{tx(s.address, loc)}</span></span></div>
          <div className="card flex items-center gap-4 p-5"><span className="flex size-12 items-center justify-center rounded-2xl bg-surface"><Clock className="size-6" /></span><span><span className="block text-xs font-semibold uppercase tracking-wide text-muted">{t("contact.hours")}</span><span className="block font-bold">{t("contact.hoursValue")}</span></span></div>
        </div>
        <Map pins={[{ id: "office", lat: 41.06, lng: 28.987, title: "Eduways Academy", subtitle: tx(s.address, loc), accent: true }]} className="h-[480px] w-full" zoom={13} />
      </section>
      <FaqSection faqs={faqs.slice(0, 6)} />
    </>
  );
}
