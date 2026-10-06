// The real constraints: the whole site inside a sandboxed iframe (like the artifact viewer), phone size.
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const c = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await c.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + String(e).slice(0, 160)));
  p.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errs.push(r.status() + ' ' + r.url()); });
  await p.goto('http://localhost:4500/review/out/preview/sandbox.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
  const shell = () => p.frames().find(f => f.url().includes('/preview/index.html'));
  const home = k => p.frames().find(f => f !== p.mainFrame() && f !== shell() && f.parentFrame() === shell() && (k === 'ar' ? f.name() === '' && false : true));
  const state = async (label) => {
    await p.waitForTimeout(1000);
    const s = await shell().evaluate(() => ({ hash: location.hash, onHome: document.documentElement.classList.contains('on-home'),
      frames: [...document.querySelectorAll('.home-frame')].map(f => f.id + (f.classList.contains('is-on') ? '*' : '')).join(','), view: (() => { const v = [...document.querySelectorAll('.view')].find(x => !x.hidden); return v ? v.dataset.view : '-'; })(), title: document.title }));
    console.log(label.padEnd(42), JSON.stringify(s), '| shell url:', shell().url().replace('http://localhost:4500', ''));
  };
  const active = async () => { const id = await shell().evaluate(() => (document.querySelector('.home-frame.is-on') || {}).id); return shell().childFrames().find(async () => true) && p.frames().filter(f => f.parentFrame() === shell()).find(f => true) ? id : id; };
  const homeFrame = async (id) => { const h = await shell().$('#' + id); return h.contentFrame(); };
  await state('start (default route)');
  let f = await homeFrame('home-home'); console.log('EN home inside iframe: hero', await f.evaluate(() => !!document.querySelector('.hero')), '| lang', await f.evaluate(() => document.documentElement.lang), '| video ready', await f.evaluate(() => document.querySelector('.hero').classList.contains('sc-has-clip')));
  await f.locator('.dock__item').nth(0).tap(); await state('EN dock > Atelier');
  await shell().locator('.dock__more').tap(); await p.waitForTimeout(400); await shell().locator('#menu .lang a').tap(); await state('Pages menu > العربية');
  f = await homeFrame('home-ar'); console.log('AR home inside iframe: dir', await f.evaluate(() => document.documentElement.dir), '| video ready', await f.evaluate(() => document.querySelector('.hero').classList.contains('sc-has-clip')));
  await f.locator('.dock__item').nth(2).tap(); await state('AR dock > Boutique');
  await shell().locator('.card').first().tap(); await state('Boutique > first product');
  await shell().locator('.dock__more').tap(); await p.waitForTimeout(400); await shell().locator('#menu .menu-links a').first().tap(); await state('Pages menu > Home');
  f = await homeFrame('home-home'); await f.locator('.dock__more').tap(); await p.waitForTimeout(500); await f.locator('#menu .lang a').tap(); await state('EN menu > العربية');
  f = await homeFrame('home-ar'); await f.locator('.dock__more').tap(); await p.waitForTimeout(500); await f.locator('#menu .lang a').tap(); await state('AR menu > EN');
  f = await homeFrame('home-home'); await f.locator('.dock__more').tap(); await p.waitForTimeout(500); await f.locator('#menu a', { hasText: 'Mohamed Abdo' }).tap(); await state('EN menu > Mohamed Abdo');
  await p.evaluate(() => document.getElementById('f').contentWindow.history.back()); await state('browser back');
  console.log('errors:', errs.length ? errs : 'none'); await b.close();
})();
