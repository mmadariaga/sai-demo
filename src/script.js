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

// Contact form
const contactForm = document.querySelector('.form');
if (contactForm) {
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const successMsg = contactForm.querySelector('.form-success');
  const errorMsg = contactForm.querySelector('.form-error');
  const honeypot = contactForm.querySelector('#website');

  const fields = [
    { id: 'name', validate: v => v.trim() === '' ? 'Este campo es obligatorio' : true },
    { id: 'email', validate: v => {
      if (v.trim() === '') return 'Este campo es obligatorio';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Introduce un email válido';
      return true;
    }},
    { id: 'phone', validate: v => {
      if (v.trim() === '') return true;
      if (!/^[+]?[\d\s\-()]+$/.test(v.trim())) return 'Introduce un teléfono válido';
      return true;
    }},
    { id: 'message', validate: v => v.trim() === '' ? 'Este campo es obligatorio' : true }
  ];

  function clearError(id) {
    var input = document.getElementById(id);
    var errorEl = document.getElementById(id + '-error');
    if (errorEl) { errorEl.textContent = ''; errorEl.hidden = true; }
    if (input) input.removeAttribute('aria-invalid');
  }

  function setError(id, message) {
    var input = document.getElementById(id);
    var errorEl = document.getElementById(id + '-error');
    if (errorEl) { errorEl.textContent = message; errorEl.hidden = false; }
    if (input) input.setAttribute('aria-invalid', 'true');
  }

  function validateField(field) {
    var input = document.getElementById(field.id);
    var result = field.validate(input.value);
    if (result === true) { clearError(field.id); return true; }
    setError(field.id, result);
    return false;
  }

  fields.forEach(function(field) {
    var input = document.getElementById(field.id);
    if (input) input.addEventListener('input', () => clearError(field.id));
  });

  function simulateSubmit() {
    return new Promise(function(resolve, reject) {
      var failMode = new URLSearchParams(location.search).has('fail');
      setTimeout(function() {
        if (failMode) reject(new Error('fail'));
        else resolve();
      }, 1500);
    });
  }

  function showSuccess() {
    contactForm.classList.remove('is-sending');
    contactForm.classList.add('is-success');
    contactForm.reset();
    successMsg.textContent = '¡Gracias! Te responderemos en menos de 24h.';
    successMsg.hidden = false;
    errorMsg.hidden = true;
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Enviar mensaje';
  }

  function showError() {
    contactForm.classList.remove('is-sending');
    contactForm.classList.add('is-error');
    errorMsg.textContent = 'Ha ocurrido un error. Inténtalo de nuevo.';
    errorMsg.hidden = false;
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Enviar mensaje';
  }

  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    errorMsg.hidden = true;
    successMsg.hidden = true;

    if (honeypot && honeypot.value.trim() !== '') {
      showSuccess();
      return;
    }

    var firstInvalid = null;
    fields.forEach(function(field) {
      if (!validateField(field) && !firstInvalid)
        firstInvalid = document.getElementById(field.id);
    });

    if (firstInvalid) { firstInvalid.focus(); return; }

    contactForm.classList.remove('is-success', 'is-error');
    contactForm.classList.add('is-sending');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span>Enviando...';

    simulateSubmit().then(showSuccess).catch(showError);
  });
}
