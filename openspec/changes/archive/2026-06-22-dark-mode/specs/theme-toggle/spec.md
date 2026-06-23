## ADDED Requirements

### Requirement: Toggle button in header

A theme toggle button SHALL be present in the site header, visible in both light and dark modes. The button MUST be accessible via keyboard (reachable with Tab, activatable with Enter/Space) and include an `aria-label` describing its function.

#### Scenario: Button visible in light mode

- **WHEN** the page loads with the light theme active
- **THEN** a toggle button is visible in the header that allows the user to switch to dark mode

#### Scenario: Button visible in dark mode

- **WHEN** the page loads with the dark theme active
- **THEN** a toggle button is visible in the header that allows the user to switch to light mode

#### Scenario: Keyboard activation

- **WHEN** the user focuses the toggle button and presses Enter or Space
- **THEN** the theme switches and the new preference is persisted

### Requirement: Manual override persistence

When the user clicks the toggle button, the chosen theme SHALL be saved to `localStorage` under a dedicated key. On subsequent page loads, the stored preference MUST be applied regardless of the OS color scheme.

#### Scenario: Persist dark preference

- **WHEN** the user toggles to dark mode
- **THEN** `localStorage` stores the value "dark" under the theme key

#### Scenario: Persist light preference after override

- **WHEN** the user had auto-detected dark mode (from OS) and manually toggles to light
- **THEN** `localStorage` stores the value "light" under the theme key, overriding the OS preference

#### Scenario: Stored preference survives reload

- **WHEN** the user has a stored preference in `localStorage` and reloads the page
- **THEN** the page renders with the stored theme without flashing the opposite theme first

### Requirement: Theme initialization before paint

The theme MUST be applied before the first meaningful paint to prevent a flash of the wrong theme (FOUC). The initialization logic SHALL read `localStorage` first, then fall back to `prefers-color-scheme`, and set `data-theme` on `<html>` synchronously.

#### Scenario: No flash on load with stored preference

- **WHEN** the user has a stored "dark" preference and navigates to the page
- **THEN** the page renders directly in dark mode with no visible flash of the light theme

#### Scenario: No flash on load with OS preference

- **WHEN** the user has no stored preference and the OS is set to dark mode
- **THEN** the page renders directly in dark mode with no visible flash of the light theme

### Requirement: data-theme attribute management

The toggle logic SHALL set the `data-theme` attribute on the `<html>` element. Acceptable values are `"dark"` and `"light"`. When no manual override exists and the system preference is light, the attribute MAY be absent or set to `"light"`.

#### Scenario: Attribute set to dark

- **WHEN** dark mode is active (either from OS or manual override)
- **THEN** `<html data-theme="dark">` is present in the DOM

#### Scenario: Attribute set to light after override

- **WHEN** the user manually selects light mode while OS is dark
- **THEN** `<html data-theme="light">` is present in the DOM
