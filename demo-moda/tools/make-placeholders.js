#!/usr/bin/env node
/* ALMATE · Demo Moda · make-placeholders.js
   Genera los recursos SVG de demostración (hero, categorías, productos y
   lookbook). Son placeholders de diseño, no fotografías: reemplazalos por
   fotos propias con licencia antes de publicar (ver GUIA_PERSONALIZACION.md).
   Uso: node demo-moda/tools/make-placeholders.js
*/
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CHARCOAL = "#171717";
const STONE = "#e9e7e2";
const SAND = "#d8cbb8";
const GREY = "#77736e";
const OFFWHITE = "#faf9f6";

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* Iconos de trazo (viewBox 0 0 200 200), dibujados con líneas finas. */
const icons = {
  hanger: (stroke) => `
    <g stroke="${stroke}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M100 44 c0 -14 9 -24 23 -24 c8 0 14 3 18 8"/>
      <path d="M100 46 L46 128 L154 128 Z"/>
    </g>`,
  figure: (stroke) => `
    <g stroke="${stroke}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="100" cy="36" r="14"/>
      <path d="M100 50 C78 60 72 78 72 96 L72 128 M100 86 L100 128 M100 50 C122 60 128 78 128 96 L128 128"/>
      <path d="M76 62 L54 88 M124 62 L146 88"/>
    </g>`,
  bag: (stroke) => `
    <g stroke="${stroke}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="62" y="88" width="76" height="66" rx="8"/>
      <path d="M82 88 v-4 a18 18 0 0 1 36 0 v4"/>
    </g>`,
  dress: (stroke) => `
    <g stroke="${stroke}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M86 56 L100 44 L114 56"/>
      <path d="M100 56 L66 152 L134 152 Z"/>
    </g>`,
  trousers: (stroke) => `
    <g stroke="${stroke}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M66 56 L100 56 L134 56 L118 152 M100 56 L100 152 M82 56 L72 152"/>
    </g>`,
  scarf: (stroke) => `
    <g stroke="${stroke}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M70 96 c30 -16 60 -6 60 -6 c-10 24 -30 30 -48 24 c-12 -4 -18 -12 -18 -20"/>
      <path d="M122 92 l14 -22 M74 100 l-8 16"/>
    </g>`,
  tee: (stroke) => `
    <g stroke="${stroke}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M74 56 L100 44 L126 56 L138 152 L62 152 Z"/>
      <path d="M84 56 C84 74 96 78 100 78 C104 78 116 74 116 56"/>
    </g>`,
  figurePair: (stroke) => `
    <g stroke="${stroke}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="70" cy="44" r="13"/>
      <path d="M70 58 C52 66 47 82 47 98 L47 126 M70 92 L70 126 M70 58 C88 66 93 82 93 98 L93 126"/>
      <circle cx="130" cy="44" r="13"/>
      <path d="M130 58 C112 66 107 82 107 98 L107 126 M130 92 L130 126 M130 58 C148 66 153 82 153 98 L153 126"/>
    </g>`,
};

function frame(inner, stroke) {
  return `<rect x="18" y="18" width="164" height="164" fill="none" stroke="${stroke}" stroke-width="2"/>${inner}`;
}

function corner(w, h, color) {
  return `<path d="M${w} 0 L${w} 120 L${w - 120} 0 Z" fill="${color}"/>`;
}

function labelBlock(sub, title) {
  return `
    <g font-family="Georgia, 'Times New Roman', serif" text-anchor="middle">
      <text x="400" y="870" font-size="22" letter-spacing="2" fill="${GREY}">${esc(sub)}</text>
      <text x="400" y="916" font-size="34" fill="${CHARCOAL}">${esc(title)}</text>
      <text x="400" y="952" font-size="20" letter-spacing="3" fill="${GREY}">DEMO · REEMPLAZAR POR FOTOGRAFÍA</text>
    </g>`;
}

function portrait(sub, title, iconName) {
  const stroke = CHARCOAL;
  const icon = frame(icons[iconName](stroke), stroke);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000" role="img" aria-label="${esc(title)} (imagen de demostración)">
  <rect width="800" height="1000" fill="${STONE}"/>
  <rect x="0" y="0" width="800" height="1000" fill="none" stroke="${SAND}" stroke-width="2"/>
  ${corner(800, 1000, SAND)}
  <g transform="translate(300 300) scale(2)">${icon}</g>
  ${labelBlock(sub, title)}
</svg>\n`;
}

function wide(sub, title, iconName) {
  const stroke = CHARCOAL;
  const icon = frame(icons[iconName](stroke), stroke);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="${esc(title)} (imagen de demostración)">
  <rect width="1600" height="900" fill="${OFFWHITE}"/>
  <rect x="0" y="0" width="1600" height="900" fill="none" stroke="${SAND}" stroke-width="2"/>
  ${corner(1600, 900, SAND)}
  <g transform="translate(640 220) scale(2)">${icon}</g>
  <g font-family="Georgia, 'Times New Roman', serif" text-anchor="middle">
    <text x="800" y="770" font-size="24" letter-spacing="2" fill="${GREY}">${esc(sub)}</text>
    <text x="800" y="826" font-size="42" fill="${CHARCOAL}">${esc(title)}</text>
    <text x="800" y="862" font-size="20" letter-spacing="3" fill="${GREY}">DEMO · REEMPLAZAR POR FOTOGRAFÍA</text>
  </g>
</svg>\n`;
}

const files = [
  ["assets/hero/hero-main.svg", wide("NUEVA TEMPORADA", "Fotografía editorial", "figure")],
  ["assets/categories/cat-mujer.svg", portrait("MUJER", "Colección mujer", "figure")],
  ["assets/categories/cat-hombre.svg", portrait("HOMBRE", "Colección hombre", "figure")],
  ["assets/categories/cat-abrigos.svg", portrait("ABRIGOS", "Abrigos y tapados", "hanger")],
  ["assets/categories/cat-remeras.svg", portrait("REMERAS", "Remeras y básicos", "tee")],
  ["assets/categories/cat-pantalones.svg", portrait("PANTALONES", "Pantalones", "trousers")],
  ["assets/categories/cat-accesorios.svg", portrait("ACCESORIOS", "Accesorios", "bag")],
  ["assets/products/p-camisa-oversize.svg", portrait("CAMISAS", "Camisa Oversize", "hanger")],
  ["assets/products/p-pantalon-sastrero.svg", portrait("PANTALONES", "Pantalón Sastrero", "trousers")],
  ["assets/products/p-remera-essential.svg", portrait("REMERAS", "Remera Essential", "tee")],
  ["assets/products/p-campera-abrigo.svg", portrait("ABRIGOS", "Campera de abrigo", "hanger")],
  ["assets/products/p-vestido-midi.svg", portrait("VESTIDOS", "Vestido Midi", "dress")],
  ["assets/products/p-blazer-entallado.svg", portrait("SACOS", "Blazer entallado", "hanger")],
  ["assets/products/p-bufanda-lana.svg", portrait("ACCESORIOS", "Bufanda de lana", "scarf")],
  ["assets/products/p-jeans-relaxed.svg", portrait("PANTALONES", "Jeans Relaxed", "trousers")],
  ["assets/lookbook/lb-01.svg", portrait("THE LOOKBOOK", "Estilo 01", "figure")],
  ["assets/lookbook/lb-02.svg", portrait("THE LOOKBOOK", "Estilo 02", "figure")],
  ["assets/lookbook/lb-03.svg", portrait("THE LOOKBOOK", "Estilo 03", "figurePair")],
  ["assets/lookbook/lb-04.svg", portrait("THE LOOKBOOK", "Detalle 04", "hanger")],
];

let count = 0;
for (const [relative, content] of files) {
  const target = path.join(ROOT, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
  count += 1;
}
console.log(`Placeholders generados: ${count} archivos en demo-moda/assets/.`);
