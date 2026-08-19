import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Plus } from "lucide-react";
import { requireStaff } from "@/lib/admin/auth";
import { TABLES } from "@/lib/admin/specs";
import { listRows } from "@/lib/admin/data";
import { formatNumber, tx } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RecordList, type ListCell } from "@/components/admin/record-list";

export const dynamic = "force-dynamic";

export default async function AdminTablePage({ params }: { params: Promise<{ locale: string; table: string }> }) {
  const { locale, table } = await params;
  setRequestLocale(locale);
  await requireStaff(locale);
  const t = await getTranslations("admin");
  const spec = TABLES[table];
  if (!spec) notFound();
  const rows = await listRows(table);
  const cols = spec.listFields.map((k) => spec.fields.find((f) => f.key === k)!).filter(Boolean);

  const items = rows.map((r) => ({
    id: String(r[spec.idField]),
    title: typeof r[spec.titleField] === "object" && r[spec.titleField] ? tx(r[spec.titleField] as never, locale) : String(r[spec.titleField] ?? r[spec.idField]),
    cells: cols.map((f): ListCell => {
      const v = r[f.key];
      if (v === null || v === undefined || v === "") return { kind: "text", text: "—" };
      if (f.type === "boolean") return { kind: "bool", value: Boolean(v) };
      if (f.type === "number") return { kind: "text", text: formatNumber(Number(v), locale, { useGrouping: f.key !== "year" && f.key !== "order" }), mono: true };
      if (f.type === "select") {
        const opt = f.options?.find((o) => o.value === v);
        return { kind: "badge", text: opt ? tx(opt.label, locale) : String(v), tone: v === "published" ? "success" : v === "draft" ? "warning" : "brand" };
      }
      if (f.type === "date") return { kind: "date", iso: String(v) };
      if (f.type === "tags") return { kind: "text", text: Array.isArray(v) ? (v as string[]).join("، ") : String(v) };
      if (typeof v === "object") return { kind: "text", text: JSON.stringify(v).slice(0, 60) + "…", mono: true };
      return { kind: "text", text: String(v), mono: f.key.endsWith("_id") || f.key === "icon" || f.key === "source" };
    }),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">{tx(spec.label, locale)}</h1>
          <p className="text-sm text-muted">{t("rows", { count: formatNumber(rows.length, locale) })}</p>
        </div>
        {spec.canCreate && <Button asChild><Link href={`/admin/${table}/new`}><Plus className="size-4" />{t("newRecord", { name: tx(spec.singular, locale) })}</Link></Button>}
      </div>
      <RecordList table={table} columns={cols.map((c) => tx(c.label, locale))} items={items} />
    </div>
  );
}
