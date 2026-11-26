// Records what every route of the review site shows (visible text, links, title) so a refactor can be compared with it.
//   node snapshot.cjs <tag> [routes...]      writes out/snapshot-<tag>.json
//   node snapshot.cjs --diff <tagA> <tagB>   lists the routes whose output differs (only routes present in both)
// Needs the preview server running and `python review/make.py` built. Uses the shell directly (no sandbox).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const DEFAULT_EN = ['boutique', 'atelier', 'factory', 'botanicals', 'mohamed-abdo', 'contact', 'contact.order.king-maydi', 'contact.atelier.timbrose',
  'p-timbrose-ii', 'p-timbrose', 'p-king-maydi', 'p-shalemar-attar', 'p-mango-oud', 'p-embers-brings-memories'];

const DEFAULT_AR = ['ar-boutique', 'ar-atelier', 'ar-factory', 'ar-botanicals', 'ar-mohamed-abdo', 'ar-contact', 'ar-contact.order.king-maydi', 'ar-p-timbrose-ii', 'ar-p-king-maydi', 'ar-p-mango-oud'];

if (process.argv[2] === '--diff') {
  const a = JSON.parse(fs.readFileSync(path.join(__dirname, 'out', `snapshot-${process.argv[3]}.json`), 'utf8'));
  const b = JSON.parse(fs.readFileSync(path.join(__dirname, 'out', `snapshot-${process.argv[4]}.json`), 'utf8'));
  let bad = 0, same = 0;
  for (const r of Object.keys(a)) {
    if (!(r in b)) continue;
    if (JSON.stringify(a[r]) === JSON.stringify(b[r])) { same++; continue; }
    bad++; console.log('DIFFERENT:', r);
    for (const k of Object.keys(a[r])) if (JSON.stringify(a[r][k]) !== JSON.stringify(b[r][k])) {
      console.log('  field', k); console.log('   before:', JSON.stringify(a[r][k]).slice(0, 300)); console.log('   after: ', JSON.stringify(b[r][k]).slice(0, 300));
    }
  }
  console.log(`${same} routes identical, ${bad} different`); process.exit(bad ? 1 : 0);
}

(async () => {
  const tag = process.argv[2] || 'now';
  const routes = process.argv.length > 3 ? process.argv.slice(3) : DEFAULT_EN.concat(DEFAULT_AR);
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const p = await (await b.newContext({ viewport: { width: 1366, height: 900 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.goto('http://localhost:4500/review/out/preview/index.html#boutique', { waitUntil: 'networkidle' });
  const out = {};
  for (const r of routes) {
    await p.evaluate(h => { location.hash = '#' + h; }, r); await p.waitForTimeout(500);
    out[r] = await p.evaluate(() => {
      const view = [...document.querySelectorAll('.view')].find(v => !v.hidden);
      const vis = el => el ? el.innerText.replace(/\s+/g, ' ').trim() : null;
      const links = el => el ? [...el.querySelectorAll('a[href]')].map(a => a.getAttribute('href')) : [];
      const bar = document.querySelector('[data-site-bar]'), foot = document.querySelector('[data-site-foot]'), menu = document.getElementById('menu');
      return {
        title: document.title, lang: document.documentElement.lang, dir: document.documentElement.dir,
        view: view && view.dataset.view, text: vis(view), links: links(view), imgs: view ? [...view.querySelectorAll('img')].map(i => i.getAttribute('src')) : [],
        bar: vis(bar), barLinks: links(bar), menuLinks: links(menu), foot: vis(foot), footLinks: links(foot),
        current: [...document.querySelectorAll('[aria-current="page"]')].map(a => a.getAttribute('href')),
      };
    });
  }
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'out', `snapshot-${tag}.json`), JSON.stringify(out, null, 1));
  console.log(`snapshot ${tag}: ${routes.length} routes`, errs.length ? errs : 'no errors');
  await b.close();
})();
