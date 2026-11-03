/* Pruebas de config-core.js (sin dependencias). Uso: node premium/tests/core.test.js */
"use strict";
const assert = require("assert"), path = require("path");
const core = require(path.join(__dirname, "..", "config-core.js"));
let n = 0;
const t = (name, fn) => { try { fn(); n++; console.log("  ✔", name); } catch (e) { console.error("  ✘", name, "\n   ", e.message); process.exitCode = 1; } };
const norm = (c) => core.normalize(c);

t("config ausente → error crítico, sin excepción", () => { const r = norm(undefined); assert.equal(r.ok, false); assert.ok(r.issues.some((i) => i.level === "error")); });
t("config no objeto (string/array/null)", () => { ["x", [], null, 5].forEach((v) => assert.equal(norm(v).ok, false)); });
t("config vacía {} → falta brand.name es error crítico", () => { const r = norm({}); assert.equal(r.ok, false); assert.ok(r.issues.some((i) => i.path === "brand.name")); });
t("config mínima válida", () => assert.equal(norm({ brand: { name: "X" } }).ok, true));
t("tipos erróneos no lanzan y usan defaults", () => {
  const r = norm({ brand: { name: "X" }, services: { items: "no" }, gallery: 5, contact: { phone: 123, social: [] }, colors: { ink: "red" }, sections: "hero" });
  assert.equal(r.cfg.services.items.length, 0); assert.equal(r.cfg.colors.ink, core.DEFAULTS.colors.ink); assert.ok(r.issues.length >= 5);
});
t("claves desconocidas generan aviso", () => assert.ok(norm({ brand: { name: "X" }, colorss: {} }).issues.some((i) => i.path === "colorss")));
t("secciones inexistentes y duplicadas se descartan", () => {
  const r = norm({ brand: { name: "X" }, sections: ["hero", "nope", "hero", "about"] });
  assert.deepEqual(r.cfg.sections, ["hero", "about"]);
});
t("items inválidos se omiten, válidos se conservan", () => {
  const r = norm({ brand: { name: "X" }, services: { items: [{ name: "A" }, {}, null, "x", { name: 5 }] } });
  assert.equal(r.cfg.services.items.length, 1);
});
t("URLs: solo http(s) en enlaces web", () => {
  ["javascript:alert(1)", "data:text/html,x", "ftp://x.com", "//evil.com", "https://a b.com", " javascript:alert(1)", "JaVaScRiPt:alert(1)", "vbscript:x"].forEach((u) => assert.equal(core.webUrl(u), "", u));
  assert.equal(core.webUrl("https://instagram.com/x"), "https://instagram.com/x");
});
t("rutas de imagen: rechaza esquemas peligrosos y traversal", () => {
  ["javascript:alert(1)", "data:image/svg+xml,<svg/>", "//evil.com/x.png", "../../etc/passwd", "a/../../b.jpg", "x\\y.jpg", 'a".jpg', "", "file:///c:/x.jpg"].forEach((p) => assert.equal(core.isSafePath(p), false, p));
  ["foto.jpg", "sub/foto.webp", "https://cdn.x.com/a.jpg"].forEach((p) => assert.equal(core.isSafePath(p), true, p));
});
t("assetUrl antepone assetBase solo a rutas relativas", () => {
  const c = { assetBase: "../img/" }; assert.equal(core.assetUrl(c, "a.jpg"), "../img/a.jpg"); assert.equal(core.assetUrl(c, "https://x.com/a.jpg"), "https://x.com/a.jpg");
});
t("contacto: whatsapp, email, tel inválidos se descartan", () => {
  const r = norm({ brand: { name: "X" }, contact: { whatsapp: "abc", email: "no-mail", phoneHref: "javascript:alert(1)", phone: "(011) 4250-2865" } });
  assert.equal(r.cfg.contact.whatsapp, ""); assert.equal(r.cfg.contact.email, ""); assert.ok(/^tel:\+/.test(r.cfg.contact.phoneHref));
  assert.equal(norm({ brand: { name: "X" }, contact: { whatsapp: "+54 11 4250-2865" } }).cfg.contact.whatsapp, "541142502865");
});
t("redes sociales: solo URLs http(s)", () => {
  const r = norm({ brand: { name: "X" }, contact: { social: { instagram: "javascript:alert(1)", facebook: "https://fb.com/x" } } });
  assert.deepEqual(Object.keys(r.cfg.contact.social), ["facebook"]);
});
t("mapa: embedUrl solo https; sin query ni embed → no se muestra", () => {
  assert.equal(norm({ brand: { name: "X" }, contact: { map: { embedUrl: "http://x.com" , query: "" } } }).cfg.contact.map.show, false);
  assert.equal(norm({ brand: { name: "X" }, contact: { map: { show: false, query: "a" } } }).cfg.contact.map.show, false);
  assert.equal(norm({ brand: { name: "X" }, contact: { map: { query: "Calle 1" } } }).cfg.contact.map.show, true);
});
t("colores/fuentes: previene inyección CSS", () => {
  const r = norm({ brand: { name: "X" }, colors: { ink: "red;}body{display:none" }, fonts: { body: "x;}body{display:none" } });
  assert.equal(r.cfg.colors.ink, core.DEFAULTS.colors.ink); assert.equal(r.cfg.fonts.body, core.DEFAULTS.fonts.body);
});
t("esc() neutraliza HTML", () => assert.equal(core.esc('<img src=x onerror="a()">&\''), "&lt;img src=x onerror=&quot;a()&quot;&gt;&amp;&#39;"));
t("SEO: sin seo.url no hay canonical ni og:image; con url sí", () => {
  const a = norm({ brand: { name: "X" }, seo: { image: "a.jpg" }, hero: { title: "t", image: "h.jpg" } }).cfg;
  let s = core.buildSeo(a, ["hero"]); assert.equal(s.canonical, ""); assert.equal(s.ogImage, ""); assert.equal(s.heroPreload, "../img/h.jpg");
  const b = norm({ brand: { name: "X" }, seo: { url: "https://x.com/premium/", image: "a.jpg" } }).cfg;
  s = core.buildSeo(b, []); assert.equal(s.canonical, "https://x.com/premium/"); assert.equal(s.ogImage, "https://x.com/img/a.jpg");
});
t("SEO: seo.url inválida se descarta con aviso", () => { const r = norm({ brand: { name: "X" }, seo: { url: "javascript:alert(1)" } }); assert.equal(r.cfg.seo.url, ""); assert.ok(r.issues.some((i) => i.path === "seo.url")); });
t("SEO: renderSeoBlock escapa y neutraliza </script> en JSON-LD", () => {
  const c = norm({ brand: { name: '</script><script>alert(1)</script>"' } }).cfg;
  const html = core.renderSeoBlock(core.buildSeo(c, []));
  assert.ok(!/<script>alert/.test(html)); assert.equal((html.match(/<\/script>/g) || []).length, 1);
});
t("SEO: no inventa datos (sin teléfono → sin telephone)", () => {
  const ld = core.buildSeo(norm({ brand: { name: "X" } }).cfg, []).jsonld;
  ["telephone", "email", "address", "openingHoursSpecification", "sameAs", "url", "image"].forEach((k) => assert.ok(!(k in ld), k));
});
t("enabledSections: oculta secciones sin contenido; testimonios vacíos sin aviso", () => {
  const r = norm({ brand: { name: "X" }, hero: { title: "H" } }); const is = r.issues.slice();
  const en = core.enabledSections(r.cfg, is);
  assert.deepEqual(en, ["hero"]); assert.ok(!is.some((i) => i.path === "sections.testimonials"));
});
console.log(`\n${n} pruebas OK${process.exitCode ? " (hay fallos)" : ""}`);
