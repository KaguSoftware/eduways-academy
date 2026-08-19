import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "./env";

let client: SupabaseClient | null = null;

/** Anonymous, cookie-less client for public content reads (safe in generateStaticParams / ISR). RLS "published" policies apply. */
export function publicClient(): SupabaseClient {
  if (!client) client = createSupabaseClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
