# Cookie Consent Banner & Form Gate

## Goal

Add a GDPR-compliant cookie consent banner with Accept/Reject actions, localStorage persistence with 12-month expiry, and a contact form submission gate that blocks submission without prior accepted consent.

## Prerequisites

- Ensure branch is not master or main. Ask the user to select the branch to use:
  1. `cookie-consent` (derived from the change name)
  2. Custom branch name (free input — e.g., backlog-linked name like `JIRA-123-cookie-consent`)
- If the selected branch does not exist, create it from `main` before implementing.

### Step-by-Step Instructions

#### Step 1: Add cookie consent banner markup to HTML

*(Non-testable step — standard format, no RED/GREEN needed because the banner is hidden by default and not yet observable in the app)*

- [x] Insert the following banner block immediately before the closing `</body>` tag in `src/index.html` (after the `<script src="script.js"></script>` line):

```html
<div class="cookie-consent" id="cookieConsent" role="dialog" aria-modal="true" aria-label="Consentimiento de cookies" hidden>
  <div class="cookie-consent-inner">
    <p>Utilizamos cookies para mejorar tu experiencia. Al continuar navegando, aceptas nuestra política de cookies.</p>
    <div class="cookie-consent-actions">
      <button type="button" class="btn btn-primary" id="cookieConsentAccept">Aceptar</button>
      <button type="button" class="btn btn-ghost" id="cookieConsentReject">Rechazar</button>
    </div>
  </div>
</div>
```

##### Step 1 Verification Checklist

**Automated (agent runs before stopping):**
- [x] `src/index.html` contains the banner markup with `id="cookieConsent"`, `role="dialog"`, `aria-modal="true"`, and `aria-label="Consentimiento de cookies"`
- [x] The banner element has the `hidden` attribute
- [x] The Accept button has `id="cookieConsentAccept"` and text "Aceptar"
- [x] The Reject button has `id="cookieConsentReject"` and text "Rechazar"
- [x] The banner is placed as the last element inside `<body>`

**Human (verify in browser before committing):**
- [x] Load the page — the banner is not visible
- [x] Open DevTools Elements panel — the banner DOM node exists with correct ARIA attributes and button labels

#### Step 1 STOP & COMMIT

**sai-4-apply:** Run all Automated checks above and confirm they pass before stopping.

**STOP & COMMIT:** Stage and commit after Automated checks pass. No browser verification required at this step.

---

#### Step 2: Add cookie consent banner styles to CSS

*(Non-testable step — standard format, no RED/GREEN needed because this is CSS-only styling)*

- [x] Append the following styles to the end of `src/styles.css`:

```css
/* ---------- Cookie consent banner ---------- */
.cookie-consent {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background: var(--surface);
  border-top: 1px solid var(--line);
  box-shadow: 0 -4px 20px var(--overlay);
  padding: 16px 0;
}
.cookie-consent-inner {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.cookie-consent p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--ink-2);
  line-height: 1.5;
}
.cookie-consent-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
body.has-consent-banner {
  padding-bottom: 80px;
}
@media (max-width: 480px) {
  .cookie-consent-inner {
    flex-direction: column;
    text-align: center;
  }
  .cookie-consent-actions {
    width: 100%;
    justify-content: center;
  }
  body.has-consent-banner {
    padding-bottom: 140px;
  }
}
```

##### Step 2 Verification Checklist

**Automated (agent runs before stopping):**
- [x] `src/styles.css` contains `.cookie-consent` with `position: fixed`, `bottom: 0`, `width: 100%`, `z-index: 100`
- [x] `src/styles.css` contains `body.has-consent-banner` with `padding-bottom: 80px`
- [x] `.cookie-consent` uses existing custom properties (`--surface`, `--line`, `--overlay`, `--ink-2`, `--maxw`)
- [x] Responsive breakpoint at `max-width: 480px` stacks `.cookie-consent-inner` vertically and increases `body.has-consent-banner` padding to `140px`
- [x] Button styles are not redefined — only `.btn`, `.btn-primary`, `.btn-ghost` are reused

**Human (verify in browser before committing):**
*(Deferred to Step 3 where the banner is first shown)*

#### Step 2 STOP & COMMIT

**sai-4-apply:** Run all Automated checks above and confirm they pass before stopping.

**STOP & COMMIT:** Stage and commit after Automated checks pass. No browser verification required at this step.

---

#### Step 3: Add consent logic to script.js

*(Non-testable step — standard format, no RED/GREEN because the project has no test runner infrastructure)*

- [x] Insert the following consent logic block at the top of `src/script.js`, immediately after `document.getElementById('year').textContent = new Date().getFullYear();` and before the nav toggle code:

```javascript
// Cookie consent
const CONSENT_KEY = 'cookie-consent';
const CONSENT_EXPIRY_MS = 365 * 24 * 60 * 60 * 1000; // 12 months

function getConsentStatus() {
  try {
    var raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return 'none';
    var record = JSON.parse(raw);
    if (!record || typeof record !== 'object') return 'none';
    if (!record.choice || !record.timestamp) return 'none';
    var ts = new Date(record.timestamp).getTime();
    if (isNaN(ts) || Date.now() - ts > CONSENT_EXPIRY_MS) return 'none';
    return record.choice === 'accepted' || record.choice === 'rejected' ? record.choice : 'none';
  } catch (e) {
    return 'none';
  }
}

function showBanner() {
  var banner = document.getElementById('cookieConsent');
  if (!banner) return;
  banner.hidden = false;
  document.body.classList.add('has-consent-banner');
  var acceptBtn = document.getElementById('cookieConsentAccept');
  if (acceptBtn) acceptBtn.focus();
  banner.addEventListener('keydown', trapFocus);
}

function hideBanner() {
  var banner = document.getElementById('cookieConsent');
  if (!banner) return;
  banner.hidden = true;
  document.body.classList.remove('has-consent-banner');
  banner.removeEventListener('keydown', trapFocus);
}

function trapFocus(e) {
  var acceptBtn = document.getElementById('cookieConsentAccept');
  var rejectBtn = document.getElementById('cookieConsentReject');
  if (!acceptBtn || !rejectBtn) return;
  if (e.key !== 'Tab') return;
  if (e.shiftKey) {
    if (document.activeElement === acceptBtn) {
      e.preventDefault();
      rejectBtn.focus();
    }
  } else {
    if (document.activeElement === rejectBtn) {
      e.preventDefault();
      acceptBtn.focus();
    }
  }
}

function writeConsent(choice) {
  try {
    var record = { choice: choice, timestamp: new Date().toISOString(), version: 1 };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  } catch (e) {}
}

var consentAcceptBtn = document.getElementById('cookieConsentAccept');
var consentRejectBtn = document.getElementById('cookieConsentReject');
if (consentAcceptBtn) {
  consentAcceptBtn.addEventListener('click', function() {
    writeConsent('accepted');
    hideBanner();
  });
}
if (consentRejectBtn) {
  consentRejectBtn.addEventListener('click', function() {
    writeConsent('rejected');
    hideBanner();
  });
}
if (getConsentStatus() === 'none') {
  showBanner();
}
```

##### Step 3 Verification Checklist

**Automated (agent runs before stopping):**
- [x] `src/script.js` defines `getConsentStatus()`, `showBanner()`, `hideBanner()`, `trapFocus()`, and `writeConsent()`
- [x] `CONSENT_KEY` is set to `'cookie-consent'` and `CONSENT_EXPIRY_MS` equals 12 months
- [x] `localStorage` access is wrapped in `try/catch` in both `getConsentStatus()` and `writeConsent()`
- [x] The consent record JSON structure includes `choice`, `timestamp` (ISO 8601), and `version: 1`
- [x] `showBanner()` removes `hidden`, adds `has-consent-banner` class to `<body>`, focuses the Accept button, and attaches `trapFocus`
- [x] `hideBanner()` restores `hidden`, removes the body class, and detaches `trapFocus`
- [x] Page-load initialization calls `getConsentStatus() === 'none'` and conditionally calls `showBanner()`

**Human (verify in browser before committing):**

*Deferred from Step 2 (Banner styles):*
- [x] Temporarily remove the `hidden` attribute from the banner in DevTools — verify fixed bottom positioning, full width, correct theme colors in both light and dark modes, responsive vertical stacking at ≤480px, and that `body.has-consent-banner` padding prevents permanent content occlusion

*Step 3:*
- [x] Clear `localStorage` and reload — banner appears at bottom of viewport
- [x] When banner appears, focus is on the "Aceptar" button
- [x] Press Tab — focus cycles between "Aceptar" and "Rechazar" without leaving the banner
- [x] Press Shift+Tab — focus cycles in reverse
- [x] Press Enter or Space on a focused button — triggers the corresponding action
- [x] Click "Aceptar" — banner hides, `localStorage` contains JSON record with `choice: "accepted"`, valid ISO `timestamp`, and `version: 1`
- [x] Reload page — banner does not appear
- [x] Clear `localStorage`, reload, click "Rechazar" — banner hides, `localStorage` contains `choice: "rejected"`
- [x] Reload page — banner does not appear
- [x] Manually expire the record (edit `localStorage` timestamp to 13 months ago) — banner reappears on reload

#### Step 3 STOP & COMMIT

**sai-4-apply:** Run all Automated checks above and confirm they pass before stopping.

**STOP & COMMIT:** Wait for the human to verify all Human checks in the browser (including deferred checks from Step 2), then stage and commit before continuing.

---

#### Step 4: Add consent gate to contact form submit handler

*(Non-testable step — standard format, no RED/GREEN because the project has no test runner infrastructure)*

- [x] Modify the contact form submit handler in `src/script.js` to add the consent gate as the first check after `e.preventDefault()`:

Replace:
```javascript
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    errorMsg.hidden = true;
    successMsg.hidden = true;
```

With:
```javascript
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (getConsentStatus() !== 'accepted') {
      showBanner();
      return;
    }
    errorMsg.hidden = true;
    successMsg.hidden = true;
```

##### Step 4 Verification Checklist

**Automated (agent runs before stopping):**
- [x] `src/script.js` contact form submit handler calls `getConsentStatus()` immediately after `e.preventDefault()`
- [x] If `getConsentStatus() !== 'accepted'`, the handler calls `showBanner()` and returns early
- [x] The existing honeypot check, validation loop, `simulateSubmit()`, `showSuccess()`, and `showError()` logic remain intact after the gate

**Human (verify in browser before committing):**
- [x] With no consent record, fill the form with valid data and submit — banner appears, no validation errors shown, no success/error state
- [x] With "rejected" consent, submit the form — banner appears, form does not submit
- [x] With "accepted" consent, submit the form with valid data — form proceeds normally (validation, honeypot, simulated send, success message)
- [x] With "accepted" consent, submit with empty required fields — validation errors appear as before
- [x] Fill the honeypot field with no consent record and submit — banner appears (not success message), proving gate runs before honeypot check

#### Step 4 STOP & COMMIT

**sai-4-apply:** Run all Automated checks above and confirm they pass before stopping.

**STOP & COMMIT:** Wait for the human to verify all Human checks in the browser, then stage and commit before continuing.
