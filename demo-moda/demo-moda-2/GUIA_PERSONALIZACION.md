# ALMATE · Demo Moda 2 (PIOLA) — Guía de personalización

Todo el contenido vive en dos archivos: `js/config.moda.js` (marca, textos, secciones)
y `js/products.moda.js` (catálogo). El motor no se toca.

## 1. Marca y contacto
```js
brand:   { name: "Piola", wordmark: "piola", tagline: "...", description: "...", logo: "" },
contact: { whatsapp: "54911...", instagram: "https://instagram.com/...", email: "", address: "", hours: "" },
```
- `logo` vacío usa el isotipo (`assets/logo/mark.svg`) + el wordmark. Con una ruta, usa tu imagen.
- `whatsapp`: solo dígitos con código de país (`54911…`). Sin número, el botón de envío
  queda deshabilitado (no se inventa un teléfono). Lo vacío no se muestra.
- Reemplazá también `assets/logo/favicon.svg`.

## 2. Colores y tipografías
```js
theme: { ink, paper, sky, sun, pink, lime, lilac, grey }   // hex de 6 dígitos
fonts: { display: "...", body: "..." }
```
Los 5 acentos se usan para fondos de tarjetas, stickers y categorías. La configuración
avisa por consola si algún par tinta/acento queda con poco contraste. Para cambiar de
fuente, agregá los `.woff2` en `assets/fonts/`, declará `@font-face` en `css/fonts.css`
y actualizá `fonts`.

## 3. Productos (`js/products.moda.js`)
Cada producto se declara con `make({...})`:
```js
make({
  id: "buzo-canguro", name: "Buzo Canguro", category: "buzos", gender: "unisex",
  price: 52900, oldPrice: 59900,                      // oldPrice opcional → marca oferta
  tone: "sun",                                        // fondo de la tarjeta (sky|sun|pink|lime|lilac|paper)
  tags: ["sale", "featured"],                         // new · best-seller · limited · sale · exclusive · featured
  colors: ["Gris", "Negro", "Lila"],                  // deben existir en PALETTE
  sizes: ["S", "M", "L", "XL"],                       // ["Único"] para accesorios
  unavailable: ["Lila|S", "Negro|XL"],                // "Color|Talle" sin disponibilidad
  description: "..."
})
```
- **Categorías**: agregá la etiqueta visible en `CATEGORY_LABELS`.
- **Colores nuevos**: sumalos a `PALETTE` (nombre → hex).
- **Fotos por color**: por defecto se busca `assets/products/<id>-<color>.<ext>` (en
  minúsculas y sin tildes). Para fotos reales, editá la línea de `images` en `make()`
  (o definí `images` a mano por color).
- La disponibilidad es **orientativa**; no hay stock numérico.
- El filtro Mujer/Hombre incluye también lo `unisex`.

## 4. Secciones y textos
`sections` define qué se ve y en qué orden: `hero, categories, collection, catalog,
pilcha, lookbook, benefits, about, faq`. Quitar una clave la oculta.

- **Cinta** (`announcement.items`): hasta 8 mensajes. No prometas envíos ni beneficios que el comercio no ofrezca.
- **Navegación**: `{ label, anchor }` lleva a una sección; `{ label, filter }` filtra (`gender`, `category`, `sale`, `new`).
- **Hero**: `highlight` resalta una palabra del título; `stickers` y `collage` son opcionales.
- **Categorías**: cada una con `tone`, imagen y `filter`.
- **La tanda** (`collection.productIds`): ids de los productos destacados.
- **Etiquetas** (`tags`): el texto visible de cada etiqueta.
- **Armá tu pilcha** (`pilcha.slots`): `{ label, categories[] }` por slot (hasta 4).
- **Lookbook, Cómo laburamos, Quiénes somos, FAQ**: listas de textos editables.
- Tono de voz: la demo usa voseo y lunfardo liviano. Ajustalo a cada marca.

## 5. Fotografía
`tools/make-art.js` genera ilustraciones **de demostración**. Antes de una versión
comercial reemplazalas por fotos propias o con licencia:
- Prendas: fondo transparente (PNG/WebP/SVG) funcionan mejor sobre los fondos de color; con
  fondo opaco, ajustá `.scard__media img` a `object-fit: cover`.
- Proporción 4:5 para productos y categorías; 4:5 / 3:2 para lookbook.
- Peso recomendado < 150 KB por imagen (WebP). Completá siempre el `alt`.
- No uses imágenes sin derechos verificados ni con marca de agua.

## 6. SEO
Editá `seo.*` en la config y ejecutá `node demo-moda-2/tools/sync-seo.js`
(`--check` verifica). Si completás `seo.url` con el dominio real se emiten canonical y
`og:url`. Sin URL no se inventa ninguno.

## 7. Chequeo final
- [ ] WhatsApp real y probado · [ ] Instagram/mail/dirección/horarios reales o vacíos
- [ ] Fotos y logo reales · [ ] Precios y talles reales · [ ] Textos legales/FAQ del comercio
- [ ] `sync-seo.js --check` · [ ] tests en verde · [ ] `demo: false` en la config
