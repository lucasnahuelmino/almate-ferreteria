# Modelo D · Catálogo comercial

Guía de datos, búsqueda y consulta de productos de [Modelo D](../modelo-d/README.md). La plantilla es una vidriera estática: no vende en línea, no cobra, no reserva y no confirma pedidos.

## Categorías

En `config.modelo-d.js`, `categories` es una lista de categorías con:

| Campo | Requerido | Uso |
|---|---:|---|
| `id` | Sí | Identificador único estable; los productos lo usan en `category`. |
| `name` | Sí | Nombre visible en categorías y filtros. |
| `image` | No | Ruta de imagen de la categoría, relativa a `assetBase`. |
| `alt` | Si hay imagen | Descripción útil de esa imagen. |
| `order` | No | Orden de presentación; si se omite, se usa la posición. |

El catálogo está limitado a 200 categorías. No agregues categorías vacías si no ayudan a navegar la oferta.
Las subcategorías no se declaran por separado: el filtro se alimenta de los valores `subcategory` de los productos de cada categoría.

## Productos

Agregá los datos a `catalog.products`. Cada artículo admite los siguientes campos:

| Campo | Requerido | Uso |
|---|---:|---|
| `id` | Sí | ID único para renderizado y lista local. No lo cambies después de publicar si querés conservar listas guardadas. |
| `sku` | No | Código visible y buscable. |
| `name` | Sí | Nombre visible, buscable y requerido en la ficha. |
| `category` | Sí | Debe coincidir con un ID de `categories`. |
| `subcategory` | No | Texto visible y filtrable dentro de la categoría. |
| `brand` | No | Marca del artículo; visible y buscable. |
| `shortDescription` | No | Resumen para la tarjeta. |
| `description` | No | Descripción completa para la ficha. |
| `mainImage` | No | Ruta relativa a `assetBase`; las tarjetas reservan proporción 4:3. |
| `mainImageAlt` | Recomendado si hay imagen | Texto alternativo descriptivo, no el nombre del archivo. Si se omite, el motor avisa y usa el nombre del producto como respaldo. |
| `gallery` | No | Lista de `{ src, alt }` para imágenes adicionales de la ficha. |
| `price` | No | Número no negativo en la moneda de `currency`; si se omite o es inválido, se ofrece consultar. |
| `previousPrice` | No | Precio anterior opcional, solo si es mayor que `price`. |
| `unit` | No | Unidad de venta, por ejemplo `unidad` o `metro`, cuando el comercio la confirma. |
| `availability` | No | Texto explícito de disponibilidad, solo si el comercio lo confirma. Nunca se genera stock por defecto. |
| `specifications` | No | Lista de `{ name, value }` para características técnicas. |
| `tags` | No | Etiquetas del producto. |
| `featured` | No | `true` para incluirlo en destacados. |
| `order` | No | Orden numérico de presentación. |

Se recomienda mantener un ID estable y una categoría válida por producto. El motor normaliza datos incorrectos, omite registros inválidos y muestra avisos en la consola. No publiques referencias temporales, precios anteriores o disponibilidad sin confirmar. Si no hay precio, se muestra «Consultar precio».

## Búsqueda, filtros y orden

- La búsqueda encuentra coincidencias parciales por nombre, SKU y marca.
- Los filtros de categoría, subcategoría y rango de precio se combinan con la búsqueda y entre sí.
- El filtro de precio solo puede seleccionar productos con un precio publicado.
- Las opciones de orden son destacados, alfabético y precio ascendente/descendente. Los productos sin precio quedan al final del orden por precio.
- Si la combinación no devuelve artículos, el catálogo informa que no hay resultados; se pueden limpiar los controles.
- Las categorías pueden iniciar el catálogo ya filtrado por la categoría seleccionada.

## Ficha de producto

La ficha es un diálogo accesible dentro de la misma página, no una ruta dinámica. Muestra imagen principal, galería, nombre, SKU, marca, descripciones, especificaciones, precio y disponibilidad cuando existan datos. Permite cerrar con Escape y regresar el foco al control que la abrió. Un artículo sin imagen o precio conserva una ficha funcional y la invitación a consultar.

## Lista y WhatsApp

El usuario puede agregar artículos desde la tarjeta o la ficha, cambiar cantidades de 1 a 999, quitar elementos y vaciar la lista. El total de unidades se actualiza; la suma solo considera precios publicados y avisa cuando hay productos sin precio. Si `consultation.persist` está activo, la lista se conserva en `localStorage` usando `consultation.storageKey`.

El botón aparece solo con una lista no vacía y un número válido. El mensaje contiene el nombre del comercio, el nombre de cada artículo, SKU si existe, cantidad, precio informado si existe y referencia al catálogo si `seo.url` está configurada. El usuario envía el mensaje desde WhatsApp; no se crea una compra o pedido confirmado. Las listas locales no se transmiten al comercio hasta que el usuario envía el mensaje.

## Volumen y límites

El motor admite hasta 200 categorías y 1000 productos por página, sin paginación. La configuración, el catálogo y las rutas son estáticos; cambios de contenido requieren volver a publicar los archivos. `localStorage` depende del navegador y puede borrarse. Para inventarios mayores, actualizaciones frecuentes, stock en tiempo real o transacciones, se requiere una solución con backend y diseño específico; eso queda fuera de esta plantilla.
