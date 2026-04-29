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
// On arrival: wipe retreats off screen (reveal)
// On departure: wipe sweeps across screen (cover), then navigates
// Direction alternates L→R and R→L each visit

(function () {
  const wipe = document.createElement('div');
  wipe.id = 'page-wipe';
  document.body.appendChild(wipe);

  // Read direction from storage, flip it, save
  const lastDir = localStorage.getItem('wipeDir') || 'left';
  const thisDir = lastDir === 'left' ? 'right' : 'left';
  localStorage.setItem('wipeDir', thisDir);

  // Next page's theme color is already on <html> via the theme script
  const nextTheme = document.documentElement.getAttribute('data-theme');
  wipe.style.background = nextTheme === 'dark' ? '#0D0D0D' : '#FFFFFF';

  // Arrive: wipe starts covering screen, then slides off
  wipe.classList.add('wipe-cover', `wipe-from-${thisDir}`);

  setTimeout(() => {
    wipe.classList.add('wipe-retreat');
  }, 80);

  // Depart: intercept internal link clicks
  document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#')) return;
    e.preventDefault();

    // Wipe covers screen before navigating
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

// ── HERO PARALLAX (scroll) ────────────────────────────────
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        heroTitle.style.transform = `translateY(${y * 0.14}px)`;
        heroTitle.style.opacity = Math.max(0.05, 1 - y * 0.003);
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ── SCROLL REVEAL ─────────────────────────────────────────
const revealEls = document.querySelectorAll(
  '.hero-title, .page-title, .intro-left h2, .service-item, .case-card, .content-body h3, .service-row, .bottom-cta h2'
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
