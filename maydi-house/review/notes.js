// Review notes: the button opens the viewer's own comment composer, anchored to what is in the middle of the screen.
(async function () {
  if (!window.claude || !window.claude.use) return;
  var comments = await window.claude.use('comments');
  if (!comments) return;
  var btn = document.getElementById('note-btn'), hint = document.getElementById('note-hint');
  var BLOCKS = 'h1,h2,h3,p,figure,li,article,.card,.frame,tr,.foot,section';
  function say(t) { hint.textContent = t; hint.hidden = false; clearTimeout(say.t); say.t = setTimeout(function () { hint.hidden = true; }, 4000); }
  var ar = function () { return document.documentElement.lang === 'ar'; };
  btn.hidden = false;
  btn.addEventListener('click', async function () {
    var el = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
    try {
      var r = await comments.openComposer({ element: (el && el.closest(BLOCKS)) || el || document.getElementById('views') });
      if (!r.opened) say(ar() ? 'أكمل الملاحظة المفتوحة أو أغلقها، ثم حاول مرة أخرى.' : 'Finish or close the note that is already open, then try again.');
    } catch (e) {
      if (e && e.code === 'rate_limited') { say(ar() ? 'لحظة، ثم حاول مرة أخرى.' : 'One moment, then try again.'); return; }
      btn.hidden = true; say(ar() ? 'الملاحظات غير متاحة هنا. افتح الرابط بعد تسجيل الدخول إلى claude.ai.' : 'Notes are not available in this view. Open the link while signed in to claude.ai.');
    }
  });
})();
