// Every inner route of the single document, English and Arabic, at five widths: no horizontal overflow, no broken images,
// no element wider than the screen. With "shots" it also saves a screenshot of each route at 390 and 1366.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright-core');
const ROUTES = ['boutique', 'atelier', 'factory', 'botanicals', 'mohamed-abdo', 'contact', 'contact.order.king-maydi', 'p-king-maydi', 'p-timbrose-ii', 'p-mango-oud'];
(async () => {
  const shots = process.argv[2] === 'shots';
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  let bad = 0, n = 0;
  for (const w of [360, 390, 768, 1024, 1366]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: w < 600, hasTouch: w < 600, deviceScaleFactor: w < 600 ? 2 : 1 });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(String(e).slice(0, 120)));
    await p.goto('http://localhost:4500/review/out/preview/index.html#boutique', { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    for (const lang of ['', 'ar-']) for (const r of ROUTES) {
      await p.evaluate(h => { location.hash = '#' + h; }, lang + r); await p.waitForTimeout(450);
      await p.evaluate(() => document.querySelectorAll('.view:not([hidden]) .rv').forEach(e => e.classList.add('in')));
      // load the lazy images that are below the fold
      await p.evaluate(async () => { for (const i of document.querySelectorAll('.view:not([hidden]) img[loading="lazy"]')) { i.loading = 'eager'; } });
      await p.waitForTimeout(250);
      const info = await p.evaluate(() => {
        const view = document.querySelector('.view:not([hidden])'); const vw = innerWidth;
        const wide = [...view.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > vw + 1 || r.left < -1) && !e.closest('.table-wrap') && getComputedStyle(e).position !== 'fixed'; })
          .slice(0, 3).map(e => e.tagName + '.' + String(e.className).slice(0, 24));
        return { overflow: document.documentElement.scrollWidth - vw, wide, broken: [...view.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0).length };
      });
      n++;
      if (info.overflow > 1 || info.wide.length || info.broken) { bad++; console.log('PROBLEM', w, lang + r, JSON.stringify(info)); }
      if (shots && (w === 390 || w === 1366)) { fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true }); await p.screenshot({ path: path.join(__dirname, 'out', `shell-${w}-${(lang + r).replace(/[.]/g, '_')}.png`), fullPage: true }); }
    }
    if (errs.length) { bad++; console.log('SCRIPT ERRORS at', w, errs); }
    await ctx.close();
  }
  console.log(bad ? `${bad} problems in ${n} route views` : `all ${n} route views clean (10 routes x 2 languages x 5 widths)`);
  await b.close(); process.exit(bad ? 1 : 0);
})();
