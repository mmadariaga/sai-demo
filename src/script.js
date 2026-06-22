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
