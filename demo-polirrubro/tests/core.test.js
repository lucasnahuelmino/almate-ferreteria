"use strict";
/* Pruebas del núcleo de la Demo Polirrubro ALMATE (sin DOM, sin dependencias).
   Desde la raíz del repo: node demo-polirrubro/tests/core.test.js */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const dir = path.join(__dirname, "..");
const core = require(path.join(dir, "js", "config-core.moda.js"));
const products = require(path.join(dir, "js", "products.moda.js"));
const cart = require(path.join(dir, "js", "cart.moda.js"));
const wa = require(path.join(dir, "js", "whatsapp.moda.js"));
const realConfig = vm.runInNewContext(fs.readFileSync(path.join(dir, "js", "config.moda.js"), "utf8") + "\n;MODA_CONFIG", {});

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
const byId = (id) => products.products.find((item) => item.id === id);
const sample = () => products.products[0];

/* ---------- Configuración ---------- */
test("la configuración real normaliza sin avisos ni errores", () => {
  const result = core.normalize(realConfig);
  assert.strictEqual(result.ok, true);
  assert.deepStrictEqual(result.issues, []);
  assert.strictEqual(result.cfg.brand.name, "ALMATE");
});

test("falta de configuración devuelve ok:false sin lanzar", () => {
  assert.strictEqual(core.normalize(undefined).ok, false);
});

test("claves, secciones y etiquetas desconocidas se reportan y descartan", () => {
  const result = core.normalize({ brand: { name: "T" }, foo: 1, sections: ["hero", "nada"], tags: { raro: "x", new: "Nuevo" } });
  assert.ok(result.issues.some((i) => i.path === "foo"));
  assert.deepStrictEqual(result.cfg.sections, ["hero"]);
  assert.ok(result.issues.some((i) => i.path === "tags.raro"));
  assert.strictEqual(result.cfg.tags.new, "Nuevo");
});

test("WhatsApp se normaliza a dígitos y valida longitud", () => {
  assert.strictEqual(core.normalize({ brand: { name: "T" }, contact: { whatsapp: "+54 9 11 1234-5678" } }).cfg.contact.whatsapp, "5491112345678");
  assert.strictEqual(core.normalize({ brand: { name: "T" }, contact: { whatsapp: "123" } }).cfg.contact.whatsapp, "");
});

test("colores y rutas inseguras se descartan", () => {
  const result = core.normalize({ brand: { name: "T" }, theme: { ink: "rojo" }, hero: { image: "../../secreto.png" }, collection: { image: "javascript:alert(1)" } });
  assert.strictEqual(result.cfg.theme.ink, "#15131f");
  assert.strictEqual(result.cfg.hero.image, "");
  assert.strictEqual(result.cfg.collection.image, "");
});

test("la franja acepta items y mantiene compatibilidad con text", () => {
  const a = core.normalize({ brand: { name: "T" }, announcement: { enabled: true, items: ["Uno", "Dos"] } });
  assert.deepStrictEqual(a.cfg.announcement.items, ["Uno", "Dos"]);
  const b = core.normalize({ brand: { name: "T" }, announcement: { enabled: true, text: "Solo texto" } });
  assert.deepStrictEqual(b.cfg.announcement.items, ["Solo texto"]);
  const c = core.normalize({ brand: { name: "T" }, announcement: { enabled: true } });
  assert.strictEqual(c.cfg.announcement.enabled, false);
});

test("hero: la palabra resaltada debe existir en el título", () => {
  const ok = core.normalize({ brand: { name: "T" }, hero: { title: "Un poco de todo", highlight: "todo" } });
  assert.strictEqual(ok.cfg.hero.highlight, "todo");
  const bad = core.normalize({ brand: { name: "T" }, hero: { title: "Un poco", highlight: "todo" } });
  assert.strictEqual(bad.cfg.hero.highlight, "");
});

test("filtros de navegación admiten new y validan tonos", () => {
  const result = core.normalize({ brand: { name: "T" }, navigation: [{ label: "Nuevo", filter: { new: true } }, { label: "Mal", filter: {} }], hero: { stickers: [{ text: "Hola", tone: "violeta" }] } });
  assert.strictEqual(result.cfg.navigation.length, 1);
  assert.strictEqual(result.cfg.navigation[0].filter.new, true);
  assert.strictEqual(result.cfg.hero.stickers[0].tone, "sun");
});

test("formato de precio argentino", () => {
  assert.strictEqual(core.formatPrice(45900), "$45.900");
  assert.strictEqual(core.formatPrice(0), "");
});

test("el crédito obligatorio de ALMATE está definido", () => {
  assert.strictEqual(core.CREDIT, "Desarrollado por ALMATE · Soluciones digitales.");
});

/* ---------- Catálogo ---------- */
test("catálogo: ids únicos, precios válidos y tonos permitidos", () => {
  const ids = products.products.map((p) => p.id);
  assert.strictEqual(new Set(ids).size, ids.length);
  products.products.forEach((p) => {
    assert.ok(p.price > 0, p.id + " sin precio");
    assert.ok(core.TONE_KEYS.includes(p.tone), p.id + " tono inválido");
    assert.ok(p.colors.length && p.sizes.length, p.id + " sin colores o talles");
  });
});

test("cada color de cada producto tiene su imagen en disco", () => {
  products.products.forEach((p) => {
    p.colors.forEach((color) => {
      const file = path.join(dir, products.imageFor(p, color.name));
      assert.ok(fs.existsSync(file), "falta " + file);
    });
  });
});

test("las imágenes y rutas de la configuración existen", () => {
  const paths = [];
  const walk = (value) => {
    if (typeof value === "string" && /^assets\/.+\.(svg|png|jpe?g|webp)$/i.test(value)) paths.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk(realConfig);
  assert.ok(paths.length > 10);
  paths.forEach((p) => assert.ok(fs.existsSync(path.join(dir, p)), "falta " + p));
});

test("disponibilidad de variantes respeta el único color/talle", () => {
  const p = sample();
  assert.strictEqual(products.isVariantAvailable(p, "Único", "Único"), true);
  assert.strictEqual(products.isVariantAvailable(p, "Inexistente", "Único"), false);
});

test("imagen por color con respaldo a la principal", () => {
  const p = sample();
  assert.strictEqual(products.imageFor(p, "Inexistente"), p.image);
  assert.ok(products.imageFor(p, "Único"));
});

/* ---------- Carrito ---------- */
test("agregar y calcular totales", () => {
  const p = sample();
  let items = cart.core.addItem([], p, "Único", "Único", 1);
  items = cart.core.addItem(items, p, "Único", "Único", 1);
  assert.strictEqual(items.length, 1);
  assert.strictEqual(items[0].qty, 2);
  assert.strictEqual(cart.core.count(items), 2);
  assert.strictEqual(cart.core.subtotal(items), p.price * 2);
});

test("cambiar cantidad y quitar", () => {
  const p = sample();
  let items = cart.core.addItem([], p, "Único", "Único", 1);
  items = cart.core.setQty(items, items[0].key, 3);
  assert.strictEqual(items[0].qty, 3);
  assert.strictEqual(cart.core.removeItem(items, items[0].key).length, 0);
});

/* ---------- WhatsApp ---------- */
test("mensaje de WhatsApp lista productos y total", () => {
  const items = [
    { name: "Producto A", sku: "123", qty: 1, price: 10000 },
    { name: "Producto B", sku: "456", qty: 2, price: 5000 },
  ];
  const message = wa.buildMessage("ALMATE", items);
  assert.ok(message.startsWith("¡Hola!"));
  assert.ok(message.includes("1. Producto A (Cód. 123)"));
  assert.ok(message.includes("Cantidad: 2"));
  assert.ok(message.includes("TOTAL ESTIMADO:"));
  assert.ok(message.includes("disponibilidad"));
});

test("enlace wa.me codifica el mensaje y no inventa números", () => {
  const link = wa.waLink("5491128687130", "Hola, ¿cómo estás?\n1. Prod");
  assert.ok(link.startsWith("https://wa.me/5491128687130?text="));
  assert.ok(link.includes(encodeURIComponent("¿cómo")) && !link.includes("\n"));
  assert.strictEqual(wa.waLink("", "x"), "");
});

console.log(`\n${passed} pruebas de núcleo aprobadas.`);
