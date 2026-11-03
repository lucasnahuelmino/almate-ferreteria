# ALMATE · Modelo B — Premium

Variante visual premium de la plantilla comercial ALMATE. Independiente del Modelo A (raíz del repo).
Sitio estático: HTML + CSS + JavaScript sin dependencias, sin compilación.

## Archivos
```
premium/
  index.html          cáscara HTML. El bloque SEO del <head> es GENERADO (no editar a mano)
  premium.css         identidad visual (variables, composición, responsive)
  config.premium.js   ÚNICO archivo de contenido/identidad a editar por cliente
  config-core.js      valores por defecto, validación y seguridad (no editar)
  engine.premium.js   motor: render, tema, menú, lightbox, WhatsApp (no editar)
  fonts/              tipografías WOFF2 autoalojadas + fonts.css + licencias OFL
  tools/sync-seo.js   sincroniza el <head> estático con la config (Node, sin dependencias)
  tests/              core.test.js (Node) y browser.test.py (Chromium/Playwright)
```
Las imágenes se leen de `../img/` (`assetBase` en la config).

## Adaptar un cliente nuevo (checklist)
1. **`config.premium.js`** — es lo único que se edita para el contenido:
   - `brand` (nombre y descripción), `contact` (teléfono, WhatsApp **solo números con código de país**, email, dirección, horarios, `hoursSpec`, `map`, `social`).
   - `sections`: lista de secciones habilitadas, en orden. Quitar una la oculta del sitio y del menú.
   - Textos: `hero`, `about`, `services.items`, `gallery.items`. `price` en un rubro es opcional.
   - `testimonials.items`: solo opiniones **reales y autorizadas**. Vacío = la sección no aparece.
   - `colors` y `fonts` (identidad).
2. **Fotos**: copiarlas a `img/` y poner los nombres en la config. Recomendado: JPG/WebP ≤ ~300 KB. Cada imagen debe tener `alt` descriptivo.
3. **Abrir la página y la consola (F12)**: el motor avisa con `[ALMATE Premium] …` cualquier dato faltante o inválido (qué clave, por qué y qué hizo).
4. **Sincronizar el SEO estático** (obligatorio al cambiar nombre, descripción, dominio, hero o datos de contacto):
   ```
   node premium/tools/sync-seo.js           # reescribe el bloque SEO de premium/index.html
   node premium/tools/sync-seo.js --check   # solo verifica (código de salida 1 si está desactualizado)
   ```
5. Completar `seo.url` con la URL pública de esta página **terminada en "/"** (ej. `https://cliente.com/premium/`). Sin ella no se emiten `canonical`, `og:url` ni imagen social (requieren URL absoluta).
6. Si el dominio de producción es otro, revisar que `seo.image` exista y mida ~1200×630 para las vistas previas sociales.

Archivos que se tocan por cliente: `premium/config.premium.js`, `img/*`, y el resultado generado en `premium/index.html` (vía sync-seo). Nada más.

### Sin Node.js: procedimiento manual del SEO
Editar en `premium/index.html`, entre `ALMATE:SEO:START` y `ALMATE:SEO:END`: `<title>`, `meta description`, (`canonical`, `og:url`, `og:image`, `twitter:image` si hay dominio), `og:title`/`og:description`/`og:site_name`, `twitter:title`/`twitter:description`, el `href` del `preload` (= `hero.image`) y el JSON-LD (mismos datos que `contact`). El motor compara el `<head>` con la config y avisa en consola si no coinciden.

## SEO: qué garantiza y qué no
- Los buscadores y las redes sociales leen el **HTML estático**; `config.premium.js` no lo modifica en el servidor ni en el navegador. Por eso existe `sync-seo.js`.
- El **contenido de la página** se genera con JavaScript. Google lo ejecuta, pero otros rastreadores y algunas vistas previas pueden no hacerlo; no se promete lo contrario. Sin JS se ve un aviso `noscript`.
- Los datos estructurados (JSON-LD) se arman solo con datos presentes en la config. No se inventan valoraciones, precios ni datos de clientes.

## Seguridad
- Todo texto de la config se inserta **escapado** (nunca como HTML).
- URLs: redes, `creditUrl` y `externalUrl` solo `http(s)`; `embedUrl` solo `https`; teléfono `tel:`; email validado; WhatsApp solo dígitos.
- Imágenes: rutas relativas sin `..`, o `http(s)` absolutas; se rechazan `javascript:`, `data:`, `//host` y `\`.
- Colores (hex de 6 dígitos) y fuentes (lista de caracteres permitidos) validados: no pueden inyectar CSS.
- Todo enlace con `target="_blank"` lleva `rel="noopener noreferrer"`.
- Si cambia la config por fuera de este repo (no es el caso hoy), conviene agregar una política CSP en el servidor.

## Mapa y recursos externos
- `contact.map`: `show` (true/false), `query` (dirección), `embedUrl` (https, reemplaza a `query`), `externalUrl` (enlace "Cómo llegar"). Sin `query` ni `embedUrl` no se renderiza. Con `show:false` y `externalUrl` solo queda el enlace.
- Único tercero en producción: el iframe del mapa (Google Maps, sin costo) y solo si está activado.

## Tipografías (autoalojadas)
Por defecto: Cormorant Garamond (500 normal/cursiva) e Inter (400/500/600), subconjunto latino (cubre español), licencia **SIL OFL 1.1** (uso comercial libre; licencias en `fonts/`). `font-display: swap`. Sin Google Fonts → sin tercero ni bloqueo.
Cambiar de familia: 1) descargar los `.woff2` (latin) de una fuente OFL —p. ej. `npm pack @fontsource/<familia>` y copiar `files/<familia>-latin-<peso>-<estilo>.woff2` a `premium/fonts/`—, 2) agregar sus `@font-face` en `fonts/fonts.css`, 3) poner el nombre en `fonts.display`/`fonts.body` de la config. Para volver a Google Fonts: reemplazar el `<link rel="stylesheet" href="fonts/fonts.css">` por el `<link>` de Google Fonts (con `display=swap`).

## Accesibilidad (implementado)
Enlace "Saltar al contenido"; menú móvil con `aria-expanded`/`aria-label`, trampa de foco, Escape y retorno del foco; lightbox con `role="dialog"`, trampa de foco, Escape, flechas y retorno del foco; foco visible con contraste en fondos claros y oscuros; `prefers-reduced-motion`; `MediaQueryList` con compatibilidad `addListener` (Safari < 14). Contrastes de texto calculados ≥ 4,5:1 (paleta por defecto).

## Pruebas
```
node premium/tests/core.test.js          # 21 pruebas del núcleo (sin dependencias)
python3 premium/tests/browser.test.py    # 74 comprobaciones en Chromium (requiere playwright)
```

## Limitaciones conocidas
Contenido generado por JS (ver SEO); no hay formulario de contacto, buscador ni multi-idioma (tampoco existen en el Modelo A); la lógica de menú/lightbox/WhatsApp está duplicada respecto del Modelo A (decisión de independencia).
