import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabase } from "@/lib/supabase/env";
import { TABLES, type RefOption, type RefSource, type TableSpec } from "./specs";
import { tx } from "@/lib/utils";
import { categories } from "@/data/seed/categories";
import { districts } from "@/data/seed/districts";
import { universities } from "@/data/seed/universities";
import { programs } from "@/data/seed/programs";
import { scholarships, rankings } from "@/data/seed/scholarships";
import { services, stories, posts, faqs, siteSettings } from "@/data/seed/content";

type Row = Record<string, unknown>;

const SEED: Record<string, Row[]> = {
  categories: categories as unknown as Row[],
  districts: districts as unknown as Row[],
  universities: universities as unknown as Row[],
  programs: programs as unknown as Row[],
  scholarships: scholarships as unknown as Row[],
  rankings: rankings as unknown as Row[],
  services: services as unknown as Row[],
  stories: stories as unknown as Row[],
  posts: posts as unknown as Row[],
  faqs: faqs as unknown as Row[],
  site_settings: Object.entries(siteSettings).map(([key, value]) => ({ key, value })),
};

export async function listRows(table: string): Promise<Row[]> {
  const spec = TABLES[table];
  if (!spec) return [];
  if (!hasSupabase) return SEED[table] ?? [];
  const admin = createAdminClient();
  if (!admin) return [];
  let q = admin.from(spec.table).select("*");
  if (spec.orderBy) q = q.order(spec.orderBy, { ascending: Boolean(spec.orderAsc) });
  const { data } = await q.limit(2000);
  return (data ?? []) as Row[];
}

export async function getRow(table: string, id: string): Promise<Row | null> {
  const spec = TABLES[table];
  if (!spec) return null;
  if (!hasSupabase) return (SEED[table] ?? []).find((r) => String(r[spec.idField]) === id) ?? null;
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin.from(spec.table).select("*").eq(spec.idField, id).maybeSingle();
  return (data as Row) ?? null;
}

/* ───────────── reference pickers ───────────── */

const REF_SOURCES: Record<RefSource, { table: string; idField: string; titleField: string }> = {
  districts: { table: "districts", idField: "id", titleField: "name" },
  universities: { table: "universities", idField: "id", titleField: "name" },
  categories: { table: "categories", idField: "id", titleField: "name" },
};

/**
 * Options for every `ref` field of a spec, keyed by field key — so the form offers
 * existing rows instead of a free-text id that can break a foreign key.
 */
export async function listRefOptions(spec: TableSpec, locale: string): Promise<Record<string, RefOption[]>> {
  const sources = Array.from(new Set(spec.fields.filter((f) => f.type === "ref" && f.ref).map((f) => f.ref as RefSource)));
  const bySource: Partial<Record<RefSource, RefOption[]>> = {};
  await Promise.all(sources.map(async (src) => {
    const cfg = REF_SOURCES[src];
    let rows: Row[];
    if (!hasSupabase) rows = SEED[cfg.table] ?? [];
    else {
      const admin = createAdminClient();
      const { data } = admin ? await admin.from(cfg.table).select("*").limit(2000) : { data: null };
      rows = (data ?? []) as Row[];
    }
    bySource[src] = rows
      .map((r) => ({ value: String(r[cfg.idField]), label: `${tx(r[cfg.titleField] as never, locale) || String(r[cfg.idField])} — ${String(r[cfg.idField])}` }))
      .sort((a, b) => a.label.localeCompare(b.label, locale));
  }));
  return Object.fromEntries(spec.fields.filter((f) => f.type === "ref" && f.ref).map((f) => [f.key, bySource[f.ref as RefSource] ?? []]));
}
