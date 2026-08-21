import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { requireStaff } from "@/lib/admin/auth";
import { TABLES } from "@/lib/admin/specs";
import { getRow, listRefOptions } from "@/lib/admin/data";
import { hasSupabase } from "@/lib/supabase/env";
import { tx } from "@/lib/utils";
import { RecordForm } from "@/components/admin/record-form";

export const dynamic = "force-dynamic";

const PUBLIC_PATH: Record<string, (row: Record<string, unknown>) => string | null> = {
  universities: (r) => `/universities/${r.slug}`,
  districts: (r) => `/districts/${r.slug}`,
  services: (r) => `/services/${r.slug}`,
  stories: (r) => `/stories/${r.slug}`,
  posts: (r) => `/blog/${r.slug}`,
  faqs: () => "/faq",
};

export default async function AdminRecordPage({ params }: { params: Promise<{ locale: string; table: string; id: string }> }) {
  const { locale, table, id: rawId } = await params;
  setRequestLocale(locale);
  const staff = await requireStaff(locale);
  const t = await getTranslations("admin");
  const spec = TABLES[table];
  if (!spec) notFound();
  const id = decodeURIComponent(rawId);
  const isNew = id === "new";
  // A new record starts with only the fields that have a real starting value. Sending an explicit
  // null for every untouched field would override the column defaults and break NOT NULL columns
  // (description, languages, highlights…), so untouched fields are simply left out of the insert.
  const row = isNew
    ? Object.fromEntries(spec.fields.filter((f) => f.type === "boolean" || f.key === "status").map((f) => [f.key, f.type === "boolean" ? false : "published"]))
    : await getRow(table, id);
  if (!row) notFound();
  const title = isNew ? t("newRecord", { name: tx(spec.singular, locale) }) : typeof row[spec.titleField] === "object" && row[spec.titleField] ? tx(row[spec.titleField] as never, locale) : String(row[spec.titleField] ?? id);
  const refOptions = await listRefOptions(spec, locale);
  const publicHref = !isNew && PUBLIC_PATH[table] ? PUBLIC_PATH[table](row) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href={`/admin/${table}`} className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground"><ChevronLeft className="size-3.5 ltr:rotate-180" />{tx(spec.label, locale)}</Link>
          <h1 className="mt-1 text-2xl font-extrabold">{title}</h1>
          {!isNew && <p className="font-en text-xs text-muted" dir="ltr">{id}</p>}
        </div>
        {publicHref && <Link href={publicHref as never} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"><ExternalLink className="size-4" />{t("view")}</Link>}
      </div>
      <RecordForm table={table} spec={spec} initial={row} refOptions={refOptions} isNew={isNew} canDelete={staff.role === "admin"} readOnly={!hasSupabase} />
    </div>
  );
}
