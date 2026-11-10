/* ==========================================================================
   ALMATE · MODELO D — CATÁLOGO COMERCIAL · engine.modelo-d.js
   Renderiza la página a partir de MODELO_D_CONFIG.
   ========================================================================== */
(function () {
  "use strict";

  const core = window.ModeloDCore;
  const PREFIX = "[ALMATE Modelo D]";
  const $ = (selector, context) => (context || document).querySelector(selector);
  const $$ = (selector, context) => Array.from((context || document).querySelectorAll(selector));
  const esc = core ? core.esc : (value) => String(value == null ? "" : value);

  if (!core) {
    document.addEventListener("DOMContentLoaded", () => {
      const main = $("#main");
      if (main) main.innerHTML = '<section class="config-error" role="alert"><h1>No se pudo cargar el motor</h1><p>Falta config-core.modelo-d.js o no se cargó antes que engine.modelo-d.js.</p></section>';
      console.error(PREFIX, "Falta config-core.modelo-d.js. La página no puede renderizarse.");
    });
    return;
  }

  const rawConfig = typeof MODELO_D_CONFIG !== "undefined" ? MODELO_D_CONFIG : null;
  const normalized = core.normalize(rawConfig);
  const cfg = normalized.cfg;
  const active = new Set(core.activeSections(cfg));
  const rendered = new Set();
  const gallery = [];
  const productsById = new Map(cfg.catalog.products.map((product) => [product.id, product]));
  const state = { menuOpen: false, lightboxOpen: false, heroImageMissing: false, consultation: [] };
  let catalogSortSignature = "";
  const inertReasons = { menu: false, lightbox: false };

  function log(level, message) {
    const method = level === "error" ? "error" : "warn";
    console[method](PREFIX + " " + message);
  }

  normalized.issues.forEach((issue) => log(issue.level, `${issue.path}: ${issue.msg}`));

  function init() {
    applyTheme();
    fillBrand();
    fillHeader();
    fillFooterIdentity();

    if (!normalized.ok) {
      renderFatal();
      initYear();
      initFooterCredit();
      return;
    }

    loadConsultation();
    renderSections();
    renderNavigation();
    fillFooterContact();
    initCatalog();
    initProductDialog();
    initConsultation();
    renderConsultation();
    initHeaderScroll();
    initMenu();
    initLightbox();
    initReveal();
    bindImageFallbacks();
    checkHeroPreload();
    applySeo();
    initYear();
    initFooterCredit();
  }

  /* ---------- Tema y marca ---------- */
  function applyTheme() {
    const root = document.documentElement;
    Object.keys(cfg.theme).forEach((key) => {
      root.style.setProperty("--" + key.replace(/[A-Z]/g, (char) => "-" + char.toLowerCase()), cfg.theme[key]);
    });
    root.style.setProperty("--display", cfg.fonts.display);
    root.style.setProperty("--sans", cfg.fonts.body);
    const themeMeta = $('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute("content", cfg.theme.ink);
  }

  function fillBrand() {
    const name = cfg.brand.name;
    const short = cfg.brand.short || name;
    const brand = $("#brand-link");
    const footerBrand = $("#footer-brand");
    if (brand) {
      brand.setAttribute("aria-label", name + ", inicio");
      const mark = $("#brand-short");
      const text = $("#brand-name");
      if (mark) mark.textContent = short;
      if (text) text.textContent = name;
    }
    if (footerBrand) footerBrand.textContent = short;
    if (cfg.brand.logo) {
      const src = asset(cfg.brand.logo);
      const alt = cfg.brand.logoAlt || name;
      const markup = `<img src="${esc(src)}" alt="${esc(alt)}" decoding="async">`;
      const render = (element, restore) => {
        if (!element) return;
        element.innerHTML = markup;
        const img = element.querySelector("img");
        if (img) img.addEventListener("error", restore, { once: true });
      };
      const headerMarkup = brand ? brand.innerHTML : "";
      render(brand, () => { if (brand) brand.innerHTML = headerMarkup; });
      render(footerBrand, () => { if (footerBrand) footerBrand.textContent = short; });
    }
    const footerDescription = $("#footer-description");
    if (footerDescription) {
      footerDescription.textContent = cfg.brand.description;
      footerDescription.hidden = !cfg.brand.description;
    }
  }

  function fillHeader() {
    const utility = $("#header-utility");
    if (utility) utility.textContent = cfg.header.utility;
    const cta = $("#header-cta");
    if (cta) cta.innerHTML = ctaMarkup(cfg.header.cta, "header");
    updateHeaderCount();
  }

  function fillFooterIdentity() {
    const note = $("#footer-note");
    if (note) {
      note.textContent = cfg.footer.note;
      note.hidden = !cfg.footer.note;
    }
    const copyright = $("#footer-copyright");
    if (copyright) copyright.textContent = cfg.brand.name;
    const navigationLabel = $("#footer-nav-label");
    if (navigationLabel) navigationLabel.textContent = cfg.footer.navigationLabel;
    const contactLabel = $("#footer-contact-label");
    if (contactLabel) contactLabel.textContent = cfg.footer.contactLabel;
    const copyrightLabel = $("#footer-copyright-label");
    if (copyrightLabel) copyrightLabel.textContent = cfg.footer.copyrightLabel;
  }

  function initYear() {
    const year = $("#footer-year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function initFooterCredit() {
    const credit = $("#footer-credit");
    if (!credit) return;
    credit.textContent = core.CREDIT;
    if (cfg.footer.creditUrl) {
      credit.setAttribute("href", cfg.footer.creditUrl);
      credit.setAttribute("target", "_blank");
      credit.setAttribute("rel", "noopener noreferrer");
    } else {
      credit.removeAttribute("href");
      credit.removeAttribute("target");
      credit.removeAttribute("rel");
    }
  }

  /* ---------- Helpers de render ---------- */
  function asset(value) {
    return core.assetUrl(cfg, value);
  }

  function sectionHead(section, key, tagName) {
    const tag = tagName || "h2";
    const label = section.label ? `<p class="section-index">${esc(section.label)}</p>` : "";
    const title = section.title ? `<${tag} class="section-title" id="${key}-title">${esc(section.title)}</${tag}>` : "";
    const lead = section.lead ? `<p class="section-lead">${esc(section.lead)}</p>` : "";
    return `<header class="section-head">${label}${title}${lead}</header>`;
  }

  function anchorAvailable(href) {
    if (!href || href.charAt(0) !== "#") return true;
    const id = href.slice(1);
    const key = Object.keys(core.SECTION_IDS).find((item) => core.SECTION_IDS[item] === id);
    return key ? active.has(key) : false;
  }

  function ctaMarkup(cta, variant) {
    if (!cta || !anchorAvailable(cta.href)) return "";
    const classes = variant === "secondary" ? "btn btn--ghost" : variant === "contact" ? "btn btn--dark" : "btn btn--primary";
    const external = cta.external ? ' target="_blank" rel="noopener noreferrer"' : "";
    const arrow = cta.external ? "↗" : "→";
    return `<a class="${classes}" href="${esc(cta.href)}"${external}><span>${esc(cta.label)}</span><span class="btn__arrow" aria-hidden="true">${arrow}</span></a>`;
  }

  function formatPrice(value) {
    return new Intl.NumberFormat(cfg.currency.locale, {
      style: "currency",
      currency: cfg.currency.code,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function categoryName(id) {
    const category = cfg.categories.items.find((item) => item.id === id);
    return category ? category.name : "";
  }

  function productCard(product) {
    const image = product.mainImage
      ? `<div class="product-card__media"><img src="${esc(asset(product.mainImage))}" alt="${esc(product.mainImageAlt)}" width="600" height="450" loading="lazy" decoding="async" data-product-card-image></div>`
      : `<div class="product-card__media product-card__media--empty" aria-hidden="true"><span>Imagen no disponible</span></div>`;
    const price = cfg.display.showPrices
      ? product.price === null
        ? `<p class="product-card__price product-card__price--quote">Consultar precio</p>`
        : `<p class="product-card__price">${formatPrice(product.price)}${product.unit ? `<span> / ${esc(product.unit)}</span>` : ""}${product.previousPrice !== null ? `<del>${formatPrice(product.previousPrice)}</del>` : ""}</p>`
      : "";
    return `<article class="product-card" data-product-card data-product-id="${esc(product.id)}">
      ${image}
      <div class="product-card__body">
        <p class="product-card__category">${esc(categoryName(product.category))}${product.subcategory ? ` <span>· ${esc(product.subcategory)}</span>` : ""}</p>
        <h3>${esc(product.name)}</h3>
        ${cfg.display.showBrand && product.brand ? `<p class="product-card__brand">${esc(product.brand)}</p>` : ""}
        ${cfg.display.showSku && product.sku ? `<p class="product-card__sku">SKU ${esc(product.sku)}</p>` : ""}
        ${product.shortDescription ? `<p class="product-card__description">${esc(product.shortDescription)}</p>` : ""}
        ${price}
        <div class="product-card__actions">
          <button type="button" class="button button--secondary" data-product-details="${esc(product.id)}">Ver ficha</button>
          <button type="button" class="button button--primary" data-product-add="${esc(product.id)}">Agregar a consulta</button>
        </div>
      </div>
    </article>`;
  }

  function loadConsultation() {
    if (!cfg.consultation.persist) return;
    try {
      const saved = window.localStorage.getItem(cfg.consultation.storageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        log("warn", "La lista guardada no tiene un formato válido; se inicia una lista vacía.");
        return;
      }
      state.consultation = parsed.map((entry) => {
        if (!entry || !productsById.has(entry.id) || !Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > 999) {
          log("warn", "Se omitió un elemento inválido de la lista guardada.");
          return null;
        }
        return { id: entry.id, quantity: entry.quantity };
      }).filter(Boolean);
    } catch (error) {
      log("warn", `No se pudo leer la lista guardada del navegador: ${error.message}`);
    }
  }

  function saveConsultation() {
    if (!cfg.consultation.persist) return;
    try {
      window.localStorage.setItem(cfg.consultation.storageKey, JSON.stringify(state.consultation));
    } catch (error) {
      log("warn", `No se pudo guardar la lista en el navegador; seguirá disponible mientras esta página permanezca abierta: ${error.message}`);
    }
  }

  function consultationCount() {
    return state.consultation.reduce((total, item) => total + item.quantity, 0);
  }

  function updateHeaderCount() {
    const count = $("#consultation-count");
    const shortcut = $("#consultation-shortcut");
    if (count) count.textContent = String(consultationCount());
    if (shortcut) shortcut.setAttribute("aria-label", `Ver lista de consulta, ${consultationCount()} productos`);
  }

  /* Scroll suave solo si el usuario no pidió movimiento reducido */
  function scrollBehavior() {
    return typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  }

  /* Bloqueo de scroll del fondo para el diálogo de producto. En iOS
     "overflow:hidden" en <body> no alcanza: además fijamos el body y
     devolvemos la posición al cerrar. */
  let scrollLocks = 0, scrollLockY = 0;
  function lockScroll() {
    if (scrollLocks === 0) {
      scrollLockY = window.scrollY;
      document.body.classList.add("no-scroll");
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollLockY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    }
    scrollLocks += 1;
  }
  function unlockScroll() {
    scrollLocks = Math.max(0, scrollLocks - 1);
    if (scrollLocks === 0) {
      document.body.classList.remove("no-scroll");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollLockY);
    }
  }

  /* Confirmación breve en el botón de alta: en mobile la lista queda
     fuera de pantalla y sin esto no hay forma de saber que entró. */
  function flashAdded(button) {
    if (!button) return;
    const original = button.textContent;
    button.textContent = "✓ Agregado";
    button.classList.add("is-added");
    window.setTimeout(() => {
      if (button.isConnected) {
        button.textContent = original;
        button.classList.remove("is-added");
      }
    }, 1600);
  }

  function addToConsultation(id, sourceButton) {
    if (!productsById.has(id)) return;
    const existing = state.consultation.find((item) => item.id === id);
    if (existing) existing.quantity = Math.min(999, existing.quantity + 1);
    else state.consultation.push({ id, quantity: 1 });
    saveConsultation();
    renderConsultation();
    flashAdded(sourceButton);
    const feedback = $("#consultation-feedback");
    if (feedback && cfg.contact.whatsapp) feedback.textContent = `${productsById.get(id).name} agregado a la lista.`;
  }

  function updateCatalog() {
    const search = $("#catalog-search");
    const category = $("#catalog-category");
    const subcategory = $("#catalog-subcategory");
    const sort = $("#catalog-sort");
    const minInput = $("#catalog-min-price");
    const maxInput = $("#catalog-max-price");
    const count = $("#catalog-result-count");
    const empty = $("#catalog-empty");
    const grid = $("#product-grid");
    if (!grid || !count || !empty) return;

    const term = search ? search.value.trim().toLocaleLowerCase(cfg.currency.locale).normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
    const selectedCategory = category ? category.value : "";
    const selectedSubcategory = subcategory ? subcategory.value : "";
    const min = minInput && minInput.value !== "" ? Number(minInput.value) : null;
    const max = maxInput && maxInput.value !== "" ? Number(maxInput.value) : null;
    const invalidRange = min !== null && max !== null && min > max;
    [minInput, maxInput].filter(Boolean).forEach((input) => input.setAttribute("aria-invalid", String(invalidRange)));
    const matches = (product) => {
      const searchable = `${product.name} ${product.sku} ${product.brand}`.toLocaleLowerCase(cfg.currency.locale).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (term && !searchable.includes(term)) return false;
      if (selectedCategory && product.category !== selectedCategory) return false;
      if (selectedSubcategory && product.subcategory !== selectedSubcategory) return false;
      if (min !== null && (product.price === null || product.price < min)) return false;
      if (max !== null && (product.price === null || product.price > max)) return false;
      return !invalidRange;
    };
    const mode = sort ? sort.value : "featured";
    const orderedProducts = cfg.catalog.products.slice().sort((a, b) => {
      if (mode === "alphabetical") return a.name.localeCompare(b.name, cfg.currency.locale);
      if (mode === "price-asc" || mode === "price-desc") {
        if (a.price === null) return b.price === null ? a.order - b.order : 1;
        if (b.price === null) return -1;
        const difference = mode === "price-asc" ? a.price - b.price : b.price - a.price;
        return difference || a.order - b.order;
      }
      return Number(b.featured) - Number(a.featured) || a.order - b.order || a.name.localeCompare(b.name, cfg.currency.locale);
    });
    const signature = orderedProducts.map((product) => product.id).join("\u0000");
    if (signature !== catalogSortSignature) {
      const fragment = document.createDocumentFragment();
      orderedProducts.forEach((product) => {
        const card = $(`[data-product-id="${product.id}"]`, grid);
        if (card) fragment.appendChild(card);
      });
      grid.appendChild(fragment);
      catalogSortSignature = signature;
    }
    const visibleProducts = orderedProducts.filter(matches);
    const visibleIds = new Set(visibleProducts.map((product) => product.id));
    $$(".product-card", grid).forEach((card) => {
      card.hidden = !visibleIds.has(card.getAttribute("data-product-id"));
    });
    count.textContent = invalidRange
      ? "El precio mínimo no puede superar al máximo."
      : `${visibleProducts.length} ${visibleProducts.length === 1 ? "producto" : "productos"}`;
    // Con rango inválido manda el mensaje de error del conteo: no se
    // muestra además "sin resultados", que lo contradeciría.
    empty.hidden = visibleProducts.length > 0 || invalidRange;
    // Estado vacío accionable: si hay búsqueda o filtros activos, una
    // salida de un clic para volver al catálogo completo.
    const hasFilters = Boolean(term || selectedCategory || selectedSubcategory || min !== null || max !== null);
    empty.innerHTML = esc(cfg.catalog.emptyText) +
      (visibleProducts.length === 0 && !invalidRange && hasFilters
        ? '<br><button type="button" class="button button--secondary" id="catalog-reset">Limpiar búsqueda y filtros</button>'
        : "");
    // Los atajos de rubro reflejan el filtro activo (estado accesible).
    $$("[data-category-filter]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-category-filter") === selectedCategory));
    });
    // Botón "Limpiar" del campo de búsqueda: solo cuando hay texto.
    const clearSearch = $("#catalog-search-clear");
    if (clearSearch) clearSearch.hidden = !(search && search.value !== "");
  }

  function updateSubcategoryOptions() {
    const category = $("#catalog-category");
    const subcategory = $("#catalog-subcategory");
    if (!category || !subcategory) return;
    const selected = subcategory.value;
    const relevant = cfg.catalog.products
      .filter((product) => !category.value || product.category === category.value)
      .map((product) => product.subcategory)
      .filter(Boolean);
    const values = Array.from(new Set(relevant)).sort((a, b) => a.localeCompare(b, cfg.currency.locale));
    subcategory.innerHTML = '<option value="">Todas</option>' + values
      .map((value) => `<option value="${esc(value)}">${esc(value)}</option>`).join("");
    if (values.includes(selected)) subcategory.value = selected;
  }

  function initCatalog() {
    const main = $("#main");
    if (!main) return;
    main.addEventListener("input", (event) => {
      if (event.target.matches("#catalog-search, #catalog-min-price, #catalog-max-price")) updateCatalog();
    });
    main.addEventListener("change", (event) => {
      if (event.target.matches("#catalog-category")) updateSubcategoryOptions();
      if (event.target.matches("#catalog-category, #catalog-subcategory, #catalog-sort, #catalog-min-price, #catalog-max-price")) updateCatalog();
    });
    main.addEventListener("click", (event) => {
      if (event.target.closest("#catalog-reset")) {
        ["#catalog-search", "#catalog-min-price", "#catalog-max-price"].forEach((selector) => {
          const field = $(selector);
          if (field) field.value = "";
        });
        const categorySelect = $("#catalog-category");
        if (categorySelect) categorySelect.value = "";
        updateSubcategoryOptions();
        const subcategorySelect = $("#catalog-subcategory");
        if (subcategorySelect) subcategorySelect.value = "";
        updateCatalog();
        const searchField = $("#catalog-search");
        if (searchField) searchField.focus();
        return;
      }
      if (event.target.closest("#catalog-search-clear")) {
        const searchField = $("#catalog-search");
        if (searchField) {
          searchField.value = "";
          searchField.focus();
          updateCatalog();
        }
        return;
      }
      const categoryButton = event.target.closest("[data-category-filter]");
      if (categoryButton) {
        const select = $("#catalog-category");
        if (select) {
          select.value = categoryButton.getAttribute("data-category-filter");
          updateSubcategoryOptions();
          updateCatalog();
          $("#catalogo").scrollIntoView({ behavior: scrollBehavior(), block: "start" });
        }
      }
      const addButton = event.target.closest("[data-product-add]");
      if (addButton) addToConsultation(addButton.getAttribute("data-product-add"), addButton);
      const detailButton = event.target.closest("[data-product-details]");
      if (detailButton) openProductDialog(detailButton.getAttribute("data-product-details"));
    });
    updateCatalog();
    bindProductImageFallbacks(main);
  }

  function productDetailMarkup(product) {
    const images = [product.mainImage ? { src: product.mainImage, alt: product.mainImageAlt } : null]
      .concat(product.gallery).filter(Boolean);
    const price = cfg.display.showPrices
      ? product.price === null
        ? `<p class="product-detail__price product-detail__price--quote">Consultar precio</p>`
        : `<p class="product-detail__price">${formatPrice(product.price)}${product.unit ? `<span> / ${esc(product.unit)}</span>` : ""}${product.previousPrice !== null ? `<del>${formatPrice(product.previousPrice)}</del>` : ""}</p>`
      : "";
    const specifications = product.specifications.length
      ? `<dl class="product-detail__specifications">${product.specifications.map((spec) => `<div><dt>${esc(spec.name)}</dt><dd>${esc(spec.value)}</dd></div>`).join("")}</dl>`
      : "";
    return `<article class="product-detail">
      <div class="product-detail__media">
        ${images.length
          ? `<img id="product-detail-image" data-product-detail-image src="${esc(asset(images[0].src))}" alt="${esc(images[0].alt)}" width="720" height="540">`
          : `<div class="product-detail__placeholder">Imagen no disponible</div>`}
        ${images.length > 1 ? `<div class="product-detail__gallery" aria-label="Galería del producto">${images.map((image, index) =>
          `<button type="button" data-product-gallery-index="${index}" aria-label="Ver imagen ${index + 1}"><img data-product-gallery-image src="${esc(asset(image.src))}" alt="${esc(image.alt)}" width="120" height="90" loading="lazy" decoding="async"></button>`
        ).join("")}</div>` : ""}
      </div>
      <div class="product-detail__body">
        <p class="product-card__category">${esc(categoryName(product.category))}${product.subcategory ? ` · ${esc(product.subcategory)}` : ""}</p>
        <h2 id="product-dialog-title">${esc(product.name)}</h2>
        ${cfg.display.showSku && product.sku ? `<p class="product-card__sku">Código: ${esc(product.sku)}</p>` : ""}
        ${cfg.display.showBrand && product.brand ? `<p>Marca: ${esc(product.brand)}</p>` : ""}
        ${product.description ? `<p class="product-detail__description">${esc(product.description)}</p>` : product.shortDescription ? `<p class="product-detail__description">${esc(product.shortDescription)}</p>` : ""}
        ${price}
        ${cfg.display.showAvailability && product.availability ? `<p class="product-detail__availability">${esc(product.availability)}</p>` : ""}
        ${specifications}
        ${product.tags.length ? `<ul class="product-detail__tags">${product.tags.map((tag) => `<li>${esc(tag)}</li>`).join("")}</ul>` : ""}
        <button type="button" class="button button--primary" data-product-add="${esc(product.id)}">Agregar a consulta</button>
      </div>
    </article>`;
  }

  function openProductDialog(id) {
    const product = productsById.get(id);
    const dialog = $("#product-dialog");
    const content = $("#product-dialog-content");
    if (!product || !dialog || !content || typeof dialog.showModal !== "function") return;
    content.innerHTML = productDetailMarkup(product);
    bindProductImageFallbacks(content);
    dialog.showModal();
    lockScroll();
  }

  function initProductDialog() {
    const dialog = $("#product-dialog");
    const close = $("#product-dialog-close");
    if (!dialog || !close) return;
    close.addEventListener("click", () => dialog.close());
    // El scroll del fondo se congela mientras la ficha está abierta y se
    // libera al cerrar (cualquiera sea el motivo: botón, Escape o clic).
    dialog.addEventListener("close", unlockScroll);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        // Cerrar solo si el clic cayó FUERA del rectángulo del diálogo:
        // el padding interno no debe descartar la ficha.
        const rect = dialog.getBoundingClientRect();
        const outside = event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom;
        if (outside) dialog.close();
        return;
      }
      const imageButton = event.target.closest("[data-product-gallery-index]");
      if (!imageButton) return;
      const productId = $("#product-dialog-content .product-detail .button[data-product-add]");
      const product = productId && productsById.get(productId.getAttribute("data-product-add"));
      if (!product) return;
      const images = [product.mainImage ? { src: product.mainImage, alt: product.mainImageAlt } : null]
        .concat(product.gallery).filter(Boolean);
      const image = $("#product-detail-image");
      const selected = images[Number(imageButton.getAttribute("data-product-gallery-index"))];
      if (image && selected) {
        image.src = asset(selected.src);
        image.alt = selected.alt;
      }
    });
    dialog.addEventListener("click", (event) => {
      const addButton = event.target.closest("[data-product-add]");
      if (!addButton) return;
      addToConsultation(addButton.getAttribute("data-product-add"));
      dialog.close();
    });
  }

  function bindProductImageFallbacks(root) {
    $$("img[data-product-card-image], img[data-product-detail-image], img[data-product-gallery-image]", root).forEach((image) => {
      const handle = () => {
        image.hidden = true;
        if (image.matches("[data-product-gallery-image]")) {
          const button = image.closest("button");
          if (button) button.hidden = true;
          return;
        }
        const container = image.parentElement;
        if (!container) return;
        container.classList.add("product-card__media--empty");
        const fallback = document.createElement("span");
        fallback.textContent = "Imagen no disponible";
        container.appendChild(fallback);
      };
      image.addEventListener("error", handle, { once: true });
      if (image.complete && image.naturalWidth === 0) handle();
    });
  }

  function buildConsultationMessage() {
    const lines = [`Hola ${cfg.brand.name}, quisiera consultar por estos productos:`];
    state.consultation.forEach((entry) => {
      const product = productsById.get(entry.id);
      if (!product) return;
      const details = [`Cantidad: ${entry.quantity}${product.unit ? ` ${product.unit}` : ""}`];
      if (product.sku) details.unshift(`SKU: ${product.sku}`);
      if (cfg.display.showPrices) details.push(product.price === null ? "Precio: consultar" : `Precio informado: ${formatPrice(product.price)}`);
      lines.push(`- ${product.name} (${details.join(" · ")})`);
    });
    if (cfg.seo.url) {
      const reference = new URL(cfg.seo.url);
      reference.hash = "catalogo";
      lines.push(`Catálogo: ${reference.href}`);
    }
    return lines.join("\n");
  }

  /* Resumen, controles y envío de la lista. Separado del render de la
     lista para poder actualizarlo sin rehacer el DOM (así la cantidad
     no pierde el foco del input). */
  function updateConsultationMeta() {
    const empty = $("#consultation-empty");
    const summary = $("#consultation-summary");
    const clear = $("#consultation-clear");
    const send = $("#consultation-send");
    const feedback = $("#consultation-feedback");
    if (!empty || !summary || !clear || !send) return;
    const entries = state.consultation.map((entry) => ({ entry, product: productsById.get(entry.id) })).filter((item) => item.product);
    empty.hidden = entries.length > 0;
    clear.disabled = entries.length === 0;
    const count = consultationCount();
    const knownPriceEntries = entries.filter(({ product }) => product.price !== null);
    const sum = entries.reduce((total, { entry, product }) => total + (product.price === null ? 0 : product.price * entry.quantity), 0);
    summary.textContent = `${count} ${count === 1 ? "producto" : "productos"} en la lista${knownPriceEntries.length ? ` · Suma de precios publicados: ${formatPrice(sum)}` : ""}${knownPriceEntries.length < entries.length ? " · Hay productos sin precio publicado." : ""}`;
    updateHeaderCount();
    if (state.consultation.length && cfg.contact.whatsapp) {
      send.href = `https://wa.me/${cfg.contact.whatsapp}?text=${encodeURIComponent(buildConsultationMessage())}`;
      send.hidden = false;
      if (feedback && !feedback.textContent) feedback.textContent = "";
    } else {
      send.removeAttribute("href");
      send.hidden = true;
      if (feedback && state.consultation.length && !cfg.contact.whatsapp) {
        feedback.textContent = "Configurá un número de WhatsApp válido para enviar la consulta.";
      }
    }
  }

  function renderConsultation() {
    const list = $("#consultation-list");
    if (!list) return;
    const entries = state.consultation.map((entry) => ({ entry, product: productsById.get(entry.id) })).filter((item) => item.product);
    list.innerHTML = entries.map(({ entry, product }) => `<li class="consultation-item" data-consultation-id="${esc(product.id)}">
      <div class="consultation-item__details"><strong>${esc(product.name)}</strong>
        ${cfg.display.showSku && product.sku ? `<span>SKU ${esc(product.sku)}</span>` : ""}
        ${cfg.display.showPrices ? `<span>${product.price !== null ? formatPrice(product.price) : "Precio a consultar"}</span>` : ""}
      </div>
      <label class="consultation-item__quantity">Cantidad
        <input type="number" min="1" max="999" step="1" value="${entry.quantity}" data-consultation-quantity="${esc(product.id)}" aria-label="Cantidad de ${esc(product.name)}">
      </label>
      <button type="button" class="button button--secondary" data-consultation-remove="${esc(product.id)}">Quitar</button>
    </li>`).join("");
    updateConsultationMeta();
  }

  function initConsultation() {
    const list = $("#consultation-list");
    const clear = $("#consultation-clear");
    const shortcut = $("#consultation-shortcut");
    if (list) {
      list.addEventListener("click", (event) => {
        const remove = event.target.closest("[data-consultation-remove]");
        if (remove) {
          state.consultation = state.consultation.filter((item) => item.id !== remove.getAttribute("data-consultation-remove"));
          saveConsultation();
          renderConsultation();
          // El botón desapareció con el artículo: el foco pasa al
          // siguiente "Quitar", o a "Vaciar lista", o al estado vacío.
          const next = list.querySelector("[data-consultation-remove]");
          if (next) {
            next.focus();
          } else if (clear && !clear.disabled) {
            clear.focus();
          } else {
            const empty = $("#consultation-empty");
            if (empty) {
              empty.tabIndex = -1;
              empty.focus();
            }
          }
        }
      });
      list.addEventListener("change", (event) => {
        const input = event.target.closest("[data-consultation-quantity]");
        if (!input) return;
        const quantity = Number(input.value);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
          input.setAttribute("aria-invalid", "true");
          input.focus();
          const feedback = $("#consultation-feedback");
          if (feedback) feedback.textContent = "La cantidad debe ser un número entero entre 1 y 999.";
          return;
        }
        input.removeAttribute("aria-invalid");
        const item = state.consultation.find((entry) => entry.id === input.getAttribute("data-consultation-quantity"));
        if (item) item.quantity = quantity;
        saveConsultation();
        // Solo se actualiza resumen/contador/envío: la lista no se
        // rehace, así el input conserva el foco (nadie "roba" el Tab).
        updateConsultationMeta();
      });
    }
    if (clear) clear.addEventListener("click", () => {
      state.consultation = [];
      saveConsultation();
      const feedback = $("#consultation-feedback");
      if (feedback) feedback.textContent = "Lista vaciada.";
      renderConsultation();
    });
    if (shortcut) shortcut.addEventListener("click", () => {
      const section = $("#consulta");
      const heading = $("#consultation-title");
      if (section) section.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    });
  }

  function renderSections() {
    const main = $("#main");
    if (!main) return;
    const html = cfg.sections
      .map((key) => safeRender(key, renderers[key]))
      .filter(Boolean)
      .join("");
    main.innerHTML = html || '<section class="config-error" role="alert"><h1>Sin contenido</h1><p>La configuración no tiene secciones activas.</p></section>';
  }

  function safeRender(key, renderer) {
    if (typeof renderer !== "function") return "";
    try {
      const html = renderer();
      if (html) rendered.add(key);
      return html || "";
    } catch (error) {
      log("error", `No se pudo renderizar la sección "${key}": ${error.message}`);
      return "";
    }
  }

  /* ---------- Secciones ---------- */
  const renderers = {
    hero() {
      const h = cfg.hero;
      const lines = h.titleLines
        .map((line, index) => `<span class="hero__line${index === h.accentIndex ? " hero__line--accent" : ""}">${esc(line)}</span>`)
        .join("");
      const image = h.image
        ? `<figure class="hero__media">
            <img src="${esc(asset(h.image))}" alt="${esc(h.imageAlt)}" width="1200" height="900" fetchpriority="high" decoding="async" data-fallback="hero">
            ${h.badge ? `<span class="hero__badge">${esc(h.badge)}</span>` : ""}
            <figcaption class="hero__media-label" aria-hidden="true">${esc(cfg.brand.tagline || cfg.brand.name)}</figcaption>
          </figure>`
        : "";
      const meta = h.meta.length
        ? `<ul class="hero__meta" aria-label="Datos rápidos">${h.meta
            .map((item) => `<li><span class="hero__meta-label">${esc(item.label)}</span><span class="hero__meta-value">${esc(item.value)}</span></li>`)
            .join("")}</ul>`
        : "";
      const primary = ctaMarkup(h.primaryCta, "primary");
      const secondary = ctaMarkup(h.secondaryCta, "secondary");
      return `<section class="hero${image ? "" : " hero--no-image"}" id="inicio" aria-labelledby="hero-title">
        <div class="hero__grid">
          <div class="hero__content reveal">
            ${h.eyebrow ? `<p class="hero__eyebrow"><span class="marker" aria-hidden="true"></span>${esc(h.eyebrow)}</p>` : ""}
            <h1 class="hero__title" id="hero-title">${lines}</h1>
            ${h.lead ? `<p class="hero__lead">${esc(h.lead)}</p>` : ""}
            <div class="hero__actions">${primary}${secondary}</div>
            ${meta}
          </div>
          ${image}
        </div>
        <p class="hero__scroll" aria-hidden="true">Deslizá <span>↓</span></p>
      </section>`;
    },

    ticker() {
      if (!cfg.ticker.length) return "";
      const group = cfg.ticker
        .map((item) => `<span class="ticker__item">${esc(item)}<span class="ticker__dot" aria-hidden="true">+</span></span>`)
        .join("");
      return `<div class="ticker" id="ticker" aria-hidden="true">
        <div class="ticker__track"><div class="ticker__group">${group}</div><div class="ticker__group">${group}</div></div>
      </div>`;
    },

    stats() {
      if (!cfg.stats.length) return "";
      return `<section class="stats" id="datos" aria-label="Datos del negocio">
        <div class="container stats__grid">${cfg.stats
          .map((item) => `<div class="stat reveal"><span class="stat__value">${esc(item.value)}</span><span class="stat__label">${esc(item.label)}</span></div>`)
          .join("")}</div>
      </section>`;
    },

    categories() {
      const section = cfg.categories;
      if (!section.items.length) return "";
      const items = section.items.map((item) => {
        const image = item.image
          ? `<img src="${esc(asset(item.image))}" alt="${esc(item.alt)}" width="480" height="360" loading="lazy" decoding="async">`
          : `<span class="category-card__placeholder" aria-hidden="true"></span>`;
        return `<button type="button" class="category-card" data-category-filter="${esc(item.id)}">
          <span class="category-card__media">${image}</span>
          <span class="category-card__body"><strong>${esc(item.name)}</strong>
            ${item.description ? `<span>${esc(item.description)}</span>` : ""}
            <span class="category-card__link">Ver productos <span aria-hidden="true">→</span></span>
          </span>
        </button>`;
      }).join("");
      return `<section class="categories-section section-paper" id="rubros" aria-labelledby="categories-title">
        <div class="container">${sectionHead(section, "categories")}
          <div class="category-grid">${items}</div>
        </div>
      </section>`;
    },

    featured() {
      const section = cfg.featured;
      const items = cfg.catalog.products.filter((product) => product.featured).slice(0, section.limit);
      if (!items.length) return "";
      return `<section class="featured-section section-dark" id="destacados" aria-labelledby="featured-title">
        <div class="container">${sectionHead(section, "featured")}
          <div class="product-grid product-grid--featured">${items.map(productCard).join("")}</div>
        </div>
      </section>`;
    },

    catalog() {
      const section = cfg.catalog;
      const categoryOptions = cfg.categories.items
        .map((category) => `<option value="${esc(category.id)}">${esc(category.name)}</option>`).join("");
      const subcategories = Array.from(new Set(cfg.catalog.products.map((product) => product.subcategory).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b, cfg.currency.locale))
        .map((subcategory) => `<option value="${esc(subcategory)}">${esc(subcategory)}</option>`).join("");
      const sortOptions = [
        ["featured", "Destacados y orden de presentación"],
        ["alphabetical", "Nombre: A a Z"],
        ["price-asc", "Precio: menor a mayor"],
        ["price-desc", "Precio: mayor a menor"],
      ].map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
      const hasPrices = cfg.catalog.products.some((product) => product.price !== null);
      const products = cfg.catalog.products.map(productCard).join("");
      return `<section class="catalog-section section-paper" id="catalogo" aria-labelledby="catalog-title">
        <div class="container">${sectionHead(section, "catalog")}
          <div class="catalog-controls" id="catalog-controls" role="search">
            <label class="catalog-search">Buscar
              <input id="catalog-search" type="search" autocomplete="off" placeholder="${esc(section.searchPlaceholder)}">
              <button type="button" class="button button--secondary catalog-search__clear" id="catalog-search-clear" hidden>Limpiar búsqueda</button>
            </label>
            <label>Categoría
              <select id="catalog-category"><option value="">Todas</option>${categoryOptions}</select>
            </label>
            <label>Subcategoría
              <select id="catalog-subcategory"><option value="">Todas</option>${subcategories}</select>
            </label>
            <label>Ordenar
              <select id="catalog-sort">${sortOptions}</select>
            </label>
            ${hasPrices ? `<fieldset class="catalog-price-filter"><legend>Precio (${esc(cfg.currency.code)})</legend>
              <label>Desde <input id="catalog-min-price" type="number" min="0" step="0.01" inputmode="decimal"></label>
              <label>Hasta <input id="catalog-max-price" type="number" min="0" step="0.01" inputmode="decimal"></label>
            </fieldset>` : ""}
          </div>
          <p class="catalog-result-count" id="catalog-result-count" role="status" aria-live="polite"></p>
          <p class="catalog-empty" id="catalog-empty" role="status" hidden>${esc(section.emptyText)}</p>
          <div class="product-grid" id="product-grid">${products}</div>
        </div>
      </section>`;
    },

    consultation() {
      const section = cfg.consultation;
      return `<section class="consultation-section section-dark" id="consulta" aria-labelledby="consultation-title">
        <div class="container">${sectionHead(section, "consultation")}
          <div class="consultation-panel">
            <p class="consultation-empty" id="consultation-empty">Todavía no agregaste productos a tu lista.</p>
            <ul class="consultation-list" id="consultation-list" aria-label="Productos seleccionados"></ul>
            <div class="consultation-summary" id="consultation-summary"></div>
            <div class="consultation-actions">
              <button type="button" class="button button--secondary" id="consultation-clear" disabled>Vaciar lista</button>
              <a class="button button--primary" id="consultation-send" href="#" target="_blank" rel="noopener noreferrer" hidden>Enviar consulta por WhatsApp</a>
            </div>
            <p class="consultation-disclaimer">La lista prepara un mensaje de consulta; no genera una compra, reserva ni pedido confirmado.</p>
            <p class="consultation-feedback" id="consultation-feedback" role="status" aria-live="polite"></p>
          </div>
        </div>
      </section>`;
    },

    about() {
      const a = cfg.about;
      if (!a.title && !a.lead && !a.paragraphs.length && !a.image) return "";
      const media = a.image
        ? `<figure class="about__media reveal"><img src="${esc(asset(a.image))}" alt="${esc(a.imageAlt)}" loading="lazy" decoding="async" width="800" height="1000" data-fallback="about"><span class="corner corner--tl" aria-hidden="true"></span><span class="corner corner--br" aria-hidden="true"></span></figure>`
        : "";
      const paragraphs = a.paragraphs.map((text) => `<p>${esc(text)}</p>`).join("");
      const specs = a.specs.length
        ? `<dl class="about__specs">${a.specs.map((item) => `<div><dt>${esc(item.label)}</dt><dd>${esc(item.value)}</dd></div>`).join("")}</dl>`
        : "";
      return `<section class="about${media ? "" : " about--no-media"}" id="nosotros" aria-labelledby="about-title">
        <div class="container about__grid">
          ${media}
          <div class="about__body reveal">
            ${a.label ? `<p class="section-index">${esc(a.label)}</p>` : ""}
            ${a.title ? `<h2 class="section-title" id="about-title">${esc(a.title)}</h2>` : ""}
            ${a.lead ? `<p class="about__lead">${esc(a.lead)}</p>` : ""}
            <div class="about__copy">${paragraphs}</div>
            ${specs}
          </div>
        </div>
      </section>`;
    },

    process() {
      const p = cfg.process;
      if (!p.items.length) return "";
      const steps = p.items
        .map((item) => `<li class="step reveal"><span class="step__number">${esc(item.number)}</span><div><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p></div></li>`)
        .join("");
      return `<section class="process section-dark" id="proceso" aria-labelledby="process-title">
        <div class="container">${sectionHead(p, "process")}<ol class="process__list">${steps}</ol></div>
      </section>`;
    },

    gallery() {
      const g = cfg.gallery;
      if (!g.items.length) return "";
      const items = g.items
        .map((item, index) => {
          gallery.push({ src: item.src, alt: item.alt, caption: item.caption, missing: false, node: null });
          return `<button class="gallery__item reveal" type="button" data-gallery-index="${index}" aria-label="Ampliar imagen: ${esc(item.alt)}">
            <img src="${esc(asset(item.src))}" alt="${esc(item.alt)}" loading="lazy" decoding="async" data-fallback="gallery">
            ${item.caption ? `<span class="gallery__caption">${esc(item.caption)}</span>` : ""}
            <span class="gallery__expand" aria-hidden="true">↗</span>
          </button>`;
        })
        .join("");
      return `<section class="gallery section-paper" id="galeria" aria-labelledby="gallery-title">
        <div class="container">${sectionHead(g, "gallery")}<div class="gallery__grid">${items}</div></div>
      </section>`;
    },

    faq() {
      const f = cfg.faq;
      if (!f.items.length) return "";
      const items = f.items
        .map((item) => `<details class="faq__item reveal"><summary><span>${esc(item.q)}</span><span class="faq__icon" aria-hidden="true">+</span></summary><div class="faq__answer"><p>${esc(item.a)}</p></div></details>`)
        .join("");
      return `<section class="faq" id="preguntas" aria-labelledby="faq-title">
        <div class="container faq__grid">
          ${sectionHead(f, "faq")}
          <div class="faq__list">${items}</div>
        </div>
      </section>`;
    },

    contact() {
      const c = cfg.contact;
      const hasContact = c.phone || c.email || c.whatsapp || c.address || c.hours || Object.keys(c.social).length || (c.map.enabled && c.map.embedUrl);
      if (!hasContact) return "";
      const map = c.map.enabled && c.map.embedUrl
        ? `<figure class="contact__map reveal">
            <iframe src="${esc(c.map.embedUrl)}" title="Mapa de ubicación de ${esc(cfg.brand.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            ${c.map.link ? `<a class="contact__maplink" href="${esc(c.map.link)}" target="_blank" rel="noopener noreferrer">Abrir en el mapa <span aria-hidden="true">↗</span></a>` : ""}
          </figure>`
        : "";
      const rows = [];
      if (c.phone) rows.push(`<div class="contact__row"><span class="contact__label">Teléfono</span><a href="${esc(c.phoneHref || "#")}">${esc(c.phone)}</a></div>`);
      if (c.email) rows.push(`<div class="contact__row"><span class="contact__label">Email</span><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>`);
      if (c.whatsapp) rows.push(`<div class="contact__row"><span class="contact__label">WhatsApp</span><a href="https://wa.me/${esc(c.whatsapp)}?text=${encodeURIComponent(c.whatsappMessage)}" target="_blank" rel="noopener noreferrer">${esc(c.phone || "Escribinos")} <span aria-hidden="true">↗</span></a></div>`);
      if (c.address || c.locality) {
        const address = [c.address, c.locality, c.region].filter(Boolean).join(", ");
        rows.push(`<div class="contact__row"><span class="contact__label">Dirección</span>${c.map.link ? `<a href="${esc(c.map.link)}" target="_blank" rel="noopener noreferrer">${esc(address)} <span aria-hidden="true">↗</span></a>` : `<span>${esc(address)}</span>`}</div>`);
      }
      if (c.hours) rows.push(`<div class="contact__row"><span class="contact__label">Horario</span><span>${esc(c.hours)}</span></div>`);
      const social = Object.keys(c.social).length
        ? `<div class="contact__social">${Object.keys(c.social)
            .map((key) => `<a href="${esc(c.social[key])}" target="_blank" rel="noopener noreferrer">${esc(key)} <span aria-hidden="true">↗</span></a>`)
            .join("")}</div>`
        : "";
      const whatsappCta = c.whatsapp
        ? `<a class="btn btn--dark" href="https://wa.me/${esc(c.whatsapp)}?text=${encodeURIComponent(c.whatsappMessage)}" target="_blank" rel="noopener noreferrer"><span>Escribir por WhatsApp</span><span class="btn__arrow" aria-hidden="true">↗</span></a>`
        : "";
      return `<section class="contact${map ? "" : " contact--no-map"}" id="contacto" aria-labelledby="contact-title">
        <div class="container contact__grid">
          <div class="contact__body reveal">
            ${c.label ? `<p class="section-index">${esc(c.label)}</p>` : ""}
            ${c.title ? `<h2 class="section-title" id="contact-title">${esc(c.title)}</h2>` : ""}
            ${c.lead ? `<p class="contact__lead">${esc(c.lead)}</p>` : ""}
            ${whatsappCta}
            <div class="contact__details">${rows.join("")}${social}</div>
          </div>
          ${map}
        </div>
      </section>`;
    },
  };

  /* ---------- Navegación y footer ---------- */
  function navigationItems(includeCta) {
    const items = core.NAV_KEYS.filter((key) => rendered.has(key)).map(
      (key) => `<li><a class="nav__link" href="#${core.SECTION_IDS[key]}" data-section-link="${key}">${esc(cfg.navigation.labels[key])}</a></li>`
    );
    if (includeCta && cfg.header.cta) {
      const cta = ctaMarkup(cfg.header.cta, "nav");
      if (cta) items.push(`<li class="nav__cta">${cta}</li>`);
    }
    return items.join("");
  }

  function renderNavigation() {
    const nav = $("#nav-list");
    if (nav) nav.innerHTML = navigationItems(true);
    const footerNav = $("#footer-nav");
    if (footerNav) footerNav.innerHTML = navigationItems(false);
  }

  function removeSectionLinks(key) {
    $$(`[data-section-link="${key}"]`).forEach((link) => {
      const item = link.closest("li");
      if (item) item.remove();
    });
  }

  function fillFooterContact() {
    const target = $("#footer-contact");
    if (!target) return;
    const c = cfg.contact;
    const parts = [];
    if (c.phone) parts.push(`<p><a href="${esc(c.phoneHref || "#")}">${esc(c.phone)}</a></p>`);
    if (c.email) parts.push(`<p><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>`);
    if (c.whatsapp) parts.push(`<p><a href="https://wa.me/${esc(c.whatsapp)}?text=${encodeURIComponent(c.whatsappMessage)}" target="_blank" rel="noopener noreferrer">WhatsApp <span aria-hidden="true">↗</span></a></p>`);
    if (c.address || c.locality) {
      const address = [c.address, c.locality].filter(Boolean).join(", ");
      parts.push(`<p>${c.map.link ? `<a href="${esc(c.map.link)}" target="_blank" rel="noopener noreferrer">${esc(address)}</a>` : esc(address)}</p>`);
    }
    if (c.hours) parts.push(`<p class="footer__hours">${esc(c.hours)}</p>`);
    target.innerHTML = parts.join("");
  }

  function renderFatal() {
    const main = $("#main");
    if (!main) return;
    main.innerHTML = `<section class="config-error" role="alert">
      <p class="section-index">Error de configuración</p>
      <h1>No pudimos cargar el contenido.</h1>
      <p>Revisá que <code>config.modelo-d.js</code> esté cargado antes de <code>engine.modelo-d.js</code> y mirá la consola del navegador.</p>
    </section>`;
  }

  /* ---------- Header + menú móvil ---------- */
  function initHeaderScroll() {
    const header = $("#site-header");
    if (!header) return;
    let ticking = false;
    const update = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      const frame = window.requestAnimationFrame || ((callback) => window.setTimeout(callback, 16));
      frame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  function setBackgroundInert(reason, value) {
    inertReasons[reason] = Boolean(value);
    const targets = {
      header: $("#site-header"),
      main: $("#main"),
      footer: $("#site-footer"),
    };
    const activeTargets = new Set();
    if (inertReasons.menu) {
      if (targets.main) activeTargets.add(targets.main);
      if (targets.footer) activeTargets.add(targets.footer);
    }
    if (inertReasons.lightbox) {
      if (targets.header) activeTargets.add(targets.header);
      if (targets.main) activeTargets.add(targets.main);
      if (targets.footer) activeTargets.add(targets.footer);
    }
    Object.keys(targets).forEach((key) => {
      const element = targets[key];
      if (!element) return;
      if (activeTargets.has(element)) {
        if ("inert" in element) element.inert = true;
        else element.setAttribute("aria-hidden", "true");
      } else {
        if ("inert" in element) element.inert = false;
        element.removeAttribute("aria-hidden");
      }
    });
  }

  function initMenu() {
    const header = $("#site-header");
    const toggle = $("#menu-toggle");
    const nav = $("#site-nav");
    if (!header || !toggle || !nav) return;
    const brand = $(".js-brand", header);

    const set = (open, options) => {
      const opts = options || {};
      const wasOpen = state.menuOpen;
      state.menuOpen = open;
      header.classList.toggle("is-menu-open", open);
      document.body.classList.toggle("no-scroll", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      setBackgroundInert("menu", open);
      if (open && !wasOpen && opts.focusFirst) {
        window.setTimeout(() => {
          const first = nav.querySelector("a");
          if (first) first.focus({ preventScroll: true });
        }, 50);
      } else if (!open && wasOpen && opts.restoreFocus) {
        toggle.focus();
      }
    };

    toggle.addEventListener("click", () => {
      set(!state.menuOpen, { focusFirst: !state.menuOpen, restoreFocus: state.menuOpen });
    });

    nav.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) return;
      set(false);
      const hash = link.getAttribute("href") || "";
      if (hash.charAt(0) !== "#" || hash.length < 2) return;
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      const heading = target.querySelector("h1, h2, h3") || target;
      if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
      window.setTimeout(() => {
        if (heading.isConnected) heading.focus({ preventScroll: true });
      }, 0);
    });

    document.addEventListener("keydown", (event) => {
      if (!state.menuOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        set(false, { restoreFocus: true });
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = $$("a[href], button:not([disabled])", header).filter((element) => element.getClientRects().length);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    if (typeof window.matchMedia === "function") {
      const desktop = window.matchMedia("(min-width: 960px)");
      const onChange = (event) => {
        if (event.matches) set(false);
      };
      if (typeof desktop.addEventListener === "function") desktop.addEventListener("change", onChange);
      else if (typeof desktop.addListener === "function") desktop.addListener(onChange);
    }
    if (brand) brand.addEventListener("click", () => set(false));
  }

  /* ---------- Lightbox ---------- */
  function initLightbox() {
    const dialog = $("#lightbox");
    if (!dialog || !gallery.length) return;
    const image = $("#lightbox-image");
    const caption = $("#lightbox-caption");
    const count = $("#lightbox-count");
    const closeButton = $("#lightbox-close");
    const prev = $("#lightbox-prev");
    const next = $("#lightbox-next");
    if (!image || !caption || !count || !closeButton || !prev || !next) return;

    gallery.forEach((item, index) => {
      item.node = $(`[data-gallery-index="${index}"]`);
    });

    let items = [];
    let index = 0;
    let opener = null;
    const hasModal = typeof dialog.showModal === "function";

    const update = () => {
      const item = items[index];
      if (!item) return;
      image.hidden = false;
      image.removeAttribute("hidden");
      image.src = asset(item.src);
      image.alt = item.alt;
      caption.textContent = item.caption || "";
      count.textContent = `${index + 1} / ${items.length}`;
    };

    const restore = () => {
      state.lightboxOpen = false;
      setBackgroundInert("lightbox", false);
      unlockScroll();
      if (opener && opener.isConnected) opener.focus();
    };

    const close = () => {
      if (hasModal && dialog.open) dialog.close();
      else {
        dialog.removeAttribute("open");
        dialog.classList.remove("is-open");
        restore();
      }
    };

    const open = (trigger) => {
      const available = gallery.filter((item) => !item.missing);
      if (!available.length) return;
      const target = gallery[Number(trigger.getAttribute("data-gallery-index"))];
      const position = available.indexOf(target);
      if (position === -1) return;
      items = available;
      index = position;
      opener = trigger;
      update();
      state.lightboxOpen = true;
      setBackgroundInert("lightbox", true);
      lockScroll();
      if (hasModal) dialog.showModal();
      else {
        dialog.setAttribute("open", "");
        dialog.classList.add("is-open");
      }
      closeButton.focus({ preventScroll: true });
    };

    const move = (delta) => {
      if (!items.length) return;
      index = (index + delta + items.length) % items.length;
      update();
    };

    $$("[data-gallery-index]").forEach((button) => {
      button.addEventListener("click", () => open(button));
    });

    closeButton.addEventListener("click", close);
    prev.addEventListener("click", () => move(-1));
    next.addEventListener("click", () => move(1));

    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });
    dialog.addEventListener("close", restore);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) close();
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      } else if (event.key === "Home") {
        event.preventDefault();
        index = 0;
        update();
      } else if (event.key === "End") {
        event.preventDefault();
        index = items.length - 1;
        update();
      } else if (event.key === "Tab") {
        const focusables = $$("button:not([disabled])", dialog).filter((element) => element.getClientRects().length);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    image.addEventListener("error", () => {
      image.hidden = true;
      caption.textContent = "Imagen no disponible";
    });
  }

  /* ---------- Imágenes faltantes ---------- */
  function bindImageFallbacks() {
    $$("img[data-fallback]").forEach((image) => {
      const handle = () => {
        const kind = image.getAttribute("data-fallback");
        image.hidden = true;
        image.removeAttribute("src");
        if (kind === "hero") {
          const hero = image.closest(".hero");
          if (hero) hero.classList.add("hero--no-image");
          state.heroImageMissing = true;
          const preload = document.getElementById("hero-preload");
          if (preload) preload.remove();
        } else if (kind === "service") {
          const service = image.closest(".service");
          if (service) service.classList.add("service--no-media");
        } else if (kind === "about") {
          const about = image.closest(".about");
          if (about) about.classList.add("about--no-media");
        } else if (kind === "gallery") {
          const button = image.closest("[data-gallery-index]");
          const position = Number(button && button.getAttribute("data-gallery-index"));
          if (gallery[position]) gallery[position].missing = true;
          if (button) button.remove();
          if (gallery.length && gallery.every((item) => item.missing)) {
            const section = document.getElementById("galeria");
            if (section) section.remove();
            removeSectionLinks("gallery");
          }
        }
      };
      image.addEventListener("error", handle, { once: true });
      if (image.complete && image.naturalWidth === 0) handle();
    });
  }

  /* ---------- Aparición progresiva ---------- */
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
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    elements.forEach((element) => observer.observe(element));
  }

  /* ---------- Preload ---------- */
  function checkHeroPreload() {
    const link = document.getElementById("hero-preload");
    const heroActive = rendered.has("hero") && cfg.hero.image;
    const expected = heroActive ? asset(cfg.hero.image) : "";
    if (!link) {
      if (expected && !state.heroImageMissing) log("warn", 'Falta <link id="hero-preload"> en index.html. El hero no tendrá precarga.');
      return;
    }
    if (!expected) {
      link.remove();
      return;
    }
    if (link.getAttribute("href") !== expected) {
      log("warn", `El preload del hero no coincide con hero.image. Se corrige a "${expected}".`);
      link.setAttribute("href", expected);
    }
  }

  /* ---------- SEO ---------- */
  let staticSeo = null;
  let staticStructuredData = null;

  function readStaticSeo() {
    const meta = (selector) => {
      const element = $(selector);
      return element ? element.getAttribute("content") || "" : "";
    };
    const description = $('meta[name="description"]');
    const canonical = $('link[rel="canonical"]');
    const ld = document.getElementById("ld-json");
    if (ld) {
      try {
        staticStructuredData = JSON.parse(ld.textContent || "");
      } catch (error) {
        staticStructuredData = null;
        log("warn", "El JSON-LD estático no es JSON válido. El motor lo reemplaza al cargar.");
      }
    }
    return {
      title: document.title,
      description: description ? description.getAttribute("content") || "" : "",
      canonical: canonical ? canonical.getAttribute("href") || "" : "",
      ogTitle: meta('meta[property="og:title"]'),
      ogDescription: meta('meta[property="og:description"]'),
      ogSiteName: meta('meta[property="og:site_name"]'),
      ogLocale: meta('meta[property="og:locale"]'),
      twitterTitle: meta('meta[name="twitter:title"]'),
      twitterDescription: meta('meta[name="twitter:description"]'),
    };
  }

  function setMeta(selector, content) {
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
  }

  function applySeo() {
    const s = cfg.seo;
    const seo = core.buildSeo(cfg);
    staticSeo = readStaticSeo();

    if (staticSeo) {
      if (s.title && staticSeo.title && staticSeo.title !== s.title) {
        log("warn", `El <title> estático ("${staticSeo.title}") no coincide con seo.title ("${s.title}"). Sincronizá el <head>.`);
      }
      if (s.description && staticSeo.description !== s.description) {
        log("warn", "La meta description estática no coincide con seo.description. Sincronizá el <head>.");
      }
      if (staticSeo.canonical && !s.url) {
        log("warn", "Hay un canonical estático pero seo.url está vacío. Completá seo.url o quitá ese canonical.");
      } else if (staticSeo.canonical && s.url && staticSeo.canonical !== s.url) {
        log("warn", "El canonical estático no coincide con seo.url. Sincronizá el <head>.");
      }

      const checks = [
        ["og:title", staticSeo.ogTitle, s.title],
        ["og:description", staticSeo.ogDescription, s.description],
        ["og:site_name", staticSeo.ogSiteName, cfg.brand.name],
        ["og:locale", staticSeo.ogLocale, s.locale],
        ["twitter:title", staticSeo.twitterTitle, s.title],
        ["twitter:description", staticSeo.twitterDescription, s.description],
      ];
      const mismatches = [];
      const missing = [];
      checks.forEach(([label, staticValue, expected]) => {
        if (!expected) return;
        if (!staticValue) missing.push(label);
        else if (staticValue !== expected) mismatches.push(label);
      });
      if (mismatches.length) log("warn", `Estos metadatos estáticos no coinciden con la configuración (${mismatches.join(", ")}). Sincronizá el <head>.`);
      if (missing.length) log("warn", `Faltan metadatos estáticos para crawlers sin JavaScript (${missing.join(", ")}). Agregalos al <head>.`);
    }

    if (staticStructuredData) {
      const staticAddress = staticStructuredData.address || {};
      const mismatches = [];
      if (staticStructuredData["@type"] && staticStructuredData["@type"] !== s.schemaType) mismatches.push("@type");
      if (staticStructuredData.name && staticStructuredData.name !== cfg.brand.name) mismatches.push("name");
      if (staticStructuredData.telephone && cfg.contact.phone && staticStructuredData.telephone !== cfg.contact.phone) mismatches.push("telephone");
      if (staticStructuredData.email && cfg.contact.email && staticStructuredData.email !== cfg.contact.email) mismatches.push("email");
      if (staticAddress.streetAddress && cfg.contact.address && staticAddress.streetAddress !== cfg.contact.address) mismatches.push("address.streetAddress");
      if (staticAddress.addressLocality && cfg.contact.locality && staticAddress.addressLocality !== cfg.contact.locality) mismatches.push("address.addressLocality");
      if (mismatches.length) log("warn", `El JSON-LD estático no coincide con la configuración (${mismatches.join(", ")}). Sincronizá #ld-json.`);
    }

    document.title = s.title;
    setMeta('meta[name="description"]', s.description);
    setMeta('meta[property="og:type"]', "website");
    setMeta('meta[property="og:title"]', s.title);
    setMeta('meta[property="og:description"]', s.description);
    setMeta('meta[property="og:site_name"]', cfg.brand.name);
    setMeta('meta[property="og:locale"]', s.locale);
    setMeta('meta[name="twitter:card"]', seo.image ? "summary_large_image" : "summary");
    setMeta('meta[name="twitter:title"]', s.title);
    setMeta('meta[name="twitter:description"]', s.description);

    if (s.url) {
      let canonical = $('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = s.url;
      setMeta('meta[property="og:url"]', s.url);
      if (seo.image) {
        setMeta('meta[property="og:image"]', seo.image);
        setMeta('meta[property="og:image:alt"]', s.imageAlt);
        setMeta('meta[name="twitter:image"]', seo.image);
      }
    }

    let tag = document.getElementById("ld-json");
    if (!tag) {
      tag = document.createElement("script");
      tag.type = "application/ld+json";
      tag.id = "ld-json";
      document.head.appendChild(tag);
    }
    tag.textContent = JSON.stringify(seo.jsonld).replace(/</g, "\\u003c");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
