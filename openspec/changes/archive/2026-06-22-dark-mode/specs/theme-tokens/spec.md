## ADDED Requirements

### Requirement: Dark palette via data-theme attribute

The stylesheet SHALL define a `[data-theme="dark"]` selector on `<html>` that overrides every color-related CSS custom property declared in `:root` (`--bg`, `--bg-2`, `--bg-alt`, `--surface`, `--line`, `--ink`, `--ink-2`, `--ink-3`, `--accent`, `--accent-2`, `--accent-soft`, `--shadow`, `--shadow-strong`). Layout tokens (`--radius`, `--maxw`) MUST remain unchanged.

#### Scenario: Dark theme applied via attribute

- **WHEN** `<html>` has `data-theme="dark"`
- **THEN** all color custom properties resolve to their dark-palette values and every section (hero, logos, about, products, benefits, CTA, contact) and the footer render with dark-mode colors

#### Scenario: Light theme is default

- **WHEN** `<html>` has no `data-theme` attribute or `data-theme="light"`
- **THEN** all color custom properties resolve to the existing light-palette values defined in `:root`

### Requirement: System preference detection

The stylesheet SHALL include a `@media (prefers-color-scheme: dark)` block that applies the same dark-palette overrides as `[data-theme="dark"]`, but ONLY when no manual override is stored. The manual override MUST take precedence over the system preference.

#### Scenario: OS dark mode with no manual override

- **WHEN** the user's OS is set to dark mode AND no theme preference exists in `localStorage`
- **THEN** the page renders using the dark palette

#### Scenario: OS dark mode with manual light override

- **WHEN** the user's OS is set to dark mode AND `localStorage` contains a manual preference for "light"
- **THEN** the page renders using the light palette (manual override wins)

#### Scenario: OS light mode with no manual override

- **WHEN** the user's OS is set to light mode AND no theme preference exists in `localStorage`
- **THEN** the page renders using the light palette

### Requirement: Full-page coverage

Every visual section of the landing page SHALL inherit the active theme's color tokens. No section, component, or element SHALL hardcode color values that bypass the custom-property system.

#### Scenario: Footer in dark mode

- **WHEN** dark mode is active
- **THEN** the site-footer renders with dark-palette colors consistent with the rest of the page, without double-inverting or visual conflicts from its existing dark-background styles

#### Scenario: All sections themed

- **WHEN** dark mode is active
- **THEN** the hero, logos, about, products, benefits, CTA, and contact sections all render with dark-palette background, text, and accent colors
