## ADDED Requirements

### Requirement: Banner display on missing or expired consent
The consent banner SHALL be displayed when the page loads if no consent record exists in `localStorage`, or if the stored consent record has expired (timestamp older than the configurable expiry period, default 12 months). The banner MUST NOT be displayed when a valid (non-expired) consent record exists.

#### Scenario: Banner shown on first visit
- **WHEN** the user visits the site for the first time with no `localStorage` consent record
- **THEN** the cookie consent banner is displayed at the bottom of the viewport

#### Scenario: Banner shown after consent expiry
- **WHEN** the user has a stored consent record with a timestamp older than 12 months
- **THEN** the stored record is considered expired and the banner is displayed

#### Scenario: Banner hidden with valid consent
- **WHEN** the user has a stored consent record (accept or reject) with a timestamp within the last 12 months
- **THEN** the banner is not displayed

### Requirement: Accept and Reject actions
The banner SHALL present two clearly labeled buttons: "Aceptar" (Accept) and "Rechazar" (Reject). Clicking either button MUST record the user's choice, persist it to `localStorage`, and dismiss the banner.

#### Scenario: User accepts cookies
- **WHEN** the user clicks the "Aceptar" button
- **THEN** `localStorage` stores a consent record with choice "accepted" and the current timestamp, and the banner is dismissed

#### Scenario: User rejects cookies
- **WHEN** the user clicks the "Rechazar" button
- **THEN** `localStorage` stores a consent record with choice "rejected" and the current timestamp, and the banner is dismissed

### Requirement: Consent persistence structure
The consent record stored in `localStorage` SHALL be a JSON object containing at minimum: `choice` ("accepted" or "rejected"), `timestamp` (ISO 8601 string), and `version` (integer, default 1). The storage key MUST be dedicated (e.g., `cookie-consent`) and not collide with other `localStorage` keys.

#### Scenario: Consent record structure after accept
- **WHEN** the user accepts cookies
- **THEN** `localStorage` contains a JSON object under the consent key with `choice: "accepted"`, a valid ISO 8601 `timestamp`, and `version: 1`

#### Scenario: Consent record structure after reject
- **WHEN** the user rejects cookies
- **THEN** `localStorage` contains a JSON object under the consent key with `choice: "rejected"`, a valid ISO 8601 `timestamp`, and `version: 1`

### Requirement: Banner positioning and layout
The banner SHALL be fixed to the bottom of the viewport, spanning the full width. It MUST NOT obscure the main content more than necessary and MUST be responsive (stacking vertically on narrow viewports). The banner MUST have a higher `z-index` than all page content to remain visible during scroll.

#### Scenario: Banner visible above page content
- **WHEN** the banner is displayed
- **THEN** it is fixed at the bottom of the viewport, spans full width, and remains visible when the user scrolls

#### Scenario: Responsive layout on narrow viewport
- **WHEN** the viewport width is 480px or less
- **THEN** the banner content stacks vertically (text above buttons) and remains fully readable

### Requirement: Theme support
The banner SHALL respect the existing `data-theme` attribute system, rendering correctly in both light and dark modes using the project's CSS custom properties.

#### Scenario: Banner in dark mode
- **WHEN** `data-theme="dark"` is active and the banner is displayed
- **THEN** the banner uses dark-mode colors consistent with the rest of the site

#### Scenario: Banner in light mode
- **WHEN** `data-theme="light"` is active and the banner is displayed
- **THEN** the banner uses light-mode colors consistent with the rest of the site

### Requirement: Keyboard accessibility
The banner MUST be fully operable via keyboard. Both Accept and Reject buttons MUST be reachable with Tab and activatable with Enter or Space. When the banner appears, focus MUST move to the first focusable element inside the banner (the Accept button or a wrapper with `tabindex="-1"`).

#### Scenario: Focus moves to banner on display
- **WHEN** the consent banner is displayed
- **THEN** focus is placed on the first focusable element within the banner

#### Scenario: Tab cycles within banner
- **WHEN** the banner is visible and the user presses Tab
- **THEN** focus moves between the Accept and Reject buttons without leaving the banner

#### Scenario: Button activation via keyboard
- **WHEN** focus is on the Accept or Reject button and the user presses Enter or Space
- **THEN** the corresponding action is triggered (same as click)

### Requirement: ARIA attributes
The banner container MUST have `role="dialog"` and `aria-modal="true"` to communicate its nature to assistive technologies. It MUST have an `aria-label` or `aria-labelledby` providing a descriptive title. The banner text MUST include a clear explanation of what cookies are used for.

#### Scenario: Screen reader announces banner
- **WHEN** the banner is displayed and a screen reader is active
- **THEN** the screen reader announces the dialog role, the label (e.g., "Consentimiento de cookies"), and the descriptive text

### Requirement: Dismissible only via explicit choice
The banner MUST NOT have a close (X) button or any other dismissal mechanism other than clicking Accept or Reject. The user MUST make an explicit choice.

#### Scenario: No close button exists
- **WHEN** the banner is displayed
- **THEN** there is no close/X button or swipe-to-dismiss gesture; the only way to dismiss is Accept or Reject

### Requirement: Consent API for other components
The consent logic SHALL expose a programmatic function (e.g., `getConsentStatus()`) that returns the current consent state: `"accepted"`, `"rejected"`, or `"none"` (missing/expired). This function MUST be callable from other modules (e.g., the contact form submission handler).

#### Scenario: Consent status returns accepted
- **WHEN** `getConsentStatus()` is called and a valid "accepted" record exists
- **THEN** it returns `"accepted"`

#### Scenario: Consent status returns rejected
- **WHEN** `getConsentStatus()` is called and a valid "rejected" record exists
- **THEN** it returns `"rejected"`

#### Scenario: Consent status returns none when missing
- **WHEN** `getConsentStatus()` is called and no consent record exists in `localStorage`
- **THEN** it returns `"none"`

#### Scenario: Consent status returns none when expired
- **WHEN** `getConsentStatus()` is called and the stored consent record is older than the expiry period
- **THEN** it returns `"none"`
