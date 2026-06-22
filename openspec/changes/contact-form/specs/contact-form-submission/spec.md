## ADDED Requirements

### Requirement: Required field validation
The form SHALL validate that the following fields are non-empty before submission: name, email, and message. If any required field is empty, the form MUST NOT submit and MUST display an inline error message next to the offending field.

#### Scenario: Submit with empty required field
- **WHEN** the user submits the form with the name field empty
- **THEN** the form does not submit, an error message "Este campo es obligatorio" appears adjacent to the name input, and the name input receives `aria-invalid="true"`

#### Scenario: Submit with all required fields filled
- **WHEN** the user submits the form with name, email, and message all non-empty and valid
- **THEN** no validation errors are shown and the submission flow proceeds

#### Scenario: Submit with empty message
- **WHEN** the user submits the form with the message textarea empty
- **THEN** the form does not submit, an error message appears adjacent to the message textarea, and focus moves to the message textarea

### Requirement: Email format validation
The form SHALL validate that the email field contains a syntactically valid email address. The validation MUST use a pattern that requires at least one character before and after the `@` symbol and a dot-separated domain.

#### Scenario: Submit with invalid email format
- **WHEN** the user submits the form with email value "not-an-email"
- **THEN** the form does not submit, an error message "Introduce un email válido" appears adjacent to the email input, and the email input receives `aria-invalid="true"`

#### Scenario: Submit with valid email format
- **WHEN** the user submits the form with email value "user@example.com"
- **THEN** no email validation error is shown

### Requirement: Phone format validation
When the optional phone field is non-empty, the form SHALL validate that it contains a plausible phone number (digits, optional leading `+`, spaces, hyphens, or parentheses). An invalid phone value MUST prevent submission and display an inline error.

#### Scenario: Submit with invalid phone format
- **WHEN** the user submits the form with phone value "abc"
- **THEN** the form does not submit, an error message "Introduce un teléfono válido" appears adjacent to the phone input

#### Scenario: Submit with empty phone
- **WHEN** the user submits the form with the phone field empty
- **THEN** no phone validation error is shown (field is optional)

#### Scenario: Submit with valid phone format
- **WHEN** the user submits the form with phone value "+34 600 123 456"
- **THEN** no phone validation error is shown

### Requirement: Honeypot anti-spam
The form SHALL include a hidden input field (honeypot) that is invisible to human users but visible to bots. The field MUST be visually hidden via CSS (not `display: none`) and have `tabindex="-1"` and `autocomplete="off"`. If the honeypot field contains a value at submission time, the form MUST silently discard the submission and show the success message (to avoid signaling to bots that the submission was rejected).

#### Scenario: Bot fills honeypot field
- **WHEN** a bot fills the honeypot field and submits the form
- **THEN** the form does not perform any real submission, and the success message is displayed (indistinguishable from a legitimate submission)

#### Scenario: Human submits without touching honeypot
- **WHEN** a human user submits the form without interacting with the honeypot field
- **THEN** the honeypot check passes and the submission flow proceeds normally

### Requirement: Simulated async submission
Since there is no backend, the form SHALL simulate a network request using a `setTimeout` with a configurable delay (default 1500ms). During the simulation, the submit button MUST be disabled and display a visual loading indicator.

#### Scenario: Successful simulated submission
- **WHEN** the form passes all validation and the honeypot check
- **THEN** the submit button becomes disabled with a loading indicator, and after the configured delay the success state is shown

#### Scenario: Simulated submission failure
- **WHEN** the simulated submission randomly fails (implementation-defined trigger, e.g., a configurable error mode for testing)
- **THEN** the error state is shown with a general error message "Ha ocurrido un error. Inténtalo de nuevo."

### Requirement: Sending state visual feedback
While the simulated submission is in progress, the form SHALL display a clear visual indication that the submission is being processed. The submit button MUST be disabled and show a spinner or loading text. The form fields MUST remain visible but should be visually de-emphasized (e.g., reduced opacity).

#### Scenario: Sending state activates on submit
- **WHEN** a valid form submission begins
- **THEN** the submit button displays a spinner and text "Enviando...", the button is disabled, and form fields are visually de-emphasized

#### Scenario: Sending state deactivates on completion
- **WHEN** the simulated submission completes (success or error)
- **THEN** the spinner is removed, the button returns to its normal state (or is replaced by the result message), and fields return to normal opacity

### Requirement: Success state
After a successful simulated submission, the form SHALL display a confirmation message and clear the form fields. The success message MUST be announced to assistive technologies via an `aria-live` region.

#### Scenario: Success message displayed after submission
- **WHEN** the simulated submission completes successfully
- **THEN** the form fields are reset, a success message "¡Gracias! Te responderemos en menos de 24h." is displayed, and the message is announced via an `aria-live="polite"` region

### Requirement: Error state visual feedback
When submission fails (simulated error), the form SHALL display a general error message above or near the submit button. The error message MUST be announced to assistive technologies via an `aria-live` region.

#### Scenario: General error displayed on submission failure
- **WHEN** the simulated submission fails
- **THEN** a general error message "Ha ocurrido un error. Inténtalo de nuevo." is displayed near the submit button and announced via an `aria-live="assertive"` region

### Requirement: Accessible inline error association
Each form field that can have a validation error SHALL have a corresponding error container element with a unique `id`. The input MUST reference this container via `aria-describedby`. When an error is present, the input MUST have `aria-invalid="true"`. When the error is cleared, `aria-invalid` MUST be removed or set to `"false"`.

#### Scenario: Error container linked via aria-describedby
- **WHEN** a validation error is shown for the email field
- **THEN** the email input has `aria-invalid="true"` and `aria-describedby` pointing to the error container's `id`, and the error container contains the error text

#### Scenario: Error cleared on valid re-input
- **WHEN** the user corrects the email field to a valid value and the error was previously shown
- **THEN** `aria-invalid` is removed or set to `"false"` on the email input, and the error container is emptied or hidden

### Requirement: Focus management on validation failure
When the form is submitted with validation errors, focus MUST move to the first field that has a validation error. This ensures keyboard and screen-reader users are immediately directed to the problem.

#### Scenario: Focus moves to first invalid field
- **WHEN** the user submits the form and both name and email have errors
- **THEN** focus is set to the name input (the first invalid field in DOM order)

#### Scenario: Focus moves to single invalid field
- **WHEN** the user submits the form and only the message field has an error
- **THEN** focus is set to the message textarea

### Requirement: Error clearing on user interaction
Validation errors for a specific field SHALL be cleared when the user modifies that field's value (on `input` event for text inputs/textareas, on `change` for other types). This provides immediate feedback that the error has been resolved.

#### Scenario: Error clears on typing
- **WHEN** the name field has a validation error and the user types a character
- **THEN** the error message for the name field is hidden, and `aria-invalid` is removed from the name input

#### Scenario: General error clears on re-submit attempt
- **WHEN** a general submission error is displayed and the user attempts to re-submit
- **THEN** the general error message is cleared before the new submission attempt begins
