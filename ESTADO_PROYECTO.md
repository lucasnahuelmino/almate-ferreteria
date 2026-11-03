# ESTADO DEL PROYECTO — ALMATE · Plantilla comercial (Ferretería)

Última actualización: 2026-11-02 · Estado: **consolidación técnica del Modelo B completada; sin commit/push/deploy.**

## Objetivo
Familia de plantillas web comerciales ALMATE · Soluciones digitales: Modelo A (Industrial, original) y Modelo B (Premium), reutilizables y comercializables con distintos clientes cambiando solo configuración y contenido.

## Estado actual
- Modelo A: funciona; 2 correcciones autorizadas aplicadas. Resto sin tocar.
- Modelo B: estable, validado, configurable, documentado. Pendientes de validación en dispositivos/navegadores reales (ver abajo).

## Tecnologías
HTML/CSS/JavaScript vanilla, sin build ni dependencias de producción. Herramientas opcionales de desarrollo: Node.js (sync-seo, pruebas del núcleo) y Python + Playwright/Chromium (pruebas de navegador).

## Estructura
```
index.html, style.css, script.js, img/     Modelo A (+ README (4).md original)
premium/                                    Modelo B
  index.html  premium.css  config.premium.js  config-core.js  engine.premium.js
  fonts/ (WOFF2 + fonts.css + licencias OFL)   tools/sync-seo.js   tests/
docs/MODELOS.md                             comparación y elección de variante
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
