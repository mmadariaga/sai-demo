# Design: contact-form

## Context

The project is a static landing page (`src/index.html`) with vanilla JS (`src/script.js`, 37 lines) and a single stylesheet (`src/styles.css`). There is no build step, no bundler, no test framework, and no backend. The page is opened directly in a browser.

The contact form (`#contacto` section, `src/index.html:243-291`) currently has an inline `onsubmit` handler that calls `preventDefault()` and reveals a static `<p class="form-ok" hidden>` message. The form has 5 fields (`name`, `company`, `email`, `phone`, `message`) with `name` attributes but no `id` attributes, no `aria-describedby`, no `aria-invalid`, no error containers, and no honeypot. The existing `script.js` contains no form logic — only a year setter, nav toggle, IntersectionObserver scroll animations, and a theme toggle.

The CSS uses a `:root` custom property system for theming (colors, focus rings) with kebab-case class names (`.form`, `.field`, `.field-full`, `.form-ok`, `.btn-primary`). Form styles live at `src/styles.css:701-739`. There are no state classes for validation, no spinner styles, and no `aria-invalid` styles. The project uses Spanish UI copy throughout.

## Goals / Non-Goals

**Goals:**
- Replace the inline `onsubmit` fake with a real client-side submission flow in `src/script.js`.
- Implement required-field validation (name, email, message) and format validation (email pattern, optional phone pattern).
- Implement three visual states: sending (disabled button + spinner), success (confirmation + `aria-live`), error (per-field + general error messages + `aria-live`).
- Add accessibility: `aria-invalid`, `aria-describedby` per field, focus management to first invalid field, `aria-live` regions for success/error announcements.
- Add honeypot anti-spam with silent rejection (show success to bots).
- Simulate network submission with configurable delay (default 1500ms) via `setTimeout`.

**Non-Goals:**
- No backend integration or real network requests.
- No test framework introduction (the project has none; adding one is out of scope).
- No build step, bundler, or dependency installation.
- No validation on blur — validation triggers on submit only; errors clear on `input` event.
- No internationalization framework — UI copy remains hardcoded Spanish.

## Decisions

### D1: Move form handling from inline `onsubmit` to `addEventListener` in `script.js`

- **Hard to reverse?** No — trivially reversible.
- **Surprising without context?** No — standard practice.
- **Real trade-off?** Minor — inline handler is simpler for a single form, but separating concerns is consistent with the existing `script.js` pattern (nav toggle, theme toggle all use `addEventListener`).

**Decision:** Remove the inline `onsubmit` attribute from the form element. Attach a `submit` event listener in `script.js` using `addEventListener('submit', handler)`. Add `novalidate` to the `<form>` element so the browser's built-in validation does not interfere with the custom validation logic. This is consistent with the existing codebase pattern where all handlers use `addEventListener`.

### D2: Simulated async submission via `setTimeout` wrapped in a `Promise`

- **Hard to reverse?** Medium — the simulation layer would need replacing if a real backend arrives, but the validation and state management would remain unchanged.
- **Surprising without context?** No — standard pattern for no-backend prototypes.
- **Real trade-off?** Yes — alternatives include a fake `fetch` mock or a synchronous delay. `Promise`-wrapped `setTimeout` enables `async/await` flow and is the minimal viable approach.

**Decision:** Create an `async function simulateSubmit(data)` that returns a `Promise` which resolves after a configurable delay (default 1500ms). The error mode is controlled by a module-level configuration (see D3). This keeps the submission flow `async/await`-compatible for future backend replacement.

### D3: Configurable error mode via URL query parameter `?fail=1`

- **Hard to reverse?** No — easily removed or changed.
- **Surprising without context?** Yes — a future reader might ask "why is the form checking `location.search`?" — answer: to test the error state without a backend.
- **Real trade-off?** Yes — alternatives: (a) a JS constant `const FAIL_MODE = false` (requires code edit to test), (b) random probability (non-deterministic, hard to test), (c) query parameter (deterministic, no code edit, user-accessible).

**Alternatives considered:**
- **JS constant:** Simple but requires editing source to test the error path. Not user-accessible.
- **Random probability:** Non-deterministic; cannot reliably demonstrate the error state.
- **Query parameter `?fail=1`:** Deterministic, no code edit, accessible via URL. Slight risk of leaking into production but this is a static page with no backend.

**Decision:** Use `const params = new URLSearchParams(location.search); const failMode = params.has('fail');` to detect error mode. When `failMode` is true, `simulateSubmit` rejects instead of resolving. This enables manual testing of the error state by appending `?fail=1` to the URL.

### D4: Per-field error containers with unique IDs, linked via `aria-describedby`

- **Hard to reverse?** No — standard accessibility pattern.
- **Surprising without context?** No — this is the WAI-ARIA prescribed approach.
- **Real trade-off?** Minor — a single error region is simpler but loses per-field association.

**Decision:** Add an error `<p>` element after each validatable field's input, inside the `.field` wrapper, with a unique `id` (e.g., `name-error`, `email-error`, `phone-error`, `message-error`). Each input gets `aria-describedby` pointing to its error container. When an error is present, the container's `textContent` is set and the input gets `aria-invalid="true"`. When cleared, the container is emptied and `aria-invalid` is removed. Only fields with validation rules (name, email, phone, message) get error containers — `company` has no validation and needs none.

### D5: Honeypot visually hidden via CSS (not `display: none`), silent rejection with success display

- **Hard to reverse?** No.
- **Surprising without context?** Yes — a future reader might ask "why is there a hidden field that shows success when filled?" — answer: bot trap that avoids signaling detection.
- **Real trade-off?** Yes — alternatives: (a) `display: none` (simpler but bots detect it), (b) show error on honeypot fill (signals detection to bots), (c) visual hide + silent success (bots cannot distinguish rejection from acceptance).

**Alternatives considered:**
- **`display: none`:** Bots commonly skip `display:none` fields. Defeats the purpose.
- **Show error on honeypot fill:** Tells the bot its submission was rejected, allowing it to adapt.
- **Visual hide + silent success:** Bots receive the same success response as legitimate users, cannot distinguish rejection from acceptance.

**Decision:** Add a honeypot input (e.g., `name="website"` with a tempting label) positioned off-screen via CSS (`position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;`) with `tabindex="-1"` and `autocomplete="off"`. If the honeypot has a value at submission, skip validation and simulation, and immediately show the success state. A `.hp-field` class will be added to `styles.css` using the visually-hidden pattern, not `display: none`.

### D6: CSS-only spinner via border + keyframe animation

- **Hard to reverse?** No.
- **Surprising without context?** No — standard CSS spinner pattern.
- **Real trade-off?** Minor — alternatives include an SVG spinner or a text-only indicator. CSS-only has zero dependencies and matches the project's vanilla approach.

**Decision:** Add a `.spinner` class to `styles.css` using the classic `border` + `border-top-color` + `@keyframes spin` technique. The spinner is inserted into the button's innerHTML during the sending state and removed on completion. The button text changes to "Enviando..." per the spec. The spinner uses `var(--accent)` for its visible border color to stay consistent with the project's custom property theming.

### D7: State management via CSS classes on the form element

- **Hard to reverse?** No.
- **Surprising without context?** No — common pattern.
- **Real trade-off?** Minor — alternatives include inline styles or `data-status` attributes. CSS classes are consistent with the existing codebase style.

**Decision:** Add state classes to the `<form>` element: `.is-sending`, `.is-success`, `.is-error`. The CSS targets these to control field opacity, button state, and message visibility. The existing `<p class="form-ok" hidden>` element will be replaced by two `aria-live` regions: one `aria-live="polite"` for success messages and one `aria-live="assertive"` for general error messages. The per-field error containers are not `aria-live` (they are announced via `aria-describedby` when focus moves to the invalid field).

### D8: Form field IDs for accessibility and JS selection

- **Hard to reverse?** No.
- **Surprising without context?** No — required for `aria-describedby` and label association.
- **Real trade-off?** No.

**Decision:** Add `id` attributes to all form fields using their existing `name` values: `id="name"`, `id="company"`, `id="email"`, `id="phone"`, `id="message"`. This enables `getElementById` selection in JS and `aria-describedby` linking. Error container IDs follow the pattern `<fieldId>-error` (e.g., `name-error`, `email-error`).

## Risks / Trade-offs

- [Honeypot is bypassable by sophisticated bots] → Mitigation: honeypot is a first-line defense only; acceptable for a static page with no backend. No claim of robust anti-spam.
- [No automated tests for validation logic] → Mitigation: manual testing via browser; `?fail=1` query param enables deterministic error-state testing. Adding a test framework is out of scope per Non-Goals.
- [`?fail=1` query parameter could persist in bookmarks] → Mitigation: the parameter only affects the simulated submission; it has no side effects. Users will not normally encounter it.
- [Email validation regex may reject valid edge-case emails] → Mitigation: use a pragmatic pattern (per spec: "at least one character before and after `@` and a dot-separated domain") rather than the full RFC 5322 grammar. Prioritize usability over completeness.
- [No real error recovery — the form cannot retry after a simulated failure] → Mitigation: the error state clears on re-submit attempt (per spec); the user can simply submit again.
- [Form does nothing after Step 1 if JS handler is in a later step] → Mitigation: Step 1 keeps the inline `onsubmit` until Step 3 replaces it atomically with the `addEventListener` handler. See tasks.md commit atomicity.

## Migration Plan

**Deploy steps:**
1. Update `src/index.html` — add field `id` attributes, error containers, honeypot field, `aria-describedby`, `aria-live` regions, `novalidate` attribute. Keep inline `onsubmit` temporarily.
2. Update `src/styles.css` — add error styles (`.field-error`, `aria-invalid`), sending state styles (`.is-sending`, `.spinner`), success/error region styles (`.form-success`, `.form-error`), honeypot visual-hide (`.hp-field`).
3. Update `src/script.js` — add form submission logic (validation, state management, simulated async, honeypot check, focus management, error clearing). Remove inline `onsubmit` from `src/index.html` atomically with the JS addition.

**Rollback strategy:** Since this is a static page with no build step, rollback is `git revert` of the commit(s). No data migration, no server-side state.

## Open Questions

None. The error mode trigger was resolved with the user: URL query parameter `?fail=1` (confirmed, see D3).
