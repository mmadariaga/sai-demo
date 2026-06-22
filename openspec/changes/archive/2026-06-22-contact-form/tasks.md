## Step 1: HTML markup restructuring

**Files Affected**: src/index.html, src/styles.css

**What Will Be Done**: Restructure the contact form markup in `src/index.html` (currently at lines 243-291) to support the accessibility and state requirements in `openspec/changes/contact-form/specs/contact-form-submission/spec.md`. Add `id` attributes to all five form fields using their existing `name` values (`name`, `company`, `email`, `phone`, `message`). Add a `<p class="field-error" id="<fieldId>-error" hidden></p>` element inside each `.field` wrapper for the four validatable fields (name, email, phone, message) — not for `company`. Add `aria-describedby="<fieldId>-error"` to each validatable input. Add `novalidate` to the `<form>` element so browser-native validation does not interfere. Add the honeypot field as a new `.field` wrapper with a tempting label (e.g., "Sitio web"), `name="website"`, `tabindex="-1"`, `autocomplete="off"`, and `class="hp-field"`. Replace the existing `<p class="form-ok" hidden>` with two `aria-live` regions: a `<p class="form-success" aria-live="polite" hidden>` for success messages and a `<p class="form-error" aria-live="assertive" hidden>` for general error messages. Add the `.hp-field` CSS rule to `src/styles.css` using the visually-hidden pattern (`position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;`) — NOT `display: none`. Keep the existing inline `onsubmit` handler in place; it will be removed atomically in Step 3 when the JS handler replaces it.

**Testing Strategy**: Open `src/index.html` directly in a browser. Verify: all five fields render correctly with labels, the honeypot field is not visible on screen, error containers are empty and hidden, no console errors, the existing inline submit still shows the old success message. Inspect the DOM to confirm `aria-describedby` pairs and `id` attributes are correct.

## Step 2: CSS state and error styles

**Files Affected**: src/styles.css

**What Will Be Done**: Add CSS rules to `src/styles.css` (after the existing form styles around line 739) for the three submission states and error display defined in `openspec/changes/contact-form/specs/contact-form-submission/spec.md`. Add `.field-error` styling (red text via a custom property or hardcoded color consistent with the project palette, small font, margin-top) with `[hidden]` keeping it hidden by default. Add `[aria-invalid="true"]` input styling (red border, replacing the accent border on focus). Add `.is-sending` state styles: `.is-sending .field input, .is-sending .field textarea { opacity: 0.6; }` and `.is-sending .btn { opacity: 0.7; }`. Add `.spinner` class using the `border` + `border-top-color: transparent` + `@keyframes spin { to { transform: rotate(360deg); } }` technique, sized to fit inline within the button, colored with `var(--accent)`. Add `.form-success` styling (green background/text, reusing the existing `.form-ok` color values `ok-bg`/`ok-ink` or equivalent). Add `.form-error` styling (red background/text). Ensure all new styles use the existing `:root` custom property system where colors are involved, matching the convention in `src/styles.css:701-739`.

**Testing Strategy**: Open the page in a browser and use DevTools to manually toggle state classes on the `<form>` element: add `.is-sending` to verify field opacity reduction and that the spinner renders when its HTML is injected; add `[aria-invalid="true"]` to an input via DevTools to verify the red border; unhide `.form-success` and `.form-error` regions to verify message styling. Confirm no layout breakage in the contact section.

## Step 3: JS form submission logic and onsubmit removal

**Files Affected**: src/script.js, src/index.html

**What Will Be Done**: Add the contact form submission module to `src/script.js` (currently 37 lines of top-level globals — follow the same pattern: top-level `const`/`function` declarations, no IIFE, no ES modules). Atomically remove the inline `onsubmit` attribute from the `<form>` element in `src/index.html` and replace it with `addEventListener('submit', handler)` in `script.js`. Implement the submission flow per `openspec/changes/contact-form/specs/contact-form-submission/spec.md`: (1) Honeypot check — if the honeypot field has a value, skip all validation and simulation, immediately show the success state (silent rejection). (2) Required-field validation for name, email, message — set error text in the corresponding `field-error` container, set `aria-invalid="true"` on the input. (3) Email format validation using a pragmatic regex (character(s) + `@` + character(s) + `.` + character(s)). (4) Phone format validation only when the phone field is non-empty (digits, spaces, hyphens, parentheses, leading `+`). (5) Focus management — on validation failure, call `.focus()` on the first invalid field in DOM order. (6) If validation passes, enter sending state: add `.is-sending` to form, disable submit button, inject spinner HTML + "Enviando..." text into button. (7) Call `simulateSubmit()` — an `async function` returning a `Promise` that resolves after `setTimeout` (1500ms default); if `URLSearchParams(location.search).has('fail')` is true, reject instead. (8) On success: remove `.is-sending`, add `.is-success`, reset form fields, unhide `.form-success` with "¡Gracias! Te responderemos en menos de 24h.", hide `.form-error`. (9) On error: remove `.is-sending`, add `.is-error`, unhide `.form-error` with "Ha ocurrido un error. Inténtalo de nuevo." (10) Error clearing: attach `input` event listeners to each validatable field that clear its error container, remove `aria-invalid`, and hide the error element. Clear the general error message on the next submit attempt before validation runs.

**Testing Strategy**: Open `src/index.html` in a browser and test manually: (a) Submit empty form — expect validation errors on name/email/message, focus on first invalid field (name), `aria-invalid="true"` set. (b) Submit with email "not-an-email" — expect email format error. (c) Submit with phone "abc" — expect phone format error. (d) Submit with all valid fields — expect sending state (spinner, disabled button, "Enviando..."), then success message, form reset. (e) Append `?fail=1` to URL and submit valid form — expect general error message near button. (f) Fill honeypot via DevTools and submit — expect silent success (same as normal success). (g) Trigger a validation error, then type in the field — expect error clears, `aria-invalid` removed. (h) Verify screen reader announces success via `aria-live="polite"` and errors via `aria-live="assertive"` (test with a screen reader or accessibility inspector).

## Required Documentation

### Local files
- src/index.html:243-291
- src/script.js
- src/styles.css:701-739
- openspec/changes/archive/2026-06-22-dark-mode/tasks.md
- README.md
- openspec/config.yaml

### Spec files
- openspec/changes/contact-form/specs/contact-form-submission/spec.md

### External URLs
None

## Implementation Context

**Stack**: Vanilla JavaScript (ES6+, top-level globals, no modules), HTML5, CSS3 with `:root` custom properties. No framework, no build step, no bundler, no test framework. Browser-opened static page.

**Conventions**:
- CSS class names are flat kebab-case (`.form`, `.field`, `.form-ok`, `.btn-primary`) — not BEM, no utility classes.
- All theming via `:root` custom properties (`--accent`, `--line`, `--focus-ring`, `--ok-bg`, `--ok-ink`, etc.) — state styles should reuse these, not hardcode new colors.
- JS is top-level globals with `const`/`function` declarations — no IIFE, no ES module `import`/`export`, no `"use strict"`.
- Event listeners use `addEventListener` — no inline handlers in the existing codebase (the form's inline `onsubmit` is the sole exception being removed).
- UI copy is Spanish throughout (error messages, success messages, button labels).
- Error handling: `try/catch` only around `localStorage` calls; no global error handler.

**Avoid**:
- Do NOT introduce ES modules (`import`/`export`) — the project uses top-level globals loaded via `<script src="script.js">`.
- Do NOT add a build step, bundler, or package.json dependencies for the source code.
- Do NOT use `display: none` for the honeypot — bots detect it; use the visually-hidden off-screen pattern.
- Do NOT introduce a test framework (Jest, Vitest, etc.) — out of scope; manual browser testing is the verification method.
- Do NOT use BEM naming (`block__element--modifier`) or utility classes (`.flex`, `.mt-2`) — the project uses flat kebab-case only.
- Do NOT add validation on `blur` — the spec requires validation on submit and error clearing on `input` only.
