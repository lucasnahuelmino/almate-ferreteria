/* ==========================================================================
   ALMATE · Demo Moda 2 (PIOLA) · products.moda.js
   Catálogo de DEMOSTRACIÓN y modelo de datos de indumentaria (talles, colores
   y variantes). Reemplazá estos productos por el catálogo real del local.
   No inventa stock numérico: la disponibilidad es una indicación configurable.

   Modelo de un producto:
     id, name, category, gender (mujer | hombre | unisex), price, oldPrice?,
     description, tags[], tone (sky|sun|pink|lime|lilac|paper: color de fondo
     de la tarjeta), colors[{name,value}], sizes[], unavailable["Color|Talle"],
     images{ [color]: ruta } (foto por color), image/imageAlt (la principal).
   ========================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ModaProducts = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CATEGORY_LABELS = {
    remeras: "Remeras",
    buzos: "Buzos",
    pantalones: "Pantalones",
    shorts: "Shorts",
    camperas: "Camperas",
    vestidos: "Vestidos",
    accesorios: "Accesorios",
  };

  const GENDERS = [
    { id: "mujer", name: "Mujer" },
    { id: "hombre", name: "Hombre" },
    { id: "unisex", name: "Unisex" },
  ];

  const PALETTE = {
    Negro: "#1d1b26", Crudo: "#efe6d6", Blanco: "#fbfaf6", Celeste: "#74acdf", Rosa: "#ff8fb8",
    Amarillo: "#ffc531", Lima: "#c8f560", Lila: "#b8a1ff", Gris: "#a7a5b3", Azul: "#3f5f8f",
    Verde: "#2f7a57", Rojo: "#e8483c",
  };

  const slug = (value) => String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  /* Arma un producto completo a partir de una ficha compacta. */
  function make(spec) {
    const colors = spec.colors.map((name) => ({ name, value: PALETTE[name] }));
    const images = {};
    spec.colors.forEach((name) => { images[name] = `assets/products/${spec.id}-${slug(name)}.svg`; });
    return {
      id: spec.id,
      name: spec.name,
      category: spec.category,
      gender: spec.gender,
      price: spec.price,
      oldPrice: spec.oldPrice || 0,
      description: spec.description,
      tags: spec.tags || [],
      tone: spec.tone,
      colors,
      sizes: spec.sizes,
      unavailable: spec.unavailable || [],
      images,
      image: images[spec.colors[0]],
      imageAlt: `Ilustración de demostración: ${spec.name}`,
    };
  }

  const LETTERS = ["S", "M", "L", "XL"];
  const NUMERIC = ["38", "40", "42", "44", "46"];

  /* Productos de demostración. Los precios son de EJEMPLO: reemplazarlos. */
  const products = [
    make({ id: "remera-re-piola", name: "Remera Re Piola", category: "remeras", gender: "unisex", price: 18900, tone: "lilac", tags: ["new", "best-seller", "featured"], colors: ["Crudo", "Negro", "Celeste", "Rosa"], sizes: LETTERS, unavailable: ["Celeste|S", "Rosa|XL"], description: "Remera oversize con estampa de sol. Calce suelto, para usar con todo." }),
    make({ id: "baby-tee-sol", name: "Baby Tee Sol", category: "remeras", gender: "mujer", price: 16500, tone: "lime", tags: ["new"], colors: ["Rosa", "Blanco", "Celeste"], sizes: ["S", "M", "L"], unavailable: ["Blanco|L"], description: "Remera corta y ajustada con el sol de la casa en el pecho." }),
    make({ id: "remera-rayada-barrio", name: "Remera Rayada Barrio", category: "remeras", gender: "hombre", price: 21500, tone: "sun", tags: ["featured"], colors: ["Azul", "Rojo"], sizes: LETTERS, unavailable: ["Rojo|S"], description: "Rayas de las de siempre, en un calce cómodo para el día a día." }),
    make({ id: "buzo-canguro", name: "Buzo Canguro", category: "buzos", gender: "unisex", price: 52900, oldPrice: 59900, tone: "sun", tags: ["sale", "featured", "best-seller"], colors: ["Gris", "Negro", "Lila"], sizes: LETTERS, unavailable: ["Lila|S", "Negro|XL"], description: "Buzo con capucha y bolsillo canguro. El que te llevás para todos lados." }),
    make({ id: "buzo-redondo", name: "Buzo Cuello Redondo", category: "buzos", gender: "unisex", price: 46500, tone: "pink", tags: ["new"], colors: ["Celeste", "Verde", "Crudo"], sizes: LETTERS, unavailable: ["Verde|XL"], description: "Buzo clásico de cuello redondo con detalle estampado. Fácil de combinar." }),
    make({ id: "jean-wide", name: "Jean Wide Leg", category: "pantalones", gender: "mujer", price: 64900, oldPrice: 72900, tone: "lime", tags: ["sale"], colors: ["Azul", "Negro"], sizes: NUMERIC, unavailable: ["Azul|46", "Negro|38"], description: "Jean de pierna ancha y tiro alto, con costuras a contraste." }),
    make({ id: "cargo-parche", name: "Cargo con Parches", category: "pantalones", gender: "hombre", price: 61500, tone: "lilac", tags: ["limited"], colors: ["Verde", "Negro"], sizes: NUMERIC, unavailable: ["Verde|38"], description: "Pantalón cargo de pierna recta con bolsillos grandes a los costados." }),
    make({ id: "jogger-urbano", name: "Jogger Urbano", category: "pantalones", gender: "unisex", price: 44900, tone: "sky", tags: ["best-seller"], colors: ["Gris", "Negro", "Azul"], sizes: LETTERS, unavailable: ["Gris|S"], description: "Jogger con puños elásticos y cintura cómoda. Para estar bien todo el día." }),
    make({ id: "short-cargo", name: "Short Cargo", category: "shorts", gender: "hombre", price: 32900, tone: "pink", tags: ["new"], colors: ["Crudo", "Verde"], sizes: LETTERS, unavailable: ["Crudo|XL"], description: "Short cargo para el verano, con bolsillos laterales." }),
    make({ id: "campera-rompeviento", name: "Campera Rompeviento", category: "camperas", gender: "unisex", price: 98900, tone: "lime", tags: ["exclusive", "featured"], colors: ["Celeste", "Negro"], sizes: LETTERS, unavailable: ["Celeste|S", "Negro|XL"], description: "Campera liviana con capucha y paño de color. Ideal para las noches de verano." }),
    make({ id: "puffer-corta", name: "Puffer Corta", category: "camperas", gender: "mujer", price: 119000, oldPrice: 139000, tone: "sun", tags: ["sale", "limited"], colors: ["Lila", "Negro"], sizes: ["S", "M", "L"], unavailable: ["Lila|L"], description: "Puffer corta con gajos horizontales y capucha. Abriga sin hacerte bulto." }),
    make({ id: "gorra-trucker", name: "Gorra Trucker", category: "accesorios", gender: "unisex", price: 14900, tone: "pink", tags: ["best-seller"], colors: ["Negro", "Crudo", "Celeste"], sizes: ["Único"], unavailable: ["Celeste|Único"], description: "Gorra con visera curva y cierre regulable. Talle único." }),
    make({ id: "tote-estampada", name: "Tote Estampada", category: "accesorios", gender: "unisex", price: 19900, tone: "sky", tags: ["new"], colors: ["Crudo", "Negro"], sizes: ["Único"], description: "Tote grande para llevar de todo, con el sol estampado al frente." }),
    make({ id: "rinonera-street", name: "Riñonera Street", category: "accesorios", gender: "unisex", price: 23900, tone: "lilac", tags: ["limited"], colors: ["Lima", "Negro"], sizes: ["Único"], description: "Riñonera con dos bolsillos con cierre. Se usa cruzada o en la cintura." }),
    make({ id: "vestido-camisero", name: "Vestido Camisero", category: "vestidos", gender: "mujer", price: 69900, tone: "pink", tags: ["new", "featured"], colors: ["Celeste", "Amarillo"], sizes: ["XS", "S", "M", "L"], unavailable: ["Amarillo|XS"], description: "Vestido midi abotonado al frente, con cuello camisero. Va con zapatillas o con sandalias." }),
  ];

  /* ---------- Variantes y disponibilidad ---------- */
  function variantKey(color, size) {
    return color + "|" + size;
  }

  function isVariantAvailable(product, color, size) {
    if (!product) return false;
    if (!product.colors.some((item) => item.name === color)) return false;
    if (!product.sizes.includes(size)) return false;
    if (product.unavailable && product.unavailable.includes(variantKey(color, size))) return false;
    return true;
  }

  function availableSizes(product, color) {
    if (!product) return [];
    return product.sizes.filter((size) => isVariantAvailable(product, color, size));
  }

  function availableColors(product, size) {
    if (!product) return [];
    return product.colors.filter((item) => isVariantAvailable(product, item.name, size));
  }

  /* Imagen del producto para un color (cae en la principal si no existe). */
  function imageFor(product, color) {
    if (!product) return "";
    return (product.images && color && product.images[color]) || product.image || "";
  }

  const isOnSale = (product) => Boolean(product.oldPrice) || (product.tags || []).includes("sale");
  const isFeatured = (product) => (product.tags || []).includes("featured");
  const isNew = (product) => (product.tags || []).includes("new");

  /* Etiqueta que se muestra sobre la tarjeta (solo una, por prioridad). */
  const BADGE_ORDER = ["sale", "limited", "exclusive", "best-seller", "new"];
  function badgeTag(product) {
    return BADGE_ORDER.find((tag) => (product.tags || []).includes(tag)) || "";
  }

  function categoryLabel(category) {
    return CATEGORY_LABELS[category] || category;
  }

  return {
    products,
    categories: CATEGORY_LABELS,
    genders: GENDERS,
    categoryLabel,
    variantKey,
    isVariantAvailable,
    availableSizes,
    availableColors,
    imageFor,
    badgeTag,
    isOnSale,
    isFeatured,
    isNew,
  };
});
