export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/** True when the public Supabase env vars are configured. Otherwise the app runs in seed/no-DB mode. */
export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);
