/* ==========================================================================
   ALMATE · MODELO B — PREMIUM · config-core.js
   Lógica pura (sin DOM), compartida por el navegador (engine.premium.js) y
   por la herramienta de línea de comandos (tools/sync-seo.js).

   Qué hace:
   · DEFAULTS: valores predeterminados seguros.
   · normalize(config): valida tipos, descarta valores inválidos y devuelve
     { cfg, issues }. Nunca lanza excepciones por una config incompleta.
   · Seguridad: esc() (texto→HTML), safeUrl() (lista de protocolos),
     isSafePath()/assetUrl() (rutas de imágenes).
   · SEO: buildSeo() y renderSeoBlock() (HTML estático del <head>).
   No hace falta editar este archivo para adaptar un cliente.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PremiumCore = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CREDIT = "Desarrollado por ALMATE · Soluciones digitales"; // obligatorio, no configurable
  const SECTION_KEYS = ["hero", "about", "services", "gallery", "testimonials", "location"];
  const SECTION_ID = { hero: "inicio", about: "nosotros", services: "rubros", gallery: "galeria", testimonials: "opiniones", location: "contacto" };
  const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const DEFAULTS = {
    sections: SECTION_KEYS.slice(),
    assetBase: "../img/",
    brand: { name: "", description: "" },
    seo: { title: "", description: "", url: "", image: "", locale: "es_AR", schemaType: "LocalBusiness" },
    contact: {
      phone: "", phoneHref: "", email: "", address: "", locality: "", hours: "", hoursSpec: [],
      whatsapp: "", whatsappMessage: "",
      map: { show: true, query: "", embedUrl: "", externalUrl: "" },
      social: {},
    },
    colors: {
      ink: "#1c1b19", graphite: "#2a2926", paper: "#faf7f2", ivory: "#f1ebdf", sand: "#e3d8c4",
      bronze: "#a5814f", bronzeText: "#7a5c31", champagne: "#d8c4a0", muted: "#6b665c",
    },
    fonts: {
      display: '"Cormorant Garamond", "Iowan Old Style", Georgia, serif',
      body: '"Inter", -apple-system, "Segoe UI", Roboto, sans-serif',
    },
    hero: { eyebrow: "", title: "", titleAccent: "", subtitle: "", image: "", imageAlt: "", ctaPrimary: "Consultar por WhatsApp", ctaSecondary: "", ctaSecondaryTarget: "services" },
    about: { navLabel: "Nosotros", label: "", title: "", paragraphs: [], image: "", imageAlt: "" },
    services: { navLabel: "Rubros", label: "", title: "", items: [] },
    gallery: { navLabel: "Galería", label: "", title: "", items: [] },
    testimonials: { navLabel: "Opiniones", label: "", title: "", items: [] },
    location: { navLabel: "Contacto", label: "Encontranos", title: "Contacto" },
    footer: { creditUrl: "" },
  };

  /* ---------- Seguridad: texto, URLs, rutas ---------- */
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  // Devuelve la URL normalizada si su protocolo está permitido; si no, "".
  // allowed: lista de protocolos, ej. ["https:", "http:"].
  function safeUrl(value, allowed) {
    if (typeof value !== "string") return "";
    const v = value.trim();
    if (!v || /[\u0000-\u001f\u007f\s]/.test(v)) return "";
    try {
      const u = new URL(v);
      return allowed.indexOf(u.protocol) !== -1 ? v : "";
    } catch (e) { return ""; }
  }
  const webUrl = (v) => safeUrl(v, ["https:", "http:"]);

  // Ruta de imagen válida: relativa sin "..", o http(s) absoluta. Nada de data:, javascript:, //host, "\".
  function isSafePath(p) {
    if (typeof p !== "string") return false;
    const v = p.trim();
    if (!v || v.length > 500) return false;
    if (/[\u0000-\u001f\u007f\\<>"'`]/.test(v)) return false;
    if (v.slice(0, 2) === "//") return false;
    if (/^[a-z][a-z0-9+.\-]*:/i.test(v)) return !!webUrl(v);
    return v.split("/").indexOf("..") === -1;
  }
  function assetUrl(cfg, p) {
    const v = String(p).trim();
    if (/^https?:/i.test(v)) return v;
    return cfg.assetBase + v.replace(/^\.?\//, "");
  }

  /* ---------- Normalización ---------- */
  const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  const clone = (v) => JSON.parse(JSON.stringify(v));

  function normalize(user) {
    const issues = [];
    const add = (level, path, msg) => issues.push({ level, path, msg });
    const cfg = clone(DEFAULTS);

    if (!isObj(user)) {
      add("error", "PREMIUM_CONFIG", "No se encontró una configuración válida (¿falta cargar config.premium.js antes del motor, o el objeto está mal escrito?). Se usan valores por defecto.");
      return { cfg, issues, ok: false };
    }

    // Claves desconocidas de primer nivel: casi siempre son errores de tipeo.
    Object.keys(user).forEach((k) => { if (!(k in DEFAULTS)) add("warn", k, "Clave desconocida (se ignora). ¿Error de tipeo?"); });

    const str = (path, v, def) => {
      if (v === undefined) return def;
      if (typeof v !== "string") { add("warn", path, `Debe ser texto (se recibió ${typeof v}). Se usa el valor por defecto.`); return def; }
      return v.trim();
    };
    const sectionObj = (key) => {
      const u = user[key];
      if (u === undefined) return {};
      if (!isObj(u)) { add("warn", key, "Debe ser un objeto { … }. Se usan valores por defecto."); return {}; }
      Object.keys(u).forEach((k) => { if (!(k in DEFAULTS[key])) add("warn", `${key}.${k}`, "Clave desconocida (se ignora)."); });
      return u;
    };
    const pathOk = (path, v) => {
      if (v === "" || v === undefined) return "";
      if (isSafePath(v)) return v.trim();
      add("warn", path, `Ruta de imagen no válida o insegura ("${String(v).slice(0, 60)}"). Se omite.`);
      return "";
    };

    // sections
    if (user.sections !== undefined) {
      if (!Array.isArray(user.sections)) add("warn", "sections", "Debe ser una lista de nombres. Se usa el orden por defecto.");
      else {
        const seen = {}, out = [];
        user.sections.forEach((s) => {
          if (SECTION_KEYS.indexOf(s) === -1) add("warn", "sections", `Sección inexistente "${s}" (válidas: ${SECTION_KEYS.join(", ")}). Se ignora.`);
          else if (seen[s]) add("warn", "sections", `Sección repetida "${s}". Se ignora el duplicado.`);
          else { seen[s] = 1; out.push(s); }
        });
        if (out.length) cfg.sections = out;
        else add("error", "sections", "No quedó ninguna sección válida. Se usa el orden por defecto.");
      }
    }

    // assetBase
    if (user.assetBase !== undefined) {
      const b = str("assetBase", user.assetBase, DEFAULTS.assetBase);
      const rest = b.replace(/^(\.\.\/)+/, ""); // se permiten "../" solo al inicio (la carpeta img está un nivel arriba)
      if (b && (rest === "" || isSafePath(rest))) cfg.assetBase = b.replace(/\/*$/, "/");
      else add("warn", "assetBase", "Ruta base de imágenes no válida. Se usa ../img/");
    }

    // brand / seo
    const brand = sectionObj("brand");
    cfg.brand.name = str("brand.name", brand.name, "");
    cfg.brand.description = str("brand.description", brand.description, "");
    if (!cfg.brand.name) add("error", "brand.name", "Falta el nombre comercial (brand.name). Es obligatorio.");

    const seo = sectionObj("seo");
    cfg.seo.title = str("seo.title", seo.title, "");
    cfg.seo.description = str("seo.description", seo.description, "");
    cfg.seo.locale = /^[a-z]{2}_[A-Z]{2}$/.test(seo.locale || "") ? seo.locale : (seo.locale !== undefined ? (add("warn", "seo.locale", "Formato esperado: es_AR. Se usa es_AR."), "es_AR") : "es_AR");
    cfg.seo.schemaType = /^[A-Za-z]{3,40}$/.test(seo.schemaType || "") ? seo.schemaType : (seo.schemaType !== undefined ? (add("warn", "seo.schemaType", "Tipo schema.org no válido. Se usa LocalBusiness."), "LocalBusiness") : "LocalBusiness");
    if (seo.url !== undefined && seo.url !== "") {
      const u = webUrl(seo.url);
      if (u && /^https?:\/\/[^/]+\/.*\/$|^https?:\/\/[^/]+\/$/.test(u)) cfg.seo.url = u;
      else add("warn", "seo.url", 'Debe ser una URL http(s) completa terminada en "/" (ej. https://cliente.com/premium/). Se omiten canonical, og:url y og:image.');
    }
    cfg.seo.image = pathOk("seo.image", seo.image);
    if (!cfg.seo.title) cfg.seo.title = cfg.brand.name;
    if (!cfg.seo.description) cfg.seo.description = cfg.brand.description;
    if (!cfg.seo.description) add("warn", "seo.description", "Falta la meta description.");

    // contact
    const ct = sectionObj("contact");
    ["phone", "email", "address", "locality", "hours", "whatsappMessage"].forEach((k) => (cfg.contact[k] = str(`contact.${k}`, ct[k], "")));
    if (cfg.contact.email && !/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(cfg.contact.email)) {
      add("warn", "contact.email", `Email no válido ("${cfg.contact.email}"). Se omite.`); cfg.contact.email = "";
    }
    const digits = (cfg.contact.phone || "").replace(/\D/g, "");
    if (ct.phoneHref) {
      if (typeof ct.phoneHref === "string" && /^tel:\+?[\d\-().\s]{5,25}$/.test(ct.phoneHref.trim())) cfg.contact.phoneHref = ct.phoneHref.trim();
      else add("warn", "contact.phoneHref", 'Debe tener el formato "tel:+541112345678". Se deriva de contact.phone.');
    }
    if (!cfg.contact.phoneHref && digits.length >= 6) cfg.contact.phoneHref = "tel:+" + digits.replace(/^0+/, "");
    if (ct.whatsapp !== undefined && ct.whatsapp !== "") {
      const w = String(ct.whatsapp).replace(/[\s+\-()]/g, "");
      if (/^\d{8,15}$/.test(w)) cfg.contact.whatsapp = w;
      else add("warn", "contact.whatsapp", "Debe tener entre 8 y 15 dígitos con código de país (ej. 541112345678). Se desactivan los botones de WhatsApp.");
    }
    if (Array.isArray(ct.hoursSpec)) {
      ct.hoursSpec.forEach((h, i) => {
        const days = isObj(h) && Array.isArray(h.days) ? h.days.filter((d) => WEEKDAYS.indexOf(d) !== -1) : [];
        if (days.length && /^\d{2}:\d{2}$/.test(h.opens) && /^\d{2}:\d{2}$/.test(h.closes)) cfg.contact.hoursSpec.push({ days, opens: h.opens, closes: h.closes });
        else add("warn", `contact.hoursSpec[${i}]`, "Entrada inválida (días en inglés, horas HH:MM). Se ignora.");
      });
    } else if (ct.hoursSpec !== undefined) add("warn", "contact.hoursSpec", "Debe ser una lista. Se ignora.");

    const map = isObj(ct.map) ? ct.map : (ct.map !== undefined ? (add("warn", "contact.map", "Debe ser un objeto { show, query, embedUrl, externalUrl }."), {}) : {});
    cfg.contact.map.show = map.show === undefined ? true : !!map.show;
    cfg.contact.map.query = str("contact.map.query", map.query, "");
    if (map.embedUrl) { const e = safeUrl(map.embedUrl, ["https:"]); if (e) cfg.contact.map.embedUrl = e; else add("warn", "contact.map.embedUrl", "Debe ser una URL https. Se ignora."); }
    if (map.externalUrl) { const e = webUrl(map.externalUrl); if (e) cfg.contact.map.externalUrl = e; else add("warn", "contact.map.externalUrl", "URL no válida. Se ignora."); }
    if (cfg.contact.map.show && !cfg.contact.map.query && !cfg.contact.map.embedUrl) {
      cfg.contact.map.show = false; // nada que mostrar: no se renderiza
      if (cfg.contact.address) add("warn", "contact.map", "Mapa activado pero sin query ni embedUrl: no se muestra.");
    }
    if (isObj(ct.social)) {
      Object.keys(ct.social).forEach((k) => {
        const v = ct.social[k]; if (!v) return;
        const u = webUrl(v);
        if (u && /^[A-Za-z]{2,20}$/.test(k)) cfg.contact.social[k] = u; else add("warn", `contact.social.${k}`, "Debe ser una URL http(s) válida (y un nombre de red simple). Se omite.");
      });
    } else if (ct.social !== undefined) add("warn", "contact.social", "Debe ser un objeto { instagram: 'https://…' }. Se ignora.");

    // colors / fonts
    const col = sectionObj("colors");
    Object.keys(DEFAULTS.colors).forEach((k) => {
      if (col[k] === undefined) return;
      if (typeof col[k] === "string" && /^#[0-9a-fA-F]{6}$/.test(col[k].trim())) cfg.colors[k] = col[k].trim();
      else add("warn", `colors.${k}`, 'Debe ser un color hexadecimal de 6 dígitos (ej. "#1c1b19"). Se usa el predeterminado.');
    });
    const fnt = sectionObj("fonts");
    ["display", "body"].forEach((k) => {
      if (fnt[k] === undefined) return;
      if (typeof fnt[k] === "string" && /^[\w\s"',.\-]{3,200}$/.test(fnt[k])) cfg.fonts[k] = fnt[k].trim();
      else add("warn", `fonts.${k}`, "Lista de fuentes no válida (solo letras, comillas, comas y guiones). Se usa la predeterminada.");
    });

    // hero
    const h = sectionObj("hero");
    ["eyebrow", "title", "titleAccent", "subtitle", "imageAlt", "ctaPrimary", "ctaSecondary"].forEach((k) => (cfg.hero[k] = str(`hero.${k}`, h[k], DEFAULTS.hero[k])));
    cfg.hero.image = pathOk("hero.image", h.image);
    if (cfg.hero.image && !cfg.hero.imageAlt) add("warn", "hero.imageAlt", "La imagen del hero no tiene texto alternativo.");
    if (h.ctaSecondaryTarget !== undefined) {
      if (SECTION_KEYS.indexOf(h.ctaSecondaryTarget) !== -1) cfg.hero.ctaSecondaryTarget = h.ctaSecondaryTarget;
      else add("warn", "hero.ctaSecondaryTarget", `Debe ser una de: ${SECTION_KEYS.join(", ")}.`);
    }
    if (!cfg.hero.title) add("warn", "hero.title", "El hero no tiene título (h1).");

    // about
    const a = sectionObj("about");
    ["navLabel", "label", "title", "imageAlt"].forEach((k) => (cfg.about[k] = str(`about.${k}`, a[k], DEFAULTS.about[k])));
    cfg.about.image = pathOk("about.image", a.image);
    if (a.paragraphs !== undefined) {
      if (Array.isArray(a.paragraphs)) cfg.about.paragraphs = a.paragraphs.filter((p) => typeof p === "string" && p.trim()).map((p) => p.trim());
      else add("warn", "about.paragraphs", "Debe ser una lista de textos. Se ignora.");
    }

    // listas con items
    const listSection = (key, build) => {
      const s = sectionObj(key);
      ["navLabel", "label", "title"].forEach((k) => (cfg[key][k] = str(`${key}.${k}`, s[k], DEFAULTS[key][k])));
      if (s.items === undefined) return;
      if (!Array.isArray(s.items)) { add("warn", `${key}.items`, "Debe ser una lista. Se ignora."); return; }
      s.items.forEach((it, i) => {
        const out = isObj(it) ? build(it, `${key}.items[${i}]`) : null;
        if (out) cfg[key].items.push(out); else add("warn", `${key}.items[${i}]`, "Elemento inválido o incompleto. Se omite.");
      });
    };
    listSection("services", (it, p) => {
      const name = str(p + ".name", it.name, "");
      if (!name) return null;
      return { name, description: str(p + ".description", it.description, ""), price: str(p + ".price", it.price, ""), image: pathOk(p + ".image", it.image), alt: str(p + ".alt", it.alt, "") };
    });
    listSection("gallery", (it, p) => {
      const src = pathOk(p + ".src", it.src);
      if (!src) return null;
      const alt = str(p + ".alt", it.alt, "");
      if (!alt) add("warn", p + ".alt", "Falta el texto alternativo de la imagen.");
      return { src, alt };
    });
    listSection("testimonials", (it, p) => {
      const text = str(p + ".text", it.text, ""), author = str(p + ".author", it.author, "");
      return text && author ? { text, author, role: str(p + ".role", it.role, "") } : null;
    });

    // location / footer
    const l = sectionObj("location");
    ["navLabel", "label", "title"].forEach((k) => (cfg.location[k] = str(`location.${k}`, l[k], DEFAULTS.location[k])));
    const f = sectionObj("footer");
    if (f.creditUrl) { const u = webUrl(f.creditUrl); if (u) cfg.footer.creditUrl = u; else add("warn", "footer.creditUrl", "URL no válida. Se ignora."); }

    // etiquetas de navegación vacías → valor por defecto
    SECTION_KEYS.forEach((k) => { if (cfg[k] && "navLabel" in cfg[k] && !cfg[k].navLabel) cfg[k].navLabel = DEFAULTS[k].navLabel; });

    return { cfg, issues, ok: !issues.some((i) => i.level === "error") };
  }

  /* ---------- Secciones que realmente se renderizan ---------- */
  function sectionHasContent(cfg, k) {
    const c = cfg.contact;
    switch (k) {
      case "hero": return !!(cfg.hero.title || cfg.hero.image);
      case "about": return !!(cfg.about.title || cfg.about.paragraphs.length);
      case "services": case "gallery": case "testimonials": return cfg[k].items.length > 0;
      case "location": return !!(c.phone || c.email || c.address || c.hours || c.whatsapp || (c.map.show && (c.map.query || c.map.embedUrl)));
    }
    return false;
  }
  function enabledSections(cfg, issues) {
    return cfg.sections.filter((k) => {
      const ok = sectionHasContent(cfg, k);
      // testimonios vacíos son un caso normal (no se inventan): sin aviso
      if (!ok && issues && k !== "testimonials") issues.push({ level: "warn", path: "sections." + k, msg: `La sección "${k}" está habilitada pero no tiene contenido: no se muestra.` });
      return ok;
    });
  }

  /* ---------- SEO ---------- */
  function jsonLd(cfg, canonical, ogImage) {
    const c = cfg.contact;
    const ld = { "@context": "https://schema.org", "@type": cfg.seo.schemaType, name: cfg.brand.name };
    if (cfg.seo.description) ld.description = cfg.seo.description;
    if (canonical) ld.url = canonical;
    if (ogImage) ld.image = ogImage;
    if (c.phone) ld.telephone = c.phone;
    if (c.email) ld.email = c.email;
    if (c.address || c.locality) {
      ld.address = { "@type": "PostalAddress" };
      if (c.address) ld.address.streetAddress = c.address;
      if (c.locality) ld.address.addressLocality = c.locality;
    }
    if (c.hoursSpec.length) ld.openingHoursSpecification = c.hoursSpec.map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: h.days, opens: h.opens, closes: h.closes }));
    const same = Object.keys(c.social).map((k) => c.social[k]);
    if (same.length) ld.sameAs = same;
    return ld;
  }
  function buildSeo(cfg, sections) {
    const canonical = cfg.seo.url;
    let ogImage = "";
    if (cfg.seo.image && canonical) {
      try { ogImage = new URL(assetUrl(cfg, cfg.seo.image), canonical).href; } catch (e) { ogImage = ""; }
    }
    return {
      title: cfg.seo.title, description: cfg.seo.description, canonical, ogImage,
      locale: cfg.seo.locale, siteName: cfg.brand.name,
      heroPreload: sections.indexOf("hero") !== -1 && cfg.hero.image ? assetUrl(cfg, cfg.hero.image) : "",
      jsonld: jsonLd(cfg, canonical, ogImage),
    };
  }
  // HTML estático del <head> (lo escribe tools/sync-seo.js entre los marcadores).
  function renderSeoBlock(seo) {
    const m = (a, k, v) => `  <meta ${a}="${k}" content="${esc(v)}">`;
    const L = [];
    L.push(`  <title>${esc(seo.title)}</title>`);
    if (seo.description) L.push(m("name", "description", seo.description));
    if (seo.canonical) L.push(`  <link rel="canonical" href="${esc(seo.canonical)}">`);
    L.push(m("property", "og:type", "website"), m("property", "og:title", seo.title));
    if (seo.description) L.push(m("property", "og:description", seo.description));
    L.push(m("property", "og:site_name", seo.siteName), m("property", "og:locale", seo.locale));
    if (seo.canonical) L.push(m("property", "og:url", seo.canonical));
    if (seo.ogImage) L.push(m("property", "og:image", seo.ogImage));
    L.push(m("name", "twitter:card", seo.ogImage ? "summary_large_image" : "summary"), m("name", "twitter:title", seo.title));
    if (seo.description) L.push(m("name", "twitter:description", seo.description));
    if (seo.ogImage) L.push(m("name", "twitter:image", seo.ogImage));
    if (seo.heroPreload) L.push(`  <link rel="preload" as="image" href="${esc(seo.heroPreload)}" fetchpriority="high">`);
    const json = JSON.stringify(seo.jsonld, null, 2).replace(/</g, "\\u003c");
    L.push(`  <script type="application/ld+json" id="ld-json">\n${json}\n  </script>`);
    return L.join("\n");
  }

  return { CREDIT, SECTION_KEYS, SECTION_ID, DEFAULTS, esc, safeUrl, webUrl, isSafePath, assetUrl, normalize, enabledSections, buildSeo, renderSeoBlock };
});
