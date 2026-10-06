// The Arabic inner pages inside the single document, on a phone, in the sandboxed frame the artifact viewer uses:
// the dock and menu in Arabic, the language switch keeping you on the same page, filters, products, the prefilled enquiry.
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
  const st = async () => shell().evaluate(() => {
    const v = [...document.querySelectorAll('.view')].find(x => !x.hidden);
    return { hash: location.hash, lang: document.documentElement.lang, dir: document.documentElement.dir, onHome: document.documentElement.classList.contains('on-home'),
      view: v ? v.dataset.view : '-', title: document.title,
      dock: [...document.querySelectorAll('.dock__item span')].map(s => s.textContent).join('/'), cards: document.querySelectorAll('.view:not([hidden]) .card').length,
      here: [...document.querySelectorAll('.dock__item')].findIndex(a => a.hasAttribute('aria-current')) };
  });
  const settle = () => p.waitForTimeout(900);
  const homeFrame = async id => (await shell().$('#' + id)).contentFrame();
  const openMenu = async () => { await shell().locator('.dock__more').tap(); await p.waitForTimeout(450); };

  // 1. from the Arabic homepage, the dock opens the Arabic pages
  await shell().evaluate(() => { location.hash = '#ar'; }); await settle();
  let f = await homeFrame('home-ar'); await f.locator('.dock__item').nth(2).tap(); await settle();
  let s = await st();
  check('AR home dock > البوتيك opens the Arabic Boutique', s.hash === '#ar-boutique' && s.view === 'ar-boutique' && s.lang === 'ar' && s.dir === 'rtl', JSON.stringify(s));
  check('the dock is in Arabic and marks Boutique', s.dock === 'التصميم/التصنيع/البوتيك/المواد الخام' && s.here === 2, s.dock + ' here=' + s.here);
  check('the Arabic shelf is drawn (20 cards)', s.cards === 20, 'cards=' + s.cards);
  check('the page title is Arabic', /بوتيك/.test(s.title), s.title);
  // 2. the filter and its Arabic count
  await shell().locator('#filters button', { hasText: 'أتّار' }).first().evaluate(b => b.closest('.view').querySelector('#filters button[data-f="attar"]').click()); await settle();
  const cnt = await shell().evaluate(() => document.querySelector('.view:not([hidden]) #count').textContent);
  check('filter "attar" gives one fragrance, in Arabic', cnt === 'عطر واحد', cnt);
  // 3. a product page in Arabic
  await shell().evaluate(() => { location.hash = '#ar-p-king-maydi'; }); await settle();
  s = await st();
  const pdp = await shell().evaluate(() => { const v = document.querySelector('.view:not([hidden])'); return { h1: v.querySelector('h1').innerText, story: v.querySelector('.story').innerText, tier: v.querySelector('.pyramid .tier p').innerText, buy: [...v.querySelectorAll('.buy .btn')].map(b => b.innerText), crumbs: v.querySelector('.crumbs').innerText }; });
  check('Arabic product page', s.view === 'ar-product' && /أربعة أنواع من اللبان/.test(pdp.story) && /لبان/.test(pdp.tier) && pdp.buy[0] === 'أضف إلى السلة', JSON.stringify(pdp));
  check('the product belongs to Boutique in the dock', s.here === 2);
  // 4. the language switch stays on the same product
  await openMenu(); await shell().locator('#menu .lang a').tap(); await settle(); s = await st();
  check('switch to English keeps the product', s.hash === '#p-king-maydi' && s.lang === 'en' && s.dir === 'ltr' && s.dock === 'Atelier/Factory/Boutique/Botanicals', JSON.stringify(s));
  await openMenu(); await shell().locator('#menu .lang a').tap(); await settle(); s = await st();
  check('and back to Arabic', s.hash === '#ar-p-king-maydi' && s.lang === 'ar', s.hash);
  // 5. ordering through the house: the enquiry is prefilled in Arabic
  await shell().locator('.view:not([hidden]) .buy .btn--ghost').tap(); await settle(); s = await st();
  const form = await shell().evaluate(() => { const v = document.querySelector('.view:not([hidden])'); return { topic: v.querySelector('#f-topic').value, msg: v.querySelector('#f-message').value }; });
  check('"اطلب عبر الدار" opens the Arabic enquiry, prefilled', s.hash === '#ar-contact.order.king-maydi' && form.topic === 'order' && /أرغب في طلب King Maydi/.test(form.msg), s.hash + ' | ' + form.msg.trim());
  // 6. the atelier formula request uses the formula wording; the in-page anchor works inside the Arabic page
  await shell().evaluate(() => { location.hash = '#ar-contact.atelier.timbrose'; }); await settle();
  const msg2 = await shell().evaluate(() => document.querySelector('.view:not([hidden]) #f-message').value);
  check('formula request wording in Arabic', /أرغب في التركيبة الجاهزة Timbrose/.test(msg2), msg2.trim());
  await shell().evaluate(() => { location.hash = '#ar-atelier'; }); await settle();
  await shell().locator('.view:not([hidden]) a[href="#ar-formulas"]').first().tap(); await settle();
  const anchorOk = await shell().evaluate(() => { const e = document.getElementById('ar-formulas'); const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; });
  check('the Arabic atelier anchor scrolls to its section', anchorOk && (await st()).hash === '#ar-formulas');
  // 7. home links
  await shell().evaluate(() => { location.hash = '#ar-factory'; }); await settle();
  await openMenu(); await shell().locator('#menu .menu-links a').first().tap(); await settle(); s = await st();
  check('menu "الرئيسية" opens the Arabic homepage', s.hash === '#ar' && s.onHome && s.lang === 'ar', JSON.stringify(s));
  await shell().evaluate(() => { location.hash = '#mohamed-abdo'; }); await settle();
  await openMenu(); await shell().locator('#menu .lang a').tap(); await settle(); s = await st();
  check('English founder page > العربية opens the Arabic founder page', s.hash === '#ar-mohamed-abdo' && s.view === 'ar-mohamed-abdo', s.hash);
  const works = await shell().evaluate(() => document.querySelectorAll('.view:not([hidden]) #works .card').length);
  check('the founder page shows his two perfumes', works === 2, 'cards=' + works);
  check('no script errors, no failed requests', errs.length === 0, errs.join(' | '));
  console.log(fails ? `${fails} FAILED` : 'all Arabic navigation checks passed');
  await b.close(); process.exit(fails ? 1 : 0);
})();
