# ALMATE · Demo Moda 2 — PIOLA

Plantilla comercial de indumentaria **juvenil, colorida y rioplatense**, pensada para
venderle a marcas que quieren una tienda con personalidad: catálogo con variantes de
talle y color, carrito de consulta y pedido por WhatsApp. **No es un ecommerce
transaccional** (sin pagos, checkout ni backend).

Convive con `demo-moda/` (editorial, sobria) sin tocarla. Ambas son independientes:
motores, estilos y configuración propios.

## Qué la hace distinta

- **Estética "sticker"**: contornos gruesos, sombras duras, colores planos, stickers
  rotados, cinta en movimiento y una paleta de 5 acentos (celeste, sol, chicle, limón, lila).
- **Tarjetas sticker** con fondo de color por producto (`tone`), etiqueta rotada y
  acción "Elegir talle +". La ficha cambia de imagen al elegir color.
- **Armá tu pilcha**: armador de looks (arriba / abajo / extra) con flechas, "¡Sorprendeme!"
  y total estimado. Al confirmar abre la ficha de cada prenda **en cadena** (paso 1 de 3…)
  para elegir color y talle; nada llega al pedido sin variante válida.
- Voz **cercana y argentina** (voseo, lunfardo liviano), 100 % editable en la configuración.
- Filtros reales (categoría, género, talle, color, precio, ofertas, novedades), hoja
  inferior en móvil y chips de filtros activos.
- HTML + CSS + JavaScript nativos. Cero dependencias en producción. Tipografías
  autoalojadas (OFL).

## Abrir

```bash
python -m http.server 8000   # desde la raíz del repo
# → http://localhost:8000/demo-moda-2/
```
(abrir `index.html` con doble clic también funciona).

## Estructura

```text
demo-moda-2/
├── index.html
├── css/        fonts · variables · layout · components · responsive
├── js/         config.moda.js (contenido) · config-core.moda.js (validación)
│               products.moda.js (catálogo) · catalog · product-detail
│               cart · whatsapp · pilcha · engine
├── assets/     fonts · products · categories · hero · lookbook · deco · logo
├── tools/      make-art.js (ilustraciones demo) · sync-seo.js
└── tests/      core.test.js (Node) · browser.test.py (Chromium)
```

## Pruebas

```bash
node demo-moda-2/tests/core.test.js
node demo-moda-2/tools/sync-seo.js --check
python demo-moda-2/tests/browser.test.py     # requiere Playwright + Chromium
```

## Importante antes de entregar a un cliente

1. Las imágenes son **ilustraciones de demostración** propias (`tools/make-art.js`), no
   fotografías. Reemplazalas por fotos con derechos verificados (ver la guía).
2. Marca, textos, precios, WhatsApp, Instagram, mail y horarios son **de ejemplo**.
   El WhatsApp `5491130000000` es de demostración: reemplazarlo.
3. Tras cambiar `seo.*` en la config: `node demo-moda-2/tools/sync-seo.js`.

Desarrollado por ALMATE · Soluciones digitales.
