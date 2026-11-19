#!/usr/bin/env node
/* ALMATE · Demo Moda 3 (PICHONES) · make-art.js
   Genera las ilustraciones de DEMOSTRACIÓN: prendas infantiles en estilo
   "crayón" (contorno fino, colores suaves), composiciones, decoraciones,
   guirnaldas y el isotipo (pollito). NO son fotografías: son recursos propios
   de ALMATE para que la demo funcione sin imágenes de terceros. Reemplazarlas
   por fotos con licencia antes de una entrega comercial (ver la guía).

   Uso (desde la raíz del repo):  node demo-moda-3/tools/make-art.js
*/
"use strict";
const fs = require("fs");
const path = require("path");

const ASSETS = path.resolve(__dirname, "..", "assets");
const INK = "#403A52";

/* ---------- color ---------- */
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c) => "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const luma = (h) => { const [r, g, b] = rgb(h); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
const shade = (h, f) => hex(rgb(h).map((v) => v * f));
const tint = (h, t) => hex(rgb(h).map((v) => v + (255 - v) * t));
const detail = (f) => (luma(f) < 0.3 ? tint(f, 0.4) : INK);
const rib = (f) => (luma(f) < 0.3 ? tint(f, 0.16) : shade(f, 0.88));

const COLORS = {
  Negro: "#33303f", Crudo: "#f4ead9", Blanco: "#fcfaf5", Celeste: "#8ecbf5", Rosa: "#ff9eb5",
  Amarillo: "#ffd166", Lima: "#b7e08a", Lila: "#c7b6f5", Gris: "#b0adba", Azul: "#5a6f9e",
  Verde: "#7fbf8a", Coral: "#ff8f78", Menta: "#a7e0cf",
};
const TONES = { sky: "#8ecbf5", sun: "#ffd166", pink: "#ff9eb5", lime: "#b7e08a", lilac: "#c7b6f5", paper: "#fbf4e8" };

const S = `stroke="${INK}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"`;
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
  if (o.heart) out += heart(200, o.crop ? 232 : 268, 30, o.heart);
  if (o.print) out += `<circle cx="200" cy="${o.crop ? 232 : 268}" r="30" fill="${o.print}" ${S}/><path d="M188 ${o.crop ? 232 : 268} L212 ${o.crop ? 232 : 268} M200 ${o.crop ? 220 : 256} L200 ${o.crop ? 244 : 280}" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`;
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
    if (o.heart) out += heart(200, 260, 34, o.heart);
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
  if (o.cuff) out += `<rect x="144" y="432" width="52" height="24" rx="4" fill="${rib(f)}" ${S}/><rect x="204" y="432" width="52" height="24" rx="4" fill="${rib(f)}" ${S}/><path d="M182 74 L178 112 M218 74 L222 112" stroke="${d}" stroke-width="3.2" stroke-linecap="round"/>`;
  if (o.cargo) {
    const p = shade(f, luma(f) > 0.3 ? 0.9 : 1.25);
    out += `<rect x="${112 - wide}" y="270" width="54" height="68" rx="6" fill="${p}" ${S}/><rect x="${234 + wide}" y="270" width="54" height="68" rx="6" fill="${p}" ${S}/>`;
  }
  return out;
}

function legging(f, o = {}) {
  const d = detail(f), r = rib(f);
  let out = `<path d="M138 92 L262 92 L274 470 L200 470 L200 208 L126 470 Z" fill="${f}" ${S}/>`;
  out += `<rect x="138" y="68" width="124" height="26" rx="8" fill="${r}" ${S}/>`;
  out += `<path d="M200 94 L200 208" stroke="${d}" stroke-width="3" fill="none"/>`;
  if (o.heart) out += heart(160, 300, 22, o.heart);
  return out;
}

function shorts(f, o = {}) {
  const d = detail(f);
  let out = `<path d="M130 120 L270 120 L292 320 L212 320 L200 235 L188 320 L108 320 Z" fill="${f}" ${S}/>`;
  out += `<rect x="130" y="95" width="140" height="28" rx="6" fill="${rib(f)}" ${S}/>`;
  out += `<path d="M200 123 L200 235 M182 100 L178 138 M218 100 L222 138" stroke="${d}" stroke-width="3.2" stroke-linecap="round"/>`;
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
  } else {
    out += `<path d="M118 215 L118 250 L282 250 L282 215 Z" fill="${accent}" opacity=".85"/><path d="M118 215 L282 215 M118 250 L282 250" stroke="${INK}" stroke-width="3"/>`;
    out += `<path d="M62 330 L90 336 M338 330 L310 336" stroke="${d}" stroke-width="3.2" stroke-linecap="round"/>`;
  }
  out += `<path d="M200 130 L200 385" stroke="${INK}" stroke-width="3.2"/><rect x="194" y="134" width="12" height="20" rx="3" fill="${accent}" ${S}/>`;
  out += `<rect x="118" y="372" width="164" height="20" rx="4" fill="${r}" ${S}/>`;
  return out;
}

function onesie(f, o = {}) {
  const r = rib(f), d = detail(f);
  let out = `<path d="M138 92 L200 60 L262 92 L262 172 L300 300 L284 352 L218 352 L200 300 L182 352 L116 352 L100 300 L138 172 Z" fill="${f}" ${S}/>`;
  out += `<path d="M158 92 C180 114 220 114 242 92" fill="none" ${S}/>`;
  out += `<ellipse cx="204" cy="360" rx="36" ry="15" fill="${r}" ${S}/><ellipse cx="156" cy="360" rx="36" ry="15" fill="${r}" ${S}/>`;
  out += `<path d="M200 200 L200 292" stroke="${d}" stroke-width="3" stroke-dasharray="5 5"/>`;
  if (o.heart) out += heart(150, 130, 20, o.heart);
  return out;
}

function cap(f, o = {}) {
  const lt = rib(f), d = detail(f);
  let out = `<path d="M105 305 C105 185 295 185 295 305 Z" fill="${f}" ${S}/>`;
  out += `<path d="M105 305 L295 305 C338 305 350 345 300 352 L150 352 C98 352 80 318 105 305 Z" fill="${o.visor || lt}" ${S}/>`;
  out += `<path d="M200 196 L200 305 M150 215 L158 305 M250 215 L242 305" stroke="${d}" stroke-width="3" stroke-linecap="round" opacity=".7"/><circle cx="200" cy="194" r="8" fill="${o.visor || lt}" ${S}/>`;
  return out;
}

function backpack(f, o = {}) {
  const r = rib(f), d = detail(f);
  let out = `<path d="M150 96 C150 72 250 72 250 96" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/><path d="M150 96 C150 72 250 72 250 96" fill="none" stroke="${r}" stroke-width="8" stroke-linecap="round"/>`;
  out += `<rect x="120" y="148" width="160" height="212" rx="36" fill="${f}" ${S}/>`;
  out += `<rect x="140" y="196" width="120" height="112" rx="20" fill="${r}" ${S}/>`;
  out += `<path d="M180 246 L220 246" stroke="${d}" stroke-width="4" stroke-linecap="round"/>`;
  if (o.heart) out += heart(200, 168, 18, o.heart);
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
  out += `<path d="M138 210 L262 210" stroke="${INK}" stroke-width="3.2"/><path d="M200 130 L200 470" stroke="${d}" stroke-width="3" opacity=".8"/>`;
  out += [168, 220, 290, 360, 430].map((y) => `<circle cx="208" cy="${y}" r="4" fill="${d}"/>`).join("");
  if (o.heart) out += heart(120, 300, 22, o.heart);
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
  return `<polygon points="${pts.join(" ")}" fill="${fill}" stroke="${INK}" stroke-width="${3.2 * sw}" stroke-linejoin="round"/>`;
}
const star = (cx, cy, r, fill) => `<path d="M${cx} ${cy - r} C${cx + r * 0.12} ${cy - r * 0.12} ${cx + r * 0.12} ${cy - r * 0.12} ${cx + r} ${cy} C${cx + r * 0.12} ${cy + r * 0.12} ${cx + r * 0.12} ${cy + r * 0.12} ${cx} ${cy + r} C${cx - r * 0.12} ${cy + r * 0.12} ${cx - r * 0.12} ${cy + r * 0.12} ${cx - r} ${cy} C${cx - r * 0.12} ${cy - r * 0.12} ${cx - r * 0.12} ${cy - r * 0.12} ${cx} ${cy - r} Z" fill="${fill}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
const squiggle = (x, y, w, c) => `<path d="M${x} ${y} q${w / 8} -22 ${w / 4} 0 t${w / 4} 0 t${w / 4} 0 t${w / 4} 0" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`;
const heart = (cx, cy, r, fill) => `<path d="M${cx} ${cy + r * 0.9} C${cx - r} ${cy + r * 0.15} ${cx - r} ${cy - r * 0.55} ${cx} ${cy - r * 0.4} C${cx + r} ${cy - r * 0.55} ${cx + r} ${cy + r * 0.15} ${cx} ${cy + r * 0.9} Z" fill="${fill}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
const cloud = (cx, cy, w, fill) => `<g fill="${fill}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"><circle cx="${cx - w * 0.3}" cy="${cy}" r="${w * 0.24}"/><circle cx="${cx}" cy="${cy - w * 0.14}" r="${w * 0.28}"/><circle cx="${cx + w * 0.3}" cy="${cy}" r="${w * 0.24}"/><rect x="${cx - w * 0.52}" y="${cy}" width="${w * 1.04}" height="${w * 0.32}" rx="${w * 0.16}"/></g>`;
const rainbow = (cx, cy, r, colors) => colors.map((c, i) => `<path d="M${cx - (r - i * 16)} ${cy} A${r - i * 16} ${r - i * 16} 0 0 1 ${cx + (r - i * 16)} ${cy}" fill="none" stroke="${c}" stroke-width="14" stroke-linecap="round"/>`).join("");
const chick = (cx, cy, r) => `<g stroke="${INK}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${TONES.sun}"/><circle cx="${cx - r * 0.34}" cy="${cy - r * 0.12}" r="${r * 0.09}" fill="${INK}" stroke="none"/><circle cx="${cx + r * 0.34}" cy="${cy - r * 0.12}" r="${r * 0.09}" fill="${INK}" stroke="none"/><path d="M${cx - r * 0.12} ${cy + r * 0.3} L${cx + r * 0.12} ${cy + r * 0.3} L${cx} ${cy + r * 0.46} Z" fill="${TONES.pink}"/><path d="M${cx - r * 0.52} ${cy + r * 0.12} L${cx - r * 0.72} ${cy + r * 0.3} M${cx + r * 0.52} ${cy + r * 0.12} L${cx + r * 0.72} ${cy + r * 0.3}" fill="none"/><path d="M${cx - r * 0.2} ${cy + r} L${cx - r * 0.18} ${cy + r * 1.15} M${cx + r * 0.2} ${cy + r} L${cx + r * 0.18} ${cy + r * 1.15}" fill="none"/></g>`;

/* ---------- utilidades de salida ---------- */
const GARMENTS = { tee, sweat, pants, shorts, jacket, cap, backpack, tote, fanny, dress, legging, onesie };

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
const shadow = '<ellipse cx="200" cy="488" rx="118" ry="8" fill="#403a52" opacity=".12"/>';

function g(kind, color, o, x, y, s, rot) {
  const f = COLORS[color] || color;
  return `<g transform="translate(${x} ${y}) rotate(${rot || 0} 200 250) scale(${s})">${shadow}${GARMENTS[kind](f, o)}</g>`;
}

/* ---------- catálogo: prenda x color (fondo transparente) ---------- */
const PRODUCTS = [
  ["remera-dinosaurio", "Remera Dinosaurio", "tee", { print: TONES.lime }, ["Crudo", "Celeste", "Verde"]],
  ["remera-arcoiris", "Remera Arcoíris", "tee", { heart: TONES.pink }, ["Rosa", "Blanco"]],
  ["chomba-jardin", "Chomba Jardín", "tee", { print: TONES.sky }, ["Celeste", "Blanco"]],
  ["buzo-canguro", "Buzo Canguro", "sweat", { hood: true }, ["Gris", "Lila", "Negro"]],
  ["buzo-redondo", "Buzo Cuello Redondo", "sweat", { heart: TONES.sun }, ["Celeste", "Rosa", "Crudo"]],
  ["jean-elasticado", "Jean Elástico", "pants", { stitch: "#f4ead9" }, ["Azul", "Negro"]],
  ["jogger-nino", "Jogger Niño", "pants", { cuff: true }, ["Gris", "Negro"]],
  ["calza-estampada", "Calza Estampada", "legging", { heart: TONES.pink }, ["Rosa", "Lila"]],
  ["calza-escuela", "Calza Escuela", "legging", {}, ["Negro", "Azul"]],
  ["campera-abrigo", "Campera de Abrigo", "jacket", { accent: TONES.pink }, ["Amarillo", "Negro"]],
  ["campera-rompeviento", "Campera Rompeviento", "jacket", { accent: TONES.sun }, ["Celeste", "Amarillo"]],
  ["vestido-verano", "Vestido de Verano", "dress", { heart: TONES.lime }, ["Amarillo", "Celeste"]],
  ["enterito-bebe", "Enterito Bebé", "onesie", { heart: TONES.sky }, ["Crudo", "Celeste"]],
  ["gorra-pibe", "Gorra Pibe", "cap", {}, ["Negro", "Crudo", "Celeste"]],
  ["mochila-jardin", "Mochila Jardín", "backpack", { heart: TONES.pink }, ["Lila", "Celeste"]],
];

PRODUCTS.forEach(([id, label, kind, opts, cols]) => {
  cols.forEach((c) => {
    write(`products/${id}-${slug(c)}.svg`, svg(400, 500, `${shadow}${GARMENTS[kind](COLORS[c], opts)}`, `${label}, color ${c} (ilustración de demostración)`));
  });
});

/* ---------- categorías (transparentes) ---------- */
const CATS = {
  remeras: [["tee", "Celeste", {}, 0, 40, 0.8, -8], ["tee", "Amarillo", { heart: TONES.pink }, 130, 90, 0.8, 8]],
  buzos: [["sweat", "Lila", { hood: true }, -10, 20, 0.88, -6], ["sweat", "Crudo", {}, 140, 120, 0.78, 8]],
  pantalones: [["pants", "Azul", { stitch: "#f4ead9" }, -10, 30, 0.8, -6], ["legging", "Rosa", { heart: TONES.sun }, 150, 90, 0.78, 7]],
  camperas: [["jacket", "Celeste", { accent: TONES.sun }, -5, 30, 0.86, -7], ["jacket", "Rosa", { puffer: true, accent: TONES.lilac }, 150, 110, 0.78, 8]],
  vestidos: [["dress", "Amarillo", { heart: TONES.pink }, -10, 40, 0.86, -6], ["dress", "Celeste", {}, 150, 110, 0.78, 7]],
  accesorios: [["backpack", "Lila", { heart: TONES.pink }, -10, 90, 0.62, -8], ["cap", "Negro", {}, 150, 40, 0.58, 8], ["tote", "Crudo", { print: TONES.pink }, 130, 270, 0.55, -4]],
};
Object.entries(CATS).forEach(([id, items]) => {
  write(`categories/${id}.svg`, svg(400, 500, items.map((i) => g(...i)).join(""), `Categoría ${id} (ilustración de demostración)`));
});
// ofertas: etiqueta de precio con %
write("categories/ofertas.svg", svg(400, 500,
  `<g transform="rotate(-12 200 250)"><path d="M110 120 L290 120 L330 250 L290 380 L110 380 L70 250 Z" fill="${TONES.pink}" ${S}/><circle cx="130" cy="250" r="16" fill="#fbf4e8" ${S}/><circle cx="215" cy="205" r="22" fill="none" stroke="${INK}" stroke-width="10"/><circle cx="265" cy="295" r="22" fill="none" stroke="${INK}" stroke-width="10"/><path d="M285 190 L190 310" stroke="${INK}" stroke-width="10" stroke-linecap="round"/></g>${star(80, 90, 28, TONES.sun)}${heart(330, 420, 26, TONES.lime)}`,
  "Categoría ofertas (ilustración de demostración)"));

/* ---------- hero ---------- */
write("hero/hero-main.svg", svg(900, 1100,
  chick(450, 320, 210) +
  rainbow(450, 430, 260, [TONES.pink, TONES.sun, TONES.lime, TONES.sky]) +
  cloud(170, 180, 120, "#fcfaf5") + cloud(730, 240, 90, "#fcfaf5") +
  star(120, 620, 40, TONES.lime) + heart(790, 700, 40, TONES.pink) +
  squiggle(90, 1010, 260, INK),
  "Pollito sonriente con arcoíris: imagen de campaña de demostración", TONES.sky));
write("hero/hero-a.svg", svg(600, 700,
  g("tee", "Blanco", { heart: TONES.pink }, 90, 40, 1.15, -4) + g("legging", "Lila", {}, 250, 330, 0.6, 6) + star(80, 600, 30, TONES.lime),
  "Remera y calza: imagen de demostración", TONES.pink));
write("hero/hero-b.svg", svg(600, 700,
  g("onesie", "Celeste", { heart: TONES.sun }, 60, 120, 1.0, -3) + g("cap", "Crudo", {}, 280, 20, 0.62, 10) + heart(520, 560, 32, TONES.pink),
  "Enterito y gorra: imagen de demostración", TONES.lime));

/* ---------- lookbook ---------- */
const LB = {
  "lb-01": [800, 1000, TONES.sun, [["sweat", "Celeste", { hood: true }, 0, 20, 1.15, -4], ["pants", "Negro", { cuff: true }, 330, 380, 0.95, 4], ["cap", "Rosa", {}, 40, 650, 0.6, -6]], "Look 1: buzo celeste, jogger negro y gorra rosa"],
  "lb-02": [800, 1000, TONES.pink, [["tee", "Blanco", { heart: TONES.pink }, 10, 30, 1.1, -5], ["pants", "Azul", { stitch: "#f4ead9" }, 300, 330, 1.0, 4], ["backpack", "Lila", { heart: TONES.pink }, 40, 640, 0.65, -3]], "Look 2: remera, jean y mochila"],
  "lb-03": [1200, 800, TONES.sky, [["jacket", "Amarillo", { accent: TONES.pink }, 20, 20, 1.35, -3], ["shorts", "Crudo", { cargo: true }, 480, 90, 1.1, 4], ["backpack", "Lila", {}, 860, 40, 0.95, 6]], "Look 3: rompeviento, short y mochila"],
  "lb-04": [800, 1000, TONES.lime, [["dress", "Celeste", {}, 0, 80, 1.3, -3], ["jacket", "Lila", { puffer: true, accent: TONES.pink }, 330, 40, 0.9, 5], ["cap", "Negro", {}, 400, 650, 0.6, -6]], "Look 4: vestido y puffer"],
  "lb-05": [1200, 800, TONES.lilac, [["tee", "Azul", { heart: TONES.pink }, 20, 40, 1.1, -4], ["pants", "Verde", { stitch: "#f4ead9" }, 460, 20, 1.15, 3], ["cap", "Crudo", {}, 880, 140, 0.8, 6]], "Look 5: remera, cargo y gorra"],
};
Object.entries(LB).forEach(([id, [w, h, bg, items, title]]) => {
  const deco = heart(w - 90, 100, 34, TONES.paper) + squiggle(60, h - 70, 240, INK);
  write(`lookbook/${id}.svg`, svg(w, h, items.map((i) => g(...i)).join("") + deco, title + " (ilustración de demostración)", bg));
});

/* ---------- sobre nosotros: perchero ---------- */
const rail = `<rect x="40" y="170" width="720" height="10" rx="5" fill="${INK}"/>` + [150, 330, 510, 680].map((x) => `<path d="M${x} 180 L${x} 214" stroke="${INK}" stroke-width="5"/>`).join("");
write("lookbook/about.svg", svg(800, 1000,
  rail + g("sweat", "Lila", { hood: true }, -10, 130, 0.56, 0) + g("jacket", "Amarillo", { accent: TONES.sky }, 170, 130, 0.56, 0) + g("dress", "Rosa", {}, 340, 150, 0.56, 0) + g("tee", "Celeste", {}, 520, 130, 0.56, 0) +
  chick(640, 760, 110) + star(150, 800, 40, TONES.lime) + squiggle(120, 920, 380, INK),
  "Perchero con prendas de colores: imagen de demostración", TONES.paper));

/* ---------- deco y marca ---------- */
write("deco/chick.svg", svg(200, 200, chick(100, 100, 90), "Pollito sonriente"));
write("deco/star.svg", svg(100, 100, star(50, 50, 44, TONES.pink), "Destello"));
write("deco/heart.svg", svg(100, 100, heart(50, 50, 44, TONES.lime), "Corazón"));
write("deco/cloud.svg", svg(200, 120, cloud(100, 60, 90, "#fcfaf5"), "Nube"));
write("deco/rainbow.svg", svg(300, 160, rainbow(150, 150, 140, [TONES.pink, TONES.sun, TONES.lime, TONES.sky]), "Arcoíris"));
write("deco/squiggle.svg", svg(300, 60, squiggle(10, 30, 280, INK), "Línea ondulada"));
write("logo/mark.svg", svg(64, 64, chick(32, 32, 29), "Isotipo de la marca de demostración"));
write("logo/favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${chick(32, 32, 29)}</svg>\n`);

const count = (dir) => fs.readdirSync(path.join(ASSETS, dir)).filter((f) => f.endsWith(".svg")).length;
console.log(`Ilustraciones generadas en demo-moda-3/assets: products ${count("products")}, categories ${count("categories")}, hero ${count("hero")}, lookbook ${count("lookbook")}, deco ${count("deco")}, logo ${count("logo")}.`);
