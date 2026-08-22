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

export function formatDate(iso: string | Date, locale: string) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat(locale === "fa" ? "fa-IR-u-ca-persian" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/** Natural (numeric-aware) id sort: post-2 before post-10. */
export function byId<T extends { id: string }>(a: T, b: T) {
  return a.id.localeCompare(b.id, "en", { numeric: true, sensitivity: "base" });
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
