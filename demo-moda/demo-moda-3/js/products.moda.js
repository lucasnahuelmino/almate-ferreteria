/* ==========================================================================
   ALMATE · Demo Moda 3 (PICHONES) · products.moda.js
   Catálogo de DEMOSTRACIÓN y modelo de datos de indumentaria infantil
   (talles, colores y variantes). Reemplazá estos productos por el catálogo
   real del local. No inventa stock numérico: la disponibilidad es una
   indicación configurable.

   Modelo de un producto:
     id, name, category, gender (nena | nene | unisex), price, oldPrice?,
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
    calzas: "Calzas",
    camperas: "Camperas",
    vestidos: "Vestidos",
    enteritos: "Enteritos",
    accesorios: "Accesorios",
  };

  const GENDERS = [
    { id: "nena", name: "Nena" },
    { id: "nene", name: "Nene" },
    { id: "unisex", name: "Unisex" },
  ];

  const PALETTE = {
    Negro: "#33303f", Crudo: "#f4ead9", Blanco: "#fcfaf5", Celeste: "#8ecbf5", Rosa: "#ff9eb5",
    Amarillo: "#ffd166", Lima: "#b7e08a", Lila: "#c7b6f5", Gris: "#b0adba", Azul: "#5a6f9e",
    Verde: "#7fbf8a", Coral: "#ff8f78", Menta: "#a7e0cf",
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

  const KID = ["2", "4", "6", "8", "10", "12"];   // talles por edad (años)
  const BABY = ["6m", "12m", "18m", "24m"];       // talles de bebé (meses)
  const ONE = ["Único"];                          // accesorios

  /* Productos de demostración. Los precios son de EJEMPLO: reemplazarlos. */
  const products = [
    make({ id: "remera-dinosaurio", name: "Remera Dinosaurio", category: "remeras", gender: "nene", price: 14900, tone: "lilac", tags: ["new", "best-seller", "featured"], colors: ["Crudo", "Celeste", "Verde"], sizes: KID, unavailable: ["Celeste|2"], description: "Remera de algodón con estampa de dinosaurio. Suave y cómoda para todo el día." }),
    make({ id: "remera-arcoiris", name: "Remera Arcoíris", category: "remeras", gender: "nena", price: 15900, tone: "pink", tags: ["new"], colors: ["Rosa", "Blanco"], sizes: KID, unavailable: ["Blanco|12"], description: "Remera de algodón con estampa de arcoíris y nubes." }),
    make({ id: "chomba-jardin", name: "Chomba Jardín", category: "remeras", gender: "unisex", price: 18900, tone: "sky", tags: ["featured"], colors: ["Celeste", "Blanco"], sizes: KID, unavailable: ["Celeste|12"], description: "Chomba de cuello polo, ideal para el jardín y el colegio." }),
    make({ id: "buzo-canguro", name: "Buzo Canguro", category: "buzos", gender: "unisex", price: 42900, oldPrice: 49900, tone: "sun", tags: ["sale", "featured", "best-seller"], colors: ["Gris", "Lila", "Negro"], sizes: KID, unavailable: ["Lila|2", "Negro|12"], description: "Buzo con capucha y bolsillo canguro. El abrigo de cabecera." }),
    make({ id: "buzo-redondo", name: "Buzo Cuello Redondo", category: "buzos", gender: "nena", price: 38900, tone: "lime", tags: ["new"], colors: ["Celeste", "Rosa", "Crudo"], sizes: KID, unavailable: ["Rosa|12"], description: "Buzo de cuello redondo con detalle estampado. Fácil de combinar." }),
    make({ id: "jean-elasticado", name: "Jean Elástico", category: "pantalones", gender: "unisex", price: 39900, tone: "lilac", tags: ["best-seller"], colors: ["Azul", "Negro"], sizes: KID, unavailable: ["Azul|12"], description: "Jean con elastano y cintura ajustable, para que acompañe el crecimiento." }),
    make({ id: "jogger-nino", name: "Jogger Niño", category: "pantalones", gender: "nene", price: 34900, tone: "sky", tags: [], colors: ["Gris", "Negro"], sizes: KID, unavailable: ["Gris|2"], description: "Jogger con puños elásticos y cintura cómoda." }),
    make({ id: "calza-estampada", name: "Calza Estampada", category: "calzas", gender: "nena", price: 23900, tone: "pink", tags: ["new"], colors: ["Rosa", "Lila"], sizes: KID, unavailable: ["Lila|12"], description: "Calza elástica con estampado de estrellas." }),
    make({ id: "calza-escuela", name: "Calza Escuela", category: "calzas", gender: "nena", price: 21900, tone: "lime", tags: [], colors: ["Negro", "Azul"], sizes: KID, description: "Calza lisa y resistente, ideal para la escuela." }),
    make({ id: "campera-abrigo", name: "Campera de Abrigo", category: "camperas", gender: "unisex", price: 58900, oldPrice: 65900, tone: "sun", tags: ["sale"], colors: ["Amarillo", "Negro"], sizes: KID, unavailable: ["Negro|12"], description: "Campera de abrigo con capucha y forro suave." }),
    make({ id: "campera-rompeviento", name: "Campera Rompeviento", category: "camperas", gender: "unisex", price: 44900, tone: "lime", tags: ["exclusive", "featured"], colors: ["Celeste", "Amarillo"], sizes: KID, unavailable: ["Celeste|2"], description: "Campera liviana con capucha, para los días de viento." }),
    make({ id: "vestido-verano", name: "Vestido de Verano", category: "vestidos", gender: "nena", price: 32900, tone: "pink", tags: ["new", "featured"], colors: ["Amarillo", "Celeste"], sizes: KID, unavailable: ["Celeste|12"], description: "Vestido liviano y fresco, ideal para los días de calor." }),
    make({ id: "enterito-bebe", name: "Enterito Bebé", category: "enteritos", gender: "unisex", price: 29900, tone: "sky", tags: ["new"], colors: ["Crudo", "Celeste"], sizes: BABY, unavailable: ["Crudo|24m"], description: "Enterito con botones a presión para cambiar rápido." }),
    make({ id: "gorra-pibe", name: "Gorra Pibe", category: "accesorios", gender: "unisex", price: 12900, tone: "pink", tags: ["best-seller"], colors: ["Negro", "Crudo", "Celeste"], sizes: ONE, unavailable: ["Celeste|Único"], description: "Gorra con visera curva y cierre regulable. Talle único." }),
    make({ id: "mochila-jardin", name: "Mochila Jardín", category: "accesorios", gender: "unisex", price: 27900, tone: "lilac", tags: ["new"], colors: ["Lila", "Celeste"], sizes: ONE, description: "Mochila liviana con bolsillo frontal para el jardín." }),
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
