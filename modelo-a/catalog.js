/* ==========================================================================
   FREN FERRETERÍAS · MODELO A — catalog.js
   Catálogo de productos + lista de consulta por WhatsApp.

   Requiere que script.js se cargue antes (define SITE_CONFIG y
   isValidLogoPath). Este archivo es "motor", no "datos": todo el
   contenido configurable vive en SITE_CONFIG.catalog (script.js).

   Qué hace este archivo (5 bloques):

     1. Normalización: valida los artículos de la config sin romper nada
     2. Render: grilla de productos, búsqueda y filtro por rubro
     3. Lista de consulta: agregar, cantidades, quitar, vaciar
     4. Mensaje de WhatsApp: arma el link con lo que está en la lista
     5. Inicialización

   Reglas de contenido (no se inventan datos comerciales):
     · catálogo vacío por defecto → estado vacío visible;
     · sin precio informado → "Consultar precio", nunca un número;
     · disponibilidad solo si el comercio la informó.
   ========================================================================== */

/* ==========================================================================
   1. NORMALIZACIÓN
   ========================================================================== */
(function () {
  "use strict";

  const STORAGE_KEY = "alma-consulta-a-v1";
  const MAX_QTY = 999;

  // Ruta segura: reutiliza el validador de script.js si existe.
  function isSafePath(value) {
    if (typeof isValidLogoPath === "function") return isValidLogoPath(value);
    if (typeof value !== "string") return false;
    const path = value.trim();
    if (!path || path.includes("\\") || path.split("/").indexOf("..") !== -1) return false;
    if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return /^https?:/i.test(path);
    return true;
  }

  function cleanText(value, max) {
    if (typeof value !== "string") return "";
    return value.trim().slice(0, max || 200);
  }

  function slug(value) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
  }

  function normalizePrice(value) {
    if (typeof value !== "number" || !isFinite(value) || value < 0) return null;
    return Math.round(value * 100) / 100;
  }

  // Devuelve { items, issues }. Un artículo sin nombre se descarta con
  // aviso en consola; el resto de los campos inválidos se ignoran.
  function normalizeItems(raw) {
    const issues = [];
    const items = [];
    if (!Array.isArray(raw)) {
      if (raw !== undefined && raw !== null) {
        issues.push("SITE_CONFIG.catalog.items debe ser una lista de artículos.");
      }
      return { items, issues };
    }

    raw.forEach((entry, index) => {
      const path = `catalog.items[${index}]`;
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        issues.push(`${path}: se descarta, no es un objeto.`);
        return;
      }
      const name = cleanText(entry.name, 120);
      if (!name) {
        issues.push(`${path}: se descarta, falta el nombre del artículo.`);
        return;
      }

      let id = slug(cleanText(entry.sku, 40)) || slug(name) || `item-${index + 1}`;
      if (items.some((item) => item.id === id)) id = `${id}-${index + 1}`;

      const image = isSafePath(entry.image) ? cleanText(entry.image, 300) : "";
      if (entry.image && !image) issues.push(`${path}: imagen no válida, se omite.`);

      items.push({
        id,
        name,
        category: cleanText(entry.category, 60),
        sku: cleanText(entry.sku, 40),
        brand: cleanText(entry.brand, 60),
        description: cleanText(entry.description, 300),
        image,
        imageAlt: cleanText(entry.imageAlt, 120) || name,
        price: normalizePrice(entry.price),
        availability: cleanText(entry.availability, 60),
      });
    });

    return { items, issues };
  }


  /* ==========================================================================
     2. RENDER: grilla, búsqueda y rubros
     ========================================================================== */
  const state = {
    items: [],
    query: "",
    category: "",
    list: {}, // id → cantidad
  };

  const dom = {};

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function fold(value) {
    return String(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function formatPrice(value) {
    try {
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      }).format(value);
    } catch (error) {
      return `$ ${value}`;
    }
  }

  function priceLabel(item) {
    // Sin precio informado → "Consultar precio". Nunca un número inventado.
    return item.price === null ? "Consultar precio" : formatPrice(item.price);
  }

  function visibleItems() {
    const query = fold(state.query.trim());
    return state.items.filter((item) => {
      if (state.category && item.category !== state.category) return false;
      if (!query) return true;
      const haystack = fold([item.name, item.brand, item.sku, item.description].join(" "));
      return haystack.indexOf(query) !== -1;
    });
  }

  function renderCategories() {
    const categories = [];
    state.items.forEach((item) => {
      if (item.category && categories.indexOf(item.category) === -1) categories.push(item.category);
    });
    if (!categories.length) {
      dom.categories.innerHTML = "";
      return;
    }

    const buttons = [{ value: "", label: "Todos" }].concat(
      categories.map((value) => ({ value, label: value }))
    );
    dom.categories.innerHTML = buttons
      .map((button) => {
        const active = state.category === button.value;
        return `<button type="button" class="catalog__category${active ? " is-active" : ""}" data-category="${escapeHtml(button.value)}" aria-pressed="${active}">${escapeHtml(button.label)}</button>`;
      })
      .join("");
  }

  function renderGrid() {
    const items = visibleItems();

    if (!state.items.length) {
      dom.grid.innerHTML = "";
      dom.empty.hidden = false;
      dom.empty.textContent =
        "Todavía no hay productos publicados en el catálogo. Consultanos por WhatsApp para conocer disponibilidad.";
      announceResults(0, true);
      return;
    }
    if (!items.length) {
      dom.grid.innerHTML = "";
      dom.empty.hidden = false;
      dom.empty.textContent = "No encontramos productos para esa búsqueda.";
      announceResults(0, true);
      return;
    }

    dom.empty.hidden = true;
    dom.empty.textContent = "";
    dom.grid.innerHTML = items
      .map((item) => {
        const meta = [item.brand, item.sku ? `Cód. ${item.sku}` : ""]
          .filter(Boolean)
          .map(escapeHtml)
          .join(" · ");
        const image = item.image
          ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.imageAlt)}" width="400" height="300" loading="lazy" decoding="async">`
          : "";
        const availability = item.availability
          ? `<p class="product-card__availability">${escapeHtml(item.availability)}</p>`
          : "";
        const description = item.description
          ? `<p class="product-card__description">${escapeHtml(item.description)}</p>`
          : "";
        return `
        <article class="product-card" data-item="${escapeHtml(item.id)}">
          ${image}
          <h3 class="product-card__name">${escapeHtml(item.name)}</h3>
          ${meta ? `<p class="product-card__meta">${meta}</p>` : ""}
          <p class="product-card__price${item.price === null ? " is-consult" : ""}">${escapeHtml(priceLabel(item))}</p>
          ${availability}
          ${description}
          <button type="button" class="btn btn--primary product-card__add" data-add="${escapeHtml(item.id)}">Agregar a la consulta</button>
        </article>`;
      })
      .join("");
    announceResults(items.length, false);
  }

  // Aviso para lectores de pantalla: cuántos resultados hay. Con 0
  // resultados quien habla es #catalog-empty (role=status), así que
  // este queda en silencio para no duplicar el mensaje.
  function announceResults(count, isEmpty) {
    if (!dom.status) return;
    if (isEmpty || count === 0) {
      dom.status.textContent = "";
      return;
    }
    dom.status.textContent =
      count === 1 ? "1 producto encontrado." : `${count} productos encontrados.`;
  }

  function renderCatalog() {
    if (!dom.grid) return;
    if (dom.controls) dom.controls.hidden = state.items.length === 0;
    renderCategories();
    renderGrid();
  }

  // (Re)carga los artículos desde una lista cruda o desde la config.
  // Lo usan la inicialización y las pruebas de navegador.
  function loadItems(raw) {
    const source = raw === undefined
      ? (SITE_CONFIG.catalog && SITE_CONFIG.catalog.items)
      : raw;
    const normalized = normalizeItems(source);
    state.items = normalized.items;
    state.category = "";
    normalized.issues.forEach((issue) => console.warn(`[CATÁLOGO] ${issue}`));
    return normalized.items;
  }


  /* ==========================================================================
     3. LISTA DE CONSULTA
     ========================================================================== */
  function loadList() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
      Object.keys(stored).forEach((id) => {
        const qty = Number(stored[id]);
        if (state.items.some((item) => item.id === id) && qty >= 1 && qty <= MAX_QTY) {
          state.list[id] = Math.round(qty);
        }
      });
    } catch (error) {
      state.list = {};
    }
  }

  function saveList() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.list));
    } catch (error) {
      /* sin almacenamiento disponible: la lista sigue funcionando en memoria */
    }
  }

  function findItem(id) {
    return state.items.find((item) => item.id === id) || null;
  }

  function renderList() {
    if (!dom.list) return;
    const ids = Object.keys(state.list).filter((id) => findItem(id));

    dom.count.textContent =
      ids.length === 1 ? "1 artículo" : `${ids.length} artículos`;
    dom.listEmpty.hidden = ids.length > 0;
    dom.send.hidden = ids.length === 0 || !whatsappNumber();
    dom.clear.hidden = ids.length === 0;

    dom.list.innerHTML = ids
      .map((id) => {
        const item = findItem(id);
        const qty = state.list[id];
        return `
        <li class="consult__item" data-consult="${escapeHtml(id)}">
          <span class="consult__item-info">
            <span class="consult__item-name">${escapeHtml(item.name)}</span>
            ${item.sku ? `<span class="consult__item-sku">Cód. ${escapeHtml(item.sku)}</span>` : ""}
          </span>
          <span class="consult__item-price${item.price === null ? " is-consult" : ""}">${escapeHtml(priceLabel(item))}</span>
          <label class="consult__item-qty">
            Cantidad
            <input type="number" min="1" max="${MAX_QTY}" step="1" value="${qty}" data-qty="${escapeHtml(id)}" aria-label="Cantidad de ${escapeHtml(item.name)}">
          </label>
          <button type="button" class="consult__remove" data-remove="${escapeHtml(id)}" aria-label="Quitar ${escapeHtml(item.name)} de la lista">Quitar</button>
        </li>`;
      })
      .join("");

    dom.send.setAttribute("href", buildWhatsappLink());
  }

  // Resumen para los avisos en vivo: artículos distintos + unidades
  // totales. El #consult-count no cambia al repetir un artículo, así
  // que acá es donde se anuncia el alta repetida.
  function listSummary() {
    const ids = Object.keys(state.list).filter((id) => findItem(id));
    const units = ids.reduce((sum, id) => sum + state.list[id], 0);
    return `${ids.length} ${ids.length === 1 ? "artículo" : "artículos"} · ${units} ${units === 1 ? "unidad" : "unidades"}`;
  }

  function announceList(message) {
    if (dom.consultStatus) dom.consultStatus.textContent = message;
  }

  function addToList(id) {
    const item = findItem(id);
    if (!item) return;
    state.list[id] = Math.min((state.list[id] || 0) + 1, MAX_QTY);
    saveList();
    renderList();
    announceList(`${item.name} agregado. ${listSummary()}.`);
  }

  function setQuantity(id, qty) {
    const item = findItem(id);
    if (!item) return;
    const value = Math.round(Number(qty));
    // Campo vacío o inválido: NO borra el artículo (la única baja
    // deliberada es el botón "Quitar"); solo se restaura el valor.
    if (!isFinite(value) || value < 1) {
      renderList();
      announceList(`${item.name}: cantidad no válida, se mantiene ${state.list[id]}.`);
      return;
    }
    state.list[id] = Math.min(value, MAX_QTY);
    saveList();
    renderList();
    announceList(`${item.name}: cantidad ${state.list[id]}. ${listSummary()}.`);
  }

  function removeFromList(id) {
    delete state.list[id];
    saveList();
    renderList();
  }

  function clearList() {
    state.list = {};
    saveList();
    renderList();
  }


  /* ==========================================================================
     4. MENSAJE DE WHATSAPP
     ========================================================================== */
  function whatsappNumber() {
    const digits = String(SITE_CONFIG.whatsapp || "").replace(/\D/g, "");
    return digits.length >= 8 ? digits : "";
  }

  function buildConsultMessage() {
    const lines = [
      `Hola, quisiera consultar por estos artículos de ${SITE_CONFIG.businessName}:`,
      "",
    ];
    Object.keys(state.list)
      .filter((id) => findItem(id))
      .forEach((id) => {
        const item = findItem(id);
        lines.push(`- ${item.name} (${state.list[id]} u.)`);
        if (item.sku) lines.push(`  Código: ${item.sku}`);
        // El precio solo se incluye si está informado en la config.
        if (item.price !== null) lines.push(`  Precio: ${formatPrice(item.price)}`);
      });
    lines.push("", "Gracias.");
    return lines.join("\n");
  }

  function buildWhatsappLink() {
    const number = whatsappNumber();
    if (!number) return "#";
    return `https://wa.me/${number}?text=${encodeURIComponent(buildConsultMessage())}`;
  }


  /* ==========================================================================
     5. INICIALIZACIÓN
     ========================================================================== */
  // Confirmación visual en el botón: sin esto, en mobile (donde la
  // lista queda fuera de pantalla) no hay forma de saber que el
  // artículo entró.
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

  function bindEvents() {
    dom.search.addEventListener("input", (event) => {
      state.query = event.target.value;
      renderGrid();
    });

    dom.categories.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      state.category = button.getAttribute("data-category") || "";
      renderCatalog();
      // El render reconstruye las píldoras: si el foco estaba en una,
      // devolverlo a la activa (si no, cae al body).
      const active = dom.categories.querySelector(
        `[data-category="${state.category}"]`
      );
      if (active) active.focus();
    });

    dom.grid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-add]");
      if (!button) return;
      addToList(button.getAttribute("data-add"));
      flashAdded(button);
    });

    dom.list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove]");
      if (!button) return;
      const id = button.getAttribute("data-remove");
      const item = findItem(id);
      removeFromList(id);
      if (item) announceList(`${item.name} quitado. ${listSummary()}.`);
      // El botón desapareció con el artículo: el foco pasa al siguiente
      // "Quitar", o a "Vaciar lista", o al estado vacío.
      const next = dom.list.querySelector("[data-remove]");
      if (next) {
        next.focus();
      } else if (dom.clear && !dom.clear.hidden) {
        dom.clear.focus();
      } else if (dom.listEmpty) {
        dom.listEmpty.setAttribute("tabindex", "-1");
        dom.listEmpty.focus();
      }
    });

    dom.list.addEventListener("change", (event) => {
      const input = event.target.closest("[data-qty]");
      if (!input) return;
      const id = input.getAttribute("data-qty");
      setQuantity(id, input.value);
      // El render rehizo el input: devolver el foco al mismo campo.
      const restored = dom.list.querySelector(`[data-qty="${id}"]`);
      if (restored) restored.focus();
    });

    dom.clear.addEventListener("click", () => {
      clearList();
      announceList("Lista vaciada.");
      // El botón desaparece: el foco queda en la sección de la lista.
      const section = document.getElementById("consulta");
      if (section) section.focus({ preventScroll: true });
    });
  }

  function initCatalog() {
    dom.grid = document.getElementById("catalog-grid");
    dom.empty = document.getElementById("catalog-empty");
    dom.controls = document.getElementById("catalog-controls");
    dom.search = document.getElementById("catalog-search");
    dom.categories = document.getElementById("catalog-categories");
    dom.list = document.getElementById("consult-list");
    dom.listEmpty = document.getElementById("consult-empty");
    dom.count = document.getElementById("consult-count");
    dom.send = document.getElementById("consult-whatsapp");
    dom.clear = document.getElementById("consult-clear");
    dom.status = document.getElementById("catalog-status");
    dom.consultStatus = document.getElementById("consult-status");

    if (!dom.grid || !dom.search || !dom.list) return;

    if (!whatsappNumber()) {
      console.warn("[CATÁLOGO] SITE_CONFIG.whatsapp no es un número válido: se oculta el botón de envío.");
    }

    bindEvents();
    reload();
  }

  // Recarga artículos + lista desde la config (o una lista indicada) y
  // el almacenamiento. Es lo que ocurre al iniciar la página; las
  // pruebas lo reutilizan para simular una sesión nueva con el mismo
  // navegador y la misma configuración.
  function reload(raw) {
    loadItems(raw);
    state.list = {};
    loadList();
    renderCatalog();
    renderList();
  }

  document.addEventListener("DOMContentLoaded", initCatalog);

  // Exposición mínima para las pruebas de navegador (modelo-a/tests).
  window.ALMATECatalog = {
    load: loadItems,
    render: renderCatalog,
    reload,
    items: () => state.items.slice(),
    list: () => Object.assign({}, state.list),
    message: buildConsultMessage,
    whatsappLink: buildWhatsappLink,
  };
})();
