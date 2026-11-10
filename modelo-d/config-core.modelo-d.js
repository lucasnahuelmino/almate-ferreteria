/* ==========================================================================
   ALMATE · MODELO D — CATÁLOGO COMERCIAL · config-core.modelo-d.js
   Lógica pura, compartida por el navegador y tools/sync-seo.js.

   · Normaliza la configuración y descarta valores inseguros o inválidos.
   · Escapa texto y valida URLs, rutas, colores, teléfonos, emails y mapas.
   · Construye el bloque SEO estático y el JSON-LD.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ModeloDCore = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CREDIT = "Desarrollado por ALMATE · Soluciones digitales";
  const SECTION_KEYS = ["hero", "ticker", "stats", "categories", "featured", "catalog", "about", "process", "gallery", "faq", "consultation", "contact"];
  const NAV_KEYS = ["hero", "categories", "catalog", "about", "process", "gallery", "faq", "consultation", "contact"];
  const SECTION_IDS = {
    hero: "inicio",
    ticker: "ticker",
    stats: "datos",
    categories: "rubros",
    featured: "destacados",
    catalog: "catalogo",
    about: "nosotros",
    process: "proceso",
    gallery: "galeria",
    faq: "preguntas",
    consultation: "consulta",
    contact: "contacto",
  };
  const NAV_DEFAULTS = {
    hero: "Inicio",
    categories: "Rubros",
    catalog: "Catálogo",
    about: "Nosotros",
    process: "Cómo trabajamos",
    gallery: "Galería",
    faq: "Preguntas",
    consultation: "Consulta",
    contact: "Contacto",
  };
  const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const SOCIAL_KEYS = ["instagram", "facebook", "tiktok", "youtube", "linkedin"];

  const DEFAULT_THEME = {
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
  };

  const DEFAULTS = {
    sections: SECTION_KEYS.slice(),
    assetBase: "../img/",
    brand: { name: "", short: "", tagline: "", description: "", logo: "", logoAlt: "" },
    theme: Object.assign({}, DEFAULT_THEME),
    fonts: { display: '"Inter", "Segoe UI", sans-serif', body: '"Manrope", "Segoe UI", sans-serif' },
    seo: { title: "", description: "", url: "", image: "", imageAlt: "", locale: "es_AR", schemaType: "LocalBusiness" },
    currency: { locale: "es-AR", code: "ARS" },
    display: { showSku: true, showBrand: true, showAvailability: true, showPrices: true },
    navigation: { labels: Object.assign({}, NAV_DEFAULTS) },
    header: { utility: "", cta: null },
    hero: {
      eyebrow: "",
      titleLines: [],
      accentIndex: -1,
      lead: "",
      image: "",
      imageAlt: "",
      badge: "",
      meta: [],
      primaryCta: null,
      secondaryCta: null,
    },
    ticker: [],
    stats: [],
    categoriesSection: { label: "", title: "", lead: "" },
    categories: { label: "", title: "", lead: "", items: [] },
    featured: { label: "", title: "", lead: "", limit: 8 },
    catalog: { label: "", title: "", lead: "", searchPlaceholder: "", emptyText: "", products: [] },
    consultation: { label: "", title: "", lead: "", storageKey: "almate-modelo-d-consultation", persist: true },
    about: { label: "", title: "", lead: "", paragraphs: [], image: "", imageAlt: "", specs: [] },
    process: { label: "", title: "", lead: "", items: [] },
    gallery: { label: "", title: "", lead: "", items: [] },
    faq: { label: "", title: "", items: [] },
    contact: {
      label: "",
      title: "",
      lead: "",
      phone: "",
      phoneHref: "",
      email: "",
      whatsapp: "",
      whatsappMessage: "",
      address: "",
      locality: "",
      region: "",
      country: "",
      hours: "",
      hoursSpec: [],
      social: {},
      map: { enabled: true, query: "", embedUrl: "", link: "" },
    },
    footer: { note: "", creditUrl: "", navigationLabel: "Navegación", contactLabel: "Contacto", copyrightLabel: "Todos los derechos reservados." },
  };

  /* ---------- Seguridad ---------- */
  const esc = (value) =>
    String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]));

  function safeUrl(value, allowed) {
    if (typeof value !== "string") return "";
    const raw = value.trim();
    if (!raw || /[\u0000-\u001f\u007f\s]/.test(raw)) return "";
    try {
      const parsed = new URL(raw);
      return allowed.indexOf(parsed.protocol) !== -1 ? raw : "";
    } catch (error) {
      return "";
    }
  }

  const webUrl = (value) => safeUrl(value, ["https:", "http:"]);

  function isSafeAssetPath(value) {
    if (typeof value !== "string") return false;
    const raw = value.trim();
    if (!raw || raw.length > 500) return false;
    if (/[\u0000-\u001f\u007f\\<>"'`]/.test(raw)) return false;
    if (raw.slice(0, 2) === "//") return false;
    if (/^[a-z][a-z0-9+.\-]*:/i.test(raw)) return !!webUrl(raw);
    return raw.split("/").indexOf("..") === -1;
  }

  function assetUrl(cfg, value) {
    const raw = String(value == null ? "" : value).trim();
    if (!raw) return "";
    if (/^https?:/i.test(raw)) return raw;
    const base = String(cfg.assetBase || "").replace(/\/+$/, "");
    return base + "/" + raw.replace(/^\.?\//, "");
  }

  function absoluteAsset(cfg, value, pageUrl) {
    const relative = assetUrl(cfg, value);
    if (!relative || !pageUrl) return "";
    if (/^https?:/i.test(relative)) return relative;
    try {
      return new URL(relative, pageUrl).href;
    } catch (error) {
      return "";
    }
  }

  function isSafeColor(value) {
    return typeof value === "string" && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
  }

  /* ---------- Normalización ---------- */
  const isObj = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const clone = (value) => JSON.parse(JSON.stringify(value));

  function normalize(user) {
    const issues = [];
    const add = (level, path, msg) => issues.push({ level, path, msg });
    const cfg = clone(DEFAULTS);

    if (!isObj(user)) {
      add("error", "MODELO_D_CONFIG", "No se encontró una configuración válida. ¿Falta cargar config.modelo-d.js antes de engine.modelo-d.js? Se muestran valores seguros.");
      return { cfg, issues, ok: false };
    }

    Object.keys(user).forEach((key) => {
      if (!(key in DEFAULTS)) add("warn", key, "Clave desconocida (se ignora). ¿Error de tipeo?");
    });

    const readString = (path, value, fallback) => {
      if (value === undefined) return fallback;
      if (typeof value !== "string") {
        add("warn", path, `Debe ser texto (se recibió ${typeof value}). Se usa el valor por defecto.`);
        return fallback;
      }
      return value.trim();
    };
    const readBool = (path, value, fallback) => {
      if (value === undefined) return fallback;
      if (typeof value !== "boolean") {
        add("warn", path, "Debe ser true o false. Se usa el valor por defecto.");
        return fallback;
      }
      return value;
    };
    const readArray = (path, value, fallback) => {
      if (value === undefined) return fallback;
      if (!Array.isArray(value)) {
        add("warn", path, "Debe ser una lista [ … ]. Se usa el valor por defecto.");
        return fallback;
      }
      return value;
    };
    const asObject = (path, value) => {
      if (value === undefined) return {};
      if (!isObj(value)) {
        add("warn", path, "Debe ser un objeto { … }. Se usan valores por defecto.");
        return {};
      }
      return value;
    };
    const readImage = (path, value) => {
      const raw = readString(path, value, "");
      if (!raw) return "";
      if (!isSafeAssetPath(raw)) {
        add("warn", path, `Ruta de imagen no válida o insegura ("${raw.slice(0, 60)}"). Se omite.`);
        return "";
      }
      return raw;
    };
    const readWebUrl = (path, value) => {
      const raw = readString(path, value, "");
      if (!raw) return "";
      if (!webUrl(raw)) {
        add("warn", path, "Debe ser una URL HTTP/HTTPS válida. Se omite.");
        return "";
      }
      return raw;
    };

    /* Marca */
    const brandUser = asObject("brand", user.brand);
    Object.keys(brandUser).forEach((key) => {
      if (!["name", "short", "tagline", "description", "logo", "logoAlt"].includes(key)) add("warn", `brand.${key}`, "Clave desconocida (se ignora).");
    });
    cfg.brand.name = readString("brand.name", brandUser.name, "");
    if (!cfg.brand.name) {
      add("error", "brand.name", "El nombre del negocio es obligatorio. Se usa \"Negocio\" provisionalmente.");
      cfg.brand.name = "Negocio";
    }
    cfg.brand.short = readString("brand.short", brandUser.short, cfg.brand.name);
    cfg.brand.tagline = readString("brand.tagline", brandUser.tagline, "");
    cfg.brand.description = readString("brand.description", brandUser.description, "");
    cfg.brand.logo = readImage("brand.logo", brandUser.logo);
    cfg.brand.logoAlt = readString("brand.logoAlt", brandUser.logoAlt, "");
    if (cfg.brand.logo && !cfg.brand.logoAlt) {
      add("warn", "brand.logoAlt", "El logo necesita un texto alternativo; se usa el nombre del negocio.");
      cfg.brand.logoAlt = cfg.brand.name;
    }

    const currencyUser = asObject("currency", user.currency);
    const currencyLocale = readString("currency.locale", currencyUser.locale, "es-AR");
    const currencyCode = readString("currency.code", currencyUser.code, "ARS").toUpperCase();
    cfg.currency.locale = /^[a-z]{2}(?:-[A-Z]{2})?$/.test(currencyLocale) ? currencyLocale : "es-AR";
    cfg.currency.code = /^[A-Z]{3}$/.test(currencyCode) ? currencyCode : "ARS";
    if (cfg.currency.locale !== currencyLocale) add("warn", "currency.locale", "Formato de idioma no válido; se usa es-AR.");
    if (cfg.currency.code !== currencyCode) add("warn", "currency.code", "Usá un código monetario ISO de tres letras; se usa ARS.");
    try {
      new Intl.NumberFormat(cfg.currency.locale, { style: "currency", currency: cfg.currency.code });
    } catch (error) {
      cfg.currency.locale = "es-AR";
      cfg.currency.code = "ARS";
      add("warn", "currency", "El idioma o la moneda no son compatibles; se usa es-AR / ARS.");
    }
    const displayUser = asObject("display", user.display);
    Object.keys(cfg.display).forEach((key) => {
      cfg.display[key] = readBool(`display.${key}`, displayUser[key], cfg.display[key]);
    });

    /* Paleta y contraste */
    const themeUser = asObject("theme", user.theme);
    Object.keys(themeUser).forEach((key) => {
      if (!(key in DEFAULT_THEME)) {
        add("warn", `theme.${key}`, "Color desconocido (se ignora).");
        return;
      }
      const value = readString(`theme.${key}`, themeUser[key], DEFAULT_THEME[key]);
      if (isSafeColor(value)) cfg.theme[key] = value;
      else add("warn", `theme.${key}`, "Usá un color hexadecimal de 3 o 6 dígitos, por ejemplo #dfff3a.");
    });
    [
      ["ink", "paper"],
      ["accent", "accentInk"],
      ["muted", "ink"],
      ["mutedInk", "paper"],
    ].forEach(([foreground, background]) => {
      const ratio = contrast(cfg.theme[foreground], cfg.theme[background]);
      if (ratio && ratio < 4.5) {
        add("warn", "theme", `Contraste bajo entre ${foreground} y ${background} (${ratio.toFixed(2)}:1). Revisá la legibilidad.`);
      }
    });

    const fontsUser = asObject("fonts", user.fonts);
    ["display", "body"].forEach((key) => {
      const value = readString(`fonts.${key}`, fontsUser[key], cfg.fonts[key]);
      if (/^[A-Za-z0-9 ,"'-]+$/.test(value)) cfg.fonts[key] = value;
      else add("warn", `fonts.${key}`, "Familia tipográfica no válida; se conserva el valor predeterminado.");
    });

    /* SEO */
    const seoUser = asObject("seo", user.seo);
    Object.keys(seoUser).forEach((key) => {
      if (!["title", "description", "url", "image", "imageAlt", "locale", "schemaType"].includes(key)) {
        add("warn", `seo.${key}`, "Clave desconocida (se ignora).");
      }
    });
    cfg.seo.title = readString("seo.title", seoUser.title, "");
    if (!cfg.seo.title) {
      cfg.seo.title = cfg.brand.name + (cfg.brand.tagline ? " | " + cfg.brand.tagline : "");
    }
    cfg.seo.description = readString("seo.description", seoUser.description, cfg.brand.description);
    cfg.seo.url = readWebUrl("seo.url", seoUser.url);
    cfg.seo.image = readImage("seo.image", seoUser.image);
    cfg.seo.imageAlt = readString("seo.imageAlt", seoUser.imageAlt, "");
    cfg.seo.locale = readString("seo.locale", seoUser.locale, "es_AR");
    const schemaType = readString("seo.schemaType", seoUser.schemaType, "LocalBusiness");
    cfg.seo.schemaType = /^[A-Za-z][A-Za-z0-9]*$/.test(schemaType) ? schemaType : "LocalBusiness";
    if (cfg.seo.schemaType !== schemaType) add("warn", "seo.schemaType", "Tipo de schema inválido. Se usa LocalBusiness.");

    /* Contacto */
    const contactUser = asObject("contact", user.contact);
    cfg.contact.phone = readString("contact.phone", contactUser.phone, "");
    cfg.contact.email = readString("contact.email", contactUser.email, "").toLowerCase();
    if (cfg.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cfg.contact.email)) {
      add("warn", "contact.email", "Email inválido. Se omite.");
      cfg.contact.email = "";
    }
    const phoneDigits = cfg.contact.phone.replace(/\D/g, "");
    const phoneHrefRaw = readString("contact.phoneHref", contactUser.phoneHref, "");
    cfg.contact.phoneHref = phoneHrefRaw
      ? safeUrl(phoneHrefRaw, ["tel:"])
      : phoneDigits.length >= 6
        ? "tel:" + phoneDigits
        : "";
    if (phoneHrefRaw && !cfg.contact.phoneHref) add("warn", "contact.phoneHref", "El enlace telefónico debe comenzar con tel:.");

    const rawWhatsApp = readString("contact.whatsapp", contactUser.whatsapp, "");
    const digitsWhatsApp = rawWhatsApp.replace(/\D/g, "");
    cfg.contact.whatsapp = rawWhatsApp && /^\+?[\d\s().-]+$/.test(rawWhatsApp) ? digitsWhatsApp : "";
    if (rawWhatsApp && (!cfg.contact.whatsapp || cfg.contact.whatsapp.length < 8 || cfg.contact.whatsapp.length > 15)) {
      add("warn", "contact.whatsapp", "WhatsApp debe tener entre 8 y 15 dígitos con código de país; se aceptan separadores habituales.");
      cfg.contact.whatsapp = "";
    }
    cfg.contact.whatsappMessage = readString("contact.whatsappMessage", contactUser.whatsappMessage, "Hola, quisiera hacer una consulta.");
    cfg.contact.address = readString("contact.address", contactUser.address, "");
    cfg.contact.locality = readString("contact.locality", contactUser.locality, "");
    cfg.contact.region = readString("contact.region", contactUser.region, "");
    cfg.contact.country = readString("contact.country", contactUser.country, "");
    cfg.contact.hours = readString("contact.hours", contactUser.hours, "");

    readArray("contact.hoursSpec", contactUser.hoursSpec, []).forEach((entry, index) => {
      if (!isObj(entry)) {
        add("warn", `contact.hoursSpec[${index}]`, "Debe ser { days, opens, closes }. Se omite.");
        return;
      }
      const days = Array.isArray(entry.days)
        ? entry.days.filter((day) => {
            const valid = WEEKDAYS.includes(day);
            if (!valid) add("warn", `contact.hoursSpec[${index}].days`, `Día inválido "${String(day)}". Se omite.`);
            return valid;
          })
        : [];
      const opens = typeof entry.opens === "string" ? entry.opens.trim() : "";
      const closes = typeof entry.closes === "string" ? entry.closes.trim() : "";
      const timeOk = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
      if (!days.length || !timeOk(opens) || !timeOk(closes)) {
        add("warn", `contact.hoursSpec[${index}]`, "Horario incompleto o inválido. Se omite.");
        return;
      }
      cfg.contact.hoursSpec.push({ days, opens, closes });
    });

    const socialUser = asObject("contact.social", contactUser.social);
    Object.keys(socialUser).forEach((key) => {
      if (!SOCIAL_KEYS.includes(key)) {
        add("warn", `contact.social.${key}`, "Red social desconocida (se ignora).");
        return;
      }
      const url = readWebUrl(`contact.social.${key}`, socialUser[key]);
      if (url) cfg.contact.social[key] = url;
    });

    const mapUser = asObject("contact.map", contactUser.map);
    cfg.contact.map.enabled = readBool("contact.map.enabled", mapUser.enabled, true);
    cfg.contact.map.query = readString("contact.map.query", mapUser.query, "");
    const embedRaw = readString("contact.map.embedUrl", mapUser.embedUrl, "");
    cfg.contact.map.embedUrl = embedRaw ? safeMapEmbed(embedRaw) : "";
    if (embedRaw && !cfg.contact.map.embedUrl) {
      add("warn", "contact.map.embedUrl", "El mapa embebido debe ser HTTPS de Google Maps u OpenStreetMap. Se omite.");
    }
    cfg.contact.map.link = readWebUrl("contact.map.link", mapUser.link);
    if (!cfg.contact.map.embedUrl && cfg.contact.map.query) {
      cfg.contact.map.embedUrl = "https://www.google.com/maps?q=" + encodeURIComponent(cfg.contact.map.query) + "&output=embed";
    }
    if (!cfg.contact.map.link && cfg.contact.map.query) {
      cfg.contact.map.link = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(cfg.contact.map.query);
    }

    /* Navegación */
    const navUser = asObject("navigation", user.navigation);
    const labelsUser = asObject("navigation.labels", navUser.labels);
    Object.keys(labelsUser).forEach((key) => {
      if (!NAV_KEYS.includes(key)) add("warn", `navigation.labels.${key}`, "Etiqueta de sección desconocida (se ignora).");
    });
    cfg.navigation.labels = {};
    NAV_KEYS.forEach((key) => {
      cfg.navigation.labels[key] = readString(`navigation.labels.${key}`, labelsUser[key], NAV_DEFAULTS[key]) || NAV_DEFAULTS[key];
    });

    /* Header y hero */
    const headerUser = asObject("header", user.header);
    cfg.header.utility = readString("header.utility", headerUser.utility, "");
    cfg.header.cta = normalizeCta("header.cta", headerUser.cta, cfg, add);

    const heroUser = asObject("hero", user.hero);
    cfg.hero.eyebrow = readString("hero.eyebrow", heroUser.eyebrow, "");
    const rawLines = readArray("hero.titleLines", heroUser.titleLines, []);
    cfg.hero.titleLines = rawLines
      .map((line, index) => readString(`hero.titleLines[${index}]`, line, ""))
      .filter(Boolean);
    if (!cfg.hero.titleLines.length) cfg.hero.titleLines = [cfg.brand.name];
    const accentIndex = heroUser.accentIndex;
    cfg.hero.accentIndex =
      Number.isInteger(accentIndex) && accentIndex >= 0 && accentIndex < cfg.hero.titleLines.length ? accentIndex : -1;
    if (accentIndex !== undefined && cfg.hero.accentIndex === -1) {
      add("warn", "hero.accentIndex", "Debe ser el índice de una línea del título. Se ignora.");
    }
    cfg.hero.lead = readString("hero.lead", heroUser.lead, "");
    cfg.hero.image = readImage("hero.image", heroUser.image);
    cfg.hero.imageAlt = readString("hero.imageAlt", heroUser.imageAlt, "");
    cfg.hero.badge = readString("hero.badge", heroUser.badge, "");
    cfg.hero.meta = normalizeMeta("hero.meta", heroUser.meta, add);
    cfg.hero.primaryCta = normalizeCta("hero.primaryCta", heroUser.primaryCta, cfg, add);
    cfg.hero.secondaryCta = normalizeCta("hero.secondaryCta", heroUser.secondaryCta, cfg, add);

    /* Ticker y datos */
    cfg.ticker = readArray("ticker", user.ticker, [])
      .map((item, index) => readString(`ticker[${index}]`, item, ""))
      .filter(Boolean)
      .slice(0, 12);

    cfg.stats = readArray("stats", user.stats, [])
      .map((item, index) => {
        if (!isObj(item)) {
          add("warn", `stats[${index}]`, "Debe ser { value, label }. Se omite.");
          return null;
        }
        const value = readString(`stats[${index}].value`, item.value, "");
        const label = readString(`stats[${index}].label`, item.label, "");
        return value && label ? { value, label } : null;
      })
      .filter(Boolean)
      .slice(0, 6);

    /* Secciones de contenido */
    normalizeCatalogData(user, cfg, add, readString, readArray, asObject, readImage, readBool);
    normalizeContentSections(user, cfg, add, readString, readArray, asObject, readImage);

    /* Secciones habilitadas */
    const rawSections = readArray("sections", user.sections, SECTION_KEYS.slice());
    const seen = new Set();
    cfg.sections = rawSections
      .map((key) => {
        if (typeof key !== "string") {
          add("warn", "sections", "Cada sección debe ser un texto. Se omite.");
          return "";
        }
        const clean = key.trim();
        if (!SECTION_KEYS.includes(clean)) {
          add("warn", "sections", `La sección "${clean}" no existe. Se omite.`);
          return "";
        }
        if (seen.has(clean)) {
          add("warn", "sections", `La sección "${clean}" está repetida. Se omite la segunda.`);
          return "";
        }
        seen.add(clean);
        return clean;
      })
      .filter(Boolean);
    if (!cfg.sections.length) {
      add("warn", "sections", "No hay secciones válidas. Se usa el orden completo por defecto.");
      cfg.sections = SECTION_KEYS.slice();
    }

    /* Footer */
    const footerUser = asObject("footer", user.footer);
    cfg.footer.note = readString("footer.note", footerUser.note, "");
    cfg.footer.creditUrl = readWebUrl("footer.creditUrl", footerUser.creditUrl);
    ["navigationLabel", "contactLabel", "copyrightLabel"].forEach((key) => {
      cfg.footer[key] = readString(`footer.${key}`, footerUser[key], cfg.footer[key]);
    });

    return { cfg, issues, ok: true };
  }

  function normalizeCatalogData(user, cfg, add, readString, readArray, asObject, readImage, readBool) {
    const categories = readArray("categories", user.categories, []);
    const categoryIds = new Set();
    cfg.categories.items = categories.slice(0, 200).map((item, index) => {
      if (!isObj(item)) {
        add("warn", `categories[${index}]`, "Debe ser un objeto; se omite.");
        return null;
      }
      const id = readString(`categories[${index}].id`, item.id, "").toLowerCase();
      const name = readString(`categories[${index}].name`, item.name, "");
      if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(id) || !name || categoryIds.has(id)) {
        add("warn", `categories[${index}]`, "Se requiere un id único (letras, números y guiones) y nombre; se omite.");
        return null;
      }
      categoryIds.add(id);
      const image = readImage(`categories[${index}].image`, item.image);
      const alt = readString(`categories[${index}].alt`, item.alt, name);
      if (image && !alt) add("warn", `categories[${index}].alt`, "Agregá un texto alternativo descriptivo.");
      return {
        id,
        name,
        description: readString(`categories[${index}].description`, item.description, ""),
        image,
        alt,
        order: Number.isFinite(item.order) ? item.order : index,
      };
    }).filter(Boolean);
    if (categories.length > 200) add("warn", "categories", "El máximo estático es 200 categorías; se omiten las excedentes.");

    const catalogUser = asObject("catalog", user.catalog);
    ["label", "title", "lead", "searchPlaceholder", "emptyText"].forEach((key) => {
      cfg.catalog[key] = readString(`catalog.${key}`, catalogUser[key], cfg.catalog[key]);
    });
    const rawProducts = readArray("catalog.products", catalogUser.products, []);
    const seenIds = new Set();
    const seenSkus = new Set();
    cfg.catalog.products = rawProducts.slice(0, 1000).map((item, index) => {
      const path = `catalog.products[${index}]`;
      if (!isObj(item)) {
        add("warn", path, "Debe ser un objeto; se omite.");
        return null;
      }
      const id = readString(`${path}.id`, item.id, "").toLowerCase();
      const name = readString(`${path}.name`, item.name, "");
      const category = readString(`${path}.category`, item.category, "").toLowerCase();
      if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(id) || seenIds.has(id) || !name || !categoryIds.has(category)) {
        add("warn", path, "Producto omitido: requiere id único, nombre y categoría configurada.");
        return null;
      }
      seenIds.add(id);
      const sku = readString(`${path}.sku`, item.sku, "");
      if (sku) {
        const key = sku.toLocaleLowerCase();
        if (seenSkus.has(key)) add("warn", `${path}.sku`, "SKU repetido; verificá que identifique el producto correcto.");
        seenSkus.add(key);
      }
      const price = item.price === undefined || item.price === null || item.price === ""
        ? null
        : Number.isFinite(item.price) && item.price >= 0
          ? item.price
          : null;
      if (item.price !== undefined && item.price !== null && item.price !== "" && price === null) {
        add("warn", `${path}.price`, "El precio debe ser un número no negativo; se omite.");
      }
      let previousPrice = item.previousPrice === undefined || item.previousPrice === null || item.previousPrice === ""
        ? null
        : Number.isFinite(item.previousPrice) && item.previousPrice >= 0
          ? item.previousPrice
          : null;
      if (item.previousPrice !== undefined && item.previousPrice !== null && item.previousPrice !== "" && previousPrice === null) {
        add("warn", `${path}.previousPrice`, "El precio anterior debe ser un número no negativo; se omite.");
      }
      if (previousPrice !== null && (price === null || previousPrice <= price)) {
        add("warn", `${path}.previousPrice`, "El precio anterior debe superar al precio actual; se omite.");
        previousPrice = null;
      }
      const mainImage = readImage(`${path}.mainImage`, item.mainImage);
      const mainImageAlt = readString(`${path}.mainImageAlt`, item.mainImageAlt, "");
      if (mainImage && !mainImageAlt) add("warn", `${path}.mainImageAlt`, "Agregá un texto alternativo descriptivo.");
      const gallery = readArray(`${path}.gallery`, item.gallery, []).map((image, imageIndex) => {
        const imagePath = `${path}.gallery[${imageIndex}]`;
        const source = isObj(image) ? image.src : image;
        const src = readImage(`${imagePath}.src`, source);
        const alt = isObj(image) ? readString(`${imagePath}.alt`, image.alt, "") : "";
        if (src && !alt) {
          add("warn", `${imagePath}.alt`, "La imagen de galería necesita un alt descriptivo; se omite.");
          return null;
        }
        return src ? { src, alt } : null;
      }).filter(Boolean).slice(0, 12);
      const specifications = readArray(`${path}.specifications`, item.specifications, [])
        .map((spec, specIndex) => {
          if (!isObj(spec)) return null;
          const label = readString(`${path}.specifications[${specIndex}].name`, spec.name, "");
          const value = readString(`${path}.specifications[${specIndex}].value`, spec.value, "");
          return label && value ? { name: label, value } : null;
        }).filter(Boolean).slice(0, 30);
      const featured = readBool(`${path}.featured`, item.featured, false);
      return {
        id, sku, name, category,
        subcategory: readString(`${path}.subcategory`, item.subcategory, ""),
        brand: readString(`${path}.brand`, item.brand, ""),
        shortDescription: readString(`${path}.shortDescription`, item.shortDescription, ""),
        description: readString(`${path}.description`, item.description, ""),
        mainImage, mainImageAlt: mainImageAlt || name, gallery, price, previousPrice,
        unit: readString(`${path}.unit`, item.unit, ""),
        availability: readString(`${path}.availability`, item.availability, ""),
        specifications,
        tags: readArray(`${path}.tags`, item.tags, []).map((tag, tagIndex) =>
          readString(`${path}.tags[${tagIndex}]`, tag, "")
        ).filter(Boolean).slice(0, 30),
        featured,
        order: Number.isFinite(item.order) ? item.order : index,
      };
    }).filter(Boolean);
    cfg.catalog.products.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, cfg.currency.locale));
    if (rawProducts.length > 1000) add("warn", "catalog.products", "El máximo estático es 1000 productos; se omiten los excedentes.");

    const featuredUser = asObject("featured", user.featured);
    ["label", "title", "lead"].forEach((key) => {
      cfg.featured[key] = readString(`featured.${key}`, featuredUser[key], cfg.featured[key]);
    });
    if (featuredUser.limit !== undefined && Number.isInteger(featuredUser.limit) && featuredUser.limit > 0 && featuredUser.limit <= 40) {
      cfg.featured.limit = featuredUser.limit;
    } else if (featuredUser.limit !== undefined) {
      add("warn", "featured.limit", "Debe ser un entero entre 1 y 40; se usa el valor predeterminado.");
    }

    const consultationUser = asObject("consultation", user.consultation);
    ["label", "title", "lead", "storageKey"].forEach((key) => {
      cfg.consultation[key] = readString(`consultation.${key}`, consultationUser[key], cfg.consultation[key]);
    });
    cfg.consultation.persist = readBool("consultation.persist", consultationUser.persist, true);
    if (!/^[a-zA-Z0-9._-]{1,80}$/.test(cfg.consultation.storageKey)) {
      add("warn", "consultation.storageKey", "Clave de almacenamiento no válida; se usa la predeterminada.");
      cfg.consultation.storageKey = DEFAULTS.consultation.storageKey;
    }
  }

  function normalizeContentSections(user, cfg, add, readString, readArray, asObject, readImage) {
    const categoriesUser = asObject("categoriesSection", user.categoriesSection);
    cfg.categories.label = readString("categoriesSection.label", categoriesUser.label, "");
    cfg.categories.title = readString("categoriesSection.title", categoriesUser.title, "");
    cfg.categories.lead = readString("categoriesSection.lead", categoriesUser.lead, "");
    cfg.categories.items = cfg.categories.items
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        image: item.image,
        alt: item.alt,
        order: item.order,
      }))
      .sort((a, b) => a.order - b.order);

    const aboutUser = asObject("about", user.about);
    cfg.about.label = readString("about.label", aboutUser.label, "");
    cfg.about.title = readString("about.title", aboutUser.title, "");
    cfg.about.lead = readString("about.lead", aboutUser.lead, "");
    cfg.about.paragraphs = readArray("about.paragraphs", aboutUser.paragraphs, [])
      .map((paragraph, index) => readString(`about.paragraphs[${index}]`, paragraph, ""))
      .filter(Boolean);
    cfg.about.image = readImage("about.image", aboutUser.image);
    cfg.about.imageAlt = readString("about.imageAlt", aboutUser.imageAlt, "");
    cfg.about.specs = readArray("about.specs", aboutUser.specs, [])
      .map((item, index) => {
        if (!isObj(item)) return null;
        const label = readString(`about.specs[${index}].label`, item.label, "");
        const value = readString(`about.specs[${index}].value`, item.value, "");
        return label && value ? { label, value } : null;
      })
      .filter(Boolean)
      .slice(0, 4);

    const processUser = asObject("process", user.process);
    cfg.process.label = readString("process.label", processUser.label, "");
    cfg.process.title = readString("process.title", processUser.title, "");
    cfg.process.lead = readString("process.lead", processUser.lead, "");
    cfg.process.items = readArray("process.items", processUser.items, [])
      .map((item, index) => {
        if (!isObj(item)) return null;
        const title = readString(`process.items[${index}].title`, item.title, "");
        if (!title) return null;
        return {
          number: readString(`process.items[${index}].number`, item.number, "") || String(index + 1).padStart(2, "0"),
          title,
          description: readString(`process.items[${index}].description`, item.description, ""),
        };
      })
      .filter(Boolean);
    if (cfg.process.items.length === 1) add("warn", "process.items", "Se recomiendan al menos 2 pasos para que la sección tenga sentido.");

    const galleryUser = asObject("gallery", user.gallery);
    cfg.gallery.label = readString("gallery.label", galleryUser.label, "");
    cfg.gallery.title = readString("gallery.title", galleryUser.title, "");
    cfg.gallery.lead = readString("gallery.lead", galleryUser.lead, "");
    cfg.gallery.items = readArray("gallery.items", galleryUser.items, [])
      .map((item, index) => {
        if (!isObj(item)) return null;
        const src = readImage(`gallery.items[${index}].src`, item.src || item.image);
        const alt = readString(`gallery.items[${index}].alt`, item.alt, "");
        if (!src) return null;
        if (!alt) {
          add("warn", `gallery.items[${index}].alt`, "La imagen de galería necesita un alt descriptivo. Se omite.");
          return null;
        }
        return {
          src,
          alt,
          caption: readString(`gallery.items[${index}].caption`, item.caption, ""),
        };
      })
      .filter(Boolean);

    const faqUser = asObject("faq", user.faq);
    cfg.faq.label = readString("faq.label", faqUser.label, "");
    cfg.faq.title = readString("faq.title", faqUser.title, "");
    cfg.faq.items = readArray("faq.items", faqUser.items, [])
      .map((item, index) => {
        if (!isObj(item)) return null;
        const question = readString(`faq.items[${index}].q`, item.q, "");
        const answer = readString(`faq.items[${index}].a`, item.a, "");
        return question && answer ? { q: question, a: answer } : null;
      })
      .filter(Boolean);

    const contactUser = asObject("contact", user.contact);
    cfg.contact.label = readString("contact.label", contactUser.label, "");
    cfg.contact.title = readString("contact.title", contactUser.title, "");
    cfg.contact.lead = readString("contact.lead", contactUser.lead, "");
  }

  function normalizeCta(path, value, cfg, add) {
    if (value === undefined || value === null) return null;
    if (!isObj(value)) {
      add("warn", path, "Debe ser un objeto { label, type, value }. Se omite.");
      return null;
    }
    const label = typeof value.label === "string" ? value.label.trim() : "";
    const type = typeof value.type === "string" ? value.type.trim().toLowerCase() : "";
    const rawValue = typeof value.value === "string" ? value.value.trim() : "";
    if (!label) {
      add("warn", `${path}.label`, "El botón necesita una etiqueta. Se omite.");
      return null;
    }
    let href = "";
    if (type === "whatsapp") {
      if (cfg.contact.whatsapp) {
        const message = typeof value.message === "string" && value.message.trim() ? value.message.trim() : cfg.contact.whatsappMessage;
        href = "https://wa.me/" + cfg.contact.whatsapp + (message ? "?text=" + encodeURIComponent(message) : "");
      }
    } else if (type === "phone") {
      href = cfg.contact.phoneHref;
    } else if (type === "email") {
      href = cfg.contact.email ? "mailto:" + cfg.contact.email : "";
    } else if (type === "url") {
      href = webUrl(rawValue);
    } else if (type === "anchor") {
      const id = rawValue.replace(/^#/, "");
      if (/^[a-z0-9-]+$/i.test(id)) href = "#" + id;
    } else if (type === "contact") {
      href = "#contacto";
    }
    if (!href) {
      add("warn", path, "El botón no tiene un destino válido para su tipo. Se omite.");
      return null;
    }
    return { label, href, external: /^https?:/i.test(href) };
  }

  function normalizeMeta(path, value, add) {
    return (Array.isArray(value) ? value : [])
      .map((item, index) => {
        if (!isObj(item)) return null;
        const label = typeof item.label === "string" ? item.label.trim() : "";
        const text = typeof item.value === "string" ? item.value.trim() : "";
        if (!label || !text) {
          add("warn", `${path}[${index}]`, "Cada dato necesita label y value. Se omite.");
          return null;
        }
        return { label, value: text };
      })
      .filter(Boolean)
      .slice(0, 4);
  }

  /* ---------- Contenido activo ---------- */
  function sectionHasContent(cfg, key) {
    if (key === "hero") return Boolean(cfg.hero.titleLines.length || cfg.hero.lead || cfg.hero.image);
    if (key === "ticker") return cfg.ticker.length > 0;
    if (key === "stats") return cfg.stats.length > 0;
    if (key === "categories") return cfg.categories.items.length > 0;
    if (key === "featured") return cfg.catalog.products.some((product) => product.featured);
    if (key === "catalog" || key === "consultation") return true;
    if (key === "about") return Boolean(cfg.about.title || cfg.about.lead || cfg.about.paragraphs.length || cfg.about.image);
    if (key === "process") return cfg.process.items.length > 0;
    if (key === "gallery") return cfg.gallery.items.length > 0;
    if (key === "faq") return cfg.faq.items.length > 0;
    if (key === "contact") {
      const c = cfg.contact;
      return Boolean(c.phone || c.email || c.whatsapp || c.address || c.hours || Object.keys(c.social).length || (c.map.enabled && c.map.embedUrl));
    }
    return false;
  }

  function activeSections(cfg) {
    return cfg.sections.filter((key) => sectionHasContent(cfg, key));
  }

  /* ---------- SEO ---------- */
  function buildSeo(cfg) {
    const active = activeSections(cfg);
    const title = cfg.seo.title || cfg.brand.name;
    const description = cfg.seo.description || cfg.brand.description || "";
    const canonical = cfg.seo.url || "";
    const absoluteImage = canonical ? absoluteAsset(cfg, cfg.seo.image, canonical) : "";
    const preload = active.includes("hero") && cfg.hero.image ? assetUrl(cfg, cfg.hero.image) : "";
    return {
      title,
      description,
      canonical,
      image: absoluteImage,
      imageAlt: cfg.seo.imageAlt,
      locale: cfg.seo.locale,
      siteName: cfg.brand.name,
      schemaType: cfg.seo.schemaType,
      themeColor: cfg.theme.ink,
      preload,
      jsonld: buildJsonLd(cfg, canonical, absoluteImage),
      active,
    };
  }

  function buildJsonLd(cfg, canonical, absoluteImage) {
    const contact = cfg.contact;
    const ld = {
      "@context": "https://schema.org",
      "@type": cfg.seo.schemaType,
      name: cfg.brand.name,
    };
    if (cfg.brand.description) ld.description = cfg.brand.description;
    if (contact.phone) ld.telephone = contact.phone;
    if (contact.email) ld.email = contact.email;
    if (contact.address || contact.locality || contact.region) {
      ld.address = { "@type": "PostalAddress" };
      if (contact.address) ld.address.streetAddress = contact.address;
      if (contact.locality) ld.address.addressLocality = contact.locality;
      if (contact.region) ld.address.addressRegion = contact.region;
      if (contact.country) ld.address.addressCountry = contact.country;
    }
    if (contact.hoursSpec.length) {
      ld.openingHoursSpecification = contact.hoursSpec.map((item) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: item.days,
        opens: item.opens,
        closes: item.closes,
      }));
    }
    if (canonical) {
      ld.url = canonical;
      if (absoluteImage) ld.image = absoluteImage;
    }
    const sameAs = Object.keys(contact.social).map((key) => contact.social[key]);
    if (sameAs.length) ld.sameAs = sameAs;
    return ld;
  }

  function renderSeoBlock(seo) {
    const lines = [];
    lines.push(`  <title>${esc(seo.title)}</title>`);
    if (seo.description) lines.push(`  <meta name="description" content="${esc(seo.description)}">`);
    lines.push(`  <meta name="theme-color" content="${esc(seo.themeColor)}">`);
    lines.push(`  <meta property="og:type" content="website">`);
    lines.push(`  <meta property="og:title" content="${esc(seo.title)}">`);
    if (seo.description) lines.push(`  <meta property="og:description" content="${esc(seo.description)}">`);
    lines.push(`  <meta property="og:site_name" content="${esc(seo.siteName)}">`);
    lines.push(`  <meta property="og:locale" content="${esc(seo.locale)}">`);
    lines.push(`  <meta name="twitter:card" content="${seo.image ? "summary_large_image" : "summary"}">`);
    lines.push(`  <meta name="twitter:title" content="${esc(seo.title)}">`);
    if (seo.description) lines.push(`  <meta name="twitter:description" content="${esc(seo.description)}">`);
    if (seo.canonical) lines.push(`  <link rel="canonical" href="${esc(seo.canonical)}">`);
    if (seo.canonical) lines.push(`  <meta property="og:url" content="${esc(seo.canonical)}">`);
    if (seo.image) {
      lines.push(`  <meta property="og:image" content="${esc(seo.image)}">`);
      if (seo.imageAlt) lines.push(`  <meta property="og:image:alt" content="${esc(seo.imageAlt)}">`);
      lines.push(`  <meta name="twitter:image" content="${esc(seo.image)}">`);
    }
    if (seo.preload) lines.push(`  <link rel="preload" as="image" href="${esc(seo.preload)}" id="hero-preload">`);
    const json = JSON.stringify(seo.jsonld).replace(/</g, "\\u003c");
    lines.push(`  <script type="application/ld+json" id="ld-json">${json}</script>`);
    return lines.join("\n");
  }

  /* ---------- Utilidades de contraste ---------- */
  function relativeLuminance(hex) {
    if (!isSafeColor(hex)) return 0;
    const raw = hex.replace("#", "");
    const full = raw.length === 3 ? raw.split("").map((char) => char + char).join("") : raw;
    const channels = [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16) / 255);
    const linear = channels.map((value) => (value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)));
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  }

  function contrast(a, b) {
    const first = relativeLuminance(a);
    const second = relativeLuminance(b);
    const lighter = Math.max(first, second);
    const darker = Math.min(first, second);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function safeMapEmbed(value) {
    const url = safeUrl(value, ["https:"]);
    if (!url) return "";
    try {
      const host = new URL(url).hostname.toLowerCase();
      const allowed = host === "google.com" || /(^|\.)google\.[a-z.]+$/.test(host) || host === "openstreetmap.org" || host === "www.openstreetmap.org";
      return allowed ? url : "";
    } catch (error) {
      return "";
    }
  }

  return {
    CREDIT,
    SECTION_KEYS,
    NAV_KEYS,
    SECTION_IDS,
    DEFAULT_THEME,
    normalize,
    activeSections,
    sectionHasContent,
    buildSeo,
    renderSeoBlock,
    assetUrl,
    absoluteAsset,
    safeUrl,
    webUrl,
    isSafeColor,
    escapeHtml: esc,
    esc,
    contrast,
  };
});
