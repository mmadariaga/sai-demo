# OpenSpec — Demo

Repo de la charla técnica interna sobre **OpenSpec** (spec-driven development para AI coding assistants), usando la landing de *Galdakao Frigoríficos* como codebase brownfield.

## Cómo mirar este repo

El contenido vive en dos presentaciones [Marp](https://marp.app/) dentro de `slides/`:

- `slides/openspec.md` — la charla (qué es OpenSpec, problema, filosofía, workflow, specs, alternativas…)
- `slides/demo.md` — la demo paso a paso (init + los 3 changes + custom schemas)

Para verlas en el navegador con recarga en vivo:

```bash
npx marp --server ./slides
```

Requiere Node.js. `@marp-team/marp-cli` está en las `devDependencies`, así que `npx` lo usará tras un `npm install` (o lo descargará al vuelo).

## La demo

Cada feature se desarrolló con el ciclo de OpenSpec (`/opsx:propose` → `/opsx:apply` → `/opsx:archive`), una rama por change y un commit por artefacto. Los cambios están publicados como Pull Requests:

🔗 https://github.com/mmadariaga/openspec-demo/pulls

1. **dark-mode** — `prefers-color-scheme` + override manual persistido
2. **contact-form** — validación, estados sending/success/error, accesibilidad
3. **cookies** — banner GDPR (con delta de requirements sobre `contact-form`)

## El sitio de la demo

Landing estática (HTML/CSS/JS vanilla, sin build) en `src/`. Para verla, abre `src/index.html` en el navegador.
