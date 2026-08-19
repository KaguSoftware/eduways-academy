"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Pencil, Check, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { SearchInput, Empty, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { cn, formatDate, formatNumber } from "@/lib/utils";

export type ListCell =
  | { kind: "text"; text: string; mono?: boolean }
  | { kind: "bool"; value: boolean }
  | { kind: "badge"; text: string; tone?: "brand" | "success" | "warning" | "accent" | "outline" }
  | { kind: "date"; iso: string };

const PAGE = 25;

export function RecordList({ table, columns, items }: { table: string; columns: string[]; items: { id: string; title: string; cells: ListCell[] }[] }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const list = items.filter((i) => !q || (i.title + " " + i.id + " " + i.cells.map((c) => ("text" in c ? c.text : "")).join(" ")).toLowerCase().includes(q.toLowerCase()));
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * PAGE, cur * PAGE);
  React.useEffect(() => setPage(1), [q]);

  const Cell = ({ c }: { c: ListCell }) => {
    if (c.kind === "bool") return c.value ? <Check className="size-4 text-success" /> : <Minus className="size-4 text-muted" />;
    if (c.kind === "badge") return <Badge variant={c.tone ?? "brand"}>{c.text}</Badge>;
    if (c.kind === "date") return <span className="tabular">{formatDate(c.iso, locale)}</span>;
    return <span className={cn("block max-w-[240px] truncate", c.mono && "font-en text-xs text-muted")} dir={c.mono ? "ltr" : undefined}>{c.text}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:w-80"><SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} /></div>
        {pages > 1 && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Button variant="outline" size="icon-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={cur === 1} aria-label="prev"><ChevronRight className="size-4 ltr:rotate-180" /></Button>
            <span className="tabular">{t("page", { page: formatNumber(cur, locale), pages: formatNumber(pages, locale) })}</span>
            <Button variant="outline" size="icon-sm" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={cur === pages} aria-label="next"><ChevronLeft className="size-4 ltr:rotate-180" /></Button>
          </div>
        )}
      </div>
      {list.length === 0 ? <Empty title={t("empty")} /> : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-background shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs text-muted">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("colTitle")}</th>
                {columns.map((c) => <th key={c} className="whitespace-nowrap px-4 py-3 text-start font-semibold">{c}</th>)}
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((i) => (
                <tr key={i.id} className="group border-t border-border transition-colors hover:bg-brand-50/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/${table}/${encodeURIComponent(i.id)}`} className="font-semibold group-hover:text-brand-800">{i.title}</Link>
                    <p className="font-en text-[11px] text-muted" dir="ltr">{i.id}</p>
                  </td>
                  {i.cells.map((c, j) => <td key={j} className="px-4 py-3"><Cell c={c} /></td>)}
                  <td className="px-4 py-3 text-end">
                    <Link href={`/admin/${table}/${encodeURIComponent(i.id)}`} className="inline-flex size-8 items-center justify-center rounded-full text-muted hover:bg-brand-50 hover:text-brand-800" aria-label={t("edit")}><Pencil className="size-4" /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
