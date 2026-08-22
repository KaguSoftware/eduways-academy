"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { GitCompareArrows, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "./compare-context";

export function CompareBar() {
  const t = useTranslations("universities");
  const tc = useTranslations("common");
  const { slugs, clear } = useCompare();
  return (
    <AnimatePresence>
      {slugs.length > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 pointer-events-none"
        >
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border bg-brand-900 py-2 pe-2 ps-4 text-white shadow-lg">
            <GitCompareArrows className="size-5 text-accent-400" />
            <span className="text-sm font-semibold">{t("compareBar", { count: slugs.length })}</span>
            <Button asChild size="sm" variant="primary" className="bg-white text-brand-900 hover:bg-brand-50 shadow-none">
              <Link href={{ pathname: "/universities/compare", query: { u: slugs.join(",") } }}>{t("compareNow")}</Link>
            </Button>
            <button onClick={clear} className="flex size-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white focus-ring" aria-label={tc("clear")}><X className="size-4" /></button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
