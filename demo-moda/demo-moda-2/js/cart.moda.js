/* ==========================================================================
   ALMATE · Demo Moda 2 (PIOLA) · cart.moda.js
   Estado y persistencia del carrito de consulta (sin pagos ni checkout).
   Dos prendas iguales con distinto talle o color son variantes diferentes.

   · core: operaciones puras (agregar, quitar, cantidad, subtotal, total).
   · store: guardado en localStorage con tolerancia a fallos.
   · mountCartDrawer: interfaz del drawer (solo navegador).
   ========================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ModaCart = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const STORAGE_KEY = "piola-moda-cart-v1";

  /* ---------- Núcleo puro ---------- */
  function itemKey(product, color, size) {
    return product.id + "|" + color + "|" + size;
  }

  function createItem(product, color, size, qty) {
    const colorObj = (product.colors || []).find((item) => item.name === color) || {};
    return {
      key: itemKey(product, color, size),
      productId: product.id,
      name: product.name,
      image: (product.images && product.images[color]) || product.image || "",
      imageAlt: product.imageAlt || product.name,
      tone: product.tone || "sun",
      color: color,
      colorValue: colorObj.value || "",
      size: size,
      price: Number(product.price || 0),
      qty: Math.max(1, Math.min(999, Number(qty) || 1)),
    };
  }

  function addItem(items, product, color, size, qty) {
    const key = itemKey(product, color, size);
    const existing = items.find((item) => item.key === key);
    if (existing) {
      existing.qty = Math.min(999, existing.qty + (Number(qty) || 1));
      return items.slice();
    }
    return items.concat([createItem(product, color, size, qty)]);
  }

  function setQty(items, key, qty) {
    const quantity = Math.max(1, Math.min(999, Number(qty) || 1));
    return items.map((item) => (item.key === key ? Object.assign({}, item, { qty: quantity }) : item));
  }

  function removeItem(items, key) {
    return items.filter((item) => item.key !== key);
  }

  function subtotal(items) {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function count(items) {
    return items.reduce((sum, item) => sum + item.qty, 0);
  }

  /* ---------- Persistencia ---------- */
  const store = {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return [];
      }
    },
    save(items) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        return true;
      } catch (error) {
        return false;
      }
    },
    clear() {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        /* noop */
      }
    },
    key: STORAGE_KEY,
  };

  const core = { itemKey, createItem, addItem, setQty, removeItem, subtotal, count };

  /* Escapado y validación para lo que vuelve de localStorage (dato no confiable). */
  const h = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeTone = (tone) => (["sky", "sun", "pink", "lime", "lilac", "paper"].includes(tone) ? tone : "sun");
  const safeColor = (value) => (/^#[0-9a-f]{3,6}$/i.test(String(value)) ? value : "#cccccc");

  /* ---------- Drawer (solo navegador) ---------- */
  function mountCartDrawer(context) {
    if (typeof document === "undefined") return null;
    const { cfg, waLink, formatPrice } = context;
    let items = store.load();

    const els = {
      drawer: document.getElementById("cart-drawer"),
      overlay: document.getElementById("cart-overlay"),
      open: document.getElementById("cart-open"),
      close: document.getElementById("cart-close"),
      items: document.getElementById("cart-items"),
      total: document.getElementById("cart-total"),
      count: document.getElementById("cart-count"),
      whatsapp: document.getElementById("cart-whatsapp"),
      clear: document.getElementById("cart-clear"),
      empty: document.getElementById("cart-empty"),
    };

    function refresh() {
      store.save(items);
      const totalUnits = core.count(items);
      if (els.count) {
        els.count.textContent = String(totalUnits);
        els.count.hidden = totalUnits === 0;
      }
      if (!els.items) return;

      if (!items.length) {
        els.items.innerHTML = "";
        if (els.empty) els.empty.hidden = false;
        if (els.total) els.total.textContent = "";
        if (els.whatsapp) {
          els.whatsapp.disabled = true;
          els.whatsapp.removeAttribute("href");
        }
        if (els.clear) els.clear.disabled = true;
        return;
      }

      if (els.empty) els.empty.hidden = true;
      els.items.innerHTML = items
        .map(
          (item) => `
        <article class="cart-item" data-key="${h(item.key)}">
          <span class="cart-item__thumb" style="--tone: var(--${safeTone(item.tone)})"><img src="${h(item.image)}" alt="${h(item.imageAlt)}" loading="lazy"></span>
          <div class="cart-item__body">
            <h4 class="cart-item__name">${h(item.name)}</h4>
            <p class="cart-item__variant"><span class="swatch" style="background:${safeColor(item.colorValue)}"></span>${h(item.color)} · Talle ${h(item.size)}</p>
            <p class="cart-item__price">${formatPrice(item.price)}</p>
          </div>
          <div class="cart-item__qty">
            <button type="button" data-qty="-1" aria-label="Restar una unidad">−</button>
            <span>${h(item.qty)}</span>
            <button type="button" data-qty="1" aria-label="Sumar una unidad">+</button>
          </div>
          <button class="cart-item__remove" type="button" data-remove aria-label="Quitar ${h(item.name)}">×</button>
        </article>`
        )
        .join("");

      if (els.total) els.total.textContent = formatPrice(core.subtotal(items));
      if (els.clear) els.clear.disabled = false;

      if (els.whatsapp && cfg.contact.whatsapp) {
        const message = window.ModaWhatsApp.buildMessage(cfg.brand.name, items);
        els.whatsapp.setAttribute("href", waLink(cfg.contact.whatsapp, message));
        els.whatsapp.disabled = false;
      } else if (els.whatsapp) {
        els.whatsapp.disabled = true;
        els.whatsapp.removeAttribute("href");
        els.whatsapp.textContent = "Configurá tu WhatsApp";
      }
    }

    function setOpen(open) {
      const drawer = els.drawer;
      const overlay = els.overlay;
      if (!drawer || !overlay) return;
      if (open) {
        drawer.hidden = false;
        overlay.hidden = false;
        requestAnimationFrame(() => {
          drawer.classList.add("is-open");
          overlay.classList.add("is-open");
          document.body.classList.add("no-scroll");
        });
        const closeButton = els.close;
        if (closeButton) closeButton.focus();
      } else {
        drawer.classList.remove("is-open");
        overlay.classList.remove("is-open");
        document.body.classList.remove("no-scroll");
        window.setTimeout(() => {
          drawer.hidden = true;
          overlay.hidden = true;
        }, 300);
      }
    }

    if (els.open) els.open.addEventListener("click", () => setOpen(true));
    if (els.close) els.close.addEventListener("click", () => setOpen(false));
    if (els.overlay) els.overlay.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && els.drawer && !els.drawer.hidden && els.drawer.classList.contains("is-open")) setOpen(false);
    });

    if (els.items) {
      els.items.addEventListener("click", (event) => {
        const target = event.target.closest("[data-qty], [data-remove]");
        if (!target) return;
        const row = target.closest(".cart-item");
        const key = row && row.getAttribute("data-key");
        if (!key) return;
        if (target.hasAttribute("data-remove")) {
          items = core.removeItem(items, key);
        } else {
          const delta = Number(target.getAttribute("data-qty"));
          const current = items.find((item) => item.key === key);
          if (current) items = core.setQty(items, key, current.qty + delta);
        }
        refresh();
      });
    }

    if (els.clear) {
      els.clear.addEventListener("click", () => {
        items = [];
        refresh();
      });
    }

    refresh();
    return {
      get items() {
        return items;
      },
      add(product, color, size, qty) {
        items = core.addItem(items, product, color, size, qty);
        refresh();
      },
      refresh,
      open() {
        setOpen(true);
      },
    };
  }

  return { core, store, mountCartDrawer, STORAGE_KEY };
});
