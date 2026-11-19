/* ==========================================================================
   ALMATE · Demo Moda 2 (PIOLA) · catalog.moda.js
   Catálogo: tarjetas "sticker", búsqueda, categorías (chips), filtros
   (género, talle, color, precio, oferta, novedades) y orden. Solo navegador.

   · El filtro "Mujer"/"Hombre" incluye también las prendas unisex.
   · Los filtros de navegación (menú, categorías, footer) REEMPLAZAN a los
     demás: así "Ofertas" después de "Mujer" no devuelve una lista vacía.
   · En móvil el panel de filtros se abre como hoja inferior.
   ========================================================================== */
(function (root) {
  "use strict";

  const PRICE_RANGES = [
    { id: "all", label: "Todos los precios", min: 0, max: Infinity },
    { id: "0-30000", label: "Hasta $30.000", min: 0, max: 30000 },
    { id: "30000-60000", label: "$30.000 – $60.000", min: 30000, max: 60000 },
    { id: "60000-90000", label: "$60.000 – $90.000", min: 60000, max: 90000 },
    { id: "90000-plus", label: "Más de $90.000", min: 90000, max: Infinity },
  ];

  const SORT_OPTIONS = [
    { id: "featured", label: "Destacados primero" },
    { id: "new", label: "Lo más nuevo" },
    { id: "price-asc", label: "Precio: de menor a mayor" },
    { id: "price-desc", label: "Precio: de mayor a menor" },
  ];

  const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "38", "40", "42", "44", "46", "Único"];
  const TONES = ["sky", "sun", "pink", "lime", "lilac", "paper"];
  const DEFAULT_TAG_LABELS = { new: "Nuevo", "best-seller": "Más pedido", limited: "Edición corta", sale: "Oferta", exclusive: "Solo acá", featured: "Destacado" };

  const esc = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function normalizeText(value) {
    return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function init(context) {
    const { cfg, products, api, openDetail, formatPrice } = context;
    const tagLabels = Object.assign({}, DEFAULT_TAG_LABELS, cfg.tags || {});

    const grid = document.getElementById("catalog-grid");
    const noop = { applyFilter() {}, reset() {}, setSearch() {}, searchAll() {}, refresh() {}, getVisibleCount: () => 0, getState: () => ({}) };
    if (!grid) return noop;

    const el = (id) => document.getElementById(id);
    const countEl = el("catalog-count");
    const emptyEl = el("catalog-empty");
    const searchInput = el("filter-search");
    const sortSelect = el("filter-sort");
    const categoriesEl = el("filter-categories");
    const gendersEl = el("filter-genders");
    const sizesEl = el("filter-sizes");
    const colorsEl = el("filter-colors");
    const priceSelect = el("filter-price");
    const clearButtons = [el("filter-clear"), el("filter-clear-empty")].filter(Boolean);
    const toggleButton = el("filter-toggle");
    const closeButton = el("filter-close");
    const badgeEl = el("filter-badge");
    const panel = el("catalog-filters");
    const backdrop = el("filters-backdrop");
    const activeEl = el("catalog-active");

    const state = { search: "", gender: "", category: "", size: "", color: "", priceRange: "all", sale: false, isNew: false, sort: "featured" };

    /* ---------- Opciones derivadas del catálogo ---------- */
    function allCategories() {
      const unique = [];
      products.forEach((product) => {
        if (!unique.some((item) => item.id === product.category)) unique.push({ id: product.category, name: api.categoryLabel(product.category) });
      });
      return unique;
    }

    function allSizes() {
      const set = [];
      products.forEach((product) => product.sizes.forEach((size) => { if (!set.includes(size)) set.push(size); }));
      const rank = (size) => (SIZE_ORDER.includes(size) ? SIZE_ORDER.indexOf(size) : 99);
      return set.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
    }

    function allColors() {
      const unique = [];
      products.forEach((product) => product.colors.forEach((color) => {
        if (!unique.some((item) => item.name === color.name)) unique.push(color);
      }));
      return unique;
    }

    /* ---------- Controles ---------- */
    function chip(label, active, data, extra) {
      const attrs = Object.keys(data).map((key) => `data-${key}="${esc(data[key])}"`).join(" ");
      return `<button type="button" class="chip${active ? " is-active" : ""}" aria-pressed="${active}" ${attrs}>${extra || ""}${esc(label)}</button>`;
    }

    function renderControls() {
      if (sortSelect) sortSelect.innerHTML = SORT_OPTIONS.map((o) => `<option value="${o.id}"${state.sort === o.id ? " selected" : ""}>${o.label}</option>`).join("");
      if (priceSelect) priceSelect.innerHTML = PRICE_RANGES.map((r) => `<option value="${r.id}"${state.priceRange === r.id ? " selected" : ""}>${r.label}</option>`).join("");
      if (categoriesEl) {
        categoriesEl.innerHTML = chip("Todo", !state.category, { category: "" }) + allCategories().map((c) => chip(c.name, state.category === c.id, { category: c.id })).join("");
      }
      if (gendersEl) {
        gendersEl.innerHTML = chip("Todos", !state.gender, { gender: "" }) + api.genders.map((g) => chip(g.name, state.gender === g.id, { gender: g.id })).join("");
      }
      if (sizesEl) {
        sizesEl.innerHTML = chip("Todos", !state.size, { size: "" }) + allSizes().map((s) => chip(s, state.size === s, { size: s })).join("");
      }
      if (colorsEl) {
        colorsEl.innerHTML = chip("Todos", !state.color, { color: "" }) + allColors().map((c) => chip(c.name, state.color === c.name, { color: c.name }, `<span class="swatch swatch--inline" style="background:${esc(c.value)}"></span>`)).join("");
      }
    }

    /* ---------- Filtrado y orden ---------- */
    function genderOk(product) {
      if (!state.gender) return true;
      if (state.gender === "unisex") return product.gender === "unisex";
      return product.gender === state.gender || product.gender === "unisex";
    }

    function matches(product) {
      if (state.category && product.category !== state.category) return false;
      if (state.sale && !api.isOnSale(product)) return false;
      if (state.isNew && !api.isNew(product)) return false;
      if (state.priceRange && state.priceRange !== "all") {
        const range = PRICE_RANGES.find((item) => item.id === state.priceRange);
        if (range && (product.price < range.min || product.price > range.max)) return false;
      }
      if (state.search) {
        const haystack = normalizeText([product.name, product.description, api.categoryLabel(product.category), product.gender, product.colors.map((c) => c.name).join(" ")].join(" "));
        if (!haystack.includes(normalizeText(state.search))) return false;
      }
      return true;
    }

    function sortProducts(list) {
      const sorted = list.slice();
      const flag = (fn, p) => Number(fn(p));
      if (state.sort === "price-asc") return sorted.sort((a, b) => a.price - b.price);
      if (state.sort === "price-desc") return sorted.sort((a, b) => b.price - a.price);
      if (state.sort === "new") return sorted.sort((a, b) => flag(api.isNew, b) - flag(api.isNew, a) || a.name.localeCompare(b.name));
      return sorted.sort((a, b) => flag(api.isFeatured, b) - flag(api.isFeatured, a) || flag(api.isNew, b) - flag(api.isNew, a) || a.name.localeCompare(b.name));
    }

    /* ---------- Tarjeta sticker ---------- */
    function genderLabel(id) {
      const found = api.genders.find((g) => g.id === id);
      return found ? found.name : "";
    }

    function card(product) {
      const tone = TONES.includes(product.tone) ? product.tone : "sun";
      const tag = api.badgeTag(product);
      const swatches = product.colors.slice(0, 5).map((color) => `<span class="swatch" style="background:${esc(color.value)}" title="${esc(color.name)}"></span>`).join("");
      const extra = product.colors.length > 5 ? `<span class="scard__more">+${product.colors.length - 5}</span>` : "";
      return `
      <article class="scard" style="--tone: var(--${tone})">
        <button class="scard__open" type="button" data-open-product="${esc(product.id)}" aria-label="Elegir color y talle de ${esc(product.name)}">
          <span class="scard__media">
            <img src="${esc(product.image)}" alt="${esc(product.imageAlt)}" loading="lazy" decoding="async" width="400" height="500">
            ${tag ? `<span class="scard__tag scard__tag--${tag}">${esc(tagLabels[tag] || tag)}</span>` : ""}
          </span>
          <span class="scard__info">
            <span class="scard__cat">${esc(api.categoryLabel(product.category))}</span>
            <span class="scard__name">${esc(product.name)}</span>
            <span class="scard__row">
              <span class="scard__price">${formatPrice(product.price) || "Consultar precio"}</span>
              ${product.oldPrice ? `<s class="scard__old">${formatPrice(product.oldPrice)}</s>` : ""}
            </span>
            <span class="scard__colors">${swatches}${extra}</span>
          </span>
          <span class="scard__cta" aria-hidden="true">Ver producto <b>→</b></span>
        </button>
      </article>`;
    }

    /* ---------- Filtros activos ---------- */
    function activeFilters() {
      const list = [];
      if (state.search) list.push({ key: "search", label: `“${state.search}”` });
      if (state.category) list.push({ key: "category", label: api.categoryLabel(state.category) });
      if (state.priceRange !== "all") {
        const range = PRICE_RANGES.find((r) => r.id === state.priceRange);
        if (range) list.push({ key: "priceRange", label: range.label });
      }
      if (state.sale) list.push({ key: "sale", label: "Ofertas" });
      if (state.isNew) list.push({ key: "isNew", label: "Lo nuevo" });
      return list;
    }

    function clearKey(key) {
      if (key === "priceRange") state.priceRange = "all";
      else if (key === "sale" || key === "isNew") state[key] = false;
      else state[key] = "";
      if (key === "search" && searchInput) searchInput.value = "";
    }

    function render() {
      const visible = sortProducts(products.filter(matches));
      grid.innerHTML = visible.map(card).join("");
      if (countEl) countEl.textContent = visible.length === 0 ? "Ningún producto" : `${visible.length} ${visible.length === 1 ? "producto" : "productos"}`;
      if (emptyEl) emptyEl.hidden = visible.length !== 0;
      grid.hidden = visible.length === 0;
      const active = activeFilters();
      const panelCount = active.filter((item) => item.key !== "search" && item.key !== "category").length;
      if (badgeEl) {
        badgeEl.textContent = String(panelCount);
        badgeEl.hidden = panelCount === 0;
      }
      if (activeEl) {
        activeEl.hidden = active.length === 0;
        activeEl.innerHTML = active.map((item) => `<button type="button" class="chip chip--active" data-clear="${item.key}" aria-label="Quitar filtro ${esc(item.label)}">${esc(item.label)} <span aria-hidden="true">×</span></button>`).join("");
      }
    }

    function refresh() {
      renderControls();
      render();
    }

    /* ---------- API pública ---------- */
    function resetState() {
      state.search = "";
      state.gender = "";
      state.category = "";
      state.size = "";
      state.color = "";
      state.priceRange = "all";
      state.sale = false;
      state.isNew = false;
      if (searchInput) searchInput.value = "";
    }

    function applyFilter(filter, options) {
      if (!filter) return;
      resetState();
      if (filter.gender) state.gender = filter.gender;
      if (filter.category) state.category = filter.category;
      if (filter.sale) state.sale = true;
      if (filter.new) state.isNew = true;
      if (filter.new) state.sort = "new";
      else if (state.sort === "new") state.sort = "featured";
      closePanel(false);
      refresh();
      if (!options || options.scroll !== false) {
        const section = document.getElementById("catalogo");
        if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    function reset() {
      resetState();
      state.sort = "featured";
      refresh();
    }

    /* Búsqueda global (header): ignora los demás filtros para buscar en todo el catálogo. */
    function searchAll(value) {
      resetState();
      state.sort = "featured";
      state.search = value;
      if (searchInput) searchInput.value = value;
      refresh();
    }

    function setSearch(value) {
      state.search = value;
      if (searchInput && searchInput.value !== value) searchInput.value = value;
      render();
    }

    /* ---------- Panel de filtros (hoja en móvil) ---------- */
    const isSheet = () => typeof window.matchMedia === "function" && window.matchMedia("(max-width: 719px)").matches;

    function openPanel() {
      if (!panel) return;
      panel.classList.add("is-open");
      if (backdrop) { backdrop.hidden = false; backdrop.classList.add("is-open"); }
      if (toggleButton) toggleButton.setAttribute("aria-expanded", "true");
      if (isSheet()) {
        document.body.classList.add("no-scroll");
        const first = panel.querySelector("button, select, input");
        if (first) first.focus();
      }
    }

    function closePanel(returnFocus) {
      if (!panel) return;
      const wasOpen = panel.classList.contains("is-open");
      panel.classList.remove("is-open");
      if (backdrop) { backdrop.classList.remove("is-open"); backdrop.hidden = true; }
      if (toggleButton) toggleButton.setAttribute("aria-expanded", "false");
      document.body.classList.remove("no-scroll");
      if (wasOpen && returnFocus !== false && toggleButton) toggleButton.focus();
    }

    if (searchInput) searchInput.addEventListener("input", () => setSearch(searchInput.value.trim()));
    if (sortSelect) sortSelect.addEventListener("change", () => { state.sort = sortSelect.value; render(); });
    if (priceSelect) priceSelect.addEventListener("change", () => { state.priceRange = priceSelect.value; render(); });
    clearButtons.forEach((button) => button.addEventListener("click", reset));
    if (toggleButton) toggleButton.addEventListener("click", () => (panel && panel.classList.contains("is-open") ? closePanel() : openPanel()));
    if (closeButton) closeButton.addEventListener("click", () => closePanel());
    if (backdrop) backdrop.addEventListener("click", () => closePanel());
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && panel && panel.classList.contains("is-open")) closePanel();
    });

    [categoriesEl, gendersEl, sizesEl, colorsEl].forEach((box) => {
      if (!box) return;
      box.addEventListener("click", (event) => {
        const button = event.target.closest("[data-category], [data-gender], [data-size], [data-color]");
        if (!button) return;
        ["category", "gender", "size", "color"].forEach((key) => {
          if (button.hasAttribute("data-" + key)) state[key] = button.getAttribute("data-" + key);
        });
        refresh();
      });
    });

    if (activeEl) {
      activeEl.addEventListener("click", (event) => {
        const button = event.target.closest("[data-clear]");
        if (!button) return;
        clearKey(button.getAttribute("data-clear"));
        refresh();
      });
    }

    grid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-open-product]");
      if (!button) return;
      const product = products.find((item) => item.id === button.getAttribute("data-open-product"));
      if (product && openDetail) openDetail(product);
    });

    refresh();
    return { applyFilter, reset, setSearch, searchAll, refresh, getVisibleCount: () => products.filter(matches).length, getState: () => Object.assign({}, state) };
  }

  root.ModaCatalog = { init, PRICE_RANGES, SORT_OPTIONS };
})(typeof globalThis !== "undefined" ? globalThis : this);
