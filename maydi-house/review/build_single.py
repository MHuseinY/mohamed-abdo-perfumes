# Builds ONE document for the whole review site, so no link ever loads a second page.
#   #home (default)  the English homepage, in a full-screen iframe (srcdoc)
#   #ar              the Arabic homepage, same way
#   #boutique ...    the inner pages, as views of this document (as before)
# The homepages keep their own scroll engine inside their iframes. Their links to other parts of the site are turned into
# postMessage calls that change this document's hash, so navigation is only ever a hash change.
# usage: python build_single.py   (run build.py en/ar ... pages.html and build_pages.py '#home' first)
import json, pathlib, re
R = pathlib.Path(__file__).resolve().parent.parent
PUB = R / 'review' / 'out'
en = (PUB / 'maydi-house-homepage-share.html').read_text(encoding='utf-8')
ar = (PUB / 'maydi-house-arabic-share.html').read_text(encoding='utf-8')
pages = (PUB / 'maydi-house-pages.html').read_text(encoding='utf-8')

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
    # the three fragments must carry no font files and no references to other documents
    assert 'fonts-local' not in html and 'assets/type' not in html
    return html

homes = {'home': child(en, 'en'), 'ar': child(ar, 'ar', ' dir="rtl"')}
# every link that left the homepage for another document must be one the child script maps
for k, h in homes.items():
    for m in re.finditer(r'href="([^"#][^"]*\.html[^"]*)"', h):
        assert re.match(r'(pages\.html#.+|ar\.html|index\.html)$', m.group(1)), (k, m.group(1))

def js_str(s):                      # safe to put inside an inline <script>
    return json.dumps(s, ensure_ascii=False).replace('<', '\\u003c').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')

# ---- the shell is the pages build, with two extra routes
shell = pages
assert shell.count('href="ar.html"') == 2
shell = shell.replace('href="ar.html"', 'href="#ar"')
old = "      var h = location.hash.slice(1) || 'boutique';\n"
assert shell.count(old) == 1
shell = shell.replace(old, "      var h = location.hash.slice(1) || 'home';\n      if (h === 'home' || h === 'ar') { showHome(h); return; }\n      hideHome();\n")
old = "    function route() {"
assert shell.count(old) == 1
home_js = r'''    // ---- the two homepages: full-screen iframes, created on first visit and kept so each remembers its scroll
    var HOMES = __HOMES__;
    var HOME_TITLES = { home: 'Maydi House', ar: 'مايدي هاوس' };
    var HOME_LABELS = { home: 'Maydi House homepage, English', ar: 'الصفحة الرئيسية لمايدي هاوس، بالعربية' };
    function showHome(name) {
      document.documentElement.classList.add('on-home');
      ['home', 'ar'].forEach(function (k) {
        var f = document.getElementById('home-' + k);
        if (k === name) {
          if (!f) {
            f = document.createElement('iframe'); f.id = 'home-' + k; f.className = 'home-frame';
            f.title = HOME_LABELS[k]; f.srcdoc = HOMES[k]; document.body.appendChild(f);
          }
          f.classList.add('is-on');
        } else if (f) f.classList.remove('is-on');
      });
      document.title = HOME_TITLES[name];
    }
    function hideHome() {
      document.documentElement.classList.remove('on-home');
      [].forEach.call(document.querySelectorAll('.home-frame'), function (f) { f.classList.remove('is-on'); });
    }
    window.addEventListener('message', function (e) {
      var d = e.data, ok = [].some.call(document.querySelectorAll('.home-frame'), function (f) { return f.contentWindow === e.source; });
      if (!ok || !d || typeof d.maydiGo !== 'string' || !/^#[A-Za-z0-9._-]+$/.test(d.maydiGo)) return;
      if (location.hash === d.maydiGo) route(); else location.hash = d.maydiGo;
    });

'''.replace('__HOMES__', '{"home": ' + js_str(homes['home']) + ', "ar": ' + js_str(homes['ar']) + '}')
shell = shell.replace(old, home_js + old)

css = '''
/* ---------------------------------------------------- the homepages ---- */
.home-frame { position: fixed; inset: 0; width: 100%; height: 100%; height: 100dvh; border: 0; background: #F5E6DA; display: none; z-index: 40; }
.home-frame.is-on { display: block; }
.on-home, .on-home body { overflow: hidden; }
.on-home [data-site-bar], .on-home #views, .on-home [data-site-foot], .on-home .dock, .on-home .menu-panel { display: none !important; }
</style>
'''
i = shell.index('</style>')
shell = shell[:i] + css.rstrip('\n').rsplit('</style>', 1)[0] + shell[i:]
assert 'showHome' in shell and 'home-frame' in shell and shell.count('maydiGo') >= 2
out = PUB / 'maydi-house-single.html'
out.write_text(shell, encoding='utf-8')
print(out.name, len(shell), 'bytes; homes', {k: len(v) for k, v in homes.items()})
