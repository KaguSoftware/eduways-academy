import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseServiceKey, supabaseUrl } from "./env";

/** Service-role client. Server only. Bypasses RLS — use for lead inserts and admin writes. */
export function createAdminClient() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
