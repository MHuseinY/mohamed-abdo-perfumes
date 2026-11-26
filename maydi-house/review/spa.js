/* The router of the single-document review site. Runs after site.js (MAYDI) and before glass.js.
   Routes (the hash):
     #home, #ar              the two homepages, full-screen iframes made from window.MAYDI_HOMES
     #boutique, #atelier ... the English inner pages, as views of this document
     #p-<slug>               an English product
     #contact[.topic[.item]] the English enquiry page, optionally prefilled
     #ar-boutique, #ar-p-<slug>, #ar-contact.topic.item ...   the same, in Arabic
   Nothing here ever loads another document: a link is a hash change. */
(function () {
  var PAGES = ['boutique', 'atelier', 'factory', 'botanicals', 'mohamed-abdo', 'contact'];
  var HOME_TITLES = { home: 'Maydi House', ar: 'مايدي هاوس' };
  var HOME_LABELS = { home: 'Maydi House homepage, English', ar: 'الصفحة الرئيسية لمايدي هاوس، بالعربية' };
  var NOTE_LABEL = { en: 'Add a note here', ar: 'أضف ملاحظة هنا' };
  var doc = document.documentElement;
  var titles = window.MAYDI_TITLES || {};
  var started = {};      // views whose script-built parts are already drawn

  // ---- the two homepages: full-screen iframes, created on first visit and kept, so each remembers its scroll
  var HOMES = window.MAYDI_HOMES || {};
  function showHome(name) {
    doc.classList.add('on-home');
    doc.lang = name === 'ar' ? 'ar' : 'en'; doc.dir = name === 'ar' ? 'rtl' : 'ltr';
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
    noteLabel(name === 'ar' ? 'ar' : 'en');
  }
  function hideHome() {
    doc.classList.remove('on-home');
    [].forEach.call(document.querySelectorAll('.home-frame'), function (f) { f.classList.remove('is-on'); });
  }
  window.addEventListener('message', function (e) {
    var d = e.data, ok = [].some.call(document.querySelectorAll('.home-frame'), function (f) { return f.contentWindow === e.source; });
    if (!ok || !d || typeof d.maydiGo !== 'string' || !/^#[A-Za-z0-9._-]+$/.test(d.maydiGo)) return;
    if (location.hash === d.maydiGo) route(); else location.hash = d.maydiGo;
  });

  function noteLabel(l) { var n = document.querySelector('.note-btn .nb-label'); if (n) n.textContent = NOTE_LABEL[l]; }

  function show(viewId) {
    [].forEach.call(document.querySelectorAll('.view'), function (v) { v.hidden = v.id !== viewId; });
  }

  function route() {
    var raw = location.hash.slice(1) || 'home';
    MAYDI.hash = '#' + raw;
    if ((raw === 'home' || raw === 'ar') && HOMES[raw]) { showHome(raw); return; }
    hideHome();
    var lang = /^ar-/.test(raw) ? 'ar' : 'en';
    var pre = lang === 'ar' ? 'ar-' : '';
    // in-page anchors (#process, #ar-process): an element that is not a view
    var anchor = document.getElementById(raw);
    if (anchor && !anchor.classList.contains('view')) { anchor.scrollIntoView(); return; }
    var h = lang === 'ar' ? raw.slice(3) : raw;
    var parts = h.split('.'), name = parts[0], navKey = name, product = null;
    if (name.indexOf('p-') === 0) {
      product = name.slice(2);
      if (!MAYDI.product(product, lang)) { location.replace('#' + pre + 'boutique'); return; }
      name = 'product';
    }
    if (name !== 'product' && PAGES.indexOf(name) < 0) { location.replace('#' + pre + 'boutique'); return; }
    var viewId = 'v-' + pre + name, view = document.getElementById(viewId);

    // the language of the document follows the view
    MAYDI.setLang(lang);
    doc.lang = lang; doc.dir = lang === 'ar' ? 'rtl' : 'ltr';
    noteLabel(lang);

    // script-built parts: the product page is rebuilt every time, the others once (the contact form is refilled every time)
    if (product) navKey = MAYDI.renderProduct(product, view, lang);
    else if (!started[viewId]) {
      started[viewId] = true;
      if (name === 'boutique') MAYDI.initBoutique(view, lang);
      if (name === 'mohamed-abdo') MAYDI.initFounder(view, lang);
    }
    if (name === 'contact') MAYDI.initContact(view, { topic: parts[1], item: parts[2] }, lang);

    MAYDI.renderChrome(lang, navKey);
    if (window.maydiGlass) window.maydiGlass.setLang(lang);
    show(viewId);
    document.title = product ? document.title : (titles[pre + name] || STR_FALLBACK[lang]);
    window.scrollTo(0, 0);
    window.maydiReveal(view);
  }
  var STR_FALLBACK = { en: 'Maydi House', ar: 'مايدي هاوس' };

  window.addEventListener('hashchange', route);
  // The header, the phone menu and the footer must exist before glass.js starts (it looks for the menu), even when the first route is a homepage.
  MAYDI.renderChrome(doc.lang === 'ar' ? 'ar' : 'en', '');
  route();
})();
