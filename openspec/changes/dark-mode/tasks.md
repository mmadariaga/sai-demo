# Tasks — dark-mode

Reference specs for what to build; reference `design.md` for how to build it. Steps are ordered by dependency and each is a single commit boundary that leaves the site rendering without errors.

## Step 1: Dark token block + guarded `@media` for existing tokens

**Files Affected**: `src/styles.css`

**What Will Be Done**: Immediately after the existing `:root` block (`src/styles.css:1-17`), add a `:root[data-theme="dark"] { … }` rule that redeclares the 13 color-related tokens (`--bg`, `--bg-2`, `--bg-alt`, `--surface`, `--line`, `--ink`, `--ink-2`, `--ink-3`, `--accent`, `--accent-2`, `--accent-soft`, `--shadow`, `--shadow-strong`) with the dark values from `design.md` Decision 3. Do NOT redeclare `--radius` or `--maxw`. Then add `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }` carrying the identical dark values, guarded by `:not([data-theme="light"])` so a manual light override wins over OS dark (satisfies `openspec/changes/dark-mode/specs/theme-tokens/spec.md` "System preference detection" + "Manual override precedence"). Add a `/* keep in sync with the [data-theme="dark"] block above/below */` comment linking the two blocks. This step is purely additive CSS — no selector or value in the existing light palette is changed — so light mode is pixel-identical and dark mode now works for every element that already reads from the 13 tokens. Hardcoded-color elements won't flip yet (handled in Step 2).

**Testing Strategy**: Load the page with OS in light mode → identical to before. In DevTools, emulate `prefers-color-scheme: dark` → every token-driven section (header text, body, `.section` backgrounds using `--bg-alt`/`--surface`, `.feature`/`.card`/`.benefit` if they already use tokens, footer text via `--ink-*`) flips to the dark palette. Add `data-theme="light"` to `<html>` while OS is dark → light palette wins (proves the guard). No JS yet, so manual `localStorage` override is not exercised here.

**Commit-atomicity check**: Additive CSS only; no signature/contract changes; full CSS parses and renders in both modes.

## Step 2: Tokenize all hardcoded colors; extend dark block with new semantic tokens

**Files Affected**: `src/styles.css`

**What Will Be Done**: Bring every hardcoded color in `src/styles.css` into the custom-property system per `design.md` Decision 5, in two tracks within this single commit:

1. **Structural → existing tokens.** Replace hardcoded `#fff`/`#ffffff` section/surface backgrounds and field backgrounds with `var(--surface)` (e.g. `.logos`, `.feature`, `.card`, `.benefit`, `.form`, `.field input`/`textarea`), and hardcoded light borders with `var(--line)` where they match. Light mode is unchanged because the tokens currently equal these values.
2. **Decorative → new semantic tokens.** Declare a small set of new tokens in `:root` with their current light values (so light mode is pixel-identical) and use them in the decorative selectors: `--header-bg` (`.site-header` translucent bg), `--hero-bg` / `--hero-grid` / `--hero-stat-bg` (`.hero`/`.hero-bg`/`.hero-stats`), `--ill-bg` / `--ill-mid` / `--ill-edge` / `--ill-border` composing the `.cube-*`, `.fridge*`, and `.card-img-1..4` gradients, `--glow` (the `rgba(25,182,230,*)` accent glows on `.brand-mark`, `.btn-primary`, `.snow`, `.cta::before`), `--on-accent` (`.btn-primary`/`.nav-cta` text), `--cta-bg` / `--cta-soft` (`.cta`), `--footer-ink` / `--footer-ink-2` / `--footer-border` (`.site-footer` — same value in both palettes since the footer is dark in both modes), and `--ok-bg` / `--ok-ink` (`.form-ok`). Then EXTEND the `:root[data-theme="dark"]` block AND the `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` block from Step 1 to override every new token with its dark value (footer/CTA/on-accent tokens may keep the same value if the block is dark-on-dark in both modes — override only where the dark palette differs). Add a comment above the new `:root` tokens explaining the semantic-token rationale. Do NOT use any `[data-theme="dark"] .selector` scoped override — all dark adaptation flows through token overrides, satisfying `openspec/changes/dark-mode/specs/theme-tokens/spec.md` "Full-page coverage" and "no hardcoded values" in both modes.

After this step, dark mode is visually complete for every section and the footer, driven entirely by tokens. Light mode remains pixel-identical to the pre-change site.

**Testing Strategy**: Light mode → visual diff against pre-Step-1 screenshot shows zero pixel changes (new tokens equal old hardcoded values). OS-dark / `data-theme="dark"` → hero, cube, fridge, card images, CTA, footer, form-ok, buttons, and glows all render with coherent dark values; no light-on-light or dark-on-dark remnants. Grep `src/styles.css` for literal hex/`rgba` outside of `:root`/dark blocks → none remain in selectors (only inside token declarations). Manually verify the footer does not double-invert (`openspec/changes/dark-mode/specs/theme-tokens/spec.md` "Footer in dark mode").

**Commit-atomicity check**: CSS-only; no markup or JS touched; the site renders coherently in both modes after this commit (no light decorative gradients on dark surfaces, because the new tokens' dark overrides ship in the same commit as the tokenization). The `:root` light values are unchanged, so light mode cannot regress.

## Step 3: Inline theme-init script in `<head>` (FOUC prevention)

**Files Affected**: `src/index.html`

**What Will Be Done**: Add a small synchronous `<script>` as the first child of `<head>`, before the `<link rel="stylesheet" href="styles.css">`. The script reads `localStorage.getItem("theme")` inside a `try/catch` (private-mode safe); if the value is `"dark"` or `"light"` it uses it, otherwise it falls back to `window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"`, then sets `document.documentElement.dataset.theme` to that value synchronously before the stylesheet applies. This satisfies `openspec/changes/dark-mode/specs/theme-toggle/spec.md` "Theme initialization before paint" and "data-theme attribute management". Use the key `"theme"` for `localStorage` (the single shared key the Step 4 toggle will write). Keep the script to ~6 lines, no dependencies, no framework. Do NOT move or alter the existing end-of-body `<script src="script.js">` at `src/index.html:320`.

**Testing Strategy**: With a stored `localStorage.theme="dark"` and OS in light mode, hard-reload → page renders dark on first paint with no light flash (record a slow-motion capture or throttle CPU to verify). Clear `localStorage`, set OS to dark, reload → dark on first paint, no flash. Clear `localStorage`, OS light → light on first paint. Disable JS entirely → OS-dark still renders dark via the `@media` block from Step 1/2 (proves graceful degradation). View page source → `data-theme` is present on `<html>` in the initial HTML response only if a server set it (it is not); the attribute appears during parsing before paint, which is sufficient.

**Commit-atomicity check**: Markup-only addition in `<head>`; no selector, token, or existing script is changed. The page loads and renders in both themes without flash. No contract break — the existing `script.js` and its end-of-body load order are untouched.

## Step 4: Theme toggle button + handler

**Files Affected**: `src/index.html`, `src/script.js`

**What Will Be Done**: Add a `<button class="theme-toggle" type="button" aria-label="Cambiar tema" aria-pressed="false">` inside `.container.nav` in the header (`src/index.html`), immediately before `<button class="nav-toggle" …>` so it sits with the desktop nav controls and remains reachable on mobile alongside the hamburger. The button's visible label/icon should convey the current→next state (e.g. a sun/moon glyph or "Modo claro/oscuro"); exact copy is an implementation detail, but the `aria-label` and `aria-pressed` must update to reflect the active theme (satisfies `openspec/changes/dark-mode/specs/theme-toggle/spec.md` "Toggle button in header" — visible in both modes, keyboard-activatable via native `<button>` Enter/Space, labeled). In `src/script.js`, add a handler that: reads the current `data-theme` on `<html>`, toggles it to the opposite (`"dark"`↔`"light"`), writes `localStorage.setItem("theme", value)` inside `try/catch`, updates the toggle's `aria-pressed` (true when dark) and `aria-label`, and wires the click listener on DOMContentLoaded (consistent with how the existing nav-toggle handler at `src/script.js:6` is wired). This satisfies "Manual override persistence" and "data-theme attribute management" in `openspec/changes/dark-mode/specs/theme-toggle/spec.md`. Add minimal CSS for `.theme-toggle` (sizing, alignment within `.container.nav`, `cursor: pointer`, inherits current color token) — append to `src/styles.css` is NOT in Files Affected because the button's base styling can inherit; if a few declarations are needed, include them in this step's `src/index.html`/`src/script.js` scope is insufficient, so also append a small `.theme-toggle` rule to `src/styles.css` here (add this file to Files Affected if used). Keep it token-driven so the button itself themes correctly.

**Files Affected (final)**: `src/index.html`, `src/script.js`, `src/styles.css` (only if a small `.theme-toggle` rule is appended).

**Testing Strategy**: Click the toggle in light mode → page switches to dark, `aria-pressed` becomes `true`, `aria-label` updates; reload → dark persists (proves `localStorage` write + Step 3 init read). Click again → back to light, persists on reload. With OS dark and no stored pref, toggle to light → `localStorage.theme="light"`, reload → light wins over OS dark (proves manual override precedence). Keyboard: Tab to the toggle, press Enter and separately Space → theme switches both times. Verify the toggle is visible and correctly positioned at the desktop and mobile breakpoints (no overlap with `.nav-toggle`). Run the full QA matrix from `design.md` Migration Plan.

**Commit-atomicity check**: The button markup and its handler ship together (the handler references the button; both in this commit). The `localStorage` key `"theme"` matches the key Step 3's init script reads — a string contract that is already in place after Step 3, so no break. `src/script.js`'s existing nav-toggle handler and IntersectionObserver are untouched. The site renders and the toggle is fully functional after this commit.

## Required Documentation

### Local files
- `src/index.html` (header markup `.site-header`/`.container.nav`/`.nav-toggle`; `<head>` for inline init script; end-of-body `<script src="script.js">` at line 320)
- `src/styles.css:1-17` (`:root` token block — the light palette, verbatim)
- `src/styles.css:40` (`.site-header`), `src/styles.css:138` (`.btn`), `src/styles.css:613` (`.site-footer`)
- `src/styles.css` hardcoded-color occurrences (lines 44, 71-72, 126, 155-158, 164, 173-175, 180-183, 244, 283-322, 305-322, 335, 362, 421, 427, 449, 467-472, 498, 516-527, 544, 573, 589, 596, 603-604, 615-636)
- `src/script.js:4-6` (`header`/`navToggle` handler), `src/script.js:12` (`IntersectionObserver`)
- `openspec/changes/dark-mode/proposal.md`
- `openspec/changes/dark-mode/.openspec.yaml` (approval record)

### Spec files
- `openspec/changes/dark-mode/specs/theme-tokens/spec.md`
- `openspec/changes/dark-mode/specs/theme-toggle/spec.md`

### External URLs
- None

## Implementation Context

**Stack**: Vanilla HTML5 + hand-written CSS (custom properties, no preprocessor/bundler/build step) + vanilla JS (no framework). Single static page, no server, no runtime dependencies. `src/styles.css` is served as-is (the only `package.json` in the repo is `.opencode/package.json`, an opencode plugin unrelated to the project).

**Conventions**:
- All theming flows through `:root` custom properties consumed via `var(--*)`; layout tokens (`--radius`, `--maxw`) are deliberately separate from color tokens and must not be redeclared by the dark block.
- `script.js` is loaded synchronously at end of `<body>` with no `defer`/`module`; new theme logic that must run before paint goes in a separate inline `<head>` script, not into `script.js`.
- Flat section class naming: `.hero`, `.logos`, `.section`, `.feature`, `.card`, `.benefit`, `.cta`, `.form`, `.site-footer`; header is `.site-header` > `.container.nav` (flex) > `.brand` / `.nav-links` / `.nav-cta` / `.nav-toggle`.
- UI copy is Spanish (`aria-label="Abrir menu"`, nav labels Inicio/Nosotros/Productos/Contacto) — new `aria-label`s must match (`aria-label="Cambiar tema"`).
- CSS comments are sparse (the existing `:root` block has none); the `/* keep in sync */` and semantic-token rationale comments introduced here are new conventions.

**Avoid**:
- Don't introduce a build step, CSS preprocessor, JS framework, or any dependency — the project is intentionally dependency-free.
- Don't modify `:root`'s existing light values — the spec defines `:root` as the light palette; dark mode is override-only.
- Don't move `script.js` or add `defer`/`module` to it (would change load order and risk the existing nav toggle/observer); FOUC prevention is a separate inline `<head>` script.
- Don't use `[data-theme="dark"] .selector` scoped overrides for decorative gradients — use semantic tokens overridden in the dark block (DRY + spec-compliant in both modes).
- Don't assume a server or SSR — all theme logic runs client-side; the `@media` block must keep working with JS disabled.
