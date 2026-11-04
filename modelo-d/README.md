# ALMATE · Modelo D — Catálogo Comercial

Plantilla estática e independiente para comercios que ofrecen productos y reciben consultas. El catálogo permite explorar, buscar y filtrar artículos, ver sus fichas y preparar una lista para compartir por WhatsApp.

**No es un ecommerce:** no procesa pagos, compras, reservas ni pedidos confirmados, y no incluye backend.

## Inicio rápido

Desde la raíz del repositorio, serví los archivos con un servidor local:

```powershell
python -m http.server 8000
```

Abrí `http://localhost:8000/modelo-d/`. También se puede usar Live Server. La plantilla usa HTML, CSS y JavaScript nativos; no necesita instalación ni compilación.

## Archivos

- `index.html`: estructura semántica y metadatos SEO estáticos.
- `styles.css`: identidad visual, componentes y diseño responsive.
- `config.modelo-d.js`: contenido y opciones que adapta el comercio.
- `config-core.modelo-d.js`: valores predeterminados, normalización, validación y generación SEO.
- `engine.modelo-d.js`: renderizado, navegación, catálogo, fichas y lista de consulta.
- `tools/sync-seo.js`: sincroniza la configuración SEO con el HTML estático.
- `tests/`: pruebas del núcleo y de los flujos en Chromium.

El motor y la configuración son propios de D. No modifican ni comparten ejecución con A, B o C. La tipografía usa los stacks Inter y Manrope con alternativas del sistema; no se cargan fuentes de terceros.

## Adaptar la plantilla

Editá `config.modelo-d.js`; no hace falta cambiar el motor para actualizar el contenido:

1. Reemplazá nombre, sigla, textos, contacto, redes, dirección, horarios y SEO por datos confirmados por el comercio.
2. Revisá `sections` para activar, ocultar y ordenar las secciones. El orden de esa lista es el orden en la página.
3. Ajustá colores y stacks tipográficos si corresponde. El crédito «Desarrollado por ALMATE · Soluciones digitales» es fijo y obligatorio.
4. Cargá categorías y productos siguiendo [CATALOGO.md](../docs/CATALOGO.md).
5. Configurá el WhatsApp como número internacional con código de país. Se aceptan separadores habituales; el sistema los elimina al formar el enlace. Si el número no es válido, no muestra el botón de envío.
6. Confirmá que las imágenes sean propias o tengan licencia adecuada; optimizalas y describilas con textos `alt` concretos.
7. Sincronizá los metadatos con `node modelo-d/tools/sync-seo.js` y verificá con `node modelo-d/tools/sync-seo.js --check`.

La configuración existente conserva recursos y datos comerciales que ya estaban en esta variante, pero no carga productos. Antes de publicar, validá cada texto, dato de contacto, imagen y derecho de uso; sustituí cualquier contenido que no corresponda al comercio que adapta la plantilla. No se debe inferir ni inventar precio o disponibilidad.

## Imágenes y rendimiento

`assetBase` define la carpeta base de las rutas relativas a la página. Por defecto es `../img/`. Las imágenes de producto se muestran en espacios de 600 × 450 CSS px con carga diferida y decodificación asíncrona; las imágenes principales del hero usan prioridad alta. Prepará archivos comprimidos, en dimensiones acordes a su uso, con nombres simples y rutas dentro de la carpeta publicada. Las rutas inexistentes se reportan en la consola y las fichas sin imagen siguen siendo utilizables.

El motor admite hasta 200 categorías y 1000 productos; no implementa paginación. Para catálogos estáticos más grandes, optimizá y medí el tamaño descargado y el tiempo de renderizado antes de publicar; si el inventario supera esos límites o cambia con frecuencia, se necesita otra arquitectura.

## Lista de consulta

La lista permite agregar artículos, ajustar cantidades entre 1 y 999, quitar productos y vaciarla. Puede guardarse en `localStorage` del mismo navegador. El mensaje de WhatsApp incluye comercio, nombre, SKU, cantidad, precio solo cuando está informado y una referencia al catálogo cuando `seo.url` está configurada. El texto se codifica para el enlace `wa.me`.

Los datos locales no se comparten entre dispositivos ni reemplazan un sistema de pedidos. El enlace abre WhatsApp; el usuario revisa y envía el mensaje desde esa aplicación. El sitio no confirma operaciones ni verifica stock.

## SEO, accesibilidad y publicación

- El título, descripción, canonical opcional, Open Graph, Twitter, preload y JSON-LD se escriben estáticamente en `index.html`; generá el bloque de nuevo tras editar SEO.
- Si no hay URL pública, dejá `seo.url` vacía: no se inventa una dirección canónica ni una referencia social absoluta.
- La página incluye navegación semántica, un enlace para saltar al contenido, foco visible, diálogo de ficha con cierre por Escape, textos alternativos y estilos para movimiento reducido.
- Publicá `modelo-d/` conservando su estructura relativa y las rutas de imágenes configuradas. No necesita servidor de aplicaciones; el archivo se puede alojar en hosting estático.
- Antes de publicar, comprobá la consola y las rutas de imágenes bajo el dominio final. Revisá los metadatos sociales con una URL e imagen públicas reales.

## Pruebas

Desde la raíz:

```powershell
node modelo-d/tests/core.test.js
python modelo-d/tests/browser.test.py
node modelo-d/tools/sync-seo.js --check
```

La prueba de navegador necesita Playwright para Python y Chromium instalado. Las pruebas automatizadas no sustituyen la comprobación en Safari/Firefox, dispositivos físicos, lector de pantalla ni mediciones de Lighthouse.
