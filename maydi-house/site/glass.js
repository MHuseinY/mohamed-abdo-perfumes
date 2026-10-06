/* Maydi House: liquid-glass navigation (v2 prototype). Needs glass.css, and the page's own #menu-btn and #menu. */
(function () {
  var ar = document.documentElement.lang === 'ar';
  var home = !!document.querySelector('[data-sc-act]');
  var section = document.body.getAttribute('data-section') || location.pathname.split('/').pop() || 'index.html';

  // Each house's mark, cut down from its arch drawing. The tear is the resin: it fills with colour when active.
  var TEAR = function (x, y) { return '<path class="tear" d="M' + x + ' ' + y + 'c0 0-1.6 2.2-1.6 3.1a1.6 1.6 0 0 0 3.2 0c0-.9-1.6-3.1-1.6-3.1z"/>'; };
  var ICON = {
    atelier: '<path d="M10 3h4M10.5 3v5.6a6.5 6.5 0 1 0 3 0V3"/>' + TEAR(12, 12.4),
    factory: '<path d="M3 20.5h18M5 20.5V14h4v6.5M6.3 14v-2h1.4v2M15 20.5V14h4v6.5M16.3 14v-2h1.4v2M12 3v3.5M10 6.5h4l-1 2h-2z"/>' + TEAR(12, 10.6),
    boutique: '<path d="M5 9h14l-1.2 11.5H6.2zM9 9V7.5a3 3 0 0 1 6 0V9"/>' + TEAR(12, 12.6),
    botanicals: '<path d="M7 21c.5-5 2.5-9.5 7-13.5M9.2 14.6c-2.6.2-4.6-1-5.6-3.2 2.6-.4 4.6.8 5.6 3.2zM12.3 9.8c-.4-2.6.6-4.8 2.8-6 .6 2.5-.4 4.6-2.8 6zM14 7.6c2.3-1 4.6-.6 6.2 1-2.2 1.2-4.5 1-6.2-1z"/>' + TEAR(16.8, 11.8)
  };
  // The shared inner-pages build is one file with views switched by #hash.
  var spa = !!document.getElementById('views');
  // The homepages keep their four houses in one list (the review build rewrites these two literals).
  var HOME_ITEMS = ar
    ? [['#houses', 'التصميم', 'atelier'], ['#houses', 'التصنيع', 'factory'], ['#houses', 'البوتيك', 'boutique'], ['#houses', 'المواد الخام', 'botanicals']]
    : [['atelier.html', 'Atelier', 'atelier'], ['factory.html', 'Factory', 'factory'], ['boutique.html', 'Boutique', 'boutique'], ['botanicals.html', 'Botanicals', 'botanicals']];
  // The inner pages, in either language. In the single-document review site the links are hash routes (#boutique, #ar-boutique).
  var KEYS = ['atelier', 'factory', 'boutique', 'botanicals'];
  var LABEL = { en: { atelier: 'Atelier', factory: 'Factory', boutique: 'Boutique', botanicals: 'Botanicals' },
                ar: { atelier: 'التصميم', factory: 'التصنيع', boutique: 'البوتيك', botanicals: 'المواد الخام' } };
  var curLang = ar ? 'ar' : 'en';
  function itemsFor(l) {
    if (home) return HOME_ITEMS;
    return KEYS.map(function (k) {
      var pre = l === 'ar' ? 'ar-' : '';
      return [spa ? '#' + pre + k : pre + k + '.html', LABEL[l][k], k];
    });
  }

  var dock = document.createElement('nav');
  dock.className = 'dock';
  dock.innerHTML =
    '<div class="dock__pill"></div>' +
    '<button class="dock__more" type="button" aria-haspopup="dialog">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9.5h14M5 14.5h14"/></svg></button>';
  document.body.appendChild(dock);
  document.documentElement.classList.add('has-dock');

  var pill = dock.querySelector('.dock__pill'), more = dock.querySelector('.dock__more');
  var lens, items = [], active = -1;
  function renderItems(l) {
    dock.setAttribute('aria-label', l === 'ar' ? 'أقسام الدار' : 'Houses');
    more.setAttribute('aria-label', l === 'ar' ? 'القائمة' : 'Menu');
    pill.innerHTML = '<span class="dock__lens" aria-hidden="true"></span>' +
      itemsFor(l).map(function (it) {
        var here = !home && it[0] === section;
        return '<a class="dock__item" data-key="' + it[2] + '" href="' + it[0] + '"' + (here ? ' aria-current="page"' : '') + '>' +
          '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[it[2]] + '</svg><span>' + it[1] + '</span></a>';
      }).join('');
    lens = pill.querySelector('.dock__lens');
    items = [].slice.call(pill.querySelectorAll('.dock__item'));
    active = -1;
    items.forEach(function (a, i) { if (a.hasAttribute('aria-current')) active = i; });
    placeLens();
  }

  function placeLens() {
    lens.classList.toggle('is-on', active >= 0);
    if (active >= 0) pill.style.setProperty('--idx', active);
  }
  function setActive(i) {
    if (i === active) return;
    if (items[active]) items[active].classList.remove('is-here');
    active = i;
    if (items[active]) items[active].classList.add('is-here');
    placeLens();
  }
  renderItems(curLang);
  // Shared inner pages: the router has already marked the current view in the bar, so the dock copies it.
  function syncFromRoute() {
    var cur = document.querySelector('.site-bar nav [data-nav][aria-current="page"]');
    var key = cur && cur.getAttribute('data-nav'), idx = -1;
    items.forEach(function (a, i) {
      a.classList.remove('is-here');
      if (a.getAttribute('data-key') === key) { idx = i; a.setAttribute('aria-current', 'page'); } else a.removeAttribute('aria-current');
    });
    active = idx; placeLens();
  }
  if (spa) { window.addEventListener('hashchange', syncFromRoute); syncFromRoute(); }
  // The single-document review site changes language without reloading: it calls this on each route.
  window.maydiGlass = { setLang: function (l) { curLang = l; renderItems(l); if (spa) syncFromRoute(); } };

  // The round button opens the page's own menu, and the dock steps aside while it is open.
  var menuBtn = document.getElementById('menu-btn'), menu = document.getElementById('menu');
  if (menuBtn && menu) {
    more.addEventListener('click', function () { menuBtn.click(); });
    new MutationObserver(function () {
      var open = !menu.hidden;
      document.documentElement.classList.toggle('menu-open', open);
      more.setAttribute('aria-expanded', String(open));
      if (!open && getComputedStyle(menuBtn).display === 'none') more.focus();
    }).observe(menu, { attributes: true, attributeFilter: ['hidden'] });
  } else {
    more.hidden = true;
  }

  // On the homepage the arch follows the house the pan is showing.
  var houses = home ? [].slice.call(document.querySelectorAll('#houses .house')) : [];
  var housesAct = document.getElementById('houses');
  function track() {
    if (!housesAct) return;
    var r = housesAct.getBoundingClientRect();
    if (r.top > innerHeight * .5 || r.bottom < innerHeight * .5) { setActive(-1); return; }
    var best = -1, dist = Infinity;
    houses.forEach(function (h, i) {
      var b = h.getBoundingClientRect();
      if (b.right < 0 || b.left > innerWidth) return;
      var d = Math.abs(b.left + b.width / 2 - innerWidth / 2);
      if (d < dist) { dist = d; best = i; }
    });
    setActive(dist < innerWidth * .45 ? best : -1);
  }

  // The Arabic homepage keeps the four houses in one pan, so each button scrolls the pan to its own house.
  var goToken = 0;
  function goHouse(i) {
    var tok = ++goToken, sign = 1, prevErr = null, tries = 0, still = 0, lastX = null;
    var track0 = houses[0] && houses[0].parentElement;
    var ratio = (housesAct.offsetHeight - innerHeight) / Math.max(1, (track0.scrollWidth - innerWidth));
    var instant = function (y) { scrollTo({ top: y, behavior: 'instant' }); };
    instant(housesAct.offsetTop + (i + .5) / houses.length * (housesAct.offsetHeight - innerHeight));
    (function step() {
      if (tok !== goToken) return;
      var b = houses[i].getBoundingClientRect(), x = b.left + b.width / 2;
      still = lastX !== null && Math.abs(x - lastX) < 1 ? still + 1 : 0; lastX = x;
      if (still < 6) { requestAnimationFrame(step); return; }       // wait for the pan to settle
      var err = x - innerWidth / 2;
      if (Math.abs(err) < 14 || ++tries > 8) return;
      if (prevErr !== null && Math.abs(err) > Math.abs(prevErr) + 2) sign = -sign;   // wrong way: turn around
      prevErr = err; still = 0;
      instant(scrollY + sign * err * ratio * (ar ? 1 : -1));
      requestAnimationFrame(step);
    })();
  }
  if (home && ar && houses.length === 4) {
    items.forEach(function (a, i) {
      a.addEventListener('click', function (e) { e.preventDefault(); goHouse(i); });
    });
    var menuLinks = [].slice.call(document.querySelectorAll('#menu .menu-links a')).slice(0, 4);
    menuLinks.forEach(function (a, i) {
      a.addEventListener('click', function (e) { e.preventDefault(); setTimeout(function () { goHouse(i); }, 60); });
    });
  }

  var bar = document.querySelector('.site-bar');
  var lastY = scrollY, ticking = false;
  function frame() {
    ticking = false;
    var y = scrollY;
    if (bar) bar.classList.toggle('is-glass', y > 8);
    var dy = y - lastY;
    if (Math.abs(dy) > 6) { dock.classList.toggle('is-min', dy > 0 && y > 160); lastY = y; }
    if (innerHeight + y >= document.documentElement.scrollHeight - 4) dock.classList.remove('is-min');
  }
  // The pan eases behind the scroll, so the arch keeps following for a moment after the scroll stops.
  var followUntil = 0, following = false;
  function follow() {
    track();
    if (performance.now() < followUntil) requestAnimationFrame(follow); else following = false;
  }
  function wake() {
    if (!home) return;
    followUntil = performance.now() + 1500;
    if (!following) { following = true; requestAnimationFrame(follow); }
  }
  addEventListener('scroll', function () { wake(); if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener('resize', wake);
  addEventListener('load', wake);
  frame();
  placeLens();
  wake();
})();
