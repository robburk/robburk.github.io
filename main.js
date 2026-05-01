// ── MOBILE MENU ───────────────────────────────────────────
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.remove('open');
  });
});

// ── PAGE WIPE TRANSITION ──────────────────────────────────
(function () {
  const wipe = document.createElement('div');
  wipe.id = 'page-wipe';
  document.body.appendChild(wipe);

  const lastDir = localStorage.getItem('wipeDir') || 'left';
  const thisDir = lastDir === 'left' ? 'right' : 'left';
  localStorage.setItem('wipeDir', thisDir);

  const nextTheme = document.documentElement.getAttribute('data-theme');
  wipe.style.background = nextTheme === 'dark' ? '#0D0D0D' : '#FFFFFF';

  wipe.classList.add('wipe-cover', `wipe-from-${thisDir}`);

  setTimeout(() => {
    wipe.classList.add('wipe-retreat');
  }, 80);

  document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#')) return;
    e.preventDefault();

    const currentTheme = document.documentElement.getAttribute('data-theme');
    wipe.style.background = currentTheme === 'dark' ? '#FFFFFF' : '#0D0D0D';

    wipe.classList.remove('wipe-retreat');
    wipe.classList.add('wipe-cover-out');

    wipe.addEventListener('transitionend', () => {
      window.location.href = href;
    }, { once: true });
  });
})();

// ── FADE IN ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = 1;
});

// ── CIRCLE CURSOR (desktop only) ──────────────────────────
if (window.matchMedia('(hover: hover)').matches) {
  const cursor = document.createElement('div');
  cursor.id = 'cursor-dot';
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', e => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });

  document.querySelectorAll('a, button, .cta, .service-item, .case-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-grow'));
  });
}

// ── TAP RIPPLE (mobile) ───────────────────────────────────
document.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'touch') return;
  const ripple = document.createElement('span');
  ripple.className = 'tap-ripple';
  ripple.style.left = e.clientX + 'px';
  ripple.style.top  = e.clientY + 'px';
  document.body.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
});

// ── PARALLAX FADE (hero + page titles) ───────────────────
const parallaxEl = document.querySelector('.hero-title') || document.querySelector('.page-title');
if (parallaxEl) {
  let ticking = false;
  // Only apply parallax after a short delay so GSAP intro animation finishes first
  let parallaxReady = false;
  setTimeout(() => { parallaxReady = true; }, 1200);

  window.addEventListener('scroll', () => {
    if (!parallaxReady) return;
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        parallaxEl.style.transform = `translateY(${y * 0.14}px)`;
        parallaxEl.style.opacity = Math.max(0.05, 1 - y * 0.003);
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ── SCROLL REVEAL ─────────────────────────────────────────
const revealEls = document.querySelectorAll(
  '.page-title, .intro-left h2, .service-item, .case-card, .content-body h3, .service-row, .bottom-cta h2'
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => {
  el.classList.add('reveal-ready');
  observer.observe(el);
});

// ── HERO TITLE ANIMATION (GSAP + SplitType) ───────────────
function animateTitle(el, delay) {
  if (!el || typeof gsap === 'undefined' || typeof SplitType === 'undefined') return;

  // Check if futura-pt actually loaded — if not, leave title visible and skip animation
  const fontLoaded = document.fonts && Array.from(document.fonts).some(f =>
    f.family.toLowerCase().includes('futura') && f.status === 'loaded'
  );

  el.innerHTML = el.innerHTML.replace(/<br\s*\/?>\s*/gi, ' ');

  const split = new SplitType(el, { types: 'words' });
  if (!split.words || split.words.length === 0) return;

  if (fontLoaded) {
    gsap.set(split.words, { opacity: 0, y: 28 });
    gsap.to(split.words, {
      opacity: 1,
      y: 0,
      duration: 0.65,
      ease: 'power3.out',
      stagger: 0.07,
      delay: delay || 0.5
    });
  }
  // If font not loaded: words are visible by default, no animation — title still shows
}


// ── SYSTEM MAP: RESOLUTION SCAN ───────────────────────────
(function() {
  const sysmap = document.querySelector('.sysmap');
  if (!sysmap) return;

  const grid = sysmap.querySelector('.sysmap-grid');
  const beforeItems = sysmap.querySelectorAll('.sysmap-before .sysmap-item');
  const afterItems = sysmap.querySelectorAll('.sysmap-after .sysmap-item');
  if (!afterItems.length) return;

  const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_/[]{}=+*?#@$%&';
  const randChar = () => SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0];

  // Cache final text. Show items at low opacity with scrambled text from the start.
  const targets = Array.from(afterItems).map((item, i) => {
    const textEl = item.querySelector('.sm-text');
    const checkEl = item.querySelector('.sm-status');
    const finalText = textEl.textContent.trim();
    textEl.dataset.finalText = finalText;
    item.style.opacity = '0';
    if (checkEl) {
      checkEl.dataset.finalChar = checkEl.textContent;
      checkEl.textContent = '·'; // middle dot placeholder
      checkEl.style.opacity = '0';
    }
    return { item, textEl, checkEl, finalText, before: beforeItems[i] };
  });

  // Decrypt one row over a duration. Each char locks at a random fraction.
  function decryptRow(t, duration) {
    const finalText = t.finalText;
    const len = finalText.length;
    const lockAt = Array.from({ length: len }, (_, i) => {
      const c = finalText[i];
      if (c === ' ' || c === '—' || c === '-') return 0;
      return duration * (0.25 + Math.random() * 0.65);
    });
    const startTime = performance.now();

    function frame(now) {
      const elapsed = now - startTime;
      let out = '';
      for (let i = 0; i < len; i++) {
        if (elapsed >= lockAt[i]) {
          out += finalText[i];
        } else if (finalText[i] === ' ') {
          out += ' ';
        } else {
          out += randChar();
        }
      }
      t.textEl.textContent = out;
      if (elapsed < duration) {
        requestAnimationFrame(frame);
      } else {
        t.textEl.textContent = finalText;
      }
    }
    requestAnimationFrame(frame);
  }

  // Master sequence
  function runSequence() {
    if (sysmap.classList.contains('sm-active')) return;
    sysmap.classList.add('sm-active');

    const useGsap = typeof gsap !== 'undefined';
    const scanLine = sysmap.querySelector('.sm-scanline');
    const totalScan = 1.8;

    // Scan line sweeps from top to bottom of the grid
    if (scanLine) {
      if (useGsap) {
        gsap.set(scanLine, { top: '-2%', opacity: 0 });
        gsap.to(scanLine, { opacity: 1, duration: 0.18 });
        gsap.to(scanLine, {
          top: '102%',
          duration: totalScan,
          ease: 'power1.inOut',
          onComplete: () => gsap.to(scanLine, { opacity: 0, duration: 0.45 })
        });
      } else {
        scanLine.style.transition = 'top 1.8s ease-in-out, opacity 0.45s';
        requestAnimationFrame(() => {
          scanLine.style.opacity = '1';
          scanLine.style.top = '102%';
        });
        setTimeout(() => { scanLine.style.opacity = '0'; }, totalScan * 1000);
      }
    }

    // Each row materializes and decrypts as scan reaches it
    targets.forEach((t, i) => {
      const rowDelay = (0.10 + i * 0.14) * 1000;
      setTimeout(() => {
        // brief flash on the matching BEFORE item to show the connection
        if (t.before) {
          if (useGsap) {
            gsap.fromTo(t.before,
              { opacity: 0.32 },
              { opacity: 0.55, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.inOut' }
            );
          } else {
            t.before.style.transition = 'opacity 0.18s ease';
            t.before.style.opacity = '0.55';
            setTimeout(() => { t.before.style.opacity = '0.32'; }, 180);
          }
        }

        // fade in the after item
        if (useGsap) {
          gsap.to(t.item, { opacity: 0.92, duration: 0.4, ease: 'power2.out' });
        } else {
          t.item.style.transition = 'opacity 0.4s ease';
          t.item.style.opacity = '0.92';
        }

        // decrypt text
        decryptRow(t, 650);

        // check mark materializes after decrypt
        if (t.checkEl) {
          setTimeout(() => {
            t.checkEl.textContent = t.checkEl.dataset.finalChar || '✓';
            if (useGsap) {
              gsap.fromTo(t.checkEl,
                { opacity: 0, scale: 0.4 },
                { opacity: 0.85, scale: 1, duration: 0.4, ease: 'back.out(2)' }
              );
            } else {
              t.checkEl.style.opacity = '0.85';
            }
          }, 600);
        }
      }, rowDelay);
    });
  }

  const sysmapObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runSequence();
        sysmapObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  sysmapObserver.observe(sysmap);
})();

// Run after DOM + fonts ready
document.addEventListener('DOMContentLoaded', () => {
  const run = () => {
    animateTitle(document.querySelector('.hero-title'), 0.45);
    animateTitle(document.querySelector('.page-title'), 0.45);
  };
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(run);
  } else {
    setTimeout(run, 300);
  }
});

// ── SCROLL PROGRESS LINE ──────────────────────────────────
(function() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const doc = document.documentElement;
    const scrolled = doc.scrollTop / (doc.scrollHeight - doc.clientHeight);
    bar.style.width = (scrolled * 100) + '%';
  }, { passive: true });
})();

// ── PAGE TRANSITION: TILE FLIP ─────────────────────────────
// On internal link clicks: outgoing page covers the screen with a grid of
// rotateX-flipping tiles, then navigates. Incoming page reads a sessionStorage
// flag and animates the same tiles away. Color uses currentColor so palette
// inversion is preserved between pages.
(function() {
  if (typeof window === 'undefined' || !document.body) return;

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLS = window.matchMedia('(max-width: 800px)').matches ? 5 : 8;
  const ROWS = window.matchMedia('(max-width: 800px)').matches ? 8 : 6;
  const TILE_DUR = 280;       // ms per tile flip
  const COL_STAGGER = 32;     // ms between columns
  const NAV_AT = 0.78;        // navigate when this fraction of total cover time has elapsed
  const TOTAL_COVER = TILE_DUR + (COLS - 1) * COL_STAGGER; // ms

  // Build overlay
  function buildOverlay() {
    let el = document.getElementById('page-transition');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'page-transition';
    el.setAttribute('aria-hidden', 'true');
    const grid = document.createElement('div');
    grid.className = 'pt-grid';
    grid.style.setProperty('--pt-cols', COLS);
    grid.style.setProperty('--pt-rows', ROWS);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tile = document.createElement('div');
        tile.className = 'pt-tile';
        tile.style.setProperty('--pt-col', c);
        grid.appendChild(tile);
      }
    }
    el.appendChild(grid);
    document.body.appendChild(el);
    return el;
  }

  function shouldIntercept(e, link) {
    if (REDUCED) return false;
    if (e.defaultPrevented) return false;
    if (e.button !== 0) return false; // only left click
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (!link || !link.href) return false;
    if (link.target && link.target !== '_self') return false;
    if (link.hasAttribute('download')) return false;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    // anchor on same page → no transition
    if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return false;
    // same exact URL → no transition
    if (url.href === window.location.href) return false;
    return true;
  }

  function playOut(targetHref) {
    const overlay = buildOverlay();
    overlay.classList.remove('pt-uncover');
    // ensure starting state
    overlay.classList.add('pt-active');
    // next frame so transition triggers
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('pt-cover');
      });
    });
    sessionStorage.setItem('pt_in', '1');
    sessionStorage.setItem('pt_at', String(Date.now()));
    // Navigate slightly before tiles fully cover so transition feels continuous
    const navTime = Math.round(TOTAL_COVER * NAV_AT);
    setTimeout(() => {
      window.location.href = targetHref;
    }, navTime);
    // Fail-safe: if nav stalls, force reload after 1.2s
    setTimeout(() => {
      if (window.location.href !== targetHref) {
        window.location.href = targetHref;
      }
    }, 1200);
  }

  function playIn() {
    if (REDUCED) return;
    const flag = sessionStorage.getItem('pt_in');
    const at = parseInt(sessionStorage.getItem('pt_at') || '0', 10);
    sessionStorage.removeItem('pt_in');
    sessionStorage.removeItem('pt_at');
    // Stale flag (older than 5s) means user used back/forward or refresh — skip
    if (!flag || (Date.now() - at) > 5000) return;

    const overlay = buildOverlay();
    overlay.classList.add('pt-active', 'pt-cover');
    // next frame, animate uncover
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('pt-uncover');
      });
    });
    // remove overlay after uncover completes
    setTimeout(() => {
      overlay.classList.remove('pt-active', 'pt-cover', 'pt-uncover');
    }, TOTAL_COVER + 80);
  }

  // Click delegation
  document.addEventListener('click', (e) => {
    const link = e.target.closest && e.target.closest('a[href]');
    if (!link) return;
    if (!shouldIntercept(e, link)) return;
    e.preventDefault();
    playOut(link.href);
  });

  // Run incoming animation if applicable
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', playIn);
  } else {
    playIn();
  }
})();
