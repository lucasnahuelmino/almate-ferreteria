"use strict";
/* Pruebas del núcleo de la Demo Moda 3 · PICHONES (sin DOM, sin dependencias).
   Desde la raíz del repo: node demo-moda-3/tests/core.test.js */
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

/* ---------- Configuración ---------- */
test("la configuración real normaliza sin avisos ni errores", () => {
  const result = core.normalize(realConfig);
  assert.strictEqual(result.ok, true);
  assert.deepStrictEqual(result.issues, []);
  assert.strictEqual(result.cfg.brand.name, "Pichones");
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

test("la guía de talles normaliza columnas y filas", () => {
  const result = core.normalize({ brand: { name: "T" }, guia: { columns: ["Edad", "Talle"], rows: [["0–2", "2"], ["3–4", "4"]] } });
  assert.deepStrictEqual(result.cfg.guia.columns, ["Edad", "Talle"]);
  assert.deepStrictEqual(result.cfg.guia.rows, [["0–2", "2"], ["3–4", "4"]]);
});

test("WhatsApp se normaliza a dígitos y valida longitud", () => {
  assert.strictEqual(core.normalize({ brand: { name: "T" }, contact: { whatsapp: "+54 9 11 1234-5678" } }).cfg.contact.whatsapp, "5491112345678");
  assert.strictEqual(core.normalize({ brand: { name: "T" }, contact: { whatsapp: "123" } }).cfg.contact.whatsapp, "");
});

test("colores y rutas inseguras se descartan", () => {
  const result = core.normalize({ brand: { name: "T" }, theme: { ink: "rojo" }, hero: { image: "../../secreto.png" }, collection: { image: "javascript:alert(1)" } });
  assert.strictEqual(result.cfg.theme.ink, "#403a52");
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
  const ok = core.normalize({ brand: { name: "T" }, hero: { title: "Ropa piola para pichones", highlight: "pichones" } });
  assert.strictEqual(ok.cfg.hero.highlight, "pichones");
  const bad = core.normalize({ brand: { name: "T" }, hero: { title: "Ropa", highlight: "onda" } });
  assert.strictEqual(bad.cfg.hero.highlight, "");
});

test("filtros de navegación admiten new y validan tonos", () => {
  const result = core.normalize({ brand: { name: "T" }, navigation: [{ label: "Nuevo", filter: { new: true } }, { label: "Mal", filter: {} }], hero: { stickers: [{ text: "Hola", tone: "violeta" }] } });
  assert.strictEqual(result.cfg.navigation.length, 1);
  assert.strictEqual(result.cfg.navigation[0].filter.new, true);
  assert.strictEqual(result.cfg.hero.stickers[0].tone, "sun");
});

test("los slots de la pilcha requieren etiqueta y categorías", () => {
  const result = core.normalize({ brand: { name: "T" }, pilcha: { slots: [{ label: "Arriba", categories: ["Remeras"] }, { label: "Vacío", categories: [] }, { categories: ["x"] }] } });
  assert.deepStrictEqual(result.cfg.pilcha.slots, [{ label: "Arriba", categories: ["remeras"] }]);
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

test("las excepciones de stock apuntan a combinaciones que existen", () => {
  products.products.forEach((p) => {
    p.unavailable.forEach((pair) => {
      const [color, size] = pair.split("|");
      assert.ok(p.colors.some((c) => c.name === color) && p.sizes.includes(size), `${p.id}: ${pair}`);
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

test("los productos de la colección y los slots de la pilcha existen en el catálogo", () => {
  realConfig.collection.productIds.forEach((id) => assert.ok(byId(id), id));
  realConfig.pilcha.slots.forEach((slot) => {
    assert.ok(products.products.some((p) => slot.categories.includes(p.category)), slot.label);
  });
});

test("disponibilidad de variantes respeta colores, talles y excepciones", () => {
  const buzo = byId("buzo-canguro");
  assert.strictEqual(products.isVariantAvailable(buzo, "Negro", "8"), true);
  assert.strictEqual(products.isVariantAvailable(buzo, "Lila", "2"), false);
  assert.strictEqual(products.isVariantAvailable(buzo, "Verde", "8"), false);
  assert.strictEqual(products.isVariantAvailable(buzo, "Negro", "12"), false);
  assert.deepStrictEqual(products.availableSizes(buzo, "Lila"), ["4", "6", "8", "10", "12"]);
});

test("imagen por color con respaldo a la principal", () => {
  const buzo = byId("buzo-canguro");
  assert.ok(products.imageFor(buzo, "Lila").endsWith("buzo-canguro-lila.svg"));
  assert.strictEqual(products.imageFor(buzo, "Inexistente"), buzo.image);
});

test("etiqueta única por prioridad y marca de oferta", () => {
  assert.strictEqual(products.badgeTag(byId("buzo-canguro")), "sale");
  assert.strictEqual(products.badgeTag(byId("remera-dinosaurio")), "best-seller");
  assert.strictEqual(products.isOnSale(byId("jean-elasticado")), false);
  assert.strictEqual(products.isOnSale(byId("mochila-jardin")), false);
});

/* ---------- Carrito ---------- */
test("agregar, combinar variantes y calcular totales", () => {
  const buzo = byId("buzo-canguro");
  let items = cart.core.addItem([], buzo, "Negro", "8", 1);
  items = cart.core.addItem(items, buzo, "Negro", "8", 1);
  items = cart.core.addItem(items, buzo, "Gris", "10", 2);
  assert.strictEqual(items.length, 2);
  assert.strictEqual(items.find((i) => i.key === "buzo-canguro|Negro|8").qty, 2);
  assert.strictEqual(cart.core.count(items), 4);
  assert.strictEqual(cart.core.subtotal(items), buzo.price * 4);
});

test("el ítem guarda la imagen del color elegido y el tono", () => {
  const buzo = byId("buzo-canguro");
  const item = cart.core.createItem(buzo, "Lila", "8", 1);
  assert.ok(item.image.endsWith("buzo-canguro-lila.svg"));
  assert.strictEqual(item.tone, "sun");
});

test("cambiar cantidad, quitar y la clave distingue producto, color y talle", () => {
  const gorra = byId("gorra-pibe");
  let items = cart.core.addItem([], gorra, "Negro", "Único", 1);
  items = cart.core.setQty(items, "gorra-pibe|Negro|Único", 3);
  assert.strictEqual(items[0].qty, 3);
  assert.strictEqual(cart.core.removeItem(items, "gorra-pibe|Negro|Único").length, 0);
  assert.notStrictEqual(cart.core.itemKey({ id: "a" }, "Negro", "8"), cart.core.itemKey({ id: "a" }, "Negro", "10"));
});

/* ---------- WhatsApp ---------- */
test("mensaje de WhatsApp lista prendas, variantes y total", () => {
  const items = [
    { name: "Buzo Canguro", color: "Negro", size: "8", qty: 1, price: 42900 },
    { name: "Jogger Niño", color: "Gris", size: "8", qty: 2, price: 34900 },
  ];
  const message = wa.buildMessage("Pichones", items);
  assert.ok(message.startsWith("¡Hola!"));
  assert.ok(message.includes("1. Buzo Canguro"));
  assert.ok(message.includes("Color: Negro") && message.includes("Talle: 8") && message.includes("Cantidad: 2"));
  assert.ok(message.includes("TOTAL ESTIMADO: $112.700"));
  assert.ok(message.includes("disponibilidad"));
});

test("enlace wa.me codifica el mensaje y no inventa números", () => {
  const link = wa.waLink("5491130000000", "Hola, ¿cómo estás?\n1. Buzo");
  assert.ok(link.startsWith("https://wa.me/5491130000000?text="));
  assert.ok(link.includes(encodeURIComponent("¿cómo")) && !link.includes("\n"));
  assert.strictEqual(wa.waLink("", "x"), "");
});

console.log(`\n${passed} pruebas de núcleo aprobadas.`);
