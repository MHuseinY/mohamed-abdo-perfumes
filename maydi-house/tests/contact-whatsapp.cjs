// The enquiry form opens WhatsApp with the message written out; the data the house sent on 2026-10-07 shows on the pages.
// Runs against the review build in the shell itself (no sandbox, so window.open can be observed). Needs the preview server.
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  await p.addInitScript(() => { window.__opened = []; window.open = (u, t, f) => { window.__opened.push(u); return null; }; });
  await p.goto('http://localhost:4500/review/out/preview/index.html#boutique', { waitUntil: 'networkidle' });
  let fails = 0; const V = s => '.view:not([hidden]) ' + s;
  const check = (label, ok, extra) => { if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + label + (ok || !extra ? '' : '   ' + extra)); };
  const go = async h => { await p.evaluate(x => { location.hash = '#' + x; }, h); await p.waitForTimeout(500); };
  const view = () => p.evaluate(() => { const v = document.querySelector('.view:not([hidden])'); return v ? v.innerText.replace(/\s+/g, ' ') : ''; });

  // --- English enquiry about King Maydi
  await go('contact.order.king-maydi');
  await p.evaluate(() => { window.__opened.length = 0; });
  await p.click(V('#enquiry button[type=submit]'));
  check('empty name: asks for it, opens nothing', (await p.evaluate(() => __opened.length)) === 0 && /add your name/i.test(await p.textContent(V('#form-status'))));
  await p.fill(V('#f-name'), 'Amina Warsame'); await p.fill(V('#f-company'), 'Warsame Oud'); await p.fill(V('#f-country'), 'Kenya');
  await p.click(V('#enquiry button[type=submit]'));
  let urls = await p.evaluate(() => __opened.slice());
  check('submits to wa.me with the house number', urls.length === 1 && urls[0].startsWith('https://wa.me/252610161810?text='), JSON.stringify(urls));
  let txt = urls[0] ? decodeURIComponent(urls[0].split('?text=')[1]) : '';
  check('the text carries greeting, product, name, company, country, topic',
    /^Hello Maydi House,/.test(txt) && /I would like to order King Maydi/.test(txt) && /Name: Amina Warsame/.test(txt) && /Company or brand: Warsame Oud/.test(txt) && /Country: Kenya/.test(txt) && /Regarding: Maydi Boutique/.test(txt), JSON.stringify(txt));
  check('no empty Email line', !/Email:/.test(txt));
  const status = await p.evaluate(() => document.querySelector('.view:not([hidden]) #form-status').innerHTML);
  check('fallback links under the form: WhatsApp and email', /href="https:\/\/wa\.me\/252610161810\?text=/.test(status) && /href="mailto:maydihouse@gmail\.com\?subject=/.test(status), status.slice(0, 200));

  // --- Arabic enquiry
  await go('ar-contact.order.king-maydi');
  await p.evaluate(() => { window.__opened.length = 0; });
  await p.fill(V('#f-name'), 'أمينة'); await p.click(V('#enquiry button[type=submit]'));
  urls = await p.evaluate(() => __opened.slice());
  txt = urls[0] ? decodeURIComponent(urls[0].split('?text=')[1]) : '';
  check('Arabic text: greeting, product, name, topic', /^مرحباً مايدي هاوس،/.test(txt) && /أرغب في طلب King Maydi/.test(txt) && /الاسم: أمينة/.test(txt) && /بخصوص: /.test(txt), JSON.stringify(txt));

  // --- the number is on both contact pages and in every footer
  for (const r of ['contact', 'ar-contact', 'boutique', 'ar-factory', 'p-timbrose']) {
    await go(r);
    const n = await p.evaluate(() => [...document.querySelectorAll('a[href="https://wa.me/252610161810"]')].length);
    check('WhatsApp link on ' + r, n >= 1, 'found ' + n);
  }
  check('contact page shows the number', /\+252 610 161 810/.test(await (async () => { await go('contact'); return view(); })()));

  // --- price and notes
  await go('p-timbrose-ii'); let v = await view();
  check('Timbrose II shows $160 and "Price of the 30 ml bottle"', /\$160 Price of the 30 ml bottle/.test(v), v.slice(0, 300));
  check('no price on another product', !/\$\d/.test(await (async () => { await go('p-king-maydi'); return view(); })()));
  await go('p-timbrose'); v = await view();
  check('Timbrose I: the eight notes as one list', /Oud oil, Taif rose, Bulgarian rose, Moroccan rose, Violet, Geranium, Woods, Musks/.test(v), v.slice(-300));
  check('Timbrose I: no invented tiers', !/ Top | Heart | Base /.test(v.split('The notes')[1] ? v.split('The notes')[1].slice(0, 200) : ''));
  await go('ar-p-timbrose'); v = await view();
  check('Arabic Timbrose I: the notes as the house wrote them', /دهن عود، ورد طائفي، ورد بلغاري، ورد مغربي، البنفسج، جيرانيوم، أخشاب، أمساك/.test(v), v.slice(-300));
  await go('ar-p-timbrose-ii'); v = await view();
  check('Arabic Timbrose II: $160 and the size note', /\$160 سعر زجاجة 30 مل/.test(v), v.slice(0, 300));
  await go('ar-mohamed-abdo'); v = await view();
  check('the founder card in Arabic shows $160', /Timbrose II 30 مل \$160/.test(v));

  // --- the factory is marked under construction everywhere it appears
  await go('factory'); check('Factory page: Under construction', /Under construction/i.test(await view()) && !/coming soon/i.test(await view()));
  await go('ar-factory'); check('Arabic Factory page: قيد الإنشاء', /قيد الإنشاء/.test(await view()) && !/قريباً/.test(await view()));
  await go('boutique'); await p.evaluate(() => document.getElementById('menu-btn') && document.getElementById('menu-btn').click());
  const menuSub = await p.evaluate(() => { const a = [...document.querySelectorAll('#menu .menu-links a')].find(x => /Factory/.test(x.textContent)); return a ? a.textContent : ''; });
  check('menu: Factory marked Under construction', /Under construction/.test(menuSub), menuSub);

  // --- both Timbroses are ready formulas in the Atelier (the house confirmed Timbrose II on 2026-10-08)
  for (const [pre, ask, word] of [['', 'Request this formula', 'Timbrose II'], ['ar-', 'اطلب هذه التركيبة', 'Timbrose II']]) {
    await go(pre + 'atelier'); v = await view();
    const names = await p.evaluate(() => [...document.querySelectorAll('.view:not([hidden]) .formula h3')].map(h => h.textContent.trim()));
    check((pre ? 'Arabic ' : '') + 'Atelier lists both formulas', names.join('|') === 'Timbrose|Timbrose II', names.join('|'));
    const links = await p.evaluate(() => [...document.querySelectorAll('.view:not([hidden]) .formula .btn:not(.btn--ghost)')].map(a => a.getAttribute('href')));
    check((pre ? 'Arabic ' : '') + 'each has its own request link', links.length === 2 && /contact\.atelier\.timbrose$/.test(links[0]) && /contact\.atelier\.timbrose-ii$/.test(links[1]), links.join(' '));
  }
  await go('contact.atelier.timbrose-ii'); const m2 = await p.inputValue(V('#f-message'));
  check('request for Timbrose II prefills the message', /ready formula Timbrose II \(Mohamed Abdo\)/.test(m2), m2);
  await go('p-timbrose-ii'); v = await view();
  check('Timbrose II page: bottle at $160 and the formula offer', /\$160/.test(v) && /Also a ready formula for brands\. Request the formula/i.test(v), v.slice(0, 400));
  await go('ar-p-timbrose-ii'); v = await view();
  check('Arabic Timbrose II page: the formula offer', /وهو أيضاً تركيبة جاهزة للعلامات التجارية\. اطلب التركيبة/.test(v));
  await go('p-timbrose'); const top1 = (await view()).split('More from')[0]; check('Timbrose I page has no bottle price or extra offer', !/\$\d/.test(top1) && !/Also a ready formula/i.test(top1), top1.slice(0, 200));

  check('no script errors', errs.length === 0, errs.join(' | '));
  console.log(fails ? `${fails} FAILED` : 'all contact, price and notes checks passed');
  await b.close(); process.exit(fails ? 1 : 0);
})();
