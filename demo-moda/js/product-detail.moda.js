/* ==========================================================================
   ALMATE · Demo Moda · product-detail.moda.js
   Ficha de producto en modal: fotografía, colores, talles, disponibilidad y
   cantidad. Valida la combinación color/talle antes de agregar al carrito.
   Solo navegador.
   ========================================================================== */
(function (root) {
  "use strict";

  function init(context) {
    const { cfg, api, formatPrice, onAdd } = context;
    const dialog = document.getElementById("product-modal");
    if (!dialog) return { open() {} };

    const els = {
      image: document.getElementById("pd-image"),
      category: document.getElementById("pd-category"),
      name: document.getElementById("pd-name"),
      description: document.getElementById("pd-description"),
      price: document.getElementById("pd-price"),
      old: document.getElementById("pd-old"),
      colors: document.getElementById("pd-colors"),
      sizes: document.getElementById("pd-sizes"),
      availability: document.getElementById("pd-availability"),
      qty: document.getElementById("pd-qty"),
      minus: document.getElementById("pd-qty-minus"),
      plus: document.getElementById("pd-qty-plus"),
      add: document.getElementById("pd-add"),
      error: document.getElementById("pd-error"),
      close: document.getElementById("pd-close"),
    };

    let product = null;
    let color = "";
    let size = "";
    let qty = 1;

    const hasModal = typeof dialog.showModal === "function";

    function close() {
      if (hasModal && dialog.open) dialog.close();
      else {
        dialog.removeAttribute("open");
        dialog.classList.remove("is-open");
      }
    }

    function setAvailability(message) {
      if (els.availability) els.availability.textContent = message;
    }

    function showError(message) {
      if (!els.error) return;
      els.error.textContent = message || "";
      els.error.hidden = !message;
    }

    function renderColors() {
      if (!els.colors) return;
      const colors = product.colors || [];
      if (colors.length === 1) color = colors[0].name;
      els.colors.innerHTML = colors
        .map((item) => {
          const selected = color === item.name;
          return `<button type="button" class="option option--color${selected ? " is-selected" : ""}" data-color="${item.name}" aria-pressed="${selected}">
            <span class="swatch swatch--large" style="background:${item.value}"></span>
            <span class="option__label">${item.name}</span>
          </button>`;
        })
        .join("");
    }

    function renderSizes() {
      if (!els.sizes) return;
      const sizes = product.sizes || [];
      els.sizes.innerHTML = sizes
        .map((item) => {
          const available = color ? api.isVariantAvailable(product, color, item) : true;
          const selected = size === item;
          return `<button type="button" class="option${selected ? " is-selected" : ""}${available ? "" : " is-disabled"}" data-size="${item}" aria-pressed="${selected}"${available ? "" : " disabled"}>${item}</button>`;
        })
        .join("");
    }

    function renderAvailability() {
      if (!color && !size) return setAvailability("Seleccioná un color y un talle.");
      if (color && !size) return setAvailability(`Color ${color} · elegí un talle.`);
      if (size && !color) return setAvailability(`Talle ${size} · elegí un color.`);
      const available = api.isVariantAvailable(product, color, size);
      return setAvailability(available ? "Disponible para consulta." : "Esa combinación no está disponible.");
    }

    function render() {
      if (!product) return;
      if (els.image) {
        els.image.src = product.image || "";
        els.image.alt = product.imageAlt || product.name;
      }
      if (els.category) els.category.textContent = api.categoryLabel(product.category);
      if (els.name) els.name.textContent = product.name;
      if (els.description) els.description.textContent = product.description || "";
      if (els.price) els.price.textContent = formatPrice(product.price) || "Consultar precio";
      if (els.old) {
        els.old.textContent = product.oldPrice ? formatPrice(product.oldPrice) : "";
        els.old.hidden = !product.oldPrice;
      }
      qty = 1;
      if (els.qty) els.qty.textContent = "1";
      color = "";
      size = "";
      showError("");
      renderColors();
      renderSizes();
      renderAvailability();
    }

    function open(targetProduct) {
      product = targetProduct;
      render();
      if (hasModal && !dialog.open) dialog.showModal();
      else if (!hasModal) {
        dialog.setAttribute("open", "");
        dialog.classList.add("is-open");
      }
      const closeButton = els.close || dialog.querySelector("button");
      if (closeButton) closeButton.focus();
    }

    function updateQty(delta) {
      qty = Math.max(1, Math.min(99, qty + delta));
      if (els.qty) els.qty.textContent = String(qty);
    }

    function add() {
      if (!color || !size) {
        showError("Seleccioná color y talle para continuar.");
        return;
      }
      if (!api.isVariantAvailable(product, color, size)) {
        showError("Esa combinación de color y talle no está disponible.");
        return;
      }
      if (onAdd) onAdd(product, color, size, qty);
      close();
    }

    if (els.colors) {
      els.colors.addEventListener("click", (event) => {
        const button = event.target.closest("[data-color]");
        if (!button) return;
        color = button.getAttribute("data-color");
        if (size && !api.isVariantAvailable(product, color, size)) size = "";
        renderColors();
        renderSizes();
        renderAvailability();
        showError("");
      });
    }
    if (els.sizes) {
      els.sizes.addEventListener("click", (event) => {
        const button = event.target.closest("[data-size]");
        if (!button || button.disabled) return;
        size = button.getAttribute("data-size");
        renderSizes();
        renderAvailability();
        showError("");
      });
    }
    if (els.minus) els.minus.addEventListener("click", () => updateQty(-1));
    if (els.plus) els.plus.addEventListener("click", () => updateQty(1));
    if (els.add) els.add.addEventListener("click", add);
    if (els.close) els.close.addEventListener("click", close);

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) close();
    });
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });

    return { open };
  }

  root.ModaDetail = { init };
})(typeof globalThis !== "undefined" ? globalThis : this);
