#!/usr/bin/env node
/* ALMATE · Demo Moda 2 (PIOLA) · make-art.js
   Genera las ilustraciones de DEMOSTRACIÓN: prendas en estilo "sticker"
   (contorno grueso, colores planos), composiciones, decoraciones y logo.
   NO son fotografías: son recursos propios de ALMATE para que la demo
   funcione sin imágenes de terceros. Reemplazarlas por fotos con licencia
   antes de una entrega comercial (ver GUIA_PERSONALIZACION.md).

   Uso (desde la raíz del repo):  node demo-moda-2/tools/make-art.js
*/
"use strict";
const fs = require("fs");
const path = require("path");

const ASSETS = path.resolve(__dirname, "..", "assets");
const INK = "#15131F";

/* ---------- color ---------- */
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c) => "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const luma = (h) => { const [r, g, b] = rgb(h); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
const shade = (h, f) => hex(rgb(h).map((v) => v * f));
const tint = (h, t) => hex(rgb(h).map((v) => v + (255 - v) * t));
const detail = (f) => (luma(f) < 0.3 ? tint(f, 0.4) : INK);
const rib = (f) => (luma(f) < 0.3 ? tint(f, 0.16) : shade(f, 0.88));

const COLORS = {
  Negro: "#1d1b26", Crudo: "#efe6d6", Blanco: "#fbfaf6", Celeste: "#74acdf", Rosa: "#ff8fb8",
  Amarillo: "#ffc531", Lima: "#c8f560", Lila: "#b8a1ff", Gris: "#a7a5b3", Azul: "#3f5f8f",
  Verde: "#2f7a57", Rojo: "#e8483c",
};
const TONES = { sky: "#74acdf", sun: "#ffc531", pink: "#ff8fb8", lime: "#c8f560", lilac: "#b8a1ff", paper: "#fff6e5" };

const S = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;
let uid = 0;

/* ---------- prendas (lienzo 400x500, fondo transparente) ---------- */
function tee(f, o = {}) {
  const id = "c" + ++uid;
  const body = o.crop
    ? "M150 100 L108 120 L74 180 L108 200 L128 168 L128 335 L272 335 L272 168 L292 200 L326 180 L292 120 L250 100 C232 128 168 128 150 100 Z"
    : "M135 95 L88 118 L50 185 L92 208 L118 170 L118 410 L282 410 L282 170 L308 208 L350 185 L312 118 L265 95 C245 125 155 125 135 95 Z";
  let out = `<clipPath id="${id}"><path d="${body}"/></clipPath><path d="${body}" fill="${f}" ${S}/>`;
  if (o.stripes) {
    out += `<g clip-path="url(#${id})">` + Array.from({ length: 11 }, (_, i) => `<rect x="0" y="${118 + i * 26}" width="400" height="10" fill="${o.stripes}"/>`).join("") + "</g>";
    out += `<path d="${body}" fill="none" ${S}/>`;
  }
  const hy = o.crop ? 102 : 98;
  out += `<path d="M${o.crop ? 154 : 140} ${hy} C${o.crop ? 170 : 160} ${hy + 22} ${o.crop ? 230 : 240} ${hy + 22} ${o.crop ? 246 : 260} ${hy}" fill="none" stroke="${rib(f)}" stroke-width="9" stroke-linecap="round"/>`;
  out += `<path d="M${o.crop ? 154 : 140} ${hy} C${o.crop ? 170 : 160} ${hy + 22} ${o.crop ? 230 : 240} ${hy + 22} ${o.crop ? 246 : 260} ${hy}" fill="none" ${S}/>`;
  if (o.print) out += `<circle cx="200" cy="${o.crop ? 232 : 270}" r="30" fill="${o.print}" ${S}/><path d="M188 ${o.crop ? 232 : 270} L212 ${o.crop ? 232 : 270} M200 ${o.crop ? 220 : 258} L200 ${o.crop ? 244 : 282}" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
  return out;
}

function sweat(f, o = {}) {
  const r = rib(f), d = detail(f);
  const body = "M135 92 L88 108 L50 330 L92 342 L120 190 L120 400 L280 400 L280 190 L308 342 L350 330 L312 108 L265 92 C245 122 155 122 135 92 Z";
  let out = "";
  if (o.hood) out += `<path d="M138 98 C112 18 288 18 262 98 C244 134 156 134 138 98 Z" fill="${shade(f, 0.92)}" ${S}/>`;
  out += `<path d="${body}" fill="${f}" ${S}/>`;
  out += `<rect x="120" y="384" width="160" height="28" rx="4" fill="${r}" ${S}/>`;
  out += `<path d="M62 318 L100 328 L92 346 L54 336 Z M338 318 L300 328 L308 346 L346 336 Z" fill="${r}" ${S}/>`;
  if (o.hood) {
    out += `<path d="M150 102 C165 132 235 132 250 102" fill="none" ${S}/>`;
    out += `<path d="M184 128 L182 190 M216 128 L218 190" stroke="${d}" stroke-width="4" stroke-linecap="round"/>`;
    out += `<path d="M146 296 L254 296 L272 372 L128 372 Z" fill="${shade(f, 0.95)}" ${S}/>`;
  } else {
    out += `<path d="M140 98 C160 128 240 128 260 98" fill="none" stroke="${r}" stroke-width="12" stroke-linecap="round"/><path d="M140 98 C160 128 240 128 260 98" fill="none" ${S}/>`;
    if (o.print) out += `<circle cx="200" cy="260" r="34" fill="${o.print}" ${S}/>`;
  }
  return out;
}

function pants(f, o = {}) {
  const wide = o.wide || 0, d = detail(f);
  let body;
  if (o.cuff) body = "M130 95 L270 95 L284 300 L256 445 L204 445 L200 215 L196 445 L144 445 L116 300 Z";
  else body = `M130 95 L270 95 L${292 + wide} 455 L212 455 L200 215 L188 455 L${108 - wide} 455 Z`;
  let out = `<path d="${body}" fill="${f}" ${S}/>`;
  out += `<rect x="130" y="70" width="140" height="28" rx="6" fill="${o.cuff ? rib(f) : f}" ${S}/>`;
  out += `<path d="M200 98 L200 215" stroke="${d}" stroke-width="3" ${o.stitch ? 'stroke-dasharray="6 5"' : ""} fill="none"/>`;
  if (o.stitch) out += `<path d="M152 98 L152 150 M248 98 L248 150" stroke="${o.stitch}" stroke-width="3" stroke-dasharray="6 5"/>`;
  if (o.cuff) out += `<rect x="144" y="432" width="52" height="24" rx="4" fill="${rib(f)}" ${S}/><rect x="204" y="432" width="52" height="24" rx="4" fill="${rib(f)}" ${S}/><path d="M182 74 L178 112 M218 74 L222 112" stroke="${d}" stroke-width="3.5" stroke-linecap="round"/>`;
  if (o.cargo) {
    const p = shade(f, luma(f) > 0.3 ? 0.9 : 1.25);
    out += `<rect x="${112 - wide}" y="270" width="54" height="68" rx="6" fill="${p}" ${S}/><rect x="${234 + wide}" y="270" width="54" height="68" rx="6" fill="${p}" ${S}/>`;
  }
  return out;
}

function shorts(f, o = {}) {
  const d = detail(f);
  let out = `<path d="M130 120 L270 120 L292 320 L212 320 L200 235 L188 320 L108 320 Z" fill="${f}" ${S}/>`;
  out += `<rect x="130" y="95" width="140" height="28" rx="6" fill="${rib(f)}" ${S}/>`;
  out += `<path d="M200 123 L200 235 M182 100 L178 138 M218 100 L222 138" stroke="${d}" stroke-width="3.5" stroke-linecap="round"/>`;
  if (o.cargo) out += `<rect x="116" y="228" width="50" height="56" rx="6" fill="${shade(f, luma(f) > 0.3 ? 0.9 : 1.25)}" ${S}/><rect x="234" y="228" width="50" height="56" rx="6" fill="${shade(f, luma(f) > 0.3 ? 0.9 : 1.25)}" ${S}/>`;
  return out;
}

function jacket(f, o = {}) {
  const r = rib(f), d = detail(f), accent = o.accent || tint(f, 0.5);
  const body = "M135 100 L85 118 L52 345 L90 356 L118 215 L118 385 L282 385 L282 215 L310 356 L348 345 L315 118 L265 100 L200 130 Z";
  let out = `<path d="M138 106 C114 28 286 28 262 106 C244 140 156 140 138 106 Z" fill="${shade(f, 0.9)}" ${S}/>`;
  out += `<path d="${body}" fill="${f}" ${S}/>`;
  if (o.puffer) {
    out += [175, 222, 269, 316, 363].map((y) => `<path d="M120 ${y} L280 ${y}" stroke="${d}" stroke-width="3" stroke-linecap="round" opacity=".7"/>`).join("");
    out += [140, 210, 280].map((y) => `<path d="M${70 - (y - 140) / 12} ${y} L${108 + (y - 140) / 40} ${y + 10}" stroke="${d}" stroke-width="3" stroke-linecap="round" opacity=".7"/>`).join("");
  } else {
    out += `<path d="M118 215 L118 250 L282 250 L282 215 Z" fill="${accent}" opacity=".85"/><path d="M118 215 L282 215 M118 250 L282 250" stroke="${INK}" stroke-width="3"/>`;
    out += `<path d="M62 330 L90 336 M338 330 L310 336" stroke="${d}" stroke-width="3.5" stroke-linecap="round"/>`;
  }
  out += `<path d="M200 130 L200 385" stroke="${INK}" stroke-width="3.5"/><rect x="194" y="134" width="12" height="20" rx="3" fill="${accent}" ${S}/>`;
  out += `<rect x="118" y="372" width="164" height="20" rx="4" fill="${r}" ${S}/>`;
  return out;
}

function cap(f, o = {}) {
  const lt = rib(f), d = detail(f);
  let out = `<path d="M105 305 C105 185 295 185 295 305 Z" fill="${f}" ${S}/>`;
  out += `<path d="M105 305 L295 305 C338 305 350 345 300 352 L150 352 C98 352 80 318 105 305 Z" fill="${o.visor || lt}" ${S}/>`;
  out += `<path d="M200 196 L200 305 M150 215 L158 305 M250 215 L242 305" stroke="${d}" stroke-width="3" stroke-linecap="round" opacity=".7"/><circle cx="200" cy="194" r="8" fill="${o.visor || lt}" ${S}/>`;
  return out;
}

function tote(f, o = {}) {
  const lt = rib(f);
  let out = `<path d="M150 200 C150 90 250 90 250 200" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M150 200 C150 90 250 90 250 200" fill="none" stroke="${lt === f ? shade(f, 0.8) : lt}" stroke-width="8" stroke-linecap="round"/>`;
  out += `<path d="M105 195 L295 195 L312 448 L88 448 Z" fill="${f}" ${S}/>`;
  if (o.print) out += burst(200, 320, 54, 20, o.print, 0.62, 0.5) + `<circle cx="200" cy="320" r="22" fill="${o.print2 || "#fbfaf6"}" ${S}/>`;
  return out;
}

function fanny(f) {
  const d = detail(f), lt = rib(f);
  let out = `<path d="M60 250 C40 240 60 200 100 215 M340 250 C360 240 340 200 300 215" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M60 250 C40 240 60 200 100 215 M340 250 C360 240 340 200 300 215" fill="none" stroke="${lt}" stroke-width="7" stroke-linecap="round"/>`;
  out += `<rect x="80" y="215" width="240" height="150" rx="70" fill="${f}" ${S}/>`;
  out += `<path d="M118 262 L282 262" stroke="${d}" stroke-width="4" stroke-linecap="round"/><rect x="190" y="252" width="20" height="20" rx="5" fill="${lt}" ${S}/>`;
  out += `<rect x="140" y="292" width="120" height="54" rx="22" fill="${lt}" ${S}/>`;
  return out;
}

function dress(f, o = {}) {
  const d = detail(f), lt = rib(f);
  const body = "M150 90 L110 106 L84 162 L116 178 L138 150 L138 210 L66 470 L334 470 L262 210 L262 150 L284 178 L316 162 L290 106 L250 90 L200 130 Z";
  let out = `<path d="${body}" fill="${f}" ${S}/>`;
  out += `<path d="M150 90 L200 130 L168 112 Z M250 90 L200 130 L232 112 Z" fill="${lt}" ${S}/>`;
  out += `<path d="M138 210 L262 210" stroke="${INK}" stroke-width="3.5"/><path d="M200 130 L200 470" stroke="${d}" stroke-width="3" opacity=".8"/>`;
  out += [168, 220, 290, 360, 430].map((y) => `<circle cx="208" cy="${y}" r="4" fill="${d}"/>`).join("");
  return out;
}

/* ---------- decoraciones ---------- */
function burst(cx, cy, R, n, fill, ratio = 0.72, sw = 1) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n - Math.PI / 2;
    const r = i % 2 ? R * ratio : R;
    pts.push((cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1));
  }
  return `<polygon points="${pts.join(" ")}" fill="${fill}" stroke="${INK}" stroke-width="${3.5 * sw}" stroke-linejoin="round"/>`;
}
const star = (cx, cy, r, fill) => `<path d="M${cx} ${cy - r} C${cx + r * 0.12} ${cy - r * 0.12} ${cx + r * 0.12} ${cy - r * 0.12} ${cx + r} ${cy} C${cx + r * 0.12} ${cy + r * 0.12} ${cx + r * 0.12} ${cy + r * 0.12} ${cx} ${cy + r} C${cx - r * 0.12} ${cy + r * 0.12} ${cx - r * 0.12} ${cy + r * 0.12} ${cx - r} ${cy} C${cx - r * 0.12} ${cy - r * 0.12} ${cx - r * 0.12} ${cy - r * 0.12} ${cx} ${cy - r} Z" fill="${fill}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
const squiggle = (x, y, w, c) => `<path d="M${x} ${y} q${w / 8} -22 ${w / 4} 0 t${w / 4} 0 t${w / 4} 0 t${w / 4} 0" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`;

/* ---------- utilidades de salida ---------- */
const GARMENTS = {
  tee, sweat, pants, shorts, jacket, cap, tote, fanny, dress,
};
const sunFace = (cx, cy, R) =>
  burst(cx, cy, R, 16, TONES.sun, 0.8) +
  `<circle cx="${cx}" cy="${cy}" r="${R * 0.55}" fill="${TONES.sun}" stroke="${INK}" stroke-width="3.5"/>` +
  `<path d="M${cx - R * 0.26} ${cy - R * 0.08} q${R * 0.08} -${R * 0.14} ${R * 0.16} 0 M${cx + R * 0.1} ${cy - R * 0.08} q${R * 0.08} -${R * 0.14} ${R * 0.16} 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>` +
  `<path d="M${cx - R * 0.26} ${cy + R * 0.1} q${R * 0.26} ${R * 0.26} ${R * 0.52} 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;

function svg(w, h, body, title, bg) {
  const rect = bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}"><title>${title}</title>${rect}${body}</svg>\n`;
}

function write(rel, content) {
  const file = path.join(ASSETS, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
}

const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const shadow = '<ellipse cx="200" cy="488" rx="118" ry="8" fill="#15131f" opacity=".14"/>';

function g(kind, color, o, x, y, s, rot) {
  const f = COLORS[color] || color;
  return `<g transform="translate(${x} ${y}) rotate(${rot || 0} 200 250) scale(${s})">${shadow}${GARMENTS[kind](f, o)}</g>`;
}

/* ---------- catálogo: prenda x color (fondo transparente) ---------- */
const PRODUCTS = [
  ["remera-re-piola", "Remera oversize Re Piola", "tee", { print: TONES.sun }, ["Crudo", "Negro", "Celeste", "Rosa"]],
  ["baby-tee-sol", "Baby tee Sol", "tee", { crop: true, print: TONES.sun }, ["Rosa", "Blanco", "Celeste"]],
  ["remera-rayada-barrio", "Remera rayada Barrio", "tee", { stripes: "#fbfaf6" }, ["Azul", "Rojo"]],
  ["buzo-canguro", "Buzo canguro", "sweat", { hood: true }, ["Gris", "Negro", "Lila"]],
  ["buzo-redondo", "Buzo cuello redondo", "sweat", { print: TONES.lime }, ["Celeste", "Verde", "Crudo"]],
  ["jean-wide", "Jean wide leg", "pants", { wide: 16, stitch: "#e9e2d0" }, ["Azul", "Negro"]],
  ["cargo-parche", "Cargo con parches", "pants", { wide: 10, cargo: true }, ["Verde", "Negro"]],
  ["jogger-urbano", "Jogger urbano", "pants", { cuff: true }, ["Gris", "Negro", "Azul"]],
  ["short-cargo", "Short cargo", "shorts", { cargo: true }, ["Crudo", "Verde"]],
  ["campera-rompeviento", "Campera rompeviento", "jacket", { accent: TONES.sun }, ["Celeste", "Negro"]],
  ["puffer-corta", "Puffer corta", "jacket", { puffer: true, accent: TONES.pink }, ["Lila", "Negro"]],
  ["gorra-trucker", "Gorra trucker", "cap", {}, ["Negro", "Crudo", "Celeste"]],
  ["tote-estampada", "Tote estampada", "tote", { print: TONES.pink }, ["Crudo", "Negro"]],
  ["rinonera-street", "Riñonera street", "fanny", {}, ["Lima", "Negro"]],
  ["vestido-camisero", "Vestido camisero", "dress", {}, ["Celeste", "Amarillo"]],
];

PRODUCTS.forEach(([id, label, kind, opts, cols]) => {
  cols.forEach((c) => {
    write(`products/${id}-${slug(c)}.svg`, svg(400, 500, `${shadow}${GARMENTS[kind](COLORS[c], opts)}`, `${label}, color ${c} (ilustración de demostración)`));
  });
});

/* ---------- categorías (transparentes) ---------- */
const CATS = {
  remeras: [["tee", "Celeste", {}, 0, 40, 0.8, -8], ["tee", "Amarillo", { stripes: "#fbfaf6" }, 130, 90, 0.8, 8]],
  buzos: [["sweat", "Lila", { hood: true }, -10, 20, 0.88, -6], ["sweat", "Crudo", {}, 140, 120, 0.78, 8]],
  pantalones: [["pants", "Azul", { wide: 16, stitch: "#e9e2d0" }, -10, 30, 0.8, -6], ["pants", "Verde", { wide: 10, cargo: true }, 150, 90, 0.78, 7]],
  camperas: [["jacket", "Celeste", { accent: TONES.sun }, -5, 30, 0.86, -7], ["jacket", "Rosa", { puffer: true, accent: TONES.lilac }, 150, 110, 0.78, 8]],
  accesorios: [["tote", "Crudo", { print: TONES.pink }, -10, 90, 0.62, -8], ["cap", "Negro", {}, 150, 40, 0.58, 8], ["fanny", "Lima", {}, 130, 270, 0.55, -4]],
};
Object.entries(CATS).forEach(([id, items]) => {
  write(`categories/${id}.svg`, svg(400, 500, items.map((i) => g(...i)).join(""), `Categoría ${id} (ilustración de demostración)`));
});
// ofertas: etiqueta de precio con %
write("categories/ofertas.svg", svg(400, 500,
  `<g transform="rotate(-12 200 250)"><path d="M110 120 L290 120 L330 250 L290 380 L110 380 L70 250 Z" fill="${TONES.pink}" ${S}/><circle cx="130" cy="250" r="16" fill="#fff6e5" ${S}/><circle cx="215" cy="205" r="22" fill="none" stroke="${INK}" stroke-width="10"/><circle cx="265" cy="295" r="22" fill="none" stroke="${INK}" stroke-width="10"/><path d="M285 190 L190 310" stroke="${INK}" stroke-width="10" stroke-linecap="round"/></g>${star(80, 90, 28, TONES.sun)}${star(330, 420, 22, TONES.lime)}`,
  "Categoría ofertas (ilustración de demostración)"));

/* ---------- hero ---------- */
write("hero/hero-main.svg", svg(900, 1100,
  sunFace(450, 360, 300) +
  g("sweat", "Lila", { hood: true }, 110, 250, 1.75, -3) +
  g("cap", "Negro", {}, 600, 90, 0.7, 14) +
  star(120, 160, 46, TONES.lime) + star(790, 700, 34, TONES.pink) + squiggle(90, 1010, 260, INK),
  "Campera con capucha lila y sol sonriente: imagen de campaña de demostración", TONES.sky));
write("hero/hero-a.svg", svg(600, 700,
  g("tee", "Blanco", { crop: true, print: TONES.sun }, 90, 40, 1.15, -4) + g("shorts", "Azul", { cargo: false }, 250, 330, 0.6, 6) + star(80, 600, 30, TONES.lime),
  "Baby tee y short: imagen de demostración", TONES.pink));
write("hero/hero-b.svg", svg(600, 700,
  g("pants", "Negro", { wide: 10, cargo: true }, 60, 120, 1.0, -3) + g("cap", "Crudo", {}, 280, 20, 0.62, 10) + star(520, 560, 32, TONES.pink),
  "Cargo negro y gorra: imagen de demostración", TONES.lime));

/* ---------- lookbook ---------- */
const LB = {
  "lb-01": [800, 1000, TONES.sun, [["sweat", "Celeste", { hood: true }, 0, 20, 1.15, -4], ["pants", "Negro", { cuff: true }, 330, 380, 0.95, 4], ["cap", "Rosa", {}, 40, 650, 0.6, -6]], "Look 1: buzo celeste, jogger negro y gorra rosa"],
  "lb-02": [800, 1000, TONES.pink, [["tee", "Blanco", { crop: true, print: TONES.sun }, 10, 30, 1.1, -5], ["pants", "Azul", { wide: 16, stitch: "#e9e2d0" }, 300, 330, 1.0, 4], ["fanny", "Lima", {}, 40, 640, 0.65, -3]], "Look 2: baby tee, jean wide y riñonera lima"],
  "lb-03": [1200, 800, TONES.sky, [["jacket", "Amarillo", { accent: TONES.pink }, 20, 20, 1.35, -3], ["shorts", "Crudo", { cargo: true }, 480, 90, 1.1, 4], ["tote", "Negro", { print: TONES.sun }, 860, 40, 0.95, 6]], "Look 3: rompeviento, short cargo y tote"],
  "lb-04": [800, 1000, TONES.lime, [["dress", "Celeste", {}, 0, 80, 1.3, -3], ["jacket", "Lila", { puffer: true, accent: TONES.pink }, 330, 40, 0.9, 5], ["cap", "Negro", {}, 400, 650, 0.6, -6]], "Look 4: vestido camisero y puffer"],
  "lb-05": [1200, 800, TONES.lilac, [["tee", "Azul", { stripes: "#fbfaf6" }, 20, 40, 1.1, -4], ["pants", "Verde", { wide: 10, cargo: true }, 460, 20, 1.15, 3], ["tote", "Crudo", { print: TONES.pink }, 880, 140, 0.8, 6]], "Look 5: remera rayada, cargo y tote"],
};
Object.entries(LB).forEach(([id, [w, h, bg, items, title]]) => {
  const deco = star(w - 90, 100, 34, TONES.paper) + squiggle(60, h - 70, 240, INK);
  write(`lookbook/${id}.svg`, svg(w, h, items.map((i) => g(...i)).join("") + deco, title + " (ilustración de demostración)", bg));
});

/* ---------- sobre nosotros: perchero ---------- */
const rail = `<rect x="40" y="170" width="720" height="10" rx="5" fill="${INK}"/>` + [150, 330, 510, 680].map((x) => `<path d="M${x} 180 L${x} 214" stroke="${INK}" stroke-width="5"/>`).join("");
write("lookbook/about.svg", svg(800, 1000,
  rail + g("sweat", "Lila", { hood: true }, -10, 130, 0.56, 0) + g("jacket", "Amarillo", { accent: TONES.sky }, 170, 130, 0.56, 0) + g("dress", "Rosa", {}, 340, 150, 0.56, 0) + g("tee", "Celeste", {}, 520, 130, 0.56, 0) +
  sunFace(640, 760, 120) + star(150, 800, 40, TONES.lime) + squiggle(120, 920, 380, INK),
  "Perchero con prendas de colores: imagen de demostración", TONES.paper));

/* ---------- deco y marca ---------- */
write("deco/sun.svg", svg(200, 200, sunFace(100, 100, 92), "Sol sonriente"));
write("deco/star.svg", svg(100, 100, star(50, 50, 44, TONES.pink), "Destello"));
write("deco/squiggle.svg", svg(300, 60, squiggle(10, 30, 280, INK), "Línea ondulada"));
write("logo/mark.svg", svg(64, 64, sunFace(32, 32, 29), "Isotipo de la marca de demostración"));
write("logo/favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${sunFace(32, 32, 29)}</svg>\n`);

const count = (dir) => fs.readdirSync(path.join(ASSETS, dir)).filter((f) => f.endsWith(".svg")).length;
console.log(`Ilustraciones generadas en demo-moda-2/assets: products ${count("products")}, categories ${count("categories")}, hero ${count("hero")}, lookbook ${count("lookbook")}, deco ${count("deco")}, logo ${count("logo")}.`);
