import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) { const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2]; }
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
console.log("URL:", url);
console.log("anon key prefix:", (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"").slice(0,12), "len", (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"").length);
console.log("service key prefix:", (process.env.SUPABASE_SERVICE_ROLE_KEY||"").slice(0,12), "len", (process.env.SUPABASE_SERVICE_ROLE_KEY||"").length);
const sb = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data, error } = await sb.auth.admin.listUsers({ perPage: 100 });
if (error) { console.log("listUsers error:", error.message); process.exit(1); }
console.log("\nAUTH USERS:", data.users.length);
for (const u of data.users) console.log(` - ${u.email} | id=${u.id} | confirmed=${!!u.email_confirmed_at} | last_sign_in=${u.last_sign_in_at} | providers=${u.app_metadata?.providers}`);
const { data: profs, error: pe } = await sb.from("profiles").select("*");
console.log("\nPROFILES:", pe ? "error "+pe.message : JSON.stringify(profs, null, 2));
