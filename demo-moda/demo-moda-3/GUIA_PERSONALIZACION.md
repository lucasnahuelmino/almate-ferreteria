# ALMATE · Demo Moda 3 (PICHONES) — Guía de personalización

Cómo adaptar la plantilla a una tienda real. No hace falta tocar el motor: todo
el contenido vive en `js/config.moda.js` (identidad y secciones) y
`js/products.moda.js` (catálogo).

---

## 1. Identidad y marca

En `js/config.moda.js`, dentro de `brand`:

```js
brand: {
  name: "Pichones",              // nombre comercial
  wordmark: "pichones",          // texto del logo (si no hay imagen)
  tagline: "Ropa piola para pichones",
  description: "Ropa cómoda y con onda para los más chicos…",
  logo: "",                      // opcional: ruta a un logo en imagen
},
```

- `logo` vacío usa un isotipo (pollito) + wordmark tipográfico.
- Para usar una imagen, poné `logo: "assets/logo/logo.png"` y agregá el archivo.

## 2. Colores y tipografías

```js
theme: {
  ink: "#403a52",     // ciruela
  paper: "#fbf4e8",   // crema
  sky: "#8ecbf5",     // celeste nube
  sun: "#ffd166",     // sol / manteca
  pink: "#ff9eb5",    // chicle
  lime: "#b7e08a",    // lima
  lilac: "#c7b6f5",   // lila
  grey: "#6f6a80",    // gris cálido
},
fonts: {
  display: '"Bricolage Grotesque", …',
  body: '"DM Sans", …',
},
```

Los colores se validan como hexadecimales y el motor avisa en consola si algún
par queda bajo de contraste. Las fuentes están autoalojadas en `assets/fonts`
(licencia OFL); si cambiás de familia, agregá su `@font-face` en `css/fonts.css`.

## 3. Contacto y WhatsApp

```js
contact: {
  whatsapp: "5491130000000",   // número con código de país, sin + ni espacios
  instagram: "https://instagram.com/pichones.demo",
  email: "hola@pichones.demo",
  address: "Local de ejemplo · Buenos Aires",
  hours: "Lun a Sáb · 10 a 20 h (ejemplo)",
},
```

Sin `whatsapp` válido (8–15 dígitos), el botón de envío queda deshabilitado.

## 4. Franja superior y navegación

```js
announcement: { enabled: true, items: ["Mensaje 1", "Mensaje 2"], link: "" },
navigation: [
  { label: "Lo nuevo", filter: { new: true } },
  { label: "Nena", filter: { gender: "nena" } },
  { label: "Nene", filter: { gender: "nene" } },
  { label: "Accesorios", filter: { category: "accesorios" } },
  { label: "Ofertas", filter: { sale: true } },
  { label: "Armá el conjunto", anchor: "#pilcha" },
],
```

`filter` admite `gender`, `category`, `sale` o `new`; `anchor` apunta a un `id`.

## 5. Secciones

```js
sections: ["hero", "categories", "guia", "collection", "catalog", "pilcha", "lookbook", "benefits", "about", "faq"],
```

- **`guia`** (nueva, exclusiva de esta demo): tabla orientativa de talles por
  edad. Editá `columns` y `rows` (cada fila es `["Edad", "Talle"]`).
- **`pilcha`** es el armador de conjuntos: sus `slots` combinan categorías
  (`Arriba`, `Abajo`, `Extra`). Cambiá `title`, `subtitle`, `ctaLabel` y
  `randomLabel` a gusto.

## 6. Productos y variantes

En `js/products.moda.js`. El modelo es:

```js
{
  id: "remera-dinosaurio",     // único
  name: "Remera Dinosaurio",
  category: "remeras",         // ver CATEGORY_LABELS
  gender: "nene",              // nena | nene | unisex
  price: 14900,                // número, sin formato
  oldPrice: 0,                 // opcional: muestra "Oferta"
  description: "…",
  tags: ["new", "best-seller"],
  tone: "lilac",               // sky|sun|pink|lime|lilac|paper (fondo de tarjeta)
  colors: ["Crudo", "Celeste", "Verde"],
  sizes: ["2", "4", "6", "8", "10", "12"],   // KID
  unavailable: ["Celeste|2"],  // combinaciones "Color|Talle" que NO existen
}
```

- Talles: `KID = ["2","4","6","8","10","12"]`, `BABY = ["6m","12m","18m","24m"]`,
  accesorios `["Único"]`.
- `price` vacío muestra **"Consultar precio"**; `oldPrice` o el tag `sale`
  marcan oferta; `unavailable` lista las combinaciones inexistentes (sin stock
  numérico).
- Las imágenes por color se generan con `tools/make-art.js`
  (`assets/products/{id}-{color}.svg`).

## 7. Fotografías

Las imágenes son ilustraciones de demostración. Reemplazalas por fotos:
copiá tus archivos en `assets/`, actualizá las rutas en `config.moda.js` y
`products.moda.js`, y usá `alt` concretos. El motor muestra un placeholder
neutro si una imagen falta (no deja íconos rotos).

## 8. SEO

```js
seo: {
  title: "Pichones · Ropa piola para chicos",
  description: "…",
  url: "",   // dominio real con barra final; vacío = sin canonical ni imagen social
  image: "assets/hero/hero-main.svg",
  imageAlt: "…",
  locale: "es_AR",
},
```

Tras editar: `node demo-moda/demo-moda-3/tools/sync-seo.js` (y `--check`).

## 9. Reglas de contenido

- No inventar teléfonos, dominios, precios ni disponibilidad.
- No prometer envíos, cambios ni medios de pago no confirmados.
- El crédito **Desarrollado por ALMATE · Soluciones digitales** es fijo y
  obligatorio en el footer.
