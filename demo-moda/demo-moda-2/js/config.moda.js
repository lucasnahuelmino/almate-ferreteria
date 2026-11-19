/* ==========================================================================
   ALMATE · Demo Moda 2 (PIOLA) · config.moda.js
   ÚNICO archivo de contenido/identidad que se edita para adaptar la tienda.
   Los productos van en products.moda.js.

   IMPORTANTE: todos los datos son de DEMOSTRACIÓN (marca, textos, contacto,
   precios y horarios). Reemplazarlos por datos reales y autorizados del
   local antes de publicar. No inventar teléfonos, dominios ni políticas
   comerciales que no existan.

   Voz de la demo: español rioplatense, cercano y juvenil (voseo). Cada
   texto es editable: bajá el tono o cambialo según la marca del cliente.
   ========================================================================== */
const MODA_CONFIG = {

  /* Marca la demo como contenido de muestra. */
  demo: true,

  assetBase: "assets/",

  brand: {
    name: "Piola",
    wordmark: "piola",
    tagline: "Ropa con onda",
    description: "Ropa y accesorios con onda para todos los días. Elegís, armás tu pedido y lo mandás por WhatsApp.",
    logo: "", // opcional: ruta a un logo en imagen; vacío = isotipo + wordmark
  },

  /* Paleta: tinta, papel y cinco acentos. Todo configurable. */
  theme: {
    ink: "#15131f",
    paper: "#fff6e5",
    sky: "#74acdf", // celeste
    sun: "#ffc531", // sol
    pink: "#ff8fb8", // chicle
    lime: "#c8f560", // limón
    lilac: "#b8a1ff", // lila
    grey: "#5b5870",
  },

  /* Tipografías autoalojadas en assets/fonts (licencia OFL). */
  fonts: {
    display: '"Bricolage Grotesque", "Arial Rounded MT Bold", "Trebuchet MS", system-ui, sans-serif',
    body: '"DM Sans", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },

  /* Contacto de DEMOSTRACIÓN. Reemplazar antes de publicar. */
  contact: {
    whatsapp: "5491130000000", // número de demostración — reemplazar
    instagram: "https://instagram.com/piola.demo",
    email: "hola@piola.demo",
    address: "Local de ejemplo · Buenos Aires",
    hours: "Lun a Sáb · 10 a 20 h (ejemplo)",
  },

  /* Cinta en movimiento. Se pausa con el mouse y se detiene con
     "reducir movimiento". Sin promesas comerciales no configuradas. */
  announcement: {
    enabled: true,
    items: [
      "Tanda Verano 27 ya está online",
      "Armá tu pedido y mandalo por WhatsApp",
      "¿Dudas con el talle? Escribinos",
      "Te confirmamos disponibilidad por WhatsApp",
    ],
    link: "",
  },

  /* `anchor` lleva a una sección; `filter` aplica un filtro del catálogo
     (gender, category, sale o new). */
  navigation: [
    { label: "Lo nuevo", filter: { new: true } },
    { label: "Mujer", filter: { gender: "mujer" } },
    { label: "Hombre", filter: { gender: "hombre" } },
    { label: "Accesorios", filter: { category: "accesorios" } },
    { label: "Ofertas", filter: { sale: true } },
    { label: "Armá tu pilcha", anchor: "#pilcha" },
  ],

  hero: {
    eyebrow: "Tanda Verano 27",
    title: "Ropa con onda pa' todos los días.",
    highlight: "onda",
    subtitle: "Remeras, buzos, jeans y accesorios pa' salir sin pensar mucho. Elegí lo tuyo, armá el pedido y mandalo por WhatsApp. Re simple.",
    image: "assets/hero/hero-main.svg",
    imageAlt: "Ilustración de demostración: buzo lila con un sol sonriente de fondo",
    ctaLabel: "Ver la tanda",
    ctaAnchor: "#catalogo",
    ctaSecondaryLabel: "Armá tu pilcha",
    ctaSecondaryAnchor: "#pilcha",
    badge: "tanda verano 27 ✺ ",
    stickers: [
      { text: "Pedí por WhatsApp", tone: "lime" },
      { text: "Re piola", tone: "pink" },
      { text: "Sin vueltas", tone: "sky" },
    ],
    collage: [
      { image: "assets/hero/hero-a.svg", imageAlt: "Ilustración de demostración: baby tee y short" },
      { image: "assets/hero/hero-b.svg", imageAlt: "Ilustración de demostración: pantalón cargo y gorra" },
    ],
  },

  categories: {
    title: "Elegí tu rollo",
    subtitle: "Tocá una y te mostramos lo que hay.",
    items: [
      { id: "remeras", name: "Remeras", tone: "lilac", image: "assets/categories/remeras.svg", imageAlt: "Remeras de colores", filter: { category: "remeras" } },
      { id: "buzos", name: "Buzos", tone: "sun", image: "assets/categories/buzos.svg", imageAlt: "Buzos con y sin capucha", filter: { category: "buzos" } },
      { id: "pantalones", name: "Pantalones", tone: "pink", image: "assets/categories/pantalones.svg", imageAlt: "Jean y cargo", filter: { category: "pantalones" } },
      { id: "camperas", name: "Camperas", tone: "lime", image: "assets/categories/camperas.svg", imageAlt: "Campera rompeviento y puffer", filter: { category: "camperas" } },
      { id: "accesorios", name: "Accesorios", tone: "sky", image: "assets/categories/accesorios.svg", imageAlt: "Tote, gorra y riñonera", filter: { category: "accesorios" } },
      { id: "ofertas", name: "Ofertas", tone: "paper", image: "assets/categories/ofertas.svg", imageAlt: "Etiqueta de oferta", filter: { sale: true } },
    ],
  },

  collection: {
    eyebrow: "La tanda",
    title: "Tanda Verano 27",
    description: "Colores fuertes, cortes cómodos y prendas pa' combinar sin drama. Lo que no te puede faltar este verano.",
    image: "",
    imageAlt: "",
    ctaLabel: "Ver toda la tanda",
    ctaAnchor: "#catalogo",
    productIds: ["buzo-canguro", "jogger-urbano", "gorra-trucker", "campera-rompeviento"],
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

  /* Armador de looks: combina productos del catálogo por categoría. */
  pilcha: {
    eyebrow: "Armador de looks",
    title: "Armá tu pilcha",
    subtitle: "Combiná arriba, abajo y un extra. Cuando te cierre, elegís talles y lo sumás al pedido.",
    ctaLabel: "Sumar esta pilcha",
    randomLabel: "¡Sorprendeme!",
    slots: [
      { label: "Arriba", categories: ["remeras", "buzos"] },
      { label: "Abajo", categories: ["pantalones", "shorts"] },
      { label: "Extra", categories: ["accesorios", "camperas"] },
    ],
  },

  lookbook: {
    title: "Looks pa' copiar",
    subtitle: "Ideas de combinaciones. Inspirate y armá las tuyas.",
    items: [
      { image: "assets/lookbook/lb-01.svg", imageAlt: "Look de demostración: buzo celeste, jogger negro y gorra rosa", caption: "Mate en la plaza", sticker: "Plan tranqui" },
      { image: "assets/lookbook/lb-02.svg", imageAlt: "Look de demostración: baby tee, jean wide y riñonera lima", caption: "Salida con amigues", sticker: "Re cómodo" },
      { image: "assets/lookbook/lb-03.svg", imageAlt: "Look de demostración: rompeviento amarillo, short cargo y tote", caption: "Finde en la costa", sticker: "Pa' el calor" },
      { image: "assets/lookbook/lb-04.svg", imageAlt: "Look de demostración: vestido camisero celeste y puffer lila", caption: "Cumple de una amiga", sticker: "" },
      { image: "assets/lookbook/lb-05.svg", imageAlt: "Look de demostración: remera rayada, cargo verde y tote", caption: "Recital", sticker: "Combo fiel" },
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
    title: "Hacemos ropa para que te la bancás todo el día.",
    paragraphs: [
      "Somos una marca de ropa con onda, pensada para moverse: del laburo al plan de la noche, sin cambiarse tres veces.",
      "Este texto es de demostración: reemplazalo por la historia real de tu marca, cómo arrancó y qué la hace distinta.",
    ],
    image: "assets/lookbook/about.svg",
    imageAlt: "Ilustración de demostración: perchero con prendas de colores y un sol sonriente",
    sticker: "Hecho con onda",
  },

  faq: {
    title: "Dudas frecuentes",
    items: [
      { q: "¿Cómo hago un pedido?", a: "Elegí la prenda, el color y el talle, sumala a tu pedido y mandanos todo por WhatsApp. Ahí seguimos la charla." },
      { q: "¿Cómo sé qué talle me queda?", a: "Cada prenda muestra los talles que hay. Si dudás, escribinos con tus medidas y te damos una mano." },
      { q: "¿Hay stock de lo que veo?", a: "La disponibilidad que ves es orientativa. Cuando nos escribís, te confirmamos si está." },
      { q: "¿Cómo se paga?", a: "Los medios de pago los coordinamos por WhatsApp. Esta página no cobra ni procesa pagos." },
      { q: "¿Hacen envíos?", a: "Consultanos por WhatsApp si llegamos a tu zona. Te contamos las opciones y costos antes de que decidas." },
    ],
  },

  seo: {
    title: "Piola · Ropa con onda",
    description: "Ropa y accesorios con onda para todos los días. Mirá la tanda Verano 27, armá tu pedido y mandalo por WhatsApp.",
    url: "", // dominio real, ej. "https://www.tutienda.com.ar/" (vacío = sin canonical ni imagen social)
    image: "assets/hero/hero-main.svg",
    imageAlt: "Campaña de demostración de Piola",
    locale: "es_AR",
  },

  /* Secciones visibles, en orden. Quitar una clave la oculta. */
  sections: ["hero", "categories", "collection", "catalog", "pilcha", "lookbook", "benefits", "about", "faq"],
};
