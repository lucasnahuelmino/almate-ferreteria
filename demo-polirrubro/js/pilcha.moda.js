/* ==========================================================================
   ALMATE · Demo Moda 2 (PIOLA) · pilcha.moda.js
   "Armá tu pilcha": armador de looks. Combina una prenda por "slot" (arriba,
   abajo, extra…) tomadas del catálogo según las categorías de config.moda.js.
   Al confirmar, abre la ficha de cada prenda en orden para elegir color y
   talle: no se agrega nada al pedido sin variante válida. Solo navegador.
   ========================================================================== */
(function (root) {
  "use strict";

  const esc = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function init(context) {
    const { cfg, api, formatPrice, startQueue } = context;
    const host = document.getElementById("pilcha-root");
    if (!host) return null;

    /* Solo prendas con alguna variante disponible. */
    const hasStock = (product) => product.colors.some((color) => api.availableSizes(product, color.name).length > 0);
    const slots = cfg.pilcha.slots
      .map((slot) => ({
        label: slot.label,
        items: api.products.filter((product) => slot.categories.includes(product.category) && hasStock(product)),
        index: 0,
      }))
      .filter((slot) => slot.items.length);

    if (!slots.length) {
      host.hidden = true;
      return null;
    }

    const current = (slot) => slot.items[slot.index];
    const firstColor = (product) => (product.colors.find((color) => api.availableSizes(product, color.name).length) || product.colors[0]).name;

    function total() {
      return slots.reduce((sum, slot) => sum + Number(current(slot).price || 0), 0);
    }

    function render(announce) {
      const pieces = slots.map((slot, i) => {
        const p = current(slot);
        return `<img class="pilcha__piece pilcha__piece--${i}" src="${esc(api.imageFor(p, firstColor(p)))}" alt="" width="400" height="500">`;
      }).join("");
      const rows = slots.map((slot, i) => {
        const p = current(slot);
        return `<li class="pilcha__row">
          <span class="pilcha__slot">${esc(slot.label)}</span>
          <div class="pilcha__pick">
            <button type="button" class="pilcha__arrow" data-slot="${i}" data-dir="-1" aria-label="${esc(slot.label)}: prenda anterior">‹</button>
            <span class="pilcha__item"><b>${esc(p.name)}</b><span>${formatPrice(p.price) || "Consultar precio"}</span></span>
            <button type="button" class="pilcha__arrow" data-slot="${i}" data-dir="1" aria-label="${esc(slot.label)}: prenda siguiente">›</button>
          </div>
          <span class="pilcha__count" aria-hidden="true">${slot.index + 1}/${slot.items.length}</span>
        </li>`;
      }).join("");
      const summary = slots.map((slot) => `${slot.label}: ${current(slot).name}`).join(", ");
      host.innerHTML = `
        <div class="pilcha__stage" role="img" aria-label="Pilcha armada. ${esc(summary)}">${pieces}</div>
        <div class="pilcha__panel">
          <ul class="pilcha__rows">${rows}</ul>
          <p class="pilcha__total">Esta pilcha sale <strong>${formatPrice(total()) || "—"}</strong> <small>(estimado, sin talles ni envío)</small></p>
          <div class="pilcha__actions">
            <button type="button" class="btn btn--primary" data-pilcha-go>${esc(cfg.pilcha.ctaLabel)} <span aria-hidden="true">→</span></button>
            <button type="button" class="btn btn--ghost" data-pilcha-random><span aria-hidden="true">✦</span> ${esc(cfg.pilcha.randomLabel)}</button>
          </div>
          <p class="visually-hidden" id="pilcha-live" aria-live="polite">${announce ? esc(summary) : ""}</p>
        </div>`;
    }

    function move(slotIndex, dir) {
      const slot = slots[slotIndex];
      if (!slot) return;
      slot.index = (slot.index + dir + slot.items.length) % slot.items.length;
      render(true);
      const again = host.querySelector(`[data-slot="${slotIndex}"][data-dir="${dir}"]`);
      if (again) again.focus();
    }

    function shuffle() {
      slots.forEach((slot) => { slot.index = Math.floor(Math.random() * slot.items.length); });
      render(true);
      const button = host.querySelector("[data-pilcha-random]");
      if (button) button.focus();
    }

    host.addEventListener("click", (event) => {
      const arrow = event.target.closest("[data-slot]");
      if (arrow) return move(Number(arrow.getAttribute("data-slot")), Number(arrow.getAttribute("data-dir")));
      if (event.target.closest("[data-pilcha-random]")) return shuffle();
      if (event.target.closest("[data-pilcha-go]")) startQueue(slots.map(current));
    });

    render(false);
    return { render, shuffle, getSelection: () => slots.map(current) };
  }

  root.ModaPilcha = { init };
})(typeof globalThis !== "undefined" ? globalThis : this);
