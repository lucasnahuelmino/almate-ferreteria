"use strict";
/* Pruebas del núcleo de la Demo Moda (sin DOM, sin dependencias).
   Desde la raíz: node demo-moda/tests/core.test.js */
const assert = require("assert");
const path = require("path");

const core = require(path.join(__dirname, "..", "js", "config-core.moda.js"));
const products = require(path.join(__dirname, "..", "js", "products.moda.js"));
const cart = require(path.join(__dirname, "..", "js", "cart.moda.js"));
const wa = require(path.join(__dirname, "..", "js", "whatsapp.moda.js"));

let passed = 0;
const test = (name, fn) => {
  try {
    fn();
    passed += 1;
    console.log("  \u2714", name);
  } catch (error) {
    console.error("  \u2716", name, "\n   ", error.message);
    process.exitCode = 1;
  }
};

/* ---------- Configuración ---------- */
test("normaliza una configuración válida sin errores", () => {
  const result = core.normalize({ brand: { name: "Tienda", tagline: "Prueba" }, seo: { url: "https://tienda.example/" } });
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.cfg.brand.name, "Tienda");
  assert.strictEqual(result.cfg.seo.url, "https://tienda.example/");
});

test("falta de configuración devuelve ok:false sin lanzar", () => {
  const result = core.normalize(null);
  assert.strictEqual(result.ok, false);
});

test("claves y secciones desconocidas se reportan y descartan", () => {
  const result = core.normalize({ brand: { name: "X" }, foo: 1, sections: ["hero", "inventada", "hero"] });
  assert.ok(result.issues.some((issue) => issue.path === "foo"));
  assert.deepStrictEqual(result.cfg.sections, ["hero"]);
});

test("número de WhatsApp se normaliza a dígitos y valida longitud", () => {
  const good = core.normalize({ brand: { name: "X" }, contact: { whatsapp: "+54 9 11 1234-5678" } });
  assert.strictEqual(good.cfg.contact.whatsapp, "5491112345678");
  const bad = core.normalize({ brand: { name: "X" }, contact: { whatsapp: "123" } });
  assert.strictEqual(bad.cfg.contact.whatsapp, "");
});

test("colores y rutas inseguras se descartan", () => {
  const result = core.normalize({
    brand: { name: "X" },
    theme: { charcoal: "no-es-color" },
    hero: { image: "javascript:alert(1)" },
  });
  assert.strictEqual(result.cfg.theme.charcoal, core.normalize({}).cfg.theme.charcoal);
  assert.strictEqual(result.cfg.hero.image, "");
});

test("formato de precio argentino", () => {
  assert.strictEqual(core.formatPrice(45900), "$45.900");
  assert.strictEqual(core.formatPrice(0), "");
  assert.strictEqual(core.formatPrice(null), "");
});

/* ---------- Variantes ---------- */
test("disponibilidad de variantes respeta colores, talles y excepciones", () => {
  const product = products.products.find((item) => item.id === "camisa-oversize");
  assert.strictEqual(products.isVariantAvailable(product, "Negro", "M"), true);
  assert.strictEqual(products.isVariantAvailable(product, "Crudo", "XL"), false);
  assert.strictEqual(products.isVariantAvailable(product, "Verde", "M"), false);
  assert.strictEqual(products.isVariantAvailable(product, "Negro", "XXL"), false);
  assert.deepStrictEqual(products.availableSizes(product, "Crudo"), ["XS", "S", "M", "L"]);
});

test("marca de oferta y categorías legibles", () => {
  const sale = products.products.find((item) => item.id === "campera-abrigo");
  assert.strictEqual(products.isOnSale(sale), true);
  assert.strictEqual(products.categoryLabel("remeras"), "Remeras");
});

/* ---------- Carrito ---------- */
test("agregar, combinar variantes y calcular totales", () => {
  const camisa = products.products.find((item) => item.id === "camisa-oversize");
  let items = cart.core.addItem([], camisa, "Negro", "M", 1);
  items = cart.core.addItem(items, camisa, "Negro", "M", 1); // misma variante: suma cantidad
  items = cart.core.addItem(items, camisa, "Crudo", "S", 2); // variante distinta
  assert.strictEqual(items.length, 2);
  const negroM = items.find((item) => item.key === "camisa-oversize|Negro|M");
  assert.strictEqual(negroM.qty, 2);
  assert.strictEqual(cart.core.count(items), 4);
  assert.strictEqual(cart.core.subtotal(items), camisa.price * 2 + camisa.price * 2);
});

test("cambiar cantidad, quitar y vaciar", () => {
  const remera = products.products.find((item) => item.id === "remera-essential");
  let items = cart.core.addItem([], remera, "Blanco", "M", 1);
  items = cart.core.setQty(items, "remera-essential|Blanco|M", 3);
  assert.strictEqual(items[0].qty, 3);
  items = cart.core.removeItem(items, "remera-essential|Blanco|M");
  assert.strictEqual(items.length, 0);
});

test("la clave distingue producto, color y talle", () => {
  assert.notStrictEqual(cart.core.itemKey({ id: "a" }, "Negro", "M"), cart.core.itemKey({ id: "a" }, "Negro", "L"));
});

/* ---------- WhatsApp ---------- */
test("mensaje de WhatsApp lista prendas, variantes y total", () => {
  const items = [
    { name: "Camisa Oversize", color: "Negro", size: "M", qty: 1, price: 45900 },
    { name: "Pantalón Sastrero", color: "Beige", size: "38", qty: 1, price: 62000 },
  ];
  const message = wa.buildMessage("AMARA", items);
  assert.ok(message.includes("1. Camisa Oversize"));
  assert.ok(message.includes("Color: Negro"));
  assert.ok(message.includes("Talle: M"));
  assert.ok(message.includes("TOTAL ESTIMADO: $107.900"));
});

test("enlace wa.me codifica el mensaje", () => {
  const link = wa.waLink("5491130000000", "Hola, ¿cómo estás?");
  assert.ok(link.startsWith("https://wa.me/5491130000000?text="));
  assert.ok(link.includes(encodeURIComponent("¿cómo")));
});

console.log(`\n${passed} pruebas de núcleo aprobadas.`);
