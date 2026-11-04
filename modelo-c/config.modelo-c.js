/* ALMATE · Modelo C · Configuración para adaptar por cliente.
   Reemplazá los textos de ejemplo y agregá únicamente datos verificables.
   Las opiniones y los indicadores se muestran solo si se cargan aquí. */
const MODEL_C_CONFIG = {
  sections: [
    "hero", "trust", "services", "differentiators", "gallery", "process",
    "testimonials", "faq", "coverage", "finalCta", "contact",
  ],
  assetBase: "../img/",

  brand: {
    name: "Tu marca",
    description: "Soluciones y atención pensadas para cada necesidad.",
    logo: "",
    logoAlt: "",
  },

  colors: {
    ink: "#173B45",
    muted: "#52676B",
    paper: "#F5F8F7",
    surface: "#FFFFFF",
    line: "#D8E3E1",
    primary: "#145766",
    primaryText: "#FFFFFF",
    accent: "#B84225",
    accentText: "#FFFFFF",
    accentSoft: "#F9E7E1",
  },

  fonts: {
    display: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    body: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },

  seo: {
    title: "Tu marca | Soluciones y servicios",
    description: "Información y contacto de Tu marca.",
    url: "", // URL canónica pública de esta página, terminada en "/".
    image: "", // Imagen social absoluta o dentro de assetBase; solo si hay derechos de uso.
    locale: "es_AR",
  },

  contact: {
    phone: "",
    phoneHref: "",
    email: "",
    whatsapp: "", // Solo dígitos, con código de país; ej. 5491112345678.
    whatsappMessage: "Hola, quisiera hacer una consulta.",
    address: "",
    locality: "",
    hours: "",
    social: {
      instagram: "",
      facebook: "",
      linkedin: "",
    },
  },

  navigation: {
    cta: { label: "Hablemos", type: "contact", url: "", message: "" },
    labels: {
      hero: "Inicio",
      trust: "Confianza",
      services: "Servicios",
      differentiators: "Diferenciales",
      gallery: "Proyectos",
      process: "Proceso",
      testimonials: "Opiniones",
      faq: "Preguntas",
      coverage: "Cobertura",
      finalCta: "Consultar",
      contact: "Contacto",
    },
  },

  hero: {
    eyebrow: "Atención personalizada",
    title: "Una solución clara para lo que necesitás.",
    highlight: "",
    description: "Contanos qué estás buscando y conocé las opciones disponibles.",
    image: "",
    imageAlt: "",
    primary: { label: "Hacer una consulta", type: "contact", url: "", message: "" },
    secondary: { label: "Conocer servicios", target: "services" },
    trustNote: "",
  },

  trust: {
    title: "Confianza que se construye con hechos",
    items: [], // Agregar solo años, cifras, coberturas o certificaciones comprobables.
  },

  services: {
    eyebrow: "Qué ofrecemos",
    title: "Soluciones para avanzar",
    description: "Reemplazá este texto con una descripción concreta de la oferta.",
    items: [
      {
        name: "Servicio o solución 1",
        description: "Describí qué ofrecés y qué necesidad ayuda a resolver.",
        image: "",
        alt: "",
        cta: { label: "", type: "whatsapp", url: "", message: "" },
      },
      {
        name: "Servicio o solución 2",
        description: "Destacá la información que ayuda a elegir con claridad.",
        image: "",
        alt: "",
        cta: { label: "", type: "whatsapp", url: "", message: "" },
      },
      {
        name: "Servicio o solución 3",
        description: "Editá o quitá esta tarjeta según la oferta real del negocio.",
        image: "",
        alt: "",
        cta: { label: "", type: "whatsapp", url: "", message: "" },
      },
    ],
  },

  differentiators: {
    eyebrow: "Por qué elegirnos",
    title: "Una forma de trabajar que suma",
    items: [], // Configurar entre 3 y 6 diferenciales verificables antes de publicar.
  },

  gallery: {
    eyebrow: "Nuestro trabajo",
    title: "Proyectos y espacios",
    description: "",
    items: [], // Cada foto requiere derechos de uso y un alt descriptivo.
  },

  process: {
    eyebrow: "Cómo funciona",
    title: "Un camino simple para empezar",
    description: "Editá los pasos para que reflejen el proceso real de contratación.",
    steps: [
      { title: "Contacto", description: "Contanos qué estás buscando." },
      { title: "Evaluación", description: "Conversamos sobre la necesidad y las opciones." },
      { title: "Propuesta", description: "Recibís la información o presupuesto correspondiente." },
      { title: "Próximo paso", description: "Acordamos cómo avanzar." },
    ],
  },

  testimonials: {
    eyebrow: "Experiencias",
    title: "Lo que cuentan quienes nos eligen",
    items: [], // Solo incluir testimonios reales, autorizados y atribuibles.
  },

  faq: {
    eyebrow: "Preguntas frecuentes",
    title: "Resolvamos tus dudas",
    items: [],
  },

  coverage: {
    eyebrow: "Dónde estamos",
    title: "Cobertura y atención",
    description: "",
    localities: [],
    address: "",
    area: "",
    mapUrl: "",
    mapsUrl: "",
  },

  finalCta: {
    eyebrow: "Siguiente paso",
    title: "¿Lo conversamos?",
    description: "Escribinos para contarnos qué necesitás y recibir más información.",
    button: { label: "Hacer una consulta", type: "contact", url: "", message: "" },
  },

  contactSection: {
    eyebrow: "Contacto",
    title: "Hablemos",
    description: "Elegí el canal que te resulte más cómodo.",
  },

  footer: {
    navigationLabel: "Navegación",
    creditUrl: "",
  },
};
