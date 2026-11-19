/* ==========================================================================
   ALMATE · Demo Moda 3 (PICHONES) · config.moda.js
   ÚNICO archivo de contenido/identidad que se edita para adaptar la tienda.
   Los productos van en products.moda.js.

   IMPORTANTE: todos los datos son de DEMOSTRACIÓN (marca, textos, contacto,
   precios y horarios). Reemplazarlos por datos reales y autorizados del
   local antes de publicar. No inventar teléfonos, dominios ni políticas
   comerciales que no existan.

   Voz de la demo: español rioplatense, cercano y juguetón (ropa infantil).
   Cada texto es editable: ajustalo según la marca del cliente.
   ========================================================================== */
const MODA_CONFIG = {

  /* Marca la demo como contenido de muestra. */
  demo: true,

  assetBase: "assets/",

  brand: {
    name: "Pichones",
    wordmark: "pichones",
    tagline: "Ropa piola para pichones",
    description: "Ropa cómoda y con onda para los más chicos. Elegís, armás el pedido y lo mandás por WhatsApp.",
    logo: "", // opcional: ruta a un logo en imagen; vacío = isotipo + wordmark
  },

  /* Paleta: tinta ciruela, papel crema y acentos suaves tipo crayón. */
  theme: {
    ink: "#403a52", // ciruela
    paper: "#fbf4e8", // crema
    sky: "#8ecbf5", // celeste nube
    sun: "#ffd166", // sol / manteca
    pink: "#ff9eb5", // chicle
    lime: "#b7e08a", // lima
    lilac: "#c7b6f5", // lila
    grey: "#6f6a80", // gris cálido
  },

  /* Tipografías autoalojadas en assets/fonts (licencia OFL). */
  fonts: {
    display: '"Bricolage Grotesque", "Arial Rounded MT Bold", "Trebuchet MS", system-ui, sans-serif',
    body: '"DM Sans", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },

  /* Contacto de DEMOSTRACIÓN. Reemplazar antes de publicar. */
  contact: {
    whatsapp: "5491130000000", // número de demostración — reemplazar
    instagram: "https://instagram.com/pichones.demo",
    email: "hola@pichones.demo",
    address: "Local de ejemplo · Buenos Aires",
    hours: "Lun a Sáb · 10 a 20 h (ejemplo)",
  },

  /* Cinta en movimiento. Se pausa con el mouse y se detiene con
     "reducir movimiento". Sin promesas comerciales no configuradas. */
  announcement: {
    enabled: true,
    items: [
      "Mini tanda Verano 27 ya está online",
      "Armá el conjunto y mandalo por WhatsApp",
      "¿Dudas con el talle? Mirá la guía",
      "Te confirmamos disponibilidad por WhatsApp",
    ],
    link: "",
  },

  /* `anchor` lleva a una sección; `filter` aplica un filtro del catálogo
     (gender, category, sale o new). */
  navigation: [
    { label: "Lo nuevo", filter: { new: true } },
    { label: "Nena", filter: { gender: "nena" } },
    { label: "Nene", filter: { gender: "nene" } },
    { label: "Accesorios", filter: { category: "accesorios" } },
    { label: "Ofertas", filter: { sale: true } },
    { label: "Armá el conjunto", anchor: "#pilcha" },
  ],

  hero: {
    eyebrow: "Mini tanda Verano 27",
    title: "Ropa piola para pichones.",
    highlight: "pichones",
    subtitle: "Remeras, buzos, jeans y accesorios cómodos para jugar, ir al jardín y salir sin vueltas. Elegís, armás el pedido y lo mandás por WhatsApp.",
    image: "assets/hero/hero-main.svg",
    imageAlt: "Ilustración de demostración: buzo lila con un pollito sonriente de fondo",
    ctaLabel: "Ver la tanda",
    ctaAnchor: "#catalogo",
    ctaSecondaryLabel: "Armá el conjunto",
    ctaSecondaryAnchor: "#pilcha",
    badge: "mini tanda 27 ✺",
    stickers: [
      { text: "Pedí por WhatsApp", tone: "lime" },
      { text: "Re cómodo", tone: "pink" },
      { text: "Para jugar", tone: "sky" },
    ],
    collage: [
      { image: "assets/hero/hero-a.svg", imageAlt: "Ilustración de demostración: remera y calza" },
      { image: "assets/hero/hero-b.svg", imageAlt: "Ilustración de demostración: enterito y gorra" },
    ],
  },

  categories: {
    title: "Elegí el rollo",
    subtitle: "Tocá una y te mostramos lo que hay.",
    items: [
      { id: "remeras", name: "Remeras", tone: "lilac", image: "assets/categories/remeras.svg", imageAlt: "Remeras de colores", filter: { category: "remeras" } },
      { id: "buzos", name: "Buzos", tone: "sun", image: "assets/categories/buzos.svg", imageAlt: "Buzos con y sin capucha", filter: { category: "buzos" } },
      { id: "pantalones", name: "Pantalones", tone: "pink", image: "assets/categories/pantalones.svg", imageAlt: "Jean y jogger", filter: { category: "pantalones" } },
      { id: "camperas", name: "Camperas", tone: "lime", image: "assets/categories/camperas.svg", imageAlt: "Campera de abrigo y rompeviento", filter: { category: "camperas" } },
      { id: "vestidos", name: "Vestidos", tone: "sky", image: "assets/categories/vestidos.svg", imageAlt: "Vestidos de verano", filter: { category: "vestidos" } },
      { id: "accesorios", name: "Accesorios", tone: "paper", image: "assets/categories/accesorios.svg", imageAlt: "Gorra y mochila", filter: { category: "accesorios" } },
      { id: "ofertas", name: "Ofertas", tone: "sun", image: "assets/categories/ofertas.svg", imageAlt: "Etiqueta de oferta", filter: { sale: true } },
    ],
  },

  /* Guía de talles por edad (sección nueva y exclusiva de la demo infantil). */
  guia: {
    eyebrow: "Guía de talles",
    title: "¿Qué talle le va?",
    subtitle: "Una referencia rápida por edad. Es orientativa: si dudás, escribinos.",
    note: "Los talles pueden variar según la prenda. Ante la duda, siempre conviene preguntar por WhatsApp.",
    columns: ["Edad", "Talle sugerido"],
    rows: [
      ["0–2 años", "2"],
      ["3–4 años", "4"],
      ["5–6 años", "6"],
      ["7–8 años", "8"],
      ["9–10 años", "10"],
      ["11–12 años", "12"],
    ],
  },

  collection: {
    eyebrow: "La mini tanda",
    title: "Mini Tanda Verano 27",
    description: "Colores alegres, telas suaves y prendas cómodas para el jardín, el parque y la playa. Lo que no puede faltar este verano.",
    image: "",
    imageAlt: "",
    ctaLabel: "Ver toda la tanda",
    ctaAnchor: "#catalogo",
    productIds: ["buzo-canguro", "jean-elasticado", "gorra-pibe", "campera-rompeviento"],
  },

  catalog: {
    title: "Todo lo que hay",
    subtitle: "Buscá, filtrá y elegí lo tuyo. Si tenés dudas, escribinos.",
    emptyText: "Uy, no encontramos nada con eso. Probá con otra palabra o limpiá los filtros.",
  },

  /* Texto visible de cada etiqueta de producto. */
  tags: {
    new: "Recién llegado",
    "best-seller": "Más pedido",
    limited: "Edición corta",
    sale: "Oferta",
    exclusive: "Solo acá",
    featured: "Destacado",
  },

  /* Armador de conjuntos: combina productos del catálogo por categoría. */
  pilcha: {
    eyebrow: "Armador de conjuntos",
    title: "Armá el conjunto",
    subtitle: "Combiná arriba, abajo y un extra. Cuando te cierre, elegís talles y lo sumás al pedido.",
    ctaLabel: "Sumar este conjunto",
    randomLabel: "¡Sorprendeme!",
    slots: [
      { label: "Arriba", categories: ["remeras", "buzos", "vestidos"] },
      { label: "Abajo", categories: ["pantalones", "calzas"] },
      { label: "Extra", categories: ["camperas", "accesorios"] },
    ],
  },

  lookbook: {
    title: "Looks para copiar",
    subtitle: "Ideas de combinaciones para chicos. Inspirate y armá las tuyas.",
    items: [
      { image: "assets/lookbook/lb-01.svg", imageAlt: "Look de demostración: buzo celeste, jogger negro y gorra rosa", caption: "Tarde en la plaza", sticker: "Plan tranqui" },
      { image: "assets/lookbook/lb-02.svg", imageAlt: "Look de demostración: remera, jean y mochila", caption: "Día de jardín", sticker: "Re cómodo" },
      { image: "assets/lookbook/lb-03.svg", imageAlt: "Look de demostración: rompeviento, short y mochila", caption: "Finde en la costa", sticker: "Pa' el calor" },
      { image: "assets/lookbook/lb-04.svg", imageAlt: "Look de demostración: vestido y campera", caption: "Cumple de una amiga", sticker: "" },
      { image: "assets/lookbook/lb-05.svg", imageAlt: "Look de demostración: remera rayada, cargo y gorra", caption: "Recital", sticker: "Combo fiel" },
    ],
  },

  benefits: {
    title: "Cómo laburamos",
    items: [
      { title: "Hablamos por WhatsApp", text: "Mandás tu pedido y seguimos la charla ahí. Sin formularios eternos.", tone: "sun" },
      { title: "Te ayudamos con el talle", text: "Si dudás entre dos, preguntanos. Mejor consultar que adivinar.", tone: "sky" },
      { title: "Confirmamos antes de nada", text: "Primero chequeamos que esté lo que pediste y después coordinamos.", tone: "pink" },
      { title: "Sin vueltas", text: "Nada de checkout interminable: elegís, armás el pedido y listo.", tone: "lime" },
    ],
  },

  about: {
    eyebrow: "Quiénes somos",
    title: "Hacemos ropa para que jueguen a sus anchas.",
    paragraphs: [
      "Somos una marca de ropa infantil pensada para chicos que se mueven: del jardín al parque y del parque a casa, sin que la ropa moleste.",
      "Este texto es de demostración: reemplazalo por la historia real de tu marca, cómo arrancó y qué la hace distinta.",
    ],
    image: "assets/lookbook/about.svg",
    imageAlt: "Ilustración de demostración: perchero con prendas de colores y un pollito sonriente",
    sticker: "Hecho con onda",
  },

  faq: {
    title: "Dudas frecuentes",
    items: [
      { q: "¿Cómo hago un pedido?", a: "Elegí la prenda, el color y el talle, sumala a tu pedido y mandanos todo por WhatsApp. Ahí seguimos la charla." },
      { q: "¿Cómo sé qué talle le va?", a: "Mirá la guía de talles por edad como referencia. Si dudás, escribinos con la edad y medidas y te damos una mano." },
      { q: "¿Hay stock de lo que veo?", a: "La disponibilidad que ves es orientativa. Cuando nos escribís, te confirmamos si está." },
      { q: "¿Cómo se paga?", a: "Los medios de pago los coordinamos por WhatsApp. Esta página no cobra ni procesa pagos." },
      { q: "¿Hacen envíos?", a: "Consultanos por WhatsApp si llegamos a tu zona. Te contamos las opciones y costos antes de que decidas." },
    ],
  },

  seo: {
    title: "Pichones · Ropa piola para chicos",
    description: "Ropa infantil cómoda y con onda para los más chicos. Mirá la mini tanda Verano 27, armá el pedido y mandalo por WhatsApp.",
    url: "", // dominio real, ej. "https://www.tutienda.com.ar/" (vacío = sin canonical ni imagen social)
    image: "assets/hero/hero-main.svg",
    imageAlt: "Campaña de demostración de Pichones",
    locale: "es_AR",
  },

  /* Secciones visibles, en orden. Quitar una clave la oculta. */
  sections: ["hero", "categories", "guia", "collection", "catalog", "pilcha", "lookbook", "benefits", "about", "faq"],
};
