/**
 * Guardrail for the message catalogue. Run with `npm run i18n:check` (needs tsx — it imports specs.ts).
 *
 * 1. fa.json and en.json must hold exactly the same keys, none of them empty.
 * 2. Every label the admin renders must actually resolve, through the real next-intl translator
 *    and the real fallback chain. specs.ts carries only column keys, so a renamed column would
 *    otherwise degrade silently into a printed key path instead of failing.
 */
import { readFileSync } from "node:fs";
import { createTranslator } from "use-intl/core";
import { TABLES, SECTIONS } from "../src/lib/admin/specs.ts";
import { adminText } from "../src/lib/admin/labels.ts";

const LOCALES = ["fa", "en"];
const load = (l) => JSON.parse(readFileSync(new URL(`../src/messages/${l}.json`, import.meta.url), "utf8"));
const M = Object.fromEntries(LOCALES.map((l) => [l, load(l)]));

const flatten = (o, prefix = "") =>
  Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]));

const problems = [];

/* ── 1. parity ── */
const keys = Object.fromEntries(LOCALES.map((l) => [l, new Map(flatten(M[l]))]));
for (const a of LOCALES) {
  for (const b of LOCALES) {
    if (a === b) continue;
    for (const k of keys[a].keys()) if (!keys[b].has(k)) problems.push(`${k} — present in ${a}.json, missing from ${b}.json`);
  }
  for (const [k, v] of keys[a]) if (typeof v !== "string" || !v.trim()) problems.push(`${k} — empty value in ${a}.json`);
}

/* ── 2. admin spec coverage, resolved the way the UI resolves it ── */
// adminText() returns the key path itself when nothing in the chain resolves — that is the failure.
const unresolved = (v) => !v || /^(admin|common)\.[a-zA-Z]/.test(v);
let checked = 0;

for (const locale of LOCALES) {
  const t = createTranslator({ locale, messages: M[locale], onError: () => {} });
  for (const [table, spec] of Object.entries(TABLES)) {
    const A = adminText(t, table);
    const check = (what, value) => {
      checked++;
      if (unresolved(value)) problems.push(`${what} — does not resolve in ${locale}.json (got "${value}")`);
    };
    check(`table "${table}" label`, A.label());
    check(`table "${table}" singular`, A.singular());
    for (const s of SECTIONS) check(`section "${s}"`, A.section(s));
    for (const f of spec.fields) {
      check(`${table}.${f.key} label`, A.field(f));
      if (f.help || f.key === "id" || f.type === "i18n-md") check(`${table}.${f.key} help`, A.help(f));
      for (const v of f.options ?? []) check(`${table}.${f.key} option "${v}"`, A.option(f, v));
    }
    // Columns shown in the list view must exist as fields, or the page renders an empty header.
    for (const k of spec.listFields) if (!spec.fields.some((f) => f.key === k)) problems.push(`${table}.listFields lists "${k}", which is not a field`);
  }
}

if (problems.length) {
  console.error(`i18n-check: ${problems.length} problem(s)\n` + problems.map((p) => `  · ${p}`).join("\n"));
  process.exit(1);
}
console.log(`i18n-check: ok — ${keys.fa.size} keys in sync across ${LOCALES.join(", ")}; ${checked} admin labels resolve`);
