# ALMATE · Sistema de plantillas comerciales

Repositorio con cuatro plantillas estáticas listas para adaptar y
publicar: **Modelo A · Industrial**, **Modelo B · Premium**,
**Modelo C · Conversión** y **Modelo D · Catálogo Comercial**.

Todo es HTML, CSS y JavaScript puro: sin frameworks, sin build, sin
backend y sin dependencias de producción. Cada modelo es independiente
(HTML, CSS, motor y configuración propios) y comparte la firma
obligatoria de autoría.

## Estructura

```
ESTADO_PROYECTO.md   → estado, decisiones y resultados de pruebas
docs/                → documentación de la familia (MODELOS, CATALOGO)
img/                 → recursos compartidos (logo_local.png)
modelo-a/            → Industrial: presentación, rubros y catálogo de consulta
modelo-b/            → Premium: marca y experiencia editorial
modelo-c/            → Conversión: propuesta, dudas y captación de consultas
modelo-d/            → Catálogo Comercial: vidriera con búsqueda y lista
```

Cada modelo tiene su `README.md` con la guía de personalización. La
comparativa completa está en [docs/MODELOS.md](docs/MODELOS.md) y las
guías de catálogo en [docs/CATALOGO.md](docs/CATALOGO.md).

## Cómo abrir

Doble click en el `index.html` del modelo elegido, o servir el
repositoritorio completo:

```
python -m http.server
```

y abrir `http://127.0.0.1:8000/modelo-a/index.html` (o b, c, d).

Servir desde la raíz es necesario para que las rutas de imagen
compartidas (`../img/…`) funcionen en B, C y D.

## Pruebas

Requieren Playwright para Python con Chromium instalado (solo entorno
de desarrollo; no es una dependencia de producción). Desde la raíz:

```
node --check modelo-a/script.js modelo-a/catalog.js
node modelo-b/tests/core.test.js
node modelo-c/tests/core.test.js
node modelo-d/tests/core.test.js
node modelo-b/tools/sync-seo.js --check
node modelo-c/tools/sync-seo.js --check
node modelo-d/tools/sync-seo.js --check
python modelo-a/tests/browser.test.py
python modelo-b/tests/browser.test.py
python modelo-c/tests/browser.test.py
python modelo-d/tests/browser.test.py
```

En Windows, si la consola no soporta los caracteres de salida:
`set PYTHONIOENCODING=utf-8` (o `PYTHONUTF8=1`) antes de cada `python`.

## Reglas de contenido

- Ninguna plantilla inventa productos, precios ni disponibilidad: los
  catálogos arrancan vacíos y sin precios publicados.
- Sin precio informado se muestra **"Consultar precio"**; la
  disponibilidad solo aparece si el comercio la confirma.
- Los metadatos SEO no declaran dominios, canónicas ni imágenes que no
  existan.
- Crédito obligatorio en el footer: **Desarrollado por ALMATE ·
  Soluciones digitales**.

## Estado

Sin commits: todo el trabajo vive en el working tree local. Detalle de
cambios, decisiones y resultados exactos de pruebas en
[ESTADO_PROYECTO.md](ESTADO_PROYECTO.md).
