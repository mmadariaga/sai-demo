# Design — dark-mode

## Context

The landing page is a static, dependency-free site composed of three files: `src/index.html`, `src/styles.css`, `src/script.js`. Theming today is driven by 15 CSS custom properties declared once in `:root` (lines 1–17 of `src/styles.css`) and consumed by every section via `var(--*)`.

A codebase survey (delegated to a `budget-explorer` subagent and accepted as the source of truth per the Trust Rule) established the following facts, which anchor this design:

- `:root` currently declares: `--bg: #0b1220`, `--bg-2: #0f1729`, `--bg-alt: #f5f8fc`, `--surface: #ffffff`, `--line: #e4ebf3`, `--ink: #0b1220`, `--ink-2: #3a4658`, `--ink-3: #6b7787`, `--accent: #19b6e6`, `--accent-2: #0a8cb6`, `--accent-soft: #e0f5fc`, `--radius: 14px`, `--shadow: 0 10px 30px rgba(11,18,32,0.08)`, `--shadow-strong: 0 20px 50px rgba(11,18,32,0.18)`, `--maxw: 1180px`.
- No other selector re-declares any of these tokens. There is no existing `[data-theme]`, `prefers-color-scheme`, or theme JS anywhere in the codebase.
- The page therefore renders today as a **dark page chrome** (`--bg #0b1220`) hosting **light content surfaces** (`--surface #ffffff`, `--bg-alt #f5f8fc`) with **dark ink** (`--ink #0b1220`). Per the `theme-tokens` spec, `:root` is by definition the **light palette**; this design treats the current `:root` values as the light palette verbatim (user-confirmed direction A) and defines dark mode as an override that darkens the surfaces and lightens the ink while keeping `--bg` dark.
- `script.js` is loaded synchronously at the end of `<body>` (`src/index.html:320`) with no `defer`/`module`. It contains only the mobile-nav toggle and an IntersectionObserver. There is **no inline `<script>` in `<head>`**, so no theme logic runs before first paint today → FOUC risk for any JS-applied theme.
- The header markup is `<header class="site-header" id="inicio">` containing `<div class="container nav">` with children: `.brand`, `<nav class="nav-links">`, `.nav-cta` button, and `<button class="nav-toggle" id="navToggle">` (hamburger). The theme toggle will be inserted inside `.container.nav`.
- A large number of color values are hardcoded in `src/styles.css` (≈40 occurrences across `.site-header`, `.brand-mark`, `.btn-*`, `.hero`/`.hero-bg`/`.hero-stats`, the decorative `.cube-*`/`.fridge*` blocks, `.logos`, `.feature`, `.card*`, `.benefit`, `.cta`, `.form`/`.field`, `.form-ok`, and `.site-footer`). These bypass the custom-property system and must be addressed for the spec's full-page-coverage requirement.

## Goals / Non-Goals

**Goals**
- Define a `[data-theme="dark"]` selector that overrides every color-related `:root` token with a coherent dark palette (surfaces darkened, ink lightened, accents brightened, shadows deepened); layout tokens (`--radius`, `--maxw`) untouched.
- Add a `@media (prefers-color-scheme: dark)` block mirroring the dark palette, guarded so a manual `localStorage` override always wins.
- Add an accessible header toggle button that flips `data-theme` on `<html>`, persists the choice, and updates its accessible state.
- Apply the active theme before first paint (no FOUC), honoring `localStorage` first, then OS preference.
- Make every visual section inherit the active palette — no hardcoded color that breaks dark mode.

**Non-Goals**
- Rebuilding `:root` into a fully-light palette (direction B was rejected by the user). The current `:root` values stand as the light palette.
- Introducing a CSS preprocessor, build step, or any new dependency. (Confirmed by OQ2: no build tooling exists; `styles.css` is hand-written vanilla CSS served as-is.)
- Theming assets outside `src/`. (Confirmed by OQ1: no other HTML pages, favicon, manifest, og:image, or brand-colored assets exist — scope is exactly `src/index.html` + `src/styles.css` + `src/script.js`.)
- Supporting more than two themes (no "system" or "high-contrast" mode).
- Server-side theme rendering (static site, no server).

## Decisions

### Decision 1 — Inline theme-init `<script>` in `<head>` (FOUC prevention)

A small synchronous `<script>` is added to `<head>` of `src/index.html`, before the `<link rel="stylesheet">` for `styles.css`. It reads `localStorage.getItem("theme")`, falls back to `window.matchMedia("(prefers-color-scheme: dark)").matches`, and sets `document.documentElement.dataset.theme` (`"dark"` or `"light"`) before the stylesheet is applied.

**ADR/DDR criteria**
1. Hard to reverse — mildly. Removing it is mechanically trivial, but once users have a stored preference, removing the inline script would regress to OS-only behavior.
2. Surprising without context — yes. A future reader will see `script.js` loaded at end of body yet find an inline script in `<head>`; the "why" is not obvious without the FOUC rationale.
3. Real trade-off — yes. Alternatives considered:
   - **`@media (prefers-color-scheme: dark)` alone** — handles the OS case with no JS, but cannot honor a stored `localStorage` override before paint, so a returning dark-preferring user on an OS-light machine would flash light. Fails the "no flash on load with stored preference" scenario.
   - **Move `script.js` to `<head>` with `defer`** — `defer` executes after DOM parse but before `DOMContentLoaded`; the attribute would still be set after the initial HTML/CSS are parsed, risking a flash on slow connections.
   - **Server-side rendering of `data-theme`** — not available; the site is static with no server.

**Rationale**: only a blocking inline script in `<head>` can set the attribute before the first stylesheet/paint while also honoring `localStorage`. The script is kept tiny (≈6 lines) and dependency-free to minimize render-blocking cost.

### Decision 2 — Dark token overrides duplicated across `[data-theme="dark"]` and a guarded `@media` block

Two CSS rules carry the same dark token set:

```css
:root[data-theme="dark"] { /* dark token values */ }

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* identical dark token values */ }
}
```

The `:not([data-theme="light"])` guard ensures a manual light override wins over an OS dark preference (spec requirement: manual override takes precedence).

**ADR/DDR criteria**
1. Hard to reverse — no. Easy to refactor.
2. Surprising without context — yes. Identical token blocks in two places look like a copy-paste mistake unless the rationale is documented.
3. Real trade-off — yes. Alternatives considered:
   - **Invert the model** (`:root` = dark, `[data-theme="light"]` = light) — violates the `theme-tokens` spec, which defines `:root` as the light palette.
   - **CSS preprocessor / mixins** — no build tooling exists in this project (confirmed by OQ2: `src/styles.css` is hand-written vanilla CSS served as-is; the only `package.json` is `.opencode/package.json`, an opencode plugin unrelated to the project). Introducing a build step is a non-goal.
   - **JS-only theming (drop the `@media` block)** — violates the spec requirement that the `@media` block exist, and would leave no-JS users unable to follow their OS preference.

**Rationale**: keeps `:root` as the spec-defined light palette, needs no build tooling, and degrades gracefully (OS preference still works without JS). A `/* keep in sync with … */` comment links the two blocks.

### Decision 3 — Recommended dark palette values

The dark palette overrides only the color-related tokens; `--radius` and `--maxw` are not redeclared.

| Token | Light (`:root`) | Dark (override) | Rationale |
|-------|-----------------|-----------------|-----------|
| `--bg` | `#0b1220` | `#0b1220` | Already dark; keep page chrome stable across modes |
| `--bg-2` | `#0f1729` | `#0f1729` | Already dark; unchanged |
| `--bg-alt` | `#f5f8fc` | `#0f1729` | Was light alt bg → dark alt bg |
| `--surface` | `#ffffff` | `#121d33` | White cards → dark cards |
| `--line` | `#e4ebf3` | `#1f2a40` | Light hairline → dark hairline |
| `--ink` | `#0b1220` | `#e6edf5` | Dark text → light text |
| `--ink-2` | `#3a4658` | `#aeb9c7` | Muted dark → muted light |
| `--ink-3` | `#6b7787` | `#8a98a8` | Faint dark → faint light |
| `--accent` | `#19b6e6` | `#3bc7f5` | Brighten cyan for contrast on dark |
| `--accent-2` | `#0a8cb6` | `#1aa8d6` | Brighten accent-2 on dark |
| `--accent-soft` | `#e0f5fc` | `rgba(25,182,230,0.16)` | Light tint → translucent dark tint |
| `--shadow` | `0 10px 30px rgba(11,18,32,0.08)` | `0 10px 30px rgba(0,0,0,0.45)` | Deeper shadow on dark |
| `--shadow-strong` | `0 20px 50px rgba(11,18,32,0.18)` | `0 20px 50px rgba(0,0,0,0.55)` | Deeper strong shadow on dark |

These are the design's recommended values; the implementation step may fine-tune contrast against the actual surfaces, but the token set and the light/dark split are fixed by this decision.

### Decision 4 — Toggle is an accessible `<button>` with `aria-pressed`, placed in `.container.nav`

A `<button class="theme-toggle" type="button" aria-label="Cambiar tema" aria-pressed="false">` is inserted inside `.container.nav`, immediately before `.nav-toggle` (so it sits with the desktop nav controls and remains reachable on mobile). Clicking it toggles `data-theme` on `<html>`, writes `localStorage.setItem("theme", value)`, and updates `aria-pressed` and the `aria-label` to reflect the active theme. Enter/Space activation is native to `<button>`.

This does not meet all three ADR criteria strongly (it is a standard accessible pattern, not surprising, easily reversible), so it is documented briefly rather than as a full ADR. The non-obvious points to preserve: (a) use `<button>`, not `<a>` (this is an action, not navigation); (b) `aria-pressed` mirrors `data-theme==="dark"`; (c) insertion point is before `.nav-toggle` to coexist with the existing hamburger.

### Decision 5 — Hardcoded color remediation: all-token approach via new semantic tokens

For the spec's full-page-coverage requirement ("No section, component, or element SHALL hardcode color values that bypass the custom-property system"), every hardcoded color is brought into the custom-property system:

1. **Structural colors → existing tokens.** Section/element backgrounds, text colors, and borders that map cleanly to an existing token are replaced with `var(--*)` references (e.g. `.feature { background: #fff }` → `var(--surface)`, `.logos { background: #fff }` → `var(--surface)`, `.field input { background: #fff }` → `var(--surface)`). Both themes benefit at once; no new tokens.
2. **Decorative / multi-stop gradients & accent-on-accent fills → NEW semantic tokens.** A small set of new tokens is declared in `:root` with their current light values and used by the decorative selectors; the dark block (both `[data-theme="dark"]` and the mirrored `@media`) overrides them. Categories (the implementation enumerates exact tokens per category):
   - Header/translucent surfaces: `--header-bg` (translucent), hero stat bg.
   - Illustration gradients: the hero/cube/fridge/card-image gradients compose from a few `--ill-*` tokens (e.g. `--ill-bg`, `--ill-mid`, `--ill-edge`, `--ill-border`) so multi-stop gradients adapt without per-stop duplication.
   - Glows/shadows tints: `--glow` (the `rgba(25,182,230,*)` accent glows on `.brand-mark`, `.btn-primary`, `.snow`, `.cta::before`).
   - CTA block (already dark in light mode): `--cta-bg`, `--cta-soft` (the CTA is dark-on-dark in both modes, so these may be the same in both palettes — still tokenized for compliance).
   - Footer (already dark in light mode): `--footer-ink`, `--footer-ink-2`, `--footer-border` — fixed light-on-dark values, same in both palettes (footer is dark in both modes), tokenized so no selector hardcodes a color.
   - Status accents: `--ok-bg`, `--ok-ink` for `.form-ok`.

   Because every decorative value now reads from a token, the dark block overrides tokens once and the `@media` mirror overrides the same tokens — **no `[data-theme="dark"] .selector` scoped overrides and no duplicated scoped selectors across the media query.**

**ADR/DDR criteria**
1. Hard to reverse — no. Adding tokens is additive; `:root` light values equal the old hardcoded values, so light mode is pixel-identical.
2. Surprising without context — mildly. A future reader will see many `--ill-*` / `--footer-*` tokens and wonder why; the rationale (token-driven theming, no scoped-selector duplication, spec compliance) must be documented in a comment above the new `:root` tokens.
3. Real trade-off — yes. Alternatives considered:
   - **Full tokenization with one token per hardcoded value** (~25 tokens) — explosion of single-use tokens; poor vocabulary.
   - **Scoped `[data-theme="dark"] .selector` overrides for decorative gradients** (the original draft) — leaves hardcoded values in place (violates the "no hardcoded values" rule in light mode too) AND requires duplicating every scoped selector inside the `@media` block for the no-JS OS-dark case, doubling the CSS.
   - **All-token via few semantic tokens (chosen)** — a handful of reusable semantic tokens; DRY; fully spec-compliant; light mode unchanged.

**Rationale**: unifies theming under the token system (spec-compliant in both modes), avoids scoped-selector duplication across the `@media` block, and keeps the token vocabulary small by parameterizing multi-stop gradients with shared `--ill-*` tokens.

## Risks / Trade-offs

- [FOUC when JS is disabled] → `@media (prefers-color-scheme: dark)` covers the OS-preference case without JS; only the manual `localStorage` override requires JS. Acceptable degradation; document in README/comment.
- [Decorative gradients render wrongly in dark mode] → Mitigation: the new `--ill-*`/`--glow`/`--cta-*`/`--footer-*` tokens override in the dark block; manual visual QA of `.hero`/`.hero-bg`, `.cube-*`, `.fridge*`, `.card-img-*`, `.cta`, and `.site-footer` in both modes.
- [Dark token duplication drift] → Mitigation: `/* keep in sync with … */` comment linking the two blocks; both are small and stable.
- [Header layout shift on small screens when toggle is added] → Mitigation: insert toggle before `.nav-toggle` inside the existing flex `.container.nav`; test at the mobile breakpoint alongside the hamburger.
- [Footer already dark in light mode may double-invert] → Mitigation: verify `.site-footer` in dark mode uses the dark `--ink-2`/`--ink-3`/`--line` tokens for text and borders rather than its own hardcoded light-on-dark values; override only what conflicts.
- [`localStorage` throws in private-mode browsers] → Mitigation: wrap `localStorage` access in `try/catch`; fall back to OS preference.

## Migration Plan

Static site, no server, no data migration.

1. Add the dark token block and the guarded `@media (prefers-color-scheme: dark)` block to `src/styles.css` (Decision 2 + 3).
2. Tokenize hardcoded colors (structural → existing tokens; decorative → new `--ill-*`/`--glow`/`--cta-*`/`--footer-*`/`--ok-*` semantic tokens) and extend the dark block + `@media` mirror to override the new tokens (Decision 5).
3. Add the inline theme-init `<script>` to `<head>` of `src/index.html` (Decision 1).
4. Add the `<button class="theme-toggle">` to the header and the toggle handler in `src/script.js` (Decision 4).
5. Manual QA matrix: {light OS, dark OS} × {no stored pref, stored light, stored dark} × {desktop, mobile}; verify no FOUC and that every section + footer renders correctly.

**Rollback**: revert the commit. `:root` (the light palette) is never modified, so a full revert restores the exact prior render. The `localStorage.theme` key is additive and harmless if left behind.

## Open Questions

All open questions were resolved during design via `budget-explorer` subagents; none remain for the user.

- **OQ1 (resolved)**: No other HTML pages, favicon, `manifest.webmanifest`, `browserconfig.xml`, `theme-color` meta, `og:image`, brand-colored raster/SVG assets, or PDFs exist in the repo. "Full-page coverage" is bounded to `src/index.html` + `src/styles.css`. Incorporated into Non-Goals.
- **OQ2 (resolved)**: `src/styles.css` is hand-written vanilla CSS served as-is; there is no build step, bundler, or preprocessor (the only `package.json` is `.opencode/package.json`, an opencode plugin). The `<link rel="stylesheet">` in `index.html` points directly to `styles.css`. Decision 2's duplication rationale is confirmed.
- **OQ3 (resolved during research)**: No existing JS references `localStorage`, `data-theme`, or `prefers-color-scheme`. `script.js` contains only the mobile-nav toggle and an IntersectionObserver. Incorporated into Context.
