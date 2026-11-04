# ALMATE · Modelo C — Conversión

Landing comercial modular para negocios de servicios, comercios especializados y profesionales. Su estructura busca llevar a una consulta, presupuesto o contacto con una propuesta clara y vías de acción configurables. Es una plantilla, no un sitio listo para publicar con datos reales.

## Características

- Header adaptable al scroll, navegación por anclas, menú móvil y CTA configurable.
- Hero con propuesta, CTA principal/secundario, imagen opcional y nota de confianza opcional.
- Secciones ordenables y activables: indicadores, servicios, diferenciales, galería, proceso, testimonios, FAQ, cobertura, CTA final y contacto.
- WhatsApp configurable con mensaje general o específico por acción; teléfono, email, redes y enlaces externos validados.
- Galería con categorías/textos opcionales y lightbox navegable con teclado.
- FAQ con `<details>/<summary>` nativos y navegación por teclado.
- Diseño responsive, foco visible, soporte para movimiento reducido, carga diferida y fallback de imágenes.
- SEO estático sincronizado desde la configuración. No genera datos estructurados.
- JavaScript/CSS propios, sin frameworks ni dependencias de producción.

## Arquitectura

```text
modelo-c/
  index.html                  cáscara HTML y metadatos estáticos
  modelo-c.css                identidad visual y responsive
  config.modelo-c.js          contenido, marca y opciones por cliente
  config-core.modelo-c.js     defaults, normalización, URLs, escape y SEO
  engine.modelo-c.js          renderizado y comportamiento de la interfaz
  tools/sync-seo.js            sincronizador del <head> estático (Node.js)
  tests/core.test.js           validaciones del núcleo (Node.js)
  tests/browser.test.py        pruebas funcionales con Chromium/Playwright
```

La tipografía usa fuentes del sistema para evitar descargas de terceros. La paleta predeterminada combina superficies claras, azul petróleo y terracota; puede cambiarse desde `colors` con valores hexadecimales. El crédito «Desarrollado por ALMATE · Soluciones digitales» es fijo.

## Adaptación por cliente

1. Editá **`config.modelo-c.js`**. Es el punto normal de adaptación; el motor y el núcleo no deberían requerir cambios.
2. Reemplazá el nombre, descripción, SEO, textos, paleta y navegación.
3. Configurá los canales reales en `contact`. WhatsApp debe tener entre 8 y 15 dígitos con código de país, sin `+` ni separadores (por ejemplo, `5491112345678`). El mensaje general se personaliza con `whatsappMessage`; una acción individual puede sobrescribirlo con `message`.
4. Ajustá `sections` con las claves permitidas, en el orden deseado. Quitar una clave oculta esa sección y sus enlaces de navegación. Una sección sin contenido también se omite.
5. Cargá solo información confirmada: los indicadores y testimonios están vacíos; los diferenciales requieren entre 3 y 6 elementos y el proceso entre 3 y 4 pasos. No publicar los textos de ejemplo de servicios/proceso sin revisarlos.
6. Elegí acciones CTA con `type`: `contact`, `whatsapp`, `phone`, `email` o `url` (solo HTTP/HTTPS). Sin un canal válido, el botón no se presenta; no se crean enlaces de apariencia activa que no funcionan.
7. Para cambiar etiquetas del menú, editá `navigation.labels`. Los títulos, descripciones, acciones y contenido de secciones se configuran en sus respectivos bloques.
8. Revisá la consola del navegador después de editar. El núcleo informa valores incompletos/descartados y utiliza defaults seguros cuando puede.

### Galería, servicios e imágenes

- Copiá las imágenes en `img/` (la ruta predeterminada se configura con `assetBase: "../img/"`) o configurá una URL HTTPS.
- Para publicar, optimizá fotografías como WebP/JPEG, dimensionadas al uso y con un peso recomendado menor a ~300 KB. Confirmá derechos de uso.
- Cada imagen de galería y cada imagen informativa debe tener un `alt` descriptivo; no agregues datos que la imagen no muestra. El núcleo avisa si falta.
- La galería admite `category`, `title` y `description`; son opcionales.
- Las imágenes bajo el pliegue usan `loading="lazy"` y `decoding="async"`. El hero es prioritario. Los atributos `width`/`height` evitan saltos de layout; en galería se pueden indicar en cada elemento.
- Si una imagen no carga, se retira de la interfaz sin dejar una miniatura rota; si todas las de galería fallan, se ocultan la sección y sus enlaces.

### Contacto y mapa

No hay backend ni formulario. No se simula el envío de datos. Para incorporar un formulario más adelante, conectar un proveedor real o un backend antes de mostrar confirmaciones de envío.

`coverage.mapUrl` acepta una URL HTTPS de inserción de Google Maps u OpenStreetMap; `mapsUrl` es el enlace externo opcional para abrir indicaciones. Los mapas no se cargan si no se configuran. Un mapa embebido contacta el proveedor cuando el navegador lo solicita.

### SEO

Actualizá `seo.title`, `seo.description`, `seo.url` e `seo.image` en la configuración y sincronizá el `<head>`:

```powershell
node modelo-c/tools/sync-seo.js
node modelo-c/tools/sync-seo.js --check
```

`seo.url` debe ser la URL absoluta HTTP/HTTPS de la página, terminada en `/`. Sin ella no se escribe canonical ni URL/imagen OG. `seo.image` debe existir, ser compartible públicamente y contar con autorización; para tarjetas sociales se recomienda una imagen horizontal de aproximadamente 1200×630.

Los metadatos Open Graph, Twitter, title, description, canonical y el preload se generan como HTML estático para que puedan leerlos rastreadores y previsualizadores que no ejecutan JavaScript. **El contenido de la página se renderiza con JavaScript**; otros rastreadores pueden no verlo. `sync-seo.js` no genera JSON-LD porque no se deben inventar datos estructurados. Sin JavaScript se muestra un aviso y no se presenta el contenido.

### Seguridad y accesibilidad

El contenido se escapa antes de insertarse en HTML; imágenes, colores, fuentes, enlaces web, teléfonos, emails y rutas se validan. Enlaces externos usan `noopener noreferrer`. El mapa embebido se limita a URLs HTTPS de proveedores admitidos. No se cargan scripts ni fuentes de terceros.

Se incluyen landmarks, un único h1, enlace para saltar al contenido, controles de menú/lightbox con estados ARIA, retorno/trampa de foco, controles de galería por teclado, acordeón nativo, foco visible y `prefers-reduced-motion`. La paleta predeterminada prioriza contraste alto; si se cambian colores o fuentes, revisar nuevamente contraste y legibilidad.

## Publicación

Serví `modelo-c/` desde un servidor estático con soporte para archivos HTML, CSS, JS e imágenes. Al copiar el modelo a otra ubicación, copiá también los recursos necesarios o ajustá `assetBase`. Antes de publicar:

1. Sustituí todos los textos de muestra por datos aprobados.
2. Verificá los canales, imágenes, permisos, enlaces, horario y cobertura.
3. Configurá el dominio y ejecutá `sync-seo.js`; luego usá `--check`.
4. Probá las URL públicas, las tarjetas sociales y la navegación en navegadores/dispositivos reales.

No se requiere compilación. Node.js solo se necesita para sincronizar/verificar SEO y correr las pruebas del núcleo; Playwright/Chromium son herramientas de prueba opcionales.

## Pruebas

```powershell
node modelo-c/tests/core.test.js
node modelo-c/tools/sync-seo.js --check
python modelo-c/tests/browser.test.py
```

La prueba de navegador requiere instalar Playwright para Python y Chromium (herramientas de desarrollo, no dependencias de producción):

```powershell
python -m pip install playwright
python -m playwright install chromium
```

La suite del navegador comprueba 390, 768, 1024 y 1440 px, renderizado y orden, menú, CTA/WhatsApp, lightbox, FAQ, enlaces externos, datos incompletos, URL/HTML inseguro, imagen faltante y metadatos estáticos. No reemplaza pruebas en iOS/Android, Safari/Firefox, lectores de pantalla ni mediciones Lighthouse.
