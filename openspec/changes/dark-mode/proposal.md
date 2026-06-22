## Why

The landing page currently ships a single light color scheme with no way to accommodate users who prefer dark mode. Adding dark mode improves accessibility, reduces eye strain in low-light environments, and aligns with OS-level appearance settings that users increasingly expect sites to respect.

## What Changes

- Add a dark color palette mapped to the existing CSS custom properties (`--bg`, `--ink`, `--surface`, etc.) via a `[data-theme="dark"]` selector.
- Add a `@media (prefers-color-scheme: dark)` block so the page defaults to dark when the OS requests it and no manual override exists.
- Add a theme toggle button in the site header that sets `data-theme` on `<html>` and persists the choice in `localStorage`.
- Ensure all sections (hero, logos, about, products, benefits, CTA, contact) and the footer inherit the correct palette in both modes.

## Capabilities

### New Capabilities

- `theme-tokens`: Dark-mode CSS custom property overrides activated by `[data-theme="dark"]` on `<html>`, plus a `@media (prefers-color-scheme: dark)` fallback that applies the same overrides when no manual preference is stored.
- `theme-toggle`: A header button that cycles the theme, writes the user's choice to `localStorage`, and applies `data-theme` on `<html>` on page load before first paint to avoid flash of wrong theme.

### Modified Capabilities

_(none)_

## Impact

- **Files modified**: `src/styles.css` (dark palette variables, media query), `src/index.html` (toggle button in header), `src/script.js` (theme init + toggle handler).
- **Dependencies**: none — pure HTML/CSS/JS, no new libraries.
- **Breaking changes**: none. Existing light theme remains the default when no OS preference or manual override is present.
- **Browser support**: CSS custom properties and `prefers-color-scheme` are supported in all evergreen browsers. `localStorage` is universally available.

## Proposal Research Documentation

**Local files**: `src/index.html`, `src/styles.css`, `src/script.js`

**External URLs**: _(none)_

## Additional Notes

- The existing `:root` block already defines 14 CSS custom properties (`--bg`, `--bg-2`, `--bg-alt`, `--surface`, `--line`, `--ink`, `--ink-2`, `--ink-3`, `--accent`, `--accent-2`, `--accent-soft`, `--radius`, `--shadow`, `--shadow-strong`, `--maxw`). The dark palette only needs to redefine the color-related ones; layout tokens (`--radius`, `--maxw`) stay unchanged.
- The footer already uses a dark background (`--bg: #0b1220`) with light text, so its existing styles may partially overlap with the dark-mode palette. The designer should verify the footer does not double-invert.
- The JS file is 16 lines (year setter, mobile nav toggle, IntersectionObserver). Theme init should run synchronously in `<head>` or at the top of `script.js` to prevent FOUC (flash of unstyled/wrong-theme content).
- The `script.js` file is loaded at the end of `<body>`. To avoid FOUC, consider inlining a small theme-init snippet in `<head>` of `index.html`, or adding the `data-theme` attribute via a blocking `<script>` before the first render.
