"use server";

import { revalidatePath } from "next/cache";
import { getStaff } from "./auth";
import { TABLES } from "./specs";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabase } from "@/lib/supabase/env";

export type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateAll() {
  // Content changes affect many pages; revalidate both locale roots.
  revalidatePath("/", "layout");
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
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function deleteRecord(table: string, id: string): Promise<ActionResult> {
  const staff = await getStaff();
  if (!staff) return { ok: false, error: "unauthorized" };
  if (staff.role !== "admin") return { ok: false, error: "admin_only" };
  if (!hasSupabase) return { ok: false, error: "no_db" };
  const spec = TABLES[table];
  if (!spec) return { ok: false, error: "unknown_table" };
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "no_service_role" };
  const { error } = await admin.from(spec.table).delete().eq(spec.idField, id);
  if (error) return { ok: false, error: error.message };
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
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const { createClient } = await import("@/lib/supabase/server");
  const sb = await createClient();
  await sb.auth.signOut();
}
