#!/usr/bin/env node
/* ALMATE · Demo Moda · sync-seo.js
   Sincroniza el bloque SEO estático de demo-moda/index.html con config.moda.js.
   Los buscadores y las redes leen el HTML (no ejecutan config.moda.js).

   Uso (desde la raíz del repo):
     node demo-moda/tools/sync-seo.js           reescribe el bloque
     node demo-moda/tools/sync-seo.js --check   no escribe; sale 1 si está desactualizado
*/
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const dir = path.resolve(__dirname, "..");
const core = require(path.join(dir, "js", "config-core.moda.js"));
const htmlPath = path.join(dir, "index.html");
const START = "<!-- ALMATE:MODA:SEO:START -->";
const END = "<!-- ALMATE:MODA:SEO:END -->";
const check = process.argv.includes("--check");

let raw;
try {
  const source = fs.readFileSync(path.join(dir, "js", "config.moda.js"), "utf8");
  raw = vm.runInNewContext(source + "\n;MODA_CONFIG", {}, { timeout: 2000 });
} catch (error) {
  console.error("ERROR: no se pudo leer config.moda.js:", error.message);
  process.exit(2);
}

const { cfg, issues, ok } = core.normalize(raw);
issues.forEach((issue) => {
  console.error(`${issue.level === "error" ? "ERROR" : "aviso"} · ${issue.path}: ${issue.msg}`);
});
if (!ok || issues.some((issue) => issue.level === "error")) {
  console.error("La configuración tiene errores críticos: no se modifica index.html.");
  process.exit(2);
}

const block = core.renderSeoBlock(core.buildSeo(cfg));
const html = fs.readFileSync(htmlPath, "utf8");
const start = html.indexOf(START);
const end = html.indexOf(END, start);
if (start === -1 || end === -1) {
  console.error(`ERROR: faltan los marcadores ${START} … ${END} en index.html.`);
  process.exit(2);
}

const startLineEnd = html.indexOf("-->", start) + 3;
const next = html.slice(0, start) + html.slice(start, startLineEnd) + "\n" + block + "\n  " + END + html.slice(end + END.length);

if (next === html) {
  console.log("OK · el <head> estático ya coincide con config.moda.js.");
  process.exit(0);
}
if (check) {
  console.error("DESACTUALIZADO · el <head> de index.html no coincide con config.moda.js. Ejecutá: node demo-moda/tools/sync-seo.js");
  process.exit(1);
}

fs.writeFileSync(htmlPath, next);
console.log("Actualizado · demo-moda/index.html (title, description, Open Graph, Twitter y JSON-LD).");
if (!cfg.seo.url) {
  console.log("Nota: seo.url está vacío → no se emiten canonical, og:url ni imagen social absoluta.");
}
