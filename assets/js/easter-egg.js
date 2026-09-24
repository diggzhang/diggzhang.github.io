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

  // ── DOM Easter eggs ───────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {

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
