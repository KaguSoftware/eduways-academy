import { chromium } from "playwright";
const out = process.argv[2];
const base = "http://localhost:3101";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const issues = [];
page.on("console", (m) => { if (m.type() === "error") issues.push(`[console:${page.url().replace(base, "")}] ${m.text().slice(0, 220)}`); });
page.on("pageerror", (e) => issues.push(`[pageerror:${page.url().replace(base, "")}] ${e.message.slice(0, 220)}`));
page.on("response", (r) => { if (r.status() >= 400 && !r.url().includes("favicon")) issues.push(`[http ${r.status()}] ${r.url().replace(base, "")}`); });

// login
await page.goto(base + "/admin/login", { waitUntil: "networkidle" });
await page.fill('input[type="email"]', "qa-bot@eduways.local");
await page.fill('input[type="password"]', "Qa-Bot-Temp-2026!");
await page.click('button[type="submit"]');
await page.waitForURL(/\/admin(\?|$|\/)/, { timeout: 15000 }).catch(() => issues.push("[login] did not redirect to /admin; url=" + page.url()));
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/admin-dashboard.png` });

const routes = ["/admin/leads", "/admin/universities", "/admin/universities/uni-koc-university", "/admin/programs", "/admin/scholarships", "/admin/rankings", "/admin/districts", "/admin/services", "/admin/stories", "/admin/posts", "/admin/posts/post-1", "/admin/faqs", "/admin/faqs/faq-1", "/admin/site_settings", "/admin/site_settings/stats", "/admin/universities/new", "/en/admin", "/en/admin/leads"];
for (const r of routes) {
  const t0 = Date.now();
  const res = await page.goto(base + r, { waitUntil: "networkidle" }).catch((e) => { issues.push(`[nav ${r}] ${e.message.slice(0, 120)}`); return null; });
  await page.waitForTimeout(600);
  const name = r.replace(/[^a-z0-9]+/gi, "_");
  await page.screenshot({ path: `${out}/admin${name}.png`, fullPage: true });
  const title = await page.title();
  // An unresolved catalogue key renders as its own path — see pick() in src/lib/admin/labels.ts.
  const leak = await page.locator("text=/(admin|common)\.(fields|tableFields|options|fieldHelp|tableFieldHelp|tables|sections)\./").count();
  if (leak) issues.push(`[i18n ${r}] ${leak} unresolved message key(s) visible`);
  console.log(`${res?.status() ?? "?"} ${Date.now() - t0}ms ${r} · ${title}`);
  if (r === "/admin/universities/uni-koc-university") {
    const h1 = await page.textContent("h1");
    console.log("  h1:", h1);
    const inputs = await page.$$eval("input, textarea, select, button", (els) => els.length);
    console.log("  controls:", inputs, "native selects:", await page.$$eval("select", (e) => e.length));
  }
}
// try edit + save on faq-1 (then revert)
await page.goto(base + "/admin/faqs/faq-1", { waitUntil: "networkidle" });
const num = page.locator("input[inputmode=decimal]").first();
const before = await num.inputValue();
await num.fill("2");
await page.click("button:has-text(\"ذخیره\")");
await page.waitForTimeout(2500);
const savedMsg = await page.locator("text=ذخیره شد").count();
await page.screenshot({ path: out + "/admin-faq-edit.png", fullPage: true });
await num.fill(before); await page.click("button:has-text(\"ذخیره\")"); await page.waitForTimeout(2000);
console.log("save faq-1 order:", before, "-> 2 saved-msg:", savedMsg);
// date picker opens?
await page.goto(base + "/admin/posts/post-1", { waitUntil: "networkidle" });
await page.locator("button:has(svg.lucide-calendar-days)").first().click();
await page.waitForTimeout(600);
console.log("daypicker visible:", await page.locator(".rdp-root").count());
await page.screenshot({ path: out + "/admin-datepicker.png" });
// create + delete a FAQ through the UI
await page.goto(base + "/admin/faqs/new", { waitUntil: "networkidle" });
await page.locator("input[dir=ltr]").first().fill("faq-qa-temp");
await page.locator("input[dir=rtl]").first().fill("سوال تستی");
await page.click("button:has-text(\"ذخیره\")");
await page.waitForURL(/faq-qa-temp/, { timeout: 15000 }).catch(() => issues.push("[create] did not navigate to new record: " + page.url()));
await page.waitForTimeout(1000);
console.log("created url:", page.url().replace(base, ""));
await page.click("button:has-text(\"حذف\")");
await page.waitForTimeout(400);
await page.locator("[role=dialog] button:has-text(\"حذف\")").click();
await page.waitForURL((u) => u.pathname.endsWith("/admin/faqs"), { timeout: 15000 }).catch(() => issues.push("[delete] did not navigate back: " + page.url()));
console.log("after delete url:", page.url().replace(base, ""));
// sign out
const so = await page.locator("text=خروج").first();
console.log("signout visible:", await so.count());
console.log("\nISSUES (" + issues.length + "):\n" + [...new Set(issues)].join("\n"));
await browser.close();
