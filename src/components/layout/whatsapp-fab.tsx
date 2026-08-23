"use client";

import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";
import { cn, whatsappLink } from "@/lib/utils";
import { useCompare } from "@/components/university/compare-context";

export function WhatsAppFab({ number }: { number: string }) {
  const t = useTranslations("common");
  const { slugs } = useCompare();
  const href = number ? `https://wa.me/${number}?text=${encodeURIComponent(t("whatsappMessage"))}` : whatsappLink(t("whatsappMessage"));
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={t("whatsapp")}
      className={cn(
        "group fixed bottom-5 end-5 z-40 flex items-center gap-0 rounded-full bg-[#25D366] p-3.5 text-white shadow-lg transition-all duration-300 hover:gap-2 hover:pe-5 hover:shadow-xl focus-ring",
        // The compare bar goes full-width on phones and would sit under this button,
        // so step out of its way until the viewport is wide enough for it to be centred.
        slugs.length > 0 && "bottom-24 sm:bottom-5",
      )}
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40 [animation-duration:2.4s]" />
      <MessageCircle className="size-6" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-300 group-hover:max-w-40 group-hover:opacity-100">{t("whatsapp")}</span>
    </a>
  );
}
