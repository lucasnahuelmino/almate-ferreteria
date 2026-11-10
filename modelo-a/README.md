# Modelo A · Industrial — FREN Ferreterías

Plantilla estática de presentación y contacto para comercios de barrio
(ferreterías, corralones, talleres). Es una de las cuatro variantes del
sistema **ALMATE**: HTML, CSS y JavaScript puros, sin frameworks, sin
build y sin dependencias de producción.

Este documento está pensado para alguien sin experiencia previa en
programación. Si en algún punto algo no se entiende, es un problema del
README, no tuyo.

---

## 1. Qué contiene la carpeta

```
modelo-a/
  index.html    → todo el contenido y la estructura de la página
  style.css     → todo el diseño visual (colores, tipografía, layout)
  script.js     → SITE_CONFIG + interactividad (menú, WhatsApp, lightbox, logo)
  catalog.js    → catálogo de productos y lista de consulta
  img/          → fotos y logo del sitio
  tests/        → pruebas de navegador (Chromium + Playwright)
  README.md     → este archivo
```

Los archivos están divididos a propósito: **contenido** (HTML) separado
de **diseño** (CSS) separado de **comportamiento** (JS). Si querés
cambiar un color, no vas a tocar el HTML. Si querés cambiar un texto,
no vas a tocar el CSS.

---

## 2. Cómo abrirlo

Doble click en `index.html` funciona directo en el navegador.

Si vas a editar seguido, la extensión **Live Server** de VS Code es más
cómoda (click derecho sobre `index.html` → *Open with Live Server*).

Para correr las pruebas, desde la raíz del repositorio:

```
python modelo-a/tests/browser.test.py
```

---

## 3. Guía rápida de personalización

Casi todo lo que hace único a un negocio vive en **un solo lugar**: el
objeto `SITE_CONFIG` al principio de `script.js`.

### Nombre, contacto, WhatsApp y redes

Editá `SITE_CONFIG` y el dato se actualiza solo en todos los lugares
donde aparece: header, footer, Ubicación, botones de WhatsApp. No hace
falta buscar el nombre a mano en ningún otro archivo.

```js
const SITE_CONFIG = {
  businessName: "Nombre del negocio",
  phone: "(011) 4250-2865",
  phoneHref: "tel:+541142502865",
  email: "info@negocio.com",
  emailHref: "mailto:info@negocio.com",
  address: "Calle 123, Ciudad",
  hours: "Lun. a Vie. 8:00 a 18:00 hs · Sáb. 8:00 a 13:00 hs",
  whatsapp: "541142502865",          // solo números, con código de país
  whatsappMessage: "Hola, quisiera realizar una consulta.",
  // ...
};
```

### Colores

Dos formas, misma idea:

- **Rápida**: cambiá los 8 valores de `SITE_CONFIG.colors` en
  `script.js`. Se aplican solos al cargar la página.
- **Directa**: cambiá las mismas 8 variables en el bloque `:root` de
  `style.css`.

La paleta por defecto es industrial **clara**: fondo acero frío
(`#F4F6F8`), superficie blanca, tinta azul acero (`#18232F`), acento
azul (`#163A5F`) y amarillo de seguridad (`#F2B544`) solo como detalle
decorativo — el amarillo no se usa nunca como texto porque no tiene
contraste suficiente sobre el fondo claro.

### Logo

`SITE_CONFIG.logo` acepta una ruta relativa a la carpeta (por ejemplo
`img/logo_local.png`) o una URL http(s). Se muestra igual en el header
y en el footer, con `object-fit: contain` para no deformarlo y
`SITE_CONFIG.logoAlt` como texto alternativo. Si la imagen falta o no
carga, cada ubicación vuelve a mostrar el nombre del negocio en texto;
una ruta insegura (con `..`, barra invertida o un esquema distinto de
http/https) se ignora.

### Catálogo y lista de consulta

El catálogo vive en `SITE_CONFIG.catalog.items` (en `script.js`) y lo
renderiza `catalog.js`. **Está vacío por defecto**: la plantilla no
inventa productos, precios ni disponibilidad.

```js
catalog: {
  items: [
    { name: "Martillo de uña", category: "Herramientas", sku: "MH-01",
      brand: "Acme", price: 4500, description: "Cabeza forjada." },
    { name: "Taladro 650W", category: "Eléctricas", price: null },
  ],
},
```

- `name` es obligatorio; el resto (category, sku, brand, description,
  image, imageAlt) es opcional.
- `price` es un número o `null`: sin precio informado se muestra
  **"Consultar precio"**, nunca un número.
- `availability` solo se muestra si el comercio lo informa.
- Los rubros del catálogo se derivan de los `category` de los
  artículos: no hay una lista de categorías aparte que mantener.

La sección de consulta permite agregar artículos, cambiar cantidades
(1 a 999), quitar y vaciar. La lista se guarda en `localStorage` del
mismo navegador y el botón de WhatsApp arma un mensaje con comercio,
artículos, códigos, cantidades y **solo los precios informados**.

### Textos, fotos y rubros

- Título y bajada del Hero: `SITE_CONFIG.mainTexts`.
- Resto de los textos, fotos y las tarjetas de rubros: directo en
  `index.html`. Las tarjetas de rubro **no muestran precios**: no hay
  precios publicados para esas categorías.
- Fotos: dentro de `img/`, preferentemente JPG o WebP de menos de
  ~300KB con un ancho real cercano al que se ve en pantalla.

### Testimonios

La sección existe comentada en `index.html` y está vacía: la plantilla
no incluye testimonios ficticios. Solo se pegan opiniones reales y
autorizadas por el cliente.

### Mapa

En la sección Ubicación, el `<iframe>` de Google Maps se reemplaza por
el "insertar mapa" de la dirección real.

---

## 4. SEO (metadatos para buscadores y redes)

Viven en el `<head>` de `index.html` y **no** se actualizan
automáticamente desde `SITE_CONFIG`: Google y Facebook no siempre
ejecutan JavaScript antes de leerlos. Hay que actualizar a mano:

- `<title>` y `<meta name="description">`
- Las etiquetas `og:*` y `twitter:*`
- El bloque `<script type="application/ld+json">` (nombre, teléfono,
  dirección y horario del negocio)

Reglas de la plantilla: **no se declara `canonical` ni `og:url` /
`og:image` hasta que el sitio tenga dominio propio**, y el JSON-LD solo
contiene datos que están en `SITE_CONFIG` (sin `priceRange`, `url`,
`image` ni `sameAs` inventados). Si el sitio se publica, agregar la
canonical con el dominio real.

---

## 5. Checklist para convertirla en la web de un cliente

1. Duplicar la carpeta `modelo-a/` con el nombre del cliente.
2. Completar `SITE_CONFIG` (datos reales del negocio, colores, logo).
3. Reemplazar las fotos de `img/` por fotos reales.
4. Reescribir los textos (Hero, Nosotros, rubros) con contenido real.
5. Cargar el catálogo real en `SITE_CONFIG.catalog.items` — o dejarlo
   vacío y mostrar el estado vacío.
6. Actualizar el mapa con la dirección real.
7. Actualizar los metadatos del `<head>` con el dominio real.
8. Probar en un celular real: menú, WhatsApp, galería, catálogo.
9. Revisar todos los links: WhatsApp, teléfono, email, redes, mapa.
10. Mantener el crédito **Desarrollado por ALMATE · Soluciones
    digitales** en el footer (es obligatorio).

---

## 6. Estado

- [x] Etapa 1 — Estructura HTML
- [x] Etapa 2 — Diseño CSS
- [x] Etapa 3 — Responsive
- [x] Etapa 4 — JavaScript (menú, WhatsApp, lightbox, header on-scroll)
- [x] Etapa 5 — Animaciones / microinteracciones
- [x] Etapa 6 — SEO (sin datos inventados)
- [x] Etapa 7 — Optimización de velocidad
- [x] Etapa 8 — Sistema de configuración (`SITE_CONFIG`)
- [x] Etapa 9 — Documentación
- [x] Rediseño visual (paleta industrial clara unificada)
- [x] Sistema de logo (header + footer, fallback a texto)
- [x] Catálogo + lista de consulta por WhatsApp
- [x] Pruebas de navegador (`tests/browser.test.py`)

Pendiente, según cada cliente: fotos reales y contenido definitivo de
cada sección.

---

Crédito obligatorio: **Desarrollado por ALMATE · Soluciones digitales**.
