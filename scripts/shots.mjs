import { chromium } from "playwright";
const out = process.argv[2];
const pages = [
  ["home-fa", "/", 1440], ["home-en", "/en", 1440], ["home-mobile", "/", 390],
  ["universities", "/universities", 1440], ["uni-koc", "/universities/koc-university", 1440], ["uni-koc-programs", "/universities/koc-university?tab=programs", 1440], ["uni-docs", "/universities/istanbul-university?tab=documents", 1440],
  ["programs", "/programs", 1440], ["rankings", "/rankings", 1440], ["rankings-value", "/rankings/best-value", 1440],
  ["districts", "/districts", 1440], ["district-besiktas", "/districts/besiktas", 1440], ["services", "/services", 1440], ["calculator", "/calculator", 1440],
  ["stories", "/stories", 1440], ["blog", "/blog", 1440], ["post", "/blog/yos-exam-guide", 1440], ["consultation", "/consultation", 1440], ["compare", "/universities/compare?u=koc-university,sabanci-university,bogazici-university", 1440], ["faq", "/faq", 1440], ["contact", "/contact", 1440], ["privacy", "/privacy", 1440], ["terms", "/terms", 1440], ["privacy-en", "/en/privacy", 1440], ["terms-en", "/en/terms", 1440], ["admin-login", "/admin/login", 1440],
];
const browser = await chromium.launch();
for (const [name, path, width] of pages) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  await page.goto("http://localhost:3101" + path, { waitUntil: "networkidle" });
  await page.evaluate(async () => { const h = document.body.scrollHeight; for (let y = 0; y < h; y += 300) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 130)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(900);
  const leak = await page.locator("text=/(admin|common|nav|legal)\.(fields|tableFields|options|fieldHelp|tableFieldHelp|tables|sections|privacy|terms|money)\./").count();
  if (leak) console.log(`LEAK ${name}: ${leak} unresolved message key(s) visible`);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: name.startsWith("home") || name.startsWith("uni-") || name === "calculator" });
  await page.close();
}
await browser.close();
console.log("done");
