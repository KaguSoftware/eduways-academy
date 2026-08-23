import { chromium, devices } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices['iPhone 12'] });
const p = await ctx.newPage();
await p.goto('http://localhost:3000/en', { waitUntil: 'networkidle' });
const r = await p.evaluate(() => {
  const h2 = [...document.querySelectorAll('h2')].find(e => e.textContent.includes('Students who made it'));
  const sec = h2.closest('section');
  const out = [];
  let el = h2;
  // walk up
  const chain = [];
  let cur = h2;
  while (cur && cur !== document.body) { chain.push(cur); cur = cur.parentElement; }
  chain.reverse();
  for (const c of chain) {
    const rc = c.getBoundingClientRect();
    out.push({ tag: c.tagName, cls: (c.className||'').toString().slice(0,80), left: Math.round(rc.left), right: Math.round(rc.right), w: Math.round(rc.width), sw: c.scrollWidth });
  }
  // cards
  const cards = [...sec.querySelectorAll('a[href*="/stories/"]')].map(a => { const rc=a.getBoundingClientRect(); return {left:Math.round(rc.left),right:Math.round(rc.right),w:Math.round(rc.width)}; });
  const grid = sec.querySelector('.grid');
  const gr = grid.getBoundingClientRect();
  return { chain: out, cards, grid: {left:Math.round(gr.left), right:Math.round(gr.right), w:Math.round(gr.width), sw: grid.scrollWidth}, secW: sec.getBoundingClientRect().width, secSW: sec.scrollWidth, vw: document.documentElement.clientWidth };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
