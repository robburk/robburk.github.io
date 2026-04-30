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


// ── SYSTEM MAP: LIVE DATA DECRYPT ─────────────────────────
(function() {
  const sysmap = document.querySelector('.sysmap');
  if (!sysmap) return;

  const afterItems = sysmap.querySelectorAll('.sysmap-after .sysmap-item');
  if (!afterItems.length) return;

  // Cache the final text strings, set initial scrambled state
  const SCRAMBLE_CHARS = '!<>-_/[]{}=+*?#@$%&0123456789ABCDEFXYZ';
  const randChar = () => SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];

  function scrambleString(finalText) {
    let out = '';
    for (let i = 0; i < finalText.length; i++) {
      const c = finalText[i];
      if (c === ' ' || c === '—' || c === '-') {
        out += c;
      } else {
        out += randChar();
      }
    }
    return out;
  }

  const targets = Array.from(afterItems).map(item => {
    const textEl = item.querySelector('.sm-text');
    const checkEl = item.querySelector('.sm-status');
    const finalText = textEl.textContent.trim();
    textEl.dataset.finalText = finalText;
    // Initial scrambled state — visible from page load
    textEl.textContent = scrambleString(finalText);
    // Items visible immediately at moderate opacity
    item.style.opacity = '0.45';
    checkEl.style.opacity = '0.25';
    return { item, textEl, checkEl, finalText, locked: false };
  });

  // ── Ambient cycling: every ~2.4s reshuffle the scrambled chars ──
  let ambientInterval = setInterval(() => {
    targets.forEach(t => {
      if (!t.locked) {
        t.textEl.textContent = scrambleString(t.finalText);
      }
    });
  }, 2400);

  // ── Resolve a single row's text: scramble → settle to final ──
  function resolveRow(t, duration = 600) {
    return new Promise(resolve => {
      const finalText = t.finalText;
      const len = finalText.length;
      const lockAt = Array.from({ length: len }, (_, i) => {
        const c = finalText[i];
        if (c === ' ' || c === '—' || c === '-') return 0;
        return duration * (0.25 + Math.random() * 0.7);
      });
      const startTime = performance.now();
      let lastFrame = 0;

      function frame(now) {
        const elapsed = now - startTime;
        if (now - lastFrame < 33 && elapsed < duration) {
          requestAnimationFrame(frame);
          return;
        }
        lastFrame = now;

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
          t.locked = true;
          resolve();
        }
      }
      requestAnimationFrame(frame);
    });
  }

  // ── Periodic blip: a single char on a random locked row briefly scrambles ──
  function startBlips() {
    setInterval(() => {
      const lockedTargets = targets.filter(t => t.locked);
      if (!lockedTargets.length) return;
      const t = lockedTargets[(Math.random() * lockedTargets.length) | 0];
      const text = t.finalText;
      // pick a random non-space char index
      let idx = (Math.random() * text.length) | 0;
      let attempts = 0;
      while (attempts < 8 && (text[idx] === ' ' || text[idx] === '—' || text[idx] === '-')) {
        idx = (Math.random() * text.length) | 0;
        attempts++;
      }
      // Run a brief glitch on that one char
      const glitchDuration = 380;
      const startTime = performance.now();
      const original = text[idx];

      function tick(now) {
        const elapsed = now - startTime;
        if (elapsed >= glitchDuration) {
          // restore
          t.textEl.textContent = text;
          return;
        }
        const chars = text.split('');
        chars[idx] = randChar();
        t.textEl.textContent = chars.join('');
        setTimeout(() => requestAnimationFrame(tick), 50);
      }
      requestAnimationFrame(tick);
    }, 5000 + Math.random() * 4000);
  }

  // ── Trigger sequence on scroll into view ──
  function runSequence() {
    if (sysmap.classList.contains('sm-active')) return;
    sysmap.classList.add('sm-active');

    // Stop ambient reshuffles — the resolveRow loop owns the text now
    clearInterval(ambientInterval);

    const useGsap = typeof gsap !== 'undefined';

    // Animate the scan line + bring full opacity to row + resolve text in stagger
    const scanLine = sysmap.querySelector('.sm-scanline');
    if (useGsap && scanLine) {
      gsap.fromTo(scanLine,
        { opacity: 0, top: 0 },
        { opacity: 1, top: '100%', duration: 1.8, ease: 'power1.inOut',
          onComplete: () => gsap.to(scanLine, { opacity: 0, duration: 0.5 })
        }
      );
    }

    targets.forEach((t, i) => {
      const delay = 100 + i * 130;
      setTimeout(() => {
        if (useGsap) {
          gsap.to(t.item, { opacity: 0.92, duration: 0.4, ease: 'power2.out' });
          gsap.to(t.checkEl, { opacity: 0.75, duration: 0.4, delay: 0.5, ease: 'power2.out' });
        } else {
          t.item.style.opacity = '0.92';
          t.checkEl.style.opacity = '0.75';
        }
        resolveRow(t, 650).then(() => {
          // Once all are locked, start the blip loop
          if (i === targets.length - 1) {
            setTimeout(startBlips, 800);
          }
        });
      }, delay);
    });
  }

  const sysmapObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runSequence();
        sysmapObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

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
