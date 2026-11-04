(function () {
  "use strict";

  const LOG = "[ALMATE Modelo C]";
  const Core = window.ModelCCore;
  const main = document.getElementById("main");
  if (!Core || !main) {
    console.error(LOG, "No se pudo iniciar: revisá el núcleo y la estructura de index.html.");
    if (main) main.innerHTML = '<p class="config-error" role="alert">No se pudo cargar el sitio. Revisá la configuración y los scripts.</p>';
    return;
  }

  const result = Core.normalize(typeof MODEL_C_CONFIG !== "undefined" ? MODEL_C_CONFIG : undefined);
  const C = result.cfg;
  const issues = result.issues;
  const SECTIONS = Core.enabledSections(C, issues);
  const ID = Core.SECTION_ID;
  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.prototype.slice.call((root || document).querySelectorAll(selector));
  const esc = Core.esc;
  const contact = C.contact;
  window.__MODEL_C_ISSUES__ = issues;
  if (!SECTIONS.length) {
    issues.push({ level: "error", path: "sections", message: "Habilitá al menos una sección con contenido." });
  }

  const navigationLabels = C.navigation.labels;
  const sectionEyebrow = (value) => value ? `<p class="section-eyebrow">${esc(value)}</p>` : "";
  const heading = (eyebrow, title, description) => `<header class="section-heading">
    ${sectionEyebrow(eyebrow)}${title ? `<h2>${esc(title)}</h2>` : ""}
    ${description ? `<p>${esc(description)}</p>` : ""}
  </header>`;
  const place = () => [contact.address, contact.locality].filter(Boolean).join(", ");
  const whatsappHref = (message) => contact.whatsapp
    ? `https://wa.me/${contact.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}`
    : "";
  const externalAttributes = (external) => external ? ' target="_blank" rel="noopener noreferrer"' : "";

  function getActionLink(action) {
    if (!action || !action.label) return null;
    switch (action.type) {
      case "contact":
        return SECTIONS.includes("contact") ? { href: `#${ID.contact}`, external: false } : null;
      case "whatsapp": {
        const href = whatsappHref(action.message || contact.whatsappMessage);
        return href ? { href, external: true } : null;
      }
      case "phone":
        return contact.phoneHref ? { href: contact.phoneHref, external: false } : null;
      case "email":
        return contact.email ? { href: `mailto:${contact.email}`, external: false } : null;
      case "url": {
        const href = Core.safeWebUrl(action.url);
        return href ? { href, external: true } : null;
      }
      default:
        return null;
    }
  }
  function actionButton(action, className) {
    const link = getActionLink(action);
    if (!link) return "";
    return `<a class="${className}" href="${esc(link.href)}"${externalAttributes(link.external)}>${esc(action.label)}${link.external ? '<span class="sr-only"> (se abre en una pestaña nueva)</span>' : ""}</a>`;
  }
  function applyTheme() {
    const root = document.documentElement.style;
    Object.keys(C.colors).forEach((key) => root.setProperty(`--${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, C.colors[key]));
    root.setProperty("--font-display", C.fonts.display);
    root.setProperty("--font-body", C.fonts.body);
    const theme = $('meta[name="theme-color"]');
    if (theme) theme.content = C.colors.primary;
  }

  const RENDERERS = {
    hero() {
      const h = C.hero;
      const primary = actionButton(h.primary, "button button--primary");
      const secondaryTarget = ID[h.secondary.target];
      const secondary = h.secondary.label && SECTIONS.includes(h.secondary.target)
        ? `<a class="button button--secondary" href="#${secondaryTarget}">${esc(h.secondary.label)}</a>` : "";
      const media = h.image
        ? `<div class="hero__image"><img src="${esc(Core.assetUrl(C, h.image))}" alt="${esc(h.imageAlt)}" width="960" height="840" fetchpriority="high" decoding="async"></div>`
        : '<div class="hero__art" aria-hidden="true"><span></span><i></i></div>';
      return `<section class="hero" id="inicio">
        <div class="hero__copy">${h.eyebrow ? `<p class="hero__eyebrow">${esc(h.eyebrow)}</p>` : ""}
          <h1>${esc(h.title)}${h.highlight ? ` <span>${esc(h.highlight)}</span>` : ""}</h1>
          ${h.description ? `<p class="hero__lead">${esc(h.description)}</p>` : ""}
          ${primary || secondary ? `<div class="hero__actions">${primary}${secondary}</div>` : ""}
          ${h.trustNote ? `<p class="hero__note"><span aria-hidden="true">✓</span> ${esc(h.trustNote)}</p>` : ""}
        </div>${media}</section>`;
    },
    trust() {
      const items = C.trust.items.map((item) => `<li><strong>${esc(item.value)}</strong><span>${esc(item.label)}</span></li>`).join("");
      return `<section class="trust" id="confianza" aria-label="Indicadores de confianza">
        ${C.trust.title ? `<h2 class="sr-only">${esc(C.trust.title)}</h2>` : ""}
        <ul>${items}</ul></section>`;
    },
    services() {
      const s = C.services;
      const cards = s.items.map((item, index) => {
        const image = item.image ? `<img src="${esc(Core.assetUrl(C, item.image))}" alt="${esc(item.alt)}" width="720" height="520" loading="lazy" decoding="async">` : "";
        const cta = item.cta.label ? actionButton(item.cta, "text-link") : "";
        return `<article class="service-card">
          ${image ? `<div class="service-card__image">${image}</div>` : `<span class="service-card__number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>`}
          <div class="service-card__body"><h3>${esc(item.name)}</h3>${item.description ? `<p>${esc(item.description)}</p>` : ""}${cta}</div>
        </article>`;
      }).join("");
      return `<section class="section section--services" id="servicios">
        ${heading(s.eyebrow, s.title, s.description)}<div class="service-grid">${cards}</div></section>`;
    },
    differentiators() {
      const cards = C.differentiators.items.map((item, index) => `<li class="difference-card">
        <span>${String(index + 1).padStart(2, "0")}</span><div><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p></div></li>`).join("");
      return `<section class="section section--differences" id="diferenciales">
        ${heading(C.differentiators.eyebrow, C.differentiators.title, "")}<ol class="difference-grid">${cards}</ol></section>`;
    },
    gallery() {
      const g = C.gallery;
      const items = g.items.map((item, index) => `<button class="gallery-card" type="button" data-gallery-item
          data-src="${esc(Core.assetUrl(C, item.src))}" data-alt="${esc(item.alt)}"
          aria-label="Ampliar imagen ${index + 1}${item.alt ? `: ${esc(item.alt)}` : ""}">
          <img src="${esc(Core.assetUrl(C, item.src))}" alt="${esc(item.alt)}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async">
          <span class="gallery-card__caption">${item.category ? `<span class="gallery-card__category">${esc(item.category)}</span>` : ""}
            ${item.title ? `<strong>${esc(item.title)}</strong>` : ""}${item.description ? `<span>${esc(item.description)}</span>` : ""}
          </span></button>`).join("");
      return `<section class="section section--gallery" id="proyectos">
        ${heading(g.eyebrow, g.title, g.description)}<div class="gallery-grid">${items}</div></section>`;
    },
    process() {
      const p = C.process;
      const steps = p.steps.map((step, index) => `<li class="process-step"><span class="process-step__number">${String(index + 1).padStart(2, "0")}</span>
        <div><h3>${esc(step.title)}</h3>${step.description ? `<p>${esc(step.description)}</p>` : ""}</div></li>`).join("");
      return `<section class="section section--process" id="proceso">
        ${heading(p.eyebrow, p.title, p.description)}<ol class="process-list">${steps}</ol></section>`;
    },
    testimonials() {
      const t = C.testimonials;
      const quotes = t.items.map((item) => `<figure class="testimonial-card"><blockquote>“${esc(item.quote)}”</blockquote>
        <figcaption><strong>${esc(item.author)}</strong>${item.role ? `<span>${esc(item.role)}</span>` : ""}</figcaption></figure>`).join("");
      return `<section class="section section--testimonials" id="testimonios">
        ${heading(t.eyebrow, t.title, "")}<div class="testimonial-grid">${quotes}</div></section>`;
    },
    faq() {
      const f = C.faq;
      const items = f.items.map((item) => `<details class="faq-item"><summary>${esc(item.question)}</summary><div class="faq-item__answer"><p>${esc(item.answer)}</p></div></details>`).join("");
      return `<section class="section section--faq" id="preguntas">
        ${heading(f.eyebrow, f.title, "")}<div class="faq-list">${items}</div></section>`;
    },
    coverage() {
      const c = C.coverage;
      const localityList = c.localities.length ? `<ul class="coverage__localities">${c.localities.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>` : "";
      const map = c.mapUrl ? `<div class="coverage__map"><iframe title="Mapa de cobertura de ${esc(C.brand.name)}" src="${esc(c.mapUrl)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>` : "";
      const directions = c.mapsUrl ? `<a class="text-link" href="${esc(c.mapsUrl)}" target="_blank" rel="noopener noreferrer">Cómo llegar<span class="sr-only"> (se abre en una pestaña nueva)</span></a>` : "";
      return `<section class="section section--coverage" id="cobertura">
        ${heading(c.eyebrow, c.title, c.description)}<div class="coverage__content">
          <div>${c.area ? `<p class="coverage__area">${esc(c.area)}</p>` : ""}
            ${c.address ? `<p class="coverage__address">${esc(c.address)}</p>` : ""}
            ${localityList}${directions}</div>${map}
        </div></section>`;
    },
    finalCta() {
      const cta = C.finalCta;
      return `<section class="final-cta" id="consulta"><div class="final-cta__inner">
        ${sectionEyebrow(cta.eyebrow)}<h2>${esc(cta.title)}</h2>
        ${cta.description ? `<p>${esc(cta.description)}</p>` : ""}
        ${actionButton(cta.button, "button button--light")}</div></section>`;
    },
    contact() {
      const c = C.contact;
      const socials = Object.keys(c.social).map((key) => `<a href="${esc(c.social[key])}" target="_blank" rel="noopener noreferrer">${esc(key.charAt(0).toUpperCase() + key.slice(1))}<span class="sr-only"> (se abre en una pestaña nueva)</span></a>`).join("");
      const lines = [
        place() && `<div><dt>Dirección</dt><dd>${esc(place())}</dd></div>`,
        c.hours && `<div><dt>Horarios</dt><dd>${esc(c.hours)}</dd></div>`,
        c.phone && `<div><dt>Teléfono</dt><dd>${c.phoneHref ? `<a href="${esc(c.phoneHref)}">${esc(c.phone)}</a>` : esc(c.phone)}</dd></div>`,
        c.email && `<div><dt>Email</dt><dd><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></dd></div>`,
        socials && `<div><dt>Redes</dt><dd class="social-links">${socials}</dd></div>`,
      ].filter(Boolean).join("");
      const wa = whatsappHref(c.whatsappMessage);
      return `<section class="section section--contact" id="contacto"><div class="contact__copy">
        ${sectionEyebrow(C.contactSection.eyebrow)}<h2>${esc(C.contactSection.title)}</h2>
        ${C.contactSection.description ? `<p>${esc(C.contactSection.description)}</p>` : ""}
        ${wa ? `<a class="button button--primary" href="${esc(wa)}" target="_blank" rel="noopener noreferrer">Escribir por WhatsApp<span class="sr-only"> (se abre en una pestaña nueva)</span></a>` : ""}
        </div>${lines ? `<dl class="contact__details">${lines}</dl>` : ""}</section>`;
    },
  };

  function renderPage() {
    const sections = SECTIONS.map((key) => {
      try { return RENDERERS[key](); }
      catch (error) {
        console.error(`${LOG} No se pudo renderizar "${key}":`, error);
        return "";
      }
    }).join("");
    const errors = issues.filter((issue) => issue.level === "error");
    const notice = errors.length
      ? `<div class="config-error" role="alert"><strong>Revisá la configuración del sitio.</strong><ul>${errors.map((issue) => `<li>${esc(issue.path)}: ${esc(issue.message)}</li>`).join("")}</ul></div>`
      : "";
    main.innerHTML = notice + sections;

    const brandTarget = SECTIONS.includes("hero") ? "#inicio" : (SECTIONS.length ? `#${ID[SECTIONS[0]]}` : "#main");
    $$(".js-brand").forEach((element) => {
      element.textContent = C.brand.name;
      element.href = brandTarget;
    });
    const brandLink = $("#brand-link");
    brandLink.setAttribute("aria-label", `${C.brand.name}, inicio`);
    if (C.brand.logo) {
      brandLink.innerHTML = `<img src="${esc(Core.assetUrl(C, C.brand.logo))}" alt="${esc(C.brand.logoAlt || C.brand.name)}" width="160" height="48">`;
    }
    const description = $("#footer-description");
    description.textContent = C.brand.description;
    description.hidden = !C.brand.description;
    $("#footer-year").textContent = String(new Date().getFullYear());
    $("#footer-copyright").textContent = C.brand.name;
    $("#footer-nav-label").textContent = C.footer.navigationLabel;
    const credit = $("#footer-credit");
    credit.textContent = Core.CREDIT;
    if (C.footer.creditUrl) {
      credit.href = C.footer.creditUrl;
      credit.target = "_blank";
      credit.rel = "noopener noreferrer";
    }
    const navLinks = SECTIONS.map((key) => `<li><a href="#${ID[key]}">${esc(navigationLabels[key] || key)}</a></li>`).join("");
    $("#nav-list").innerHTML = navLinks;
    $("#footer-nav").innerHTML = navLinks;
    const footerContact = [
      place() && `<p>${esc(place())}</p>`,
      contact.phone && `<p>${contact.phoneHref ? `<a href="${esc(contact.phoneHref)}">${esc(contact.phone)}</a>` : esc(contact.phone)}</p>`,
      contact.email && `<p><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></p>`,
      contact.hours && `<p>${esc(contact.hours)}</p>`,
      contact.whatsapp && `<p><a href="${esc(whatsappHref(contact.whatsappMessage))}" target="_blank" rel="noopener noreferrer">WhatsApp</a></p>`,
      Object.keys(contact.social).length && `<p class="footer-social">${Object.keys(contact.social).map((key) => `<a href="${esc(contact.social[key])}" target="_blank" rel="noopener noreferrer">${esc(key.charAt(0).toUpperCase() + key.slice(1))}</a>`).join("")}</p>`,
    ].filter(Boolean).join("");
    $("#footer-contact").innerHTML = footerContact;
    $("#footer-contact").closest(".footer__contact").hidden = !footerContact;
    const navCta = actionButton(C.navigation.cta, "button button--header");
    $("#header-action").innerHTML = navCta;
  }

  function checkStaticSeo() {
    const seo = Core.buildSeo(C, SECTIONS);
    const meta = (selector) => $(selector) ? $(selector).getAttribute("content") || "" : "";
    const canonical = $('link[rel="canonical"]');
    const preload = $('link[rel="preload"][as="image"]');
    const stale = [];
    if (document.title !== seo.title) stale.push("title");
    if (meta('meta[name="description"]') !== seo.description) stale.push("description");
    if ((canonical ? canonical.href : "") !== (seo.canonical || "")) stale.push("canonical");
    if (meta('meta[property="og:title"]') !== seo.title) stale.push("Open Graph");
    if (meta('meta[property="og:site_name"]') !== seo.brand) stale.push("Open Graph site name");
    if ((preload ? preload.getAttribute("href") : "") !== (seo.heroPreload || "")) stale.push("preload del hero");
    window.__MODEL_C_SEO_STALE__ = stale;
    if (stale.length) {
      console.warn(`${LOG} El SEO estático no coincide con config.modelo-c.js (${stale.join(", ")}). Ejecutá "node modelo-c/tools/sync-seo.js".`);
    }
  }

  function logIssues() {
    if (!issues.length) return;
    issues.forEach((issue) => {
      const output = issue.level === "error" ? console.error : console.warn;
      output.call(console, `${LOG} ${issue.path}: ${issue.message}`);
    });
  }
  function updateImageFailure(event) {
    const image = event.target;
    if (!image || image.tagName !== "IMG") return;
    console.warn(`${LOG} No se pudo cargar la imagen "${image.getAttribute("src")}".`);
    const galleryItem = image.closest("[data-gallery-item]");
    if (galleryItem) {
      galleryItem.remove();
      if (!$("[data-gallery-item]")) removeSection("proyectos");
      return;
    }
    const serviceImage = image.closest(".service-card__image");
    if (serviceImage) { serviceImage.remove(); return; }
    const heroImage = image.closest(".hero__image");
    if (heroImage) { heroImage.remove(); $(".hero").classList.add("hero--no-image"); return; }
    const logo = image.closest(".brand-link");
    if (logo) logo.textContent = C.brand.name;
    else image.remove();
  }
  function removeSection(id) {
    const section = document.getElementById(id);
    if (section) section.remove();
    $$(`a[href="#${id}"]`).forEach((link) => link.remove());
    $$(`li:empty`).forEach((item) => item.remove());
  }

  function initHeader() {
    const header = $("#site-header");
    const toggle = $("#menu-toggle");
    const nav = $("#site-nav");
    const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
    const visible = (element) => !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    const setOpen = (open) => {
      header.classList.toggle("is-menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    };
    const close = (returnFocus) => {
      setOpen(false);
      if (returnFocus) toggle.focus();
    };
    toggle.addEventListener("click", () => {
      const open = !isOpen();
      setOpen(open);
      if (open) {
        const first = $("a", nav);
        if (first) first.focus();
      }
    });
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) close(false);
    });
    header.addEventListener("keydown", (event) => {
      if (!isOpen()) return;
      if (event.key === "Escape") { close(true); return; }
      if (event.key !== "Tab") return;
      const focusables = $$("a, button", header).filter(visible);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    const breakpoint = window.matchMedia("(min-width: 1200px)");
    const onBreakpoint = (event) => { if (event.matches) close(false); };
    if (breakpoint.addEventListener) breakpoint.addEventListener("change", onBreakpoint);
    else if (breakpoint.addListener) breakpoint.addListener(onBreakpoint);
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initLightbox() {
    const dialog = $("#lightbox");
    const image = $("#lightbox-image");
    const caption = $("#lightbox-caption");
    const closeButton = $("#lightbox-close");
    let activeItems = [];
    let index = 0;
    let opener = null;
    const show = (nextIndex) => {
      index = (nextIndex + activeItems.length) % activeItems.length;
      const item = activeItems[index];
      image.src = item.dataset.src;
      image.alt = item.dataset.alt || "";
      caption.textContent = item.dataset.alt || "";
      $("#lightbox-count").textContent = `${index + 1} / ${activeItems.length}`;
      const multiple = activeItems.length > 1;
      $("#lightbox-prev").hidden = !multiple;
      $("#lightbox-next").hidden = !multiple;
      $("#lightbox-count").hidden = !multiple;
    };
    const close = () => {
      dialog.hidden = true;
      dialog.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
      image.removeAttribute("src");
      if (opener && document.body.contains(opener)) opener.focus();
    };
    $$("[data-gallery-item]").forEach((item) => item.addEventListener("click", () => {
      activeItems = $$("[data-gallery-item]");
      opener = item;
      show(activeItems.indexOf(item));
      dialog.hidden = false;
      dialog.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
      closeButton.focus();
    }));
    closeButton.addEventListener("click", close);
    $("#lightbox-prev").addEventListener("click", () => show(index - 1));
    $("#lightbox-next").addEventListener("click", () => show(index + 1));
    dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
    image.addEventListener("error", () => {
      console.warn(`${LOG} No se pudo cargar la imagen ampliada.`);
      caption.textContent = "No se pudo cargar esta imagen.";
    });
    document.addEventListener("keydown", (event) => {
      if (dialog.hidden) return;
      if (event.key === "Escape") close();
      else if (event.key === "ArrowLeft" && activeItems.length > 1) show(index - 1);
      else if (event.key === "ArrowRight" && activeItems.length > 1) show(index + 1);
      else if (event.key === "Tab") {
        const focusables = $$("button", dialog).filter((button) => !button.hidden);
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
  }

  function init() {
    logIssues();
    applyTheme();
    document.addEventListener("error", updateImageFailure, true);
    renderPage();
    checkStaticSeo();
    initHeader();
    initLightbox();
    document.documentElement.dataset.modelC = "ready";
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
