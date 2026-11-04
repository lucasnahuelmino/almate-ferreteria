#!/usr/bin/env node
/* ALMATE · Modelo D — Catálogo Comercial · sync-seo.js
   Sincroniza el bloque SEO estático de modelo-d/index.html con config.modelo-d.js.
   Los buscadores y las redes no ejecutan la configuración JavaScript: leen el HTML.

   Uso (desde la raíz del repo):
     node modelo-d/tools/sync-seo.js           reescribe el bloque
     node modelo-d/tools/sync-seo.js --check   no escribe; sale 1 si está desactualizado
*/
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const dir = path.resolve(__dirname, "..");
const core = require(path.join(dir, "config-core.modelo-d.js"));
const htmlPath = path.join(dir, "index.html");
const START = "<!-- ALMATE:MODELO-D:SEO:START -->";
const END = "<!-- ALMATE:MODELO-D:SEO:END -->";
const check = process.argv.includes("--check");

let raw;
try {
  const source = fs.readFileSync(path.join(dir, "config.modelo-d.js"), "utf8");
  raw = vm.runInNewContext(source + "\n;MODELO_D_CONFIG", {}, { timeout: 2000 });
} catch (error) {
  console.error("ERROR: no se pudo leer config.modelo-d.js:", error.message);
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

const seo = core.buildSeo(cfg);
const block = core.renderSeoBlock(seo);
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
  console.log("OK · el <head> estático ya coincide con config.modelo-d.js.");
  process.exit(0);
}
if (check) {
  console.error("DESACTUALIZADO · el <head> de index.html no coincide con config.modelo-d.js. Ejecutá: node modelo-d/tools/sync-seo.js");
  process.exit(1);
}

fs.writeFileSync(htmlPath, next);
console.log("Actualizado · modelo-d/index.html (title, description, canonical, Open Graph, Twitter, JSON-LD y preload del hero).");
if (!cfg.seo.url) {
  console.log("Nota: seo.url está vacío → no se emiten canonical, og:url ni imagen social absoluta.");
}
