/* ==========================================================================
   ALMATE · Demo Moda · config.moda.js
   ÚNICO archivo de contenido/identidad que se edita para adaptar la tienda.
   Los productos van en products.moda.js.

   IMPORTANTE: todos los datos son de DEMOSTRACIÓN (marca, textos, contacto,
   precios y horarios). Reemplazarlos por datos reales y autorizados del
   local antes de publicar. No inventar teléfonos, dominios ni políticas
   comerciales que no existan.
   ========================================================================== */
const MODA_CONFIG = {

  /* Marca la demo como contenido de muestra. En una entrega real, dejar en
     true hasta validar datos; no afecta el renderizado. */
  demo: true,

  /* Carpeta base de las imágenes (relativa a /demo-moda/). */
  assetBase: "assets/",

  brand: {
    name: "ALMATE",
    wordmark: "ALMATE",
    tagline: "Indumentaria contemporánea",
    description: "Prendas y accesorios de líneas simples, pensados para el día a día.",
    logo: "", // opcional: ruta a un logo en imagen; vacío = wordmark tipográfico
  },

  /* Paleta editorial: carbón, blanco cálido, piedra, arena y gris. */
  theme: {
    charcoal: "#171717",
    offwhite: "#faf9f6",
    stone: "#e9e7e2",
    sand: "#d8cbb8",
    grey: "#6f6b66", // "gris tipográfico" (el #77736e de referencia, apenas oscurecido para contraste AA)
    line: "#e4e1da",
  },

  /* Tipografías: una serif editorial para titulares y una sans para el texto. */
  fonts: {
    display: '"Iowan Old Style", "Palatino Linotype", Palatino, "Playfair Display", Georgia, "Times New Roman", serif',
    body: '"Inter", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },

  /* Contacto de DEMOSTRACIÓN. Reemplazar antes de publicar. */
  contact: {
    whatsapp: "5491130000000", // número de demostración — reemplazar
    instagram: "https://instagram.com/amara.demo",
    email: "hola@almate.demo",
    address: "Showroom · Recoleta, Buenos Aires",
    hours: "Lun a Sáb · 10 a 20 h",
  },

  announcement: {
    enabled: true,
    text: "Nueva colección 2027 · 10% OFF en tu primera compra · Consultá por WhatsApp",
    link: "", // opcional
  },

  /* Navegación. `anchor` lleva a una sección; `filter` aplica un filtro del
     catálogo (gender, category o sale). */
  navigation: [
    { label: "Nueva colección", anchor: "#coleccion" },
    { label: "Mujer", filter: { gender: "mujer" } },
    { label: "Hombre", filter: { gender: "hombre" } },
    { label: "Accesorios", filter: { category: "accesorios" } },
    { label: "Sale", filter: { sale: true } },
  ],

  hero: {
    eyebrow: "Nueva temporada Verano 2027",
    title: "Vestirse también es una forma de expresión.",
    subtitle: "Descubrí prendas pensadas para acompañar tu estilo.",
    image: "assets/hero/hero-main.webp",
    imageAlt: "Campaña editorial de la nueva temporada",
    ctaLabel: "Explorar colección",
    ctaAnchor: "#catalogo",
  },

  categories: {
    title: "Explorá por categoría",
    subtitle: "Encontrá lo que buscás en un vistazo.",
    items: [
      { id: "mujer", name: "Mujer", image: "assets/categories/cat-mujer.svg", imageAlt: "Colección mujer", filter: { gender: "mujer" } },
      { id: "hombre", name: "Hombre", image: "assets/categories/cat-hombre.svg", imageAlt: "Colección hombre", filter: { gender: "hombre" } },
      { id: "abrigos", name: "Abrigos", image: "assets/categories/cat-abrigos.svg", imageAlt: "Abrigos y tapados", filter: { category: "abrigos" } },
      { id: "remeras", name: "Remeras", image: "assets/categories/cat-remeras.svg", imageAlt: "Remeras y básicos", filter: { category: "remeras" } },
      { id: "pantalones", name: "Pantalones", image: "assets/categories/cat-pantalones.svg", imageAlt: "Pantalones", filter: { category: "pantalones" } },
      { id: "accesorios", name: "Accesorios", image: "assets/categories/cat-accesorios.svg", imageAlt: "Accesorios", filter: { category: "accesorios" } },
    ],
  },

  collection: {
    eyebrow: "Colección esencial",
    title: "Prendas versátiles para todos los días.",
    description: "Una selección de básicos y piezas clave que se combinan entre sí.",
    image: "assets/lookbook/lb-02.svg",
    imageAlt: "Campaña de la colección esencial",
    ctaLabel: "Ver colección",
    ctaAnchor: "#catalogo",
    productIds: [], // vacío = usa los productos destacados
  },

  catalog: {
    title: "Nuestras prendas",
    subtitle: "Encontrá nuevas formas de expresar tu estilo.",
  },

  lookbook: {
    title: "The Lookbook",
    subtitle: "Una selección de estilos para inspirarte.",
    items: [
      { image: "assets/lookbook/lb-01.svg", imageAlt: "Look monocromático en capas", caption: "Monocromo" },
      { image: "assets/lookbook/lb-02.svg", imageAlt: "Outfit en tonos tierra", caption: "Tonos tierra" },
      { image: "assets/lookbook/lb-03.svg", imageAlt: "Dos looks coordinados en neutros", caption: "Coordinados" },
      { image: "assets/lookbook/lb-04.svg", imageAlt: "Detalle de tejidos en capas", caption: "Texturas" },
    ],
  },

  benefits: {
    title: "Cómo trabajamos",
    items: [
      { title: "Atención personalizada", text: "Te asesoramos por WhatsApp para elegir talle y color." },
      { title: "Asesoramiento de talles", text: "Consultá medidas y guías antes de decidir." },
      { title: "Disponibilidad al momento", text: "Confirmamos cada prenda antes de coordinar." },
      { title: "Consultas sin compromiso", text: "Escribinos y respondemos tus dudas." },
    ],
  },

  about: {
    eyebrow: "Nuestra identidad",
    title: "Prendas con intención.",
    paragraphs: [
      "Creemos en piezas de líneas simples que acompañan todos los días, sin ruido.",
      "Trabajamos con tejidos cuidados y terminaciones pensadas para durar. Este texto es de demostración: reemplazalo por la historia real de tu tienda.",
    ],
    image: "assets/lookbook/lb-01.svg",
    imageAlt: "Editorial de la marca",
  },

  faq: {
    title: "Preguntas frecuentes",
    items: [
      { q: "¿Cómo puedo consultar por una prenda?", a: "Elegí la prenda, el color y el talle, y envianos el pedido por WhatsApp. Te respondemos con disponibilidad." },
      { q: "¿Cómo sé qué talle elegir?", a: "Cada prenda muestra sus talles disponibles. Si tenés dudas, escribinos y te ayudamos con las medidas." },
      { q: "¿Cómo consulto disponibilidad?", a: "La disponibilidad se confirma al momento de la consulta, antes de coordinar la entrega." },
      { q: "¿Cuáles son los medios de pago?", a: "Consultá los medios disponibles al confirmar tu pedido. No publicamos condiciones que puedan cambiar." },
      { q: "¿Realizan envíos?", a: "Consultanos por envíos y zonas de entrega. No prometemos plazos ni costos que no estén confirmados." },
    ],
  },

  seo: {
    title: "AMARA · Indumentaria contemporánea",
    description: "Prendas y accesorios de líneas simples para el día a día. Explorá el catálogo, elegí color y talle, y consultá por WhatsApp.",
    url: "", // dominio real, ej. "https://www.amara.com.ar/" (vacío = sin canonical ni imagen social)
    image: "assets/hero/hero-main.svg",
    imageAlt: "Campaña editorial de AMARA",
    locale: "es_AR",
  },

  /* Secciones visibles, en orden. Quitar una clave la oculta. */
  sections: ["hero", "categories", "collection", "catalog", "lookbook", "benefits", "about", "faq"],
};
