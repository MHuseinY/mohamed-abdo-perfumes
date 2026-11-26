const { chromium } = require('playwright-core');
const [,, page, w, h, tag] = process.argv;
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const mobile = +w < 600;
  const c = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  const p = await c.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  p.on('requestfailed', r => errs.push('FAILED ' + r.url()));
  await p.goto(`http://localhost:4500/site/${page}.html`, { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await p.waitForTimeout(1500);
  const info = await p.evaluate(() => { const s = document.querySelector('.hero'); const v = document.querySelector('.hero video');
    return { top: s.offsetTop, height: s.offsetHeight, vh: innerHeight, src: v.currentSrc.slice(-40), dur: v.duration, ready: s.classList.contains('sc-has-clip') }; });
  console.log(JSON.stringify(info));
  const travel = info.height - info.vh;
  for (const q of (process.argv[6] ? process.argv[6].split(",").map(Number) : [0, .1, .25, .4, .5, .58, .7, .85, 1])) {
    await p.evaluate(y => scrollTo(0, y), q * travel); await p.waitForTimeout(1300);
    const r = await p.evaluate(() => { const v = document.querySelector('.hero video'), s = document.querySelector('.hero');
      return { t: +v.currentTime.toFixed(2), g: getComputedStyle(v).filter.slice(0, 22), p: s.style.getPropertyValue('--sc-p') }; });
    console.log('p', q, JSON.stringify(r));
    await p.screenshot({ path: `./out/hv-${tag}-${String(Math.round(q*100)).padStart(3,'0')}.png` });
  }
  console.log('errors', errs); await b.close();
})();
