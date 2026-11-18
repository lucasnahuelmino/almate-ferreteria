# ALMATE · Demo Moda — Estado del proyecto

Última actualización: 2026-11-17 · Estado: **implementada y validada en
Chromium; sin commit/push/deploy.**

## Objetivo

Nueva demo comercial independiente para tiendas de indumentaria, con identidad
editorial propia, catálogo de tarjetas Cutout, variantes de color/talle y
carrito de consulta por WhatsApp. Se aloja en `demo-moda/` y no modifica los
modelos A, B, C ni D.

## Arquitectura y tecnologías

HTML, CSS y JavaScript nativo: sin frameworks, sin build, sin backend y sin
pagos. La lógica se separa en módulos:

- `config-core.moda.js`: normalización/validación y generación SEO (puro, UMD).
- `products.moda.js`: catálogo de demostración y modelo de variantes (puro).
- `whatsapp.moda.js` y `cart.moda.js`: mensaje/estado del carrito (puros,
  testables; el drawer del carrito vive en `cart.moda.js` para navegador).
- `catalog.moda.js`, `product-detail.moda.js` y `engine.moda.js`: render e
  interacción (solo navegador).

## Decisiones

- **Ubicación `demo-moda/`**: aislada y con su propio `assets/`, siguiendo la
  convención de carpetas por modelo del repositorio, pero con estructura propia
  de una tienda de moda (css/ y js/ separados).
- **Imágenes**: el servicio de generación de imágenes no estuvo disponible
  (credencial inválida). En lugar de enlazar fotografías externas con derechos
  no verificados o dejar archivos rotos, se generan **SVG de demostración**
  locales con `tools/make-placeholders.js` (figuras de trazo + etiqueta
  «reemplazar por fotografía»). Son recursos reales y reemplazables; el cliente
  sustituye las rutas por fotos propias. El motor además tiene un fallback
  neutro para imágenes faltantes.
- **Contenido de demostración**: marca «ALMATE», textos, precios y contacto son
  de muestra (marcados en `config.moda.js`). No se inventan datos comerciales
  reales; `seo.url` está vacío (sin canonical ni imagen social absoluta).
- **Disponibilidad sin stock numérico**: las combinaciones inexistentes se
  listan en `unavailable` (formato `Color|Talle`); el resto se consideran
  disponibles. El motor valida la combinación antes de agregar al carrito.
- **Gris tipográfico**: el `#77736e` de referencia se oscureció levemente a
  `#6f6b66` para cumplir contraste AA en textos secundarios.
- **SEO estático autoritativo**: el `<head>` lo genera `tools/sync-seo.js` desde
  la configuración; el motor además aplica los metadatos en runtime de forma
  defensiva.

## Funcionalidades implementadas

- Franja de anuncio, header sticky con búsqueda y carrito, menú móvil con
  `aria-expanded`/Escape y fondo inerte.
- Hero editorial, categorías filtrables, colección con productos relacionados,
  lookbook asimétrico, beneficios, «sobre la marca» y FAQ con acordeón nativo.
- Catálogo con tarjetas Cutout, buscador, filtros (categoría, género, talle,
  color, precio), orden, contador y limpiar filtros.
- Ficha modal con selector de color (muestras), talle (deshabilitando
  combinaciones inexistentes), cantidad y validación antes de agregar.
- Carrito de consulta con cantidades, subtotal/total, persistencia en
  `localStorage` y mensaje por WhatsApp codificado vía `wa.me`.
- Aparición progresiva con `IntersectionObserver` y respeto a
  `prefers-reduced-motion`; foco visible y enlace «saltar al contenido».

## Pruebas ejecutadas

- `node --check` sobre todos los `.js`: sin errores de sintaxis.
- `node demo-moda/tests/core.test.js`: **13/13** (normalización, validación de
  WhatsApp/colores/rutas, precio, variantes, carrito y mensaje/enlace de
  WhatsApp).
- `python demo-moda/tests/browser.test.py` con Playwright 1.x + Chromium:
  **41/41** comprobaciones (carga/SEO sin errores, responsive en 360/390/768/
  1024/1440, búsqueda, orden, filtros, ficha y validación de variantes, carrito
  con cantidades/eliminar/persistencia, enlace de WhatsApp, navegación Sale,
  FAQ y comportamiento sin WhatsApp configurado).
- `node demo-moda/tools/sync-seo.js --check`: correcto.

## Errores detectados y corregidos

- El atributo `hidden` quedaba anulado por reglas `display` en `.cart-drawer` y
  `.header__cart-count`; se añadió `[hidden]{ display:none !important }` en
  `variables.css`.
- En el test inicial, el primer producto por precio era la bufanda (más barata
  que la remera) y el mensaje de WhatsApp está URL-codificado; se ajustaron las
  aserciones.

## Pendientes

- Fotografías reales con licencia (las actuales son placeholders de diseño).
- Datos reales del comercio: marca, contacto, WhatsApp, precios y horarios.
- Dominio real en `seo.url` para canonical e imagen social absoluta.
- Validación en Safari/Firefox, dispositivos físicos, lector de pantalla y
  Lighthouse/axe.
- No hay backend ni pagos (por diseño): el envío por WhatsApp abre la app; el
  cliente confirma disponibilidad y condiciones.

## Próximo paso

Reemplazar contenido e imágenes por los datos de una tienda real, re-ejecutar
`sync-seo.js --check` y las pruebas, y revisar el resultado en navegadores y
dispositivos reales antes de publicar.

---

**Desarrollado por ALMATE · Soluciones digitales.**
