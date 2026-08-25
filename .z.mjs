import { webkit, chromium, devices } from 'playwright';
const out=[];
for (const [eN,eng] of [['WebKit',webkit],['Chromium',chromium]]) {
  const b = await eng.launch();
  for (const [loc,url] of [['EN','http://192.168.1.106:3000/en'],['FA','http://192.168.1.106:3000/fa']]) {
    for (const js of [true,false]) {
      const c = await b.newContext({ ...devices['iPhone 13'], javaScriptEnabled:js });
      const p = await c.newPage();
      const errs=[]; if(js) p.on('pageerror',()=>errs.push(1));
      await p.goto(url,{waitUntil: js?'networkidle':'domcontentloaded'});
      await p.waitForTimeout(js?1500:900);
      await p.locator('label[for="mobile-menu-toggle"]').tap(); await p.waitForTimeout(1200);
      const h=await p.evaluate(()=>Math.round(document.getElementById('mobile-menu').getBoundingClientRect().height));
      const n=await p.locator('#mobile-menu nav a').count();
      const t=await p.locator('#mobile-menu nav a').first().getAttribute('href');
      let path='(fail)';
      try{ await p.locator('#mobile-menu nav a').first().tap({timeout:10000});
           await p.waitForTimeout(js?2400:2900); path=new URL(p.url()).pathname; }catch{}
      out.push(`${eN.padEnd(8)} ${loc} js${js?'ON ':'OFF'}: h=${h} links=${n} ${path===t?'✓ NAV':'✗ '+path} errs=${errs.length}`);
      await c.close();
    }
  }
  await b.close();
}
console.log(out.join('\n'));
