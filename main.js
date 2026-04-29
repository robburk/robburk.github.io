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
