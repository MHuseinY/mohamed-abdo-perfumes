// Desktop: the top bar of every part of the site, inside the sandboxed frame (needs the preview server).
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const c = await b.newContext({ viewport: { width: 1366, height: 820 } });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  await p.goto('http://localhost:4500/review/out/preview/sandbox.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
  const shell = () => p.frames().find(f => f.url().includes('/preview/index.html'));
  const hf = async id => (await shell().$('#' + id)).contentFrame();
  const hash = async () => { await p.waitForTimeout(900); return shell().evaluate(() => location.hash || '(none)'); };
  let fails = 0;
  const check = (label, got, want) => { const ok = got === want; if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + label + '  ->  ' + got + (ok ? '' : '   (wanted ' + want + ')')); };

  let f = await hf('home-home');
  await f.locator('.site-bar nav a', { hasText: 'Boutique' }).click(); check('EN homepage bar: Boutique', await hash(), '#boutique');
  await shell().locator('.site-bar .lang a').click(); check('English Boutique bar: العربية', await hash(), '#ar-boutique');
  await shell().locator('.site-bar nav a', { hasText: 'المواد الخام' }).click(); check('Arabic Boutique bar: المواد الخام', await hash(), '#ar-botanicals');
  await shell().locator('.site-bar .lang a').click(); check('Arabic Botanicals bar: EN', await hash(), '#botanicals');
  await shell().locator('.site-bar nav a', { hasText: 'Atelier' }).click(); check('English bar: Atelier', await hash(), '#atelier');
  await shell().locator('.site-bar .mark').click(); check('English bar: the mark goes home', await hash(), '#home');
  f = await hf('home-home'); await f.locator('.site-bar .lang a').click(); check('EN homepage bar: العربية', await hash(), '#ar');
  f = await hf('home-ar'); await f.locator('.site-bar nav a', { hasText: 'البوتيك' }).click(); check('AR homepage bar: البوتيك', await hash(), '#ar-boutique');
  await shell().locator('.site-bar .mark').click(); check('Arabic bar: the mark goes to the Arabic homepage', await hash(), '#ar');
  check('no script errors', errs.length ? errs.join(' | ') : 'none', 'none');
  console.log(fails ? `${fails} FAILED` : 'all desktop navigation checks passed');
  await b.close(); process.exit(fails ? 1 : 0);
})();
