/* ==========================================================================
   ALMATE · Demo Moda · engine.moda.js
   Orquestador: aplica la configuración, renderiza las secciones estáticas,
   monta catálogo, ficha, carrito y navegación. No editar para un local:
   toda la adaptación vive en config.moda.js y products.moda.js.
   ========================================================================== */
(function () {
  "use strict";

  const core = window.ModaCore;
  const productApi = window.ModaProducts;
  const cartApi = window.ModaCart;
  const waApi = window.ModaWhatsApp;
  const PREFIX = "[ALMATE Moda]";
  const $ = (selector, context) => (context || document).querySelector(selector);
  const $$ = (selector, context) => Array.from((context || document).querySelectorAll(selector));
  const esc = core ? core.esc : (value) => String(value == null ? "" : value);
  const asset = (value) => value && core && core.isSafeAssetPath(value) ? value : "";

  if (!core || !productApi || !cartApi || !waApi) {
    console.error(PREFIX, "Faltan módulos. Verificá el orden de carga de los scripts.");
    return;
  }

  const rawConfig = typeof MODA_CONFIG !== "undefined" ? MODA_CONFIG : null;
  const normalized = core.normalize(rawConfig);
  const cfg = normalized.cfg;

  normalized.issues.forEach((issue) => {
    console[issue.level === "error" ? "error" : "warn"](`${PREFIX} ${issue.path}: ${issue.msg}`);
  });

  function log(level, message) {
    console[level](`${PREFIX} ${message}`);
  }

  function init() {
    applyTheme();
    renderHeader();
    renderAnnouncement();
    renderSections();
    renderFooter();
    initNavigation();
    initMenu();
    initSearch();
    initToast();

    const cart = cartApi.mountCartDrawer({ cfg, waLink: waApi.waLink, formatPrice: core.formatPrice });
    const detail = window.ModaDetail.init({
      cfg,
      api: productApi,
      formatPrice: core.formatPrice,
      onAdd(product, color, size, qty) {
        cart.add(product, color, size, qty);
        showToast("Agregado a tu selección.");
      },
    });
    const catalog = window.ModaCatalog.init({
      cfg,
      products: productApi.products,
      api: productApi,
      formatPrice: core.formatPrice,
      openDetail: (product) => detail.open(product),
    });

    window.__moda = { cfg, catalog, cart, detail, productApi };
    initReveal();
    bindImageFallbacks();
    applySeo();
  }

  /* ---------- Tema ---------- */
  function applyTheme() {
    const root = document.documentElement;
    const vars = { charcoal: "charcoal", offwhite: "offwhite", stone: "stone", sand: "sand", grey: "grey", line: "line" };
    Object.keys(vars).forEach((key) => root.style.setProperty("--" + key, cfg.theme[key]));
    root.style.setProperty("--font-display", cfg.fonts.display);
    root.style.setProperty("--font-body", cfg.fonts.body);
    const themeMeta = $('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute("content", cfg.theme.charcoal);
  }

  /* ---------- Header y franja superior ---------- */
  function renderAnnouncement() {
    const bar = $("#announcement");
    if (!bar) return;
    if (cfg.announcement.enabled && cfg.announcement.text) {
      const content = cfg.announcement.link
        ? `<a href="${esc(cfg.announcement.link)}" target="_blank" rel="noopener noreferrer">${esc(cfg.announcement.text)}</a>`
        : `<span>${esc(cfg.announcement.text)}</span>`;
      bar.innerHTML = content;
      bar.hidden = false;
    } else {
      bar.hidden = true;
    }
  }

  function renderHeader() {
    const wordmark = $("#brand-wordmark");
    if (wordmark) wordmark.textContent = cfg.brand.wordmark || cfg.brand.name;
    const brand = $("#brand-link");
    if (brand) brand.setAttribute("aria-label", cfg.brand.name + ", inicio");
    if (cfg.brand.logo) {
      const logoImg = document.getElementById("brand-logo");
      if (logoImg) {
        logoImg.src = cfg.brand.logo;
        logoImg.hidden = false;
        if (wordmark) wordmark.hidden = true;
      }
    }
    const navList = $("#nav-list");
    if (navList) navList.innerHTML = cfg.navigation.map(navItemHtml).join("");
  }

  function navItemHtml(item) {
    if (item.anchor) return `<li><a href="${esc(item.anchor)}" data-nav-anchor>${esc(item.label)}</a></li>`;
    if (item.filter) {
      const attrs = filterAttrs(item.filter);
      return `<li><button type="button" class="nav-filter" data-nav-filter ${attrs}>${esc(item.label)}</button></li>`;
    }
    return "";
  }

  function filterAttrs(filter) {
    let attrs = "";
    if (filter.gender) attrs += `data-gender="${esc(filter.gender)}"`;
    if (filter.category) attrs += `data-category="${esc(filter.category)}"`;
    if (filter.sale) attrs += `data-sale="true"`;
    return attrs;
  }

  function filterFromElement(element) {
    if (element.hasAttribute("data-sale")) return { sale: true };
    if (element.hasAttribute("data-gender")) return { gender: element.getAttribute("data-gender") };
    if (element.hasAttribute("data-category")) return { category: element.getAttribute("data-category") };
    return null;
  }

  /* ---------- Secciones ---------- */
  function sectionHead(eyebrow, title, subtitle, id) {
    return `<header class="section-head">
      ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ""}
      ${title ? `<h2 class="section-title"${id ? ` id="${id}-title"` : ""}>${esc(title)}</h2>` : ""}
      ${subtitle ? `<p class="section-subtitle">${esc(subtitle)}</p>` : ""}
    </header>`;
  }

  const renderers = {
    hero() {
      const h = cfg.hero;
      return `<section class="hero" id="inicio" aria-labelledby="hero-title">
        <div class="hero__inner container">
          <div class="hero__content reveal">
            ${h.eyebrow ? `<p class="eyebrow eyebrow--dark">${esc(h.eyebrow)}</p>` : ""}
            <h1 class="hero__title" id="hero-title">${esc(h.title || cfg.brand.name)}</h1>
            ${h.subtitle ? `<p class="hero__subtitle">${esc(h.subtitle)}</p>` : ""}
            ${h.ctaLabel ? `<a class="btn btn--solid" href="${esc(h.ctaAnchor || "#catalogo")}" data-nav-anchor><span>${esc(h.ctaLabel)}</span><span aria-hidden="true">→</span></a>` : ""}
          </div>
          ${h.image ? `<figure class="hero__media reveal"><img src="${esc(h.image)}" alt="${esc(h.imageAlt)}" fetchpriority="high" decoding="async" width="900" height="1200"></figure>` : ""}
        </div>
      </section>`;
    },
    categories() {
      const c = cfg.categories;
      if (!c.items.length) return "";
      const items = c.items
        .map((item) => `<button type="button" class="category-card reveal" data-nav-filter ${filterAttrs(item.filter)}>
          <span class="category-card__media"><img src="${esc(item.image)}" alt="${esc(item.imageAlt)}" loading="lazy" decoding="async" width="600" height="750"></span>
          <span class="category-card__name">${esc(item.name)}</span>
          <span class="category-card__cta" aria-hidden="true">Ver más →</span>
        </button>`)
        .join("");
      return `<section class="categories" id="categorias" aria-labelledby="categories-title">
        <div class="container">${sectionHead("Categorías", c.title, c.subtitle, "categories")}
        <div class="categories__grid">${items}</div></div>
      </section>`;
    },
    collection() {
      const c = cfg.collection;
      if (!c.title && !c.description && !c.image) return "";
      const related = collectionProducts();
      const productsHtml = related.length
        ? `<div class="collection__products">${related.map(collectionProductCard).join("")}</div>`
        : "";
      return `<section class="collection" id="coleccion" aria-labelledby="collection-title">
        <div class="container collection__grid">
          ${c.image ? `<figure class="collection__media reveal"><img src="${esc(c.image)}" alt="${esc(c.imageAlt)}" loading="lazy" decoding="async" width="900" height="1100"></figure>` : ""}
          <div class="collection__body reveal">
            ${c.eyebrow ? `<p class="eyebrow">${esc(c.eyebrow)}</p>` : ""}
            ${c.title ? `<h2 class="section-title" id="collection-title">${esc(c.title)}</h2>` : ""}
            ${c.description ? `<p class="collection__text">${esc(c.description)}</p>` : ""}
            ${c.ctaLabel ? `<a class="btn btn--invert" href="${esc(c.ctaAnchor || "#catalogo")}" data-nav-anchor><span>${esc(c.ctaLabel)}</span><span aria-hidden="true">→</span></a>` : ""}
            ${productsHtml}
          </div>
        </div>
      </section>`;
    },
    catalog() {
      return `<section class="catalog" id="catalogo" aria-labelledby="catalog-title">
        <div class="container">
          ${sectionHead("Catálogo", cfg.catalog.title, cfg.catalog.subtitle, "catalog")}
          <div class="catalog__toolbar">
            <label class="catalog__search"><span class="catalog__search-icon" aria-hidden="true">⌕</span><input id="filter-search" type="search" placeholder="Buscar prendas…" aria-label="Buscar prendas"></label>
            <button id="filter-toggle" class="btn btn--ghost" type="button" aria-expanded="false" aria-controls="catalog-filters">Filtros</button>
            <select id="filter-sort" aria-label="Ordenar productos"></select>
          </div>
          <div class="catalog__filters" id="catalog-filters">
            <div class="filter-group"><span class="filter-group__label">Categoría</span><div class="chips" id="filter-categories"></div></div>
            <div class="filter-group"><span class="filter-group__label">Género</span><div class="chips" id="filter-genders"></div></div>
            <div class="filter-group"><span class="filter-group__label">Talle</span><div class="chips" id="filter-sizes"></div></div>
            <div class="filter-group"><span class="filter-group__label">Color</span><div class="chips" id="filter-colors"></div></div>
            <div class="filter-group"><span class="filter-group__label">Precio</span><select id="filter-price" aria-label="Filtrar por precio"></select></div>
            <button id="filter-clear" class="btn btn--text" type="button">Limpiar filtros</button>
          </div>
          <p class="catalog__count" id="catalog-count" aria-live="polite"></p>
          <div class="catalog__grid" id="catalog-grid"></div>
          <p class="catalog__empty" id="catalog-empty" hidden>No hay prendas que coincidan con tu búsqueda.</p>
        </div>
      </section>`;
    },
    lookbook() {
      const l = cfg.lookbook;
      if (!l.items.length) return "";
      const items = l.items.map((item) => `<figure class="lookbook__item reveal"><img src="${esc(item.image)}" alt="${esc(item.imageAlt)}" loading="lazy" decoding="async"><figcaption>${esc(item.caption)}</figcaption></figure>`).join("");
      return `<section class="lookbook" id="lookbook" aria-labelledby="lookbook-title">
        <div class="container">${sectionHead("Editorial", l.title, l.subtitle, "lookbook")}
        <div class="lookbook__grid">${items}</div></div>
      </section>`;
    },
    benefits() {
      const b = cfg.benefits;
      if (!b.items.length) return "";
      const items = b.items
        .map((item, index) => `<div class="benefit reveal"><span class="benefit__index">${String(index + 1).padStart(2, "0")}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></div>`)
        .join("");
      return `<section class="benefits" id="beneficios" aria-labelledby="benefits-title">
        <div class="container">${b.title ? `<h2 class="section-title" id="benefits-title">${esc(b.title)}</h2>` : ""}
        <div class="benefits__grid">${items}</div></div>
      </section>`;
    },
    about() {
      const a = cfg.about;
      if (!a.title && !a.paragraphs.length && !a.image) return "";
      return `<section class="about" id="nosotros" aria-labelledby="about-title">
        <div class="container about__grid">
          ${a.image ? `<figure class="about__media reveal"><img src="${esc(a.image)}" alt="${esc(a.imageAlt)}" loading="lazy" decoding="async" width="800" height="1000"></figure>` : ""}
          <div class="about__body reveal">
            ${a.eyebrow ? `<p class="eyebrow">${esc(a.eyebrow)}</p>` : ""}
            ${a.title ? `<h2 class="section-title" id="about-title">${esc(a.title)}</h2>` : ""}
            <div class="about__text">${a.paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}</div>
          </div>
        </div>
      </section>`;
    },
    faq() {
      const f = cfg.faq;
      if (!f.items.length) return "";
      const items = f.items.map((item) => `<details class="faq__item reveal"><summary><span>${esc(item.q)}</span><span class="faq__icon" aria-hidden="true">+</span></summary><div class="faq__answer"><p>${esc(item.a)}</p></div></details>`).join("");
      return `<section class="faq" id="faq" aria-labelledby="faq-title">
        <div class="container faq__grid">
          ${f.title ? `<h2 class="section-title" id="faq-title">${esc(f.title)}</h2>` : ""}
          <div class="faq__list">${items}</div>
        </div>
      </section>`;
    },
  };

  function renderSections() {
    const main = $("#main");
    if (!main) return;
    const html = cfg.sections.map((key) => safeRender(key)).filter(Boolean).join("");
    main.innerHTML = html;
  }

  function safeRender(key) {
    const renderer = renderers[key];
    if (!renderer) return "";
    try {
      return renderer();
    } catch (error) {
      log("error", `No se pudo renderizar "${key}": ${error.message}`);
      return "";
    }
  }

  function collectionProducts() {
    const ids = cfg.collection.productIds || [];
    const list = ids.map((id) => productApi.products.find((product) => product.id === id)).filter(Boolean);
    if (list.length) return list.slice(0, 3);
    return productApi.products.filter(productApi.isFeatured).slice(0, 3);
  }

  function collectionProductCard(product) {
    return `<button type="button" class="collection__product" data-open-collection="${product.id}">
      <span class="collection__product-media"><img src="${esc(product.image)}" alt="${esc(product.imageAlt)}" loading="lazy" decoding="async"></span>
      <span class="collection__product-name">${esc(product.name)}</span>
      <span class="collection__product-price">${core.formatPrice(product.price) || "Consultar precio"}</span>
    </button>`;
  }

  /* ---------- Footer ---------- */
  function renderFooter() {
    const footer = $("#site-footer");
    if (!footer) return;
    const categories = [];
    productApi.products.forEach((product) => {
      if (!categories.some((item) => item.id === product.category)) categories.push({ id: product.category, name: productApi.categoryLabel(product.category) });
    });
    const navLinks = cfg.navigation.map((item) => (item.anchor ? `<li><a href="${esc(item.anchor)}" data-nav-anchor>${esc(item.label)}</a></li>` : `<li><button type="button" data-nav-filter ${filterAttrs(item.filter)}>${esc(item.label)}</button></li>`)).join("");
    const categoryLinks = categories.map((category) => `<li><button type="button" data-nav-filter data-category="${esc(category.id)}">${esc(category.name)}</button></li>`).join("");
    const contact = [];
    if (cfg.contact.whatsapp) contact.push(`<li><a href="https://wa.me/${esc(cfg.contact.whatsapp)}" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>`);
    if (cfg.contact.instagram) contact.push(`<li><a href="${esc(cfg.contact.instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a></li>`);
    if (cfg.contact.email) contact.push(`<li><a href="mailto:${esc(cfg.contact.email)}">${esc(cfg.contact.email)}</a></li>`);
    if (cfg.contact.address) contact.push(`<li>${esc(cfg.contact.address)}</li>`);
    if (cfg.contact.hours) contact.push(`<li class="footer__hours">${esc(cfg.contact.hours)}</li>`);

    footer.innerHTML = `<div class="container footer__grid">
      <div class="footer__brand">
        <span class="footer__wordmark">${esc(cfg.brand.wordmark || cfg.brand.name)}</span>
        <p>${esc(cfg.brand.description)}</p>
      </div>
      <nav class="footer__nav" aria-label="Navegación del pie"><h3>Navegación</h3><ul>${navLinks}</ul></nav>
      <nav class="footer__nav" aria-label="Categorías"><h3>Categorías</h3><ul>${categoryLinks}</ul></nav>
      <div class="footer__contact"><h3>Contacto</h3><ul>${contact.join("")}</ul></div>
    </div>
    <div class="footer__bottom"><div class="container footer__bottom-inner">
      <p>© <span id="footer-year"></span> ${esc(cfg.brand.name)}.</p>
      <p id="footer-credit">${esc(core.CREDIT)}</p>
    </div></div>`;
    const year = $("#footer-year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* ---------- Navegación y menú ---------- */
  function initNavigation() {
    document.addEventListener("click", (event) => {
      const anchor = event.target.closest("[data-nav-anchor]");
      if (anchor) {
        closeMenu();
        return;
      }
      const filterButton = event.target.closest("[data-nav-filter]");
      if (filterButton) {
        closeMenu();
        const filter = filterFromElement(filterButton);
        if (filter && window.__moda && window.__moda.catalog) window.__moda.catalog.applyFilter(filter);
      }
      const collectionProduct = event.target.closest("[data-open-collection]");
      if (collectionProduct && window.__moda) {
        const product = productApi.products.find((item) => item.id === collectionProduct.getAttribute("data-open-collection"));
        if (product) window.__moda.detail.open(product);
      }
    });
  }

  function initMenu() {
    const toggle = $("#menu-toggle");
    const header = $("#site-header");
    if (!toggle || !header) return;
    const setOpen = (open) => {
      header.classList.toggle("is-menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      document.body.classList.toggle("no-scroll", open);
      const main = $("#main");
      const footer = $("#site-footer");
      [main, footer].forEach((element) => {
        if (!element) return;
        if (open) {
          if ("inert" in element) element.inert = true;
          else element.setAttribute("aria-hidden", "true");
        } else {
          if ("inert" in element) element.inert = false;
          element.removeAttribute("aria-hidden");
        }
      });
      const mobileSearch = $("#mobile-search");
      if (mobileSearch) mobileSearch.hidden = !open;
    };
    const closeMenu = () => setOpen(false);
    window.__closeMenu = closeMenu;

    toggle.addEventListener("click", () => setOpen(!header.classList.contains("is-menu-open")));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && header.classList.contains("is-menu-open")) closeMenu();
    });
    if (typeof window.matchMedia === "function") {
      const desktop = window.matchMedia("(min-width: 900px)");
      const onChange = (event) => {
        if (event.matches) closeMenu();
      };
      if (typeof desktop.addEventListener === "function") desktop.addEventListener("change", onChange);
    }
  }

  function closeMenu() {
    if (window.__closeMenu) window.__closeMenu();
  }

  function initSearch() {
    const apply = (value) => {
      if (window.__moda && window.__moda.catalog) window.__moda.catalog.setSearch(value);
      const section = $("#catalogo");
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const desktop = $("#header-search");
    const form = $("#header-search-form");
    const mobile = $("#mobile-search-input");
    if (desktop) {
      desktop.addEventListener("input", () => apply(desktop.value.trim()));
      if (form) form.addEventListener("submit", (event) => { event.preventDefault(); apply(desktop.value.trim()); });
    }
    if (mobile) {
      mobile.addEventListener("input", () => apply(mobile.value.trim()));
    }
  }

  function initToast() {
    const toast = $("#toast");
    window.__showToast = (message) => {
      if (!toast) return;
      toast.textContent = message;
      toast.hidden = false;
      toast.classList.add("is-visible");
      window.clearTimeout(window.__toastTimer);
      window.__toastTimer = window.setTimeout(() => {
        toast.classList.remove("is-visible");
        window.setTimeout(() => { toast.hidden = true; }, 200);
      }, 1800);
    };
  }

  function showToast(message) {
    if (window.__showToast) window.__showToast(message);
  }

  /* ---------- Reveal e imágenes ---------- */
  function initReveal() {
    const elements = $$(".reveal");
    const reduced = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!elements.length) return;
    if (reduced || typeof IntersectionObserver !== "function") {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    elements.forEach((element) => observer.observe(element));
  }

  function bindImageFallbacks() {
    const placeholder = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750"><rect width="600" height="750" fill="#e9e7e2"/><g fill="none" stroke="#d8cbb8" stroke-width="2"><path d="M300 240 c0 -40 30 -70 70 -70 c24 0 42 10 54 24 M300 244 L138 470 L462 470 Z"/></g><text x="300" y="560" font-family="Georgia, serif" font-size="24" fill="#77736e" text-anchor="middle">Imagen de demostración</text></svg>');
    document.addEventListener(
      "error",
      (event) => {
        const target = event.target;
        if (target && target.tagName === "IMG" && !target.dataset.fallbackApplied) {
          target.dataset.fallbackApplied = "1";
          target.src = placeholder;
        }
      },
      true
    );
  }

  /* ---------- SEO (runtime defensivo; el <head> estático es la fuente) ---------- */
  function applySeo() {
    const seo = core.buildSeo(cfg);
    document.title = seo.title;
    const setMeta = (selector, attr, content) => {
      if (!content) return;
      let element = $(selector);
      if (!element) {
        const match = selector.match(/\[(name|property)="([^"]+)"\]/);
        if (!match) return;
        element = document.createElement("meta");
        element.setAttribute(match[1], match[2]);
        document.head.appendChild(element);
      }
      element.setAttribute(attr || "content", content);
    };
    setMeta('meta[name="description"]', "content", seo.description);
    setMeta('meta[property="og:title"]', "content", seo.title);
    setMeta('meta[property="og:description"]', "content", seo.description);
    setMeta('meta[property="og:site_name"]', "content", seo.siteName);
    setMeta('meta[property="og:locale"]', "content", seo.locale);
    setMeta('meta[name="twitter:title"]', "content", seo.title);
    setMeta('meta[name="twitter:description"]', "content", seo.description);
    if (!document.getElementById("ld-json")) {
      const tag = document.createElement("script");
      tag.type = "application/ld+json";
      tag.id = "ld-json";
      tag.textContent = JSON.stringify(seo.jsonld).replace(/</g, "\\u003c");
      document.head.appendChild(tag);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
