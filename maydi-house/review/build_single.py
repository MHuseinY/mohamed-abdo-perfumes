# Builds ONE document for the whole review site, so no link ever loads a second page.
#   #home (default)       the English homepage, in a full-screen iframe (srcdoc)
#   #ar                   the Arabic homepage, the same way
#   #boutique ...         the English inner pages, as views of this document
#   #ar-boutique ...      the Arabic inner pages, as views of this document
# The homepages keep their own scroll engine inside their iframes; their links to other parts of the site become postMessage
# calls that change this document's hash. The inner pages use the same MAYDI library (site/site.js) as the standalone pages,
# in hash-link mode, so the two never drift apart. See spa.js for the router.
# Run by make.py, after build.py has written the two homepage fragments into review/out/.
import json, pathlib, re

R = pathlib.Path(__file__).resolve().parent.parent
SITE, REV = R / 'site', R / 'review'
OUT = REV / 'out'
PAGES = ['boutique', 'atelier', 'factory', 'botanicals', 'mohamed-abdo', 'contact']
TOPIC = r'([a-z]+)'

def read(p): return pathlib.Path(p).read_text(encoding='utf-8')

# ------------------------------------------------------------------ links --
def links(h, lang):
    """Turns the standalone pages' file links into this document's hash routes."""
    pre = 'ar-' if lang == 'ar' else ''
    h = h.replace('href="ar.html"', 'href="#ar"').replace('href="index.html"', 'href="#home"')
    h = re.sub(r'href="%scontact\.html\?topic=%s&(?:amp;)?(?:formula|item)=([a-z0-9-]+)"' % (pre, TOPIC), r'href="#%scontact.\1.\2"' % pre, h)
    h = re.sub(r'href="%scontact\.html\?topic=%s"' % (pre, TOPIC), r'href="#%scontact.\1"' % pre, h)
    h = re.sub(r'href="%sproduct\.html\?p=([a-z0-9-]+)"' % pre, r'href="#%sp-\1"' % pre, h)
    h = re.sub(r'href="%s(%s)\.html"' % (pre, '|'.join(PAGES)), r'href="#%s\1"' % pre, h)
    if lang == 'ar':
        # in-page anchors would collide with the English page's ids, so the Arabic ones carry a prefix
        for i in ['process', 'formulas']:
            h = h.replace(f'id="{i}"', f'id="ar-{i}"').replace(f'href="#{i}"', f'href="#ar-{i}"')
    return h

# ----------------------------------------------------------------- styles --
css = read(SITE / 'site.css')
css = re.sub(r'@font-face \{[^}]*\}\n', '', css)
css = css.replace('--display: "Thmanyah Serif Display", Georgia, serif;', '--display: "Lora", Georgia, serif;')
css = css.replace('--text: "Thmanyah Sans", system-ui, sans-serif;', '--text: "Almarai", system-ui, sans-serif;')
css = css.replace('.ar { font-family: var(--display); letter-spacing: 0; }', '.ar { font-family: "Almarai", sans-serif; letter-spacing: 0; }')
css = re.sub(r'/\* Maydi House inner pages.*?\*/\n', '', css, flags=re.S)
assert 'Thmanyah' not in css and 'fonts-local' not in css, 'a licensed font reference is left in site.css'
glass_css, glass_js = read(SITE / 'glass.css'), read(SITE / 'glass.js')

# ------------------------------------------------------------------ views --
views, page_css, titles = [], {}, {}
for lang in ('en', 'ar'):
    pre = 'ar-' if lang == 'ar' else ''
    for name in PAGES + ['product']:
        src = read(SITE / f'{pre}{name}.html')
        style = re.search(r'<style>\n(.*?)</style>', src, flags=re.S)
        if style:
            # the Arabic pages carry the same page styles as the English ones; keep one copy
            if name in page_css: assert page_css[name] == style.group(1), f'{pre}{name}: page style differs from the English one'
            else: page_css[name] = style.group(1)
        titles[f'{pre}{name}'] = re.search(r'<title>(.*?)</title>', src).group(1)
        if name == 'product':
            views.append(f'<div class="view wrap" id="v-{pre}product" data-view="{pre}product" hidden></div>')
        else:
            main = re.search(r'<main[^>]*>(.*?)</main>', src, flags=re.S).group(1)
            views.append(f'<div class="view" id="v-{pre}{name}" data-view="{pre}{name}" hidden>{links(main, lang)}</div>')
html_views = '\n'.join(views)
# The featured King Maydi block uses the house's packshot, published as a local file.
html_views = re.sub(r'<img src="https://gafur\.ae/[^"]*" alt="([^"]*)">', r'<img src="assets/gafur/king-maydi.webp" alt="\1">', html_views)
assert 'gafur.ae/cdn' not in html_views
assert html_views.count('assets/gafur/king-maydi.webp') == 2, 'the featured block should appear once per language'
page_style = '\n'.join(f'/* {n} */\n{s}' for n, s in page_css.items())

# --------------------------------------------------------------- products --
pj = read(SITE / 'products.js')
pj = re.sub(r'(slug: "([a-z0-9-]+)"[^{}]*?img: )"https://gafur\.ae/[^"]*"', r'\1"assets/gafur/\2.webp"', pj, flags=re.S)
assert pj.count('assets/gafur/') == 21, pj.count('assets/gafur/')
assert 'gafur.ae/cdn' not in pj
pj_ar = read(SITE / 'products-ar.js')

# ------------------------------------------------------------- homepages --
HEAD = '<!doctype html><html lang="%s"%s><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>[hidden]{display:none!important}html,body{margin:0}</style></head><body>\n'
TAIL = '\n</body></html>\n'
CHILD = r'''<script>
  // Links to other parts of the site: tell the parent document to change its hash. Nothing else navigates.
  (function () {
    function map(h) {
      var m = /^pages\.html#(.+)$/.exec(h);
      if (m) return '#' + m[1];
      if (h === 'ar.html') return '#ar';
      if (h === 'index.html') return '#home';
      return null;
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var to = map(a.getAttribute('href'));
      if (!to) return;
      e.preventDefault();
      parent.postMessage({ maydiGo: to }, '*');
    }, true);
  })();
</script>'''

def child(frag, lang, extra=''):
    html = HEAD % (lang, extra) + frag + '\n' + CHILD + TAIL
    assert 'fonts-local' not in html and 'assets/type' not in html and 'Thmanyah' not in html
    return html

homes = {'home': child(read(OUT / 'maydi-house-homepage-share.html'), 'en'),
         'ar': child(read(OUT / 'maydi-house-arabic-share.html'), 'ar', ' dir="rtl"')}
# every link that leaves a homepage for another document must be one the child script maps
for k, h in homes.items():
    for m in re.finditer(r'href="([^"#][^"]*\.html[^"]*)"', h):
        assert re.match(r'(pages\.html#.+|ar\.html|index\.html)$', m.group(1)), (k, m.group(1))

def js_str(s):  # safe inside an inline <script>
    return json.dumps(s, ensure_ascii=False).replace('<', '\\u003c').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')

# ------------------------------------------------------------------ shell --
shell = '''<title>Maydi House</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Almarai:wght@400;700;800&display=swap">
<style>
__CSS__
__GLASS_CSS__
__PAGE_STYLE__
__REVIEW_CSS__
</style>

<header data-site-bar></header>
<div data-uncommentable>
  <button class="note-btn" id="note-btn" type="button" hidden>
    <svg viewBox="0 0 18 22" aria-hidden="true"><path d="M1.5 21V9a7.5 7.5 0 0 1 15 0v12" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
    <span class="nb-label">Add a note here</span>
  </button>
  <p class="note-hint" id="note-hint" role="status" hidden></p>
</div>
<main id="views">
__VIEWS__
</main>
<footer data-site-foot></footer>

<script>
  window.MAYDI_HASH_LINKS = true;       // links are #hash routes
  window.MAYDI_NO_AUTO_CHROME = true;   // spa.js draws the header, menu and footer on every route
  window.MAYDI_DRAFT = { en: 'Draft v2 · for review', ar: 'مسودة ٢ · للمراجعة' };
  window.MAYDI_TITLES = __TITLES__;
  window.MAYDI_HOMES = __HOMES__;
</script>
<script>
__PRODUCTS__
</script>
<script>
__PRODUCTS_AR__
</script>
<script>
__SITE_JS__
</script>
<script>
__SPA_JS__
</script>
<script>
__GLASS_JS__
</script>
<script>
__NOTES_JS__
</script>
'''
subs = {
    '__CSS__': css, '__GLASS_CSS__': glass_css, '__PAGE_STYLE__': page_style, '__REVIEW_CSS__': read(REV / 'review.css'),
    '__VIEWS__': html_views, '__TITLES__': js_str(titles), '__HOMES__': '{"home": ' + js_str(homes['home']) + ', "ar": ' + js_str(homes['ar']) + '}',
    '__PRODUCTS__': pj, '__PRODUCTS_AR__': pj_ar, '__SITE_JS__': read(SITE / 'site.js'), '__SPA_JS__': read(REV / 'spa.js'),
    '__GLASS_JS__': glass_js, '__NOTES_JS__': read(REV / 'notes.js'),
}
for k, v in subs.items():
    assert shell.count(k) == 1, k
    shell = shell.replace(k, v)
assert 'Thmanyah' not in shell, 'a licensed font reference slipped into the review page'
out = OUT / 'maydi-house-single.html'
out.write_text(shell, encoding='utf-8')
print(out.name, f'{len(shell):,} bytes; homes', {k: len(v) for k, v in homes.items()}, '; views', len(views))
