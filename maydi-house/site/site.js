/* Shared chrome, strings and renderers for the inner pages, in English and Arabic.
   Two ways to run it:
     - the standalone pages (boutique.html, ar-boutique.html ...): links are files;
     - the single-document review site, which sets window.MAYDI_HASH_LINKS = true first: links are #hash routes.
   The pages call MAYDI.* for everything that is built by script, so the two ways never drift apart. */
(function () {
  var doc = document.documentElement;
  doc.classList.add('js');
  var HASH = !!window.MAYDI_HASH_LINKS;
  var M = window.MAYDI = window.MAYDI || {};

  // The mark: a pointed arch, the M, a sprig rising from a drop of resin (brand/maydi-house-mark.svg, drawn inline for the header).
  var ARCH = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 76" aria-hidden="true"><g fill="none" stroke="#702030" stroke-linecap="round" stroke-linejoin="round"><path d="M20 64H2V31C2 17 15 8 32 1C49 8 62 17 62 31V64H44" stroke-width="2.6"/><path d="M14 64V27L32 47L50 27V64" stroke-width="2.4"/></g><path d="M32 54V20" fill="none" stroke="#3A6351" stroke-width="2" stroke-linecap="round"/><g fill="#3A6351"><ellipse cx="32" cy="14" rx="2.9" ry="6"/><ellipse cx="26.2" cy="25.5" rx="4.6" ry="2.3" transform="rotate(-38 26.2 25.5)"/><ellipse cx="37.8" cy="25.5" rx="4.6" ry="2.3" transform="rotate(38 37.8 25.5)"/><ellipse cx="26.6" cy="34.5" rx="4.4" ry="2.2" transform="rotate(-32 26.6 34.5)"/><ellipse cx="37.4" cy="34.5" rx="4.4" ry="2.2" transform="rotate(32 37.4 34.5)"/></g><path d="M32 53C32 53 25.5 61.5 25.5 66.2A6.5 6.5 0 0 0 38.5 66.2C38.5 61.5 32 53 32 53Z" fill="#D9A441" stroke="#702030" stroke-width="2" stroke-linejoin="round"/></svg>';
  var NAV = ['atelier', 'factory', 'boutique', 'botanicals', 'mohamed-abdo'];
  var PAGE = location.pathname.split('/').pop() || 'index.html';
  // The house's WhatsApp, given by the client on 2026-10-07 (digits only, as wa.me wants them).
  var WA = '252610161810';
  M.whatsapp = 'https://wa.me/' + WA;

  // ------------------------------------------------------------------ strings --
  var STR = {
    en: {
      brand: 'Maydi House', homeAria: 'Maydi House, home', home: 'Home', homeSub: 'The homepage', mainAria: 'Main',
      nav: { atelier: 'Atelier', factory: 'Factory', boutique: 'Boutique', botanicals: 'Botanicals', 'mohamed-abdo': 'Mohamed Abdo' },
      sub: { atelier: 'Bespoke design', factory: 'Under construction', boutique: 'Curated fragrances', botanicals: 'Raw materials', 'mohamed-abdo': 'Founder and perfumer' },
      cta: 'Partner with us', menu: 'Menu', close: 'Close', langNow: 'EN', langOther: 'العربية', langTitle: 'Arabic version',
      draftTitle: 'A working draft shared for review. This is not the live website.',
      foot: { blurb: 'A Somali fragrance house in Mogadishu, named after Maydi, the rarest frankincense in the world.',
              houses: 'Houses', houseNames: { atelier: 'Maydi Atelier', factory: 'Maydi Factory', boutique: 'Maydi Boutique', botanicals: 'Maydi Botanicals' },
              the: 'The house', contact: 'Contact', where: 'Mogadishu, Somalia', instagram: 'Instagram', whatsapp: 'WhatsApp',
              rights: '© 2026 Maydi House', licensed: 'Officially licensed in Mogadishu' },
      price: 'Price', sold: 'Sold out', sep: ', ',
      by: function (p) { return p.name + ' by ' + p.houseLabel; },
      houseLine: function (p) { return '<bdi>' + p.houseLabel + '</bdi> · ' + p.line; },
      pdp: { missingTitle: 'We could not find that fragrance.', missingBody: 'It may have left the shelf.', missingLink: 'Return to the Boutique',
             atelierBtn: 'Request this formula for your brand', atelierNote: 'A ready formula by Mohamed Abdo, released under your own name.',
             add: 'Add to bag', addTitle: 'Online ordering comes later', order: 'Order through the house',
             orderNote: 'Online ordering opens later. For now, the house takes orders on WhatsApp.',
             priceAtelier: 'Formula pricing on request', priceShop: 'Prices to be announced', size: 'Size',
             priceFor: function (s) { return 'Price of the ' + s + ' bottle'; },
             formulaNote: 'Also a ready formula for brands.', formulaLink: 'Request the formula',
             notes: 'The notes', keyNotes: 'Key notes', notesLabel: 'Notes', top: 'Top', heart: 'Heart', base: 'Base', accords: 'Accords', soon: 'To come',
             more: function (h) { return 'More from ' + h; }, homeAtelier: 'Maydi Atelier', homeFounder: 'Mohamed Abdo', homeShop: 'Maydi Boutique' },
      boutique: { one: ' fragrance', many: ' fragrances', plus: ', plus King Maydi above',
                  count: function (n, all) { return n + (n === 1 ? this.one : this.many) + (all ? this.plus : ''); } },
      contact: { atelierMsg: 'I am interested in the ready formula ', orderMsg: 'I would like to order ',
                 hello: 'Hello Maydi House,', name: 'Name', company: 'Company or brand', email: 'Email', country: 'Country', topic: 'Regarding',
                 subject: 'Enquiry from the website', need: 'Please add your name and a short message.',
                 opening: 'Opening WhatsApp with your message ready to send.', ifNot: 'If it does not open:', openWa: 'Open WhatsApp', viaMail: 'send it by email instead' }
    },
    ar: {
      brand: 'مايدي هاوس', homeAria: 'مايدي هاوس، الصفحة الرئيسية', home: 'الرئيسية', homeSub: 'الصفحة الرئيسية', mainAria: 'القائمة الرئيسية',
      nav: { atelier: 'تصميم العطور', factory: 'التصنيع', boutique: 'البوتيك', botanicals: 'المواد الخام', 'mohamed-abdo': 'محمد عبده' },
      sub: { atelier: 'تصميم حسب الطلب', factory: 'قيد الإنشاء', boutique: 'عطور مختارة', botanicals: 'مواد خام', 'mohamed-abdo': 'المؤسس والعطّار' },
      cta: 'ابدأ شراكة', menu: 'القائمة', close: 'إغلاق', langNow: 'العربية', langOther: 'EN', langTitle: 'English version',
      draftTitle: 'مسودة عمل للمراجعة، وليست الموقع الرسمي.',
      foot: { blurb: 'دار عطور صومالية في مقديشو، تحمل اسم المايدي، أثمن لبان في العالم.',
              houses: 'الأقسام', houseNames: { atelier: 'مايدي أتيليه', factory: 'مايدي فاكتوري', boutique: 'مايدي بوتيك', botanicals: 'مايدي بوتانيكالز' },
              the: 'الدار', contact: 'التواصل', where: 'مقديشو، الصومال', instagram: 'إنستغرام', whatsapp: 'واتساب',
              rights: '© 2026 مايدي هاوس', licensed: 'مرخّصة رسمياً في مقديشو' },
      price: 'السعر', sold: 'نفدت الكمية', sep: '، ',
      by: function (p) { return p.name + ' من ' + p.houseLabel; },
      houseLine: function (p) { return '<bdi>' + p.houseLabel + '</bdi> · ' + p.line; },
      pdp: { missingTitle: 'لم نجد هذا العطر.', missingBody: 'ربما غادر الرفّ.', missingLink: 'عد إلى البوتيك',
             atelierBtn: 'اطلب هذه التركيبة لعلامتك', atelierNote: 'تركيبة جاهزة من محمد عبده، تُطلق باسم علامتك.',
             add: 'أضف إلى السلة', addTitle: 'الطلب عبر الإنترنت يأتي لاحقاً', order: 'اطلب عبر الدار',
             orderNote: 'يُفتح الطلب عبر الإنترنت لاحقاً. حالياً تستقبل الدار الطلبات عبر واتساب.',
             priceAtelier: 'سعر التركيبة عند الطلب', priceShop: 'تُعلن الأسعار لاحقاً', size: 'الحجم',
             priceFor: function (s) { return 'سعر زجاجة ' + s; },
             formulaNote: 'وهو أيضاً تركيبة جاهزة للعلامات التجارية.', formulaLink: 'اطلب التركيبة',
             notes: 'النوتات', keyNotes: 'النوتات الرئيسية', notesLabel: 'النوتات', top: 'العليا', heart: 'القلب', base: 'القاعدة', accords: 'الأكوردات', soon: 'قريباً',
             more: function (h) { return 'المزيد من ' + h; }, homeAtelier: 'مايدي أتيليه', homeFounder: 'محمد عبده', homeShop: 'مايدي بوتيك' },
      boutique: { plus: '، إضافة إلى كينغ مايدي أعلاه',
                  // Arabic counting: 1 and 2 have their own forms, 3 to 10 take the plural, 11 and up take the singular after the number.
                  count: function (n, all) {
                    var s = n === 1 ? 'عطر واحد' : n === 2 ? 'عطران' : n <= 10 ? n + ' عطور' : n + ' عطراً';
                    return s + (all ? this.plus : '');
                  } },
      contact: { atelierMsg: 'أرغب في التركيبة الجاهزة ', orderMsg: 'أرغب في طلب ',
                 hello: 'مرحباً مايدي هاوس،', name: 'الاسم', company: 'الشركة أو العلامة', email: 'البريد الإلكتروني', country: 'الدولة', topic: 'بخصوص',
                 subject: 'استفسار من الموقع', need: 'أضف اسمك ورسالة قصيرة.',
                 opening: 'نفتح واتساب برسالتك جاهزة للإرسال.', ifNot: 'إن لم يُفتح:', openWa: 'افتح واتساب', viaMail: 'أو أرسلها بالبريد الإلكتروني' }
    }
  };
  var LANG = doc.lang === 'ar' ? 'ar' : 'en';
  M.lang = function () { return LANG; };
  M.setLang = function (l) { LANG = l === 'ar' ? 'ar' : 'en'; };
  var S = function (l) { return STR[l || LANG]; };

  // -------------------------------------------------------------------- links --
  // kind: home | page(name) | product(slug) | contact(topic, item)
  function link(l, kind, a, b) {
    var ar = l === 'ar', pre = ar ? 'ar-' : '';
    if (kind === 'home') return HASH ? (ar ? '#ar' : '#home') : (ar ? 'ar.html' : 'index.html');
    if (kind === 'page') return HASH ? '#' + pre + a : pre + a + '.html';
    if (kind === 'product') return HASH ? '#' + pre + 'p-' + a : pre + 'product.html?p=' + a;
    if (kind === 'contact') {
      if (HASH) return '#' + pre + 'contact' + (a ? '.' + a + (b ? '.' + b : '') : '');
      return pre + 'contact.html' + (a ? '?topic=' + a + (b ? '&' + (a === 'atelier' ? 'formula' : 'item') + '=' + b : '') : '');
    }
  }
  M.link = link;
  // The same page in the other language.
  function otherHref(toLang) {
    if (HASH) {
      var h = M.hash || location.hash || '', isAr = /^#ar-/.test(h);
      if (toLang === 'ar') return isAr ? h : '#ar-' + (h.slice(1) || 'boutique');
      return isAr ? '#' + h.slice(4) : (h || '#boutique');
    }
    var name = PAGE.replace(/^ar-/, '');
    return (toLang === 'ar' ? 'ar-' + name : name) + location.search;
  }

  // ------------------------------------------------------------------- chrome --
  var bar = document.querySelector('[data-site-bar]');
  var barMain, menuBtn, menuPanel, menuMark, menuClose, menuLinks, menuFoot;
  function buildChromeFrame() {
    bar.className = 'site-bar';
    bar.innerHTML = '<div class="bar-main"></div><button class="menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="menu"></button>';
    bar.insertAdjacentHTML('afterend',
      '<div class="menu-panel" id="menu" role="dialog" aria-modal="true" hidden>' +
        '<div class="menu-head"><span data-menu-mark></span><button class="menu-close" id="menu-close" type="button"></button></div>' +
        '<nav class="menu-links"></nav><div class="menu-foot"></div></div>');
    barMain = bar.querySelector('.bar-main');
    menuBtn = document.getElementById('menu-btn'); menuPanel = document.getElementById('menu');
    menuMark = menuPanel.querySelector('[data-menu-mark]'); menuClose = document.getElementById('menu-close');
    menuLinks = menuPanel.querySelector('.menu-links'); menuFoot = menuPanel.querySelector('.menu-foot');
    var setMenu = function (open) {
      menuPanel.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open));
      doc.style.overflow = open ? 'hidden' : '';
      (open ? menuClose : menuBtn).focus();
    };
    menuBtn.addEventListener('click', function () { setMenu(true); });
    menuClose.addEventListener('click', function () { setMenu(false); });
    menuPanel.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menuPanel.hidden) setMenu(false); });
  }
  var foot = document.querySelector('[data-site-foot]');

  // Draws the bar, the phone menu and the footer in one language. `section` is the nav key that is current (or '').
  M.renderChrome = function (l, section) {
    l = l === 'ar' ? 'ar' : 'en'; var T = S(l);
    if (bar) {
      if (!barMain) buildChromeFrame();
      var cur = function (k) { return k === section ? ' aria-current="page"' : ''; };
      var draft = window.MAYDI_DRAFT ? '<span class="draft-tag" title="' + T.draftTitle + '">' + window.MAYDI_DRAFT[l] + '</span>' : '';
      var langHtml = '<div class="lang"><span aria-current="true">' + T.langNow + '</span><span aria-hidden="true">|</span>' +
        '<a ' + (l === 'en' ? 'class="ar" lang="ar"' : 'lang="en"') + ' href="' + otherHref(l === 'en' ? 'ar' : 'en') + '" title="' + T.langTitle + '">' + T.langOther + '</a></div>';
      barMain.innerHTML =
        '<a class="mark caps" href="' + link(l, 'home') + '" aria-label="' + T.homeAria + '">' + ARCH + T.brand + '</a>' + draft +
        '<nav aria-label="' + T.mainAria + '">' +
          NAV.map(function (k) { return '<a class="caps" href="' + link(l, 'page', k) + '" data-nav="' + k + '"' + cur(k) + '>' + T.nav[k] + '</a>'; }).join('') +
          '<a class="caps bar-cta" href="' + link(l, 'contact') + '" data-nav="contact"' + cur('contact') + '>' + T.cta + '</a>' +
        '</nav>' + langHtml;
      menuBtn.innerHTML = '<i aria-hidden="true"></i>' + T.menu;
      menuPanel.setAttribute('aria-label', T.menu);
      menuMark.innerHTML = '<a class="mark caps" href="' + link(l, 'home') + '">' + ARCH + T.brand + '</a>';
      menuClose.textContent = T.close;
      menuLinks.innerHTML = (HASH ? '<a href="' + link(l, 'home') + '">' + T.home + '<small>' + T.homeSub + '</small></a>' : '') +
        NAV.map(function (k) { return '<a href="' + link(l, 'page', k) + '" data-nav="' + k + '"' + cur(k) + '>' + T.nav[k] + '<small>' + T.sub[k] + '</small></a>'; }).join('');
      menuFoot.innerHTML = '<a class="btn" href="' + link(l, 'contact') + '">' + T.cta + '</a>' + langHtml;
    }
    if (foot) {
      foot.className = 'foot';
      var F = T.foot;
      var email = HASH ? 'maydihouse@gmail.com' : '<a href="mailto:maydihouse@gmail.com">maydihouse@gmail.com</a>';
      foot.innerHTML =
        '<div class="wrap"><div class="cols">' +
          '<div><div class="brand">' + T.brand + '</div><p style="margin-top:.6rem;max-width:30ch">' + F.blurb + '</p></div>' +
          '<div><h4>' + F.houses + '</h4><ul>' + ['atelier', 'factory', 'boutique', 'botanicals'].map(function (k) {
            return '<li><a href="' + link(l, 'page', k) + '">' + F.houseNames[k] + '</a></li>'; }).join('') + '</ul></div>' +
          '<div><h4>' + F.the + '</h4><ul><li><a href="' + link(l, 'page', 'mohamed-abdo') + '">' + T.nav['mohamed-abdo'] + '</a></li>' +
            '<li><a href="' + link(l, 'contact') + '">' + T.cta + '</a></li><li><a href="' + link(l, 'home') + '">' + T.home + '</a></li></ul></div>' +
          '<div><h4>' + F.contact + '</h4><ul><li>' + F.where + '</li><li>' + email + '</li>' +
            '<li><a href="https://www.instagram.com/maydihouse/" rel="noopener">' + F.instagram + '</a></li><li><a href="' + M.whatsapp + '" rel="noopener">' + F.whatsapp + '</a></li></ul></div>' +
        '</div><div class="small"><span>' + F.rights + '</span><span>' + F.licensed + '</span></div></div>';
    }
  };

  // The standalone pages draw their chrome now; the single-document site draws its own on every route.
  var sectionKey = (document.body.getAttribute('data-section') || PAGE).replace(/^ar-/, '').replace(/\.html$/, '');
  if (!window.MAYDI_NO_AUTO_CHROME) M.renderChrome(LANG, NAV.indexOf(sectionKey) > -1 || sectionKey === 'contact' ? sectionKey : '');

  // Links for pages or features that do not exist yet: no navigation, no jump.
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[aria-disabled="true"]');
    if (a) e.preventDefault();
  });

  // Gentle entrance for blocks marked .rv; everything is visible without JS.
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  window.maydiReveal = function (root) {
    (root || document).querySelectorAll('.rv:not(.in)').forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); });
  };
  window.maydiReveal();

  // ----------------------------------------------------------------- products --
  // A product in the current (or a given) language. The English record is the base; Arabic overlays it.
  function localize(p, l) {
    var out = {}, k, ov = l === 'ar' && window.MAYDI_PRODUCTS_AR ? window.MAYDI_PRODUCTS_AR[p.slug] : null;
    for (k in p) out[k] = p[k];
    if (ov) for (k in ov) out[k] = ov[k];
    out.houseLabel = l === 'ar' && p.house === 'Mohamed Abdo' ? 'محمد عبده' : p.house;
    return out;
  }
  M.product = function (slug, l) {
    var p = (window.MAYDI_PRODUCTS || []).filter(function (x) { return x.slug === slug; })[0];
    return p ? localize(p, l || LANG) : null;
  };
  M.products = function (l) { return (window.MAYDI_PRODUCTS || []).map(function (p) { return localize(p, l || LANG); }); };
  window.maydiProduct = function (slug) { return M.product(slug); };

  function frame(p, l, cls) {
    var T = S(l);
    return p.img
      ? '<div class="frame' + (cls || '') + '"><img src="' + p.img + '" alt="' + (p.alt || T.by(p)) + '" loading="lazy"></div>'
      : '<div class="frame ph' + (cls || '') + '"><span class="ph-name">' + p.name + '</span><span class="ph-note">Image from the house, pending permission</span></div>';
  }
  // A price the house has given us, or the empty slot. US dollars; the digits stay left to right inside Arabic text.
  function priceTag(p, T) {
    return p.price ? '<span class="price" dir="ltr">$' + p.price + '</span>' : '<span class="price-slot">' + T.price + '</span>';
  }
  M.card = function (p, l) {
    l = l || LANG; var T = S(l);
    return '<a class="card" href="' + link(l, 'product', p.slug) + '">' + frame(p, l) +
      '<div class="house">' + T.houseLine(p) + '</div><h3><bdi>' + p.name + '</bdi></h3>' +
      '<div class="meta"><span>' + p.sizes.join(' · ') + (p.soldOut ? ' · ' + T.sold : '') + '</span>' + priceTag(p, T) + '</div></a>';
  };
  window.maydiCard = function (p) { return M.card(p); };

  // The boutique shelf: filters and the grid. `root` is the page (or the view) that holds the markup.
  M.initBoutique = function (root, l) {
    l = l || LANG; var T = S(l);
    root = root || document;
    var shelf = M.products(l).filter(function (p) { return p.house === 'Zakir Gafur'; });
    var rest = shelf.filter(function (p) { return !p.featured; });
    var grid = root.querySelector('#grid'), count = root.querySelector('#count'), filters = root.querySelector('#filters');
    root.querySelector('#count-all').textContent = shelf.length;
    function render(f) {
      var list = f === 'all' ? rest : rest.filter(function (p) { return p.group === f; });
      grid.innerHTML = list.map(function (p) { return M.card(p, l); }).join('');
      count.textContent = T.boutique.count(list.length, f === 'all');
      window.maydiReveal(grid);
    }
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      this.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      render(b.getAttribute('data-f'));
    });
    render('all');
  };

  // The founder page: his two perfumes.
  M.initFounder = function (root, l) {
    root = root || document;
    root.querySelector('#works').innerHTML = ['timbrose-ii', 'timbrose'].map(function (s) { return M.card(M.product(s, l || LANG), l || LANG); }).join('');
    window.maydiReveal(root.querySelector('#works'));
  };

  // The enquiry form. topic and item prefill the topic and the message. Sending opens WhatsApp with the message written out
  // (the house takes enquiries there), and offers the same text by email as the fallback. No server is involved.
  M.initContact = function (root, ctx, l) {
    l = l || LANG; var T = S(l), C = T.contact; root = root || document; ctx = ctx || {};
    var sel = root.querySelector('#f-topic'), msg = root.querySelector('#f-message'), form = root.querySelector('#enquiry');
    if (ctx.topic && sel.querySelector('option[value="' + ctx.topic + '"]')) sel.value = ctx.topic;
    var p = ctx.item ? M.product(ctx.item, l) : null;
    if (p) msg.value = (ctx.topic === 'atelier' ? C.atelierMsg : C.orderMsg) + p.name + ' (' + p.houseLabel + ').\n\n';
    if (form.getAttribute('data-bound')) return;
    form.setAttribute('data-bound', '1');
    var val = function (id) { return (root.querySelector('#' + id).value || '').trim(); };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var s = root.querySelector('#form-status'); s.hidden = false;
      var who = val('f-name'), body = msg.value.trim();
      if (!who || !body) { s.textContent = C.need; (who ? msg : root.querySelector('#f-name')).focus(); return; }
      var lines = [C.hello, '', body, '', C.name + ': ' + who];
      [['f-company', C.company], ['f-email', C.email], ['f-country', C.country]].forEach(function (f) { if (val(f[0])) lines.push(f[1] + ': ' + val(f[0])); });
      lines.push(C.topic + ': ' + sel.options[sel.selectedIndex].text);
      var text = lines.join('\n');
      var wa = M.whatsapp + '?text=' + encodeURIComponent(text);
      var mail = 'mailto:maydihouse@gmail.com?subject=' + encodeURIComponent(C.subject) + '&body=' + encodeURIComponent(text);
      s.innerHTML = C.opening + ' ' + C.ifNot + ' <a href="' + wa + '" target="_blank" rel="noopener">' + C.openWa + '</a> · <a href="' + mail + '">' + C.viaMail + '</a>';
      window.open(wa, '_blank', 'noopener');
    });
  };
  // The page's query string, for the standalone contact page.
  M.queryCtx = function () {
    var q = new URLSearchParams(location.search);
    return { topic: q.get('topic'), item: q.get('formula') || q.get('item') };
  };

  // One product page. Returns the nav key it belongs to (so the caller can mark it current).
  M.renderProduct = function (slug, root, l) {
    l = l || LANG; var T = S(l), P = T.pdp;
    var p = M.product(slug, l);
    if (!p) {
      root.innerHTML = '<div class="missing"><h1>' + P.missingTitle + '</h1><p class="muted" style="margin-top:1rem">' + P.missingBody + ' <a href="' + link(l, 'page', 'boutique') + '">' + P.missingLink + '</a>.</p></div>';
      return null;
    }
    var home = p.house === 'Mohamed Abdo'
      ? (p.group === 'atelier' ? ['atelier', P.homeAtelier] : ['mohamed-abdo', P.homeFounder])
      : ['boutique', P.homeShop];
    document.title = p.name + ' · ' + p.houseLabel + ' · ' + T.brand;
    // Notes come as top, heart and base, or as one list when the house has not tiered them.
    var tiers = p.notes && !p.notes.list ? [[P.top, p.notes.top], [P.heart, p.notes.heart], [P.base, p.notes.base], [P.accords, null]] : null;
    var flat = p.notes && p.notes.list ? p.notes.list : (p.keyNotes && p.keyNotes.length ? p.keyNotes : null);
    var join = function (a) { return a.join(T.sep); };
    var notesHtml = tiers
      ? '<div class="pyramid"><h2>' + P.notes + '</h2>' + tiers.map(function (t) {
          return '<div class="tier"><b>' + t[0] + '</b><p' + (t[1] ? '' : ' class="muted"') + '>' + (t[1] ? join(t[1]) : P.soon) + '</p></div>';
        }).join('') + '</div>'
      : '<div class="pyramid"><h2>' + (p.notes && p.notes.list ? P.notes : flat ? P.keyNotes : P.notes) + '</h2><div class="tier"><b>' + P.notesLabel + '</b><p' +
          (flat ? '>' + join(flat) : ' class="muted">' + P.soon) + '</p></div></div>';
    var atelier = p.group === 'atelier';
    var buy = atelier
      ? '<a class="btn" href="' + link(l, 'contact', 'atelier', p.slug) + '">' + P.atelierBtn + '</a><p class="note">' + P.atelierNote + '</p>'
      : '<button class="btn" type="button" aria-disabled="true" title="' + P.addTitle + '">' + (p.soldOut ? T.sold : P.add) + '</button>' +
        '<a class="btn btn--ghost" href="' + link(l, 'contact', 'order', p.slug) + '">' + P.order + '</a><p class="note">' + P.orderNote + '</p>' +
        (p.formula ? '<p class="note">' + P.formulaNote + ' <a class="text-link" href="' + link(l, 'contact', 'atelier', p.slug) + '">' + P.formulaLink + '</a></p>' : '');
    var more = M.products(l).filter(function (x) { return x.slug !== p.slug && x.house === p.house && !x.featured; }).slice(0, 4);
    root.innerHTML =
      '<div class="crumbs" style="margin-top:2rem"><a href="' + link(l, 'home') + '">' + T.home + '</a> / <a href="' + link(l, 'page', home[0]) + '">' + home[1] + '</a> / <bdi>' + p.name + '</bdi></div>' +
      '<article class="pdp">' + frame(p, l) + '<div>' +
        '<div class="house">' + T.houseLine(p) + '</div><h1><bdi>' + p.name + '</bdi></h1><p class="kind">' + (p.kind || p.line) + '</p>' +
        (p.edition ? '<p class="edition"><span class="chip">' + p.edition + '</span></p>' : '') +
        '<div class="price-row">' + priceTag(p, T) + '<small>' + (p.price ? P.priceFor(p.sizes[0]) : atelier ? P.priceAtelier : P.priceShop) + '</small></div>' +
        '<div class="sizes"><div class="label">' + P.size + '</div><div class="opts">' +
          p.sizes.map(function (s, i) { return '<button type="button" aria-pressed="' + (i === 0) + '">' + s + '</button>'; }).join('') + '</div></div>' +
        '<div class="buy">' + buy + '</div><p class="story">' + p.summary + '</p>' + notesHtml +
      '</div></article>' +
      (more.length ? '<section class="more" style="padding-bottom:5rem"><h2>' + P.more(p.houseLabel) + '</h2><div class="grid">' + more.map(function (x) { return M.card(x, l); }).join('') + '</div></section>' : '');
    root.querySelector('.opts').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      this.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    });
    window.maydiReveal(root);
    return home[0];
  };
})();
