/* ==========================================================================
   FREN FERRETERÍAS · MODELO A — script.js
   ETAPA 8: Sistema de configuración

   Qué hace este archivo (7 bloques, cada uno independiente):

     1. SITE_CONFIG: TODOS los datos del negocio, en un solo lugar
     2. Aplicar SITE_CONFIG: vuelca esos datos en el HTML automáticamente
     3. WhatsApp: arma los links usando el número de SITE_CONFIG
     4. Menú mobile: abrir/cerrar el panel de navegación
     5. Header: le agrega una clase cuando el usuario hace scroll
     6. Galería: abre/cierra el lightbox al hacer click en una foto
     7. Scroll reveal: hace aparecer bloques suavemente al hacer scroll
   ========================================================================== */


/* ==========================================================================
   1. SITE_CONFIG
   ✅ ESTE ES EL ÚNICO LUGAR QUE HAY QUE TOCAR PARA CONVERTIR ESTA
   PLANTILLA EN LA WEB DE OTRO CLIENTE.

   No hace falta buscar "FREN Ferreterías" ni el teléfono en ningún
   otro archivo: cambiá los valores de acá abajo y el sitio entero
   (textos, links de contacto, redes, colores, logo) se actualiza solo.

   IMPORTANTE: los metadatos para buscadores y redes sociales (el
   <title>, la meta description, las etiquetas Open Graph y el JSON-LD
   de la Etapa 6, en el <head> de index.html) NO se actualizan
   automáticamente desde acá. Eso es intencional: Google y Facebook no
   siempre ejecutan JavaScript antes de leer esa información, así que
   esos datos tienen que seguir escritos directamente en el HTML. El
   README (Etapa 9) explica paso a paso dónde tocar cada cosa.
   ========================================================================== */
const SITE_CONFIG = {

  businessName: "FREN Ferreterías",
description: "Ferretería de barrio en Quilmes.",

// Logo opcional: ruta relativa a la carpeta modelo-a/ (o URL http(s)).
// Si la imagen falta o no carga, se muestra el nombre del negocio en
// texto — el header y el footer nunca quedan vacíos.
logo: "img/logo_local.png",
logoAlt: "Logo de FREN Ferreterías",

phone: "(011) 4250-2865",
phoneHref: "tel:+541142502865",

email: "info@frenferreterias.com.ar",
emailHref: "mailto:info@frenferreterias.com.ar",

address: "Andrés Baranda 1309, Quilmes",

hours: "Lun. a Vie. 8:00 a 18:00 hs · Sáb. 8:00 a 13:00 hs",

whatsapp: "541142502865",

whatsappMessage:
  "Hola, quisiera realizar una consulta.",

instagram: "#",
facebook: "#",

// --- Catálogo (opcional) ---
// Vacío por defecto: esta plantilla NO inventa productos, precios ni
// disponibilidad. Cada artículo acepta:
//   name        (obligatorio),
//   category, sku, brand, description, image, imageAlt  (opcionales),
//   price       (número en pesos, o null → se muestra "Consultar precio"),
//   availability (solo si el comercio la informa; si no, no se muestra).
// Ejemplo: { name: "Martillo de uña", category: "Herramientas", price: null }
catalog: {
  items: [],
},

mainTexts: {
  heroTitle: "Todo para tu hogar y tu proyecto.",
  heroSubtitle:
    "Herramientas, materiales y atención personalizada en el corazón de Quilmes.",
},

  // --- Colores ---
  // Las mismas variables que existen en :root de style.css. Cambiarlas
  // acá pisa el valor del CSS al cargar la página, así que rebrandear
  // el sitio para otro cliente es tocar estos 8 valores y nada más.
  // Paleta industrial clara: fondo acero frío, tinta azul acero y
  // amarillo de seguridad solo como detalle decorativo.
  colors: {
    background: "#F4F6F8",
    surface: "#ffffff",
    text: "#18232F",
    textMuted: "#5D6B78",
    accent: "#163A5F",
    accentDark: "#0F2A47",
    highlight: "#F2B544",
    border: "#DCE3EA",
  },
};


/* ==========================================================================
   2. APLICAR SITE_CONFIG AL HTML
   No hay que tocar nada acá abajo para personalizar el sitio — esta
   parte es "motor", no "datos". Busca en el HTML los elementos
   marcados con data-config-text / data-config-href y les pone el
   valor que corresponda de SITE_CONFIG.
   ========================================================================== */

// Permite usar rutas como "mainTexts.heroTitle" para leer valores anidados
function getConfigValue(path) {
  return path
    .split(".")
    .reduce((value, key) => (value ? value[key] : undefined), SITE_CONFIG);
}

// <h1 data-config-text="mainTexts.heroTitle">...</h1> → le pone el texto
function applyConfigText() {
  document.querySelectorAll("[data-config-text]").forEach((el) => {
    const value = getConfigValue(el.getAttribute("data-config-text"));
    if (value !== undefined) el.textContent = value;
  });
}

// <a data-config-href="instagram">...</a> → le pone el href
function applyConfigHref() {
  document.querySelectorAll("[data-config-href]").forEach((el) => {
    const value = getConfigValue(el.getAttribute("data-config-href"));
    if (value !== undefined) el.setAttribute("href", value);
  });
}

// <a aria-label="..." data-config-aria-template="{name} - Inicio">
// El "{name}" del template se reemplaza por SITE_CONFIG.businessName.
// Es el mismo mecanismo que data-config-text / data-config-href, pero
// para aria-label — así funciona igual sin importar el nombre del
// negocio (antes el nombre estaba escrito a mano en el HTML y se
// rompía apenas cambiabas de cliente).
function applyConfigAriaLabels() {
  document.querySelectorAll("[data-config-aria-template]").forEach((el) => {
    const template = el.getAttribute("data-config-aria-template");
    el.setAttribute("aria-label", template.replace("{name}", SITE_CONFIG.businessName));
  });
}

// El copyright del footer arma su propio texto con el año actual, para
// no tener que acordarse de cambiarlo a mano cada enero.
function applyCopyright() {
  const el = document.getElementById("footer-copyright");
  if (!el) return;
  const year = new Date().getFullYear();
  el.textContent = `© ${year} ${SITE_CONFIG.businessName}. Todos los derechos reservados.`;
}

// "#15181B" → "21, 24, 27" — style.css necesita el fondo también en
// formato "r, g, b" para poder usarlo dentro de rgba() (header, lightbox).
function hexToRgbString(hex) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `${r}, ${g}, ${b}`;
}

// Pisa las variables CSS de :root (style.css, Etapa 2) con los colores
// definidos en SITE_CONFIG.
function applyBrandColors() {
  const cssVariableByColorKey = {
    background: "--color-background",
    surface: "--color-surface",
    text: "--color-text",
    textMuted: "--color-text-muted",
    accent: "--color-accent",
    accentDark: "--color-accent-dark",
    highlight: "--color-highlight",
    border: "--color-border",
  };

  Object.keys(cssVariableByColorKey).forEach((key) => {
    const value = SITE_CONFIG.colors[key];
    if (value) {
      document.documentElement.style.setProperty(cssVariableByColorKey[key], value);
    }
  });

  // El fondo necesita, además, su versión "r, g, b" (ver arriba)
  if (SITE_CONFIG.colors.background) {
    document.documentElement.style.setProperty(
      "--color-background-rgb",
      hexToRgbString(SITE_CONFIG.colors.background)
    );
  }
}

// Valida la ruta del logo antes de usarla: solo rutas relativas sin
// ".." ni barra invertida, o URLs http(s). Cualquier otra cosa se
// ignora y el nombre queda en texto.
function isValidLogoPath(value) {
  if (typeof value !== "string") return false;
  const path = value.trim();
  if (!path || path.includes("\\") || path.split("/").indexOf("..") !== -1) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return /^https?:/i.test(path);
  return true;
}

// Logo en el header y en el footer: misma imagen, mismo alt. Si falla
// la carga, cada uno vuelve a mostrar el nombre del negocio.
function applyLogo() {
  if (!isValidLogoPath(SITE_CONFIG.logo)) return;
  const alt = SITE_CONFIG.logoAlt || SITE_CONFIG.businessName;
  [".header__logo", ".footer__logo"].forEach((selector) => {
    const el = document.querySelector(selector);
    if (!el) return;
    const fallbackText = el.textContent.trim() || SITE_CONFIG.businessName;
    const img = document.createElement("img");
    img.src = SITE_CONFIG.logo.trim();
    img.alt = alt;
    img.decoding = "async";
    img.addEventListener("error", () => {
      el.textContent = fallbackText;
    }, { once: true });
    el.textContent = "";
    el.appendChild(img);
  });
}

function applySiteConfig() {
  applyBrandColors();
  applyConfigText();
  applyConfigHref();
  applyConfigAriaLabels();
  applyCopyright();
  applyLogo();
}


/* ==========================================================================
   3. WHATSAPP
   Arma el link de WhatsApp una sola vez, a partir del número y el
   mensaje definidos en SITE_CONFIG, y lo aplica a los 3 botones del
   sitio (Hero, Ubicación y flotante).
   ========================================================================== */
function buildWhatsappLink() {
  const text = encodeURIComponent(SITE_CONFIG.whatsappMessage);
  return `https://wa.me/${SITE_CONFIG.whatsapp}?text=${text}`;
}

function initWhatsappLinks() {
  const link = buildWhatsappLink();
  const targets = [
    document.getElementById("whatsapp-cta-hero"),
    document.getElementById("whatsapp-cta-location"),
    document.getElementById("whatsapp-float"),
  ];

  targets.forEach((el) => {
    if (!el) return;
    el.setAttribute("href", link);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
    // El flotante viene oculto en el HTML: solo se muestra si el
    // número de WhatsApp es válido (si no, no hay a dónde llevar).
    if (el.id === "whatsapp-float") el.hidden = false;
  });
}


/* ==========================================================================
   4. MENÚ MOBILE
   El CSS de la Etapa 3 ya sabe mostrar/ocultar el panel según la clase
   `header__nav--open`. Acá solo la agregamos, quitamos, y mantenemos
   `aria-expanded` sincronizado para lectores de pantalla.
   ========================================================================== */
function initMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("header-nav");
  if (!toggle || !nav) return;

  function isOpen() {
    return nav.classList.contains("header__nav--open");
  }

  function closeMenu(restoreFocus) {
    if (!isOpen()) return;
    nav.classList.remove("header__nav--open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú de navegación");
    document.body.classList.remove("menu-open"); // vuelve a scrollear
    if (restoreFocus) toggle.focus();
  }

  function openMenu() {
    nav.classList.add("header__nav--open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Cerrar menú de navegación");
    document.body.classList.add("menu-open"); // el fondo no scrollea
  }

  toggle.addEventListener("click", () => {
    isOpen() ? closeMenu(false) : openMenu();
  });

  // Al tocar un link del menú, cerrarlo y dejar el foco en la sección
  // de destino (si no, el foco queda en un link ya colapsado).
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu(false);
      const href = link.getAttribute("href") || "";
      const target = href.length > 1 ? document.getElementById(href.slice(1)) : null;
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.addEventListener(
          "blur",
          () => target.removeAttribute("tabindex"),
          { once: true }
        );
        target.focus({ preventScroll: true });
      }
    });
  });

  // Cerrar con la tecla Escape (y devolver el foco al botón) solo
  // cuando el menú está abierto.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) closeMenu(true);
  });

  // Cerrar si el usuario toca fuera del menú
  document.addEventListener("click", (event) => {
    const clickedInsideNav = nav.contains(event.target);
    const clickedToggle = toggle.contains(event.target);
    if (!clickedInsideNav && !clickedToggle) closeMenu(false);
  });

  // Si la pantalla crece hasta el breakpoint de desktop, el panel deja
  // de existir: hay que cerrarlo para no dejar aria-expanded pegado.
  const desktopQuery = window.matchMedia("(min-width: 860px)");
  const onBreakpoint = (event) => {
    if (event.matches) closeMenu(false);
  };
  if (typeof desktopQuery.addEventListener === "function") {
    desktopQuery.addEventListener("change", onBreakpoint);
  } else if (typeof desktopQuery.addListener === "function") {
    desktopQuery.addListener(onBreakpoint); // Safari antiguo
  }
}


/* ==========================================================================
   5. HEADER AL HACER SCROLL
   Agrega la clase `is-scrolled` al header apenas el usuario baja un
   poco la página. El aspecto visual de esa clase está definido en
   style.css (Etapa 3); acá solo decidimos cuándo se activa.
   ========================================================================== */
function initHeaderScroll() {
  const header = document.getElementById("site-header");
  if (!header) return;

  function updateHeaderState() {
    const shouldBeScrolled = window.scrollY > 40;
    header.classList.toggle("is-scrolled", shouldBeScrolled);
  }

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });
}


/* ==========================================================================
   6. GALERÍA / LIGHTBOX
   Al tocar una foto de la galería, se abre en grande sobre el resto de
   la página. Se puede cerrar con el botón, con Escape, o tocando fuera
   de la imagen.
   ========================================================================== */
function initGalleryLightbox() {
  const grid = document.getElementById("gallery-grid");
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const closeButton = document.getElementById("lightbox-close");
  if (!grid || !lightbox || !lightboxImage || !closeButton) return;

  let lastFocusedElement = null;

  function openLightbox(sourceImg) {
    lightboxImage.src = sourceImg.getAttribute("src");
    lightboxImage.alt = sourceImg.getAttribute("alt") || "";
    lightbox.classList.add("lightbox--open");
    lightbox.setAttribute("aria-hidden", "false");
    lastFocusedElement = document.activeElement;
    closeButton.focus();
    document.body.style.overflow = "hidden"; // evita el scroll de fondo
  }

  function closeLightbox() {
    lightbox.classList.remove("lightbox--open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  grid.querySelectorAll(".gallery__item").forEach((item) => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      if (img) openLightbox(img);
    });
  });

  closeButton.addEventListener("click", closeLightbox);

  // Tocar el fondo oscuro (fuera de la imagen) también cierra
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("lightbox--open")) {
      closeLightbox();
    }
  });

  // El diálogo tiene un solo elemento enfocable (Cerrar): Tab siempre
  // vuelve ahí en vez de escaparse hacia la página de atrás.
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "Tab" && lightbox.classList.contains("lightbox--open")) {
      event.preventDefault();
      closeButton.focus();
    }
  });
}


/* ==========================================================================
   7. APARICIÓN DE ELEMENTOS AL HACER SCROLL
   Observa todos los elementos con clase `.reveal` (tarjetas de menú,
   fotos de la galería, testimonios, bloques de "Nosotros" y
   "Ubicación") y les agrega `.is-visible` la primera vez que entran en
   pantalla. El aspecto de ambos estados está definido en style.css.
   ========================================================================== */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Si el navegador no soporta IntersectionObserver, o el usuario pidió
  // menos movimiento, mostramos todo directamente sin animar.
  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // aparece una sola vez
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => observer.observe(el));
}


/* ==========================================================================
   8. NAVEGACIÓN ACTIVA (scrollspy)
   Marca con aria-current la sección que se está viendo, así el menú
   indica "dónde estoy" (en mobile es la única referencia).
   ========================================================================== */
function initNavHighlight() {
  const links = Array.from(
    document.querySelectorAll('.header__nav-list a[href^="#"]')
  );
  if (!links.length || !("IntersectionObserver" in window)) return;

  const sections = links
    .map((link) => document.getElementById((link.getAttribute("href") || "").slice(1)))
    .filter(Boolean);
  if (!sections.length) return;

  function setActive(id) {
    links.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;
      if (active) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  // Se considera "visible" la sección que ocupa la franja central de
  // la pantalla (el header cubre la parte superior).
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((section) => observer.observe(section));
}


/* ==========================================================================
   INICIALIZACIÓN
   applySiteConfig() va primero: así el resto del sitio (WhatsApp
   incluido) ya encuentra los datos actualizados cuando arranca.
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  applySiteConfig();
  initWhatsappLinks();
  initMobileMenu();
  initHeaderScroll();
  initGalleryLightbox();
  initScrollReveal();
  initNavHighlight();
});
