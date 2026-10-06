/* Shared chrome and helpers for the inner pages (v2 prototype). */
(function () {
  document.documentElement.classList.add('js');

  var ARCH = '<svg viewBox="0 0 18 22" aria-hidden="true"><path d="M1.5 21V9a7.5 7.5 0 0 1 15 0v12" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M9 9.5c0 0-2.2 3-2.2 4.4a2.2 2.2 0 0 0 4.4 0C11.2 12.5 9 9.5 9 9.5z" fill="#D9A441"/></svg>';
  var NAV = [
    ['atelier.html', 'Atelier'], ['factory.html', 'Factory'], ['boutique.html', 'Boutique'],
    ['botanicals.html', 'Botanicals'], ['mohamed-abdo.html', 'Mohamed Abdo']
  ];
  var here = location.pathname.split('/').pop() || 'index.html';
  var section = document.body.getAttribute('data-section') || here;

  var bar = document.querySelector('[data-site-bar]');
  if (bar) {
    bar.className = 'site-bar';
    bar.innerHTML =
      '<a class="mark caps" href="index.html" aria-label="Maydi House, home">' + ARCH + 'Maydi House</a>' +
      '<nav aria-label="Main">' +
        NAV.map(function (n) {
          return '<a class="caps" href="' + n[0] + '"' + (n[0] === section ? ' aria-current="page"' : '') + '>' + n[1] + '</a>';
        }).join('') +
        '<a class="caps bar-cta" href="contact.html"' + (section === 'contact.html' ? ' aria-current="page"' : '') + '>Partner with us</a>' +
      '</nav>' +
      '<div class="lang"><span aria-current="true">EN</span><span aria-hidden="true">|</span>' +
      '<span class="ar" lang="ar" role="link" aria-disabled="true" title="The Arabic version of this page comes after review">العربية</span></div>';
  }

  // Phone menu: everything the bar hides on small screens.
  if (bar) {
    var SUB = { 'atelier.html': 'Bespoke design', 'factory.html': 'Coming soon', 'boutique.html': 'Curated fragrances',
                'botanicals.html': 'Raw materials', 'mohamed-abdo.html': 'Founder and perfumer' };
    bar.insertAdjacentHTML('beforeend', '<button class="menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="menu"><i aria-hidden="true"></i>Menu</button>');
    bar.insertAdjacentHTML('afterend',
      '<div class="menu-panel" id="menu" role="dialog" aria-modal="true" aria-label="Menu" hidden>' +
        '<div class="menu-head"><a class="mark caps" href="index.html">' + ARCH + 'Maydi House</a><button class="menu-close" id="menu-close" type="button">Close</button></div>' +
        '<nav class="menu-links">' + NAV.map(function (n) {
          return '<a href="' + n[0] + '"' + (n[0] === section ? ' aria-current="page"' : '') + '>' + n[1] + '<small>' + SUB[n[0]] + '</small></a>';
        }).join('') + '</nav>' +
        '<div class="menu-foot"><a class="btn" href="contact.html">Partner with us</a>' +
        '<div class="lang"><span aria-current="true">EN</span><span aria-hidden="true">|</span><span class="ar" lang="ar" role="link" aria-disabled="true">العربية</span></div></div>' +
      '</div>');
    var mBtn = document.getElementById('menu-btn'), mPanel = document.getElementById('menu'), mClose = document.getElementById('menu-close');
    var setMenu = function (open) {
      mPanel.hidden = !open; mBtn.setAttribute('aria-expanded', String(open));
      document.documentElement.style.overflow = open ? 'hidden' : '';
      (open ? mClose : mBtn).focus();
    };
    mBtn.addEventListener('click', function () { setMenu(true); });
    mClose.addEventListener('click', function () { setMenu(false); });
    mPanel.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mPanel.hidden) setMenu(false); });
  }

  var foot = document.querySelector('[data-site-foot]');
  if (foot) {
    foot.className = 'foot';
    foot.innerHTML =
      '<div class="wrap"><div class="cols">' +
        '<div><div class="brand">Maydi House</div><p style="margin-top:.6rem;max-width:30ch">A Somali fragrance house in Mogadishu, named after Maydi, the rarest frankincense in the world.</p></div>' +
        '<div><h4>Houses</h4><ul><li><a href="atelier.html">Maydi Atelier</a></li><li><a href="factory.html">Maydi Factory</a></li><li><a href="boutique.html">Maydi Boutique</a></li><li><a href="botanicals.html">Maydi Botanicals</a></li></ul></div>' +
        '<div><h4>The house</h4><ul><li><a href="mohamed-abdo.html">Mohamed Abdo</a></li><li><a href="contact.html">Partner with us</a></li><li><a href="index.html">Home</a></li></ul></div>' +
        '<div><h4>Contact</h4><ul><li>Mogadishu, Somalia</li><li><a href="mailto:maydihouse@gmail.com">maydihouse@gmail.com</a></li><li><a href="https://www.instagram.com/maydihouse/" rel="noopener">Instagram</a></li><li style="opacity:.7">WhatsApp (number to come)</li></ul></div>' +
      '</div><div class="small"><span>© 2026 Maydi House</span><span>Officially licensed in Mogadishu</span></div></div>';
  }

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

  // Product helpers, used by the boutique, founder, atelier and product pages.
  window.maydiProduct = function (slug) {
    return (window.MAYDI_PRODUCTS || []).filter(function (p) { return p.slug === slug; })[0];
  };
  window.maydiCard = function (p) {
    return '<a class="card" href="product.html?p=' + p.slug + '">' +
      '<div class="frame"><img src="' + p.img + '" alt="' + (p.alt || p.name + ' by ' + p.house) + '" loading="lazy"></div>' +
      '<div class="house">' + p.house + ' · ' + p.line + '</div>' +
      '<h3>' + p.name + '</h3>' +
      '<div class="meta"><span>' + p.sizes.join(' · ') + (p.soldOut ? ' · Sold out' : '') + '</span><span class="price-slot">Price</span></div>' +
    '</a>';
  };
})();
