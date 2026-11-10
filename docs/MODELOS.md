# Familia de modelos ALMATE — Comercial

Este repositorio ofrece cuatro variantes visuales de plantillas comerciales. A, B, C y D se pueden adaptar, publicar y comercializar por separado.

| | **Modelo A · Industrial** | **Modelo B · Premium** | **Modelo C · Conversión** | **Modelo D · Catálogo Comercial** |
|---|---|---|---|---|
| Ubicación | `modelo-a/` | `modelo-b/` | `modelo-c/` | `modelo-d/` |
| Identidad | paleta industrial clara: acero frío, tinta azul acero y amarillo de seguridad | carbón, marfil, arena y bronce; editorial | superficies claras, azul petróleo y terracota; orientada a la acción | grafito, blanco, azul eléctrico y naranja; industrial moderna |
| Tipografía | Oswald + Manrope, Google Fonts | Cormorant Garamond + Inter, autoalojadas | familias del sistema; sin solicitudes externas | stacks Inter y Manrope con alternativas del sistema |
| Logo | `img/logo_local.png` en header y footer, con fallback a texto | configurable con fallback a texto | configurable con fallback a texto | configurable con fallback a texto |
| Composición | tarjetas, grillas regulares y catálogo filtrable | hero dividido, rubros numerados, mosaico asimétrico | hero de propuesta/acción, indicadores opcionales, tarjetas funcionales y CTA final | categorías navegables, tarjetas de producto, filtros y lista de consulta |
| Enfoque | rubros, catálogo de consulta y contacto rápido | presentación de marca y experiencia visual | consultas, presupuestos y captación de oportunidades | catálogo, búsqueda de artículos y consultas por WhatsApp |
| Configuración | `SITE_CONFIG` en `script.js` (datos, colores, logo y catálogo) | `modelo-b/config.premium.js` + `config-core.js` | `modelo-c/config.modelo-c.js` + `config-core.modelo-c.js` | `modelo-d/config.modelo-d.js` + `config-core.modelo-d.js` |
| Motor | `script.js` + `catalog.js` | `modelo-b/engine.premium.js` | `modelo-c/engine.modelo-c.js` | `modelo-d/engine.modelo-d.js` |
| Secciones | HTML estático con datos por configuración | secciones configurables y ordenables | secciones configurables/ordenables; cada una vacía queda oculta | secciones configurables/ordenables, con catálogo y categorías |
| Interacciones | menú móvil, WhatsApp, lightbox, búsqueda y lista de consulta | menú accesible, WhatsApp, galería/lightbox | menú accesible, CTAs, WhatsApp personalizado, lightbox, FAQ nativa | búsqueda/filtros combinados, ficha modal, lista con cantidades y WhatsApp |
| SEO | escrito en `index.html`; sin canonical ni datos inventados | bloque estático sincronizado con `modelo-b/tools/sync-seo.js` | bloque estático sincronizado con `modelo-c/tools/sync-seo.js` | bloque estático sincronizado con `modelo-d/tools/sync-seo.js` |
| Testimonios | sección retirada por contenido ficticio | lista vacía = sección oculta | lista vacía = sección oculta; solo opiniones reales/autorizadas | no aplica |
| Stack | HTML/CSS/JS vanilla | HTML/CSS/JS vanilla | HTML/CSS/JS vanilla, sin build ni dependencias de producción | HTML/CSS/JS vanilla, sin build ni dependencias de producción |

## Cómo elegir

- **Industrial:** ferreterías, corralones, talleres y comercios de barrio que priorizan rubros, catálogo de consulta y contacto rápido.
- **Premium:** estudios profesionales, arquitectura/diseño, inmobiliarias, decoración, marcas y comercios especializados que priorizan presentación editorial.
- **Conversión:** servicios, comercios especializados y profesionales que necesitan explicar su propuesta, resolver dudas y facilitar una consulta o presupuesto.
- **Catálogo Comercial:** ferreterías, corralones, distribuidoras, casas de electricidad, repuestos, pinturerías, sanitarios, mayoristas y comercios especializados que necesitan organizar productos y recibir consultas. No incluye pagos, checkout ni gestión de pedidos.

## Ejecutar cada variante

Abrir `modelo-a/index.html` (A), `modelo-b/index.html` (B), `modelo-c/index.html` (C) o `modelo-d/index.html` (D), o servir el repositorio con Live Server / `python -m http.server`. Para SEO, después de cambiar la configuración de B, C o D, ejecutar el sincronizador propio indicado en su README y comprobar con `--check`.

## Independencia y recursos

A, B, C y D tienen sus propios HTML, CSS, motores y configuración; una mejora de comportamiento en una variante no se propaga automáticamente a las demás. Comparten la firma obligatoria de autoría, el repositorio contiene la carpeta `img/` con el logo `logo_local.png` que usan las cuatro variantes, y C no incorpora por defecto fotografías de esos recursos para evitar mostrar una oferta de otro rubro. Verificar los derechos de uso de cualquier imagen antes de publicar. Para adaptar un catálogo y conocer sus límites, ver [docs/CATALOGO.md](CATALOGO.md), [modelo-a/README.md](../modelo-a/README.md) y [modelo-d/README.md](../modelo-d/README.md).

## Autoría

Crédito fijo en el footer de las variantes: *Desarrollado por ALMATE · Soluciones digitales*.

## Estado y pendientes

Ver `ESTADO_PROYECTO.md` para los cambios, decisiones, pruebas ejecutadas y pendientes de cada modelo.
