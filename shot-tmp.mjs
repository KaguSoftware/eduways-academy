import { chromium, devices } from 'playwright';
const out = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices['iPhone 12'] });
const p = await ctx.newPage();

// 1. Home stories section
await p.goto('http://localhost:3000/en', { waitUntil: 'networkidle' });
const h = await p.evaluate(() => {
  const de = document.documentElement;
  return { scrollW: de.scrollWidth, clientW: de.clientWidth };
});
console.log('home overflow:', JSON.stringify(h));
// find offenders
const off = await p.evaluate(() => {
  const w = document.documentElement.clientWidth;
  const bad = [];
  document.querySelectorAll('*').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && (r.right > w + 1)) {
      bad.push({ tag: el.tagName, cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || '').toString().slice(0,120), right: Math.round(r.right), w: Math.round(r.width) });
    }
  });
  return bad.slice(0, 40);
});
console.log('offenders:', JSON.stringify(off, null, 1));

const stories = p.locator('section', { has: p.locator('h2:has-text("Students who made it")') }).first();
await stories.scrollIntoViewIfNeeded();
await p.waitForTimeout(900);
await stories.screenshot({ path: out + '/home-stories.png' });
await p.screenshot({ path: out + '/home-stories-vp.png' });

// 2. Stories page EN
await p.goto('http://localhost:3000/en/stories', { waitUntil: 'networkidle' });
await p.waitForTimeout(800);
await p.screenshot({ path: out + '/stories-en.png', fullPage: true });
await p.goto('http://localhost:3000/fa/stories', { waitUntil: 'networkidle' });
await p.waitForTimeout(800);
await p.screenshot({ path: out + '/stories-fa.png', fullPage: true });

await b.close();
