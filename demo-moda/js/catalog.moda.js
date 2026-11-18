/* ==========================================================================
   ALMATE · Demo Moda · catalog.moda.js
   Renderizado del catálogo: tarjetas Cutout, búsqueda, categorías, filtros
   (género, talle, color, precio, sale) y orden. Solo navegador.
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
    { id: "featured", label: "Destacados" },
    { id: "new", label: "Novedades" },
    { id: "price-asc", label: "Precio: menor a mayor" },
    { id: "price-desc", label: "Precio: mayor a menor" },
  ];

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function badgeFor(product, api) {
    const order = ["new", "featured", "sale", "exclusive", "limited"];
    const tag = (product.tags || []).find((item) => order.includes(item));
    if (!tag) return "";
    const labels = { new: "Nuevo", featured: "Destacado", sale: "Sale", exclusive: "Exclusivo", limited: "Limitado" };
    return `<span class="cutout__badge cutout__badge--${tag}">${labels[tag]}</span>`;
  }

  function init(context) {
    const { cfg, products, api, openDetail, formatPrice } = context;

    const grid = document.getElementById("catalog-grid");
    const countEl = document.getElementById("catalog-count");
    const emptyEl = document.getElementById("catalog-empty");
    if (!grid) return { applyFilter() {}, reset() {}, setSearch() {}, refresh() {} };

    const state = {
      search: "",
      gender: "",
      category: "",
      size: "",
      color: "",
      priceRange: "all",
      sale: false,
      sort: "featured",
    };

    const searchInput = document.getElementById("filter-search");
    const sortSelect = document.getElementById("filter-sort");
    const categoriesEl = document.getElementById("filter-categories");
    const gendersEl = document.getElementById("filter-genders");
    const sizesEl = document.getElementById("filter-sizes");
    const colorsEl = document.getElementById("filter-colors");
    const priceSelect = document.getElementById("filter-price");
    const clearButton = document.getElementById("filter-clear");
    const toggleButton = document.getElementById("filter-toggle");
    const filtersPanel = document.getElementById("catalog-filters");

    function allCategories() {
      const unique = [];
      products.forEach((product) => {
        if (!unique.some((item) => item.id === product.category)) unique.push({ id: product.category, name: api.categoryLabel(product.category) });
      });
      return unique;
    }

    function allSizes() {
      const order = ["XS", "S", "M", "L", "XL", "Único", "36", "38", "40", "42", "44"];
      const set = [];
      products.forEach((product) => product.sizes.forEach((size) => {
        if (!set.includes(size)) set.push(size);
      }));
      return set.sort((a, b) => order.indexOf(a) - order.indexOf(b) || a.localeCompare(b));
    }

    function allColors() {
      const unique = [];
      products.forEach((product) => product.colors.forEach((color) => {
        if (!unique.some((item) => item.name === color.name)) unique.push(color);
      }));
      return unique;
    }

    function chipButton(label, active, dataAttrs) {
      const attrs = Object.keys(dataAttrs).map((key) => `data-${key}="${dataAttrs[key]}"`).join(" ");
      return `<button type="button" class="chip${active ? " is-active" : ""}" ${attrs}>${label}</button>`;
    }

    function renderControls() {
      if (sortSelect) {
        sortSelect.innerHTML = SORT_OPTIONS.map((option) => `<option value="${option.id}"${state.sort === option.id ? " selected" : ""}>${option.label}</option>`).join("");
      }
      if (priceSelect) {
        priceSelect.innerHTML = PRICE_RANGES.map((range) => `<option value="${range.id}"${state.priceRange === range.id ? " selected" : ""}>${range.label}</option>`).join("");
      }
      if (categoriesEl) {
        categoriesEl.innerHTML =
          chipButton("Todos", !state.category, { category: "" }) +
          allCategories().map((category) => chipButton(category.name, state.category === category.id, { category: category.id })).join("");
      }
      if (gendersEl) {
        gendersEl.innerHTML =
          chipButton("Todos", !state.gender, { gender: "" }) +
          api.genders.map((gender) => chipButton(gender.name, state.gender === gender.id, { gender: gender.id })).join("");
      }
      if (sizesEl) {
        sizesEl.innerHTML =
          chipButton("Todos", !state.size, { size: "" }) +
          allSizes().map((size) => chipButton(size, state.size === size, { size })).join("");
      }
      if (colorsEl) {
        colorsEl.innerHTML =
          `<button type="button" class="chip${!state.color ? " is-active" : ""}" data-color="">Todos</button>` +
          allColors().map((color) => {
            const active = state.color === color.name;
            return `<button type="button" class="chip${active ? " is-active" : ""}" data-color="${color.name}"><span class="swatch swatch--inline" style="background:${color.value}"></span>${color.name}</button>`;
          }).join("");
      }
    }

    function matches(product) {
      if (state.gender && product.gender !== state.gender) return false;
      if (state.category && product.category !== state.category) return false;
      if (state.sale && !api.isOnSale(product)) return false;
      if (state.size) {
        const hasSize = product.sizes.includes(state.size) && product.colors.some((color) => api.isVariantAvailable(product, color.name, state.size));
        if (!hasSize) return false;
      }
      if (state.color && !product.colors.some((color) => color.name === state.color)) return false;
      if (state.priceRange && state.priceRange !== "all") {
        const range = PRICE_RANGES.find((item) => item.id === state.priceRange);
        if (range && (product.price < range.min || product.price > range.max)) return false;
      }
      if (state.search) {
        const haystack = normalizeText([product.name, product.description, api.categoryLabel(product.category), product.gender, (product.tags || []).join(" ")].join(" "));
        if (!haystack.includes(normalizeText(state.search))) return false;
      }
      return true;
    }

    function sortProducts(list) {
      const sorted = list.slice();
      if (state.sort === "price-asc") return sorted.sort((a, b) => a.price - b.price);
      if (state.sort === "price-desc") return sorted.sort((a, b) => b.price - a.price);
      if (state.sort === "new") return sorted.sort((a, b) => (Number(api.isNew(b)) - Number(api.isNew(a))) || a.name.localeCompare(b.name));
      return sorted.sort((a, b) => (Number(api.isFeatured(b)) - Number(api.isFeatured(a))) || (Number(api.isNew(b)) - Number(api.isNew(a))) || a.name.localeCompare(b.name));
    }

    function card(product) {
      const swatches = product.colors
        .slice(0, 4)
        .map((color) => `<span class="swatch" style="background:${color.value}" title="${color.name}"></span>`)
        .join("");
      const extra = product.colors.length > 4 ? `<span class="cutout__more">+${product.colors.length - 4}</span>` : "";
      return `
      <article class="cutout">
        <button class="cutout__open" type="button" data-open-product="${product.id}">
          <span class="cutout__media">
            <img src="${product.image}" alt="${product.imageAlt}" loading="lazy" decoding="async">
            ${badgeFor(product, api)}
            <span class="cutout__cta">Seleccionar</span>
          </span>
          <span class="cutout__info">
            <span class="cutout__category">${api.categoryLabel(product.category)}</span>
            <span class="cutout__name">${product.name}</span>
            <span class="cutout__prices">
              <span class="cutout__price">${formatPrice(product.price) || "Consultar precio"}</span>
              ${product.oldPrice ? `<s class="cutout__old">${formatPrice(product.oldPrice)}</s>` : ""}
            </span>
            <span class="cutout__colors">${swatches}${extra}</span>
          </span>
        </button>
      </article>`;
    }

    function render() {
      const visible = sortProducts(products.filter(matches));
      grid.innerHTML = visible.map(card).join("");
      if (countEl) countEl.textContent = `${visible.length} ${visible.length === 1 ? "prenda" : "prendas"}`;
      if (emptyEl) emptyEl.hidden = visible.length !== 0;
    }

    function activeFilterCount() {
      let count = 0;
      if (state.category) count += 1;
      if (state.gender) count += 1;
      if (state.size) count += 1;
      if (state.color) count += 1;
      if (state.priceRange && state.priceRange !== "all") count += 1;
      if (state.sale) count += 1;
      return count;
    }

    function updateIndicators() {
      const total = activeFilterCount();
      const countBadge = document.getElementById("filter-count");
      if (countBadge) {
        countBadge.textContent = String(total);
        countBadge.hidden = total === 0;
      }
      if (toggleButton) toggleButton.classList.toggle("is-active", total > 0);
      const groupState = {
        category: state.category,
        gender: state.gender,
        size: state.size,
        color: state.color,
        price: state.priceRange && state.priceRange !== "all" ? state.priceRange : "",
      };
      document.querySelectorAll(".filter-group[data-filter-group]").forEach((group) => {
        const key = group.getAttribute("data-filter-group");
        const badge = group.querySelector(".filter-group__badge");
        if (!badge) return;
        badge.textContent = "1";
        badge.hidden = !groupState[key];
      });
    }

    function refresh() {
      renderControls();
      render();
      updateIndicators();
    }

    function applyFilter(filter) {
      if (!filter) return;
      if (filter.gender) {
        state.gender = filter.gender;
      } else if (filter.category) {
        state.category = filter.category;
      } else if (filter.sale) {
        state.sale = true;
      }
      refresh();
      const catalogSection = document.getElementById("catalogo");
      if (catalogSection) catalogSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function reset() {
      state.gender = "";
      state.category = "";
      state.size = "";
      state.color = "";
      state.priceRange = "all";
      state.sale = false;
      if (searchInput) searchInput.value = "";
      state.search = "";
      refresh();
    }

    function setSearch(value) {
      state.search = value;
      if (searchInput) searchInput.value = value;
      render();
    }

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.search = searchInput.value.trim();
        render();
      });
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        state.sort = sortSelect.value;
        render();
      });
    }
    if (priceSelect) {
      priceSelect.addEventListener("change", () => {
        state.priceRange = priceSelect.value;
        refresh();
      });
    }
    if (clearButton) clearButton.addEventListener("click", reset);
    function setPanelOpen(open) {
      if (!filtersPanel) return;
      filtersPanel.classList.toggle("is-open", open);
      if (toggleButton) toggleButton.setAttribute("aria-expanded", String(open));
    }
    if (toggleButton && filtersPanel) {
      toggleButton.addEventListener("click", () => {
        setPanelOpen(!filtersPanel.classList.contains("is-open"));
      });
      document.addEventListener("click", (event) => {
        if (!filtersPanel.classList.contains("is-open")) return;
        if (filtersPanel.contains(event.target)) return;
        if (toggleButton.contains(event.target)) return;
        setPanelOpen(false);
      }, true);
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && filtersPanel.classList.contains("is-open")) {
          setPanelOpen(false);
          toggleButton.focus();
        }
      });
    }
    [categoriesEl, gendersEl, sizesEl, colorsEl].forEach((panel) => {
      if (!panel) return;
      panel.addEventListener("click", (event) => {
        const button = event.target.closest("[data-category], [data-gender], [data-size], [data-color]");
        if (!button) return;
        if (button.hasAttribute("data-category")) state.category = button.getAttribute("data-category");
        if (button.hasAttribute("data-gender")) state.gender = button.getAttribute("data-gender");
        if (button.hasAttribute("data-size")) state.size = button.getAttribute("data-size");
        if (button.hasAttribute("data-color")) state.color = button.getAttribute("data-color");
        refresh();
      });
    });

    grid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-open-product]");
      if (!button) return;
      const product = products.find((item) => item.id === button.getAttribute("data-open-product"));
      if (product && openDetail) openDetail(product);
    });

    refresh();
    return { applyFilter, reset, setSearch, refresh, getVisibleCount: () => products.filter(matches).length };
  }

  root.ModaCatalog = { init, PRICE_RANGES, SORT_OPTIONS };
})(typeof globalThis !== "undefined" ? globalThis : this);
