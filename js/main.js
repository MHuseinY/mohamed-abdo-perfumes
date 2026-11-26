/* ============================================================
   MOHAMED ABDO PERFUMES — Main JS
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. NAVBAR — transparent → white on scroll past hero
  ---------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const hero   = document.getElementById('hero');

  if (navbar && hero) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        navbar.classList.toggle('scrolled', !entry.isIntersecting);
      },
      { threshold: 0.08 }
    );
    observer.observe(hero);
  }

  /* ----------------------------------------------------------
     2. SCROLL CHEVRON — fade out after 100px scroll
  ---------------------------------------------------------- */
  const chevron = document.getElementById('scrollChevron');

  if (chevron) {
    window.addEventListener('scroll', function onScroll() {
      if (window.scrollY > 100) {
        chevron.classList.add('hidden');
        window.removeEventListener('scroll', onScroll);
      }
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     3. AR / EN LANGUAGE TOGGLE
  ---------------------------------------------------------- */
  const langToggle = document.getElementById('langToggle');
  const langArBtn  = document.getElementById('langAr');
  const langEnBtn  = document.getElementById('langEn');

  function setLanguage(lang) {
    const isEn = lang === 'en';

    document.documentElement.lang = isEn ? 'en' : 'ar';
    document.documentElement.dir  = isEn ? 'ltr' : 'rtl';
    document.body.classList.toggle('lang-en', isEn);

    if (langArBtn) langArBtn.classList.toggle('active', !isEn);
    if (langEnBtn) langEnBtn.classList.toggle('active',  isEn);

    try { localStorage.setItem('map-lang', lang); } catch (_) {}
  }

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const currentLang = document.documentElement.lang;
      setLanguage(currentLang === 'en' ? 'ar' : 'en');
    });

    langToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        langToggle.click();
      }
    });
  }

  /* Restore saved language preference */
  try {
    const saved = localStorage.getItem('map-lang');
    if (saved === 'en') setLanguage('en');
  } catch (_) {}

})();
