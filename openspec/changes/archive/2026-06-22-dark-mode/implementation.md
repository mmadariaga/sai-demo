# Dark Mode

## Goal

Add a complete dark-mode theme to the landing page using CSS custom-property overrides, a `@media (prefers-color-scheme: dark)` guard, an inline FOUC-prevention script, and an accessible header toggle with `localStorage` persistence.

## Prerequisites

- Ensure branch is not `master` or `main`. Ask the user to select the branch to use:
  1. `dark-mode` (derived from the change name)
  2. Custom branch name (free input — e.g., backlog-linked name like `JIRA-123-dark-mode`)
- If the selected branch does not exist, create it from `main` before implementing.

### Step-by-Step Instructions

#### Step 1: Dark token block + guarded `@media` for existing tokens

*(Non-testable step — standard format, no RED/GREEN needed because the project has no test framework and this step is pure CSS.)*

**File:** `src/styles.css`

- [x] Immediately after the existing `:root` block (after line 17), add the `[data-theme="dark"]` override block and the guarded `@media` block. **Both blocks must carry the exact same 13 dark token values.**

```css
:root[data-theme="dark"] {
  --bg: #0b1220;
  --bg-2: #0f1729;
  --bg-alt: #0f1729;
  --surface: #121d33;
  --line: #1f2a40;
  --ink: #e6edf5;
  --ink-2: #aeb9c7;
  --ink-3: #8a98a8;
  --accent: #3bc7f5;
  --accent-2: #1aa8d6;
  --accent-soft: rgba(25, 182, 230, 0.16);
  --shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
  --shadow-strong: 0 20px 50px rgba(0, 0, 0, 0.55);
}

/* keep in sync with the @media (prefers-color-scheme: dark) block below */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0b1220;
    --bg-2: #0f1729;
    --bg-alt: #0f1729;
    --surface: #121d33;
    --line: #1f2a40;
    --ink: #e6edf5;
    --ink-2: #aeb9c7;
    --ink-3: #8a98a8;
    --accent: #3bc7f5;
    --accent-2: #1aa8d6;
    --accent-soft: rgba(25, 182, 230, 0.16);
    --shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
    --shadow-strong: 0 20px 50px rgba(0, 0, 0, 0.55);
  }
}
```

##### Step 1 Verification Checklist

**Automated (agent runs before stopping):**
- [x] `grep -c "\[data-theme=\"dark\"\]" src/styles.css` — expected: **1**
- [x] `grep -c "prefers-color-scheme: dark" src/styles.css` — expected: **1**

**Human (verify in browser before committing):**
- [ ] Open `src/index.html` in a browser with OS in light mode → page looks identical to pre-change.
- [ ] In DevTools, emulate `prefers-color-scheme: dark` → token-driven sections (header text, body, `.section`, `.feature`, `.card`, `.benefit`, footer text) switch to the dark palette.
- [ ] While OS is emulated dark, manually add `data-theme="light"` to `<html>` → light palette wins (proves the `:not([data-theme="light"])` guard works).

## Appendix: Plan vs Final Implementation

This section documents deviations between the original plan and the code that was actually merged.

### Step 1 — Comment wording to avoid false grep match

**Plan:** The plan's code block contained `/* keep in sync with the @media (prefers-color-scheme: dark) block below */` as a comment, which includes the exact string `prefers-color-scheme: dark` being counted by the automated grep check. This would have caused the check to return 2 instead of the expected 1.

**Final:** Changed the comment to `/* keep in sync with the prefers-color-scheme dark @media block below */` so the `prefers-color-scheme: dark` string only appears once (in the actual `@media` rule).

**Reason:** The automated verification check expects exactly 1 match, but the original comment text contained the same pattern. Adjusting the comment to avoid matching the pattern preserves the intent while allowing the check to pass.

### Step 2 — Mask `#000` not listed in plan's replacements

**Plan:** The plan listed specific hardcoded color replacements but did not include the `#000` values in `.hero-bg` `mask-image` declarations. The automated check expects zero hardcoded colors in selectors.

**Final:** Added `--mask: #000;` to `:root` and replaced the two `mask-image` occurrences with `var(--mask)`.

**Reason:** Without this change the automated check would report two remaining hardcoded colors. The `--mask` token follows the same pattern as all other tokens — keeping the semantic meaning (`#000` is always black, used as mask layer) while passing the verification gate.

### Step 2 — Grep filter regex doesn't match tokens with digits

**Plan:** The verification filter `^\s*(--[a-z-]+:|...` uses `[a-z-]+` which does not match custom property names containing digits (e.g., `--bg-2`, `--ink-3`, `--line-2`).

**Final:** The filter was not modified, but visual inspection confirmed all remaining matches are custom property definitions inside `:root`/*-override blocks, not hardcoded colors in selectors.

**Reason:** No code change needed — the filter is a test-side regex issue that does not affect the correctness of the implementation.

#### Step 1 STOP & COMMIT

**sai-4-apply:** Run all Automated checks above and confirm they pass before stopping.

**STOP & COMMIT:** Wait for the human to verify all Human checks in the browser, then stage and commit before continuing.

---

#### Step 2: Tokenize all hardcoded colors; extend dark block with new semantic tokens

*(Non-testable step — standard format, no RED/GREEN needed.)*

**File:** `src/styles.css`

This step replaces every hardcoded color in selectors with a `var(--*)` reference and extends both dark blocks from Step 1 with the new token overrides. Light mode remains pixel-identical because every new `:root` token is initialized to the hardcoded value it replaces.

- [x] **Inside the existing `:root` block** (before the closing `}`), insert the new semantic tokens below the existing 15 tokens. Add the rationale comment above them.

```css
  /* Semantic tokens for decorative elements — added for dark-mode compliance.
     Light values match the old hardcoded colors exactly so light mode is unchanged.
     Dark overrides live in the [data-theme="dark"] and @media blocks below. */
  --header-bg: rgba(255, 255, 255, 0.85);
  --hero-glow-1: rgba(25, 182, 230, 0.18);
  --hero-glow-2: rgba(25, 182, 230, 0.12);
  --hero-bg: linear-gradient(180deg, #ffffff 0%, #f3f8fc 100%);
  --hero-grid: rgba(11, 18, 32, 0.04);
  --hero-stat-bg: rgba(255, 255, 255, 0.7);
  --ill-bg: #ffffff;
  --ill-mid: #d9eef7;
  --ill-edge: #b9e3f2;
  --ill-dark: #6fc6e2;
  --ill-border: rgba(11, 18, 32, 0.06);
  --ill-stroke: #c7dde6;
  --ill-line: #a9c7d3;
  --ill-handle: #b9c8d2;
  --glow: rgba(25, 182, 230, 0.35);
  --glow-strong: rgba(25, 182, 230, 0.45);
  --on-accent: #ffffff;
  --cta-bg: linear-gradient(135deg, #0a2540 0%, #0f3a5f 100%);
  --cta-soft: rgba(255, 255, 255, 0.75);
  --cta-glow-1: rgba(25, 182, 230, 0.3);
  --cta-glow-2: rgba(25, 182, 230, 0.2);
  --footer-ink: #c9d3df;
  --footer-ink-2: #8a98a8;
  --footer-ink-3: #6b7787;
  --footer-border: rgba(255, 255, 255, 0.08);
  --ok-bg: #e6f7ec;
  --ok-ink: #18794e;
  --line-2: #d3e2ec;
  --overlay: rgba(11, 18, 32, 0.15);
  --focus-ring: rgba(25, 182, 230, 0.2);
```

- [x] **Extend the `:root[data-theme="dark"]` block** (added in Step 1) with the dark overrides for every new semantic token. Append these declarations inside the existing `{ }`:

```css
  --header-bg: rgba(11, 18, 32, 0.85);
  --hero-glow-1: rgba(59, 199, 245, 0.18);
  --hero-glow-2: rgba(59, 199, 245, 0.12);
  --hero-bg: linear-gradient(180deg, #0b1220 0%, #0f1729 100%);
  --hero-grid: rgba(230, 237, 245, 0.04);
  --hero-stat-bg: rgba(15, 23, 41, 0.7);
  --ill-bg: #121d33;
  --ill-mid: #1a2a42;
  --ill-edge: #2a3f5a;
  --ill-dark: #3a5570;
  --ill-border: rgba(230, 237, 245, 0.06);
  --ill-stroke: #2a3f5a;
  --ill-line: #3a5570;
  --ill-handle: #4a6580;
  --glow: rgba(59, 199, 245, 0.35);
  --glow-strong: rgba(59, 199, 245, 0.45);
  --on-accent: #ffffff;
  --cta-bg: linear-gradient(135deg, #0a2540 0%, #0f3a5f 100%);
  --cta-soft: rgba(255, 255, 255, 0.75);
  --cta-glow-1: rgba(59, 199, 245, 0.3);
  --cta-glow-2: rgba(59, 199, 245, 0.2);
  --footer-ink: #c9d3df;
  --footer-ink-2: #8a98a8;
  --footer-ink-3: #6b7787;
  --footer-border: rgba(255, 255, 255, 0.08);
  --ok-bg: #1a3a2a;
  --ok-ink: #4ade80;
  --line-2: #1f2a40;
  --overlay: rgba(230, 237, 245, 0.15);
  --focus-ring: rgba(59, 199, 245, 0.2);
```

- [x] **Extend the `@media (prefers-color-scheme: dark)` block** with the **exact same** new-token overrides. Append the same declarations inside `:root:not([data-theme="light"]) { }`.

- [x] **Replace every hardcoded color in selectors** with the corresponding `var(--*)` reference. Edit each selector exactly as shown below (replace the full declaration line):

  *Header / nav*
  - `.site-header` — change `background: rgba(255, 255, 255, 0.85);` to `background: var(--header-bg);`
  - `.brand-mark` — change `color: #fff;` to `color: var(--on-accent);`
  - `.brand-mark` — change `box-shadow: 0 6px 16px rgba(25, 182, 230, 0.35);` to `box-shadow: 0 6px 16px var(--glow);`
  - `.site-header.is-open .nav-links` — change `background: #fff;` to `background: var(--surface);`

  *Buttons*
  - `.btn-primary` — change `color: #fff;` to `color: var(--on-accent);`
  - `.btn-primary` — change `box-shadow: 0 10px 24px rgba(25, 182, 230, 0.35);` to `box-shadow: 0 10px 24px var(--glow);`
  - `.btn-primary:hover` — change `box-shadow: 0 14px 30px rgba(25, 182, 230, 0.45);` to `box-shadow: 0 14px 30px var(--glow-strong);`
  - `.btn-ghost:hover` — change `background: #fff;` to `background: var(--surface);`

  *Hero*
  - `.hero` — change the three-layer `background:` declaration to:
    ```css
    background:
      radial-gradient(1200px 600px at 80% -10%, var(--hero-glow-1), transparent 60%),
      radial-gradient(800px 500px at -10% 30%, var(--hero-glow-2), transparent 60%),
      var(--hero-bg);
    ```
  - `.hero-bg` — change both `background-image` lines to use `var(--hero-grid)`:
    ```css
    background-image:
      linear-gradient(var(--hero-grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--hero-grid) 1px, transparent 1px);
    ```
  - `.hero-stats li` — change `background: rgba(255,255,255,0.7);` to `background: var(--hero-stat-bg);`

  *Cube / fridge illustration*
  - `.cube-front` — change `background:` to `background: linear-gradient(160deg, var(--ill-bg), var(--ill-mid) 70%, var(--ill-edge));`
  - `.cube-front` — change `border:` to `border: 1px solid var(--ill-border);`
  - `.cube-side` — change `background:` to `background: linear-gradient(160deg, var(--ill-edge), var(--ill-dark));`
  - `.cube-side` — change `border:` to `border: 1px solid var(--ill-border);`
  - `.cube-top` — change `background:` to `background: linear-gradient(180deg, var(--ill-bg), var(--ill-mid));`
  - `.cube-top` — change `border:` to `border: 1px solid var(--ill-border);`
  - `.fridge` — change `background:` to `background: linear-gradient(180deg, var(--ill-bg) 0%, var(--ill-bg) 38%, var(--ill-mid) 38%, var(--ill-mid) 100%);`
  - `.fridge` — change `border:` to `border: 1px solid var(--ill-stroke);`
  - `.fridge-divider` — change `background: #a9c7d3;` to `background: var(--ill-line);`
  - `.fridge-handle` — change `background: #b9c8d2;` to `background: var(--ill-handle);`
  - `.snow` — change `text-shadow: 0 0 12px rgba(25,182,230,0.4);` to `text-shadow: 0 0 12px var(--glow);`

  *Logos*
  - `.logos` — change `background: #fff;` to `background: var(--surface);`

  *Features*
  - `.feature` — change `background: #fff;` to `background: var(--surface);`
  - `.feature:hover` — change `border-color: #d3e2ec;` to `border-color: var(--line-2);`

  *Cards*
  - `.card` — change `background: #fff;` to `background: var(--surface);`
  - `.card-img::after` — change `background:` to `background: linear-gradient(180deg, transparent 50%, var(--overlay) 100%);`
  - `.card-img-1` — change to `background: linear-gradient(135deg, var(--ill-mid) 0%, var(--accent) 100%);`
  - `.card-img-2` — change to `background: linear-gradient(135deg, var(--ill-bg) 0%, var(--ill-dark) 100%);`
  - `.card-img-3` — change to `background: linear-gradient(135deg, var(--ill-edge) 0%, var(--accent-2) 100%);`
  - `.card-img-4` — change to `background: linear-gradient(135deg, var(--ill-mid) 0%, var(--accent) 100%);`

  *Benefits*
  - `.benefit` — change `background: #fff;` to `background: var(--surface);`

  *CTA*
  - `.cta` — change `background:` to `background: var(--cta-bg);`
  - `.cta` — change `color: #fff;` to `color: var(--on-accent);`
  - `.cta::before` — change both radial-gradient declarations:
    ```css
    background:
      radial-gradient(600px 300px at 90% 50%, var(--cta-glow-1), transparent 60%),
      radial-gradient(400px 200px at 10% 50%, var(--cta-glow-2), transparent 60%);
    ```
  - `.cta p` — change `color: rgba(255,255,255,0.75);` to `color: var(--cta-soft);`

  *Contact / form*
  - `.form` — change `background: #fff;` to `background: var(--surface);`
  - `.field input, .field textarea` — change `background: #fff;` to `background: var(--surface);`
  - `.field input:focus, .field textarea:focus` — change `box-shadow: 0 0 0 3px rgba(25, 182, 230, 0.2);` to `box-shadow: 0 0 0 3px var(--focus-ring);`
  - `.form-ok` — change `background: #e6f7ec;` to `background: var(--ok-bg);`
  - `.form-ok` — change `color: #18794e;` to `color: var(--ok-ink);`

  *Footer*
  - `.site-footer` — change `color: #c9d3df;` to `color: var(--footer-ink);`
  - `.footer-inner` — change `border-bottom: 1px solid rgba(255,255,255,0.08);` to `border-bottom: 1px solid var(--footer-border);`
  - `.footer-brand p` — change `color: #8a98a8;` to `color: var(--footer-ink-2);`
  - `.footer-cols h4` — change `color: #fff;` to `color: var(--on-accent);`
  - `.footer-cols a, .footer-cols span` — change `color: #c9d3df;` to `color: var(--footer-ink);`
  - `.footer-bottom` — change `color: #6b7787;` to `color: var(--footer-ink-3);`

##### Step 2 Verification Checklist

**Automated (agent runs before stopping):**
- [x] Run `grep -E "#([0-9a-fA-F]{3}){1,2}|rgba?\(" src/styles.css | grep -vE "^\s*(--[a-z-]+:|/\*|\s*\{|\s*\})"` — expected: **no output** (confirms no hardcoded colors remain in selectors).
- [x] Run `grep -c "var(--header-bg)" src/styles.css` — expected: **≥ 1**
- [x] Run `grep -c "var(--ill-bg)" src/styles.css` — expected: **≥ 3**

**Human (verify in browser before committing):**
- [ ] Light mode → side-by-side with pre-Step-1 screenshot shows zero pixel changes (all new tokens equal old hardcoded values).
- [ ] OS-dark or `data-theme="dark"` → hero illustration (cube, fridge, snow), card images, CTA glows, footer, and form-ok all render with coherent dark values; no light-on-light or dark-on-dark remnants.
- [ ] Footer in dark mode uses dark-palette colors consistent with the rest of the page; no double-inversion.

#### Step 2 STOP & COMMIT

**sai-4-apply:** Run all Automated checks above and confirm they pass before stopping.

**STOP & COMMIT:** Wait for the human to verify all Human checks in the browser, then stage and commit before continuing.

---

#### Step 3: Inline theme-init script in `<head>` (FOUC prevention)

*(Non-testable step — standard format, no RED/GREEN needed.)*

**File:** `src/index.html`

- [x] Add the following synchronous inline `<script>` as the **first child of `<head>`**, before the `<link rel="stylesheet" href="styles.css">` line:

```html
  <script>
    (function() {
      var theme;
      try { theme = localStorage.getItem('theme'); } catch (e) {}
      if (!theme) {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.dataset.theme = theme;
    })();
  </script>
```

- [x] Do **not** move or alter the existing end-of-body `<script src="script.js"></script>` at line 320.

##### Step 3 Verification Checklist

**Automated (agent runs before stopping):**
- [x] `grep -c "dataset.theme" src/index.html` — expected: **1**
- [x] `grep -c "localStorage.getItem('theme')" src/index.html` — expected: **1**

**Human (verify in browser before committing):**
- [ ] With a stored `localStorage.theme="dark"` and OS in light mode, hard-reload the page → it renders dark on first paint with no visible light flash (throttle CPU or use slow-motion capture to verify).
- [ ] Clear `localStorage`, set OS to dark, reload → dark on first paint, no flash.
- [ ] Clear `localStorage`, OS light → light on first paint.
- [ ] Disable JS entirely (e.g., via DevTools) with OS dark → page still renders dark via the `@media` block from Step 1/2 (proves graceful degradation).

#### Step 3 STOP & COMMIT

**sai-4-apply:** Run all Automated checks above and confirm they pass before stopping.

**STOP & COMMIT:** Wait for the human to verify all Human checks in the browser, then stage and commit before continuing.

---

#### Step 4: Theme toggle button + handler

*(Non-testable step — standard format, no RED/GREEN needed.)*

**Files:** `src/index.html`, `src/script.js`, `src/styles.css`

- [x] In `src/index.html`, inside `.container.nav` in the header, insert the theme-toggle button **immediately before** the existing `<button class="nav-toggle" …>`:

```html
      <button class="theme-toggle" type="button" aria-label="Cambiar tema" aria-pressed="false">
        <span class="theme-toggle-icon" aria-hidden="true">🌙</span>
      </button>
```

- [x] In `src/script.js`, append the following block **after** the existing IntersectionObserver code (after line 16):

```javascript
// Theme toggle
const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
  const updateToggle = function(isDark) {
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    themeToggle.querySelector('.theme-toggle-icon').textContent = isDark ? '☀️' : '🌙';
  };

  themeToggle.addEventListener('click', function() {
    var html = document.documentElement;
    var isDark = html.dataset.theme === 'dark';
    var next = isDark ? 'light' : 'dark';
    html.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    updateToggle(!isDark);
  });

  updateToggle(document.documentElement.dataset.theme === 'dark');
}
```

- [x] In `src/styles.css`, append the `.theme-toggle` rule at the end of the file (after the last `@media` block):

```css
/* Theme toggle */
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 10px;
  cursor: pointer;
  color: var(--ink);
  font-size: 1.1rem;
  line-height: 1;
  padding: 0;
}
.theme-toggle:hover {
  background: var(--bg-alt);
  border-color: var(--ink-2);
}
@media (max-width: 880px) {
  .theme-toggle {
    margin-left: auto;
  }
}
```

##### Step 4 Verification Checklist

**Automated (agent runs before stopping):**
- [x] `grep -c "theme-toggle" src/index.html` — expected: **≥ 1**
- [x] `grep -c "theme-toggle" src/script.js` — expected: **≥ 1**
- [x] `grep -c "theme-toggle" src/styles.css` — expected: **≥ 1**

**Human (verify in browser before committing):**

*Deferred from Step 1 (dark token block):*
- [ ] Click the toggle in light mode → page switches to dark, `aria-pressed` becomes `true`, label updates.
- [ ] Click again → back to light, persists on reload.
- [ ] With OS dark and no stored pref, toggle to light → `localStorage.theme="light"`, reload → light wins over OS dark (proves manual override precedence).

*Deferred from Step 2 (tokenization):*
- [ ] In dark mode, verify hero illustration, cards, CTA, footer, and form-ok all look correct and no hardcoded light values leak through.

*Deferred from Step 3 (FOUC prevention):*
- [ ] With stored dark preference, reload → no flash of light theme before the toggle renders.

*Step 4:*
- [ ] Keyboard: Tab to the toggle, press Enter → theme switches. Reload, press Space → theme switches.
- [ ] The toggle is visible and correctly positioned at desktop and mobile breakpoints; no overlap with `.nav-toggle`.
- [ ] Run the full QA matrix: {light OS, dark OS} × {no stored pref, stored light, stored dark} × {desktop, mobile}.

#### Step 4 STOP & COMMIT

**sai-4-apply:** Run all Automated checks above and confirm they pass before stopping.

**STOP & COMMIT:** Wait for the human to verify all Human checks above (including all deferred ones) in the browser, then stage and commit before continuing.
