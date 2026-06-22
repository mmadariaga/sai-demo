---
marp: true
theme: default
style: |
  section {
    font-size: 26px;
  }
  h1 {
    font-size: 44px;
  }
  h2 {
    font-size: 32px;
  }
  h3 {
    font-size: 28px;
  }
  code {
    font-size: 22px;
  }
  pre {
    font-size: 20px;
  }
---

# Demo

### Demo de OpenSpec

**Galdakao Frigoríficos**

---

## Objetivo de la demo

Evolucionar la landing estática de **Galdakao Frigoríficos** — fabricante ficticio de frío industrial en Bizkaia.

- HTML/CSS/JS **vanilla**, sin build ni tests
- Todo se ha **ejecutado y commiteado de antemano** paso a paso
- Objetivo: una **historia git reproducible** que navegar en directo, paso a paso

> Verificado: Node v24.16.0 · openspec 1.3.1 · sin `openspec/` aún

---

## Paso 0 — Init

```bash
openspec init --tools opencode --profile core
```

Revisar lo generado y commitearlo en `master`:

```bash
openspec list            # sanity check, debe responder sin error
git add -A
git commit -m "chore: scaffold OpenSpec (core profile, opencode)"
```

---

## Los 3 changes

1. **dark-mode**
2. **contact-form** — validación, sending/success/error, accesibilidad
3. **cookies** — banner GDPR

---

## Feature 1 · dark-mode

```bash
git checkout -b change/dark-mode
```

```bash
# opencode con GLM 5.2

/opsx:propose dark-mode

Añade modo oscuro a la landing. Respeta prefers-color-scheme del sistema y
permite un override manual con un botón en el header que persiste la
preferencia en localStorage. Sin frameworks: usa CSS custom properties y un
atributo data-theme en <html>. Debe aplicar a todas las secciones y al footer.
```

```bash
# bash / powershell + opencode con GLM 5.2

git add -A && git commit -m "spec(dark-mode): proposal + specs + design + tasks"
# /opsx:apply
git add -A && git commit -m "feat(dark-mode): implement"
# /opsx:archive
git add -A && git commit -m "chore(dark-mode): archive change"
```

---

## Feature 2 · contact-form

```bash
git checkout -b change/contact-form
```

```bash
# opencode con GLM 5.2

/opsx:propose contact-form

El formulario de contacto (src/index.html, sección #contacto) es un fake: el
onsubmit solo hace preventDefault y enseña un mensaje. Especifica el
comportamiento real: validación de requeridos (nombre, email, mensaje) y de
formato (email, teléfono opcional); estados sending/success/error con feedback
visual; accesibilidad (aria-invalid, aria-describedby, foco al primer error);
anti-spam con honeypot. Sin backend: simula el envío con un delay. Vanilla JS.
```

```bash
# bash / powershell + opencode con GLM 5.2

git add -A && git commit -m "spec(contact-form): proposal + specs + design + tasks"
# /opsx:apply
git add -A && git commit -m "feat(contact-form): implement"
# /opsx:archive
git add -A && git commit -m "chore(contact-form): archive change"
```

---

## Feature 3 · cookies  ·  el truco del delta

```bash
git checkout -b change/cookies
```

```bash
# opencode con GLM 5.2

/opsx:propose cookies

Añade un banner de consentimiento de cookies (GDPR): aceptar / rechazar,
persistencia en localStorage y re-mostrar cuando el consentimiento caduca.
IMPORTANTE: este change debe MODIFICAR el spec de contact-form para añadir el
requisito de que el formulario NO se envíe sin consentimiento previo (quiero
ver un delta de requirements sobre la spec existente). Vanilla JS, accesible.
```

```bash
# bash / powershell + opencode con GLM 5.2

git add -A && git commit -m "spec(cookies): banner + delta sobre contact-form"
# /opsx:apply
git add -A && git commit -m "feat(cookies): implement"
# /opsx:archive
git add -A && git commit -m "chore(cookies): archive change"
```

---

## Custom schemas

Defines **tu propio workflow y gates** en `openspec/schemas/<name>/schema.yaml`.

Tienes un ejemplo en 🔗 `github.com/mmadariaga/shared-ai`:

Artefactos:
```text
proposal → specs → design → tasks → implementation
                                           ↓
security ← performance ← accessibility ← review
```

- **Libertad total**: usa los comandos, skills y gates de serie… o crea los tuyos, 100% adaptados a tus necesidades y preferencias
- Da igual cuáles uses: OpenSpec gestiona tus artefactos (`review.md`, `security.md`…) **exactamente igual** que los de serie (`proposal.md`, `tasks.md`…)
- Tú defines el proceso; OpenSpec lo orquesta

---

# FIN

### ¿Alguna pregunta?
