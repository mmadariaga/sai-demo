## ADDED Requirements

### Requirement: Cookie consent gate before submission
Before executing the submission flow, the form handler SHALL check the cookie consent status via `getConsentStatus()`. If the status is anything other than `"accepted"`, the form MUST NOT submit and MUST trigger the consent banner to be displayed.

#### Scenario: Submit with accepted consent
- **WHEN** the user submits the form and `getConsentStatus()` returns `"accepted"`
- **THEN** the submission flow proceeds normally (validation, honeypot check, simulated send)

#### Scenario: Submit with rejected consent
- **WHEN** the user submits the form and `getConsentStatus()` returns `"rejected"`
- **THEN** the form does not submit and the consent banner is displayed

#### Scenario: Submit with no consent record
- **WHEN** the user submits the form and `getConsentStatus()` returns `"none"`
- **THEN** the form does not submit and the consent banner is displayed

#### Scenario: Submit with expired consent
- **WHEN** the user submits the form and the stored consent record has expired (older than 12 months)
- **THEN** `getConsentStatus()` returns `"none"`, the form does not submit, and the consent banner is displayed

### Requirement: Consent gate ordering
The consent check SHALL execute before any other submission logic (field validation, honeypot check, simulated send). This ensures the form never processes data without prior consent.

#### Scenario: Consent gate runs before validation
- **WHEN** the user submits the form with valid fields but no consent record
- **THEN** the consent banner is shown and no field validation errors are displayed (consent gate blocked submission before validation ran)

#### Scenario: Consent gate runs before honeypot check
- **WHEN** the user submits the form with the honeypot field filled but no consent record
- **THEN** the consent banner is shown (consent gate blocked submission before honeypot check ran)
