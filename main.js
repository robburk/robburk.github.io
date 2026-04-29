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

  // Replace <br> with spaces so SplitType can split cleanly
  el.innerHTML = el.innerHTML.replace(/<br\s*\/?>/gi, ' ');

  const split = new SplitType(el, { types: 'words' });
  if (!split.words || split.words.length === 0) return;

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

// Run after DOM + scripts ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    animateTitle(document.querySelector('.hero-title'), 0.45);
    animateTitle(document.querySelector('.page-title'), 0.45);
  }, 100);
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
