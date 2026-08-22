"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatNumber } from "@/lib/utils";

/**
 * Client-side pager for a server-rendered list: children are sliced into pages of
 * `perPage` and the arrows only appear once there is more than one page.
 */
export function Pager({ children, perPage = 6, className }: { children: React.ReactNode; perPage?: number; className?: string }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const items = React.Children.toArray(children);
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const [page, setPage] = React.useState(0);
  const current = Math.min(page, pages - 1);
  return (
    <>
      <div className={cn("grid gap-5 md:grid-cols-2 lg:grid-cols-3", className)}>
        {items.slice(current * perPage, current * perPage + perPage)}
      </div>
      {pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            aria-label={t("previous")}
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft className="rtl:hidden" />
            <ChevronRight className="ltr:hidden" />
          </Button>
          <span className="text-sm font-semibold tabular-nums text-muted">
            {formatNumber(current + 1, locale)} / {formatNumber(pages, locale)}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label={t("next")}
            disabled={current === pages - 1}
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight className="rtl:hidden" />
            <ChevronLeft className="ltr:hidden" />
          </Button>
        </div>
      )}
    </>
  );
}
