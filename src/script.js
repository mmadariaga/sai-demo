document.getElementById('year').textContent = new Date().getFullYear();

const toggle = document.getElementById('navToggle');
const header = document.querySelector('.site-header');
if (toggle) {
  toggle.addEventListener('click', () => header.classList.toggle('is-open'));
  document.querySelectorAll('.nav-links a').forEach(a =>
    a.addEventListener('click', () => header.classList.remove('is-open'))
  );
}

const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
  { threshold: 0.12 }
);
document.querySelectorAll('.feature, .card, .benefit').forEach(el => observer.observe(el));

// Theme toggle
const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
  const updateToggle = function(isDark) {
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    themeToggle.querySelector('.theme-toggle-icon').textContent = isDark ? '☀️' : '🌙';
  };

  themeToggle.addEventListener('click', function() {
    var html = document.documentElement;
    var isDark = html.dataset.theme === 'dark';
    var next = isDark ? 'light' : 'dark';
    html.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    updateToggle(!isDark);
  });

  updateToggle(document.documentElement.dataset.theme === 'dark');
}
