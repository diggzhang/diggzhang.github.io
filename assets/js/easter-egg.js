(function () {

  // ── Console art ──────────────────────────────────────────
  var art = [
    '                                            ',
    '  ┌──────────────────────────────────────┐  ',
    '  │                                      │  ',
    '  │   $ whoami                           │  ',
    '  │     diggzhang                        │  ',
    '  │                                      │  ',
    '  │   $ cat motto.txt                    │  ',
    '  │     写下一堆怕忘记的东西              │  ',
    '  │                                      │  ',
    '  │   $ echo $BLOG                       │  ',
    '  │     yet another blog                 │  ',
    '  │                                      │  ',
    '  └──────────────────────────────────────┘  ',
    '                                            ',
  ].join('\n');

  var accentStyle = [
    'color: #c0392b',
    'font-family: "SF Mono", Menlo, monospace',
    'font-size: 12px',
    'line-height: 1.5',
  ].join(';');

  var mutedStyle = [
    'color: #78716c',
    'font-family: "SF Mono", Menlo, monospace',
    'font-size: 11px',
    'line-height: 1.6',
  ].join(';');

  try {
    console.log('%c' + art, accentStyle);
    console.log('%c// hello, curious developer :]', mutedStyle);
    console.log('%c// https://github.com/diggzhang', mutedStyle);
  } catch (e) {}

  // ── Scroll reveal ─────────────────────────────────────────
  function initScrollReveal() {
    if (!window.IntersectionObserver) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var els = document.querySelectorAll(
      'article > p, article > h2, article > h3, article > h4, ' +
      'article > pre, article > blockquote, article > ul, article > ol, ' +
      'ul.post-list > li'
    );
    if (!els.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

    els.forEach(function (el, i) {
      el.classList.add('reveal');
      // Stagger only the post list items on the home page
      if (el.parentElement && el.parentElement.classList.contains('post-list')) {
        el.style.transitionDelay = Math.min(i * 35, 280) + 'ms';
      }
      observer.observe(el);
    });
  }

  // ── DOM Easter eggs ───────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {

    initScrollReveal();

    // Blinking cursor on home page site title
    var siteTitle = document.querySelector('header > h1');
    if (siteTitle) {
      var cursor = document.createElement('span');
      cursor.className = 'cursor-blink';
      cursor.setAttribute('aria-hidden', 'true');
      siteTitle.appendChild(cursor);
    }

    // Konami code Easter egg
    var seq = [38,38,40,40,37,39,37,39,66,65];
    var idx = 0;
    document.addEventListener('keydown', function (e) {
      idx = (e.keyCode === seq[idx]) ? idx + 1 : 0;
      if (idx === seq.length) {
        idx = 0;
        document.body.classList.toggle('glitch');
        setTimeout(function () {
          document.body.classList.remove('glitch');
        }, 3000);
      }
    });

  });

})();
