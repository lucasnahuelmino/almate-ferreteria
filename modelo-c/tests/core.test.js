"use strict";
const assert = require("assert");
const path = require("path");
const vm = require("vm");
const fs = require("fs");
const core = require(path.join(__dirname, "..", "config-core.modelo-c.js"));
const loadConfig = () => vm.runInNewContext(
  `${fs.readFileSync(path.join(__dirname, "..", "config.modelo-c.js"), "utf8")}\n;MODEL_C_CONFIG`,
  {},
  { timeout: 2000 }
);
let passed = 0;
const test = (name, fn) => {
  try { fn(); passed += 1; console.log("  ✔", name); }
  catch (error) { console.error("  ✘", name, "\n   ", error.message); process.exitCode = 1; }
};
const valid = (overrides) => core.normalize(Object.assign({ brand: { name: "Negocio real" } }, overrides || {}));

test("configuración de ejemplo carga sin errores críticos y no inventa testimonios ni indicadores", () => {
  const result = core.normalize(loadConfig());
  assert.equal(result.ok, true);
  assert.equal(result.cfg.trust.items.length, 0);
  assert.equal(result.cfg.testimonials.items.length, 0);
});
test("configuración ausente o vacía devuelve defaults e informa el error", () => {
  [undefined, null, [], "x"].forEach((value) => assert.equal(core.normalize(value).ok, false));
  const missing = core.normalize({});
  assert.ok(missing.issues.some((issue) => issue.path === "brand.name"));
  assert.equal(missing.cfg.brand.name, "Nombre del negocio");
});
test("configuración parcial mantiene tipos y usa defaults seguros", () => {
  const result = valid({ services: { items: "incorrecto" }, contact: { social: [] }, colors: { primary: "red" } });
  assert.deepEqual(result.cfg.services.items, []);
  assert.deepEqual(result.cfg.contact.social, {});
  assert.equal(result.cfg.colors.primary, core.DEFAULTS.colors.primary);
  assert.ok(result.issues.length >= 3);
});
test("secciones ordenadas, deshabilitadas, desconocidas y duplicadas", () => {
  const result = valid({ sections: ["gallery", "hero", "invalid", "hero"] });
  assert.deepEqual(result.cfg.sections, ["gallery", "hero"]);
  const enabled = core.enabledSections(result.cfg, result.issues);
  assert.deepEqual(enabled, ["hero"]);
});
test("clave desconocida se informa sin detener el render", () => {
  const result = valid({ brand: { name: "Negocio real", nmae: "typo" }, extra: true });
  assert.ok(result.issues.some((issue) => issue.path === "extra"));
  assert.ok(result.issues.some((issue) => issue.path === "brand.nmae"));
  assert.equal(result.ok, true);
});
test("indicadores y testimonios vacíos se ocultan", () => {
  const result = core.normalize(loadConfig());
  const enabled = core.enabledSections(result.cfg, []);
  assert.ok(!enabled.includes("trust"));
  assert.ok(!enabled.includes("testimonials"));
});
test("diferenciales requieren entre tres y seis elementos", () => {
  const items = (n) => Array.from({ length: n }, (_, i) => ({ title: `D${i}`, description: "Dato configurable." }));
  [1, 2].forEach((count) => {
    const result = valid({ differentiators: { items: items(count) } });
    assert.ok(!core.enabledSections(result.cfg, []).includes("differentiators"));
    assert.ok(result.issues.some((issue) => issue.path === "differentiators.items"));
  });
  test("proceso admite tres o cuatro pasos y limita listas extensas", () => {
    const steps = (n) => Array.from({ length: n }, (_, i) => ({ title: `Paso ${i + 1}` }));
    [1, 2].forEach((count) => {
      const result = valid({ process: { steps: steps(count) } });
      assert.ok(!core.enabledSections(result.cfg, []).includes("process"));
      assert.ok(result.issues.some((issue) => issue.path === "process.steps"));
    });
    const result = valid({ process: { steps: steps(5) } });
    assert.equal(result.cfg.process.steps.length, 4);
    assert.ok(core.enabledSections(result.cfg, []).includes("process"));
  });
  const result = valid({ differentiators: { items: items(3) } });
  assert.ok(core.enabledSections(result.cfg, []).includes("differentiators"));
  const tooMany = valid({ differentiators: { items: items(7) } });
  assert.equal(tooMany.cfg.differentiators.items.length, 6);
  assert.ok(core.enabledSections(tooMany.cfg, []).includes("differentiators"));
});
test("servicios incompletos e imágenes inseguras se omiten", () => {
  const result = valid({ services: { items: [
    { name: "Correcto", description: "Descripción real." },
    { name: "", description: "sin título" },
    { name: "Ruta peligrosa", image: "../../secret.jpg" },
  ] } });
  assert.equal(result.cfg.services.items.length, 2);
  assert.equal(result.cfg.services.items[1].image, "");
  assert.ok(result.issues.some((issue) => issue.path === "services.items[2].image"));
});
test("galería requiere ruta segura y avisa si falta alt", () => {
  const result = valid({ gallery: { items: [
    { src: "foto.webp", alt: "Fotografía descriptiva" },
    { src: "javascript:alert(1)", alt: "Ataque" },
    { src: "sin-alt.jpg" },
  ] } });
  assert.equal(result.cfg.gallery.items.length, 2);
  assert.ok(result.issues.some((issue) => issue.path === "gallery.items[2].alt"));
});
test("protocolos web y rutas bloquean esquemas peligrosos y traversal", () => {
  ["javascript:alert(1)", "data:text/html,x", "//example.com/x", "ftp://example.com", "https://bad host"].forEach((url) => assert.equal(core.safeWebUrl(url), ""));
  assert.equal(core.safeWebUrl("https://example.com/path"), "https://example.com/path");
  ["javascript:alert(1)", "data:image/svg+xml,x", "../../file", "a/%2e%2e/b", "x\\y.png"].forEach((url) => assert.equal(core.safeImagePath(url), false));
  assert.equal(core.safeImagePath("photos/one.webp"), true);
});
test("base de imágenes admite ../img y rechaza traversal arbitrario", () => {
  assert.equal(valid({ assetBase: "../img/" }).cfg.assetBase, "../img/");
  assert.equal(valid({ assetBase: "../../outside/" }).cfg.assetBase, "../img/");
});
test("WhatsApp, email, teléfono y redes se validan", () => {
  const result = valid({ contact: {
    phone: "(011) 4250-2865",
    email: "mal formado",
    whatsapp: "abc",
    social: { instagram: "javascript:alert(1)", facebook: "https://facebook.com/empresa" },
  } });
  assert.equal(result.cfg.contact.phoneHref, "tel:01142502865");
  assert.equal(result.cfg.contact.email, "");
  assert.equal(result.cfg.contact.whatsapp, "");
  assert.deepEqual(Object.keys(result.cfg.contact.social), ["facebook"]);
});
test("CTA solo acepta tipos conocidos y URL http(s)", () => {
  const result = valid({ hero: {
    primary: { label: "Abrir", type: "url", url: "javascript:alert(1)" },
    secondary: { label: "Ver", target: "missing" },
  } });
  assert.equal(result.cfg.hero.primary.url, "");
  assert.equal(result.cfg.hero.secondary.target, "services");
  assert.ok(result.issues.some((issue) => issue.path === "hero.primary.url"));
});
test("mapa embebido requiere https y enlaces Google Maps usan http(s)", () => {
  const result = valid({ coverage: { mapUrl: "http://example.com/map", mapsUrl: "javascript:alert(1)" } });
  assert.equal(result.cfg.coverage.mapUrl, "");
  assert.equal(result.cfg.coverage.mapsUrl, "");
  assert.ok(core.safeMapUrl("https://www.google.com/maps/embed?pb=test"));
  assert.ok(core.safeMapUrl("https://www.openstreetmap.org/export/embed.html?bbox=test"));
  assert.equal(core.safeMapUrl("https://attacker.example/embed"), "");
});
test("escape neutraliza HTML y atributos", () => {
  assert.equal(core.esc('<img src=x onerror="x">&\''), "&lt;img src=x onerror=&quot;x&quot;&gt;&amp;&#39;");
});
test("SEO genera canonical solo con URL configurada y no agrega JSON-LD", () => {
  const withoutUrl = valid({ seo: { image: "social.jpg" } }).cfg;
  const noCanonical = core.buildSeo(withoutUrl, ["hero"]);
  assert.equal(noCanonical.canonical, "");
  assert.equal(noCanonical.ogImage, "");
  const withUrl = valid({ seo: { url: "https://cliente.example/modelo-c/", image: "social.jpg" } }).cfg;
  const seo = core.buildSeo(withUrl, ["hero"]);
  assert.equal(seo.canonical, "https://cliente.example/modelo-c/");
  assert.equal(seo.ogImage, "https://cliente.example/img/social.jpg");
  assert.ok(!core.renderSeoBlock(seo).includes("application/ld+json"));
});
test("SEO escapa los valores y genera preload solo para el hero activo", () => {
  const cfg = valid({ brand: { name: '<img src=x onerror="alert(1)">' }, hero: { image: "hero.webp" } }).cfg;
  const html = core.renderSeoBlock(core.buildSeo(cfg, ["hero"]));
  assert.ok(html.includes("&lt;img"));
  assert.ok(html.includes('href="../img/hero.webp"'));
  assert.equal(core.renderSeoBlock(core.buildSeo(cfg, [])).includes('rel="preload"'), false);
});
test("sección de contacto y cobertura solo aparecen con datos configurados", () => {
  const empty = core.normalize(loadConfig());
  const emptyEnabled = core.enabledSections(empty.cfg, []);
  assert.ok(!emptyEnabled.includes("coverage"));
  assert.ok(!emptyEnabled.includes("contact"));
  assert.ok(!emptyEnabled.includes("finalCta"));
  const filled = valid({ contact: { whatsapp: "541112345678" }, coverage: { localities: ["Quilmes"] } });
  const filledEnabled = core.enabledSections(filled.cfg, []);
  assert.ok(filledEnabled.includes("contact"));
  assert.ok(filledEnabled.includes("coverage"));
  assert.ok(filledEnabled.includes("finalCta"));
});

console.log(`\n${passed} pruebas de núcleo ${process.exitCode ? "(con errores)" : "OK"}`);
