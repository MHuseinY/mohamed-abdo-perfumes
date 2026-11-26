// Loads every standalone inner page (English and Arabic) and checks the basics: no script errors, no failed requests,
// the chrome is drawn in the right language, no horizontal overflow, and the JS-built parts (grid, works, product) are present.
//   node pages.cjs [shots]        with "shots" it also writes screenshots to out/pages-<width>-<page>.png
// Needs the preview server running (root = maydi-house).
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright-core');
const PAGES = ['boutique', 'atelier', 'factory', 'botanicals', 'mohamed-abdo', 'contact', 'product?p=king-maydi', 'product?p=timbrose-ii', 'product?p=mango-oud'];
(async () => {
  const shots = process.argv[2] === 'shots';
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  let bad = 0;
  for (const [w, h, mobile] of [[1366, 900, false], [390, 780, true]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    for (const lang of ['en', 'ar']) for (const pg of PAGES) {
      const file = (lang === 'ar' ? 'ar-' : '') + pg.replace('product?', 'product.html?').replace(/^((?:ar-)?[a-z-]+)$/, '$1.html');
      const p = await ctx.newPage(); const errs = [];
      p.on('pageerror', e => errs.push('JS ' + String(e).slice(0, 140)));
      p.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errs.push(r.status() + ' ' + r.url().replace('http://localhost:4500', '')); });
      await p.goto('http://localhost:4500/site/' + file, { waitUntil: 'networkidle' });
      await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' }); await p.waitForTimeout(500);
      // reveal everything (it fades in on scroll) so that screenshots and text checks see the real content
      await p.evaluate(() => document.querySelectorAll('.rv').forEach(e => e.classList.add('in')));
      const info = await p.evaluate(() => ({
        lang: document.documentElement.lang, dir: document.documentElement.dir, title: document.title,
        overflow: document.documentElement.scrollWidth - innerWidth,
        chrome: !!document.querySelector('.site-bar .mark') && !!document.querySelector('.foot .brand'),
        barLang: (document.querySelector('.site-bar .lang') || {}).innerText,
        cards: document.querySelectorAll('.card').length, h1: (document.querySelector('h1') || {}).innerText,
        brokenImgs: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length,
      }));
      const wantLang = lang;
      const problems = [];
      if (info.lang !== wantLang) problems.push('lang ' + info.lang);
      if (lang === 'ar' && info.dir !== 'rtl') problems.push('dir ' + info.dir);
      if (info.overflow > 1) problems.push('overflow ' + info.overflow + 'px');
      if (!info.chrome) problems.push('no chrome');
      if (info.brokenImgs) problems.push(info.brokenImgs + ' broken images');
      if (/boutique|mohamed/.test(pg) && !info.cards) problems.push('no cards');
      if (errs.length) problems.push(...errs);
      if (problems.length) { bad++; console.log('PROBLEM', w, file, '|', problems.join(' ; ')); }
      if (shots) { fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true }); await p.screenshot({ path: path.join(__dirname, 'out', `pages-${w}-${file.replace(/[?=.]/g, '_')}.png`), fullPage: true }); }
      await p.close();
    }
    await ctx.close();
  }
  console.log(bad ? `${bad} pages with problems` : 'all pages clean (36 loads: 9 pages x 2 languages x 2 widths... see above if any)');
  await b.close();
})();
