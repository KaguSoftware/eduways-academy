// Graduation-trail QA sweep (Playwright). Usage: node scripts/qa-trail.mjs <outDir> [baseUrl]
// Checks the layering contract (container-x z2 / overlay z1 / stage outside containers), the cap's
// ride + landing on desktop/mobile in fa/en, dialog & mobile-menu scroll-lock stability, accordion
// height changes, client navigation, the Graduate throw (+ wheel interrupt) and reduced motion.
// Writes screenshots + issues.json to <outDir>; exits 1 when issues were found.
import { chromium } from "playwright";
import fs from "node:fs";

const out = process.argv[2] ?? ".qa-trail";
const base = process.argv[3] ?? process.env.BASE ?? "http://localhost:3000";
fs.mkdirSync(out, { recursive: true });
const issues = [];
const log = (...a) => console.log(...a);

const browser = await chromium.launch();

async function hatInfo(page) {
  return page.evaluate(() => {
    const hat = document.querySelector(".grad-trail__hat img");
    const stage = document.querySelector("[data-grad-stage]");
    const layer = document.querySelector(".grad-trail");
    const path = document.querySelector(".grad-trail__progress");
    const r = hat?.getBoundingClientRect();
    const s = stage?.getBoundingClientRect();
    return {
      scrollY: window.scrollY,
      innerH: window.innerHeight,
      docH: document.documentElement.scrollHeight,
      ready: layer?.getAttribute("data-ready"),
      hat: r ? { x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2 } : null,
      stage: s ? { x: s.x, y: s.y, w: s.width, h: s.height, cx: s.x + s.width / 2 } : null,
      pose: stage?.getAttribute("data-pose"),
      transform: document.querySelector(".grad-trail__hat")?.style.transform,
      landAt: window.__gradLandAt,
      dashoffset: path?.style.strokeDashoffset,
      chunks: document.querySelectorAll(".grad-trail__base").length,
      layerRect: layer ? (() => { const l = layer.getBoundingClientRect(); return { h: l.height, w: l.width }; })() : null,
    };
  });
}

async function scrollTo(page, y) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
  await page.waitForTimeout(450); // let the smoothing settle
}

async function run(name, path, viewport, opts = {}) {
  const ctx = await browser.newContext({ viewport, reducedMotion: opts.reduced ? "reduce" : "no-preference", deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error") issues.push(`[console:${name}] ${m.text().slice(0, 300)}`); });
  page.on("pageerror", (e) => issues.push(`[pageerror:${name}] ${e.message.slice(0, 1200).replace(/\n/g, " | ")}`));
  await page.goto(base + path, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(800);

  // z-index contract
  const z = await page.evaluate(() => {
    const cs = (el) => el && getComputedStyle(el);
    const cont = document.querySelector(".site-shell main .container-x");
    const layer = document.querySelector(".grad-trail");
    const shell = document.querySelector(".site-shell");
    const footerCont = document.querySelector(".site-shell footer .container-x");
    const btn = document.querySelector("[data-grad-button]");
    return {
      contPos: cs(cont)?.position, contZ: cs(cont)?.zIndex,
      footerContZ: cs(footerCont)?.zIndex,
      layerZ: cs(layer)?.zIndex, layerPos: cs(layer)?.position, layerPE: cs(layer)?.pointerEvents,
      shellIso: cs(shell)?.isolation, shellPos: cs(shell)?.position, shellDisplay: cs(shell)?.display,
      btnZ: cs(btn)?.zIndex,
      stageInContainer: !!document.querySelector(".container-x [data-grad-stage]"),
    };
  });
  log(`\n=== ${name} (${viewport.width}x${viewport.height}) ${path}`);
  log("z-contract:", JSON.stringify(z));
  if (z.contZ !== "2" || z.contPos !== "relative") issues.push(`[${name}] container-x not lifted: ${JSON.stringify(z)}`);
  if (z.layerZ !== "1") issues.push(`[${name}] overlay z != 1`);
  if (z.stageInContainer) issues.push(`[${name}] stage is inside a container-x (hat would be behind the student)`);

  const i0 = await hatInfo(page);
  log("p=0:", JSON.stringify({ scrollY: i0.scrollY, docH: i0.docH, ready: i0.ready, hat: i0.hat && { cx: Math.round(i0.hat.cx), cy: Math.round(i0.hat.cy), w: Math.round(i0.hat.w) }, layerH: i0.layerRect?.h }));
  if (i0.ready !== "true") issues.push(`[${name}] overlay not ready`);
  if (!opts.reduced && (!i0.hat || i0.hat.cy < 0 || i0.hat.cy > i0.innerH)) issues.push(`[${name}] hat not in viewport at p=0: ${JSON.stringify(i0.hat)}`);
  if (i0.layerRect && Math.abs(i0.layerRect.h - i0.docH) > 2) issues.push(`[${name}] overlay layer height ${i0.layerRect.h} != docH ${i0.docH}`);
  await page.screenshot({ path: `${out}/${name}-p0.png` });

  const maxScroll = i0.docH - i0.innerH;
  for (const f of [0.25, 0.5, 0.75]) {
    await scrollTo(page, maxScroll * f);
    const i = await hatInfo(page);
    log(`p≈${f}:`, JSON.stringify({ scrollY: Math.round(i.scrollY), hat: i.hat && { cx: Math.round(i.hat.cx), cy: Math.round(i.hat.cy), w: Math.round(i.hat.w) } }));
    if (!opts.reduced && (!i.hat || i.hat.cy < -20 || i.hat.cy > i.innerH + 20)) issues.push(`[${name}] hat left viewport at p=${f}: cy=${i.hat?.cy}`);
    await page.screenshot({ path: `${out}/${name}-p${f}.png` });
  }
  const landScroll = await page.evaluate((maxScroll) => {
    const st = document.querySelector("[data-grad-stage]");
    if (!st) return maxScroll;
    const bottom = st.getBoundingClientRect().bottom + window.scrollY;
    return Math.min(maxScroll, Math.max(0, bottom + 28 - window.innerHeight));
  }, maxScroll);
  await scrollTo(page, Math.max(landScroll, maxScroll * 0.6 > landScroll ? Math.min(maxScroll * 0.6, maxScroll) : landScroll));
  await page.waitForTimeout(500);
  const i1 = await hatInfo(page);
  log("p=1:", JSON.stringify({ scrollY: Math.round(i1.scrollY), hat: i1.hat && { cx: Math.round(i1.hat.cx), cy: Math.round(i1.hat.cy), w: Math.round(i1.hat.w), h: Math.round(i1.hat.h) }, stage: i1.stage && { cx: Math.round(i1.stage.cx), y: Math.round(i1.stage.y), w: Math.round(i1.stage.w), h: Math.round(i1.stage.h) }, dash: i1.dashoffset }));
  if (i1.hat && i1.stage) {
    if (Math.abs(i1.hat.cx - i1.stage.cx) > 3) issues.push(`[${name}] hat not centred on student at p=1: hat.cx=${i1.hat.cx} stage.cx=${i1.stage.cx}`);
    if (i1.stage.y < 0 || i1.stage.y + i1.stage.h > i1.innerH) issues.push(`[${name}] stage not fully in viewport at landing: y=${i1.stage.y} h=${i1.stage.h} innerH=${i1.innerH}`);
    if (i1.hat.y > i1.stage.y + i1.stage.h * 0.2 || i1.hat.y + i1.hat.h < i1.stage.y) issues.push(`[${name}] hat not on the head at p=1: hat.y=${i1.hat.y} stage.y=${i1.stage.y}`);
  }
  await page.screenshot({ path: `${out}/${name}-p1.png` });
  // Close-up of the landing
  if (i1.stage) {
    await page.screenshot({ path: `${out}/${name}-landing.png`, clip: { x: Math.max(0, i1.stage.x - 120), y: Math.max(0, i1.stage.y - 120), width: Math.min(viewport.width, i1.stage.w + 240), height: Math.min(viewport.height, i1.stage.h + 200) } });
  }

  if (opts.extras) await opts.extras(page, { name, i1, maxScroll });
  await ctx.close();
}

// ───────── Desktop LTR home: full suite incl. menu, accordion, nav, graduate ─────────
await run("home-en", "/en", { width: 1440, height: 900 }, {
  extras: async (page, { name, maxScroll }) => {
    // 1) Accordion (FAQ) changes height → path rebuilt
    const lastD = () => { const all = document.querySelectorAll(".grad-trail__base"); return all[all.length - 1]?.getAttribute("d"); };
    const dBefore = await page.evaluate(lastD);
    const hBefore = await page.evaluate(() => document.documentElement.scrollHeight);
    const trig = page.locator("[data-orientation] h3 button[data-state=closed], [data-orientation] button[aria-expanded=false]").first();
    if (await trig.count()) {
      await trig.scrollIntoViewIfNeeded();
      await trig.click();
      await page.waitForTimeout(700);
      const dAfter = await page.evaluate(lastD);
      const hAfter = await page.evaluate(() => document.documentElement.scrollHeight);
      log("accordion:", { hBefore, hAfter, pathChanged: dBefore !== dAfter });
      if (hAfter !== hBefore && dBefore === dAfter) issues.push(`[${name}] accordion changed height but path did not rebuild`);
      const layerH = await page.evaluate(() => document.querySelector(".grad-trail").getBoundingClientRect().height);
      if (Math.abs(layerH - hAfter) > 2) issues.push(`[${name}] layer height ${layerH} != doc ${hAfter} after accordion`);
    }

    // 2) ⌘K dialog (scroll lock) → scrollY unchanged, hat stays put
    await scrollTo(page, maxScroll * 0.5);
    const before = await hatInfo(page);
    await page.keyboard.press("Meta+K");
    await page.waitForTimeout(500);
    const locked = await page.evaluate(() => document.body.hasAttribute("data-scroll-locked"));
    const during = await hatInfo(page);
    await page.screenshot({ path: `${out}/${name}-dialog-open.png` });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    const after = await hatInfo(page);
    log("dialog:", { locked, scrollBefore: Math.round(before.scrollY), scrollDuring: Math.round(during.scrollY), scrollAfter: Math.round(after.scrollY), hatBefore: Math.round(before.hat.cy), hatDuring: Math.round(during.hat.cy), hatAfter: Math.round(after.hat.cy), xBefore: Math.round(before.hat.cx), xDuring: Math.round(during.hat.cx), xAfter: Math.round(after.hat.cx) });
    if (Math.abs(before.scrollY - after.scrollY) > 1) issues.push(`[${name}] scroll moved across dialog open/close`);
    if (Math.abs(before.hat.cy - after.hat.cy) > 2 || Math.abs(before.hat.cx - after.hat.cx) > 2) issues.push(`[${name}] hat moved across dialog open/close`);
    if (Math.abs(before.hat.cy - during.hat.cy) > 2) issues.push(`[${name}] hat jumped while dialog open`);

    // 3) Client navigation via header link → hat snaps to start, scroll is 0 instantly
    await page.locator("header nav a", { hasText: /Rankings/i }).first().click();
    await page.waitForURL(/\/en\/rankings/, { timeout: 30000 });
    await page.waitForTimeout(120);
    const navEarly = await hatInfo(page);
    await page.waitForTimeout(1200);
    const navLate = await hatInfo(page);
    log("nav→rankings:", { scrollEarly: Math.round(navEarly.scrollY), scrollLate: Math.round(navLate.scrollY), hatEarly: navEarly.hat && Math.round(navEarly.hat.cy), hatLate: navLate.hat && Math.round(navLate.hat.cy), docH: navLate.docH, layerH: navLate.layerRect?.h });
    if (navLate.scrollY !== 0) issues.push(`[${name}] scroll not at 0 after navigation: ${navLate.scrollY}`);
    if (navLate.layerRect && Math.abs(navLate.layerRect.h - navLate.docH) > 2) issues.push(`[${name}] layer height stale after nav`);
    await page.screenshot({ path: `${out}/${name}-after-nav.png` });

    // 4) Graduate: scroll to bottom, click, expect scroll → 0 and pose toggle
    const docH = await page.evaluate(() => document.documentElement.scrollHeight);
    await scrollTo(page, docH);
    await page.waitForTimeout(500);
    const btn = page.locator("[data-grad-button]");
    await btn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${name}-before-graduate.png` });
    const start = await hatInfo(page);
    await btn.click();
    await page.waitForTimeout(90);
    const t1 = await hatInfo(page);
    await page.screenshot({ path: `${out}/${name}-throw-1.png` });
    await page.waitForTimeout(350);
    const t2 = await hatInfo(page);
    await page.screenshot({ path: `${out}/${name}-throw-2.png` });
    // poll until scroll 0
    let done = false; let waited = 0;
    while (waited < 3000) { await page.waitForTimeout(100); waited += 100; const y = await page.evaluate(() => window.scrollY); if (y === 0) { done = true; break; } }
    await page.waitForTimeout(900);
    const end = await hatInfo(page);
    await page.screenshot({ path: `${out}/${name}-after-graduate.png` });
    log("graduate:", { startScroll: Math.round(start.scrollY), poseStart: start.pose, poseT1: t1.pose, poseEnd: end.pose, scrollT1: Math.round(t1.scrollY), scrollT2: Math.round(t2.scrollY), reachedTop: done, waitedMs: waited, hatEnd: end.hat && { cx: Math.round(end.hat.cx), cy: Math.round(end.hat.cy) }, scrollBehaviorInline: await page.evaluate(() => document.documentElement.style.scrollBehavior) });
    if (!done) issues.push(`[${name}] graduate did not reach top within 3s`);
    if (t1.pose !== "after") issues.push(`[${name}] pose did not switch to after on throw`);
    if (end.pose !== "before") issues.push(`[${name}] pose did not reset to before`);
    if (await page.evaluate(() => document.documentElement.style.scrollBehavior) !== "") issues.push(`[${name}] scroll-behavior inline style not restored`);
    if (end.hat && (end.hat.cy < 0 || end.hat.cy > 900)) issues.push(`[${name}] hat not in viewport after graduate`);

    // 5) Graduate interrupted by a wheel event → tween cancels, scroll stays mid-way
    await scrollTo(page, docH);
    await btn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await btn.click();
    await page.waitForTimeout(250);
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(900);
    const mid = await hatInfo(page);
    log("graduate-interrupt:", { scrollAfterWheel: Math.round(mid.scrollY), docH });
    if (mid.scrollY === 0) issues.push(`[${name}] wheel did not cancel the graduate tween`);
    if (await page.evaluate(() => document.documentElement.style.scrollBehavior) !== "") issues.push(`[${name}] scroll-behavior not restored after cancel`);
  },
});

// ───────── Mobile RTL home (fa) ─────────
await run("home-fa-mobile", "/", { width: 390, height: 844 }, {
  extras: async (page, { name, maxScroll }) => {
    // mobile menu open/close
    await scrollTo(page, maxScroll * 0.4);
    await page.waitForTimeout(900);
    const before = await hatInfo(page);
    await page.locator("header button[aria-label]").last().click(); // menu button (last icon button)
    await page.waitForTimeout(500);
    const locked = await page.evaluate(() => document.body.hasAttribute("data-scroll-locked"));
    await page.screenshot({ path: `${out}/${name}-menu-open.png` });
    const during = await hatInfo(page);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1200);
    const after = await hatInfo(page);
    if (before.hat && during.hat && (Math.abs(before.hat.cy - during.hat.cy) > 1 || Math.abs(before.hat.cx - during.hat.cx) > 1)) issues.push(`[${name}] hat moved while mobile menu open`);
    log("mobile-menu:", { locked, scrollBefore: Math.round(before.scrollY), scrollAfter: Math.round(after.scrollY), hatBefore: before.hat && Math.round(before.hat.cy), hatAfter: after.hat && Math.round(after.hat.cy) });
    if (Math.abs(before.scrollY - after.scrollY) > 1) issues.push(`[${name}] scroll moved across mobile menu`);
    if (before.hat && after.hat && (Math.abs(before.hat.cy - after.hat.cy) > 2 || Math.abs(before.hat.cx - after.hat.cx) > 2)) issues.push(`[${name}] hat moved across mobile menu`);
    // graduate on mobile
    const docH = await page.evaluate(() => document.documentElement.scrollHeight);
    await scrollTo(page, docH);
    const btn = page.locator("[data-grad-button]");
    await btn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await btn.tap().catch(() => btn.click());
    let done = false; let waited = 0;
    while (waited < 3000) { await page.waitForTimeout(100); waited += 100; const y = await page.evaluate(() => window.scrollY); if (y === 0) { done = true; break; } }
    log("mobile graduate:", { reachedTop: done, waitedMs: waited });
    if (!done) issues.push(`[${name}] mobile graduate did not reach top`);
  },
});

// ───────── Desktop RTL home (fa) ─────────
await run("home-fa", "/", { width: 1440, height: 900 });
// ───────── A short page (privacy) ─────────
await run("privacy-en", "/en/privacy", { width: 1440, height: 900 });
// ───────── University detail (tabs, sticky) ─────────
await run("uni-en", "/en/universities/koc-university", { width: 1440, height: 900 });
// ───────── Reduced motion ─────────
await run("home-en-reduced", "/en", { width: 1440, height: 900 }, { reduced: true });

await browser.close();
log("\n==== ISSUES (" + issues.length + ") ====");
for (const i of issues) log(" -", i);
fs.writeFileSync(`${out}/issues.json`, JSON.stringify(issues, null, 2));
process.exit(issues.length ? 1 : 0);
