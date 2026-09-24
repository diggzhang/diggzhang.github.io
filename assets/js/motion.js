(function () {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power2.out', duration: 0.65, overwrite: 'auto' });

  var mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', function () {
    var intro = gsap.timeline({
      defaults: { ease: 'power3.out', duration: 0.75 }
    });

    var back = document.querySelector('.back-link');
    var homeTitle = document.querySelector('header > h1');
    var pageTitle = document.querySelector('.w > h1');
    var articleTitle = document.querySelector('article > h1');
    var meta = document.querySelector('.post-meta');
    var navItems = gsap.utils.toArray('.site-nav > ul > li');
    var pageCopy = gsap.utils.toArray('.w > h2, .w > p, .about-list');
    var terminalLines = gsap.utils.toArray('.terminal-404 > p');

    if (back) {
      intro.fromTo(
        back,
        { autoAlpha: 0, x: -10 },
        { autoAlpha: 1, x: 0, duration: 0.45 },
        0
      );
    }

    if (homeTitle) {
      intro.fromTo(
        homeTitle,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.9 },
        back ? '-=0.15' : 0
      );
    }

    if (pageTitle) {
      intro.fromTo(
        pageTitle,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.8 },
        back ? '-=0.2' : 0
      );
    }

    if (articleTitle) {
      intro.fromTo(
        articleTitle,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.9 },
        back ? '-=0.15' : 0
      );
    }

    if (meta) {
      intro.fromTo(
        meta,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.55 },
        '-=0.55'
      );
    }

    if (navItems.length) {
      intro.fromTo(
        navItems,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.07 },
        '-=0.5'
      );
    }

    if (pageCopy.length && !articleTitle && !homeTitle) {
      intro.fromTo(
        pageCopy,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 },
        '-=0.4'
      );
    }

    if (terminalLines.length) {
      intro.fromTo(
        terminalLines,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06 },
        0.1
      );
    }

    var postItems = gsap.utils.toArray('.post-list > li');
    if (postItems.length) {
      gsap.set(postItems, { autoAlpha: 0, y: 12 });
      ScrollTrigger.batch(postItems, {
        start: 'top 94%',
        interval: 0.1,
        batchMax: 8,
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.045,
            ease: 'power2.out',
            overwrite: true
          });
        }
      });
    }

    var archiveItems = gsap.utils.toArray('.archive ul > li');
    if (archiveItems.length) {
      gsap.set(archiveItems, { autoAlpha: 0, y: 10 });
      ScrollTrigger.batch(archiveItems, {
        start: 'top 96%',
        interval: 0.08,
        batchMax: 12,
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.03,
            overwrite: true
          });
        }
      });
    }

    var archiveYears = gsap.utils.toArray('.archive h2');
    if (archiveYears.length) {
      gsap.set(archiveYears, { autoAlpha: 0, y: 10 });
      ScrollTrigger.batch(archiveYears, {
        start: 'top 92%',
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.06,
            overwrite: true
          });
        }
      });
    }

    var articleBlocks = gsap.utils.toArray(
      'article > p, article > h2, article > h3, article > h4, article > h5, article > h6, ' +
      'article > pre, article > blockquote, article > ul, article > ol, article > table, ' +
      'article > figure, article > .highlighter-rouge, article > .eof, article > .tbc, ' +
      'article > div'
    ).filter(function (el) {
      return !el.classList.contains('post-meta') && el.tagName !== 'H1';
    });

    if (articleBlocks.length) {
      gsap.set(articleBlocks, { autoAlpha: 0, y: 16 });
      ScrollTrigger.batch(articleBlocks, {
        start: 'top 92%',
        interval: 0.12,
        batchMax: 5,
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.07,
            ease: 'power2.out',
            overwrite: true
          });
        }
      });
    }

    var article = document.querySelector('article');
    if (article) {
      var bar = document.createElement('div');
      bar.className = 'read-progress';
      bar.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bar);
      gsap.set(bar, { scaleX: 0, transformOrigin: '0% 50%' });
      gsap.to(bar, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: article,
          start: 'top 80',
          end: 'bottom bottom',
          scrub: 0.35
        }
      });
    }

    var footer = document.querySelector('.site-footer');
    if (footer) {
      gsap.fromTo(
        footer,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: footer,
            start: 'top 98%',
            once: true
          }
        }
      );
    }

    requestAnimationFrame(function () {
      ScrollTrigger.refresh();
    });
  });
})();
