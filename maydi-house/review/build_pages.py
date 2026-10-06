# Builds ONE shareable artifact page holding every inner page as a view, switched by #hash.
# Public rules applied here:
#   - no Thmanyah files (user rule): Lora for display, Almarai for text and Arabic
#   - gafur.ae packshots are published as local files (the user shares this link only with the client;
#     the artifact CSP would block the remote URLs)
# usage: python build_pages.py <homepage artifact url>
import re, sys, json, pathlib
HOME = sys.argv[1]
ROOT = pathlib.Path(__file__).resolve().parent.parent
V2 = ROOT / 'site'
OUT = ROOT / 'review' / 'out' / 'maydi-house-pages.html'
PAGES = ['boutique', 'mohamed-abdo', 'atelier', 'factory', 'botanicals', 'contact']

def links(h):
    h = h.replace('href="index.html"', f'href="{HOME}"')
    h = re.sub(r'href="contact\.html\?topic=([a-z]+)&(?:amp;)?(?:formula|item)=([a-z0-9-]+)"', r'href="#contact.\1.\2"', h)
    h = re.sub(r'href="contact\.html\?topic=([a-z]+)"', r'href="#contact.\1"', h)
    h = re.sub(r'href="product\.html\?p=([a-z0-9-]+)"', r'href="#p-\1"', h)
    h = re.sub(r'href="(%s)\.html"' % '|'.join(PAGES), r'href="#\1"', h)
    return h

# ---------------------------------------------------------------- styles --
css = (V2 / 'site.css').read_text(encoding='utf-8')
css = re.sub(r'@font-face \{[^}]*\}\n', '', css)
css = css.replace('--display: "Thmanyah Serif Display", Georgia, serif;', '--display: "Lora", Georgia, serif;')
css = css.replace('--text: "Thmanyah Sans", system-ui, sans-serif;', '--text: "Almarai", system-ui, sans-serif;')
css = css.replace('.ar { font-family: var(--display); letter-spacing: 0; }', '.ar { font-family: "Almarai", sans-serif; letter-spacing: 0; }')
css = re.sub(r'/\* Maydi House inner pages.*?\*/\n', '', css, flags=re.S)
assert 'Thmanyah' not in css and 'fonts-local' not in css

glass_css = (V2 / 'glass.css').read_text(encoding='utf-8')
glass_js = (V2 / 'glass.js').read_text(encoding='utf-8')
assert 'Thmanyah' not in glass_css + glass_js

views, page_css, titles = [], [], {}
for name in PAGES:
    src = (V2 / f'{name}.html').read_text(encoding='utf-8')
    style = re.search(r'<style>\n(.*?)</style>', src, flags=re.S)
    if style: page_css.append(f'/* {name} */\n' + style.group(1))
    main = re.search(r'<main[^>]*>(.*?)</main>', src, flags=re.S).group(1)
    titles[name] = re.search(r'<title>(.*?)</title>', src).group(1)
    views.append(f'<div class="view" id="v-{name}" data-view="{name}" hidden>{links(main)}</div>')
pstyle = re.search(r'<style>\n(.*?)</style>', (V2 / 'product.html').read_text(encoding='utf-8'), flags=re.S).group(1)
page_css.append('/* product */\n' + pstyle)
views.append('<div class="view wrap" id="v-product" data-view="product" hidden></div>')
html_views = '\n'.join(views)
# The featured King Maydi block uses the house's packshot, published as a local file.
html_views = re.sub(r'<img src="https://gafur\.ae/[^"]*" alt="([^"]*)">',
                    r'<img src="assets/gafur/king-maydi.webp" alt="\1">', html_views)
assert 'gafur.ae/cdn' not in html_views

# --------------------------------------------------------------- products --
pj = (V2 / 'products.js').read_text(encoding='utf-8')
pj = re.sub(r'(slug: "([a-z0-9-]+)"[^{}]*?img: )"https://gafur\.ae/[^"]*"', r'\1"assets/gafur/\2.webp"', pj, flags=re.S)
assert pj.count('assets/gafur/') == 21, pj.count('assets/gafur/')
assert 'gafur.ae/cdn' not in pj

page = f'''<title>Maydi House Pages</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Almarai:wght@400;700&display=swap">
<style>
{css}
{chr(10).join(page_css)}
/* ---------------------------------------------------- liquid-glass navigation -- */
{glass_css}
.lang a {{ color: inherit; text-decoration: none; }}
/* ---------------------------------------------------- shared-link additions -- */
.view[hidden] {{ display: none !important; }}
.frame.ph, .card .frame.ph, .featured .frame {{ display: grid; place-content: center; text-align: center; gap: .6rem; padding: 1.4rem; }}
.ph-name {{ font-family: var(--display); font-size: clamp(1.2rem, 2.2vw, 1.8rem); color: var(--accent); line-height: 1.2; }}
.ph-note {{ font-size: .62rem; text-transform: uppercase; letter-spacing: .14em; color: var(--umber); }}
.draft-tag {{ font-size: .62rem; letter-spacing: .12em; text-transform: uppercase; color: var(--umber); border: 1px dashed var(--accent-2); padding: .2rem .45rem; white-space: nowrap; }}
.note-btn {{ position: fixed; z-index: 60; right: 16px; bottom: calc(16px + env(safe-area-inset-bottom, 0px)); display: inline-flex; align-items: center; gap: .5rem;
  padding: .7rem 1rem; cursor: pointer; font: 700 .78rem/1 var(--text); background: var(--canvas); color: var(--accent); border: 1px solid var(--accent); box-shadow: 0 6px 20px rgba(43,20,24,.18); }}
.note-btn:hover {{ background: var(--accent); color: var(--canvas); }}
.note-btn svg {{ width: 14px; height: 16px; }}
.note-btn[hidden], .note-hint[hidden] {{ display: none; }}
.note-hint {{ position: fixed; z-index: 60; right: 16px; bottom: calc(68px + env(safe-area-inset-bottom, 0px)); max-width: 17rem; font-size: .8rem; background: var(--ink); color: var(--canvas); padding: .6rem .8rem; }}
.site-bar {{ padding-top: env(safe-area-inset-top, 0px); }}
@media (max-width: 860px) {{ .draft-tag {{ display: none; }} .note-btn {{ top: calc(var(--bar-h) + 12px); bottom: auto; padding: .6rem .7rem; }} .note-btn .nb-label {{ position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }} .note-hint {{ top: calc(var(--bar-h) + 64px); bottom: auto; }} }}
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
{html_views}
</main>
<footer data-site-foot></footer>

<script>
{pj}
</script>
<script>
  // Shared-link version of site.js plus a hash router. Views: #boutique, #mohamed-abdo, #atelier,
  // #factory, #botanicals, #contact[.topic[.item]], #p-<slug>.
  (function () {{
    var HOME = {json.dumps(HOME)};
    var TITLES = {json.dumps(titles)};
    document.documentElement.classList.add('js');
    var ARCH = '<svg viewBox="0 0 18 22" aria-hidden="true"><path d="M1.5 21V9a7.5 7.5 0 0 1 15 0v12" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M9 9.5c0 0-2.2 3-2.2 4.4a2.2 2.2 0 0 0 4.4 0C11.2 12.5 9 9.5 9 9.5z" fill="#D9A441"/></svg>';
    var NAV = [['atelier', 'Atelier'], ['factory', 'Factory'], ['boutique', 'Boutique'], ['botanicals', 'Botanicals'], ['mohamed-abdo', 'Mohamed Abdo']];

    var bar = document.querySelector('[data-site-bar]');
    bar.className = 'site-bar';
    bar.innerHTML =
      '<a class="mark caps" href="' + HOME + '" aria-label="Maydi House, home">' + ARCH + 'Maydi House</a>' +
      '<span class="draft-tag" title="A working draft shared for review. This is not the live website.">Draft v2 · for review</span>' +
      '<nav aria-label="Main">' + NAV.map(function (n) {{ return '<a class="caps" href="#' + n[0] + '" data-nav="' + n[0] + '">' + n[1] + '</a>'; }}).join('') +
      '<a class="caps bar-cta" href="#contact" data-nav="contact">Partner with us</a></nav>' +
      '<div class="lang"><span aria-current="true">EN</span><span aria-hidden="true">|</span><a class="ar" lang="ar" href="ar.html" title="Arabic homepage">العربية</a></div>';

    // Phone menu: everything the bar hides on small screens.
    var SUB = {{ 'atelier': 'Bespoke design', 'factory': 'Coming soon', 'boutique': 'Curated fragrances', 'botanicals': 'Raw materials', 'mohamed-abdo': 'Founder and perfumer' }};
    bar.insertAdjacentHTML('beforeend', '<button class="menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="menu"><i aria-hidden="true"></i>Menu</button>');
    bar.insertAdjacentHTML('afterend',
      '<div class="menu-panel" id="menu" role="dialog" aria-modal="true" aria-label="Menu" hidden>' +
        '<div class="menu-head"><a class="mark caps" href="' + HOME + '">' + ARCH + 'Maydi House</a><button class="menu-close" id="menu-close" type="button">Close</button></div>' +
        '<nav class="menu-links"><a href="' + HOME + '">Home<small>The homepage</small></a>' +
        NAV.map(function (n) {{ return '<a href="#' + n[0] + '" data-nav="' + n[0] + '">' + n[1] + '<small>' + SUB[n[0]] + '</small></a>'; }}).join('') + '</nav>' +
        '<div class="menu-foot"><a class="btn" href="#contact">Partner with us</a>' +
        '<div class="lang"><span aria-current="true">EN</span><span aria-hidden="true">|</span><a class="ar" lang="ar" href="ar.html">العربية</a></div></div>' +
      '</div>');
    var mBtn = document.getElementById('menu-btn'), mPanel = document.getElementById('menu'), mClose = document.getElementById('menu-close');
    function setMenu(open) {{
      mPanel.hidden = !open; mBtn.setAttribute('aria-expanded', String(open));
      document.documentElement.style.overflow = open ? 'hidden' : '';
      (open ? mClose : mBtn).focus();
    }}
    mBtn.addEventListener('click', function () {{ setMenu(true); }});
    mClose.addEventListener('click', function () {{ setMenu(false); }});
    mPanel.addEventListener('click', function (e) {{ if (e.target.closest('a')) setMenu(false); }});
    document.addEventListener('keydown', function (e) {{ if (e.key === 'Escape' && !mPanel.hidden) setMenu(false); }});

    var foot = document.querySelector('[data-site-foot]');
    foot.className = 'foot';
    foot.innerHTML =
      '<div class="wrap"><div class="cols">' +
        '<div><div class="brand">Maydi House</div><p style="margin-top:.6rem;max-width:30ch">A Somali fragrance house in Mogadishu, named after Maydi, the rarest frankincense in the world.</p></div>' +
        '<div><h4>Houses</h4><ul><li><a href="#atelier">Maydi Atelier</a></li><li><a href="#factory">Maydi Factory</a></li><li><a href="#boutique">Maydi Boutique</a></li><li><a href="#botanicals">Maydi Botanicals</a></li></ul></div>' +
        '<div><h4>The house</h4><ul><li><a href="#mohamed-abdo">Mohamed Abdo</a></li><li><a href="#contact">Partner with us</a></li><li><a href="' + HOME + '">Home</a></li></ul></div>' +
        '<div><h4>Contact</h4><ul><li>Mogadishu, Somalia</li><li>maydihouse@gmail.com</li><li><a href="https://www.instagram.com/maydihouse/" rel="noopener">Instagram</a></li><li style="opacity:.7">WhatsApp (number to come)</li></ul></div>' +
      '</div><div class="small"><span>© 2026 Maydi House</span><span>Officially licensed in Mogadishu</span></div></div>';

    document.addEventListener('click', function (e) {{ if (e.target.closest('[aria-disabled="true"]')) e.preventDefault(); }});

    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {{
      es.forEach(function (en) {{ if (en.isIntersecting) {{ en.target.classList.add('in'); io.unobserve(en.target); }} }});
    }}, {{ rootMargin: '0px 0px -8% 0px' }}) : null;
    function reveal(root) {{ (root || document).querySelectorAll('.rv:not(.in)').forEach(function (el) {{ io ? io.observe(el) : el.classList.add('in'); }}); }}

    function product(slug) {{ return MAYDI_PRODUCTS.filter(function (p) {{ return p.slug === slug; }})[0]; }}
    function frame(p, cls) {{
      return p.img
        ? '<div class="frame' + (cls || '') + '"><img src="' + p.img + '" alt="' + (p.alt || p.name + ' by ' + p.house) + '" loading="lazy"></div>'
        : '<div class="frame ph' + (cls || '') + '"><span class="ph-name">' + p.name + '</span><span class="ph-note">Image from the house, pending permission</span></div>';
    }}
    function card(p) {{
      return '<a class="card" href="#p-' + p.slug + '">' + frame(p) +
        '<div class="house">' + p.house + ' · ' + p.line + '</div><h3>' + p.name + '</h3>' +
        '<div class="meta"><span>' + p.sizes.join(' · ') + (p.soldOut ? ' · Sold out' : '') + '</span><span class="price-slot">Price</span></div></a>';
    }}

    // ---- boutique
    var shelf = MAYDI_PRODUCTS.filter(function (p) {{ return p.house === 'Zakir Gafur'; }});
    var rest = shelf.filter(function (p) {{ return !p.featured; }});
    var grid = document.getElementById('grid'), count = document.getElementById('count');
    document.getElementById('count-all').textContent = shelf.length;
    function renderShelf(f) {{
      var list = f === 'all' ? rest : rest.filter(function (p) {{ return p.group === f; }});
      grid.innerHTML = list.map(card).join('');
      count.textContent = list.length + (list.length === 1 ? ' fragrance' : ' fragrances') + (f === 'all' ? ', plus King Maydi above' : '');
    }}
    document.getElementById('filters').addEventListener('click', function (e) {{
      var b = e.target.closest('button'); if (!b) return;
      this.querySelectorAll('button').forEach(function (x) {{ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }});
      renderShelf(b.getAttribute('data-f'));
    }});
    renderShelf('all');

    // ---- founder: his perfumes
    document.getElementById('works').innerHTML = ['timbrose-ii', 'timbrose'].map(function (s) {{ return card(product(s)); }}).join('');

    // ---- contact
    var sel = document.getElementById('f-topic'), msg = document.getElementById('f-message');
    function prefill(topic, item) {{
      if (topic && sel.querySelector('option[value="' + topic + '"]')) sel.value = topic;
      var p = item && product(item);
      if (p) msg.value = (topic === 'atelier' ? 'I am interested in the ready formula ' : 'I would like to order ') + p.name + ' (' + p.house + ').\\n\\n';
    }}
    document.getElementById('enquiry').addEventListener('submit', function (e) {{
      e.preventDefault();
      var s = document.getElementById('form-status'); s.hidden = false;
      s.textContent = 'This is a design prototype, so nothing was sent. Until the form is connected, write to maydihouse@gmail.com.';
    }});

    // ---- product
    function renderProduct(p, root) {{
      var home = p.house === 'Mohamed Abdo' ? (p.group === 'atelier' ? ['atelier', 'Maydi Atelier'] : ['mohamed-abdo', 'Mohamed Abdo']) : ['boutique', 'Maydi Boutique'];
      var tiers = p.notes ? [['Top', p.notes.top], ['Heart', p.notes.heart], ['Base', p.notes.base], ['Accords', null]] : null;
      var notes = tiers
        ? '<div class="pyramid"><h2>The notes</h2>' + tiers.map(function (t) {{ return '<div class="tier"><b>' + t[0] + '</b><p' + (t[1] ? '' : ' class="muted"') + '>' + (t[1] ? t[1].join(', ') : 'To come') + '</p></div>'; }}).join('') + '</div>'
        : '<div class="pyramid"><h2>' + (p.keyNotes && p.keyNotes.length ? 'Key notes' : 'The notes') + '</h2><div class="tier"><b>Notes</b><p' + (p.keyNotes && p.keyNotes.length ? '>' + p.keyNotes.join(', ') : ' class="muted">To come') + '</p></div></div>';
      var atelier = p.group === 'atelier';
      var buy = atelier
        ? '<a class="btn" href="#contact.atelier.' + p.slug + '">Request this formula for your brand</a><p class="note">A ready formula by Mohamed Abdo, released under your own name.</p>'
        : '<button class="btn" type="button" aria-disabled="true" title="Online ordering comes later">' + (p.soldOut ? 'Sold out' : 'Add to bag') + '</button>' +
          '<a class="btn btn--ghost" href="#contact.order.' + p.slug + '">Order through the house</a><p class="note">Online ordering opens later. For now, the house takes orders directly.</p>';
      var more = MAYDI_PRODUCTS.filter(function (x) {{ return x.slug !== p.slug && x.house === p.house && !x.featured; }}).slice(0, 4);
      root.innerHTML =
        '<div class="crumbs" style="margin-top:2rem"><a href="' + HOME + '">Home</a> / <a href="#' + home[0] + '">' + home[1] + '</a> / ' + p.name + '</div>' +
        '<article class="pdp">' + frame(p) + '<div>' +
          '<div class="house">' + p.house + ' · ' + p.line + '</div><h1>' + p.name + '</h1><p class="kind">' + (p.kind || p.line) + '</p>' +
          (p.edition ? '<p class="edition"><span class="chip">' + p.edition + '</span></p>' : '') +
          '<div class="price-row"><span class="price-slot">Price</span><small>' + (atelier ? 'Formula pricing on request' : 'Prices to be announced') + '</small></div>' +
          '<div class="sizes"><div class="label">Size</div><div class="opts">' + p.sizes.map(function (s, i) {{ return '<button type="button" aria-pressed="' + (i === 0) + '">' + s + '</button>'; }}).join('') + '</div></div>' +
          '<div class="buy">' + buy + '</div><p class="story">' + p.summary + '</p>' + notes +
        '</div></article>' +
        (more.length ? '<section class="more" style="padding-bottom:5rem"><h2>More from ' + p.house + '</h2><div class="grid">' + more.map(card).join('') + '</div></section>' : '');
      root.querySelector('.opts').addEventListener('click', function (e) {{
        var b = e.target.closest('button'); if (!b) return;
        this.querySelectorAll('button').forEach(function (x) {{ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }});
      }});
      return home[0];
    }}

    // ---- router
    function route() {{
      var h = location.hash.slice(1) || 'boutique';
      var inView = document.getElementById(h);
      if (inView && !inView.classList.contains('view')) {{ inView.scrollIntoView(); return; }}  // in-page anchors like #process
      var parts = h.split('.'), name = parts[0], navKey = name, title;
      if (name.indexOf('p-') === 0) {{
        var p = product(name.slice(2));
        if (!p) {{ location.replace('#boutique'); return; }}
        navKey = renderProduct(p, document.getElementById('v-product')); name = 'product';
        title = p.name + ' · ' + p.house + ' · Maydi House';
      }}
      if (!document.getElementById('v-' + name)) {{ name = navKey = 'boutique'; }}
      if (name === 'contact') prefill(parts[1], parts[2]);
      document.querySelectorAll('.view').forEach(function (v) {{ v.hidden = v.getAttribute('data-view') !== name; }});
      document.querySelectorAll('[data-nav]').forEach(function (a) {{
        if (a.getAttribute('data-nav') === navKey) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      }});
      document.title = title || TITLES[name] || 'Maydi House';
      window.scrollTo(0, 0);
      reveal(document.getElementById('v-' + name));
    }}
    window.addEventListener('hashchange', route);
    route();
  }})();
</script>
<script>
{glass_js}
</script>
<script>
  // Review notes: the button opens the viewer's own comment composer at the middle of the screen.
  (async function () {{
    if (!window.claude || !window.claude.use) return;
    var comments = await window.claude.use('comments');
    if (!comments) return;
    var btn = document.getElementById('note-btn'), hint = document.getElementById('note-hint');
    var BLOCKS = 'h1,h2,h3,p,figure,li,article,.card,.frame,tr,.foot,section';
    function say(t) {{ hint.textContent = t; hint.hidden = false; clearTimeout(say.t); say.t = setTimeout(function () {{ hint.hidden = true; }}, 4000); }}
    btn.hidden = false;
    btn.addEventListener('click', async function () {{
      var el = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
      try {{
        var r = await comments.openComposer({{ element: (el && el.closest(BLOCKS)) || el || document.getElementById('views') }});
        if (!r.opened) say('Finish or close the note that is already open, then try again.');
      }} catch (e) {{
        if (e && e.code === 'rate_limited') {{ say('One moment, then try again.'); return; }}
        btn.hidden = true; say('Notes are not available in this view. Open the link while signed in to claude.ai.');
      }}
    }});
  }})();
</script>
'''
OUT.write_text(page, encoding='utf-8')
print(OUT, len(page), 'Thmanyah' in page, 'gafur.ae/cdn' in page, 'fonts-local' in page)
