/* ==========================================================================
   ALMATE · Demo Moda 2 (PIOLA) · engine.moda.js
   Orquestador: aplica la configuración, renderiza las secciones, monta
   catálogo, ficha, carrito, armador de looks y navegación. No editar para un
   local: toda la adaptación vive en config.moda.js y products.moda.js.
   ========================================================================== */
(function () {
  "use strict";

  const core = window.ModaCore;
  const productApi = window.ModaProducts;
  const cartApi = window.ModaCart;
  const waApi = window.ModaWhatsApp;
  const PREFIX = "[ALMATE Moda 2]";
  const $ = (selector, context) => (context || document).querySelector(selector);
  const $$ = (selector, context) => Array.from((context || document).querySelectorAll(selector));

  if (!core || !productApi || !cartApi || !waApi) {
    console.error(PREFIX, "Faltan módulos. Verificá el orden de carga de los scripts.");
    return;
  }

  const esc = core.esc;
  const rawConfig = typeof MODA_CONFIG !== "undefined" ? MODA_CONFIG : null;
  const normalized = core.normalize(rawConfig);
  const cfg = normalized.cfg;

  normalized.issues.forEach((issue) => {
    console[issue.level === "error" ? "error" : "warn"](`${PREFIX} ${issue.path}: ${issue.msg}`);
  });

  const log = (level, message) => console[level](`${PREFIX} ${message}`);
  const toneVar = (tone) => `var(--${core.TONE_KEYS.includes(tone) ? tone : "sun"})`;

  function init() {
    applyTheme();
    renderHeader();
    renderAnnouncement();
    renderSections();
    renderFooter();
    initNavigation();
    initMenu();
    initSearch();
    initHeaderState();
    initToast();

    const cart = cartApi.mountCartDrawer({ cfg, waLink: waApi.waLink, formatPrice: core.formatPrice });
    const queue = { list: [], total: 0, active: false, advanced: false };

    const detail = window.ModaDetail.init({
      cfg,
      api: productApi,
      formatPrice: core.formatPrice,
      onAdd(product, color, size, qty) {
        cart.add(product, color, size, qty);
        queue.advanced = true;
        showToast(queue.active && queue.list.length ? "¡Listo! Vamos con la siguiente." : "¡Sumado a tu pedido!");
      },
    });

    const modal = $("#product-modal");
    if (modal) {
      modal.addEventListener("close", () => {
        if (!queue.active) return;
        if (queue.advanced && queue.list.length) {
          queue.advanced = false;
          window.setTimeout(openNext, 140);
        } else {
          const finished = queue.advanced;
          queue.active = false;
          queue.list = [];
          queue.advanced = false;
          if (finished) {
            showToast("¡Pilcha armada! Revisá tu pedido.");
            cart.open();
          }
        }
      });
    }

    function openNext() {
      const next = queue.list.shift();
      if (!next) return;
      queue.advanced = false;
      detail.open(next, { step: `Paso ${queue.total - queue.list.length} de ${queue.total}` });
    }

    function startQueue(list) {
      if (!list || !list.length) return;
      queue.list = list.slice();
      queue.total = list.length;
      queue.active = true;
      openNext();
    }

    const catalog = window.ModaCatalog.init({
      cfg,
      products: productApi.products,
      api: productApi,
      formatPrice: core.formatPrice,
      openDetail: (product) => detail.open(product),
    });

    const pilcha = window.ModaPilcha
      ? window.ModaPilcha.init({ cfg, api: productApi, formatPrice: core.formatPrice, startQueue })
      : null;

    window.__moda = { cfg, catalog, cart, detail, pilcha, productApi };
    initReveal();
    bindImageFallbacks();
    applySeo();
  }

  /* ---------- Tema ---------- */
  function applyTheme() {
    const root = document.documentElement;
    Object.keys(cfg.theme).forEach((key) => root.style.setProperty("--" + key, cfg.theme[key]));
    root.style.setProperty("--font-display", cfg.fonts.display);
    root.style.setProperty("--font-body", cfg.fonts.body);
    const themeMeta = $('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute("content", cfg.theme.ink);
  }

  /* ---------- Cinta superior (marquesina) ---------- */
  function renderAnnouncement() {
    const bar = $("#announcement");
    if (!bar) return;
    if (!cfg.announcement.enabled || !cfg.announcement.items.length) {
      bar.hidden = true;
      return;
    }
    const base = cfg.announcement.items;
    const list = base.length < 6 ? base.concat(base) : base;
    const item = (text, index) => {
      const inner = cfg.announcement.link
        ? `<a href="${esc(cfg.announcement.link)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>`
        : `<span>${esc(text)}</span>`;
      return `<li${index >= base.length ? ' class="is-dup"' : ""}>${inner}</li>`;
    };
    const group = (hidden) => `<ul class="marquee__group"${hidden ? ' aria-hidden="true"' : ""}>${list.map(item).join("")}</ul>`;
    bar.innerHTML = `<div class="marquee__track">${group(false)}${group(true)}</div>`;
    bar.hidden = false;
  }

  /* ---------- Header ---------- */
  function renderHeader() {
    const wordmark = $("#brand-wordmark");
    if (wordmark) wordmark.textContent = cfg.brand.wordmark || cfg.brand.name;
    const brand = $("#brand-link");
    if (brand) brand.setAttribute("aria-label", cfg.brand.name + ", inicio");
    if (cfg.brand.logo) {
      const logoImg = $("#brand-logo");
      const mark = $("#brand-mark");
      if (logoImg) {
        logoImg.src = cfg.brand.logo;
        logoImg.hidden = false;
        if (wordmark) wordmark.hidden = true;
        if (mark) mark.hidden = true;
      }
    }
    const navList = $("#nav-list");
    if (navList) navList.innerHTML = cfg.navigation.map(navItemHtml).join("");
  }

  function navItemHtml(item) {
    if (item.anchor) return `<li><a href="${esc(item.anchor)}" data-nav-anchor>${esc(item.label)}</a></li>`;
    if (item.filter) return `<li><button type="button" class="nav-filter" data-nav-filter ${filterAttrs(item.filter)}>${esc(item.label)}</button></li>`;
    return "";
  }

  function filterAttrs(filter) {
    let attrs = "";
    if (filter.gender) attrs += ` data-gender="${esc(filter.gender)}"`;
    if (filter.category) attrs += ` data-category="${esc(filter.category)}"`;
    if (filter.sale) attrs += ` data-sale="true"`;
    if (filter.new) attrs += ` data-new="true"`;
    return attrs;
  }

  function filterFromElement(element) {
    if (element.hasAttribute("data-new")) return { new: true };
    if (element.hasAttribute("data-sale")) return { sale: true };
    if (element.hasAttribute("data-gender")) return { gender: element.getAttribute("data-gender") };
    if (element.hasAttribute("data-category")) return { category: element.getAttribute("data-category") };
    return null;
  }

  function countFor(filter) {
    return productApi.products.filter((p) => {
      if (filter.gender) {
        const ok = filter.gender === "unisex" ? p.gender === "unisex" : p.gender === filter.gender || p.gender === "unisex";
        if (!ok) return false;
      }
      if (filter.category && p.category !== filter.category) return false;
      if (filter.sale && !productApi.isOnSale(p)) return false;
      if (filter.new && !productApi.isNew(p)) return false;
      return true;
    }).length;
  }

  /* ---------- Secciones ---------- */
  function sectionHead(eyebrow, title, subtitle, id, tone) {
    return `<header class="section-head reveal">
      ${eyebrow ? `<p class="sticker sticker--${core.TONE_KEYS.includes(tone) ? tone : "sun"}">${esc(eyebrow)}</p>` : ""}
      ${title ? `<h2 class="section-title"${id ? ` id="${id}-title"` : ""}>${esc(title)}</h2>` : ""}
      ${subtitle ? `<p class="section-subtitle">${esc(subtitle)}</p>` : ""}
    </header>`;
  }

  function heroTitleHtml(h) {
    const title = h.title || cfg.brand.name;
    if (h.highlight) {
      const at = title.indexOf(h.highlight);
      if (at !== -1) return `${esc(title.slice(0, at))}<mark>${esc(h.highlight)}</mark>${esc(title.slice(at + h.highlight.length))}`;
    }
    return esc(title);
  }

  function badgeHtml(text) {
    if (!text) return "";
    const ring = (text + " ").repeat(2);
    return `<div class="hero__badge" aria-hidden="true">
      <svg viewBox="0 0 140 140" class="hero__badge-ring" focusable="false"><defs><path id="badge-path" d="M70,70 m-52,0 a52,52 0 1,1 104,0 a52,52 0 1,1 -104,0"/></defs><text><textPath href="#badge-path" textLength="322" lengthAdjust="spacing">${esc(ring)}</textPath></text></svg>
      <img src="assets/logo/mark.svg" alt="" width="46" height="46">
    </div>`;
  }

  const renderers = {
    hero() {
      const h = cfg.hero;
      const cards = h.collage.map((item, index) => `<figure class="hero__card hero__card--${index === 0 ? "a" : "b"}"><img src="${esc(item.image)}" alt="${esc(item.imageAlt)}" loading="eager" decoding="async" width="600" height="700"></figure>`).join("");
      return `<section class="hero" id="inicio" aria-labelledby="hero-title">
        <div class="container hero__grid">
          <div class="hero__copy">
            ${h.eyebrow ? `<p class="sticker sticker--sun hero__eyebrow"><span aria-hidden="true">✺</span> ${esc(h.eyebrow)}</p>` : ""}
            <h1 class="hero__title" id="hero-title">${heroTitleHtml(h)}</h1>
            ${h.subtitle ? `<p class="hero__subtitle">${esc(h.subtitle)}</p>` : ""}
            <div class="hero__cta">
              ${h.ctaLabel ? `<a class="btn btn--primary" href="${esc(h.ctaAnchor)}" data-nav-anchor>${esc(h.ctaLabel)} <span aria-hidden="true">→</span></a>` : ""}
              ${h.ctaSecondaryLabel ? `<a class="btn btn--ghost" href="${esc(h.ctaSecondaryAnchor)}" data-nav-anchor>${esc(h.ctaSecondaryLabel)}</a>` : ""}
            </div>
            ${h.stickers.length ? `<ul class="hero__stickers">${h.stickers.map((s, i) => `<li class="sticker sticker--${s.tone} sticker--tilt-${i % 3}">${esc(s.text)}</li>`).join("")}</ul>` : ""}
          </div>
          <div class="hero__art">
            ${h.image ? `<figure class="hero__main"><img src="${esc(h.image)}" alt="${esc(h.imageAlt)}" fetchpriority="high" decoding="async" width="900" height="1100"></figure>` : ""}
            ${cards}
            ${badgeHtml(h.badge)}
          </div>
        </div>
      </section>`;
    },

    categories() {
      const c = cfg.categories;
      if (!c.items.length) return "";
      const tiles = c.items.map((item) => {
        const n = countFor(item.filter || {});
        return `<button type="button" class="cat-tile reveal" style="--tone: ${toneVar(item.tone)}" data-nav-filter ${filterAttrs(item.filter || {})}>
          <span class="cat-tile__text"><span class="cat-tile__name">${esc(item.name)}</span><span class="cat-tile__count">${n} ${n === 1 ? "producto" : "productos"}</span></span>
          <img src="${esc(item.image)}" alt="${esc(item.imageAlt)}" loading="lazy" decoding="async" width="400" height="500">
          <span class="cat-tile__go" aria-hidden="true">↗</span>
        </button>`;
      }).join("");
      return `<section class="categories" id="categorias" aria-labelledby="categories-title">
        <div class="container">${sectionHead("Categorías", c.title, c.subtitle, "categories", "lime")}
        <div class="cat-grid">${tiles}</div></div>
      </section>`;
    },

    collection() {
      const c = cfg.collection;
      if (!c.title && !c.description) return "";
      const related = collectionProducts();
      const cards = related.map((p, i) => `<button type="button" class="drop-card drop-card--${i % 4}" style="--tone: ${toneVar(p.tone)}" data-open-collection="${esc(p.id)}">
        <span class="drop-card__media"><img src="${esc(p.image)}" alt="${esc(p.imageAlt)}" loading="lazy" decoding="async" width="400" height="500"></span>
        <span class="drop-card__name">${esc(p.name)}</span>
        <span class="drop-card__price">${core.formatPrice(p.price) || "Consultar precio"}</span>
      </button>`).join("");
      return `<section class="drop" id="coleccion" aria-labelledby="collection-title">
        <div class="container drop__wrap">
          <div class="drop__copy reveal">
            ${c.eyebrow ? `<p class="sticker sticker--pink">${esc(c.eyebrow)}</p>` : ""}
            ${c.title ? `<h2 class="drop__title" id="collection-title">${esc(c.title)}</h2>` : ""}
            ${c.description ? `<p class="drop__text">${esc(c.description)}</p>` : ""}
            ${c.ctaLabel ? `<a class="btn btn--primary" href="${esc(c.ctaAnchor)}" data-nav-anchor>${esc(c.ctaLabel)} <span aria-hidden="true">→</span></a>` : ""}
          </div>
          ${cards ? `<div class="drop__cards">${cards}</div>` : ""}
        </div>
      </section>`;
    },

    catalog() {
      return `<section class="catalog" id="catalogo" aria-labelledby="catalog-title">
        <div class="container">
          ${sectionHead("Catálogo", cfg.catalog.title, cfg.catalog.subtitle, "catalog", "sky")}
          <div class="catalog__bar">
            <label class="search"><span class="search__icon" aria-hidden="true">⌕</span><input id="filter-search" type="search" placeholder="Buscá por nombre o código…" aria-label="Buscar productos" autocomplete="off"></label>
            <button id="filter-toggle" class="btn btn--small btn--ghost" type="button" aria-expanded="false" aria-controls="catalog-filters">Filtros <span class="count-badge" id="filter-badge" hidden>0</span></button>
            <label class="select"><span class="visually-hidden">Ordenar</span><select id="filter-sort" aria-label="Ordenar productos"></select></label>
          </div>
          <div class="catalog__cats" id="filter-categories" role="group" aria-label="Categorías"></div>
          <div class="filters-backdrop" id="filters-backdrop" hidden></div>
          <div class="catalog__filters" id="catalog-filters" role="region" aria-label="Filtros">
            <div class="filters__head"><strong>Filtros</strong><button id="filter-close" class="btn btn--small btn--primary" type="button">Listo</button></div>
            <div class="filter-group"><span class="filter-group__label">Precio</span><label class="select"><span class="visually-hidden">Rango de precio</span><select id="filter-price" aria-label="Filtrar por precio"></select></label></div>
            <button id="filter-clear" class="btn btn--small btn--ghost" type="button">Limpiar filtros</button>
          </div>
          <div class="catalog__meta"><p class="catalog__count" id="catalog-count" aria-live="polite"></p><div class="catalog__active" id="catalog-active" hidden></div></div>
          <div class="catalog__grid" id="catalog-grid"></div>
          <div class="catalog__empty" id="catalog-empty" hidden><p>${esc(cfg.catalog.emptyText)}</p><button id="filter-clear-empty" class="btn btn--primary" type="button">Limpiar filtros</button></div>
        </div>
      </section>`;
    },

    pilcha() {
      const p = cfg.pilcha;
      if (!p.slots.length) return "";
      return `<section class="pilcha" id="pilcha" aria-labelledby="pilcha-title">
        <div class="container">${sectionHead(p.eyebrow, p.title, p.subtitle, "pilcha", "lilac")}
        <div class="pilcha__root" id="pilcha-root"></div></div>
      </section>`;
    },

    lookbook() {
      const l = cfg.lookbook;
      if (!l.items.length) return "";
      const items = l.items.map((item, i) => `<figure class="look look--${i % 5} reveal">
        <img src="${esc(item.image)}" alt="${esc(item.imageAlt)}" loading="lazy" decoding="async">
        <figcaption><span class="look__cap">${esc(item.caption)}</span>${item.sticker ? `<span class="sticker sticker--${["pink", "lime", "sun", "sky", "lilac"][i % 5]} look__sticker">${esc(item.sticker)}</span>` : ""}</figcaption>
      </figure>`).join("");
      return `<section class="lookbook" id="lookbook" aria-labelledby="lookbook-title">
        <div class="container">${sectionHead("Lookbook", l.title, l.subtitle, "lookbook", "pink")}
        <div class="lookbook__grid">${items}</div></div>
      </section>`;
    },

    benefits() {
      const b = cfg.benefits;
      if (!b.items.length) return "";
      const items = b.items.map((item, i) => `<li class="perk reveal" style="--tone: ${toneVar(item.tone)}"><span class="perk__n">${String(i + 1).padStart(2, "0")}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></li>`).join("");
      return `<section class="benefits" id="beneficios" aria-labelledby="benefits-title">
        <div class="container">${b.title ? `<h2 class="section-title reveal" id="benefits-title">${esc(b.title)}</h2>` : ""}
        <ul class="perks">${items}</ul></div>
      </section>`;
    },

    about() {
      const a = cfg.about;
      if (!a.title && !a.paragraphs.length && !a.image) return "";
      return `<section class="about" id="nosotros" aria-labelledby="about-title">
        <div class="container about__grid">
          ${a.image ? `<figure class="about__media reveal"><img src="${esc(a.image)}" alt="${esc(a.imageAlt)}" loading="lazy" decoding="async" width="800" height="1000">${a.sticker ? `<span class="sticker sticker--lime about__sticker">${esc(a.sticker)}</span>` : ""}</figure>` : ""}
          <div class="about__body reveal">
            ${a.eyebrow ? `<p class="sticker sticker--sun">${esc(a.eyebrow)}</p>` : ""}
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
          ${f.title ? `<h2 class="section-title reveal" id="faq-title">${esc(f.title)}</h2>` : ""}
          <div class="faq__list">${items}</div>
        </div>
      </section>`;
    },
  };

  function renderSections() {
    const main = $("#main");
    if (!main) return;
    main.innerHTML = cfg.sections.map((key) => safeRender(key)).filter(Boolean).join("");
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
    if (list.length) return list.slice(0, 4);
    return productApi.products.filter(productApi.isFeatured).slice(0, 4);
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
        <p class="footer__big" aria-hidden="true">${esc(cfg.brand.wordmark || cfg.brand.name)}</p>
        <p class="footer__desc">${esc(cfg.brand.description)}</p>
      </div>
      <nav class="footer__nav" aria-label="Navegación del pie"><h3>Navegá</h3><ul>${navLinks}</ul></nav>
      <nav class="footer__nav" aria-label="Categorías"><h3>Categorías</h3><ul>${categoryLinks}</ul></nav>
      <div class="footer__contact"><h3>Hablemos</h3><ul>${contact.join("")}</ul></div>
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
      if (anchor) closeMenu();
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
      [$("#main"), $("#site-footer")].forEach((element) => {
        if (!element) return;
        if (open) {
          if ("inert" in element) element.inert = true;
          else element.setAttribute("aria-hidden", "true");
        } else {
          if ("inert" in element) element.inert = false;
          element.removeAttribute("aria-hidden");
        }
      });
    };
    window.__closeMenu = () => setOpen(false);
    toggle.addEventListener("click", () => setOpen(!header.classList.contains("is-menu-open")));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && header.classList.contains("is-menu-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    if (typeof window.matchMedia === "function") {
      const desktop = window.matchMedia("(min-width: 960px)");
      const onChange = (event) => { if (event.matches) setOpen(false); };
      if (typeof desktop.addEventListener === "function") desktop.addEventListener("change", onChange);
    }
  }

  function closeMenu() {
    if (window.__closeMenu) window.__closeMenu();
  }

  function initSearch() {
    const apply = (value) => {
      if (window.__moda && window.__moda.catalog) window.__moda.catalog.searchAll(value);
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
    if (mobile) mobile.addEventListener("input", () => apply(mobile.value.trim()));
  }

  function initHeaderState() {
    const header = $("#site-header");
    if (!header) return;
    const update = () => header.classList.toggle("is-stuck", window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
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
      }, 2200);
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
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 }
    );
    elements.forEach((element) => observer.observe(element));
  }

  function bindImageFallbacks() {
    const placeholder = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="400" height="500" fill="#fff6e5"/><circle cx="200" cy="230" r="60" fill="#ffc531" stroke="#15131f" stroke-width="4"/><text x="200" y="350" font-family="Arial, sans-serif" font-size="20" fill="#5b5870" text-anchor="middle">Imagen de demostración</text></svg>');
    document.addEventListener("error", (event) => {
      const target = event.target;
      if (target && target.tagName === "IMG" && !target.dataset.fallbackApplied) {
        target.dataset.fallbackApplied = "1";
        target.src = placeholder;
      }
    }, true);
  }

  /* ---------- SEO (runtime defensivo; el <head> estático es la fuente) ---------- */
  function applySeo() {
    const seo = core.buildSeo(cfg);
    document.title = seo.title;
    const setMeta = (selector, content) => {
      if (!content) return;
      let element = $(selector);
      if (!element) {
        const match = selector.match(/\[(name|property)="([^"]+)"\]/);
        if (!match) return;
        element = document.createElement("meta");
        element.setAttribute(match[1], match[2]);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };
    setMeta('meta[name="description"]', seo.description);
    setMeta('meta[property="og:title"]', seo.title);
    setMeta('meta[property="og:description"]', seo.description);
    setMeta('meta[property="og:site_name"]', seo.siteName);
    setMeta('meta[property="og:locale"]', seo.locale);
    setMeta('meta[name="twitter:title"]', seo.title);
    setMeta('meta[name="twitter:description"]', seo.description);
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
