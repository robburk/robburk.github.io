// ── MOBILE MENU ───────────────────────────────────────────
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.remove('open');
  });
});

// ── FADE IN ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = 0;
  document.body.style.transition = 'opacity 0.4s ease';
  setTimeout(() => { document.body.style.opacity = 1; }, 30);
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
