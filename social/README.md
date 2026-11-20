# ALMATE · Polirrubro — Sistema de redes sociales (HTML/CSS)

Complementa las plantillas SVG en `../social-templates/`. Esta versión usa HTML/CSS renderizable en navegador, con exportación a PNG vía Chrome headless.

## Estructura

Versiones disponibles: base (sin sufijo), v2 (color block centrado), v3 (minimal), v4 (sticker collage).
Cada familia tiene las 4 versiones: `producto.html`, `producto-v2.html`, `producto-v3.html`, `producto-v4.html` (y lo mismo para oferta, novedad, categoria).


```
social/
├── social.css          # estilos compartidos (formatos, tipografía, componentes)
├── producto.html       # familia Producto
├── oferta.html         # familia Oferta (precio tachado)
├── novedad.html        # familia Novedad (mensaje de marca)
├── categoria.html      # familia Categoría (3 productos)
└── SOCIAL_MEDIA_GUIDELINES.md
```

Cada HTML contiene las tres piezas: feed (1080×1350), cuadrado (1080×1080) e historia (1080×1920), con `id` del tipo `producto-feed`, `producto-sq`, `producto-story`.

## Formatos

| Formato | Tamaño | Clase |
|---|---|---|
| Feed vertical | 1080 × 1350 | `.slide` |
| Cuadrado | 1080 × 1080 | `.slide.fmt-sq` |
| Historia / Reel | 1080 × 1920 | `.slide.fmt-story` |

Vista previa con `--zoom: 0.36` en `.sheet`. Para exportar a tamaño real, `--zoom: 1`.

## Exportar PNG (manual)

1. Abrir el HTML en Chrome.
2. En DevTools: `.sheet { --zoom: 1 }`.
3. Seleccionar el `<article>` por su `id`.
4. "Capture node screenshot".

## Identidad

Colores, tipografía y stickers salen de `social.css` (tokens del polirrubro). Logos referenciados desde `../img/logo_local.png` (archivo oficial, sin copias).

## Reglas

- Titular ≤ 9 palabras; bajada ≤ 22; listas de 3–4 ítems.
- Una sola columna alineada a la izquierda.
- Un punto de atención por pieza (sticker o price pill).
- No inventar clientes, métricas, testimonios ni casos de éxito.
- Indicar siempre estado real (en desarrollo, próximamente, demo).
- No publicar precios ni plazos no confirmados.
- Firma en el pie: `ALMATE`.

Crédito: Desarrollado por ALMATE · Soluciones digitales.