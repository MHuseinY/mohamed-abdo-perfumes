const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const c = await b.newContext({ viewport: { width: 1366, height: 820 } });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  await p.goto('http://localhost:4500/review/out/preview/sandbox.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
  const shell = () => p.frames().find(f => f.url().includes('/preview/index.html'));
  const hf = async id => (await shell().$('#' + id)).contentFrame();
  const hash = async () => shell().evaluate(() => location.hash || '(none)');
  let f = await hf('home-home');
  await p.screenshot({ path: './out/one-en-d.png' });
  await f.locator('.site-bar nav a', { hasText: 'Boutique' }).click(); await p.waitForTimeout(900); console.log('EN bar Boutique ->', await hash());
  await shell().locator('.site-bar .lang a').click(); await p.waitForTimeout(1200); console.log('pages bar العربية ->', await hash());
  f = await hf('home-ar'); await p.screenshot({ path: './out/one-ar-d.png' });
  await f.locator('.site-bar nav a', { hasText: 'المواد الخام' }).click(); await p.waitForTimeout(900); console.log('AR bar المواد الخام ->', await hash());
  await shell().locator('.site-bar nav a', { hasText: 'Atelier' }).click(); await p.waitForTimeout(700); console.log('pages bar Atelier ->', await hash());
  console.log('errors:', errs.length ? errs : 'none'); await b.close();
})();
