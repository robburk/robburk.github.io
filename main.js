// ── THEME TOGGLE ─────────────────────────────────────────
// Every page visit flips the theme from the previous one.
// We read the LAST theme from localStorage, flip it, apply it,
// then store the new value so the next page flips again.

(function () {
  const last = localStorage.getItem('theme') || 'light';
  const next = last === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
})();

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
