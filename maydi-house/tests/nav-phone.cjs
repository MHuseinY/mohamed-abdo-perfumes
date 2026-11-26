// The whole site in one document, on a phone, inside the sandboxed frame the artifact viewer uses (needs the preview server).
// English homepage, Arabic homepage and the inner pages: every hop is a hash change, the language switch keeps you on the same page.
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const c = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await c.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + String(e).slice(0, 160)));
  p.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errs.push(r.status() + ' ' + r.url()); });
  await p.goto('http://localhost:4500/review/out/preview/sandbox.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
  const shell = () => p.frames().find(f => f.url().includes('/preview/index.html'));
  let fails = 0;
  const check = (label, ok, extra) => { if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + label + (extra ? '  ' + extra : '')); };
  const state = async () => { await p.waitForTimeout(1000); return shell().evaluate(() => ({ hash: location.hash || '(none)', onHome: document.documentElement.classList.contains('on-home'),
    frame: (document.querySelector('.home-frame.is-on') || {}).id || '-', view: (() => { const v = [...document.querySelectorAll('.view')].find(x => !x.hidden); return v ? v.dataset.view : '-'; })(), lang: document.documentElement.lang })); };
  const frameOf = async id => (await shell().$('#' + id)).contentFrame();
  const heroReady = async id => (await frameOf(id)).evaluate(() => document.querySelector('.hero').classList.contains('sc-has-clip'));
  const menu = async fr => { await fr.locator('.dock__more').tap(); await p.waitForTimeout(500); };

  let s = await state();
  check('starts on the English homepage', s.onHome && s.frame === 'home-home', JSON.stringify(s));
  check('its hero film is ready', await heroReady('home-home'));
  await (await frameOf('home-home')).locator('.dock__item').nth(0).tap(); s = await state();
  check('EN dock > Atelier', s.hash === '#atelier' && s.view === 'atelier' && !s.onHome, JSON.stringify(s));
  await menu(shell()); await shell().locator('#menu .lang a').tap(); s = await state();
  check('menu > العربية stays on the same page (Arabic Atelier)', s.hash === '#ar-atelier' && s.view === 'ar-atelier' && s.lang === 'ar', JSON.stringify(s));
  await menu(shell()); await shell().locator('#menu .menu-links a').first().tap(); s = await state();
  check('Arabic menu > الرئيسية opens the Arabic homepage', s.hash === '#ar' && s.onHome && s.frame === 'home-ar', JSON.stringify(s));
  check('its hero film is ready', await heroReady('home-ar'));
  await (await frameOf('home-ar')).locator('.dock__item').nth(2).tap(); s = await state();
  check('AR home dock > البوتيك opens the Arabic Boutique', s.hash === '#ar-boutique' && s.view === 'ar-boutique', JSON.stringify(s));
  await menu(shell()); await shell().locator('#menu .lang a').tap(); s = await state();
  check('menu > EN stays on the same page (English Boutique)', s.hash === '#boutique' && s.lang === 'en', JSON.stringify(s));
  await shell().locator('.card').first().tap(); s = await state();
  check('Boutique > first product', /^#p-/.test(s.hash) && s.view === 'product', JSON.stringify(s));
  await menu(shell()); await shell().locator('#menu .menu-links a').first().tap(); s = await state();
  check('menu > Home opens the English homepage', s.hash === '#home' && s.onHome && s.frame === 'home-home', JSON.stringify(s));
  let f = await frameOf('home-home'); await menu(f); await f.locator('#menu .lang a').tap(); s = await state();
  check('English homepage > العربية opens the Arabic homepage', s.hash === '#ar' && s.frame === 'home-ar', JSON.stringify(s));
  f = await frameOf('home-ar'); await menu(f); await f.locator('#menu .lang a').tap(); s = await state();
  check('Arabic homepage > EN opens the English homepage', s.hash === '#home' && s.frame === 'home-home', JSON.stringify(s));
  f = await frameOf('home-home'); await menu(f); await f.locator('#menu a', { hasText: 'Mohamed Abdo' }).tap(); s = await state();
  check('EN home menu > Mohamed Abdo', s.hash === '#mohamed-abdo' && s.view === 'mohamed-abdo', JSON.stringify(s));
  await p.evaluate(() => document.getElementById('f').contentWindow.history.back()); s = await state();
  check('browser back returns to the homepage', s.hash === '#home' && s.onHome, JSON.stringify(s));
  check('no script errors, no failed requests', errs.length === 0, errs.join(' | '));
  console.log(fails ? `${fails} FAILED` : 'all phone navigation checks passed');
  await b.close(); process.exit(fails ? 1 : 0);
})();
