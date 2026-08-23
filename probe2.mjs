import { chromium, devices } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices['iPhone 12'] });
const p = await ctx.newPage();
await p.goto('http://localhost:3000/en', { waitUntil: 'networkidle' });
const r = await p.evaluate(() => {
  const h2 = [...document.querySelectorAll('h2')].find(e => e.textContent.includes('Students who made it'));
  const sec = h2.closest('section');
  const card = sec.querySelector('a[href*="/stories/"]');
  const walk = (el, d=0, acc=[]) => {
    const rc = el.getBoundingClientRect();
    acc.push({ d, tag: el.tagName, cls:(el.className||'').toString().slice(0,60), left:Math.round(rc.left), right:Math.round(rc.right), w:Math.round(rc.width), txt: (el.textContent||'').slice(0,30) });
    if (d < 4) [...el.children].forEach(c => walk(c, d+1, acc));
    return acc;
  };
  return walk(card.parentElement);
});
console.log(r.map(x=>'  '.repeat(x.d)+`${x.tag} w=${x.w} L=${x.left} R=${x.right} [${x.cls}] "${x.txt}"`).join('\n'));
await b.close();
