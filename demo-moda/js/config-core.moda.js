/* ==========================================================================
   ALMATE · Demo Moda · config-core.moda.js
   Lógica pura (sin DOM), compartida por el navegador (engine.moda.js) y por
   tools/sync-seo.js. No hace falta editar este archivo para adaptar un local.

   · normaliza la configuración y descarta valores inseguros.
   · escapa texto y valida URLs, colores, rutas y el número de WhatsApp.
   · construye el bloque SEO estático y el JSON-LD (sin datos inventados).
   ========================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ModaCore = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CREDIT = "Desarrollado por ALMATE · Soluciones digitales.";
  const SECTION_KEYS = ["hero", "categories", "collection", "catalog", "lookbook", "benefits", "about", "faq"];
  const THEME_KEYS = ["charcoal", "offwhite", "stone", "sand", "grey", "line"];

  const DEFAULT_THEME = {
    charcoal: "#171717",
    offwhite: "#faf9f6",
    stone: "#e9e7e2",
    sand: "#d8cbb8",
    grey: "#6f6b66",
    line: "#e4e1da",
  };

  const DEFAULTS = {
    demo: true,
    assetBase: "assets/",
    brand: { name: "", wordmark: "", tagline: "", description: "", logo: "" },
    theme: Object.assign({}, DEFAULT_THEME),
    fonts: {
      display: '"Iowan Old Style", "Palatino Linotype", Palatino, "Playfair Display", Georgia, "Times New Roman", serif',
      body: '"Inter", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    contact: { whatsapp: "", instagram: "", email: "", address: "", hours: "" },
    announcement: { enabled: false, text: "", link: "" },
    navigation: [],
    hero: { eyebrow: "", title: "", subtitle: "", image: "", imageAlt: "", ctaLabel: "", ctaAnchor: "#catalogo" },
    categories: { title: "", subtitle: "", items: [] },
    collection: { eyebrow: "", title: "", description: "", image: "", imageAlt: "", ctaLabel: "", ctaAnchor: "#catalogo", productIds: [] },
    catalog: { title: "", subtitle: "" },
    lookbook: { title: "", subtitle: "", items: [] },
    benefits: { title: "", items: [] },
    about: { eyebrow: "", title: "", paragraphs: [], image: "", imageAlt: "" },
    faq: { title: "", items: [] },
    seo: { title: "", description: "", url: "", image: "", imageAlt: "", locale: "es_AR" },
    sections: SECTION_KEYS.slice(),
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

  function isSafeColor(value) {
    return typeof value === "string" && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
  }

  /* ---------- Utilidades ---------- */
  const isObj = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const clone = (value) => JSON.parse(JSON.stringify(value));

  function formatPrice(value) {
    if (value == null || value === "" || Number.isNaN(Number(value))) return "";
    const number = Math.round(Number(value));
    if (!number) return "";
    return "$" + number.toLocaleString("es-AR");
  }

  function absoluteAsset(assetBase, value, pageUrl) {
    const relative = (assetBase || "") + "/" + String(value || "").replace(/^\.?\//, "");
    if (!pageUrl) return "";
    if (/^https?:/i.test(relative)) return relative;
    try {
      return new URL(relative, pageUrl).href;
    } catch (error) {
      return "";
    }
  }

  /* ---------- Normalización ---------- */
  function normalize(user) {
    const issues = [];
    const add = (level, path, msg) => issues.push({ level, path, msg });
    const cfg = clone(DEFAULTS);

    if (!isObj(user)) {
      add("error", "MODA_CONFIG", "No se encontró una configuración válida. ¿Falta cargar config.moda.js antes que el motor?");
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
    cfg.brand.name = readString("brand.name", brandUser.name, "");
    if (!cfg.brand.name) {
      add("error", "brand.name", "El nombre comercial es obligatorio. Se usa \"Marca\" provisionalmente.");
      cfg.brand.name = "Marca";
    }
    cfg.brand.wordmark = readString("brand.wordmark", brandUser.wordmark, cfg.brand.name);
    cfg.brand.tagline = readString("brand.tagline", brandUser.tagline, "");
    cfg.brand.description = readString("brand.description", brandUser.description, "");
    cfg.brand.logo = readImage("brand.logo", brandUser.logo);

    /* Paleta */
    const themeUser = asObject("theme", user.theme);
    Object.keys(themeUser).forEach((key) => {
      if (!THEME_KEYS.includes(key)) {
        add("warn", `theme.${key}`, "Color desconocido (se ignora).");
        return;
      }
      const value = readString(`theme.${key}`, themeUser[key], DEFAULT_THEME[key]);
      if (isSafeColor(value)) cfg.theme[key] = value;
      else add("warn", `theme.${key}`, "Usá un color hexadecimal de 3 o 6 dígitos.");
    });
    [["charcoal", "offwhite"], ["grey", "offwhite"]].forEach(([foreground, background]) => {
      const ratio = contrast(cfg.theme[foreground], cfg.theme[background]);
      if (ratio && ratio < 4.5) add("warn", "theme", `Contraste bajo entre ${foreground} y ${background} (${ratio.toFixed(2)}:1).`);
    });

    /* Tipografías */
    const fontsUser = asObject("fonts", user.fonts);
    cfg.fonts.display = readString("fonts.display", fontsUser.display, cfg.fonts.display);
    cfg.fonts.body = readString("fonts.body", fontsUser.body, cfg.fonts.body);

    /* Contacto */
    const contactUser = asObject("contact", user.contact);
    cfg.contact.whatsapp = readString("contact.whatsapp", contactUser.whatsapp, "").replace(/\D/g, "");
    if (cfg.contact.whatsapp && (cfg.contact.whatsapp.length < 8 || cfg.contact.whatsapp.length > 15)) {
      add("warn", "contact.whatsapp", "El número de WhatsApp debe tener entre 8 y 15 dígitos, con código de país y sin + ni separadores.");
      cfg.contact.whatsapp = "";
    }
    cfg.contact.instagram = readWebUrl("contact.instagram", contactUser.instagram);
    cfg.contact.email = readString("contact.email", contactUser.email, "").toLowerCase();
    if (cfg.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cfg.contact.email)) {
      add("warn", "contact.email", "Email inválido. Se omite.");
      cfg.contact.email = "";
    }
    cfg.contact.address = readString("contact.address", contactUser.address, "");
    cfg.contact.hours = readString("contact.hours", contactUser.hours, "");

    /* Franja superior */
    const announcementUser = asObject("announcement", user.announcement);
    cfg.announcement.enabled = readBool("announcement.enabled", announcementUser.enabled, false);
    cfg.announcement.text = readString("announcement.text", announcementUser.text, "");
    cfg.announcement.link = readWebUrl("announcement.link", announcementUser.link);
    if (cfg.announcement.enabled && !cfg.announcement.text) {
      add("warn", "announcement.text", "La franja superior está activa pero sin texto. Se oculta.");
      cfg.announcement.enabled = false;
    }

    /* Navegación */
    cfg.navigation = normalizeNavigation(user.navigation, add);

    /* Hero */
    const heroUser = asObject("hero", user.hero);
    cfg.hero.eyebrow = readString("hero.eyebrow", heroUser.eyebrow, "");
    cfg.hero.title = readString("hero.title", heroUser.title, "");
    cfg.hero.subtitle = readString("hero.subtitle", heroUser.subtitle, "");
    cfg.hero.image = readImage("hero.image", heroUser.image);
    cfg.hero.imageAlt = readString("hero.imageAlt", heroUser.imageAlt, "");
    cfg.hero.ctaLabel = readString("hero.ctaLabel", heroUser.ctaLabel, "");
    cfg.hero.ctaAnchor = normalizeAnchor(heroUser.ctaAnchor, "#catalogo", add, "hero.ctaAnchor");

    /* Categorías */
    const categoriesUser = asObject("categories", user.categories);
    cfg.categories.title = readString("categories.title", categoriesUser.title, "");
    cfg.categories.subtitle = readString("categories.subtitle", categoriesUser.subtitle, "");
    cfg.categories.items = readArray("categories.items", categoriesUser.items, [])
      .map((item, index) => {
        if (!isObj(item)) return null;
        const id = readString(`categories.items[${index}].id`, item.id, "");
        const name = readString(`categories.items[${index}].name`, item.name, "");
        if (!id || !name) return null;
        return {
          id,
          name,
          image: readImage(`categories.items[${index}].image`, item.image),
          imageAlt: readString(`categories.items[${index}].imageAlt`, item.imageAlt, name),
          filter: normalizeFilter(item.filter, add, `categories.items[${index}].filter`),
        };
      })
      .filter(Boolean);

    /* Colección */
    const collectionUser = asObject("collection", user.collection);
    cfg.collection.eyebrow = readString("collection.eyebrow", collectionUser.eyebrow, "");
    cfg.collection.title = readString("collection.title", collectionUser.title, "");
    cfg.collection.description = readString("collection.description", collectionUser.description, "");
    cfg.collection.image = readImage("collection.image", collectionUser.image);
    cfg.collection.imageAlt = readString("collection.imageAlt", collectionUser.imageAlt, "");
    cfg.collection.ctaLabel = readString("collection.ctaLabel", collectionUser.ctaLabel, "");
    cfg.collection.ctaAnchor = normalizeAnchor(collectionUser.ctaAnchor, "#catalogo", add, "collection.ctaAnchor");
    cfg.collection.productIds = readArray("collection.productIds", collectionUser.productIds, [])
      .map((value, index) => readString(`collection.productIds[${index}]`, value, ""))
      .filter(Boolean);

    /* Catálogo */
    const catalogUser = asObject("catalog", user.catalog);
    cfg.catalog.title = readString("catalog.title", catalogUser.title, "");
    cfg.catalog.subtitle = readString("catalog.subtitle", catalogUser.subtitle, "");

    /* Lookbook */
    const lookbookUser = asObject("lookbook", user.lookbook);
    cfg.lookbook.title = readString("lookbook.title", lookbookUser.title, "");
    cfg.lookbook.subtitle = readString("lookbook.subtitle", lookbookUser.subtitle, "");
    cfg.lookbook.items = readArray("lookbook.items", lookbookUser.items, [])
      .map((item, index) => {
        if (!isObj(item)) return null;
        const image = readImage(`lookbook.items[${index}].image`, item.image);
        const caption = readString(`lookbook.items[${index}].caption`, item.caption, "");
        if (!image) return null;
        return { image, imageAlt: readString(`lookbook.items[${index}].imageAlt`, item.imageAlt, caption), caption };
      })
      .filter(Boolean);

    /* Beneficios */
    const benefitsUser = asObject("benefits", user.benefits);
    cfg.benefits.title = readString("benefits.title", benefitsUser.title, "");
    cfg.benefits.items = readArray("benefits.items", benefitsUser.items, [])
      .map((item, index) => {
        if (!isObj(item)) return null;
        const title = readString(`benefits.items[${index}].title`, item.title, "");
        const text = readString(`benefits.items[${index}].text`, item.text, "");
        return title && text ? { title, text } : null;
      })
      .filter(Boolean);

    /* Sobre la marca */
    const aboutUser = asObject("about", user.about);
    cfg.about.eyebrow = readString("about.eyebrow", aboutUser.eyebrow, "");
    cfg.about.title = readString("about.title", aboutUser.title, "");
    cfg.about.paragraphs = readArray("about.paragraphs", aboutUser.paragraphs, [])
      .map((value, index) => readString(`about.paragraphs[${index}]`, value, ""))
      .filter(Boolean);
    cfg.about.image = readImage("about.image", aboutUser.image);
    cfg.about.imageAlt = readString("about.imageAlt", aboutUser.imageAlt, "");

    /* FAQ */
    const faqUser = asObject("faq", user.faq);
    cfg.faq.title = readString("faq.title", faqUser.title, "");
    cfg.faq.items = readArray("faq.items", faqUser.items, [])
      .map((item, index) => {
        if (!isObj(item)) return null;
        const q = readString(`faq.items[${index}].q`, item.q, "");
        const a = readString(`faq.items[${index}].a`, item.a, "");
        return q && a ? { q, a } : null;
      })
      .filter(Boolean);

    /* SEO */
    const seoUser = asObject("seo", user.seo);
    cfg.seo.title = readString("seo.title", seoUser.title, "");
    if (!cfg.seo.title) cfg.seo.title = cfg.brand.name + (cfg.brand.tagline ? " — " + cfg.brand.tagline : "");
    cfg.seo.description = readString("seo.description", seoUser.description, cfg.brand.description);
    cfg.seo.url = readWebUrl("seo.url", seoUser.url);
    cfg.seo.image = readImage("seo.image", seoUser.image);
    cfg.seo.imageAlt = readString("seo.imageAlt", seoUser.imageAlt, "");
    cfg.seo.locale = readString("seo.locale", seoUser.locale, "es_AR");

    /* assetBase */
    const base = readString("assetBase", user.assetBase, "assets/");
    cfg.assetBase = base ? base.replace(/\/+$/, "") + "/" : "";

    /* Secciones */
    const rawSections = readArray("sections", user.sections, SECTION_KEYS.slice());
    const seen = new Set();
    cfg.sections = rawSections
      .map((key) => {
        if (typeof key !== "string") return "";
        const clean = key.trim();
        if (!SECTION_KEYS.includes(clean)) {
          add("warn", "sections", `La sección "${clean}" no existe. Se omite.`);
          return "";
        }
        if (seen.has(clean)) return "";
        seen.add(clean);
        return clean;
      })
      .filter(Boolean);
    if (!cfg.sections.length) cfg.sections = SECTION_KEYS.slice();

    return { cfg, issues, ok: true };
  }

  function normalizeNavigation(value, add) {
    return (Array.isArray(value) ? value : [])
      .map((item, index) => {
        if (!isObj(item)) return null;
        const label = typeof item.label === "string" ? item.label.trim() : "";
        if (!label) return null;
        const anchor = typeof item.anchor === "string" ? item.anchor.trim() : "";
        const filter = normalizeFilter(item.filter, add, `navigation[${index}].filter`);
        if (!anchor && !filter) {
          add("warn", `navigation[${index}]`, "Cada enlace necesita un destino (anchor o filter). Se omite.");
          return null;
        }
        return { label, anchor: /^#[a-z0-9-]+$/i.test(anchor) ? anchor : "", filter };
      })
      .filter(Boolean);
  }

  function normalizeFilter(value, add, path) {
    if (!isObj(value)) return null;
    const gender = typeof value.gender === "string" ? value.gender.trim().toLowerCase() : "";
    const category = typeof value.category === "string" ? value.category.trim().toLowerCase() : "";
    const sale = typeof value.sale === "boolean" ? value.sale : false;
    if (!gender && !category && !sale) {
      if (add) add("warn", path, "El filtro debe indicar gender, category o sale. Se omite.");
      return null;
    }
    return { gender, category, sale };
  }

  function normalizeAnchor(value, fallback, add, path) {
    const raw = typeof value === "string" ? value.trim() : fallback;
    if (/^#[a-z0-9-]+$/i.test(raw)) return raw;
    if (add) add("warn", path, "El ancla debe tener el formato #seccion. Se usa el valor por defecto.");
    return fallback;
  }

  /* ---------- SEO ---------- */
  function buildSeo(cfg) {
    const title = cfg.seo.title || cfg.brand.name;
    const description = cfg.seo.description || cfg.brand.description || "";
    const canonical = cfg.seo.url || "";
    const absoluteImage = canonical ? absoluteAsset(cfg.assetBase, cfg.seo.image, canonical) : "";
    return {
      title,
      description,
      canonical,
      image: absoluteImage,
      imageAlt: cfg.seo.imageAlt,
      locale: cfg.seo.locale,
      siteName: cfg.brand.name,
      themeColor: cfg.theme.charcoal,
      jsonld: buildJsonLd(cfg, canonical, absoluteImage),
    };
  }

  function buildJsonLd(cfg, canonical, absoluteImage) {
    const ld = { "@context": "https://schema.org", "@type": "ClothingStore", name: cfg.brand.name };
    if (cfg.brand.description) ld.description = cfg.brand.description;
    if (cfg.contact.email) ld.email = cfg.contact.email;
    if (cfg.contact.address) {
      ld.address = { "@type": "PostalAddress", streetAddress: cfg.contact.address };
    }
    if (canonical) {
      ld.url = canonical;
      if (absoluteImage) ld.image = absoluteImage;
    }
    const sameAs = [];
    if (cfg.contact.instagram) sameAs.push(cfg.contact.instagram);
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
    const json = JSON.stringify(seo.jsonld).replace(/</g, "\\u003c");
    lines.push(`  <script type="application/ld+json" id="ld-json">${json}</script>`);
    return lines.join("\n");
  }

  /* ---------- Contraste ---------- */
  function relativeLuminance(hex) {
    if (!isSafeColor(hex)) return 0;
    const raw = hex.replace("#", "");
    const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
    const channels = [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16) / 255);
    const linear = channels.map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  }

  function contrast(a, b) {
    const first = relativeLuminance(a);
    const second = relativeLuminance(b);
    const lighter = Math.max(first, second);
    const darker = Math.min(first, second);
    return (lighter + 0.05) / (darker + 0.05);
  }

  return {
    CREDIT,
    SECTION_KEYS,
    THEME_KEYS,
    normalize,
    buildSeo,
    renderSeoBlock,
    buildJsonLd,
    formatPrice,
    absoluteAsset,
    safeUrl,
    webUrl,
    isSafeColor,
    isSafeAssetPath,
    escapeHtml: esc,
    esc,
    contrast,
  };
});
