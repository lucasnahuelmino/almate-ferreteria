/* ==========================================================================
   ALMATE · Demo Polirrubro · config.moda.js
   Contenido/identidad de la tienda polirrubro. Productos en products.moda.js.
   ========================================================================== */
const MODA_CONFIG = {

  demo: true,
  assetBase: "assets/",

  brand: {
    name: "ALMATE",
    wordmark: "ALMATE",
    tagline: "Un poco de todo. Todo con onda.",
    description: "Tienda polirrubro con productos de bazar, hogar, electrónica, tecnología, juguetes, accesorios y más. Encontrá ese cosito que estabas buscando.",
    logo: "",
  },

  theme: {
    ink: "#1c1b22",
    paper: "#fff7ee",
    sky: "#3b82f6",
    sun: "#fbbf24",
    pink: "#ff4d6d",
    lime: "#a3e635",
    lilac: "#a78bfa",
    orange: "#ff6b35",
    grey: "#5f5a7a",
  },

  fonts: {
    display: '"Bricolage Grotesque", "Arial Rounded MT Bold", "Trebuchet MS", system-ui, sans-serif',
    body: '"DM Sans", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },

  contact: {
    whatsapp: "5491134761743",
    instagram: "",
    email: "",
    address: "",
    hours: "",
  },

  announcement: {
    enabled: true,
    text: "¿Lo necesitás? Probablemente lo tenemos · Consultá por WhatsApp",
    items: ["¿Lo necesitás? Probablemente lo tenemos", "Cosas que no sabías que necesitabas", "Entraste a mirar y saliste con tres cosas. Clásico", "Pequeñas compras, grandes alegrías"],
    link: "",
  },

  navigation: [
    { label: "Inicio", anchor: "#inicio" },
    { label: "Categorías", anchor: "#categorias" },
    { label: "Catálogo", anchor: "#catalogo" },
    { label: "Cómo comprar", anchor: "#beneficios" },
    { label: "Contacto", anchor: "#contacto" },
  ],

  hero: {
    eyebrow: "Tienda polirrubro · ALMATE",
    title: "Un poco de todo. Todo con onda.",
    highlight: "Todo con onda.",
    subtitle: "Bazar, hogar, electrónica, tecnología, juguetes, accesorios y más. Encontrá ese cosito que estabas buscando, o cinco.",
    image: "assets/products/8624.jpg",
    imageAlt: "Productos variados de la tienda ALMATE",
    ctaLabel: "Explorar productos",
    ctaAnchor: "#catalogo",
    ctaSecondaryLabel: "Ver categorías",
    ctaSecondaryAnchor: "#categorias",
    badge: "ALMATE",
    stickers: [
      { text: "¿Lo necesitás?", tone: "sun" },
      { text: "Lo tenemos", tone: "lime" },
      { text: "O cinco", tone: "pink" },
    ],
    collage: [],
  },

  categories: {
    title: "Explorá por categoría",
    subtitle: "Tocá una categoría y filtrá el catálogo al instante.",
    items: [
  {
    "id": "bazar",
    "name": "Bazar",
    "image": "assets/products/8624.jpg",
    "imageAlt": "Bazar",
    "filter": {
      "category": "bazar"
    },
    "tone": "sky"
  },
  {
    "id": "cocinas",
    "name": "Cocinas",
    "image": "assets/products/10000.jpg",
    "imageAlt": "Cocinas",
    "filter": {
      "category": "cocinas"
    },
    "tone": "sun"
  },
  {
    "id": "belleza-y-cuidado-personal",
    "name": "Belleza Y Cuidado Personal",
    "image": "assets/products/R-995.jpg",
    "imageAlt": "Belleza Y Cuidado Personal",
    "filter": {
      "category": "belleza-y-cuidado-personal"
    },
    "tone": "pink"
  },
  {
    "id": "ventilacion",
    "name": "Ventilacion",
    "image": "assets/products/10016.jpg",
    "imageAlt": "Ventilacion",
    "filter": {
      "category": "ventilacion"
    },
    "tone": "lime"
  },
  {
    "id": "audio",
    "name": "Audio",
    "image": "assets/products/117962.jpg",
    "imageAlt": "Audio",
    "filter": {
      "category": "audio"
    },
    "tone": "orange"
  },
  {
    "id": "juguetes",
    "name": "Juguetes",
    "image": "assets/products/11148.jpg",
    "imageAlt": "Juguetes",
    "filter": {
      "category": "juguetes"
    },
    "tone": "lilac"
  },
  {
    "id": "celulares-y-accesorios",
    "name": "Celulares Y Accesorios",
    "image": "assets/products/10009.jpg",
    "imageAlt": "Celulares Y Accesorios",
    "filter": {
      "category": "celulares-y-accesorios"
    },
    "tone": "sky"
  },
  {
    "id": "herramientas",
    "name": "Herramientas",
    "image": "assets/products/10589.jpg",
    "imageAlt": "Herramientas",
    "filter": {
      "category": "herramientas"
    },
    "tone": "sun"
  },
  {
    "id": "salud-e-insumos-medicos",
    "name": "Salud E Insumos Medicos",
    "image": "assets/products/10293.jpg",
    "imageAlt": "Salud E Insumos Medicos",
    "filter": {
      "category": "salud-e-insumos-medicos"
    },
    "tone": "pink"
  },
  {
    "id": "electrodomesticos",
    "name": "Electrodomesticos",
    "image": "assets/products/10168.jpg",
    "imageAlt": "Electrodomesticos",
    "filter": {
      "category": "electrodomesticos"
    },
    "tone": "lime"
  },
  {
    "id": "bicicletas",
    "name": "Bicicletas",
    "image": "assets/products/11172.jpg",
    "imageAlt": "Bicicletas",
    "filter": {
      "category": "bicicletas"
    },
    "tone": "orange"
  },
  {
    "id": "tecnologia",
    "name": "Tecnologia",
    "image": "assets/products/10329.jpg",
    "imageAlt": "Tecnologia",
    "filter": {
      "category": "tecnologia"
    },
    "tone": "lilac"
  },
  {
    "id": "smart-tv-s",
    "name": "Smart Tv´s",
    "image": "assets/products/11054.jpg",
    "imageAlt": "Smart Tv´s",
    "filter": {
      "category": "smart-tv-s"
    },
    "tone": "sky"
  },
  {
    "id": "griferia",
    "name": "Griferia",
    "image": "assets/products/JQ-0034.jpg",
    "imageAlt": "Griferia",
    "filter": {
      "category": "griferia"
    },
    "tone": "sun"
  },
  {
    "id": "temporada-de-verano",
    "name": "Temporada De Verano",
    "image": "assets/products/10297.jpg",
    "imageAlt": "Temporada De Verano",
    "filter": {
      "category": "temporada-de-verano"
    },
    "tone": "pink"
  },
  {
    "id": "regreso-a-clases",
    "name": "¡Regreso A Clases!",
    "image": "assets/products/10427.jpg",
    "imageAlt": "¡Regreso A Clases!",
    "filter": {
      "category": "regreso-a-clases"
    },
    "tone": "lime"
  },
  {
    "id": "temporada-de-invierno",
    "name": "¡Temporada De Invierno!",
    "image": "assets/products/10783.jpg",
    "imageAlt": "¡Temporada De Invierno!",
    "filter": {
      "category": "temporada-de-invierno"
    },
    "tone": "orange"
  },
  {
    "id": "blanqueria-y-hogar",
    "name": "Blanqueria Y Hogar",
    "image": "assets/products/11160.jpg",
    "imageAlt": "Blanqueria Y Hogar",
    "filter": {
      "category": "blanqueria-y-hogar"
    },
    "tone": "lilac"
  },
  {
    "id": "akmi",
    "name": "Akmi",
    "image": "assets/products/1001.jpg",
    "imageAlt": "Akmi",
    "filter": {
      "category": "akmi"
    },
    "tone": "sky"
  },
  {
    "id": "durax",
    "name": "Durax",
    "image": "assets/products/11020.jpg",
    "imageAlt": "Durax",
    "filter": {
      "category": "durax"
    },
    "tone": "sun"
  },
  {
    "id": "limpieza",
    "name": "Limpieza",
    "image": "assets/products/94030.jpg",
    "imageAlt": "Limpieza",
    "filter": {
      "category": "limpieza"
    },
    "tone": "pink"
  }
],
  },

  collection: {
    eyebrow: "",
    title: "",
    description: "",
    image: "",
    imageAlt: "",
    ctaLabel: "",
    ctaAnchor: "#catalogo",
    productIds: [],
  },

  catalog: {
    title: "Nuestros productos",
    subtitle: "Buscá por nombre o código, filtrá por categoría y ordená como prefieras.",
    emptyText: "No encontramos productos con esos filtros. Probá limpiando la búsqueda.",
  },

  pilcha: {
    slots: [],
    title: "",
    subtitle: "",
    eyebrow: "",
  },

  lookbook: {
    title: "",
    subtitle: "",
    items: [],
  },

  benefits: {
    title: "Cómo comprar",
    items: [
      { title: "Elegí tus productos", text: "Navegá el catálogo, filtrá por categoría y sumá lo que necesitás a tu lista.", tone: "sky" },
      { title: "Armar la lista", text: "Ajustá cantidades y revisá el resumen antes de enviar.", tone: "sun" },
      { title: "Consultá por WhatsApp", text: "Enviás la lista y te respondemos con disponibilidad y precio final.", tone: "lime" },
      { title: "Coordinamos la entrega", text: "Acordamos pago y envío o retiro en el local.", tone: "pink" },
    ],
  },

  about: {
    eyebrow: "Sobre ALMATE",
    title: "Un poco de todo, con criterio.",
    paragraphs: [
      "ALMATE es una tienda polirrubro pensada para resolver lo cotidiano: bazar, hogar, electrónica, tecnología, juguetes, accesorios y mucho más en un solo lugar.",
      "Este es un sitio de demostración. Reemplazá estos textos, imágenes y datos de contacto por los reales de tu comercio antes de publicar.",
    ],
    image: "assets/products/8624.jpg",
    imageAlt: "Productos ALMATE",
    sticker: "Todo con onda",
  },

  faq: {
    title: "Preguntas frecuentes",
    items: [
      { q: "¿Cómo consulto por un producto?", a: "Sumalo a tu lista de consulta desde el catálogo y enviala por WhatsApp. Te respondemos con disponibilidad y precio." },
      { q: "¿Los precios son finales?", a: "Los precios publicados son orientativos. El precio final se confirma al momento de la consulta." },
      { q: "¿Hay envíos?", a: "Consultanos por envíos y zonas de entrega. Coordinamos según tu ubicación." },
      { q: "¿Puedo retirar en el local?", a: "Sí, coordinamos retiro en el local una vez confirmado el pedido." },
      { q: "¿Qué medios de pago aceptan?", a: "Consultá los medios disponibles al confirmar tu pedido." },
    ],
  },

  seo: {
    title: "ALMATE · Tienda polirrubro",
    description: "Tienda polirrubro con productos de bazar, hogar, electrónica, tecnología, juguetes y accesorios. Consultá por WhatsApp.",
    url: "",
    image: "assets/products/8624.jpg",
    imageAlt: "Tienda ALMATE polirrubro",
    locale: "es_AR",
  },

  tags: {},

  sections: ["hero", "categories", "catalog", "benefits", "about", "faq"],
};
