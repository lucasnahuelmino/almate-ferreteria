/* ==========================================================================
   ALMATE · Demo Moda · products.moda.js
   Catálogo de DEMOSTRACIÓN y modelo de datos de indumentaria (talles, colores
   y variantes). Reemplazá estos productos por el catálogo real del local.
   No inventa stock numérico: la disponibilidad es una indicación configurable.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ModaProducts = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /* Etiquetas legibles para los rubros del catálogo. */
  const CATEGORY_LABELS = {
    camisas: "Camisas",
    pantalones: "Pantalones",
    remeras: "Remeras",
    abrigos: "Abrigos",
    vestidos: "Vestidos",
    sacos: "Sacos",
    accesorios: "Accesorios",
  };

  const GENDERS = [
    { id: "mujer", name: "Mujer" },
    { id: "hombre", name: "Hombre" },
    { id: "unisex", name: "Unisex" },
  ];

  /* Productos de demostración. Los precios son de EJEMPLO: reemplazarlos. */
  const products = [
    {
      id: "camisa-oversize",
      name: "Camisa Oversize",
      category: "camisas",
      gender: "mujer",
      price: 45900,
      oldPrice: 52900,
      description: "Camisa de algodón de corte relajado, con caída suelta y terminaciones cuidadas.",
      image: "assets/products/p-camisa-oversize.svg",
      imageAlt: "Camisa oversize de algodón en color crudo",
      tags: ["new", "featured"],
      colors: [
        { name: "Negro", value: "#171717" },
        { name: "Crudo", value: "#E8DFD2" },
      ],
      sizes: ["XS", "S", "M", "L", "XL"],
      unavailable: ["Crudo|XL"],
    },
    {
      id: "pantalon-sastrero",
      name: "Pantalón Sastrero",
      category: "pantalones",
      gender: "mujer",
      price: 62000,
      description: "Pantalón de tiro alto y corte sastrero, en tejido de caída fluida.",
      image: "assets/products/p-pantalon-sastrero.svg",
      imageAlt: "Pantalón sastrero de tiro alto en color beige",
      tags: ["featured"],
      colors: [
        { name: "Beige", value: "#D8CBB8" },
        { name: "Negro", value: "#171717" },
      ],
      sizes: ["36", "38", "40", "42"],
      unavailable: ["Beige|42"],
    },
    {
      id: "remera-essential",
      name: "Remera Essential",
      category: "remeras",
      gender: "hombre",
      price: 23900,
      description: "Remera básica de algodón peinado, de calce cómodo y cuello reforzado.",
      image: "assets/products/p-remera-essential.svg",
      imageAlt: "Remera básica de algodón en color blanco",
      tags: [],
      colors: [
        { name: "Blanco", value: "#FAF9F6" },
        { name: "Negro", value: "#171717" },
      ],
      sizes: ["XS", "S", "M", "L", "XL"],
      unavailable: [],
    },
    {
      id: "campera-abrigo",
      name: "Campera de Abrigo",
      category: "abrigos",
      gender: "mujer",
      price: 89000,
      oldPrice: 104000,
      description: "Campera larga de paño, abrigada y versátil, con forro interior suave.",
      image: "assets/products/p-campera-abrigo.svg",
      imageAlt: "Campera de abrigo larga de paño en color camel",
      tags: ["sale", "featured"],
      colors: [
        { name: "Camel", value: "#C9A876" },
        { name: "Negro", value: "#171717" },
      ],
      sizes: ["S", "M", "L", "XL"],
      unavailable: ["Negro|XL"],
    },
    {
      id: "vestido-midi",
      name: "Vestido Midi",
      category: "vestidos",
      gender: "mujer",
      price: 54000,
      description: "Vestido midi de líneas simples y tela liviana, ideal para el día a día.",
      image: "assets/products/p-vestido-midi.svg",
      imageAlt: "Vestido midi en color arena",
      tags: ["new"],
      colors: [
        { name: "Arena", value: "#D8CBB8" },
        { name: "Negro", value: "#171717" },
      ],
      sizes: ["XS", "S", "M", "L"],
      unavailable: [],
    },
    {
      id: "blazer-entallado",
      name: "Blazer Entallado",
      category: "sacos",
      gender: "hombre",
      price: 78000,
      description: "Blazer de corte entallado, estructurado pero liviano, para look formal o casual.",
      image: "assets/products/p-blazer-entallado.svg",
      imageAlt: "Blazer entallado en color carbón",
      tags: ["featured"],
      colors: [
        { name: "Carbón", value: "#171717" },
        { name: "Gris", value: "#77736E" },
      ],
      sizes: ["S", "M", "L", "XL"],
      unavailable: ["Gris|XL"],
    },
    {
      id: "bufanda-lana",
      name: "Bufanda de Lana",
      category: "accesorios",
      gender: "unisex",
      price: 21900,
      description: "Bufanda de lana tejida, suave y abrigada, en tono natural.",
      image: "assets/products/p-bufanda-lana.svg",
      imageAlt: "Bufanda de lana tejida en tono avena",
      tags: ["new"],
      colors: [
        { name: "Avena", value: "#D8CBB8" },
        { name: "Carbón", value: "#171717" },
      ],
      sizes: ["Único"],
      unavailable: [],
    },
    {
      id: "jeans-relaxed",
      name: "Jeans Relaxed",
      category: "pantalones",
      gender: "hombre",
      price: 66000,
      oldPrice: 72000,
      description: "Jean de corte relajado, con lavado medio y confección resistente.",
      image: "assets/products/p-jeans-relaxed.svg",
      imageAlt: "Jeans de corte relajado en lavado azul",
      tags: ["sale"],
      colors: [
        { name: "Azul", value: "#3A4A5A" },
        { name: "Negro", value: "#171717" },
      ],
      sizes: ["40", "42", "44"],
      unavailable: ["Azul|44"],
    },
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

  function isOnSale(product) {
    return Boolean(product.oldPrice) || (product.tags || []).includes("sale");
  }

  function isFeatured(product) {
    return (product.tags || []).includes("featured");
  }

  function isNew(product) {
    return (product.tags || []).includes("new");
  }

  function tagLabel(tag) {
    const labels = {
      new: "Nuevo",
      featured: "Destacado",
      sale: "Sale",
      exclusive: "Exclusivo",
      limited: "Limitado",
    };
    return labels[tag] || tag;
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
    isOnSale,
    isFeatured,
    isNew,
    tagLabel,
  };
});
