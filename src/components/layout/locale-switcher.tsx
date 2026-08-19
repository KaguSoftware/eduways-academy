"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "fa", label: "فارسی", short: "FA" },
  { code: "en", label: "English", short: "EN" },
] as const;

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations("nav");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 text-sm font-semibold text-foreground/80 transition-colors hover:border-brand-300 hover:text-foreground focus-ring" aria-label={t("language")}>
          <Globe className="size-4" />
          <span className="font-en">{locale.toUpperCase()}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 p-1.5">
        {LOCALES.map((l) => (
          <Link
            key={l.code}
            // @ts-expect-error dynamic params are passed through
            href={{ pathname, params }}
            locale={l.code}
            className={cn("flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium hover:bg-brand-50", locale === l.code && "bg-brand-50 text-brand-800")}
          >
            <span className={l.code === "fa" ? "font-fa" : "font-en"}>{l.label}</span>
            <span className="font-en text-xs text-muted">{l.short}</span>
          </Link>
        ))}
      </PopoverContent>
    </Popover>
  );
}
