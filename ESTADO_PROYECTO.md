# ESTADO DEL PROYECTO — ALMATE · Plantilla comercial (Ferretería)

Última actualización: 2026-11-03 · Estado: **Modelos C y D implementados y validados en Chromium; sin commit/push/deploy.**

## Objetivo
Familia de plantillas web comerciales ALMATE · Soluciones digitales: Modelo A (Industrial, original), Modelo B (Premium), Modelo C (Conversión) y Modelo D (Catálogo Comercial), reutilizables y comercializables con distintos clientes cambiando configuración y contenido.

## Estado actual
- Modelo A: funciona; 2 correcciones autorizadas aplicadas. Resto sin tocar.
- Modelo B: estable, validado, configurable, documentado. Pendientes de validación en dispositivos/navegadores reales (ver abajo).
- Modelo C: implementado en `modelo-c/`, independiente de A/B; configuración, motor, SEO estático, documentación y pruebas propias. 19/19 pruebas de núcleo y 47/47 comprobaciones Chromium pasaron.
- Modelo D: implementado en `modelo-d/`, independiente de A/B/C; catálogo configurable, búsqueda y filtros combinados, fichas, lista local de consulta, WhatsApp, SEO estático, documentación y pruebas propias. Catálogo de productos vacío por defecto.

## Tecnologías
HTML/CSS/JavaScript vanilla, sin build ni dependencias de producción. Herramientas opcionales de desarrollo: Node.js (sync-seo, pruebas del núcleo) y Python + Playwright/Chromium (pruebas de navegador).

## Estructura
```
index.html, style.css, script.js, img/     Modelo A (+ README (4).md original)
premium/                                    Modelo B
  index.html  premium.css  config.premium.js  config-core.js  engine.premium.js
  fonts/ (WOFF2 + fonts.css + licencias OFL)   tools/sync-seo.js   tests/
modelo-c/                                   Modelo C
  index.html  modelo-c.css  config.modelo-c.js  config-core.modelo-c.js
  engine.modelo-c.js  tools/sync-seo.js  tests/
modelo-d/                                   Modelo D
  index.html  styles.css  favicon.svg
  config.modelo-d.js  config-core.modelo-d.js  engine.modelo-d.js
  tools/sync-seo.js  tests/
docs/MODELOS.md                             comparación y elección de variante
docs/CATALOGO.md                            carga, búsqueda y consulta de productos
ESTADO_PROYECTO.md                          este archivo
```

## Funcionalidades (Modelo B)
Navegación + menú móvil accesible · hero · nosotros · rubros · galería con lightbox accesible · testimonios (opcional, vacío por defecto) · contacto con mapa configurable · WhatsApp (hero, contacto, flotante) · footer con crédito obligatorio fijo · SEO estático generado · secciones activables y ordenables · degradación elegante ante datos o imágenes faltantes.
No existen (ni en A): formulario de contacto, buscador, multi-idioma.

## Cambios realizados en esta etapa
**Modelo B**
- `config-core.js` (nuevo): valores por defecto, validación de tipos/arrays/objetos, descarte de valores inválidos con avisos en consola, escapado, listas de protocolos permitidos, validación de rutas de imagen, generación del SEO.
- `engine.premium.js` (reescrito): usa el núcleo; cada sección se renderiza aislada (try/catch); texto siempre escapado; enlaces externos con `rel="noopener noreferrer"`; imágenes rotas se retiran sin romper el layout; lightbox basado en el DOM actual; trampa de foco y Escape en menú; compatibilidad `MediaQueryList.addListener`; aviso si el `<head>` estático no coincide con la config.
- `config.premium.js`: mapa configurable (`contact.map`), crédito fijo, `seo.url`/`seo.image` documentados, comentarios de uso.
- `index.html`: bloque SEO generado entre marcadores (title, description, canonical*, Open Graph, Twitter, preload del hero, JSON-LD); fuentes autoalojadas; `main` focusable.
- `premium.css`: estados sin imagen/sin mapa, foco con contraste en claro/oscuro, `[hidden]`, `.sr-only`, `overflow-wrap`, lightbox enfocable al abrir. Sin cambios de identidad visual.
- `fonts/` (nuevo): Cormorant Garamond e Inter en WOFF2 (latin), `fonts.css`, licencias OFL. Reemplaza a Google Fonts.
- `tools/sync-seo.js` (nuevo) y `tests/` (nuevo).
- Documentación: `premium/README.md`, `docs/MODELOS.md`, este archivo.

**Modelo A** (solo lo autorizado)
- `index.html`: meta description rota (etiqueta duplicada dentro de `content`) corregida.
- `index.html`: testimonios ficticios (Rodrigo Paz, Estela Gómez, Facundo Ibarra) retirados; la sección queda comentada con una plantilla para testimonios reales.

## Errores encontrados (auditoría)
Motor sin validación (una propiedad ausente podía romper todo el render) · texto de la config insertado como HTML · URLs sin validar · SEO del `<head>` y de la config duplicados y desincronizables · `preload` del hero fijo · lightbox con índices atados a imágenes que podían fallar · sin atrapar foco en el menú ni retorno de foco · `MediaQueryList.addEventListener` no soportado en Safari < 14 · mapa no configurable · dependencia de Google Fonts · botón de WhatsApp flotante tapando el CTA del hero (corregido antes) · textos largos podían producir scroll horizontal · sección de contacto aparecía con configuración vacía · el lightbox no podía enfocar "Cerrar" al abrir (visibilidad con transición). Los tres últimos los detectaron las pruebas y están corregidos.

## Decisiones técnicas
- Premium lleva su propio motor (opción 2): independencia total del Modelo A a costa de duplicar lógica.
- SEO: HTML estático generado por una herramienta sin dependencias (el sitio no tiene build). El motor **no** reescribe metadatos (no sirve a rastreadores sin JS); solo avisa si hay desincronización.
- `config-core.js` es compartido por navegador y Node (un único lugar para reglas y SEO).
- Fuentes autoalojadas por defecto (rendimiento, sin tercero, verificable offline).
- Crédito "Desarrollado por ALMATE · Soluciones digitales" fijo (no configurable).
- Mapa: Google Maps solo por iframe (sin API ni costo), opcional.

## Pruebas ejecutadas (Chromium headless 141 + Node 22)
- `node premium/tests/core.test.js`: 21/21.
- `python3 premium/tests/browser.test.py`: 74/74, que cubren: A y B en escritorio (1440) y móvil (390) · menú móvil · lightbox · navegación por teclado (skip link, Tab, Shift+Tab, Enter, flechas, Escape, retorno de foco) · configuración incompleta, vacía y ausente · secciones deshabilitadas/inexistentes/duplicadas · enlaces inválidos e intento de inyección (HTML/JS/`javascript:`/`data:`) · imágenes inexistentes (parciales y todas) · WhatsApp (formato, 3 enlaces, flotante) · mapa (oculto, sin datos, `embedUrl`, `externalUrl`) · SEO estático (`sync-seo --check`, desactualización detectada, JSON-LD) · ausencia de scroll horizontal (320, 390, 820, 1440, textos extremos) · ausencia de errores JS.
- Contraste WCAG de los pares de texto de la paleta por defecto: todos ≥ 4,5:1 (cálculo, no medición en pantalla).
- Revisión visual de capturas (hero con tipografías reales).

## Pruebas pendientes (no ejecutadas)
Dispositivos físicos (iOS/Android) · Safari y Firefox (solo se probó Chromium) · lector de pantalla (NVDA/VoiceOver) · Lighthouse/PageSpeed y peso real en red lenta · ejecución de `sync-seo.js` en Windows/Git Bash del equipo · Modelo A: no se revisó nada más allá de carga sin errores, sin scroll horizontal y los dos cambios autorizados · mapa embebido real (el sandbox no tiene acceso a Google) · vista previa social con dominio real.

## Riesgos conocidos
- Contenido de Premium generado por JS (SEO fuera de Google).
- Duplicación de lógica A/B: una mejora de motor debe portarse a mano.
- `sync-seo.js` hay que ejecutarlo tras cada cambio de config; si se olvida, el motor avisa en consola pero el HTML estático queda viejo.
- Fotos del repo con personas reales: confirmar derechos de uso antes de comercializar.
- Modelo A sigue con SEO inconsistente (canonical/OG/JSON-LD de otro dominio y nombre, nombre "FREN" vs "El Yunque") — no autorizado a corregir en esta etapa.
- `README (4).md` del Modelo A todavía describe los testimonios como existentes.

## Próximo paso recomendado
Revisar en el navegador real (Chrome + Safari/iOS), correr Lighthouse, y adaptar un primer cliente real de punta a punta con el checklist de `premium/README.md`. Luego decidir si se corrige el SEO del Modelo A.

## Desarrollo del Modelo C — 2026-11-03

### Implementación
- Estructura nueva `modelo-c/`; no se modificaron los archivos de ejecución de A ni B.
- Identidad propia con superficies claras, azul petróleo y terracota; fuentes del sistema para no depender de terceros.
- `config.modelo-c.js`: marca, textos, paleta, SEO, contactos, CTA, servicios, diferenciales, indicadores, galería, proceso, testimonios, FAQ, cobertura, navegación y orden/secciones. Los indicadores y testimonios comienzan vacíos; las tarjetas y el proceso de muestra son texto de plantilla que se debe sustituir.
- `config-core.modelo-c.js`: defaults, validación, avisos explícitos, escape, reglas de URL/rutas, requisitos de 3–6 diferenciales y 3–4 pasos, secciones disponibles y generación de metadatos estáticos. URLs de mapa embebido restringidas a HTTPS de Google Maps/OpenStreetMap.
- `engine.modelo-c.js` y `modelo-c.css`: render modular, header con CTA/menú, hero, secciones configurables, WhatsApp y otros enlaces de acción, lightbox accesible, FAQ nativa, degradación ante imágenes faltantes, responsive, foco visible y movimiento reducido. No hay formulario/backend.
- `tools/sync-seo.js`: genera title, description, canonical opcional, Open Graph, Twitter y preload desde la configuración. No agrega JSON-LD.
- `README.md`: arquitectura, adaptación, imágenes, SEO estático, publicación, seguridad y limitaciones.
- `docs/MODELOS.md`: comparación A/B/C.
- Créditos de ALMATE fijos en el footer.

### Pruebas ejecutadas
- `node modelo-c/tests/core.test.js`: **19/19**.
- `python modelo-c/tests/browser.test.py`: **47/47** con Playwright 1.64.1 y Chromium. Comprobó 390, 768, 1024 y 1440 px; orden y activación; menú/navegación; WhatsApp; enlaces seguros; galería/lightbox/teclado; FAQ; configuración incompleta; escape/URLs inválidas; mapas opcionales; imágenes faltantes (incluidas todas las miniaturas); SEO estático y errores JS.
- `node modelo-c/tools/sync-seo.js --check`: correcto.
- `node --check` sobre motor, núcleo, configuración, sincronizador y prueba del núcleo: correcto.
- `python -m py_compile modelo-c/tests/browser.test.py`: correcto.
- Contraste calculado (paleta predeterminada): tinta/papel 11.24:1; texto secundario/papel 5.60:1; blanco/acento 5.46:1; blanco/primario 8.12:1; acento claro/primario 4.64:1. Es un cálculo de color, no una auditoría WCAG en pantalla.

### Pendientes y límites
- No se probaron dispositivos iOS/Android, Safari, Firefox, lectores de pantalla ni Lighthouse/PageSpeed.
- El contenido central se renderiza con JavaScript; algunos rastreadores pueden no procesarlo. Los metadatos sí se sirven estáticos; ejecutar el sincronizador tras modificar SEO.
- Antes de una adaptación real deben sustituirse los ejemplos, validar los datos, optimizar imágenes y confirmar sus derechos; los servicios/proceso de ejemplo no son información comercial de un cliente.
- Validar que el dominio sirva las rutas de imágenes configuradas y comprobar el mapa/compartidos sociales en producción.
- No se creó formulario, backend ni envío simulado. No hubo commit, push ni deploy.

## Desarrollo del Modelo D — 2026-11-03

### Implementación
- Se creó `modelo-d/` como una variante independiente. No se modificaron los archivos de ejecución de A, B o C.
- Identidad industrial moderna en grafito, blanco, azul eléctrico y naranja; diseño responsive, estados de foco y movimiento reducido.
- `config.modelo-d.js` separa marca, contacto, redes, tema, tipografía, SEO, navegación, secciones, categorías y productos. El catálogo parte vacío para no publicar inventario, precios ni stock inventados.
- `config-core.modelo-d.js` valida y normaliza configuración y datos de catálogo; el motor usa avisos explícitos cuando omite entradas inválidas.
- `engine.modelo-d.js` renderiza categorías y productos, combina búsqueda y filtros, ordena resultados, abre fichas en un diálogo accesible y mantiene una lista de consulta con cantidades, persistencia opcional y enlace codificado a WhatsApp. No confirma operaciones ni implementa checkout.
- `tools/sync-seo.js` mantiene los metadatos estáticos y JSON-LD alineados con la configuración; si no se configura URL pública, no genera canonical ni referencia absoluta.
- Se añadieron `modelo-d/README.md` y `docs/CATALOGO.md`; se actualizó `docs/MODELOS.md`.
- El crédito «Desarrollado por ALMATE · Soluciones digitales» es fijo.

### Pruebas ejecutadas
- `node modelo-d/tests/core.test.js`: **9/9**.
- `python modelo-d/tests/browser.test.py`: **45/45** con Chromium. Comprobó carga inicial y catálogo vacío; contenido, búsqueda por nombre/SKU/marca, filtros combinados, orden, rangos de precio, producto sin imagen/precio, ficha/galería, lista, cantidades, eliminación, persistencia, vaciado, enlace WhatsApp, anchos 320/390/768/1024/1440 px, skip link, SEO y ausencia de errores JS/consola.
- `node modelo-d/tools/sync-seo.js --check`: correcto.
- `node --check` sobre los scripts JavaScript de D: correcto.
- No se probaron dispositivos físicos, Safari, Firefox, lectores de pantalla ni Lighthouse/PageSpeed; las pruebas de accesibilidad automatizadas no son una certificación WCAG.

### Límites y pendientes
- El sitio es estático y no tiene backend. Admite hasta 200 categorías y 1000 productos, sin paginación ni actualización remota; `localStorage` es local al navegador y puede borrarse.
- Antes de adaptar/publicar, confirmar y reemplazar los datos comerciales existentes en la configuración, validar precios/disponibilidad con el comercio y confirmar derechos de imágenes.
- Revisar rutas, metadatos sociales y rendimiento en el dominio final. No hubo commit, push ni deploy.
