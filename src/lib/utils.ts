import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/i18n/routing";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Translatable JSON column: { fa: string; en: string } */
export type I18nText = { fa: string; en: string; tr?: string };

export function tx(value: I18nText | string | null | undefined, locale: string): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale as Locale] || value.en || value.fa || "";
}

export function formatNumber(n: number | null | undefined, locale: string, opts?: Intl.NumberFormatOptions) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", opts).format(n);
}

export function formatUSD(n: number | null | undefined, locale: string) {
  if (n === null || n === undefined) return "—";
  const formatted = formatNumber(n, locale, { maximumFractionDigits: 0 });
  return locale === "fa" ? `${formatted} دلار` : `$${formatted}`;
}

export function formatRange(min?: number | null, max?: number | null, locale = "en") {
  if (min == null && max == null) return "—";
  if (min != null && max != null && min !== max) {
    const a = formatNumber(min, locale, { maximumFractionDigits: 0 });
    const b = formatNumber(max, locale, { maximumFractionDigits: 0 });
    return locale === "fa" ? `${a}–${b} دلار` : `$${a}–${b}`;
  }
  return formatUSD(min ?? max, locale);
}

export function formatDate(iso: string | Date, locale: string) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat(locale === "fa" ? "fa-IR-u-ca-persian" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function toEnglishDigits(s: string) {
  return s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

export function slugify(s: string) {
  return s
    .replace(/[ıİ]/g, "i")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export function whatsappLink(message?: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
