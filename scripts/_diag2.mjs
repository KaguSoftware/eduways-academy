import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) { const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2]; }
const [email, password] = process.argv.slice(2);
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const { data, error } = await sb.auth.signInWithPassword({ email, password });
if (error) { console.log("SIGN-IN FAILED:", error.status, error.code, "|", error.message); process.exit(0); }
console.log("SIGN-IN OK:", data.user.email, data.user.id);
const sb2 = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${data.session.access_token}` } } });
const { data: p, error: pe } = await sb2.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
console.log("PROFILE READ (as user):", pe ? `error ${pe.code} ${pe.message}` : JSON.stringify(p));
