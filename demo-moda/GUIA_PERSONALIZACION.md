# ALMATE · Demo Moda — Guía de personalización

Cómo adaptar la plantilla a una tienda real. No hace falta tocar el motor: todo
el contenido vive en `js/config.moda.js` (identidad y secciones) y
`js/products.moda.js` (catálogo).

---

## 1. Identidad y marca

En `js/config.moda.js`, dentro de `brand`:

```js
brand: {
  name: "AMARA",                 // nombre comercial
  wordmark: "AMARA",             // texto del logo (si no hay imagen)
  tagline: "Indumentaria contemporánea",
  description: "Prendas y accesorios de líneas simples…",
  logo: "",                      // opcional: ruta a un logo en imagen
},
```

- `logo` vacío usa un wordmark tipográfico (serif).
- Para usar una imagen, poné `logo: "assets/logo/logo.png"` y agregá el archivo.

## 2. Colores y tipografías

```js
theme: {
  charcoal: "rgb(139, 91, 1)",   // fondo oscuro y texto principal
  offwhite: "rgb(253, 239, 197)",   // fondo claro
  stone: "#e2ded3",      // superficies secundarias
  sand: "#ffffff",       // acento arena
  grey: "#ffa12e",       // texto secundario (gris tipográfico)
  line: "#ffd268",       // bordes
},
fonts: {
  display: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
  body: '"Inter", -apple-system, "Segoe UI", Roboto, sans-serif',
},
```

Los colores se validan como hexadecimales. Si cambiás la paleta, revisá el
contraste (el motor avisa en consola si algún par queda por debajo de AA). No
se cargan fuentes de terceros; si querés una familia concreta, agregá tu
`@font-face` o un `<link>` y actualizá los stacks.

## 3. Contacto y WhatsApp

```js
contact: {
  whatsapp: "5491130000000",   // número con código de país, sin + ni espacios
  instagram: "https://instagram.com/tu.tienda",
  email: "hola@tutienda.com",
  address: "Dirección del local (opcional)",
  hours: "Lun a Sáb · 10 a 20 h (opcional)",
},
```

- `whatsapp` se normaliza a dígitos; si no es válido (8–15 dígitos), el botón
  de envío queda deshabilitado y se muestra el aviso «Configurá tu WhatsApp».
- Sin `instagram` o `email`, esos enlaces no aparecen en el footer.

## 4. Franja superior

```js
announcement: {
  enabled: true,
  text: "Nueva colección 2026 · Consultas por WhatsApp",
  link: "",   // opcional: URL a la que lleva
},
```

Poné `enabled: false` para ocultarla.

## 5. Navegación

```js
navigation: [
  { label: "Nueva colección", anchor: "#coleccion" },   // lleva a una sección
  { label: "Mujer", filter: { gender: "mujer" } },      // filtra el catálogo
  { label: "Accesorios", filter: { category: "accesorios" } },
  { label: "Sale", filter: { sale: true } },
],
```

`filter` admite `gender`, `category` o `sale`. `anchor` apunta a un `id` de
sección (`#coleccion`, `#catalogo`, etc.).

## 6. Hero, categorías, colección, lookbook, beneficios, about y FAQ

Cada bloque se configura en su clave (`hero`, `categories`, `collection`,
`lookbook`, `benefits`, `about`, `faq`). Los textos e imágenes son directos.
Para ocultar una sección, quitá su clave del array `sections` (el orden del
array es el orden en la página):

```js
sections: ["hero", "categories", "collection", "catalog", "lookbook", "benefits", "about", "faq"],
```

Las categorías visuales (`categories.items`) filtran el catálogo mediante
`filter` (por `gender` o `category`), igual que la navegación.

## 7. Productos y variantes

Los productos viven en `js/products.moda.js`. El modelo es:

```js
{
  id: "camisa-oversize",        // único
  name: "Camisa Oversize",
  category: "camisas",          // rubro (ver CATEGORY_LABELS)
  gender: "mujer",              // mujer | hombre | unisex
  price: 45900,                 // precio actual (número, sin formato)
  oldPrice: 52900,              // opcional: precio anterior (muestra "Sale")
  description: "…",
  image: "assets/products/p-camisa-oversize.svg",
  imageAlt: "Camisa oversize de algodón",
  tags: ["new", "featured"],    // new | featured | sale | exclusive | limited
  colors: [
    { name: "Negro", value: "#171717" },
    { name: "Crudo", value: "#E8DFD2" },
  ],
  sizes: ["XS", "S", "M", "L", "XL"],
  unavailable: ["Crudo|XL"],    // combinaciones "Color|Talle" que NO existen
}
```

- `price` vacío (`""` o `0`) muestra **«Consultar precio»**.
- `oldPrice` o el tag `sale` marcan la prenda como oferta.
- `unavailable` lista las combinaciones color/talle que no están disponibles; el
  resto se consideran disponibles. No hay stock numérico: la disponibilidad es
  una indicación configurable.
- Las categorías de filtro se derivan de los productos; sus nombres legibles
  están en `CATEGORY_LABELS`.

## 8. Fotografías

Las imágenes de la demo son SVGs de demostración. Reemplazalas por fotos:

1. Copiá tus fotos (JPEG/WebP optimizadas) dentro de `assets/`.
2. Actualizá las rutas en `config.moda.js` (hero, categorías, lookbook, about,
   colección) y en `products.moda.js` (imagen de cada producto).
3. Usá `alt` concretos y descriptivos.

Dimensiones sugeridas: hero ~1200×1600, categorías ~800×1000, productos
~800×1000 (relación 3:4), lookbook mixto. Mantené cada archivo por debajo de
~300 KB cuando sea posible.

## 9. SEO

En `config.moda.js`:

```js
seo: {
  title: "AMARA · Indumentaria contemporánea",
  description: "…",
  url: "",   // dominio real, ej. "https://www.tutienda.com/" (con barra final)
  image: "assets/hero/hero-main.svg",
  imageAlt: "…",
  locale: "es_AR",
},
```

Después de editar, sincronizá el `<head>` estático:

```powershell
node demo-moda/tools/sync-seo.js
node demo-moda/tools/sync-seo.js --check
```

`url` vacío = no se emiten canonical, `og:url` ni imagen social absoluta
(los buscadores y las redes leen el HTML, no ejecutan JavaScript).

## 10. Reglas de contenido

- No inventar teléfonos, dominios, precios ni disponibilidad: usar datos reales
  y autorizados.
- No prometer envíos, cambios ni medios de pago que el comercio no confirme.
- El crédito **Desarrollado por ALMATE · Soluciones digitales** es fijo y
  obligatorio en el footer.
