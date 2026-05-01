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

