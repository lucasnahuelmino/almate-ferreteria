"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const core = require(path.join(__dirname, "..", "config-core.modelo-d.js"));

const config = vm.runInNewContext(
  `${fs.readFileSync(path.join(__dirname, "..", "config.modelo-d.js"), "utf8")}\n;MODELO_D_CONFIG`,
  {},
  { timeout: 2000 }
);
const fixture = {
  brand: { name: "Comercio de prueba" },
  categories: [{ id: "herramientas", name: "Herramientas" }],
  catalog: {
    products: [
      { id: "taladro-a", sku: "T-01", name: "Taladro Azul", category: "herramientas", price: 25000, previousPrice: 30000, featured: true, order: 2 },
      { id: "llave-b", name: "Llave Fija", category: "herramientas", price: null, order: 1 },
    ],
  },
};

let passed = 0;
const test = (name, fn) => {
  try {
    fn();
    passed += 1;
    console.log("  ✔", name);
  } catch (error) {
    console.error("  ✘", name, "\n   ", error.message);
    process.exitCode = 1;
  }
};

test("configuración de plantilla válida y catálogo inicialmente sin inventario inventado", () => {
  const result = core.normalize(config);
  assert.equal(result.ok, true);
  assert.deepEqual(result.cfg.catalog.products, []);
  assert.ok(result.cfg.categories.items.length > 0);
  assert.ok(!result.cfg.stats.length);
  assert.ok(core.activeSections(result.cfg).includes("catalog"));
  assert.ok(core.activeSections(result.cfg).includes("consultation"));
});

test("normaliza producto completo y conserva campos opcionales", () => {
  const result = core.normalize(fixture);
  const product = result.cfg.catalog.products.find((item) => item.id === "taladro-a");
  assert.equal(result.ok, true);
  assert.equal(product.sku, "T-01");
  assert.equal(product.category, "herramientas");
  assert.equal(product.price, 25000);
  assert.equal(product.previousPrice, 30000);
  const unpriced = result.cfg.catalog.products.find((item) => item.id === "llave-b");
  assert.equal(unpriced.price, null);
  assert.equal(unpriced.availability, "");
});

test("omite identificadores duplicados y categorías inexistentes", () => {
  const result = core.normalize({
    ...fixture,
    catalog: { products: [
      { id: "uno", name: "Uno", category: "herramientas" },
      { id: "uno", name: "Duplicado", category: "herramientas" },
      { id: "otro", name: "Sin categoría válida", category: "desconocida" },
    ] },
  });
  assert.deepEqual(result.cfg.catalog.products.map((product) => product.id), ["uno"]);
  assert.ok(result.issues.some((issue) => issue.path === "catalog.products[1]"));
  assert.ok(result.issues.some((issue) => issue.path === "catalog.products[2]"));
});

test("valida valores de precio, anterior, disponibilidad y orden", () => {
  const result = core.normalize({
    ...fixture,
    catalog: { products: [
      { id: "a", name: "A", category: "herramientas", price: -1, previousPrice: 4, order: 3 },
      { id: "b", name: "B", category: "herramientas", price: 4, previousPrice: 4, availability: "Consultar", order: 1 },
    ] },
  });
  const invalid = result.cfg.catalog.products.find((item) => item.id === "a");
  const equalPrevious = result.cfg.catalog.products.find((item) => item.id === "b");
  assert.equal(invalid.price, null);
  assert.equal(invalid.previousPrice, null);
  assert.equal(equalPrevious.previousPrice, null);
  assert.equal(equalPrevious.availability, "Consultar");
  assert.deepEqual(result.cfg.catalog.products.map((product) => product.id), ["b", "a"]);
});

test("rutas de imágenes inseguras se descartan y galerías sin alt se omiten", () => {
  const result = core.normalize({
    ...fixture,
    catalog: { products: [{
      id: "seguro", name: "Producto", category: "herramientas",
      mainImage: "../../secreto.jpg",
      gallery: [{ src: "foto.jpg" }, { src: "javascript:alert(1)", alt: "No" }],
    }] },
  });
  const product = result.cfg.catalog.products[0];
  assert.equal(product.mainImage, "");
  assert.deepEqual(product.gallery, []);
  assert.ok(result.issues.some((issue) => issue.path.includes("mainImage")));
});

test("avisa si la imagen principal no tiene alt descriptivo y usa el nombre como respaldo", () => {
  const result = core.normalize({
    ...fixture,
    catalog: { products: [{
      id: "producto-con-imagen", name: "Producto de prueba", category: "herramientas",
      mainImage: "producto.jpg",
    }] },
  });
  assert.equal(result.cfg.catalog.products[0].mainImageAlt, "Producto de prueba");
  assert.ok(result.issues.some((issue) => issue.path === "catalog.products[0].mainImageAlt"));
});

test("WhatsApp rechaza caracteres y longitudes inválidas", () => {
  ["abc5491112345678", "123", "549111234567890123"].forEach((whatsapp) => {
    const result = core.normalize({ ...fixture, contact: { whatsapp } });
    assert.equal(result.cfg.contact.whatsapp, "");
    assert.ok(result.issues.some((issue) => issue.path === "contact.whatsapp"));
  });
  assert.equal(core.normalize({ ...fixture, contact: { whatsapp: "+54 9 11 1234-5678" } }).cfg.contact.whatsapp, "5491112345678");
});

test("secciones se filtran, ordenan y omiten duplicados o desconocidos", () => {
  const result = core.normalize({ ...fixture, sections: ["catalog", "featured", "catalog", "unknown"] });
  assert.deepEqual(result.cfg.sections, ["catalog", "featured"]);
  assert.deepEqual(core.activeSections(result.cfg), ["catalog", "featured"]);
});

test("configuración insegura de contenido se escapa y SEO mantiene URL canónica opcional", () => {
  assert.equal(core.esc("<img src=x onerror='x'>"), "&lt;img src=x onerror=&#39;x&#39;&gt;");
  const noUrl = core.buildSeo(core.normalize({ ...fixture, seo: { image: "social.jpg" } }).cfg);
  assert.equal(noUrl.canonical, "");
  assert.equal(noUrl.image, "");
  const withUrl = core.normalize({ ...fixture, seo: { url: "https://example.test/catalogo/" } }).cfg;
  assert.equal(core.buildSeo(withUrl).canonical, "https://example.test/catalogo/");
});

console.log(`\n${passed} pruebas de núcleo OK${process.exitCode ? " (hay fallos)" : ""}`);
