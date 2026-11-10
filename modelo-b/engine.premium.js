/* ==========================================================================
   ALMATE · MODELO B — PREMIUM · engine.premium.js
   Motor propio del Modelo Premium (independiente del script.js del Modelo A).
   Depende de: config-core.js (validación/seguridad) y config.premium.js (datos).
   No hace falta editarlo para adaptar un negocio.

   Principios:
   · Todo texto de la config se inserta ESCAPADO (nunca como HTML).
   · Toda URL pasa por la lista de protocolos permitidos (config-core.js).
   · Una sección con error no impide que se rendericen las demás.
   · Los problemas de configuración se informan en consola: "[ALMATE Premium] …".
   ========================================================================== */
(function () {
  "use strict";
  const LOG = "[ALMATE Premium]";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  /* 0. ARRANQUE SEGURO ----------------------------------------------------- */
  function showFatal(msg) {
    console.error(LOG, msg);
    const m = $("#main");
    if (m) m.innerHTML = '<div class="config-error" role="alert"><p class="label">Error de configuración</p><p>' +
      "No se pudo mostrar el sitio. Abrí la consola del navegador (F12) para ver el detalle.</p></div>";
  }
  const Core = window.PremiumCore;
  if (!Core) { showFatal("No se cargó config-core.js (revisá el orden de los <script> en index.html)."); return; }
  const esc = Core.esc;

  const res = Core.normalize(typeof PREMIUM_CONFIG !== "undefined" ? PREMIUM_CONFIG : undefined);
  const C = res.cfg, issues = res.issues;
  const SECTIONS = Core.enabledSections(C, issues);
  window.__PREMIUM_ISSUES__ = issues; // para pruebas automatizadas

  function reportIssues() {
    if (!issues.length) return;
    if (console.groupCollapsed) console.groupCollapsed(`${LOG} ${issues.length} aviso(s) de configuración`);
    issues.forEach((i) => (i.level === "error" ? console.error : console.warn)(`${LOG} ${i.path}: ${i.msg}`));
    if (console.groupEnd) console.groupEnd();
  }

  /* 1. HELPERS ------------------------------------------------------------- */
  const ID = Core.SECTION_ID;
  const img = (f) => Core.assetUrl(C, f);
  const brandName = C.brand.name || "Nombre del negocio";
  const ct = C.contact;
  const waHref = () => ct.whatsapp ? `https://wa.me/${ct.whatsapp}` + (ct.whatsappMessage ? `?text=${encodeURIComponent(ct.whatsappMessage)}` : "") : "";
  const EXT = 'target="_blank" rel="noopener noreferrer"';
  const label = (t) => (t ? `<p class="label">${esc(t)}</p>` : "");
  const secHead = (s) => `<header class="sec-head reveal">${label(s.label)}${s.title ? `<h2>${esc(s.title)}</h2>` : ""}</header>`;
  const place = () => [ct.address, ct.locality].filter(Boolean).join(", ");

  /* 2. TEMA ---------------------------------------------------------------- */
  function applyTheme() {
    const r = document.documentElement.style, c = C.colors;
    const map = { ink: "--ink", graphite: "--graphite", paper: "--paper", ivory: "--ivory", sand: "--sand", bronze: "--bronze", bronzeText: "--bronze-text", champagne: "--champagne", muted: "--muted" };
    Object.keys(map).forEach((k) => r.setProperty(map[k], c[k]));
    r.setProperty("--font-display", C.fonts.display);
    r.setProperty("--font-body", C.fonts.body);
  }

  /* 3. RENDER -------------------------------------------------------------- */
  const R = {
    hero() {
      const h = C.hero, wa = waHref();
      const primary = wa && h.ctaPrimary ? `<a class="btn btn--solid" href="${esc(wa)}" ${EXT}>${esc(h.ctaPrimary)}</a>` : "";
      const tgt = h.ctaSecondaryTarget !== "hero" && SECTIONS.indexOf(h.ctaSecondaryTarget) !== -1 ? ID[h.ctaSecondaryTarget] : "";
      const second = tgt && h.ctaSecondary ? `<a class="btn btn--ghost" href="#${tgt}">${esc(h.ctaSecondary)}</a>` : "";
      const media = h.image ? `<div class="hero__media"><img src="${esc(img(h.image))}" alt="${esc(h.imageAlt)}" width="880" height="1100" fetchpriority="high" decoding="async"></div>` : "";
      const meta = place() || ct.hours ? `<p class="hero__meta">${place() ? `<span>${esc(place())}</span>` : ""}${ct.hours ? `<span>${esc(ct.hours)}</span>` : ""}</p>` : "";
      return `<section class="hero${h.image ? "" : " hero--noimage"}" id="inicio">${media}
        <div class="hero__content">
          ${h.eyebrow ? `<p class="eyebrow">${esc(h.eyebrow)}</p>` : ""}
          <h1 class="hero__title">${esc(h.title || brandName)}${h.titleAccent ? ` <em>${esc(h.titleAccent)}</em>` : ""}</h1>
          ${h.subtitle ? `<p class="hero__lead">${esc(h.subtitle)}</p>` : ""}
          ${primary || second ? `<div class="hero__actions">${primary}${second}</div>` : ""}
        </div>${meta}</section>`;
    },
    about() {
      const a = C.about;
      const fig = a.image ? `<figure class="about__media reveal"><img src="${esc(img(a.image))}" alt="${esc(a.imageAlt)}" loading="lazy" decoding="async" width="700" height="875"></figure>` : "";
      return `<section class="about${a.image ? "" : " about--noimg"}" id="nosotros">${fig}
        <div class="about__body reveal">${label(a.label)}${a.title ? `<h2>${esc(a.title)}</h2>` : ""}
          ${a.title && a.paragraphs.length ? '<div class="rule"></div>' : ""}
          ${a.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}
        </div></section>`;
    },
    services() {
      const s = C.services;
      const rows = s.items.map((it, i) => `<li class="svc${it.image ? "" : " svc--noimg"} reveal">
          <span class="svc__n">${String(i + 1).padStart(2, "0")}</span>
          <div class="svc__txt"><h3>${esc(it.name)}</h3>${it.description ? `<p>${esc(it.description)}</p>` : ""}${it.price ? `<span class="svc__price">${esc(it.price)}</span>` : ""}</div>
          ${it.image ? `<img class="svc__img" src="${esc(img(it.image))}" alt="${esc(it.alt)}" loading="lazy" decoding="async" width="320" height="240">` : ""}
        </li>`).join("");
      return `<section class="services" id="rubros">${secHead(s)}<ol class="svc-list">${rows}</ol></section>`;
    },
    gallery() {
      const g = C.gallery;
      const items = g.items.map((it, i) => `<button type="button" class="mosaic__item reveal" data-src="${esc(img(it.src))}" data-alt="${esc(it.alt)}" aria-label="Ampliar imagen ${i + 1}${it.alt ? ": " + esc(it.alt) : ""}">
          <img src="${esc(img(it.src))}" alt="${esc(it.alt)}" loading="lazy" decoding="async" width="600" height="600"></button>`).join("");
      return `<section class="gallery" id="galeria">${secHead(g)}<div class="mosaic">${items}</div></section>`;
    },
    testimonials() {
      const t = C.testimonials;
      const q = t.items.map((it) => `<blockquote class="quote reveal"><p>“${esc(it.text)}”</p>
          <footer>${esc(it.author)}${it.role ? `<span>${esc(it.role)}</span>` : ""}</footer></blockquote>`).join("");
      return `<section class="testimonials" id="opiniones">${secHead(t)}<div class="quotes">${q}</div></section>`;
    },
    location() {
      const l = C.location, m = ct.map, wa = waHref();
      const soc = Object.keys(ct.social).map((k) => `<a href="${esc(ct.social[k])}" ${EXT}>${esc(k.charAt(0).toUpperCase() + k.slice(1))}</a>`).join("");
      const rows = [
        place() && ["Dirección", esc(place())],
        ct.hours && ["Horarios", esc(ct.hours)],
        ct.phone && ["Teléfono", ct.phoneHref ? `<a href="${esc(ct.phoneHref)}">${esc(ct.phone)}</a>` : esc(ct.phone)],
        ct.email && ["Email", `<a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a>`],
        soc && ["Redes", `<span class="contact__social">${soc}</span>`],
      ].filter(Boolean).map((r) => `<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join("");
      const mapSrc = !m.show ? "" : (m.embedUrl || `https://www.google.com/maps?q=${encodeURIComponent(m.query)}&output=embed`);
      const map = mapSrc ? `<div class="contact__map reveal"><iframe title="Mapa de ubicación de ${esc(brandName)}" src="${esc(mapSrc)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>` : "";
      return `<section class="contact${map ? "" : " contact--nomap"}" id="contacto">
        <div class="contact__info reveal">${label(l.label)}${l.title ? `<h2>${esc(l.title)}</h2>` : ""}
          ${rows ? `<dl>${rows}</dl>` : ""}
          <div class="contact__actions">
            ${wa ? `<a class="btn btn--solid" href="${esc(wa)}" ${EXT}>Escribinos por WhatsApp</a>` : ""}
            ${m.externalUrl ? `<a class="link-line" href="${esc(m.externalUrl)}" ${EXT}>Cómo llegar<span class="sr-only"> (se abre en una pestaña nueva)</span></a>` : ""}
          </div></div>${map}</section>`;
    },
  };

  /* 3. MARCA / LOGO ---------------------------------------------------------
     Si brand.logo apunta a un archivo válido se muestra la imagen en header y
     footer. Si no hay logo, o si la imagen no carga, se muestra el nombre
     comercial en texto: nunca queda un hueco con una imagen rota. */
  function applyBrand() {
    const useLogo = !!C.brand.logo;
    const alt = C.brand.logoAlt || brandName;
    $$(".js-brand").forEach((el) => {
      if (!useLogo) { el.textContent = brandName; return; }
      el.innerHTML = `<img class="brand__logo" src="${esc(img(C.brand.logo))}" alt="${esc(alt)}" width="64" height="64" decoding="async">`;
      const image = el.querySelector("img");
      if (!image) { el.textContent = brandName; return; }
      const fallback = () => { el.textContent = brandName; };
      image.addEventListener("error", fallback);
      if (image.complete && image.naturalWidth === 0) fallback();
    });
  }

  function renderPage() {
    const main = $("#main");
    main.innerHTML = "";
    SECTIONS.slice().forEach((k) => {
      try { main.insertAdjacentHTML("beforeend", R[k]()); }
      catch (e) { console.error(`${LOG} La sección "${k}" falló y se omitió:`, e); SECTIONS.splice(SECTIONS.indexOf(k), 1); }
    });
    if (!main.children.length) {
      main.innerHTML = '<div class="config-error" role="alert"><p class="label">Sin contenido</p><p>No hay secciones para mostrar. Revisá config.premium.js (ver consola).</p></div>';
      console.error(LOG, "ERROR CRÍTICO — ninguna sección pudo renderizarse.");
    }
    const links = SECTIONS.filter((k) => k !== "hero").map((k) => `<li><a href="#${ID[k]}">${esc(C[k].navLabel)}</a></li>`).join("");
    $("#nav-list").innerHTML = links;
    applyBrand();
    const desc = $("#footer-desc"); desc.textContent = C.brand.description; desc.hidden = !C.brand.description;
    $("#footer-nav").innerHTML = (SECTIONS.indexOf("hero") !== -1 ? '<li><a href="#inicio">Inicio</a></li>' : "") + links;
    $("#footer-contact").innerHTML =
      (place() ? `<p>${esc(place())}</p>` : "") +
      (ct.phone ? `<p>${ct.phoneHref ? `<a href="${esc(ct.phoneHref)}">${esc(ct.phone)}</a>` : esc(ct.phone)}</p>` : "") +
      (ct.email ? `<p><a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a></p>` : "");
    $("#footer-copy").textContent = `© ${new Date().getFullYear()} ${brandName}. Todos los derechos reservados.`;
    const cr = $("#footer-credit");
    cr.textContent = Core.CREDIT; // fijo: crédito obligatorio
    if (C.footer.creditUrl) { cr.setAttribute("href", C.footer.creditUrl); cr.setAttribute("target", "_blank"); cr.setAttribute("rel", "noopener noreferrer"); }
  }

  /* 4. IMÁGENES ROTAS ------------------------------------------------------ */
  function removeSection(id) {
    const s = document.getElementById(id); if (s) s.remove();
    $$(`a[href="#${id}"]`).forEach((a) => { const li = a.closest("li"); (li || a).remove(); });
  }
  function onImgError(e) {
    const t = e.target;
    if (!t || t.tagName !== "IMG") return;
    console.warn(`${LOG} No se pudo cargar la imagen "${t.getAttribute("src")}". Revisá el nombre y que exista en la carpeta de imágenes.`);
    let el;
    if ((el = t.closest(".mosaic__item"))) { el.remove(); if (!$(".mosaic__item")) removeSection("galeria"); }
    else if ((el = t.closest(".svc"))) { el.classList.add("svc--noimg"); t.remove(); }
    else if ((el = t.closest(".about__media"))) { el.parentNode.classList.add("about--noimg"); el.remove(); }
    else if ((el = t.closest(".hero__media"))) { el.parentNode.classList.add("hero--noimage"); el.remove(); }
    else t.remove();
  }

  /* 5. SEO: avisa si el <head> estático quedó desactualizado ---------------- */
  function checkStaticSeo() {
    const seo = Core.buildSeo(C, SECTIONS), bad = [];
    const meta = (n) => { const e = $(`meta[name="${n}"]`); return e ? e.getAttribute("content") : ""; };
    const canon = $('link[rel="canonical"]');
    if (document.title !== seo.title) bad.push("title");
    if ((meta("description") || "") !== (seo.description || "")) bad.push("meta description");
    if ((canon ? canon.getAttribute("href") : "") !== (seo.canonical || "")) bad.push("canonical");
    const ld = $("#ld-json");
    try { if (!ld || JSON.stringify(JSON.parse(ld.textContent)) !== JSON.stringify(seo.jsonld)) bad.push("datos estructurados"); } catch (e) { bad.push("datos estructurados (JSON inválido)"); }
    const pre = $('link[rel="preload"][as="image"]');
    if ((pre ? pre.getAttribute("href") : "") !== (seo.heroPreload || "")) bad.push("preload del hero");
    if (bad.length) console.warn(`${LOG} El <head> estático de index.html no coincide con config.premium.js (${bad.join(", ")}). Los buscadores y redes sociales leen el HTML estático: ejecutá "node modelo-b/tools/sync-seo.js" o actualizalo a mano (ver README).`);
    window.__PREMIUM_SEO_STALE__ = bad;
  }

  /* 6. WHATSAPP FLOTANTE --------------------------------------------------- */
  function initWhatsappFloat() {
    const f = $("#wa-float"), wa = waHref();
    if (!f) return;
    if (!wa) { f.remove(); return; }
    f.href = wa; f.target = "_blank"; f.rel = "noopener noreferrer"; f.hidden = false;
  }

  /* 7. MENÚ + HEADER ------------------------------------------------------- */
  const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);

  /* Bloqueo de scroll del fondo: en iOS Safari "overflow:hidden" en <body>
     no alcanza, así que además fijamos el body en la posición actual y lo
     devolvemos al cerrar (patrón estándar de modales). */
  let scrollLocks = 0, scrollLockY = 0;
  function lockScroll() {
    if (scrollLocks === 0) {
      scrollLockY = window.scrollY;
      document.body.classList.add("no-scroll");
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollLockY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    }
    scrollLocks += 1;
  }
  function unlockScroll() {
    scrollLocks = Math.max(0, scrollLocks - 1);
    if (scrollLocks === 0) {
      document.body.classList.remove("no-scroll");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollLockY); // restaura la posición previa
    }
  }

  function initHeader() {
    const header = $("#site-header"), toggle = $("#menu-toggle"), nav = $("#site-nav");
    const main = $("#main"), footer = $(".site-footer");
    const isOpen = () => header.classList.contains("is-menu-open");
    const set = (open) => {
      if (open === isOpen()) return;
      header.classList.toggle("is-menu-open", open);
      open ? lockScroll() : unlockScroll();
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      // Con el panel a pantalla completa, el resto de la página no debe
      // ser navegable ni cliqueable (y el scroll del panel es interno).
      [main, footer].forEach((el) => { if (el) el.toggleAttribute("inert", open); });
      if (open) nav.scrollTop = 0;
    };
    toggle.addEventListener("click", () => set(!isOpen()));
    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      set(false);
      // Tras cerrar, el foco pasa a la sección de destino (si no, cae al
      // body y el usuario de teclado pierde el lugar).
      const href = a.getAttribute("href") || "";
      const target = href.length > 1 ? document.getElementById(href.slice(1)) : null;
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
        target.focus({ preventScroll: true });
      }
    });
    header.addEventListener("keydown", (e) => {
      if (!isOpen()) return;
      if (e.key === "Escape") { set(false); toggle.focus(); return; }
      if (e.key === "Tab") { // trampa de foco dentro del menú abierto
        const f = $$("a, button", header).filter(visible); if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    if (window.matchMedia) { // addEventListener en MediaQueryList no existe en Safari < 14
      const mq = window.matchMedia("(min-width: 900px)"), h = (e) => { if (e.matches) set(false); };
      if (mq.addEventListener) mq.addEventListener("change", h); else if (mq.addListener) mq.addListener(h);
    }
    const onScroll = () => {
      if (scrollLocks > 0) return; // con el fondo congelado no cambia nada
      header.classList.toggle("is-scrolled", window.scrollY > 40);
      // El flotante aparece pasado el hero (medido sobre #inicio, no con
      // window.innerHeight: en mobile esa unidad es engañosa) y también
      // cerca del final de la página, para no perder el contacto.
      const hero = document.getElementById("inicio");
      const heroEnd = hero ? hero.offsetTop + hero.offsetHeight : window.innerHeight;
      const nearEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 480;
      document.body.classList.toggle("past-hero", window.scrollY > heroEnd - 120 || nearEnd);
      // Scrollspy: marca la sección visible en la navegación.
      const y = window.scrollY + header.offsetHeight + window.innerHeight * 0.35;
      let current = "";
      $$("main section[id]").forEach((s) => { if (s.offsetTop <= y) current = s.id; });
      $$("#nav-list a").forEach((a) => {
        if (a.getAttribute("href") === `#${current}`) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* 8. LIGHTBOX ------------------------------------------------------------ */
  function initLightbox() {
    const box = $("#lightbox"); if (!box) return;
    const lbImg = $("#lb-img"), cap = $("#lb-cap"), count = $("#lb-count"), prev = $("#lb-prev"), next = $("#lb-next");
    let list = [], idx = 0, opener = null;
    const show = (i) => {
      idx = (i + list.length) % list.length;
      lbImg.alt = list[idx].dataset.alt || ""; lbImg.src = list[idx].dataset.src;
      cap.textContent = list[idx].dataset.alt || ""; count.textContent = `${idx + 1} / ${list.length}`;
    };
    const open = (btn) => {
      list = $$(".mosaic__item"); opener = btn;
      prev.hidden = next.hidden = count.hidden = list.length < 2;
      show(list.indexOf(btn));
      box.classList.add("is-open"); box.setAttribute("aria-hidden", "false");
      lockScroll(); $("#lb-close").focus();
    };
    const close = () => {
      box.classList.remove("is-open"); box.setAttribute("aria-hidden", "true");
      unlockScroll();
      if (opener && document.body.contains(opener)) opener.focus();
    };
    $$(".mosaic__item").forEach((b) => b.addEventListener("click", () => open(b)));
    lbImg.addEventListener("error", () => { console.warn(`${LOG} No se pudo cargar la imagen ampliada.`); cap.textContent = "No se pudo cargar la imagen."; });
    $("#lb-close").addEventListener("click", close);
    prev.addEventListener("click", () => show(idx - 1));
    next.addEventListener("click", () => show(idx + 1));
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    document.addEventListener("keydown", (e) => {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft" && list.length > 1) show(idx - 1);
      else if (e.key === "ArrowRight" && list.length > 1) show(idx + 1);
      else if (e.key === "Tab") {
        const f = $$("button", box).filter((b) => !b.hidden), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* 9. REVEAL -------------------------------------------------------------- */
  function initReveal() {
    const els = $$(".reveal");
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window) || reduce) { els.forEach((e) => e.classList.add("is-visible")); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach((e) => io.observe(e));
  }

  /* 10. INIT --------------------------------------------------------------- */
  function init() {
    reportIssues();
    applyTheme();
    $("#main").addEventListener("error", onImgError, true); // los "error" de <img> no burbujean: se captura
    renderPage();
    checkStaticSeo();
    // initReveal primero: si algo de los inits siguientes falla, el
    // contenido ya quedó visible (nunca se queda oculto a pantalla).
    // Cada init se protege aparte para que un fallo aislado no deje el
    // resto de la página sin funcionar.
    const steps = [initReveal, initWhatsappFloat, initHeader, initLightbox];
    steps.forEach((fn) => {
      try { fn(); }
      catch (e) { console.error(`${LOG} Error al iniciar "${fn.name}":`, e); }
    });
    document.documentElement.setAttribute("data-premium", "ready");
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
