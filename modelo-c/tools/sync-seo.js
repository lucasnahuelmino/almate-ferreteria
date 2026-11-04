#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const directory = path.resolve(__dirname, "..");
const core = require(path.join(directory, "config-core.modelo-c.js"));
const htmlPath = path.join(directory, "index.html");
const start = "<!-- ALMATE:MODELO-C:SEO:START -->";
const end = "<!-- ALMATE:MODELO-C:SEO:END -->";
const checkOnly = process.argv.includes("--check");

let config;
try {
  const source = fs.readFileSync(path.join(directory, "config.modelo-c.js"), "utf8");
  config = vm.runInNewContext(`${source}\n;MODEL_C_CONFIG`, {}, { timeout: 2000 });
} catch (error) {
  console.error("ERROR: no se pudo leer config.modelo-c.js:", error.message);
  process.exit(2);
}

const result = core.normalize(config);
const sections = core.enabledSections(result.cfg, result.issues);
result.issues.forEach((issue) => {
  console.error(`${issue.level === "error" ? "ERROR" : "aviso"} · ${issue.path}: ${issue.message}`);
});
if (!result.ok) {
  console.error("La configuración tiene errores críticos; index.html no se modificó.");
  process.exit(2);
}

let html;
try {
  html = fs.readFileSync(htmlPath, "utf8");
} catch (error) {
  console.error("ERROR: no se pudo leer modelo-c/index.html:", error.message);
  process.exit(2);
}
const startAt = html.indexOf(start);
const endAt = html.indexOf(end);
if (startAt < 0 || endAt < startAt) {
  console.error(`ERROR: faltan los marcadores ${start} … ${end} en modelo-c/index.html.`);
  process.exit(2);
}

const replacement = `${start}\n${core.renderSeoBlock(core.buildSeo(result.cfg, sections))}\n  ${end}`;
const updated = `${html.slice(0, startAt)}${replacement}${html.slice(endAt + end.length)}`;
if (updated === html) {
  console.log("OK · el bloque SEO estático coincide con config.modelo-c.js.");
  process.exit(0);
}
if (checkOnly) {
  console.error('DESACTUALIZADO · ejecutá "node modelo-c/tools/sync-seo.js".');
  process.exit(1);
}

try {
  fs.writeFileSync(htmlPath, updated);
  console.log("Actualizado · modelo-c/index.html (title, description, canonical, Open Graph, Twitter y preload).");
  if (!result.cfg.seo.url) console.log('Nota: seo.url está vacío; no se generan canonical, og:url ni imágenes sociales.');
} catch (error) {
  console.error("ERROR: no se pudo actualizar modelo-c/index.html:", error.message);
  process.exit(2);
}
