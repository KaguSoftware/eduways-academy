// Writes .env.local from `supabase projects api-keys` output without printing secrets.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const ref = readFileSync("supabase/.temp/project-ref", "utf8").trim();
const raw = execSync(`npx supabase projects api-keys --project-ref ${ref} -o json`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
const keys = JSON.parse(raw);
const find = (pred) => keys.find(pred)?.api_key ?? "";
const anon = find((k) => k.name === "anon" || k.type === "legacy" && k.name === "anon") || find((k) => /publishable/i.test(k.name));
const service = find((k) => k.name === "service_role") || find((k) => /secret/i.test(k.name) && k.type !== "legacy");

const template = existsSync(".env.example") ? readFileSync(".env.example", "utf8") : "";
let env = template
  .replace(/^NEXT_PUBLIC_SUPABASE_URL=.*$/m, `NEXT_PUBLIC_SUPABASE_URL=https://${ref}.supabase.co`)
  .replace(/^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*$/m, `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon}`)
  .replace(/^SUPABASE_SERVICE_ROLE_KEY=.*$/m, `SUPABASE_SERVICE_ROLE_KEY=${service}`);
writeFileSync(".env.local", env);
console.log(`.env.local written. ref=${ref} anon=${anon ? "set(" + anon.length + " chars)" : "MISSING"} service_role=${service ? "set(" + service.length + " chars)" : "MISSING"}`);
console.log("key names available:", keys.map((k) => `${k.name}${k.type ? "/" + k.type : ""}`).join(", "));
