# Familia de modelos ALMATE — Comercial

Este repositorio mantiene **dos variantes visuales** de la plantilla comercial.
Son independientes: se pueden editar, publicar y vender por separado.

| | **Modelo A · Industrial** | **Modelo B · Premium** |
|---|---|---|
| Ubicación | raíz del repo (`index.html`, `style.css`, `script.js`) | `premium/` |
| Identidad | acero oscuro + acento azul/amarillo, técnica | carbón, marfil, arena y bronce; sobria y editorial |
| Tipografía | Oswald + Manrope | Cormorant Garamond (serif) + Inter (sans) |
| Composición | tarjetas, grillas regulares | hero dividido, rubros como lista numerada, mosaico asimétrico, fondos alternados |
| Contenido | HTML escrito a mano + `SITE_CONFIG` (datos de contacto y colores) | **todo** en `premium/config.premium.js` (secciones, rubros, galería, testimonios, SEO, mapa), validado por `config-core.js` |
| Motor JS | `script.js` | `premium/engine.premium.js` + `premium/config-core.js` (propios, sin dependencias) |
| Tipografías | Google Fonts | autoalojadas (WOFF2, SIL OFL) |
| SEO estático | escrito a mano en `index.html` (con inconsistencias pendientes) | bloque generado: `node premium/tools/sync-seo.js` |
| Testimonios | sección retirada (eran ficticios); plantilla comentada en `index.html` | `testimonials.items` (vacío = no se muestra) |
| Stack | HTML/CSS/JS vanilla, sin build | igual |

## Cómo elegir
- **Industrial:** ferreterías, corralones, talleres, comercios de barrio que priorizan rubros, precio y contacto rápido.
- **Premium:** estudios profesionales, arquitectura y diseño, inmobiliarias, decoración, marcas, comercios especializados.

## Ejecutar cada variante
Abrir `index.html` (A) o `premium/index.html` (B) con doble clic, o servir la carpeta con Live Server / `python -m http.server`.
Al cambiar la config de B: `node premium/tools/sync-seo.js` (ver `premium/README.md`).

## Qué comparten y qué no
Comparten solo la carpeta `img/` y la firma de autoría. **No comparten código**: el Modelo A no depende de nada de `premium/` y viceversa. Costo: la lógica de menú, lightbox y WhatsApp existe en dos versiones; una mejora de motor en una variante debe portarse a mano a la otra.

## Autoría
Obligatorio en el footer: *Desarrollado por ALMATE · Soluciones digitales*.

## Estado y pendientes
Ver `ESTADO_PROYECTO.md` (raíz): cambios, decisiones, pruebas ejecutadas y pendientes.
El Modelo A solo recibió dos correcciones autorizadas (meta description rota y testimonios ficticios); sus demás inconsistencias SEO (canonical/OG/JSON-LD con otro dominio y nombre) siguen pendientes y están registradas.
