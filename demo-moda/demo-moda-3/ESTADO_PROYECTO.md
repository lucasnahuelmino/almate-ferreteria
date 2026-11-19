# ALMATE · Demo Moda 3 (PICHONES) — Estado del proyecto

Última actualización: 2026-11-19 · Estado: **implementada y validada en
Chromium.**

## Objetivo

Nueva variante de la demo de moda, para **indumentaria infantil**, con
identidad propia ("crayón nube"), catálogo con talles por edad, guía de talles,
armador de conjuntos, variantes de color/talle y carrito de consulta por
WhatsApp. Se aloja en `demo-moda/demo-moda-3/` y no modifica `demo-moda/`,
`demo-moda/demo-moda-2/` ni los modelos A–D.

## Arquitectura y tecnologías

HTML, CSS y JavaScript nativo: sin frameworks, sin build, sin backend y sin
pagos. Reutiliza el motor/validación de la familia (config-core, catalog,
detail, cart, whatsapp) y suma:

- `config-core.moda.js`: añade la sección `guia` (columnas y filas).
- `engine.moda.js`: renderiza la sección `guia` (tabla de talles por edad).
- `products.moda.js`: catálogo infantil con talles por edad y bebé.
- `tools/make-art.js`: ilustraciones de demostración en estilo "crayón"
  (pollito, arcoíris, corazones, nubes y prendas infantiles).
- CSS reescrito con la identidad "crayón nube" (redondeado, sombras suaves).

## Decisiones

- **Identidad**: marca «Pichones», isotipo de pollito, paleta pastel suave y
  voz rioplatense cercana.
- **Talles por edad**: `2/4/6/8/10/12` y bebé `6m/12m/18m/24m`, coherentes con
  la guía de talles.
- **`guia`**: sección nueva y exclusiva de la demo infantil (tabla orientativa).
- **Conjuntos**: se reutiliza el armador de looks (`pilcha`) reframed como
  "Armá el conjunto", con slots Arriba / Abajo / Extra.
- **Reutilización**: se copió `demo-moda-2` como base y se reemplazó contenido,
  catálogo, arte, CSS y tests; el carrito, variantes y WhatsApp quedan intactos.
- **Paleta**: se mantienen las claves `ink/paper/sky/sun/pink/lime/lilac/grey`
  (para no romper el wiring de tonos), con valores nuevos.

## Funcionalidades implementadas

- Marquesina, header sticky con búsqueda y carrito, menú móvil accesible.
- Hero editorial infantil, categorías filtrables, **guía de talles por edad**,
  colección, catálogo con tarjetas y filtros (categoría, género nena/nene/
  unisex, talle, color, precio, ofertas, novedades).
- Ficha modal con color/talle y validación de combinaciones inexistentes.
- **Armá el conjunto** con selección en cadena (paso 1 de 3…).
- Carrito de consulta con persistencia y pedido por WhatsApp.

## Pruebas ejecutadas

- `node --check` en todos los `.js` (incluido `tools/make-art.js`): sin errores.
- `node demo-moda/demo-moda-3/tests/core.test.js`: **24/24** (normalización,
  guía de talles, WhatsApp, rutas, variantes, carrito, mensaje/enlace).
- `python demo-moda/demo-moda-3/tests/browser.test.py` (Playwright + Chromium):
  **112/112** (carga/SEO, responsive 360/390/768/1024/1440, búsqueda, orden,
  filtros, ficha y variantes, carrito, conjuntos, menú/hoja móvil, accesibilidad,
  movimiento reducido y seguridad anti-XSS).
- `node demo-moda/demo-moda-3/tools/sync-seo.js --check`: correcto.

## Errores detectados y corregidos

- **Desbordamiento horizontal en 360 px**: los ítems del armador (`pilcha__row`)
  no encogían por la propagación de `min-width: auto`; se añadió `min-width: 0`.
- **Movimiento reducido**: la cinta duplicada no se ocultaba; se añadió
  `.marquee__group[aria-hidden="true"] { display: none }`.
- **Filtros en escritorio**: el respaldo oscuro tapaba el contenido; se pasó el
  panel a desplegable inline en escritorio y hoja inferior solo en móvil.

## Pendientes

- Fotografías reales con licencia (las actuales son ilustraciones de demo).
- Datos reales del comercio: marca, contacto, WhatsApp, precios y horarios.
- Dominio real en `seo.url` para canonical e imagen social absoluta.
- Validación en Safari/Firefox, dispositivos físicos, lector de pantalla y
  Lighthouse/axe.

## Próximo paso

Reemplazar contenido e imágenes por los datos de una tienda real, re-ejecutar
`sync-seo.js --check` y las pruebas, y revisar en navegadores y dispositivos
reales antes de publicar.

---

**Desarrollado por ALMATE · Soluciones digitales.**
