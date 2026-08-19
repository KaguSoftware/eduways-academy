import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/supabase/env";

export interface StaffSession {
  userId: string;
  email: string;
  role: "admin" | "editor";
}

/** Resolve the signed-in staff member or null. In no-DB mode returns a demo read-only session. */
export async function getStaff(): Promise<StaffSession | null> {
  if (!hasSupabase) return { userId: "demo", email: "demo@eduways.local", role: "editor" };
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile) return null;
  return { userId: user.id, email: user.email ?? "", role: profile.role };
}

export async function requireStaff(locale: string): Promise<StaffSession> {
  const s = await getStaff();
  if (!s) redirect(`${locale === "fa" ? "" : `/${locale}`}/admin/login`);
  return s;
}
