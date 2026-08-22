"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { MessageCircle, Download } from "lucide-react";
import type { Lead } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useMoney } from "@/lib/money";
import { Select, Segmented, SearchInput, Empty } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { updateLeadStatus } from "@/lib/admin/actions";

const STATUSES = ["new", "contacted", "closed"] as const;

export function LeadsTable({ leads: initial }: { leads: Lead[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const money = useMoney();
  const [leads, setLeads] = React.useState(initial);
  const [filter, setFilter] = React.useState<"all" | (typeof STATUSES)[number]>("all");
  const [q, setQ] = React.useState("");
  const label = (s: string) => t(`admin.status${s.charAt(0).toUpperCase() + s.slice(1)}` as never);
  const list = leads.filter((l) => (filter === "all" || l.status === filter) && (!q || [l.name, l.phone, l.email ?? "", l.desired_major ?? "", l.message ?? ""].join(" ").toLowerCase().includes(q.toLowerCase())));

  const setStatus = async (id: string, status: (typeof STATUSES)[number]) => {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    await updateLeadStatus(id, status);
  };

  const exportCsv = () => {
    const cols = ["created_at", "name", "phone", "email", "country", "interest_level", "desired_major", "budget_usd", "message", "source_page", "locale", "status"] as const;
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = "﻿" + [cols.join(","), ...list.map((l) => cols.map((c) => esc(l[c])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `eduways-leads-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Segmented value={filter} onChange={setFilter} options={[{ value: "all", label: t("admin.all") }, ...STATUSES.map((s) => ({ value: s, label: `${label(s)} (${leads.filter((l) => l.status === s).length})` }))]} size="sm" />
        <div className="flex items-center gap-2">
          <div className="w-64"><SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("admin.search")} /></div>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!list.length}><Download className="size-4" />{t("admin.csv")}</Button>
        </div>
      </div>
      {list.length === 0 ? <Empty title={t("admin.empty")} /> : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-background shadow-sm">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="bg-surface text-xs text-muted">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("consultation.name")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("consultation.phone")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("consultation.major")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("admin.budget")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("admin.country")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("admin.status")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("admin.createdAt")}</th>
                <th className="px-4 py-3 text-end font-semibold">{t("admin.whatsapp")}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((l) => (
                <tr key={l.id} className="border-t border-border align-top">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{l.name}</p>
                    {l.email && <p className="font-en text-xs text-muted" dir="ltr">{l.email}</p>}
                    {l.message && <p className="mt-1 max-w-xs text-xs leading-5 text-muted">{l.message}</p>}
                  </td>
                  <td className="px-4 py-3 font-en" dir="ltr">{l.phone}</td>
                  <td className="px-4 py-3">{l.desired_major || "—"}<p className="text-xs text-muted">{l.interest_level ? t(`common.${l.interest_level}`) : ""}</p></td>
                  <td className="px-4 py-3 tabular">{l.budget_usd ? money.usd(l.budget_usd) : "—"}</td>
                  <td className="px-4 py-3">{l.country ? t(`consultation.countries.${l.country}` as never) : "—"}</td>
                  <td className="px-4 py-3"><Select size="sm" className="w-36" value={l.status ?? "new"} onValueChange={(v) => l.id && setStatus(l.id, v as never)} options={STATUSES.map((s) => ({ value: s, label: label(s) }))} /></td>
                  <td className="px-4 py-3 text-xs text-muted">{l.created_at ? formatDate(l.created_at, locale) : ""}<p className="font-en" dir="ltr">{l.source_page}</p></td>
                  <td className="px-4 py-3 text-end"><a href={`https://wa.me/${l.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener" className="inline-flex size-9 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20" aria-label="WhatsApp"><MessageCircle className="size-4" /></a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
