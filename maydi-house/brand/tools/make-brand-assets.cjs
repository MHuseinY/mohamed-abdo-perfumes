// Builds the brand files that come from the simplified mark: the mark itself, the favicon set and the link-preview image.
//   node brand/tools/make-brand-assets.cjs
// Needs the Playwright install in tests/ (Chrome is used to draw the PNGs). Outputs: brand/maydi-house-mark.svg, site/favicon.svg,
// site/favicon-32.png, site/apple-touch-icon.png, site/og-image.png. The traced full logo (brand/maydi-house-logo-trace-lite.svg) is the og-image.
const fs = require('fs'); const path = require('path');
const { chromium } = require('../../tests/node_modules/playwright-core');
const ROOT = path.join(__dirname, '..', '..');
const COL = { arch: '#702030', tree: '#3A6351', resin: '#D9A441', cream: '#F5E6DA' };

// The mark on a 64 x 76 grid: a pointed arch, the M inside it, a sprig rising from a drop of resin.
// `w` scales the line weights (the favicon is drawn bolder so it survives at 16 px).
const markInner = (w = 1) => `
  <g fill="none" stroke="${COL.arch}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 64H2V31C2 17 15 8 32 1C49 8 62 17 62 31V64H44" stroke-width="${2.6 * w}"/>
    <path d="M14 64V27L32 47L50 27V64" stroke-width="${2.4 * w}"/>
  </g>
  <path d="M32 54V20" fill="none" stroke="${COL.tree}" stroke-width="${2 * w}" stroke-linecap="round"/>
  <g fill="${COL.tree}">
    <ellipse cx="32" cy="14" rx="2.9" ry="6"/>
    <ellipse cx="26.2" cy="25.5" rx="4.6" ry="2.3" transform="rotate(-38 26.2 25.5)"/>
    <ellipse cx="37.8" cy="25.5" rx="4.6" ry="2.3" transform="rotate(38 37.8 25.5)"/>
    <ellipse cx="26.6" cy="34.5" rx="4.4" ry="2.2" transform="rotate(-32 26.6 34.5)"/>
    <ellipse cx="37.4" cy="34.5" rx="4.4" ry="2.2" transform="rotate(32 37.4 34.5)"/>
  </g>
  <path d="M32 53C32 53 25.5 61.5 25.5 66.2A6.5 6.5 0 0 0 38.5 66.2C38.5 61.5 32 53 32 53Z" fill="${COL.resin}" stroke="${COL.arch}" stroke-width="${2 * w}" stroke-linejoin="round"/>`;

const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 76" role="img" aria-label="Maydi House"><title>Maydi House</title>${markInner()}\n</svg>\n`;
const tile = (rx) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${rx}" fill="${COL.cream}"/>` +
  `<g transform="translate(8.3 4.2) scale(.74)">${markInner(1.45)}</g></svg>\n`;

fs.writeFileSync(path.join(ROOT, 'brand', 'maydi-house-mark.svg'), markSvg);
fs.writeFileSync(path.join(ROOT, 'site', 'favicon.svg'), tile(14));

(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const shot = async (html, w, h, out) => {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.setContent(`<body style="margin:0;background:${COL.cream}">${html}</body>`); await p.waitForTimeout(300);
    await p.screenshot({ path: out, clip: { x: 0, y: 0, width: w, height: h } }); await p.close();
  };
  const uri = (svg) => 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
  await shot(`<img src="${uri(tile(14))}" width="32" height="32" style="display:block">`, 32, 32, path.join(ROOT, 'site', 'favicon-32.png'));
  await shot(`<img src="${uri(tile(0))}" width="180" height="180" style="display:block">`, 180, 180, path.join(ROOT, 'site', 'apple-touch-icon.png'));
  const logo = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(ROOT, 'brand', 'maydi-house-logo-trace-lite.svg')).toString('base64');
  await shot(`<div style="width:1200px;height:630px;display:grid;place-items:center"><img src="${logo}" style="height:560px;width:auto;display:block"></div>`, 1200, 630, path.join(ROOT, 'site', 'og-image.png'));
  await b.close();
  for (const f of ['brand/maydi-house-mark.svg', 'site/favicon.svg', 'site/favicon-32.png', 'site/apple-touch-icon.png', 'site/og-image.png'])
    console.log(f, fs.statSync(path.join(ROOT, f)).size, 'bytes');
})();
