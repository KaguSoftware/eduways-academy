/**
 * Point every university row at its logo in public/brand/universities/logos/.
 *   npx tsx scripts/sync-logos.ts        → report what would change
 *   npx tsx scripts/sync-logos.ts write  → apply
 *
 * Touches only universities.logo_url, so admin edits to other columns survive.
 * Run this after adding or replacing a logo file; scripts/seed.ts carries the
 * same mapping into supabase/seed.sql for a fresh database.
 */
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { universityLogos } from "../src/data/seed/university-logos";

const write = process.argv[2] === "write";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing in .env.local");
const sb = createClient(url, key, { auth: { persistSession: false } });

const missing = Object.entries(universityLogos).filter(([, p]) => !existsSync(`public${p}`));
if (missing.length) throw new Error(`logo files missing: ${missing.map(([s]) => s).join(", ")}`);

async function main() {
  const { data, error } = await sb.from("universities").select("slug,logo_url");
  if (error) throw error;

  const changes = (data ?? [])
    .map((r) => ({ slug: r.slug as string, from: r.logo_url as string | null, to: universityLogos[r.slug as string] ?? null }))
    .filter((c) => c.to && c.from !== c.to);

  const unmapped = (data ?? []).filter((r) => !universityLogos[r.slug as string]).map((r) => r.slug);
  if (unmapped.length) console.log(`no logo file for: ${unmapped.join(", ")}`);

  if (!changes.length) {
    console.log(`✓ all ${data?.length ?? 0} universities already point at their logo`);
  } else if (!write) {
    console.log(`${changes.length} row(s) would change — re-run with \`write\` to apply:`);
    for (const c of changes) console.log(`  ${c.slug}: ${c.from ?? "null"} → ${c.to}`);
  } else {
    for (const c of changes) {
      const { error: e } = await sb.from("universities").update({ logo_url: c.to }).eq("slug", c.slug);
      if (e) throw new Error(`${c.slug}: ${e.message}`);
    }
    console.log(`✓ updated logo_url on ${changes.length} universities`);
  }
}

main().catch((e) => {
  console.error("✗ sync-logos failed:", e.message);
  process.exit(1);
});
