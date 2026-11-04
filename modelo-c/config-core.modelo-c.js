(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ModelCCore = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CREDIT = "Desarrollado por ALMATE · Soluciones digitales";
  const SECTION_KEYS = [
    "hero", "trust", "services", "differentiators", "gallery", "process",
    "testimonials", "faq", "coverage", "finalCta", "contact",
  ];
  const SECTION_ID = {
    hero: "inicio", trust: "confianza", services: "servicios",
    differentiators: "diferenciales", gallery: "proyectos", process: "proceso",
    testimonials: "testimonios", faq: "preguntas", coverage: "cobertura",
    finalCta: "consulta", contact: "contacto",
  };
  const DEFAULTS = {
    sections: SECTION_KEYS.slice(),
    assetBase: "../img/",
    brand: { name: "Nombre del negocio", description: "", logo: "", logoAlt: "" },
    colors: {
      ink: "#173B45", muted: "#52676B", paper: "#F5F8F7", surface: "#FFFFFF",
      line: "#D8E3E1", primary: "#145766", primaryText: "#FFFFFF",
      accent: "#B84225", accentText: "#FFFFFF", accentSoft: "#F9E7E1",
    },
    fonts: {
      display: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      body: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    },
    seo: { title: "", description: "", url: "", image: "", locale: "es_AR" },
    contact: {
      phone: "", phoneHref: "", email: "", whatsapp: "", whatsappMessage: "",
      address: "", locality: "", hours: "", social: {},
    },
    navigation: {
      cta: { label: "Hablemos", type: "contact", url: "", message: "" },
      labels: {
        hero: "Inicio", trust: "Confianza", services: "Servicios",
        differentiators: "Diferenciales", gallery: "Proyectos", process: "Proceso",
        testimonials: "Opiniones", faq: "Preguntas", coverage: "Cobertura",
        finalCta: "Consultar", contact: "Contacto",
      },
    },
    hero: {
      eyebrow: "", title: "Una solución clara para lo que necesitás.",
      highlight: "", description: "Contanos qué estás buscando y conocé cómo podemos ayudarte.",
      image: "", imageAlt: "",
      primary: { label: "Hacer una consulta", type: "contact", url: "", message: "" },
      secondary: { label: "Conocer servicios", target: "services" },
      trustNote: "",
    },
    trust: { title: "", items: [] },
    services: { eyebrow: "", title: "", description: "", items: [] },
    differentiators: { eyebrow: "", title: "", items: [] },
    gallery: { eyebrow: "", title: "", description: "", items: [] },
    process: { eyebrow: "", title: "", description: "", steps: [] },
    testimonials: { eyebrow: "", title: "", items: [] },
    faq: { eyebrow: "", title: "", items: [] },
    coverage: { eyebrow: "", title: "", description: "", localities: [], address: "", area: "", mapUrl: "", mapsUrl: "" },
    finalCta: {
      eyebrow: "", title: "¿Lo conversamos?",
      description: "Escribinos para contarnos qué necesitás y recibir más información.",
      button: { label: "Hacer una consulta", type: "contact", url: "", message: "" },
    },
    contactSection: { eyebrow: "", title: "Hablemos", description: "Elegí el canal que te resulte más cómodo." },
    footer: { navigationLabel: "Navegación", creditUrl: "" },
  };

  const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const esc = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char]));
  const text = (value, fallback, path, issues) => {
    if (value === undefined) return fallback;
    if (typeof value !== "string") {
      issues.push({ level: "warn", path, message: "Debe ser texto; se usa el valor predeterminado." });
      return fallback;
    }
    return value.trim();
  };
  const safeWebUrl = (value) => {
    if (typeof value !== "string" || !value.trim() || /[\u0000-\u0020\u007f]/.test(value)) return "";
    try {
      const url = new URL(value.trim());
      return !url.username && !url.password && (url.protocol === "https:" || url.protocol === "http:") ? url.href : "";
    } catch (error) {
      return "";
    }
  };
  const safeImagePath = (value) => {
    if (typeof value !== "string") return "";
    const path = value.trim();
    if (!path || path.length > 500 || /[\u0000-\u0020\u007f\\<>"'`]/.test(path) || path.startsWith("/")) return "";
    if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return safeWebUrl(path);
    return !/%(?:2e|2f|5c)/i.test(path) && path.split("/").every((part) => part !== ".." && part !== ".");
  };
  const validEmail = (value) => /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(value);
  const safePhoneHref = (value) => typeof value === "string" && /^tel:\+?[\d().\-\s]{6,25}$/.test(value.trim()) ? value.trim() : "";
  const safeMapUrl = (value) => {
    const url = safeWebUrl(value);
    if (!url || !url.startsWith("https://")) return "";
    try {
      const parsed = new URL(url);
      if (parsed.hostname === "www.google.com" && parsed.pathname.startsWith("/maps/embed")) return parsed.href;
      if (parsed.hostname === "maps.google.com" && parsed.pathname.startsWith("/maps")) return parsed.href;
      if (parsed.hostname === "www.openstreetmap.org" && parsed.pathname === "/export/embed.html") return parsed.href;
      return "";
    } catch (error) {
      return "";
    }
  };

  function normalize(user) {
    const issues = [];
    const cfg = JSON.parse(JSON.stringify(DEFAULTS));
    const warn = (path, message) => issues.push({ level: "warn", path, message });
    const err = (path, message) => issues.push({ level: "error", path, message });
    if (!isObject(user)) {
      err("config", "No se encontró una configuración válida; se muestran valores predeterminados.");
      return { cfg, issues, ok: false };
    }
    Object.keys(user).forEach((key) => {
      if (!(key in DEFAULTS)) warn(key, "Clave desconocida; se ignora.");
    });
    const objectAt = (parent, key, path) => {
      const value = parent[key];
      if (value === undefined) return {};
      if (!isObject(value)) {
        warn(path, "Debe ser un objeto; se usan valores predeterminados.");
        return {};
      }
      if (isObject(DEFAULTS[key])) Object.keys(value).forEach((child) => {
        if (!(child in DEFAULTS[key])) warn(`${path}.${child}`, "Clave desconocida; se ignora.");
      });
      return value;
    };
    const setTextFields = (source, target, keys, path) => {
      keys.forEach((key) => { target[key] = text(source[key], target[key], `${path}.${key}`, issues); });
    };
    const checkedList = (value, path) => {
      if (value === undefined) return [];
      if (!Array.isArray(value)) {
        warn(path, "Debe ser una lista; se ignora.");
        return [];
      }
      return value;
    };
    const dimension = (value, fallback, path) => {
      if (value === undefined) return fallback;
      if (Number.isInteger(value) && value > 0 && value <= 10000) return value;
      warn(path, "Debe ser un entero entre 1 y 10000; se usa la dimensión predeterminada.");
      return fallback;
    };
    const imagePath = (value, path) => {
      if (value === undefined || value === "") return "";
      if (safeImagePath(value)) return value.trim();
      warn(path, "Ruta de imagen no válida o insegura; se omite.");
      return "";
    };
    const action = (value, fallback, path) => {
      const input = isObject(value) ? value : {};
      if (value !== undefined && !isObject(value)) warn(path, "Debe ser un objeto de acción; se usa el valor predeterminado.");
      const result = {
        label: text(input.label, fallback.label, `${path}.label`, issues),
        type: text(input.type, fallback.type, `${path}.type`, issues),
        url: text(input.url, fallback.url, `${path}.url`, issues),
        message: text(input.message, fallback.message, `${path}.message`, issues),
      };
      if (!["contact", "whatsapp", "phone", "email", "url"].includes(result.type)) {
        warn(`${path}.type`, "Tipo de acción desconocido; se usa el valor predeterminado.");
        result.type = fallback.type;
      }
      if (result.type === "url" && !safeWebUrl(result.url)) {
        warn(`${path}.url`, "Debe ser una URL http(s) válida; se desactiva esta acción.");
        result.url = "";
      }
      return result;
    };

    if (user.sections !== undefined) {
      if (!Array.isArray(user.sections)) warn("sections", "Debe ser una lista de secciones; se usa el orden predeterminado.");
      else {
        const seen = new Set();
        cfg.sections = user.sections.filter((key) => {
          if (!SECTION_KEYS.includes(key)) { warn("sections", `Se ignora la sección desconocida "${String(key)}".`); return false; }
          if (seen.has(key)) { warn("sections", `Se ignora la sección repetida "${key}".`); return false; }
          seen.add(key);
          return true;
        });
      }
    }
    if (user.assetBase !== undefined) {
      const base = text(user.assetBase, cfg.assetBase, "assetBase", issues);
      const parentPrefix = base.startsWith("../") ? "../" : "";
      const remainder = base.slice(parentPrefix.length).replace(/\/+$/, "");
      if (base && !base.startsWith("//") && !/^[a-z][a-z0-9+.-]*:/i.test(base) &&
          !base.includes("\\") && safeImagePath(`${remainder}/asset`)) {
        cfg.assetBase = `${parentPrefix}${remainder}/`;
      }
      else warn("assetBase", "Ruta base de imágenes no válida; se usa ../img/.");
    }

    const brand = objectAt(user, "brand", "brand");
    setTextFields(brand, cfg.brand, ["name", "description", "logoAlt"], "brand");
    cfg.brand.logo = imagePath(brand.logo, "brand.logo");
    if (!cfg.brand.name || cfg.brand.name === "Nombre del negocio") {
      err("brand.name", "Configurá el nombre comercial real.");
      if (!cfg.brand.name) cfg.brand.name = DEFAULTS.brand.name;
    }

    const colors = objectAt(user, "colors", "colors");
    Object.keys(cfg.colors).forEach((key) => {
      if (colors[key] === undefined) return;
      if (typeof colors[key] === "string" && /^#[\da-f]{6}$/i.test(colors[key].trim())) cfg.colors[key] = colors[key].trim();
      else warn(`colors.${key}`, 'Debe ser un color hexadecimal de 6 dígitos; se usa el predeterminado.');
    });
    const fonts = objectAt(user, "fonts", "fonts");
    ["display", "body"].forEach((key) => {
      if (fonts[key] === undefined) return;
      if (typeof fonts[key] === "string" && /^[\w\s"',().-]{3,200}$/.test(fonts[key])) cfg.fonts[key] = fonts[key].trim();
      else warn(`fonts.${key}`, "Familia tipográfica no válida; se usa la predeterminada.");
    });

    const seo = objectAt(user, "seo", "seo");
    setTextFields(seo, cfg.seo, ["title", "description", "image", "locale"], "seo");
    cfg.seo.image = imagePath(seo.image, "seo.image");
    if (!cfg.seo.title) cfg.seo.title = cfg.brand.name;
    if (!cfg.seo.description) cfg.seo.description = cfg.brand.description;
    if (seo.url) {
      const url = safeWebUrl(seo.url);
      if (url && /^https?:\/\/[^/]+(?:\/.*\/|\/)$/.test(url)) cfg.seo.url = url;
      else warn("seo.url", 'Usá una URL http(s) absoluta terminada en "/"; se omite el canonical.');
    }
    if (cfg.seo.locale && !/^[a-z]{2}_[A-Z]{2}$/.test(cfg.seo.locale)) {
      warn("seo.locale", "Formato esperado es_AR; se usa es_AR.");
      cfg.seo.locale = "es_AR";
    }

    const contact = objectAt(user, "contact", "contact");
    setTextFields(contact, cfg.contact, ["phone", "phoneHref", "email", "whatsapp", "whatsappMessage", "address", "locality", "hours"], "contact");
    if (cfg.contact.email && !validEmail(cfg.contact.email)) {
      warn("contact.email", "Email no válido; se omite.");
      cfg.contact.email = "";
    }
    const digits = cfg.contact.phone.replace(/\D/g, "");
    const international = cfg.contact.phone.trim().startsWith("+");
    const configuredPhoneHref = safePhoneHref(cfg.contact.phoneHref);
    if (cfg.contact.phoneHref && !configuredPhoneHref) warn("contact.phoneHref", "Enlace telefónico no válido; se deriva desde contact.phone.");
    cfg.contact.phoneHref = configuredPhoneHref || (digits.length >= 6 ? `tel:${international ? "+" : ""}${digits}` : "");
    const wa = cfg.contact.whatsapp.replace(/[\s+()-]/g, "");
    if (cfg.contact.whatsapp && /^\d{8,15}$/.test(wa)) cfg.contact.whatsapp = wa;
    else {
      if (cfg.contact.whatsapp) warn("contact.whatsapp", "Usá entre 8 y 15 dígitos con código de país; WhatsApp se desactiva.");
      cfg.contact.whatsapp = "";
    }
    const social = objectAt(contact, "social", "contact.social");
    cfg.contact.social = {};
    Object.keys(social).forEach((key) => {
      if (!social[key]) return;
      const url = safeWebUrl(social[key]);
      if (url && /^[a-z][a-z0-9_-]{1,30}$/i.test(key)) cfg.contact.social[key] = url;
      else warn(`contact.social.${key}`, "Red social o URL no válida; se omite.");
    });

    const navigation = objectAt(user, "navigation", "navigation");
    cfg.navigation.cta = action(navigation.cta, cfg.navigation.cta, "navigation.cta");
    const labels = objectAt(navigation, "labels", "navigation.labels");
    Object.keys(cfg.navigation.labels).forEach((key) => {
      cfg.navigation.labels[key] = text(labels[key], cfg.navigation.labels[key], `navigation.labels.${key}`, issues);
    });
    const hero = objectAt(user, "hero", "hero");
    setTextFields(hero, cfg.hero, ["eyebrow", "title", "highlight", "description", "imageAlt", "trustNote"], "hero");
    cfg.hero.image = imagePath(hero.image, "hero.image");
    if (cfg.hero.image && !cfg.hero.imageAlt) warn("hero.imageAlt", "Agregá un texto alternativo descriptivo para la imagen del hero.");
    cfg.hero.primary = action(hero.primary, cfg.hero.primary, "hero.primary");
    const secondary = isObject(hero.secondary) ? hero.secondary : {};
    cfg.hero.secondary = {
      label: text(secondary.label, cfg.hero.secondary.label, "hero.secondary.label", issues),
      target: text(secondary.target, cfg.hero.secondary.target, "hero.secondary.target", issues),
    };
    if (cfg.hero.secondary.target !== "hero" && !SECTION_KEYS.includes(cfg.hero.secondary.target)) {
      warn("hero.secondary.target", "Destino de sección desconocido; se usa servicios.");
      cfg.hero.secondary.target = "services";
    }

    const trust = objectAt(user, "trust", "trust");
    setTextFields(trust, cfg.trust, ["title"], "trust");
    cfg.trust.items = checkedList(trust.items, "trust.items").filter((item, index) => {
      if (!isObject(item)) { warn(`trust.items[${index}]`, "Debe ser un objeto; se omite."); return false; }
      const value = text(item.value, "", `trust.items[${index}].value`, issues);
      const label = text(item.label, "", `trust.items[${index}].label`, issues);
      if (!value || !label) { warn(`trust.items[${index}]`, "Se requiere un indicador y su descripción; se omite."); return false; }
      return true;
    }).map((item) => ({ value: item.value.trim(), label: item.label.trim() }));

    const services = objectAt(user, "services", "services");
    setTextFields(services, cfg.services, ["eyebrow", "title", "description"], "services");
    cfg.services.items = checkedList(services.items, "services.items").map((item, index) => ({ item, index }))
      .filter(({ item, index }) => {
        if (!isObject(item)) { warn(`services.items[${index}]`, "Debe ser un objeto; se omite."); return false; }
        const name = text(item.name, "", `services.items[${index}].name`, issues);
        if (!name) { warn(`services.items[${index}]`, "Falta el nombre; se omite."); return false; }
        return true;
      }).map(({ item, index }) => {
      const image = imagePath(item.image, `services.items[${index}].image`);
      const alt = text(item.alt, "", `services.items[${index}].alt`, issues);
      if (image && !alt) warn(`services.items[${index}].alt`, "Agregá un texto alternativo para la imagen.");
      return {
      name: item.name.trim(),
      description: text(item.description, "", `services.items[${index}].description`, issues),
      image,
      alt,
      cta: action(item.cta, { label: "", type: "whatsapp", url: "", message: "" }, `services.items[${index}].cta`),
      };
    });

    const differences = objectAt(user, "differentiators", "differentiators");
    setTextFields(differences, cfg.differentiators, ["eyebrow", "title"], "differentiators");
    cfg.differentiators.items = checkedList(differences.items, "differentiators.items")
      .filter((item, index) => {
        if (!isObject(item)) { warn(`differentiators.items[${index}]`, "Debe ser un objeto; se omite."); return false; }
        const title = text(item.title, "", `differentiators.items[${index}].title`, issues);
        const description = text(item.description, "", `differentiators.items[${index}].description`, issues);
        if (!title || !description) { warn(`differentiators.items[${index}]`, "Se requiere título y descripción; se omite."); return false; }
        return true;
      }).map((item) => ({ title: item.title.trim(), description: item.description.trim() }));
    if (cfg.differentiators.items.length && (cfg.differentiators.items.length < 3 || cfg.differentiators.items.length > 6)) {
      warn("differentiators.items", "La sección requiere entre 3 y 6 elementos; se oculta con menos de 3 y limita a 6 si se excede.");
    }
    if (cfg.differentiators.items.length > 6) cfg.differentiators.items = cfg.differentiators.items.slice(0, 6);

    const gallery = objectAt(user, "gallery", "gallery");
    setTextFields(gallery, cfg.gallery, ["eyebrow", "title", "description"], "gallery");
    cfg.gallery.items = checkedList(gallery.items, "gallery.items").map((item, index) => ({ item, index }))
      .filter(({ item, index }) => {
        if (!isObject(item) || !imagePath(item.src, `gallery.items[${index}].src`)) {
          warn(`gallery.items[${index}]`, "Imagen no válida; se omite.");
          return false;
        }
        return true;
      }).map(({ item, index }) => {
      const alt = text(item.alt, "", `gallery.items[${index}].alt`, issues);
      if (!alt) warn(`gallery.items[${index}].alt`, "Agregá un texto alternativo descriptivo para la imagen.");
      return {
      src: imagePath(item.src, `gallery.items[${index}].src`),
      alt,
      title: text(item.title, "", `gallery.items[${index}].title`, issues),
      description: text(item.description, "", `gallery.items[${index}].description`, issues),
      category: text(item.category, "", `gallery.items[${index}].category`, issues),
      width: dimension(item.width, 800, `gallery.items[${index}].width`),
      height: dimension(item.height, 600, `gallery.items[${index}].height`),
      };
    });

    const process = objectAt(user, "process", "process");
    setTextFields(process, cfg.process, ["eyebrow", "title", "description"], "process");
    cfg.process.steps = checkedList(process.steps, "process.steps").map((step, index) => ({ step, index }))
      .filter(({ step, index }) => {
        if (!isObject(step)) { warn(`process.steps[${index}]`, "Debe ser un objeto; se omite."); return false; }
        const title = text(step.title, "", `process.steps[${index}].title`, issues);
        return !!title;
      }).map(({ step, index }) => ({
      title: step.title.trim(),
      description: text(step.description, "", `process.steps[${index}].description`, issues),
    }));
    if (cfg.process.steps.length && (cfg.process.steps.length < 3 || cfg.process.steps.length > 4)) {
      warn("process.steps", "El proceso se configura con 3 o 4 pasos; se oculta con menos de 3 y limita a 4 si se excede.");
    }
    if (cfg.process.steps.length > 4) cfg.process.steps = cfg.process.steps.slice(0, 4);

    const testimonials = objectAt(user, "testimonials", "testimonials");
    setTextFields(testimonials, cfg.testimonials, ["eyebrow", "title"], "testimonials");
    cfg.testimonials.items = checkedList(testimonials.items, "testimonials.items").map((item, index) => ({ item, index }))
      .filter(({ item, index }) => {
        if (!isObject(item)) { warn(`testimonials.items[${index}]`, "Debe ser un objeto; se omite."); return false; }
        const quote = text(item.quote, "", `testimonials.items[${index}].quote`, issues);
        const author = text(item.author, "", `testimonials.items[${index}].author`, issues);
        return !!(quote && author);
      }).map(({ item, index }) => ({
      quote: item.quote.trim(), author: item.author.trim(),
      role: text(item.role, "", `testimonials.items[${index}].role`, issues),
    }));

    const faq = objectAt(user, "faq", "faq");
    setTextFields(faq, cfg.faq, ["eyebrow", "title"], "faq");
    cfg.faq.items = checkedList(faq.items, "faq.items").map((item, index) => ({ item, index }))
      .filter(({ item, index }) => {
        if (!isObject(item)) { warn(`faq.items[${index}]`, "Debe ser un objeto; se omite."); return false; }
        return !!(text(item.question, "", `faq.items[${index}].question`, issues) && text(item.answer, "", `faq.items[${index}].answer`, issues));
      }).map(({ item }) => ({ question: item.question.trim(), answer: item.answer.trim() }));

    const coverage = objectAt(user, "coverage", "coverage");
    setTextFields(coverage, cfg.coverage, ["eyebrow", "title", "description", "address", "area", "mapUrl", "mapsUrl"], "coverage");
    cfg.coverage.localities = checkedList(coverage.localities, "coverage.localities")
      .filter((locality) => typeof locality === "string" && locality.trim()).map((locality) => locality.trim());
    if (cfg.coverage.mapUrl) {
      const url = safeMapUrl(cfg.coverage.mapUrl);
      if (url) cfg.coverage.mapUrl = url;
      else { warn("coverage.mapUrl", "Usá una URL de inserción https de Google Maps u OpenStreetMap; se omite."); cfg.coverage.mapUrl = ""; }
    }
    ["mapsUrl"].forEach((key) => {
      if (!cfg.coverage[key]) return;
      const url = safeWebUrl(cfg.coverage[key]);
      if (url) cfg.coverage[key] = url;
      else { warn(`coverage.${key}`, "Debe ser una URL http(s); se omite."); cfg.coverage[key] = ""; }
    });

    const finalCta = objectAt(user, "finalCta", "finalCta");
    setTextFields(finalCta, cfg.finalCta, ["eyebrow", "title", "description"], "finalCta");
    cfg.finalCta.button = action(finalCta.button, cfg.finalCta.button, "finalCta.button");
    const contactSection = objectAt(user, "contactSection", "contactSection");
    setTextFields(contactSection, cfg.contactSection, ["eyebrow", "title", "description"], "contactSection");
    const footer = objectAt(user, "footer", "footer");
    setTextFields(footer, cfg.footer, ["navigationLabel", "creditUrl"], "footer");
    if (footer.creditUrl) {
      const url = safeWebUrl(footer.creditUrl);
      if (url) cfg.footer.creditUrl = url;
      else { warn("footer.creditUrl", "Debe ser una URL http(s); se ignora."); cfg.footer.creditUrl = ""; }
    }

    const actionAvailable = (actionValue) => {
      switch (actionValue.type) {
        case "contact": return cfg.sections.includes("contact") && hasContent(cfg, "contact");
        case "whatsapp": return !!cfg.contact.whatsapp;
        case "phone": return !!cfg.contact.phoneHref;
        case "email": return !!cfg.contact.email;
        case "url": return !!safeWebUrl(actionValue.url);
        default: return false;
      }
    };
    const actions = [
      ["navigation.cta", cfg.navigation.cta],
      ["hero.primary", cfg.hero.primary],
      ["finalCta.button", cfg.finalCta.button],
    ].concat(cfg.services.items.map((item, index) => [`services.items[${index}].cta`, item.cta]));
    actions.forEach(([path, item]) => {
      if (item.label && !actionAvailable(item)) warn(path, "No hay un destino válido para esta acción; se omite el botón.");
    });

    return { cfg, issues, ok: !issues.some((issue) => issue.level === "error") };
  }

  function hasContent(cfg, key) {
    const contact = cfg.contact;
    switch (key) {
      case "hero": return !!cfg.hero.title;
      case "trust": return cfg.trust.items.length > 0;
      case "services": return cfg.services.items.length > 0;
      case "differentiators": return cfg.differentiators.items.length >= 3 && cfg.differentiators.items.length <= 6;
      case "gallery": return cfg.gallery.items.length > 0;
      case "process": return cfg.process.steps.length >= 3 && cfg.process.steps.length <= 4;
      case "testimonials": return cfg.testimonials.items.length > 0;
      case "faq": return cfg.faq.items.length > 0;
      case "coverage": return !!(cfg.coverage.address || cfg.coverage.area || cfg.coverage.localities.length || cfg.coverage.mapUrl || cfg.coverage.mapsUrl);
      case "finalCta": {
        const action = cfg.finalCta.button;
        const available = action.type === "contact"
          ? cfg.sections.includes("contact") && hasContent(cfg, "contact")
          : action.type === "whatsapp" ? !!contact.whatsapp
            : action.type === "phone" ? !!contact.phoneHref
              : action.type === "email" ? !!contact.email
                : action.type === "url" ? !!safeWebUrl(action.url) : false;
        return !!(cfg.finalCta.title && action.label && available);
      }
      case "contact": return !!(contact.phone || contact.email || contact.whatsapp || contact.address || contact.hours || Object.keys(contact.social).length);
      default: return false;
    }
  }
  function enabledSections(cfg) {
    return cfg.sections.filter((key) => hasContent(cfg, key));
  }
  function assetUrl(cfg, value) {
    return /^https?:/i.test(value) ? value : cfg.assetBase + value.replace(/^\.?\//, "");
  }
  function buildSeo(cfg, sections) {
    const canonical = cfg.seo.url;
    let ogImage = "";
    if (canonical && cfg.seo.image) {
      try { ogImage = new URL(assetUrl(cfg, cfg.seo.image), canonical).href; } catch (error) { ogImage = ""; }
    }
    return {
      title: cfg.seo.title || cfg.brand.name,
      description: cfg.seo.description || cfg.brand.description,
      canonical,
      ogImage,
      locale: cfg.seo.locale,
      brand: cfg.brand.name,
      heroPreload: sections.includes("hero") && cfg.hero.image ? assetUrl(cfg, cfg.hero.image) : "",
    };
  }
  function renderSeoBlock(seo) {
    const meta = (attribute, name, value) => `  <meta ${attribute}="${name}" content="${esc(value)}">`;
    const lines = [`  <title>${esc(seo.title)}</title>`];
    if (seo.description) lines.push(meta("name", "description", seo.description));
    if (seo.canonical) lines.push(`  <link rel="canonical" href="${esc(seo.canonical)}">`);
    lines.push(meta("property", "og:type", "website"), meta("property", "og:title", seo.title));
    if (seo.description) lines.push(meta("property", "og:description", seo.description));
    lines.push(meta("property", "og:site_name", seo.brand), meta("property", "og:locale", seo.locale));
    if (seo.canonical) lines.push(meta("property", "og:url", seo.canonical));
    if (seo.ogImage) lines.push(meta("property", "og:image", seo.ogImage));
    lines.push(meta("name", "twitter:card", seo.ogImage ? "summary_large_image" : "summary"));
    lines.push(meta("name", "twitter:title", seo.title));
    if (seo.description) lines.push(meta("name", "twitter:description", seo.description));
    if (seo.ogImage) lines.push(meta("name", "twitter:image", seo.ogImage));
    if (seo.heroPreload) lines.push(`  <link rel="preload" as="image" href="${esc(seo.heroPreload)}" fetchpriority="high">`);
    return lines.join("\n");
  }

  return {
    CREDIT, SECTION_KEYS, SECTION_ID, DEFAULTS, esc, safeWebUrl, safeImagePath,
    normalize, hasContent, enabledSections, assetUrl, buildSeo, renderSeoBlock,
    safeMapUrl,
  };
});
