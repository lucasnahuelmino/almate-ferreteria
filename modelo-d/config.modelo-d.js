/* ALMATE · Modelo D · Catálogo Comercial
   Editá esta configuración para adaptar contenido, marca y presentación.
   No cargues precios, disponibilidad ni afirmaciones que el comercio no haya confirmado.
   Sincronizá el SEO estático con: node modelo-d/tools/sync-seo.js */
const MODELO_D_CONFIG = {

  sections: ["hero", "categories", "featured", "catalog", "consultation", "about", "process", "faq", "contact"],

  assetBase: "../img/",

  brand: {
    name: "FREN Ferreterías",
    short: "FREN",
    tagline: "Catálogo de productos",
    description: "Ferretería de barrio en Quilmes.",
  },

  theme: {
    ink: "#171b20",
    paper: "#f5f7fa",
    steel: "#252c34",
    accent: "#1769ff",
    accentInk: "#ffffff",
    accentWarm: "#f27632",
    accentWarmInk: "#171b20",
    muted: "#b5bec8",
    mutedInk: "#505b67",
    line: "#39434e",
    lineLight: "#d5dce4",
  },
  fonts: {
    display: '"Inter", "Segoe UI", sans-serif',
    body: '"Manrope", "Segoe UI", sans-serif',
  },

  seo: {
    title: "FREN Ferreterías | Catálogo de productos",
    description: "Explorá el catálogo de productos de FREN Ferreterías y prepará una consulta.",
    url: "",
    image: "hero-ferreteria.jpg",
    imageAlt: "Estantería de herramientas y materiales de ferretería",
    locale: "es_AR",
    schemaType: "HardwareStore",
  },

  navigation: {
    labels: {
      hero: "Inicio",
      categories: "Rubros",
      catalog: "Catálogo",
      about: "Nosotros",
      process: "Cómo trabajamos",
      gallery: "Galería",
      faq: "Preguntas",
      consultation: "Mi consulta",
      contact: "Contacto",
    },
  },

  header: {
    utility: "Quilmes · Lun a Sáb",
    cta: {
      label: "Ver mi consulta",
      type: "anchor",
      value: "#consulta",
    },
  },

  hero: {
    eyebrow: "Ferretería · Quilmes",
    titleLines: ["Productos", "para cada", "proyecto"],
    accentIndex: 2,
    lead: "Explorá productos, compará opciones y prepará una consulta para conversar con el comercio.",
    image: "hero-ferreteria.jpg",
    imageAlt: "Estantería de herramientas y materiales de ferretería",
    badge: "",
    meta: [],
    primaryCta: {
      label: "Explorar catálogo",
      type: "anchor",
      value: "#catalogo",
    },
    secondaryCta: { label: "Ver categorías", type: "anchor", value: "#rubros" },
  },

  currency: { locale: "es-AR", code: "ARS" },
  display: { showSku: true, showBrand: true, showAvailability: true, showPrices: true },

  categories: [
    { id: "herramientas-manuales", name: "Herramientas manuales", image: "categoria-herramientas-manuales.jpg", alt: "Herramientas manuales", order: 1 },
    { id: "herramientas-electricas", name: "Herramientas eléctricas", image: "categoria-herramientas-electricas.jpg", alt: "Herramientas eléctricas", order: 2 },
    { id: "construccion", name: "Construcción", image: "categoria-construccion.jpg", alt: "Materiales de construcción", order: 3 },
    { id: "plomeria-sanitarios", name: "Plomería y sanitarios", image: "categoria-plomeria.jpg", alt: "Caños y conexiones de plomería", order: 4 },
    { id: "electricidad", name: "Electricidad", image: "categoria-electricidad.jpg", alt: "Materiales de electricidad", order: 5 },
    { id: "pinturas", name: "Pinturas", image: "categoria-pinturas.jpg", alt: "Pinturas y accesorios", order: 6 },
  ],
  categoriesSection: {
    label: "01 / Rubros",
    title: "Explorá por categoría",
    lead: "Elegí un rubro para filtrar los productos disponibles en este catálogo.",
  },
  featured: { label: "02 / Selección", title: "Productos destacados", lead: "", limit: 6 },
  catalog: {
    label: "03 / Catálogo",
    title: "Encontrá lo que buscás",
    lead: "Los precios y la disponibilidad se muestran solo cuando fueron informados por el comercio.",
    searchPlaceholder: "Buscar por producto, código o marca",
    emptyText: "Todavía no hay productos publicados. Consultá al comercio para conocer su oferta.",
    products: [],
  },
  consultation: {
    label: "04 / Consulta",
    title: "Tu lista de consulta",
    lead: "Prepará una lista para compartirla con el comercio. Esto no confirma una compra ni reserva productos.",
    storageKey: "almate-modelo-d-consultation",
    persist: true,
  },

  about: {
    label: "05 / El comercio",
    title: "Atención y asesoramiento",
    lead: "Contactá al comercio para consultar por productos, alternativas y condiciones.",
    paragraphs: [],
    image: "about-local.jpg",
    imageAlt: "Empleado ordenando estanterías de herramientas",
    specs: [],
  },

  process: {
    label: "06 / Cómo consultar",
    title: "Una consulta, paso a paso",
    lead: "La lista sirve para organizar una consulta; la disponibilidad y condiciones se confirman con el comercio.",
    items: [
      {
        number: "01",
        title: "Elegí productos",
        description: "Sumá a la lista los artículos que querés consultar.",
      },
      {
        number: "02",
        title: "Compartí la consulta",
        description: "Enviá la lista al comercio por WhatsApp para conversar los detalles.",
      },
      {
        number: "03",
        title: "Coordiná directamente",
        description: "Consultá con el comercio los pasos siguientes. La web no procesa compras.",
      },
    ],
  },

  gallery: {
    label: "04 / Galería",
    title: "El local, por dentro.",
    lead: "Estanterías, depósito y mostrador. Un vistazo antes de venir.",
    items: [
      { src: "galeria-01.jpg", alt: "Estantería completa de herramientas manuales", caption: "Herramientas" },
      { src: "galeria-02.jpg", alt: "Mostrador de atención al cliente", caption: "Mostrador" },
      { src: "galeria-03.jpg", alt: "Sector de pinturas y esmaltes", caption: "Pinturas" },
      { src: "galeria-04.jpg", alt: "Depósito de materiales de construcción", caption: "Depósito" },
      { src: "galeria-05.jpg", alt: "Vidriera exterior del local", caption: "Vidriera" },
      { src: "galeria-06.jpg", alt: "Asesoramiento a un cliente sobre herramientas eléctricas", caption: "Asesoramiento" },
    ],
  },

  faq: {
    label: "05 / Preguntas",
    title: "Antes de venir.",
    items: [
      {
        q: "¿Puedo consultar disponibilidad antes de ir?",
        a: "La disponibilidad no se informa automáticamente. Consultá al comercio antes de acercarte.",
      },
      {
        q: "¿Hacen envíos?",
        a: "Consultá directamente al comercio por las opciones disponibles.",
      },
      {
        q: "¿Atienden a cuentas corrientes o empresas?",
        a: "Consultá directamente al comercio por condiciones para compras recurrentes.",
      },
      {
        q: "¿Qué medios de pago aceptan?",
        a: "Consultá los medios disponibles al momento de la compra. No publicamos condiciones que puedan cambiar sin aviso.",
      },
    ],
  },

  contact: {
    label: "06 / Contacto",
    title: "Pasá por el local o escribinos.",
    lead: "Contanos qué necesitás. Si nos mandás una foto o una lista, mejor.",
    phone: "(011) 4250-2865",
    phoneHref: "tel:+541142502865",
    email: "info@frenferreterias.com.ar",
    whatsapp: "541142502865",
    whatsappMessage: "Hola FREN, quisiera realizar una consulta.",
    address: "Andrés Baranda 1309",
    locality: "Quilmes",
    region: "Buenos Aires",
    country: "AR",
    hours: "Lun. a Vie. 8:00 a 18:00 hs · Sáb. 8:00 a 13:00 hs",
    hoursSpec: [
      { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "18:00" },
      { days: ["Saturday"], opens: "08:00", closes: "13:00" },
    ],
    social: {
      instagram: "",
      facebook: "",
    },
    map: {
      enabled: true,
      query: "Andrés Baranda 1309, Quilmes",
      embedUrl: "",
      link: "",
    },
  },

  footer: {
    note: "Ferretería de barrio en Quilmes.",
    creditUrl: "",
    navigationLabel: "Navegación",
    contactLabel: "Contacto",
    copyrightLabel: "Todos los derechos reservados.",
  },
};
