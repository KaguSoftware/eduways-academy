"use server";

import { revalidatePath } from "next/cache";
import { getStaff } from "./auth";
import { TABLES, type TableSpec } from "./specs";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabase } from "@/lib/supabase/env";

/**
 * `error` is always a code, never prose: the action runs on the server with no reliable request
 * locale for a *returned* string, so the form translates the code (see ERROR_KEYS in
 * components/admin/record-form.tsx). `detail` carries the raw Postgres text for debugging.
 */
export type ActionResult = { ok: true } | { ok: false; error: string; detail?: string };

/** Turn raw Postgres errors into a code an editor can act on. */
function describe(error: { code?: string; message: string; details?: string | null }): ActionResult {
  if (error.code === "23503") return { ok: false, error: "fk_missing", detail: error.message };
  if (error.code === "23505") return { ok: false, error: "duplicate", detail: error.message };
  return { ok: false, error: "db_error", detail: error.message };
}

function revalidateAll() {
  // Content changes affect many pages; revalidate both locale roots.
  revalidatePath("/", "layout");
}

/**
 * Rows ordered by an `order` column are positioned by an editor typing a number, so two rows
 * routinely end up sharing one slot. Postgres then returns them in an arbitrary order (an updated
 * row lands last in the heap), which reads as "changing the order did nothing". After every save
 * the whole table is renumbered 1..n — the just-saved row wins its slot, everyone else keeps their
 * relative position — so the number typed in is the position the row actually takes.
 */
async function resequence(admin: NonNullable<ReturnType<typeof createAdminClient>>, spec: TableSpec, saved: Record<string, unknown>) {
  const savedId = String(saved[spec.idField]);
  // `order` is a reserved word, hence the quoting; the response is typed too loosely for
  // supabase-js's select parser, so it is read back as plain rows.
  const { data, error } = await admin.from(spec.table).select(`${spec.idField},"order"`);
  if (error || !data) return;
  const rows = (data as unknown as Record<string, unknown>[]).map((r) => ({
    id: String(r[spec.idField]),
    order: typeof r.order === "number" ? r.order : Number.MAX_SAFE_INTEGER,
  }));
  rows.sort((a, b) => a.order - b.order || (a.id === savedId ? -1 : b.id === savedId ? 1 : 0));
  const moved = rows.map((r, i) => ({ ...r, next: i + 1 })).filter((r) => r.next !== r.order);
  await Promise.all(moved.map((r) => admin.from(spec.table).update({ order: r.next }).eq(spec.idField, r.id)));
}

export async function saveRecord(table: string, record: Record<string, unknown>): Promise<ActionResult> {
  const staff = await getStaff();
  if (!staff) return { ok: false, error: "unauthorized" };
  if (!hasSupabase) return { ok: false, error: "no_db" };
  const spec = TABLES[table];
  if (!spec) return { ok: false, error: "unknown_table" };
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "no_service_role" };
  const allowed = new Set(spec.fields.map((f) => f.key));
  const clean = Object.fromEntries(Object.entries(record).filter(([k]) => allowed.has(k)));
  const { error } = await admin.from(spec.table).upsert(clean, { onConflict: spec.idField });
  if (error) return describe(error);
  if (spec.fields.some((f) => f.key === "order")) await resequence(admin, spec, clean);
  revalidateAll();
  return { ok: true };
}

export async function deleteRecord(table: string, id: string): Promise<ActionResult> {
  // Any signed-in staff member may delete; the form guards the action with a type-the-id confirm.
  const staff = await getStaff();
  if (!staff) return { ok: false, error: "unauthorized" };
  if (!hasSupabase) return { ok: false, error: "no_db" };
  const spec = TABLES[table];
  if (!spec) return { ok: false, error: "unknown_table" };
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "no_service_role" };
  const { error } = await admin.from(spec.table).delete().eq(spec.idField, id);
  if (error) return describe(error);
  revalidateAll();
  return { ok: true };
}

export async function updateLeadStatus(id: string, status: "new" | "contacted" | "closed"): Promise<ActionResult> {
  const staff = await getStaff();
  if (!staff) return { ok: false, error: "unauthorized" };
  if (!hasSupabase) return { ok: false, error: "no_db" };
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "no_service_role" };
  const { error } = await admin.from("leads").update({ status }).eq("id", id);
  if (error) return describe(error);
  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const { createClient } = await import("@/lib/supabase/server");
  const sb = await createClient();
  await sb.auth.signOut();
}
