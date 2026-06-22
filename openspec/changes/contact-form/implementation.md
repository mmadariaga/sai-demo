# contact-form

## Goal

Replace the placeholder contact form with a production-quality client-side submission flow: required + format validation, simulated async send with sending/success/error states, honeypot anti-spam, and accessible error feedback (aria-invalid, aria-describedby, focus-to-first-error).

## Prerequisites

- Ensure branch is not master or main. Ask the user to select the branch to use:
  1. `contact-form` (derived from the change name)
  2. Custom branch name (free input — e.g., backlog-linked name like `JIRA-123-contact-form`)
- If the selected branch does not exist, create it from `main` before implementing.

### Step-by-Step Instructions

#### Step 1: HTML markup restructuring

*(Non-testable step — no test framework in project; markup changes verified by browser inspection)*

- [ ] In `src/index.html`, replace the entire `<form>` element (currently at lines 268–291) with the markup below. This adds `id` attributes to all five fields, `aria-describedby` on the four validatable fields (name, email, phone, message), per-field error `<p>` containers, `novalidate` on the form, the honeypot field, and replaces `.form-ok` with two `aria-live` regions (`.form-success` + `.form-error`). The inline `onsubmit` is kept temporarily but retargeted to `.form-success` so the form remains functional until Step 3:

```html
        <form class="form" novalidate onsubmit="event.preventDefault(); this.querySelector('.form-success').hidden = false;">
          <label class="field">
            <span>Nombre y apellidos</span>
            <input type="text" id="name" name="name" required aria-describedby="name-error" />
            <p class="field-error" id="name-error" hidden></p>
          </label>
          <label class="field">
            <span>Empresa</span>
            <input type="text" id="company" name="company" />
          </label>
          <label class="field">
            <span>Email</span>
            <input type="email" id="email" name="email" required aria-describedby="email-error" />
            <p class="field-error" id="email-error" hidden></p>
          </label>
          <label class="field">
            <span>Teléfono</span>
            <input type="tel" id="phone" name="phone" aria-describedby="phone-error" />
            <p class="field-error" id="phone-error" hidden></p>
          </label>
          <label class="field field-full">
            <span>¿Qué necesitas?</span>
            <textarea id="message" name="message" rows="4" required aria-describedby="message-error"></textarea>
            <p class="field-error" id="message-error" hidden></p>
          </label>
          <label class="field hp-field">
            <span>Sitio web</span>
            <input type="text" id="website" name="website" tabindex="-1" autocomplete="off" />
          </label>
          <button type="submit" class="btn btn-primary btn-full">Enviar mensaje</button>
          <p class="form-success" aria-live="polite" hidden>¡Gracias! Te responderemos en menos de 24h.</p>
          <p class="form-error" aria-live="assertive" hidden></p>
        </form>
```

- [ ] In `src/styles.css`, add the `.hp-field` visually-hidden rule after the `.form-ok` block (after the `}` that closes `.form-ok { … }`) and before the `@media (max-width: 560px)` query for `.form`:

```css
.hp-field {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
```

##### Step 1 Verification Checklist

**Automated (agent runs before stopping):**
- [ ] `Select-String -Path src\index.html -Pattern 'novalidate'` — expected: 1+ match
- [ ] `Select-String -Path src\index.html -Pattern 'aria-describedby'` — expected: 4+ matches
- [ ] `Select-String -Path src\index.html -Pattern 'hp-field'` — expected: 1+ match
- [ ] `Select-String -Path src\index.html -Pattern 'form-success'` — expected: 2+ matches (class def + onsubmit reference)
- [ ] `Select-String -Path src\index.html -Pattern 'form-error'` — expected: 1+ match
- [ ] `Select-String -Path src\styles.css -Pattern '\.hp-field'` — expected: 1+ match

**Human (verify in browser before committing):**
- [ ] Open `src/index.html` in a browser — all five visible fields render correctly with labels (Nombre y apellidos, Empresa, Email, Teléfono, ¿Qué necesitas?)
- [ ] The honeypot field ("Sitio web") is NOT visible on screen
- [ ] Error containers (`p.field-error`) are empty and hidden — no extra spacing or visible text below inputs
- [ ] No console errors
- [ ] The inline submit still works: click "Enviar mensaje" → the `.form-success` message "¡Gracias! Te responderemos en menos de 24h." appears
- [ ] Inspect the DOM: confirm `aria-describedby` on each validatable input points to the correct `id` (e.g., `name` → `name-error`, `email` → `email-error`, `phone` → `phone-error`, `message` → `message-error`)

#### Step 1 STOP & COMMIT

**sai-4-apply:** Run all Automated checks above and confirm they pass before stopping.

**STOP & COMMIT:** Wait for the human to verify all Human checks in the browser, then stage and commit before continuing.

---

#### Step 2: CSS state and error styles

*(Non-testable step — no test framework in project; CSS changes verified by DevTools class toggling)*

- [ ] In `src/styles.css`, add error semantic tokens to the `:root` block. Insert after the `--focus-ring` line and before `--mask`:

```css
  --error-bg: #fde8e8;
  --error-ink: #c0392b;
  --error-ring: rgba(192, 57, 43, 0.2);
```

- [ ] In `src/styles.css`, add error token dark overrides to the `:root[data-theme="dark"]` block. Insert after the `--focus-ring` line and before the closing `}`:

```css
  --error-bg: #3a1a1a;
  --error-ink: #f87171;
  --error-ring: rgba(248, 113, 113, 0.2);
```

- [ ] In `src/styles.css`, add error token dark overrides to the `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }` block. Insert after the `--focus-ring` line and before the closing `}` of the inner rule:

```css
    --error-bg: #3a1a1a;
    --error-ink: #f87171;
    --error-ring: rgba(248, 113, 113, 0.2);
```

- [ ] In `src/styles.css`, add the state and error CSS rules after the `@media (max-width: 560px) { .form { grid-template-columns: 1fr; } }` line (and after the `.hp-field` rule from Step 1):

```css
.field-error {
  margin: 0;
  color: var(--error-ink);
  font-size: 0.8rem;
  line-height: 1.3;
}
.field-error[hidden] { display: none; }
.field input[aria-invalid="true"],
.field textarea[aria-invalid="true"] {
  border-color: var(--error-ink);
}
.field input[aria-invalid="true"]:focus,
.field textarea[aria-invalid="true"]:focus {
  border-color: var(--error-ink);
  box-shadow: 0 0 0 3px var(--error-ring);
}
.is-sending .field input,
.is-sending .field textarea {
  opacity: 0.6;
}
.is-sending .btn {
  opacity: 0.7;
}
.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid var(--accent);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.form-success {
  grid-column: 1 / -1;
  margin: 0;
  background: var(--ok-bg);
  color: var(--ok-ink);
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 500;
  text-align: center;
}
.form-error {
  grid-column: 1 / -1;
  margin: 0;
  background: var(--error-bg);
  color: var(--error-ink);
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 500;
  text-align: center;
}
```

##### Step 2 Verification Checklist

**Automated (agent runs before stopping):**
- [ ] `Select-String -Path src\styles.css -Pattern '\.is-sending'` — expected: 2+ matches (field opacity + btn opacity)
- [ ] `Select-String -Path src\styles.css -Pattern '\.spinner'` — expected: 1+ match
- [ ] `Select-String -Path src\styles.css -Pattern '@keyframes spin'` — expected: 1 match
- [ ] `Select-String -Path src\styles.css -Pattern '\.form-success'` — expected: 1+ match
- [ ] `Select-String -Path src\styles.css -Pattern '\.form-error'` — expected: 1+ match
- [ ] `Select-String -Path src\styles.css -Pattern 'error-ink'` — expected: 3+ matches (:root, [data-theme="dark"], @media dark)

**Human (verify in browser before committing):**
- [ ] Open `src/index.html` in a browser, open DevTools, and add class `is-sending` to the `<form>` element — verify field inputs/textarea get `opacity: 0.6` and the submit button gets `opacity: 0.7`
- [ ] With `is-sending` on the form, inject `<span class="spinner"></span>` into the button's innerHTML via DevTools — verify the spinner renders (animated rotating border circle, colored with `--accent`)
- [ ] Add `aria-invalid="true"` to one of the inputs via DevTools — verify the input border turns red (`--error-ink`)
- [ ] Remove the `hidden` attribute from the `.form-success` element via DevTools — verify it shows a green background/text box (`--ok-bg` / `--ok-ink`)
- [ ] Remove the `hidden` attribute from the `.form-error` element via DevTools — verify it shows a red background/text box (`--error-bg` / `--error-ink`)
- [ ] Confirm no layout breakage in the contact section — the form grid still renders correctly with two columns on desktop and one column on narrow viewports
- [ ] Toggle dark mode (via the theme toggle or OS preference) and re-verify the error styles render with the dark palette (lighter red text on dark red background)

#### Step 2 STOP & COMMIT

**sai-4-apply:** Run all Automated checks above and confirm they pass before stopping.

**STOP & COMMIT:** Wait for the human to verify all Human checks in the browser, then stage and commit before continuing.

---

#### Step 3: JS form submission logic and onsubmit removal

*(Non-testable step — no test framework in project; JS behavior verified by manual browser testing)*

- [ ] In `src/script.js`, append the contact form submission module to the end of the file (after the existing theme toggle code). This code follows the project's top-level globals pattern (`const`/`function` declarations, `var` inside callbacks, `addEventListener`, no IIFE, no ES modules):

```js
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
```

- [ ] In `src/index.html`, remove the `onsubmit="event.preventDefault(); this.querySelector('.form-success').hidden = false;"` attribute from the `<form>` element. The `<form>` opening tag should become exactly:

```html
        <form class="form" novalidate>
```

##### Step 3 Verification Checklist

**Automated (agent runs before stopping):**
- [ ] `node --check src\script.js` — expected: exit 0 (no syntax errors)
- [ ] `Select-String -Path src\script.js -Pattern 'simulateSubmit'` — expected: 2+ matches (definition + call)
- [ ] `Select-String -Path src\script.js -Pattern "addEventListener\('submit'"` — expected: 1 match
- [ ] `if (Select-String -Quiet -Path src\index.html -Pattern 'onsubmit') { 'FAIL: onsubmit still present' } else { 'PASS: onsubmit removed' }` — expected: PASS

**Human (verify in browser before committing):**
- [ ] Open `src/index.html` in a browser. Submit an empty form — expect validation errors on name, email, and message ("Este campo es obligatorio"), focus moves to the first invalid field (name), and `aria-invalid="true"` is set on each invalid input
- [ ] Submit with email "not-an-email" (other required fields filled) — expect email format error "Introduce un email válido" adjacent to the email input, `aria-invalid="true"` on the email input
- [ ] Submit with phone "abc" (other fields valid) — expect phone format error "Introduce un teléfono válido" adjacent to the phone input
- [ ] Submit with all valid fields (e.g., name "Test", email "test@example.com", phone "+34 600 123 456", message "Hola") — expect sending state: button shows spinner + "Enviando...", button is disabled, fields have reduced opacity. After ~1500ms, success message "¡Gracias! Te responderemos en menos de 24h." appears and form fields are reset
- [ ] Append `?fail=1` to the URL and reload. Submit a valid form — expect sending state, then after ~1500ms the general error message "Ha ocurrido un error. Inténtalo de nuevo." appears near the button (announced via `aria-live="assertive"`)
- [ ] After an error, submit again — expect the general error message clears before the new submission attempt begins
- [ ] Fill the honeypot field via DevTools (set `#website` input value to "spam") and submit a valid form — expect silent success (same success message and form reset as a legitimate submission, no validation or network simulation)
- [ ] Trigger a validation error (e.g., empty name), then type a character in the name field — expect the error message for name clears, `aria-invalid` is removed from the name input
- [ ] Verify the success message is announced via `aria-live="polite"` and errors via `aria-live="assertive"` (test with a screen reader or accessibility inspector)
- [ ] Verify the existing page features still work: year display, nav toggle, scroll animations, and theme toggle — no regressions from the new JS code

#### Step 3 STOP & COMMIT

**sai-4-apply:** Run all Automated checks above and confirm they pass before stopping.

**STOP & COMMIT:** Wait for the human to verify all Human checks in the browser, then stage and commit before continuing.
