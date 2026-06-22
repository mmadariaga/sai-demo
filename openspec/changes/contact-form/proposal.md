## Why

The contact form in `src/index.html` (#contacto) is a placeholder: its `onsubmit` handler calls `preventDefault()` and immediately reveals a static thank-you message without any validation, network simulation, or state feedback. Users can submit empty or malformed data with no error feedback, there is no anti-spam protection, and the form lacks accessibility attributes for error states. This change replaces the fake behavior with a production-quality client-side submission flow.

## What Changes

- Replace the inline `onsubmit` handler with a proper Vanilla JS submission flow in `src/script.js`.
- Add required-field validation (name, email, message) and format validation (email pattern, optional phone pattern).
- Implement three visual states: **sending** (disable button, show spinner), **success** (show confirmation), **error** (show per-field and general error messages).
- Simulate network submission with a configurable delay (no backend).
- Add accessibility attributes: `aria-invalid`, `aria-describedby` for error messages, focus management to first invalid field on submit failure.
- Add a hidden honeypot field for anti-spam; reject submissions where the honeypot is filled.

## Capabilities

### New Capabilities
- `contact-form-submission`: End-to-end client-side form submission flow — validation (required + format), simulated async send with sending/success/error states, honeypot anti-spam, and accessible error feedback (aria-invalid, aria-describedby, focus-to-first-error).

### Modified Capabilities
<!-- None — no existing specs in this project. -->

## Impact

- **Files affected**: `src/index.html` (form markup: add honeypot field, error containers, aria attributes, IDs for aria-describedby), `src/script.js` (new form submission logic), `src/styles.css` (error/sending/success state styles).
- **Dependencies**: None. Pure Vanilla JS — no new libraries or build tools.
- **APIs/systems**: No backend. Submission is simulated with `setTimeout`.

## Proposal Research Documentation

**Local files**: `src/index.html` (lines 243-291, #contacto section), `src/script.js` (37 lines, existing behavior), `src/styles.css`, `openspec/config.yaml`

**External URLs**: None

## Additional Notes

- The form fields currently have no `id` attributes — only `name`. The implementation will need to add IDs to support `aria-describedby` linking to per-field error containers.
- The existing success message (`<p class="form-ok" hidden>`) will be replaced by a richer state system (sending/success/error).
- The project is a static landing page (no build step, no bundler). All JS is loaded via `<script src="script.js">`.
- The phone field is optional; when filled, it should be validated against a reasonable phone pattern.
- The honeypot field should be visually hidden via CSS (not `display:none`, to avoid bot detection heuristics) and have `tabindex="-1"` + `autocomplete="off"`.
