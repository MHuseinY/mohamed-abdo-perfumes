const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const c = await b.newContext({ viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true });
  for (const f of ['index','ar']) {
    const p = await c.newPage();
    await p.goto(`http://localhost:4500/site/${f}.html`, {waitUntil:'networkidle'}); await p.waitForTimeout(600);
    for (const y of [0, 60, 200, 400]) {
      await p.evaluate(y=>scrollTo(0,y), y); await p.waitForTimeout(500);
      const r = await p.evaluate(()=>{ const e=document.querySelector('.hero .btn'); const r=e.getBoundingClientRect();
        const x=r.left+r.width/2, y=r.top+r.height/2; const hit=document.elementFromPoint(x,y);
        return {btnTop:Math.round(r.top), btnBottom:Math.round(r.bottom), hit: hit.tagName+'.'+hit.className+' '+(hit.closest('a')===e?'(the button)':'(NOT the button)'),
          copyOpacity:getComputedStyle(document.querySelector('.hero-copy')).opacity, copyPE:getComputedStyle(document.querySelector('.hero-copy')).pointerEvents }; });
      console.log(f, y, JSON.stringify(r));
    }
    await p.close();
  }
  await b.close();
})();
