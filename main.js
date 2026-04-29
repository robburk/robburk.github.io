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

// ── CURSOR TRAILER ────────────────────────────────────────
const cursor = document.createElement('div');
cursor.id = 'cursor-dot';
document.body.appendChild(cursor);

let mouseX = 0, mouseY = 0;
let dotX = 0, dotY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

(function animateCursor() {
  dotX += (mouseX - dotX) * 0.12;
  dotY += (mouseY - dotY) * 0.12;
  cursor.style.transform = `translate(${dotX}px, ${dotY}px)`;
  requestAnimationFrame(animateCursor);
})();

// Scale up on hoverable elements
document.querySelectorAll('a, button, .cta, .service-item, .case-card').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('cursor-grow'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-grow'));
});

// ── TEXT SCRAMBLE ─────────────────────────────────────────
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function scramble(el) {
  const original = el.dataset.text || el.textContent;
  el.dataset.text = original;
  let iteration = 0;
  const total = original.length * 2;

  const interval = setInterval(() => {
    el.textContent = original.split('').map((char, i) => {
      if (char === ' ') return ' ';
      if (i < iteration / 2) return original[i];
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');

    if (iteration >= total) {
      el.textContent = original;
      clearInterval(interval);
    }
    iteration++;
  }, 30);
}

document.querySelectorAll('nav ul li a, .mobile-menu a').forEach(el => {
  el.addEventListener('mouseenter', () => scramble(el));
});

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
}, { threshold: 0.15 });

revealEls.forEach(el => {
  el.classList.add('reveal-ready');
  observer.observe(el);
});
