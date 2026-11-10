/* ==========================================================================
   ALMATE · MODELO B — PREMIUM · config.premium.js
   ÚNICO archivo a editar para adaptar este modelo a otro negocio.

   Los valores faltantes o inválidos NO rompen el sitio: config-core.js los
   reemplaza por valores seguros y avisa en la consola del navegador
   ("[ALMATE Premium] …"). Revisá la consola (F12) después de editar.
   Después de cambiar nombre, SEO, hero o dominio: node modelo-b/tools/sync-seo.js

   Bloques: sections · brand · seo · contact · colors · fonts · hero ·
   about · services · gallery · testimonials · location · footer.

   El contenido actual es de DEMOSTRACIÓN (tomado de la demo de ferretería
   del Modelo A). Reemplazarlo por datos reales del cliente.
   ========================================================================== */
const PREMIUM_CONFIG = {

  /* Secciones habilitadas, EN ORDEN. Quitar una línea la oculta del sitio
     y del menú. Valores posibles: hero, about, services, gallery,
     testimonials, location. */
  sections: ["hero", "about", "services", "gallery", "testimonials", "location"],

  /* Carpeta base de las imágenes (relativa a /modelo-b/). */
  assetBase: "../img/",

  brand: {
    name: "FREN Ferreterías",
    description: "Ferretería de barrio en Quilmes.",
    // Logo (opcional). Copiar el archivo a img/ y escribir aquí el nombre de
    // archivo (relativo a assetBase) + el texto alternativo. Sin logo, o si la
    // imagen no carga, se muestra el nombre comercial en texto.
    logo: "logo_local.png",
    logoAlt: "Logo de FREN Ferreterías",
  },

  /* SEO. Los buscadores y las redes leen el <head> ESTÁTICO de index.html
     (no ejecutan este archivo). Se sincroniza con: node modelo-b/tools/sync-seo.js
     (o a mano, ver README). El motor solo AVISA en consola si no coinciden. */
  seo: {
    title: "FREN Ferreterías | Quilmes",
    description:
      "FREN Ferreterías. Herramientas, materiales, bulonería, electricidad, plomería y más en Quilmes.",
    url: "",            // URL pública de ESTA página, terminada en "/", ej. "https://www.minegocio.com.ar/modelo-b/"
                        // (vacío = no se emiten canonical, og:url ni imagen social)
    image: "hero-ferreteria.jpg",
    locale: "es_AR",
    schemaType: "HardwareStore", // LocalBusiness, Store, RealEstateAgent, ProfessionalService…
  },

  contact: {
    phone: "(011) 4250-2865",
    phoneHref: "tel:+541142502865",
    email: "info@frenferreterias.com.ar",
    address: "Andrés Baranda 1309",
    locality: "Quilmes",
    hours: "Lun. a Vie. 8:00 a 18:00 hs · Sáb. 8:00 a 13:00 hs",
    // Para datos estructurados (Google). Días en inglés, formato schema.org.
    hoursSpec: [
      { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "18:00" },
      { days: ["Saturday"], opens: "08:00", closes: "13:00" },
    ],
    whatsapp: "541142502865", // solo números, con código de país
    whatsappMessage: "Hola, quisiera realizar una consulta.",
    // Mapa: show=false lo oculta. query = dirección a buscar. embedUrl (https) reemplaza a query.
    // externalUrl = enlace "Cómo llegar" (opcional). Sin query ni embedUrl no se muestra.
    map: { show: true, query: "Andrés Baranda 1309, Quilmes", embedUrl: "", externalUrl: "" },
    social: { instagram: "", facebook: "" }, // vacío = no se muestra
  },

  /* Paleta. Se vuelca a variables CSS al cargar. */
  colors: {
    ink: "#1c1b19",         // carbón / grafito profundo
    graphite: "#2a2926",    // superficies oscuras
    paper: "#faf7f2",       // blanco roto
    ivory: "#f1ebdf",       // marfil
    sand: "#e3d8c4",        // arena
    bronze: "#a5814f",      // bronce (detalles, líneas)
    bronzeText: "#7a5c31",  // bronce oscuro para texto sobre fondos claros (contraste AA)
    champagne: "#d8c4a0",   // champagne (acentos sobre fondos oscuros)
    muted: "#6b665c",       // texto secundario
  },

  /* Tipografías. Las actuales están AUTOALOJADAS en modelo-b/fonts/ (licencia SIL OFL).
     Si cambiás de familia, agregá sus @font-face en fonts/fonts.css (ver README). */
  fonts: {
    display: '"Cormorant Garamond", "Iowan Old Style", Georgia, serif',
    body: '"Inter", -apple-system, "Segoe UI", Roboto, sans-serif',
  },

  hero: {
    eyebrow: "Ferretería · Quilmes",
    title: "Todo para tu hogar",
    titleAccent: "y tu proyecto.",
    subtitle:
      "Herramientas, materiales y atención personalizada en el corazón de Quilmes.",
    image: "hero-ferreteria.jpg",
    imageAlt: "Estantería de herramientas y materiales",
    ctaPrimary: "Consultar por WhatsApp",
    ctaSecondary: "Ver rubros",
    ctaSecondaryTarget: "services", // clave de sección a la que lleva
  },

  about: {
    navLabel: "Nosotros",
    label: "Quiénes somos",
    title: "Del mostrador a la obra.",
    paragraphs: [
      "Stock real, precios claros y alguien detrás del mostrador que sabe de qué está hablando.",
      "No vendemos solamente productos. Resolvemos el problema que trajiste.",
    ],
    image: "about-local.jpg",
    imageAlt: "Empleado ordenando estanterías de herramientas",
  },

  services: {
    navLabel: "Rubros",
    label: "Nuestros rubros",
    title: "Todo bajo un mismo techo",
    // price es opcional: omitirlo si el negocio no publica precios.
    items: [
      { name: "Herramientas manuales", description: "Martillos, destornilladores, llaves y todo lo que no falla nunca.", image: "categoria-herramientas-manuales.jpg", alt: "Herramientas manuales" },
      { name: "Herramientas eléctricas", description: "Taladros, amoladoras y equipos de las mejores marcas.", image: "categoria-herramientas-electricas.jpg", alt: "Taladro y amoladora eléctrica" },
      { name: "Materiales de construcción", description: "Cemento, arena, ladrillos y todo lo necesario para la obra gruesa.", image: "categoria-construccion.jpg", alt: "Materiales de construcción" },
      { name: "Plomería y sanitarios", description: "Caños, conexiones, grifería y repuestos.", image: "categoria-plomeria.jpg", alt: "Caños y conexiones de plomería" },
      { name: "Electricidad", description: "Cables, llaves térmicas, tomas y todo para instalaciones seguras.", image: "categoria-electricidad.jpg", alt: "Cables y llaves térmicas" },
      { name: "Pinturas y accesorios", description: "Látex, esmaltes, pinceles y rodillos para terminar como corresponde.", image: "categoria-pinturas.jpg", alt: "Latas de pintura" },
    ],
  },

  gallery: {
    navLabel: "Galería",
    label: "Galería",
    title: "Un vistazo al lugar",
    items: [
      { src: "galeria-01.jpg", alt: "Estantería completa de herramientas manuales" },
      { src: "galeria-02.jpg", alt: "Mostrador de atención al cliente" },
      { src: "galeria-03.jpg", alt: "Sector de pinturas y esmaltes" },
      { src: "galeria-04.jpg", alt: "Depósito de materiales de construcción" },
      { src: "galeria-05.jpg", alt: "Vidriera exterior" },
      { src: "galeria-06.jpg", alt: "Asesoramiento a un cliente sobre herramientas eléctricas" },
    ],
  },

  /* Solo testimonios REALES y autorizados por el cliente.
     Formato: { text: "…", author: "Nombre Apellido", role: "opcional" }
     Con la lista vacía, la sección no se muestra (aunque esté en `sections`). */
  testimonials: {
    navLabel: "Opiniones",
    label: "Opiniones",
    title: "Lo que dicen nuestros clientes",
    items: [],
  },

  location: {
    navLabel: "Contacto",
    label: "Encontranos",
    title: "Visitanos o escribinos",
  },

  /* El crédito "Desarrollado por ALMATE · Soluciones digitales" es obligatorio y
     fijo (no se configura). Solo se puede agregar un enlace. */
  footer: {
    creditUrl: "", // opcional: link de ALMATE (https://…)
  },
};
