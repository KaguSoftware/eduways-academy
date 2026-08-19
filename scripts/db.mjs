// Small ad-hoc DB helper: node scripts/db.mjs "<table>" "<json filter>" delete|count
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) { const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2]; }
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const [table, filter, op] = process.argv.slice(2);
let q = op === "delete" ? sb.from(table).delete() : sb.from(table).select("*", { count: "exact", head: true });
for (const [k, v] of Object.entries(JSON.parse(filter || "{}"))) q = q.eq(k, v);
const { error, count } = await q;
console.log(error ? "error: " + error.message : `${op} ok${count != null ? " count=" + count : ""}`);
