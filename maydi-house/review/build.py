# Turns the site pages (site/) into claude.ai artifact fragments (review/out/).
# usage: python build.py <lang: en|ar> <other-language artifact url or ""> [public] [pages artifact url]
#   public: build the shareable copy (no Thmanyah files) as *-share.html
import re, sys
import pathlib
S = pathlib.Path(__file__).resolve().parent.parent
lang, other = sys.argv[1], sys.argv[2]
public = len(sys.argv) > 3 and sys.argv[3] == 'public'
pages = sys.argv[4] if len(sys.argv) > 4 else ''
src = {'en': 'index.html', 'ar': 'ar.html'}[lang]
out = {'en': 'maydi-house-homepage.html', 'ar': 'maydi-house-arabic.html'}[lang]
s = open(f'{S}/site/{src}', encoding='utf-8').read()

# The publish skeleton supplies doctype, html, head, body and the meta tags.
s = s.replace('<!doctype html>\n', '')
s = re.sub(r'<html lang="[a-z]+"( dir="rtl")?>\n<head>\n<meta charset="utf-8">\n', '', s)
s = re.sub(r'<script>\n  // Opened as.*?</script>\n', '', s, flags=re.S)   # local-server fix only
s = re.sub(r'<meta name="(viewport|description)"[^\n]*\n', '', s)
s = '\n'.join(l for l in s.split('\n') if not l.startswith(('<link rel="icon"', '<link rel="apple-touch-icon"', '<meta property="og:', '<meta name="twitter:')))
s = s.replace('</head>\n<body>\n', '').replace('</body>\n</html>\n', '')
title = {'en': 'Maydi House Homepage', 'ar': 'مايدي هاوس بالعربية'}[lang]
s = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', s, count=1)
if lang == 'ar':
    # The skeleton owns <html>, so set the page's language and direction before anything renders.
    s = s.replace('<title>', '<script>document.documentElement.lang = "ar"; document.documentElement.dir = "rtl";</script>\n<title>', 1)
    s = s.replace('<style>', '<style>\n  :root { direction: rtl; }', 1)
assert '<head>' not in s and '<body>' not in s and 'location.replace' not in s
assert s.count('<!--') == s.count('-->'), 'unbalanced HTML comment'

s = re.sub(r'  /\* Thmanyah: LOCAL PREVIEW ONLY.*?\*/\n', '', s, flags=re.S)
s = re.sub(r'\n     Thmanyah is LOCAL ONLY: [^\n]*', ' -->', s)
if public:
    # Shared links never carry the Thmanyah files (user rule): Lora for Latin display, Almarai for Arabic and text.
    out = out.replace('.html', '-share.html')
    s = re.sub(r'  @font-face \{[^\n]*\n', '', s)
    s = s.replace('<link rel="stylesheet" href="scrollcraft.css">',
                  '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
                  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=Almarai:wght@400;700;800&display=swap">\n'
                  '<link rel="stylesheet" href="scrollcraft.css">', 1)
    display = '"Lora", Georgia, serif' if lang == 'en' else '"Almarai", system-ui, sans-serif'
    s = s.replace('"Thmanyah Serif Display", Georgia, serif', display)
    s = s.replace('"Thmanyah Sans", system-ui, sans-serif', '"Almarai", system-ui, sans-serif')
    s = s.replace('"Thmanyah Serif Display"', '"Almarai"').replace('"Thmanyah Sans"', '"Almarai"')
    assert 'Thmanyah' not in s and 'fonts-local' not in s and 'assets/type' not in s
else:
    # Private review copy: Thmanyah packaged with the page.
    s = s.replace('fonts-local/', 'assets/type/')

# Language toggle: the other page is its own artifact.
if lang == 'en':
    s = s.replace('href="ar.html"', f'href="{other}"' if other else 'href="#top" aria-disabled="true"')
    if pages:
        # The houses, the founder and the contact page live in the shared pages artifact.
        for name in ['atelier', 'factory', 'boutique', 'botanicals', 'mohamed-abdo', 'contact']:
            s = s.replace(f'href="{name}.html"', f'href="{pages}#{name}"')
        bad = re.search(r'href="(?!ar\.html|pages\.html|index\.html)[a-z-]+\.html"', s); assert bad is None, bad
else:
    s = s.replace('href="index.html"', f'href="{other}"')
    if pages:
        # One link: the Arabic homepage reaches the Arabic inner pages through the shell's hash routes (#ar-boutique ...).
        for name in ['atelier', 'factory', 'boutique', 'botanicals', 'mohamed-abdo', 'contact']:
            s = s.replace(f'href="ar-{name}.html"', f'href="{pages}#ar-{name}"')
        bad = re.search(r'href="(?!ar\.html|pages\.html|index\.html)[a-z-]+\.html"', s); assert bad is None, bad

# Liquid-glass navigation: inlined (the share links carry no extra files).
gcss = open(f'{S}/site/glass.css', encoding='utf-8').read()
gjs = open(f'{S}/site/glass.js', encoding='utf-8').read()
if lang == 'ar' and pages:
    for label, name in [('التصميم', 'atelier'), ('التصنيع', 'factory'), ('البوتيك', 'boutique'), ('المواد الخام', 'botanicals')]:
        a = f"['#houses', '{label}', '{name}']"; assert gjs.count(a) == 1, a
        gjs = gjs.replace(a, f"['{pages}#ar-{name}', '{label}', '{name}']")
    a = "if (home && ar && houses.length === 4) {"; assert gjs.count(a) == 1
    gjs = gjs.replace(a, "if (false) {")
if lang == 'en' and pages:
    for name in ['atelier', 'factory', 'boutique', 'botanicals']:
        assert gjs.count(f"'{name}.html'") == 1, name
        gjs = gjs.replace(f"'{name}.html'", f"'{pages}#{name}'")
    assert not any(f'{n}.html' in gjs for n in ['atelier', 'factory', 'boutique', 'botanicals'])
assert s.count('<link rel="stylesheet" href="glass.css">') == 1 and s.count('<script src="glass.js"></script>') == 1
s = s.replace('<link rel="stylesheet" href="glass.css">', '<style>' + chr(10) + gcss + '</style>')
s = s.replace('<script src="glass.js"></script>', '<script>' + chr(10) + gjs + '</script>')
assert 'Thmanyah' not in gcss + gjs

# Review chrome: a visible draft label, and a note button wired to the viewer's comment composer.
T = {
  'en': dict(tag='Draft v2 · for review', tagtitle='A working draft shared for review. This is not the live website.',
             btn='Add a note here', busy='Finish or close the note that is already open, then try again.',
             wait='One moment, then try again.', off='Notes are not available in this view. Open the link while signed in to claude.ai.'),
  'ar': dict(tag='مسودة ٢ · للمراجعة', tagtitle='مسودة عمل للمراجعة، وليست الموقع الرسمي.',
             btn='أضف ملاحظة هنا', busy='أكمل الملاحظة المفتوحة أو أغلقها، ثم حاول مرة أخرى.',
             wait='لحظة، ثم حاول مرة أخرى.', off='الملاحظات غير متاحة هنا. افتح الرابط بعد تسجيل الدخول إلى claude.ai.'),
}[lang]
css = """
  /* ---------------------------------------------------- review chrome ---- */
  .site-bar { padding-top: env(safe-area-inset-top, 0px); height: calc(var(--bar-h) + env(safe-area-inset-top, 0px)); }
  .draft-tag { font-size: .66rem; color: #8A5A3C; border: 1px dashed #A64452; padding: .2rem .5rem; white-space: nowrap; }
  .note-btn { position: fixed; z-index: 60; inset-inline-end: 16px; bottom: calc(16px + env(safe-area-inset-bottom, 0px));
    display: inline-flex; align-items: center; gap: .5rem; padding: .7rem 1rem; cursor: pointer;
    font: 700 .85rem/1 "Almarai", system-ui, sans-serif;
    background: #F5E6DA; color: #702030; border: 1px solid #702030; box-shadow: 0 6px 20px rgba(43,20,24,.18); }
  .note-btn:hover { background: #702030; color: #F5E6DA; }
  .note-btn:focus-visible { outline: 2px solid #D9A441; outline-offset: 2px; }
  .note-btn svg { width: 14px; height: 16px; }
  .note-hint { position: fixed; z-index: 60; inset-inline-end: 16px; bottom: calc(68px + env(safe-area-inset-bottom, 0px));
    max-width: 17rem; font-size: .85rem; background: #2B1418; color: #F5E6DA; padding: .6rem .8rem; }
  @media (max-width: 860px) { .draft-tag { display: none; } .note-btn { top: calc(var(--bar-h) + 12px); bottom: auto; padding: .6rem .7rem; } .note-btn .nb-label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; } .note-hint { top: calc(var(--bar-h) + 64px); bottom: auto; } }
</style>"""
s = s.replace('\n</style>', css, 1)
m = re.search(r'<a class="mark[^"]*"[^>]*>.*?</a>', s, flags=re.S)
s = s[:m.end()] + f'\n  <span class="draft-tag" title="{T["tagtitle"]}">{T["tag"]}</span>' + s[m.end():]
btn = f"""<div data-uncommentable>
  <button class="note-btn" id="note-btn" type="button" hidden>
    <svg viewBox="0 0 18 22" aria-hidden="true"><path d="M1.5 21V9a7.5 7.5 0 0 1 15 0v12" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
    <span class="nb-label">{T['btn']}</span>
  </button>
  <p class="note-hint" id="note-hint" role="status" hidden></p>
</div>
"""
s = s.replace('<main id="top">', btn + '\n<main id="top">', 1)
js = f"""<script>
  // Review notes. The claude.ai viewer keeps every note as a comment thread on this page.
  // The button only opens the viewer's own composer, pinned to what is in the middle of the screen.
  (async function () {{
    if (!window.claude || !window.claude.use) return;
    var comments = await window.claude.use('comments');
    if (!comments) return;
    var btn = document.getElementById('note-btn');
    var hint = document.getElementById('note-hint');
    var BLOCKS = 'h1,h2,h3,p,figure,li,article,.house__in,.rail__end,.foot,[data-sc-stage]';
    function target() {{
      var el = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
      return (el && el.closest(BLOCKS)) || el || document.querySelector('main');
    }}
    function say(text) {{
      hint.textContent = text; hint.hidden = false;
      clearTimeout(say.t); say.t = setTimeout(function () {{ hint.hidden = true; }}, 4000);
    }}
    btn.hidden = false;
    btn.addEventListener('click', async function () {{
      try {{
        var r = await comments.openComposer({{ element: target() }});
        if (!r.opened) say({T['busy']!r});
      }} catch (e) {{
        if (e && e.code === 'rate_limited') {{ say({T['wait']!r}); return; }}
        btn.hidden = true;
        say({T['off']!r});
      }}
    }});
  }})();
</script>
"""
s = s.rstrip('\n') + '\n' + js
open(f'{S}/review/out/{out}', 'w', encoding='utf-8').write(s)
print(out, len(s), 'fonts-local' in s, s.count('assets/type/'))
