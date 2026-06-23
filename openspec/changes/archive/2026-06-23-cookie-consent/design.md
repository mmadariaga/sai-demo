## Context

The project is a static landing page (Vanilla JS, no build step, no bundler) for what appears to be a commercial refrigeration/camera business. The codebase consists of three primary files: `src/index.html` (344 lines), `src/script.js` (144 lines), and `src/styles.css` (867 lines).

The JS is organized as **IIFE-free global** — top-level `const`, `function` declarations, and event listeners with no module pattern, no import/export. `localStorage` is already used for theme persistence (`theme` key) with a try/catch guard. The contact form submit handler (`src/script.js:119-143`) currently runs: `preventDefault()` → honeypot check → field validation loop → `simulateSubmit()` → success/error UI.

The CSS uses a custom-property-driven theming system (`[data-theme]` + `prefers-color-scheme`) with tokens like `--bg`, `--surface`, `--ink`, `--accent`, `--radius`, `--shadow`, `--focus-ring`. Existing button classes (`.btn`, `.btn-primary`, `.btn-ghost`) provide the visual language. Responsive breakpoints exist at 1080, 880, 720, 600, and 560px.

There is no existing cookie consent mechanism, no `GLOSSARY.md`, and no ADR culture in the project.

## Goals / Non-Goals

**Goals**:
- Add a GDPR-compliant cookie consent banner with Accept/Reject actions.
- Persist consent choice in `localStorage` with a 12-month expiry.
- Re-show the banner when consent is missing or expired.
- Gate contact form submission on prior accepted consent.
- Full keyboard accessibility and ARIA support.
- Theme-aware banner (light/dark) using existing CSS custom properties.

**Non-Goals**:
- Granular cookie category consent (analytics, marketing, etc.) — only a binary accept/reject.
- Actual cookie/script blocking based on consent choice — this is a UI + persistence layer only.
- Server-side consent logging — no backend exists.
- Internationalization of banner text — Spanish labels hardcoded to match existing site language.
- A privacy policy page — out of scope for this change.

## Decisions

### Decision 1: Consent logic lives in the existing `script.js`

**Choice**: Add the consent logic as a new block in `src/script.js`, exposing `getConsentStatus()` as a global function. Place it before the contact form block so the function is defined before use.

**Rationale**: The project has a single `script.js` with a global, no-module pattern. Introducing a separate file would require another `<script>` tag in HTML and break the single-file convention. The existing theme toggle and contact form already follow this pattern.

**ADR criteria**: None of the three criteria apply (not hard to reverse, not surprising, no real trade-off). No ADR.

### Decision 2: Static banner markup in HTML, hidden by default

**Choice**: Add the banner markup as a static block before `</body>` in `src/index.html`, hidden by default via the `hidden` attribute. JavaScript removes `hidden` and shows the banner when consent is missing/expired.

**Rationale**: Static markup is progressive-enhancement friendly (content exists without JS) and simpler than dynamic injection. Hiding by default prevents a flash of the banner on load when valid consent exists. The `hidden` attribute is used (rather than `display:none` in CSS) because it also hides the element from assistive technologies until explicitly shown.

**ADR criteria**: Not hard to reverse, not surprising. No ADR.

### Decision 3: Focus trap via keydown listener on banner container

**Choice**: Implement a focus trap by listening for `keydown` on the banner container. When Tab or Shift+Tab is pressed at the boundary of the focusable elements, wrap focus to the other end. The banner has exactly two focusable elements (Accept and Reject buttons).

**Rationale**: The spec requires Tab to cycle within the banner without leaving. With only two buttons, a natural Tab flow would escape the banner. A keydown-based trap is the minimal accessible solution without introducing a library.

**ADR criteria**: Not hard to reverse. No ADR.

### Decision 4: Consent record as JSON with version field

**Choice**: Store the consent record as a JSON object under `localStorage` key `cookie-consent` with fields: `choice` ("accepted" | "rejected"), `timestamp` (ISO 8601), `version` (integer, default 1).

**Rationale**: The `version` field allows future migration of the consent schema (e.g., adding granular categories) without ambiguity. JSON matches the structured nature of the data. The key `cookie-consent` is dedicated and does not collide with the existing `theme` key.

**ADR criteria**: Hard to reverse (changing the storage format later requires migration) + surprising without context (why `version` for a binary choice?) + real trade-off (could have used a simple string). **All three apply** — documenting alternatives below.

**Alternatives considered**:
- *Simple string value* (`"accepted"` or `"rejected"`): Simpler but loses timestamp (needed for expiry) and has no migration path.
- *Two keys* (`cookie-consent-choice` + `cookie-consent-ts`): Avoids JSON parse overhead but fragments the data and is error-prone.
- Chosen: Single JSON object — cohesive, extensible, single read/write.

### Decision 5: Re-show banner via a `showBanner()` function callable from the form gate

**Choice**: The consent module exposes both `getConsentStatus()` and `showBanner()` as global functions. The contact form submit handler calls `getConsentStatus()` first; if not `"accepted"`, it calls `showBanner()` and returns early.

**Rationale**: The form gate needs to trigger the banner display programmatically (not just on page load). A shared `showBanner()` function avoids duplicating banner-show logic between the page-load check and the form-submit gate.

**ADR criteria**: Not hard to reverse. No ADR.

## Risks / Trade-offs

- **[localStorage unavailable]** (private browsing, disabled storage) → The consent check wraps `localStorage.getItem` in try/catch (matching the existing theme persistence pattern). If storage fails, `getConsentStatus()` returns `"none"` and the banner shows on every visit. Acceptable degradation — user must consent each session.

- **[Focus trap conflicts with screen reader navigation]** → The focus trap only intercepts Tab/Shift+Tab. Screen reader users can still use virtual cursor navigation (arrow keys) to read page content behind the dialog. This is standard modal behavior.

- **[Banner overlaps content on short viewports]** → The banner is fixed at the bottom. On very short viewports it may cover content. Mitigation: the banner is compact (text + 2 buttons) and stacks vertically on ≤480px. `padding-bottom` is added to `<body>` when the banner is visible to prevent content occlusion.

- **[No actual cookie blocking]** → This change records consent but does not block scripts/cookies based on the choice. This is a known limitation (documented in Non-Goals). A future change could add script blocking based on the consent record.

## Migration Plan

**Deploy steps**:
1. Add banner markup to `src/index.html` (before `</body>`).
2. Add consent logic to `src/script.js` (new block before contact form block).
3. Add consent gate to the existing contact form submit handler (first check in handler).
4. Add banner styles to `src/styles.css`.
5. No backend changes, no build step, no data migration.

**Rollback strategy**: Remove the banner markup, consent JS block, and banner CSS. The contact form reverts to its original behavior (no consent gate). No data cleanup needed — the `localStorage` key `cookie-consent` can remain harmlessly.

## Open Questions

None. All design questions were resolved during codebase research:
- JS organization (global, no modules) — confirmed by explorer.
- Existing localStorage pattern (try/catch guard) — confirmed.
- Button class reuse (`.btn`, `.btn-primary`, `.btn-ghost`) — confirmed available.
- CSS custom property tokens — confirmed list available.
- Contact form handler structure — confirmed at `src/script.js:119-143`.
