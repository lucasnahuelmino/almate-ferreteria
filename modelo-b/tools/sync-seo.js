#!/usr/bin/env node
/* ALMATE · Modelo Premium · sync-seo.js
   Sincroniza el <head> ESTÁTICO de modelo-b/index.html con modelo-b/config.premium.js.
   Por qué: buscadores y redes sociales leen el HTML estático (no ejecutan config.premium.js).
   Sin dependencias: solo Node.js (>= 14). No toca nada fuera del bloque marcado.

   Uso (desde la raíz del repo):
     node modelo-b/tools/sync-seo.js           reescribe el bloque SEO de modelo-b/index.html
     node modelo-b/tools/sync-seo.js --check   no escribe; sale con código 1 si está desactualizado
*/
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const dir = path.resolve(__dirname, "..");
const core = require(path.join(dir, "config-core.js"));
const htmlPath = path.join(dir, "index.html");
const START = "<!-- ALMATE:SEO:START", END = "<!-- ALMATE:SEO:END -->";
const check = process.argv.includes("--check");

let raw;
try { raw = vm.runInNewContext(fs.readFileSync(path.join(dir, "config.premium.js"), "utf8") + "\n;PREMIUM_CONFIG", {}, { timeout: 2000 }); }
catch (e) { console.error("ERROR: no se pudo leer config.premium.js:", e.message); process.exit(2); }

const { cfg, issues, ok } = core.normalize(raw);
const sections = core.enabledSections(cfg, issues);
issues.forEach((i) => console.error(`${i.level === "error" ? "ERROR" : "aviso"} · ${i.path}: ${i.msg}`));
if (!ok) { console.error("La configuración tiene errores críticos: no se modifica index.html."); process.exit(2); }

const seo = core.buildSeo(cfg, sections);
const html = fs.readFileSync(htmlPath, "utf8");
const a = html.indexOf(START), b = html.indexOf(END);
if (a === -1 || b === -1 || b < a) { console.error(`ERROR: faltan los marcadores ${START} … ${END} en index.html.`); process.exit(2); }
const headLine = html.slice(a, html.indexOf("-->", a) + 3);
const block = headLine + "\n" + core.renderSeoBlock(seo) + "\n  " + END;
const out = html.slice(0, a) + block + html.slice(b + END.length);

if (out === html) { console.log("OK · el <head> estático ya coincide con config.premium.js."); process.exit(0); }
if (check) { console.error("DESACTUALIZADO · el <head> de index.html no coincide con config.premium.js. Ejecutá: node modelo-b/tools/sync-seo.js"); process.exit(1); }
fs.writeFileSync(htmlPath, out);
console.log("Actualizado · modelo-b/index.html (title, description, canonical, Open Graph, Twitter, JSON-LD, preload del hero).");
if (!cfg.seo.url) console.log("Nota: seo.url está vacío → no se emiten canonical, og:url ni og:image/twitter:image (requieren URL absoluta).");
