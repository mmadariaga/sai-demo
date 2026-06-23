## Step 1: Add cookie consent banner markup to HTML

**Files Affected**: `src/index.html`

**What Will Be Done**: Add a static banner block before `</body>`, hidden by default via the `hidden` attribute. The markup uses `role="dialog"`, `aria-modal="true"`, and `aria-label="Consentimiento de cookies"` per `specs/cookie-consent-banner/spec.md` (ARIA attributes requirement). Include a descriptive paragraph explaining cookie usage in Spanish, and two buttons reusing the existing `.btn` classes: "Aceptar" (`.btn .btn-primary`) and "Rechazar" (`.btn .btn-ghost`). Give the banner container a unique id (e.g., `cookie-consent`) and the buttons ids for JS hooking. The banner is placed as the last element in `<body>` so it appears after all content in DOM order.

**Testing Strategy**: Load the page in a browser — the banner must not be visible (hidden attribute). Inspect the DOM to confirm the banner element exists with correct ARIA attributes and button labels. Verify the page otherwise functions identically to before.

## Step 2: Add cookie consent banner styles to CSS

**Files Affected**: `src/styles.css`

**What Will Be Done**: Add styles for the `.cookie-consent` banner using the existing CSS custom properties (`--bg`, `--surface`, `--ink`, `--ink-2`, `--accent`, `--line`, `--radius`, `--shadow`) per the Theme support requirement in `specs/cookie-consent-banner/spec.md`. The banner is `position: fixed; bottom: 0; left: 0; width: 100%` with a `z-index` higher than `.site-header` (which is 50) — use `z-index: 100`. Style the inner layout as a flex row (text + buttons) on desktop, stacking vertically at `max-width: 480px` per the Banner positioning requirement. Add `padding-bottom` to `<body>` via a class (e.g., `.has-consent-banner`) toggled by JS when the banner is visible, to prevent content occlusion. Reuse `.btn` / `.btn-primary` / `.btn-ghost` for the buttons — do not redefine button styles.

**Testing Strategy**: Temporarily remove the `hidden` attribute from the banner in dev tools and verify: fixed bottom positioning, full width, correct theme colors in both light and dark modes, responsive stacking at ≤480px, and that content above is not permanently occluded (body padding adjusts).

## Step 3: Add consent logic to script.js

**Files Affected**: `src/script.js`

**What Will Be Done**: Add a new consent block before the existing contact form block. Define a configurable constant for the `localStorage` key (`cookie-consent`) and expiry duration (12 months in milliseconds). Implement the following global functions per `specs/cookie-consent-banner/spec.md`:
- `getConsentStatus()`: reads `localStorage` (try/catch guard matching the existing theme pattern at `src/script.js:32`), parses the JSON record, checks expiry, returns `"accepted"`, `"rejected"`, or `"none"`.
- `showBanner()`: removes the `hidden` attribute from the banner element, adds the `has-consent-banner` class to `<body>`, moves focus to the first button, and attaches a keydown listener for focus trapping (Tab/Shift+Tab wrapping between the two buttons).
- `hideBanner()`: adds `hidden` back, removes the body class, removes the keydown listener.
- Accept button click handler: writes the consent record (`{choice: "accepted", timestamp, version: 1}`) to `localStorage`, calls `hideBanner()`.
- Reject button click handler: writes the consent record (`{choice: "rejected", timestamp, version: 1}`), calls `hideBanner()`.
- Page-load check: on `DOMContentLoaded`, call `getConsentStatus()`; if `"none"`, call `showBanner()`.
The consent record JSON structure follows the Consent persistence structure requirement.

**Testing Strategy**: Clear `localStorage` and reload — banner appears, focus is on the first button. Click "Aceptar" — banner hides, `localStorage` has the JSON record with `choice: "accepted"`. Reload — banner does not appear. Repeat with "Rechazar" — `choice: "rejected"`, banner hidden on reload. Manually expire the record (set timestamp to 13 months ago) — banner reappears on reload. Verify Tab cycles between the two buttons only.

## Step 4: Add consent gate to contact form submit handler

**Files Affected**: `src/script.js`

**What Will Be Done**: Modify the existing contact form submit handler at `src/script.js:119-143` per `specs/contact-form-submission/spec.md`. Insert the consent check as the **first** logic after `e.preventDefault()` — before the honeypot check and before the field validation loop. The check calls `getConsentStatus()`; if the result is not `"accepted"`, call `showBanner()` and `return` early (no validation errors shown, no honeypot check, no simulated send). If the result is `"accepted"`, proceed with the existing handler logic unchanged. This ordering satisfies the Consent gate ordering requirement.

**Testing Strategy**: With no consent record, submit the form with valid data — banner appears, no validation errors shown, no success/error state. With "rejected" consent, same behavior. With "accepted" consent, the form behaves exactly as before (validation, honeypot, simulated send, success/error). Verify that filling the honeypot with no consent still shows the banner (not the success message) — proving the gate runs before the honeypot check.

## Required Documentation

### Local files
- `src/index.html:1-344` (page structure, contact form, button patterns, ARIA usage)
- `src/script.js:1-144` (global JS organization, theme toggle localStorage pattern, contact form submit handler)
- `src/styles.css:1-867` (CSS custom properties, button styles, responsive breakpoints, theming system)
- `openspec/changes/cookie-consent/proposal.md`
- `openspec/changes/cookie-consent/design.md`

### Spec files
- `openspec/changes/cookie-consent/specs/cookie-consent-banner/spec.md`
- `openspec/changes/cookie-consent/specs/contact-form-submission/spec.md`

### External URLs
- None

## Implementation Context

**Stack**: Vanilla JS (ES6+), HTML5, CSS3 with custom properties. No framework, no bundler, no build step. Single `script.js` loaded via `<script src="script.js">`.

**Conventions**:
- Global, no-module JS pattern — top-level `const`, `function` declarations, and event listeners. No IIFE, no import/export.
- `localStorage` access wrapped in `try/catch` (see `src/script.js:32` for the existing theme pattern).
- Spanish UI labels throughout (e.g., "Cambiar tema", "Abrir menú", "Enviando..."). Banner text and button labels must be in Spanish.
- CSS theming via `:root` and `[data-theme="dark"]` custom property overrides. New components must use existing tokens (`--bg`, `--surface`, `--ink`, `--accent`, etc.), not hardcoded colors.
- Accessibility patterns: `aria-label` on icon buttons, `aria-pressed` on toggle buttons, `aria-describedby` + `aria-invalid` on form fields, `aria-live` on status regions. New components must follow these patterns.

**Avoid**:
- Do NOT introduce ES modules, a bundler, or a build step — the project is intentionally build-free.
- Do NOT use external libraries (jQuery, focus-trap libraries, etc.) — Vanilla JS only.
- Do NOT hardcode colors in the banner CSS — use the existing CSS custom properties.
- Do NOT redefine button styles — reuse `.btn`, `.btn-primary`, `.btn-ghost`.
- Do NOT use `display: none` to hide the banner initially — use the `hidden` attribute (also hides from AT).
- Do NOT add a close/X button to the banner — dismissal is only via Accept or Reject.
