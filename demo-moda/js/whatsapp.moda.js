/* ==========================================================================
   ALMATE · Demo Moda · whatsapp.moda.js
   Genera el mensaje de consulta y el enlace wa.me. Puro y sin DOM: lo usa el
   carrito y lo pueden probar los tests.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ModaWhatsApp = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function formatPrice(value) {
    if (value == null || value === "" || Number.isNaN(Number(value))) return "";
    const number = Math.round(Number(value));
    if (!number) return "";
    return "$" + number.toLocaleString("es-AR");
  }

  /* items: [{ name, color, size, qty, price }] */
  function buildMessage(brandName, items) {
    const lines = [];
    lines.push("Hola, quisiera consultar por estas prendas:");
    lines.push("");
    items.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.name}`);
      lines.push(`   Color: ${item.color}`);
      lines.push(`   Talle: ${item.size}`);
      lines.push(`   Cantidad: ${item.qty}`);
      lines.push(`   Precio: ${formatPrice(item.price)}`);
      lines.push("");
    });
    const total = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
    lines.push(`TOTAL ESTIMADO: ${formatPrice(total)}`);
    lines.push("");
    lines.push("Quisiera consultar disponibilidad.");
    if (brandName) lines.push(`— ${brandName}`);
    return lines.join("\n");
  }

  function waLink(number, message) {
    if (!number) return "";
    return "https://wa.me/" + number + (message ? "?text=" + encodeURIComponent(message) : "");
  }

  return { buildMessage, waLink, formatPrice };
});
