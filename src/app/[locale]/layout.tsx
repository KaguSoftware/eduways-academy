import type { Metadata } from "next";
import { Inter, Vazirmatn } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing, isRtl } from "@/i18n/routing";
import { TooltipProvider } from "@/components/ui/primitives";
import { DirectionProvider } from "@/components/ui/direction";
import { siteUrl } from "@/lib/utils";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const vazirmatn = Vazirmatn({ subsets: ["arabic", "latin"], variable: "--font-vazirmatn", display: "swap" });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${t("siteName")} — ${t("tagline")}`, template: `%s · ${t("siteName")}` },
    description: t("description"),
    applicationName: "Eduways Academy",
    openGraph: { type: "website", siteName: "Eduways Academy", locale: locale === "fa" ? "fa_IR" : "en_US", images: ["/brand/logo.jpg"] },
    twitter: { card: "summary_large_image" },
    alternates: { languages: { fa: "/", en: "/en", "x-default": "/" } },
    icons: { icon: "/favicon.ico" },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = isRtl(locale) ? "rtl" : "ltr";

  return (
    // data-scroll-behavior lets Next 16 suspend our `scroll-behavior: smooth` during route
    // transitions, so navigations land at the top instantly instead of animating there.
    <html lang={locale} dir={dir} data-scroll-behavior="smooth" className={`${inter.variable} ${vazirmatn.variable} antialiased`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <DirectionProvider dir={dir}>
            <TooltipProvider>{children}</TooltipProvider>
          </DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
