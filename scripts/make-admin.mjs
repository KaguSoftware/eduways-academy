// Promote a Supabase Auth user to admin: node scripts/make-admin.mjs user@example.com [admin|editor]
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) { const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2]; }
const [email, role = "admin"] = process.argv.slice(2);
if (!email) { console.error("usage: node scripts/make-admin.mjs <email> [admin|editor]"); process.exit(1); }
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: { users }, error } = await sb.auth.admin.listUsers({ perPage: 1000 });
if (error) throw error;
const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (!user) { console.error("no auth user with that email — create it in Supabase Dashboard → Authentication → Users first"); process.exit(1); }
const { error: e2 } = await sb.from("profiles").upsert({ id: user.id, email: user.email, role }, { onConflict: "id" });
if (e2) throw e2;
console.log(`✓ ${email} is now ${role}`);
