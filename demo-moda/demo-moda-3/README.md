# ALMATE · Demo Moda 3 — PICHONES

Plantilla comercial de **indumentaria infantil**, con identidad "crayón nube"
(formas redondeadas, sombras suaves, acentos pastel) y voz rioplatense cercana:
catálogo con variantes de talle y color, guía de talles por edad, armador de
conjuntos, carrito de consulta y pedido por WhatsApp. **No es un ecommerce
transaccional** (sin pagos, checkout ni backend).

Convive con `demo-moda/` (editorial) y `demo-moda/demo-moda-2/` (PIOLA, juvenil)
sin tocarlas. Las tres son independientes: motores, estilos y configuración
propios.

## Qué la hace distinta

- **Estética "crayón nube"**: bordes redondeados, sombras suaves (no duras),
  guirnaldas de corazones/estrellas/nubes, pollito como isotipo y acentos pastel.
- **Talles por edad**: talles `2 / 4 / 6 / 8 / 10 / 12` (años) y de bebé
  `6m / 12m / 18m / 24m`, con una sección nueva de **guía de talles**.
- **Armá el conjunto**: armador de looks (arriba / abajo / extra) con flechas,
  "¡Sorprendeme!" y total estimado. Al confirmar abre la ficha de cada prenda
  **en cadena** (paso 1 de 3…) para elegir color y talle; nada llega al pedido
  sin variante válida.
- Filtros reales (categoría, género nena/nene/unisex, talle, color, precio,
  ofertas, novedades), hoja inferior en móvil y chips de filtros activos.
- HTML + CSS + JavaScript nativos. Cero dependencias en producción. Tipografías
  autoalojadas (OFL).

## Abrir

```bash
python -m http.server 8000   # desde la raíz del repo
# → http://localhost:8000/demo-moda/demo-moda-3/
```
(abrir `index.html` con doble clic también funciona).

## Estructura

```text
demo-moda/demo-moda-3/
├── index.html
├── css/        fonts · variables · layout · components · responsive
├── js/         config.moda.js (contenido) · config-core.moda.js (validación)
│               products.moda.js (catálogo) · catalog · product-detail
│               cart · whatsapp · pilcha (conjuntos) · engine
├── assets/     fonts · products · categories · hero · lookbook · deco · logo
├── tools/      make-art.js (ilustraciones demo) · sync-seo.js
└── tests/      core.test.js (Node) · browser.test.py (Chromium)
```

## Pruebas

```bash
node demo-moda/demo-moda-3/tests/core.test.js
node demo-moda/demo-moda-3/tools/sync-seo.js --check
python demo-moda/demo-moda-3/tests/browser.test.py   # requiere Playwright + Chromium
```

## Importante antes de entregar a un cliente

1. Las imágenes son **ilustraciones de demostración** propias (`tools/make-art.js`),
   no fotografías. Reemplazalas por fotos con derechos verificados (ver la guía).
2. Marca, textos, precios, WhatsApp, Instagram, mail y horarios son **de ejemplo**.
   El WhatsApp `5491130000000` es de demostración: reemplazarlo.
3. Tras cambiar `seo.*` en la config: `node demo-moda/demo-moda-3/tools/sync-seo.js`.

Desarrollado por ALMATE · Soluciones digitales.
