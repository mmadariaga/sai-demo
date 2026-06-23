## Why

The site currently has no cookie consent mechanism, which is a GDPR compliance gap for any EU-facing website. Additionally, the contact form can be submitted without the user having given any privacy consent. This change adds a GDPR-compliant cookie consent banner and gates form submission on prior consent.

## What Changes

- Add a fixed-position cookie consent banner at the bottom of the viewport with Accept and Reject buttons.
- Persist the user's consent choice (accept/reject) and timestamp in `localStorage` with a configurable expiry (default 12 months).
- Re-show the banner when the stored consent has expired or no consent record exists.
- Add a new requirement to the contact-form-submission capability: the form MUST NOT submit unless a valid (non-expired) consent record exists in `localStorage`. If consent is missing or expired at submit time, the banner must be re-shown and submission blocked.
- All new behavior is Vanilla JS, accessible (keyboard-navigable, ARIA attributes, focus management).

## Capabilities

### New Capabilities
- `cookie-consent-banner`: GDPR-compliant cookie consent UI — fixed banner with accept/reject, localStorage persistence with configurable expiry, re-display on expiry or missing consent, keyboard and screen-reader accessible.

### Modified Capabilities
- `contact-form-submission`: Add a pre-submission gate that checks for a valid (non-expired) cookie consent record in `localStorage`. If absent or expired, block submission and re-show the consent banner.

## Impact

- **Files affected**: `src/index.html` (banner markup, ARIA attributes), `src/script.js` (consent logic, form submission gate), `src/styles.css` (banner styles, responsive layout).
- **Dependencies**: None. Pure Vanilla JS — no new libraries.
- **APIs/systems**: `localStorage` for consent persistence. No backend interaction.

## Proposal Research Documentation

**Local files**: `src/index.html` (344 lines), `src/script.js` (144 lines), `src/styles.css` (867 lines), `openspec/changes/archive/2026-06-22-contact-form/proposal.md`, `openspec/changes/archive/2026-06-22-contact-form/specs/contact-form-submission/spec.md`

**External URLs**: None

## Additional Notes

- The contact form currently has validation (required fields, email/phone format) and a honeypot anti-spam field, but no consent check. The consent gate is a new pre-submission step, not a replacement for existing validation.
- The banner should use the existing CSS custom property theming system (`[data-theme]`) to support both light and dark modes.
- The existing button patterns (`.btn`, `.btn-primary`, `.btn-ghost`) should be reused for the Accept/Reject buttons.
- Consent storage key and expiry duration should be configurable constants in `script.js`.
- The banner must be dismissible only via explicit Accept or Reject — no close/X button that bypasses the choice.
- When the banner is visible, it should trap focus within it (or at minimum be fully keyboard-navigable) to ensure the user makes an explicit choice.
