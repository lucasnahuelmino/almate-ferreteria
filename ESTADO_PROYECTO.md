# ESTADO DEL PROYECTO — ALMATE · Familia de plantillas comerciales

Última actualización: 2026-11-08 · Estado: **auditoría integral completada; familia A/B/C/D rediseñada, unificada, mejorada en UX y validada; sin commit/push/deploy (todo local).**

## Objetivo
Familia de plantillas web comerciales ALMATE · Soluciones digitales: Modelo A (Industrial), Modelo B (Premium), Modelo C (Conversión) y Modelo D (Catálogo Comercial), reutilizables y comercializables con distintos clientes cambiando configuración y contenido.

## Estado actual
- **Modelo A** (`modelo-a/`): rediseñado y ampliado. Paleta industrial clara unificada, sistema de logo (header + footer con fallback a texto), SEO sin datos inventados, sección de catálogo + lista de consulta por WhatsApp (`catalog.js`), crédito ALMATE unificado. **50/50** comprobaciones de navegador.
- **Modelo B** (`modelo-b/`, antes `premium/`): estable, configurable, documentado; logo con fallback agregado. **21/21** núcleo + **75/75** navegador (incluye A).
- **Modelo C** (`modelo-c/`): independiente; logo con fallback agregado. **19/19** núcleo + **47/47** navegador.
- **Modelo D** (`modelo-d/`): independiente; logo configurable con fallback agregado. **9/9** núcleo + **45/45** navegador.
- Catálogos vacíos por defecto en A y D: no se inventan productos, precios ni disponibilidad.
- **UX (2026-11-08)**: los cuatro modelos pasaron una auditoría UX individual y recibieron mejoras de navegación, foco, tacto, movimiento reducido y feedback (ver "Fase 6").

## Tecnologías
HTML/CSS/JavaScript vanilla, sin build ni dependencias de producción. Herramientas opcionales de desarrollo: Node.js (sync-seo, pruebas del núcleo) y Python + Playwright/Chromium (pruebas de navegador).

## Estructura
```
README.md                                índice del repositorio
ESTADO_PROYECTO.md                       este archivo
docs/
  MODELOS.md                             comparación y elección de variante
  CATALOGO.md                            catálogo de D (referencia) y A (liviano)
  capturas/                              capturas del Modelo A rediseñado
img/logo_local.png                       logo compartido (500×500, PNG)
modelo-a/                                Modelo A · Industrial
  index.html  style.css  script.js  catalog.js  README.md
  img/ (incluye logo_local.png copiado)   tests/browser.test.py
modelo-b/                                Modelo B · Premium (antes premium/)
  index.html  premium.css  config.premium.js  config-core.js  engine.premium.js
  fonts/ (WOFF2 + licencias OFL)   tools/sync-seo.js   tests/   README.md
modelo-c/                                Modelo C · Conversión
  index.html  modelo-c.css  config.modelo-c.js  config-core.modelo-c.js
  engine.modelo-c.js  tools/sync-seo.js  tests/  README.md
modelo-d/                                Modelo D · Catálogo Comercial
  index.html  styles.css  favicon.svg
  config.modelo-d.js  config-core.modelo-d.js  engine.modelo-d.js
  tools/sync-seo.js  tests/  README.md
```

## Auditoría (local vs remoto)
- `git fetch origin` ejecutado; HEAD local = `origin/main` = `efcfca2`, 0 adelantados / 0 atrasados.
- Rama `main`, sin stash, sin ramas nuevas creadas. No se tocó config Git ni remotos.
- Working tree con la reorganización y mejoras **sin commitear** (todo queda local).
- Archivos raíz obsoletos eliminados al reorganizar: `index.html`, `script.js`, `style.css`, `README (4).md` (contenido migrado a `modelo-a/README.md`) y carpeta `premium/` → `modelo-b/`.

## Cambios realizados en esta etapa

### Fase 1 — Estructura
- `docs/` consolidado en la raíz (venía de `modelo-a/docs/`); `modelo-a/README (4).md` eliminado tras migrar lo útil a `modelo-a/README.md`.
- `premium/` renombrado a `modelo-b/` con las rutas corregidas en 7 archivos de B y en `modelo-b/tests/browser.test.py`.
- Test de portabilidad reescrito en Python (eliminaba `cp`/`sed` de shell).
- `img/logo_local.png` copiado a `modelo-a/img/` (A usa rutas `img/…`; B/C/D usan `../img/…`).
- `README.md` de raíz creado (hub).

### Fase 2 — Logo unificado (A/B/C/D)
- **A**: `SITE_CONFIG.logo/logoAlt`, `isValidLogoPath()`, `applyLogo()` en header y footer con fallback a texto; CSS `object-fit: contain`.
- **B**: logo en `config-core.js` (DEFAULTS + validación), `config.premium.js`, `applyBrand()` en `engine.premium.js`, CSS `.brand img`.
- **C**: header y footer en `engine.modelo-c.js` con `decoding="async"`; fallback `updateImageFailure` cubre `.brand-link, .footer__brand`; CSS `height` + `object-fit`.
- **D**: `config-core` (logo/logoAlt + warn), `config.modelo-d.js`, `fillBrand()` con fallback, CSS `.brand img` / `.footer__brand img`.
- Imagen idéntica en header y footer, alt configurable, fallback a texto si falta o no carga, rutas inseguras ignoradas.

### Fase 3 — Rediseño visual de A
- Paleta industrial **clara** en `:root` y sincronizada en `SITE_CONFIG.colors` (8 valores, incluye `highlight`): background `#F4F6F8`, surface `#FFFFFF`, text `#18232F`, textMuted `#5D6B78`, accent `#163A5F`, accentDark `#0F2A47`, highlight `#F2B544` (solo decorativo, nunca texto), border `#DCE3EA`.
- Sombras suavizadas, barrita amarilla en `section-label::before`, hover de testimonios en amarillo, comentarios de la plantilla original ("Brasa Urbana") limpiados.

### Fase 4 — Catálogo + lista de consulta en A
- Secciones `#catalogo` y `#consulta` en el HTML; nav de header y footer con "Catálogo".
- Motor propio `modelo-a/catalog.js` (no duplica D): normalización con avisos, búsqueda (nombre/marca/código/descripción), filtros por rubro derivados de los artículos, lista 1–999 con cantidades, `localStorage` clave `alma-consulta-a-v1`, WhatsApp con precio **solo si está informado**.
- Config en `SITE_CONFIG.catalog.items`, **vacía por defecto**; API `window.ALMATECatalog {load, render, reload, items, list, message, whatsappLink}`.
- CSS sección 14 (controles, grilla, tarjetas, lista de consulta).

### Fase 5 — SEO y consistencia de A
- `<head>` unificado: sin canonical/og:url/og:image/twitter:image (dominio ficticio eliminado), JSON-LD `HardwareStore` con datos reales de `SITE_CONFIG` (sin url/image/priceRange/sameAs), nombre unificado "FREN Ferreterías" (prefijo conservado en meta description), precios inventados ("Desde $…") retirados de las tarjetas de rubro, contacto/horarios reales, mapa a Andrés Baranda 1309, Quilmes.
- Crédito unificado a **Desarrollado por ALMATE · Soluciones digitales** (reemplaza "Built with ALMATE").

### Fase 6 — Mejoras de UX (A/B/C/D · 2026-11-08)
Auditoría UX individual por modelo (4 recorridos con hallazgos por archivo:línea) y correcciones sin tocar aserciones de tests:

- **Comunes a los cuatro**: `scroll-padding-top` para que el header fijo/sticky no tape los títulos al navegar por anclas; bloqueo real de scroll del fondo (patrón `position:fixed; top:-scrollY` con contador compartido, porque iOS ignora `overflow:hidden` en `<body>`); foco devuelto a la sección/elemento destino tras cerrar menú o lightbox; `inert` en `main`/`footer` mientras un panel modal está abierto; `touch-action: manipulation`, `::selection` con la paleta y `-webkit-tap-highlight-color`; `transition-delay: 0s !important` en `prefers-reduced-motion`; objetivos táctiles ≥44px; fuentes <14px subidas a ≥0.75rem en labels/estados.
- **A**: skip link + `<main id="main" tabindex="-1">`, `<noscript>` que fuerza `.reveal` visible, lightbox `role="dialog"` sin `src=""`, estados `role="status"` sr-only para resultados y lista, scrollspy con `aria-current`, menú con lock + Escape + cierre en resize, botón "✓ Agregado" transitorio, cantidades vacías que **no borran** el artículo (anuncian "cantidad no válida"), focus-restore tras re-render, verde WhatsApp `#1F7A43` (contraste AA) y `--color-border-strong: #66707A` para bordes de controles.
- **B**: lock de scroll con posición restaurada (menú + lightbox), `inert` en el resto de la página, clic en link del nav → cerrar y enfocar la sección destino, panel de menú scrolleable en landscape (`overflow-y` + safe-area), flotante de WhatsApp medido desde `#inicio` y también cerca del final de página, "+" persistente en la galería (sin hover), `aria-current` por scroll, `initReveal()` primero con `try/catch` por init, `#lb-img` sin `src=""` + `figcaption aria-live`, crédito sin `href` estilado como texto.
- **C**: lock de scroll en menú y lightbox, Escape/clic-fuera a nivel de `document` (antes solo dentro de `<header>`), foco a la sección tras navegar por ancla, **fix**: una imagen del lightbox fallida ya no elimina `#lightbox-image` del DOM, foco anillo claro sobre superficies oscuras, lightbox ≥44px en pantallas ≤420px, menú `100dvh`.
- **D**: contador del atajo de consulta visible en móvil (`font-size` heredado 0 → `0.75rem`), "✓ Agregado" al agregar, estado vacío con botón **"Limpiar búsqueda y filtros"**, rango de precio inválido ya no muestra además el mensaje "sin resultados", **"Limpiar búsqueda"** junto al campo, `aria-pressed` sincronizado en los rubros, cantidad actualiza resumen **sin rehacer la lista** (no roba el foco), quitar → foco al siguiente control, `scrollIntoView` respeta `prefers-reduced-motion`, diálogo de producto con scroll-lock y cierre solo al hacer clic **fuera** de su rectángulo, `.button:disabled` visible y `overflow-wrap` en títulos de producto.

### Documentación
- `README.md` raíz creado; `modelo-a/README.md` creado; `docs/MODELOS.md` actualizado (ubicaciones, fila de logo, SEO de A, ejecución); `docs/CATALOGO.md` ampliado con la sección "Catálogo del Modelo A"; capturas de `docs/capturas/` regeneradas el 2026-11-09 tras la etapa de UX con `python tools/capturas.py` (Playwright: full-page 1440 y 390 recorriendo la página antes de capturar para disparar los `.reveal` y las imágenes lazy, más secciones `#catalogo` con `SAMPLE_ITEMS` y `#consulta` con 3 artículos).

## Decisiones técnicas
- Estructura `modelo-a/` … `modelo-b/` … `modelo-c/` … `modelo-d/` (elección del usuario); tests y docs adaptados.
- B mantiene su propio motor: independencia total de A a costa de duplicar lógica; A y D comparten *patrón* de catálogo pero no código.
- SEO: HTML estático; el motor no reescribe metadatos (no sirve a rastreadores sin JS) y avisa si hay desincronización (B/C/D vía `sync-seo --check`).
- Logo: rutas validadas (relativas sin `..` ni `\`, o http(s)); si falta la imagen, el nombre queda en texto.
- Crédito "Desarrollado por ALMATE · Soluciones digitales" fijo (no configurable).
- No se inventan datos comerciales: catálogo vacío por defecto, "Consultar precio" sin precio, disponibilidad solo si se informa.

## Pruebas ejecutadas (resultados exactos, 2026-11-08)
| Prueba | Resultado |
|---|---|
| `node --check` (scripts JS editados: A, B, C, D) | **OK** (17/17 en la corrida base) |
| `python -m py_compile` (4 tests de navegador) | **4/4 OK** |
| `node modelo-b/tests/core.test.js` | **21/21** |
| `node modelo-c/tests/core.test.js` | **19/19** |
| `node modelo-d/tests/core.test.js` | **9/9** |
| `node modelo-b/tools/sync-seo.js --check` | **OK** |
| `node modelo-c/tools/sync-seo.js --check` | **OK** (avisos esperados de CTAs sin destino) |
| `node modelo-d/tools/sync-seo.js --check` | **OK** |
| `python modelo-a/tests/browser.test.py` | **50/50** |
| `python modelo-b/tests/browser.test.py` (A + B) | **75/75** |
| `python modelo-c/tests/browser.test.py` | **47/47** |
| `python modelo-d/tests/browser.test.py` | **45/45** |
| `git diff --check` | **exit 0** (solo avisos LF/CRLF de `core.autocrlf=true`) |

Corridas individuales por modelo + smoke manual de los nuevos comportamientos UX (Playwright): skip link, offset de anclas vs header, lock/restore de scroll, `inert`, focus tras cerrar, "✓ Agregado", `aria-pressed`, estados vacíos accionables y cierre del diálogo de D — todos OK, 0 errores JS.

Cobertura del test de A (50): carga y SEO estático · logo idéntico en header/footer, `object-fit: contain`, 500×500 sin deformar, fallback a texto y rutas inseguras · paleta clara · catálogo vacío por defecto sin datos inventados · catálogo con datos: búsqueda, rubros, precios ("Consultar precio"), disponibilidad, lista, cantidades, persistencia, WhatsApp con precio solo informado · inyección de HTML · responsive 320/390/768/1440.

## Bug real detectado y corregido por las pruebas
- `ALMATECatalog.reload()` ignoraba la lista de artículos pasada y volvía a la config vacía. Corregido en el **motor** (`reload(raw)`), no en el test.

## Errores pendientes / riesgos conocidos
- Dispositivos físicos (iOS/Android), Safari, Firefox, lectores de pantalla y Lighthouse/PageSpeed no se probaron (solo Chromium headless).
- El contenido principal de B/C/D se renderiza con JS; los metadatos sí se sirven estáticos (B/C/D requieren `sync-seo` tras cambiar la config).
- `img/logo_local.png` existe; **no existe `img/logo_local.jpg`** — verificar la extensión que se use al publicar.
- Fotos del repo con personas reales: confirmar derechos de uso antes de comercializar.
- Test de B algo flaky con red externa (fonts/Google Maps): si falla con timeout de `page.goto`, re-ejecutar.
- Los tests levantan un servidor HTTP local **mono-hilo**: en corridas encadenadas puede aparecer un `ERR_CONNECTION_REFUSED` puntual al cargar una imagen (se vio en A y D, 2026-11-08). Si un check de logo/imagen falla así, re-ejecutar el test individual: pasa limpio.
- Contraste del amarillo `#F2B544` sobre fondo claro: solo decorativo, nunca como texto.

## Próximo paso recomendado
Revisar en el navegador real (Chrome + Safari/iOS), correr Lighthouse y adaptar un primer cliente real de punta a punta con el checklist de `modelo-a/README.md` / `modelo-b/README.md`. Cuando esté listo, versionar el working tree en un commit local (hoy no hay ningún commit nuevo).
