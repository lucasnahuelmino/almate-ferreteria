/* ==========================================================================
   ALMATE Assistant Core - widget conversacional sin IA externa
   ========================================================================== */
(function () {
  "use strict";

  const cfg0 = window.ALMATE_ASSISTANT_CONFIG || {};
  const state = { open: false, messages: [] };

  function $(sel, root) { return (root || document).querySelector(sel); }

  function escapeHtml(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  function getCtx() { return (window.__moda) || null; }

  function formatPrice(v) {
    const n = Number(v);
    if (!n) return "";
    return "$" + Math.round(n).toLocaleString("es-AR");
  }

  function addMsg(role, html) {
    state.messages.push({ role, html });
    renderMessages();
  }

  function renderMessages() {
    const box = $("#aa-messages");
    if (!box) return;
    box.innerHTML = state.messages.map((m) => "<div class=\"almate-assistant__msg almate-assistant__msg--" + m.role + "\">" + m.html + "</div>").join("");
    box.scrollTop = box.scrollHeight;
  }

  function renderWidget() {
    const root = document.createElement("div");
    root.className = "almate-assistant";
    root.innerHTML = [
      "<button class=\"almate-assistant__toggle\" id=\"aa-toggle\" type=\"button\" aria-label=\"Abrir asistente\">💬</button>",
      "<div class=\"almate-assistant__panel\" id=\"aa-panel\" hidden>",
      "  <div class=\"almate-assistant__head\"><span>Asistente ALMATE</span><button id=\"aa-close\" type=\"button\" aria-label=\"Cerrar\">×</button></div>",
      "  <div class=\"almate-assistant__messages\" id=\"aa-messages\"></div>",
      "  <div class=\"almate-assistant__quick\" id=\"aa-quick\"></div>",
      "  <form class=\"almate-assistant__input\" id=\"aa-form\">",
      "    <input id=\"aa-input\" type=\"text\" placeholder=\"Escribí tu consulta…\" autocomplete=\"off\">",
      "    <button type=\"submit\">Enviar</button>",
      "  </form>",
      "</div>"
    ].join("");
    document.body.appendChild(root);

    $("#aa-toggle").addEventListener("click", function () { toggle(true); });
    $("#aa-close").addEventListener("click", function () { toggle(false); });
    $("#aa-form").addEventListener("submit", function (e) {
      e.preventDefault();
      const input = $("#aa-input");
      const text = input.value.trim();
      if (!text) return;
      input.value = "";
      handleUser(text);
    });
    renderQuick();
  }

  function toggle(open) {
    state.open = open;
    const panel = $("#aa-panel");
    if (panel) panel.hidden = !open;
    if (open && state.messages.length === 0) {
      addMsg("bot", escapeHtml(cfg0.welcome || "¡Hola! ¿En qué te ayudo?"));
    }
  }

  function renderQuick() {
    const box = $("#aa-quick");
    if (!box) return;
    const replies = cfg0.quickReplies || [];
    box.innerHTML = replies.map((r) => "<button type=\"button\" data-quick=\"" + escapeHtml(r) + "\">" + escapeHtml(r) + "</button>").join("");
    box.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-quick]");
      if (!btn) return;
      handleUser(btn.getAttribute("data-quick"));
    });
  }

  function handleUser(text) {
    addMsg("user", escapeHtml(text));
    const lower = text.toLowerCase();
    const ctx = getCtx();
    const cfg = ctx ? ctx.cfg : null;
    const products = ctx ? ctx.productApi.products : [];

    if (/categor|rubro/i.test(lower)) {
      const cats = ctx ? Object.keys(ctx.productApi.categories) : [];
      const links = cats.map((c) => "<button type=\"button\" data-cat=\"" + escapeHtml(c) + "\" style=\"margin:2px\">" + escapeHtml(ctx.productApi.categoryLabel(c)) + "</button>").join(" ");
      addMsg("bot", "Estas son las categorías disponibles:<br>" + links + "<br><br>Tocá una para filtrar el catálogo.");
      bindCatButtons();
      return;
    }
    if (/compr|pedido|lista/i.test(lower)) {
      addMsg("bot", "Para comprar: elegí productos en el catálogo, sumalos a tu lista de consulta, ajustá cantidades y enviá la lista por WhatsApp. Te confirmamos disponibilidad y precio final.");
      return;
    }
    if (/env[ií]o|entrega/i.test(lower)) {
      addMsg("bot", "Consultanos por envíos y zonas de entrega. Coordinamos según tu ubicación. Escribinos por WhatsApp para más detalles.");
      whatsappCta();
      return;
    }
    if (/pago|pagar/i.test(lower)) {
      addMsg("bot", "Consultá los medios de pago disponibles al confirmar tu pedido por WhatsApp.");
      return;
    }
    if (/horario|contacto|direcci[oó]n|ubicaci[oó]n|tel[eé]fono|whatsapp/i.test(lower)) {
      const contact = cfg ? cfg.contact : {};
      const parts = [];
      if (contact.address) parts.push("📍 " + contact.address);
      if (contact.hours) parts.push("🕐 " + contact.hours);
      if (contact.whatsapp) parts.push("📱 WhatsApp: +" + contact.whatsapp);
      if (contact.email) parts.push("✉ " + contact.email);
      if (contact.instagram) parts.push("📸 " + contact.instagram);
      addMsg("bot", (parts.length ? parts.join("<br>") : "Consultá nuestros datos de contacto en la sección Contacto.") + "<br><br>¿Querés que te deriven a WhatsApp?");
      if (contact.whatsapp) whatsappCta();
      return;
    }
    if (/whatsapp|hablar/i.test(lower)) {
      whatsappCta(true);
      return;
    }

    const terms = lower.split(/\s+/).filter(Boolean);
    const matches = products.filter(function (p) {
      const hay = (p.name + " " + (p.sku || "") + " " + (ctx ? ctx.productApi.categoryLabel(p.category) : p.category)).toLowerCase();
      return terms.some(function (t) { return hay.includes(t); });
    }).slice(0, 5);

    if (matches.length) {
      const cards = matches.map(function (p) {
        return "<a class=\"almate-assistant__product\" href=\"#catalogo\" data-open=\"" + escapeHtml(p.id) + "\">" +
          "<img src=\"" + escapeHtml(p.image) + "\" alt=\"" + escapeHtml(p.name) + "\">" +
          "<div><strong>" + escapeHtml(p.name) + "</strong><br><span>" + (formatPrice(p.price) || "Consultar precio") + " · " + escapeHtml(ctx ? ctx.productApi.categoryLabel(p.category) : p.category) + "</span></div>" +
          "</a>";
      }).join("");
      addMsg("bot", "Encontré estos productos:<div class=\"almate-assistant__products\">" + cards + "</div>");
      bindProductButtons();
      return;
    }

    const faq = cfg0.faq || [];
    const faqMatch = faq.find(function (f) { return terms.some(function (t) { return t.length > 3 && f.q.toLowerCase().includes(t); }); });
    if (faqMatch) {
      addMsg("bot", escapeHtml(faqMatch.a));
      return;
    }

    addMsg("bot", "No encontré resultados. Probá con otro término o consultanos por WhatsApp.");
    whatsappCta();
  }

  function bindCatButtons() {
    const box = $("#aa-messages");
    if (!box) return;
    box.querySelectorAll("[data-cat]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const cat = btn.getAttribute("data-cat");
        const ctx = getCtx();
        if (ctx && ctx.catalog) ctx.catalog.applyFilter({ category: cat });
        const section = document.getElementById("catalogo");
        if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
        toggle(false);
      });
    });
  }

  function bindProductButtons() {
    const box = $("#aa-messages");
    if (!box) return;
    box.querySelectorAll("[data-open]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const id = btn.getAttribute("data-open");
        const ctx = getCtx();
        const product = ctx ? ctx.productApi.products.find(function (p) { return p.id === id; }) : null;
        if (product && ctx && ctx.detail) ctx.detail.open(product);
        toggle(false);
      });
    });
  }

  function whatsappCta() {
    const ctx = getCtx();
    const num = (ctx && ctx.cfg && ctx.cfg.contact) ? ctx.cfg.contact.whatsapp : (cfg0.whatsapp || "");
    if (!num) return;
    const link = "https://wa.me/" + num;
    addMsg("bot", "<a href=\"" + link + "\" target=\"_blank\" rel=\"noopener noreferrer\">Abrir WhatsApp</a>");
  }

  function init() {
    if (!document.body) return;
    renderWidget();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
