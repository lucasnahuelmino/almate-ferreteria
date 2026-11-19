# ALMATE · Demo Moda 2 (PIOLA) — Estado del proyecto

## Objetivo
Segunda plantilla comercial de indumentaria, con identidad propia frente a `demo-moda/`:
juvenil, colorida, moderna y de tono rioplatense, lista para presentar a clientes.
Sigue siendo un catálogo de consulta (sin pagos ni checkout) con pedido por WhatsApp.

## Arquitectura
HTML + CSS + JS nativo, sin dependencias ni backend. Se reutiliza la arquitectura de
`demo-moda` (configuración validada → motor → módulos), con motores **duplicados a
propósito** para que un cambio en una demo no rompa la otra.

| Capa | Archivos |
| --- | --- |
| Contenido | `js/config.moda.js`, `js/products.moda.js` |
| Validación | `js/config-core.moda.js` (normaliza, valida y reporta; extendido con tonos, tags, pilcha, `new`) |
| Lógica | `catalog`, `product-detail`, `cart` (+ núcleo puro testeable), `whatsapp`, `pilcha` |
| Orquestación | `js/engine.moda.js` (render de secciones, navegación, cola de la pilcha) |
| Estilos | `css/fonts · variables · layout · components · responsive` |
| Arte demo | `tools/make-art.js` → `assets/**.svg` |

## Qué cambió respecto de demo-moda
- Estructura nueva: cinta en movimiento, header redondeado, hero con collage y sello giratorio,
  categorías en mosaico de color, "La tanda", catálogo con chips, **Armá tu pilcha**,
  lookbook asimétrico, "Cómo laburamos", FAQ en tarjetas y footer con wordmark gigante.
- Modelo de datos: `tone` por producto, imagen **por color** y etiquetas con texto configurable.
- Ficha: cambia de imagen al elegir color, muestra el "paso X de N" cuando viene de la pilcha.
- Carrito: miniatura del color elegido; los datos que vuelven de `localStorage` se escapan y validan.

## Decisiones
- **Mujer/Hombre incluyen lo unisex**; "Unisex" muestra solo unisex.
- **Los filtros de navegación reemplazan** a los anteriores (evita listas vacías por combinar).
- **La búsqueda del header es global** (limpia los otros filtros).
- La pilcha **no agrega nada sin variante válida**: encadena las fichas existentes.
- Se usa la propiedad CSS `translate` para el efecto de aparición, así no pisa las rotaciones decorativas.
- Fuentes autoalojadas (Bricolage Grotesque + DM Sans, OFL): sin pedidos a terceros.

## Pruebas ejecutadas (Chromium headless, servidor local)
| Suite | Resultado |
| --- | --- |
| `node demo-moda-2/tests/core.test.js` | 24/24 |
| `node demo-moda-2/tools/sync-seo.js --check` | OK |
| `python demo-moda-2/tests/browser.test.py` | 111/111 |

Cubre: carga sin errores de consola/HTTP, imágenes sin roturas, 5 anchos (360, 390, 768,
1024, 1440 px) sin desborde ni errores, búsqueda (con tildes), orden, categorías, género,
talle, color, precio, estado vacío, navegación, ficha y validación de variantes, carrito
(líneas por variante, cantidades, persistencia, total, mensaje y enlace de WhatsApp), pilcha
completa y cancelación, menú y hoja de filtros móviles, config mínima, accesibilidad básica
(foco, skip link, nombres, alt), movimiento reducido y un carrito manipulado en `localStorage`.

## Limitaciones conocidas / no verificado
- Probado **solo en Chromium**. Sin pruebas en Safari/Firefox, dispositivos reales ni lector de pantalla.
- No se corrió Lighthouse ni se midió rendimiento real.
- Las imágenes son **ilustraciones de demostración**: no hay fotografía con derechos verificados.
- Contacto, marca, precios y horarios son de ejemplo (WhatsApp `5491130000000`).
- El `<dialog>` nativo requiere navegadores actuales.

## Pendientes recomendados
1. Reemplazar las ilustraciones por fotografía real (con y sin fondo) y medir pesos.
2. Probar en Safari iOS y Firefox; pasar Lighthouse y un lector de pantalla.
3. Versión de la pilcha con "guardar/compartir look" (solo enlace, sin backend).
4. Evaluar publicar `demo-moda-2` en `docs/MODELOS.md` junto con `demo-moda`.
