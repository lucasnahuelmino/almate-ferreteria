# ALMATE · Demo Moda — Tienda de indumentaria

Plantilla estática e independiente para tiendas de ropa, boutiques y marcas de
indumentaria. Presenta una landing editorial con catálogo, categorías,
búsqueda, filtros, selección de color y talle, y un **carrito de consulta** que
se envía por WhatsApp.

**No es un ecommerce transaccional:** no procesa pagos, checkout, reservas ni
pedidos confirmados, y no tiene backend. El visitante explora prendas, elige
variantes, arma su selección y la envía como consulta por WhatsApp.

> **Demo:** todos los datos (marca «AMARA», textos, precios, contacto y
> horarios) y las imágenes son de **demostración**. Reemplazalos por datos
> reales y fotografías con licencia antes de publicar.

## Inicio rápido

Desde la raíz del repositorio, serví los archivos:

```powershell
python -m http.server 8000
```

Abrí `http://localhost:8000/demo-moda/`. También funciona con Live Server.
Todo es HTML, CSS y JavaScript nativo; no requiere instalación ni build.

## Estructura

```text
demo-moda/
  index.html                      estructura semántica + metadatos SEO estáticos
  css/
    variables.css                 tokens, reset y tipografía base
    layout.css                    header, secciones y footer
    components.css                botones, chips, tarjeta Cutout, carrito y modal
    responsive.css                ajustes por ancho de pantalla
  js/
    config.moda.js                identidad, contenido, secciones y SEO
    config-core.moda.js           normalización, validación y generación SEO
    products.moda.js              catálogo de demostración y modelo de variantes
    catalog.moda.js               tarjetas, búsqueda, filtros y orden
    product-detail.moda.js        ficha con color, talle y disponibilidad
    cart.moda.js                  estado, persistencia y drawer del carrito
    whatsapp.moda.js              mensaje y enlace wa.me
    engine.moda.js                orquestador y render de secciones
  assets/                         logo, hero, categorías, productos y lookbook
  tools/
    sync-seo.js                   sincroniza el <head> estático con config.moda.js
    make-placeholders.js          regenera los SVG de demostración
  tests/
    core.test.js                  pruebas del núcleo (Node, sin dependencias)
    browser.test.py               pruebas funcionales en Chromium
```

## Funcionalidades

- Franja de anuncio configurable y ocultable.
- Header minimalista con logo, navegación, búsqueda y carrito (sticky).
- Hero editorial asimétrico con fotografía protagonista.
- Categorías visuales que filtran el catálogo al seleccionarlas.
- Colección destacada con productos relacionados.
- Catálogo con **tarjetas Cutout** (esquinas recortadas, etiquetas y muestras de
  color), buscador, filtros por categoría, género, talle, color y precio, orden
  y contador de resultados.
- Ficha de producto en modal: color, talle, disponibilidad y cantidad, con
  validación de combinaciones inexistentes.
- Carrito de consulta con cantidades, subtotal/total y persistencia en
  `localStorage`. Dos prendas iguales con distinto color o talle son variantes
  distintas.
- Generación del mensaje de WhatsApp desde la configuración.
- Lookbook editorial, beneficios, «sobre la marca» y FAQ con acordeón accesible.
- SEO estático (title, description, Open Graph, Twitter y JSON-LD) sincronizado
  con la configuración.

## Personalizar la tienda

La guía completa está en [GUIA_PERSONALIZACION.md](GUIA_PERSONALIZACION.md).
En resumen:

1. Editá `js/config.moda.js` (identidad, contacto, textos y secciones).
2. Cargá los productos reales en `js/products.moda.js`.
3. Reemplazá las imágenes de `assets/` por fotografías propias (o generá los
   placeholders con `node demo-moda/tools/make-placeholders.js`).
4. Sincronizá el SEO: `node demo-moda/tools/sync-seo.js`.

## Imágenes

Las imágenes actuales son **SVG de demostración** generados con
`tools/make-placeholders.js` (figuras de trazo y etiquetas «reemplazar por
fotografía»). No son fotografías. Sustituilos por fotos propias con licencia;
las rutas están centralizadas en `config.moda.js` y `products.moda.js`. Si una
imagen falta, el motor muestra un placeholder neutro para no dejar íconos rotos.

## Reglas de contenido

- No se inventan teléfonos, dominios ni políticas comerciales: el contacto de
  la demo es de muestra y `seo.url` está vacío (sin canonical ni imagen social
  absoluta).
- Precios y disponibilidad de la demo son ejemplos; la disponibilidad es una
  indicación configurable, no stock numérico.
- El crédito de autoría es fijo y obligatorio:
  **Desarrollado por ALMATE · Soluciones digitales.**

## Pruebas

Desde la raíz del repositorio:

```powershell
node demo-moda/tests/core.test.js
python demo-moda/tests/browser.test.py
node demo-moda/tools/sync-seo.js --check
```

La prueba de navegador requiere Playwright para Python con Chromium. Las pruebas
automatizadas no sustituyen la comprobación en Safari/Firefox, dispositivos
físicos, lector de pantalla ni mediciones de Lighthouse.
