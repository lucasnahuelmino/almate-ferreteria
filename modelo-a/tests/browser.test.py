"""Pruebas de navegador (Chromium + Playwright) del Modelo A.
Uso desde la raíz: python modelo-a/tests/browser.test.py
Requiere Playwright para Python y Chromium (sin dependencias de producción).

Cubre: carga inicial y SEO estático, sistema de logo (presente,
proporcional y con fallback a texto), paleta clara unificada, catálogo
vacío por defecto, catálogo con datos de prueba (búsqueda, filtros,
lista de consulta, WhatsApp), configuración inválida/inyectada y
responsive.
"""
import functools
import http.server
import json
import os
import socketserver
import sys
import threading
import urllib.parse

from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


handler = functools.partial(QuietHandler, directory=ROOT)
server = socketserver.TCPServer(("127.0.0.1", 0), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{server.server_address[1]}/modelo-a/index.html"
results = []

SAMPLE_ITEMS = [
    {
        "name": "Martillo de uña",
        "category": "Herramientas",
        "sku": "MH-01",
        "brand": "Acme",
        "price": 4500,
        "description": "Cabeza forjada, mango de fibra.",
    },
    {"name": "Taladro 650W", "category": "Eléctricas", "sku": "TL-650", "price": None},
    {"name": "Cemento Portland 25kg", "category": "Construcción", "availability": "Consultar stock"},
]


def check(name, condition, detail=""):
    results.append((name, bool(condition), detail))
    print(("[OK] " if condition else "[FAIL] ") + name + (f" -> {detail}" if detail and not condition else ""))


def open_page(browser, width=1280, height=900):
    context = browser.new_context(viewport={"width": width, "height": height})
    page = context.new_page()
    errors = []
    console_errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))

    def on_console(message):
        # El ruido de red (fonts, mapa, imágenes) no es un error de JS.
        if message.type == "error" and "Failed to load resource" not in message.text:
            console_errors.append(message.text)

    page.on("console", on_console)
    # domcontentloaded: no dependemos de recursos externos (fuentes de
    # Google, mapa embebido) para dar la página por cargada.
    page.goto(BASE, wait_until="domcontentloaded")
    page.wait_for_timeout(900)
    return context, page, errors, console_errors


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()

        print("\n[1] Carga inicial, marca y SEO")
        context, page, errors, console_errors = open_page(browser)
        check("carga sin errores JS ni de consola", not errors and not console_errors, str(errors + console_errors))
        check("un solo h1", page.locator("h1").count() == 1)
        check("sin scroll horizontal en escritorio",
              page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"))

        header_logo = page.locator(".header__logo img")
        footer_logo = page.locator(".footer__logo img")
        logo_ok = (
            header_logo.count() == 1
            and footer_logo.count() == 1
            and header_logo.get_attribute("alt") == "Logo de FREN Ferreterías"
            and header_logo.get_attribute("src").endswith("img/logo_local.png")
            and footer_logo.get_attribute("src") == header_logo.get_attribute("src")
        )
        check("logo idéntico en header y footer, con alt", logo_ok)
        check("logo proporcional (object-fit contain, 500x500 sin deformar)",
              page.evaluate("""() => {
                const img = document.querySelector('.header__logo img');
                if (!img) return false;
                const style = getComputedStyle(img);
                return img.naturalWidth === 500 && img.naturalHeight === 500 &&
                  style.objectFit === 'contain' && img.getBoundingClientRect().height > 0;
              }"""))

        check("paleta clara aplicada (fondo #F4F6F8, acento #163A5F)",
              page.evaluate("getComputedStyle(document.body).backgroundColor") == "rgb(244, 246, 248)"
              and page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim().toLowerCase()") == "#163a5f")

        meta = page.locator("meta[name='description']")
        check("meta description única y con el nombre del negocio",
              meta.count() == 1 and meta.get_attribute("content").startswith("FREN Ferreterías"))
        check("sin canonical ni metadatos de un dominio inventado",
              page.locator("link[rel='canonical']").count() == 0
              and page.locator("meta[property='og:url']").count() == 0
              and page.locator("meta[property='og:image']").count() == 0
              and page.locator("meta[name='twitter:image']").count() == 0
              and page.locator("html").inner_html().count("ferreteriaelyunque") == 0)

        ld = json.loads(page.locator("script[type='application/ld+json']").inner_text())
        check("JSON-LD válido y sin datos inventados",
              ld.get("@type") == "HardwareStore"
              and ld.get("name") == "FREN Ferreterías"
              and ld.get("telephone") == "+541142502865"
              and ld["address"].get("streetAddress") == "Andrés Baranda 1309"
              and ld["address"].get("addressLocality") == "Quilmes"
              and all(key not in ld for key in ("url", "image", "priceRange", "sameAs")))

        check("crédito ALMATE obligatorio visible",
              "Desarrollado por ALMATE · Soluciones digitales" in page.locator(".almate-signature").inner_text())
        check("sin testimonios ficticios", page.locator(".testimonials").count() == 0)
        check("sin precios inventados en las tarjetas de rubro",
              page.locator(".menu-card__price").count() == 0
              and "$" not in page.locator(".menu__grid").inner_text())
        check("navegación de header y footer enlazan al catálogo",
              page.locator("#header-nav a[href='#catalogo']").count() == 1
              and page.locator(".footer__nav a[href='#catalogo']").count() == 1)
        context.close()

        print("\n[2] Catálogo vacío por defecto (sin datos inventados)")
        context, page, errors, console_errors = open_page(browser)
        check("sin productos inventados", page.locator(".product-card").count() == 0)
        check("controles de búsqueda y rubros ocultos", page.locator("#catalog-controls").is_hidden())
        empty_text = page.locator("#catalog-empty").inner_text()
        check("estado vacío visible y sin precios",
              page.locator("#catalog-empty").is_visible() and "Todavía no hay productos" in empty_text
              and "$" not in empty_text)
        check("lista de consulta arranca vacía",
              page.locator("#consult-count").inner_text() == "0 artículos"
              and page.locator("#consult-whatsapp").is_hidden()
              and page.locator("#consult-clear").is_hidden()
              and page.locator("#consult-empty").is_visible())
        check("sin errores JS con el catálogo vacío", not errors and not console_errors, str(errors + console_errors))
        context.close()

        print("\n[3] Catálogo con datos de prueba: búsqueda, filtros y lista")
        context, page, errors, console_errors = open_page(browser)
        page.evaluate("items => { ALMATECatalog.load(items); ALMATECatalog.render(); }", SAMPLE_ITEMS)
        check("renderiza los tres artículos", page.locator(".product-card").count() == 3)
        check("muestra los controles de búsqueda y rubros", page.locator("#catalog-controls").is_visible())
        check("botón de rubro por cada rubro + Todos", page.locator(".catalog__category").count() == 4)

        first_price = page.locator(".product-card__price").first.inner_text()
        check("precio informado se muestra y el resto invita a consultar",
              "4.500" in first_price and page.locator(".product-card__price.is-consult").count() == 2)
        check("disponibilidad solo cuando está informada",
              page.locator(".product-card__availability").count() == 1
              and "Consultar stock" in page.locator(".product-card__availability").inner_text())

        page.fill("#catalog-search", "taladro")
        page.wait_for_timeout(150)
        check("la búsqueda filtra por nombre", page.locator(".product-card").count() == 1)
        page.fill("#catalog-search", "zzz")
        page.wait_for_timeout(150)
        check("búsqueda sin resultados informa el estado vacío",
              page.locator("#catalog-empty").is_visible()
              and "No encontramos productos" in page.locator("#catalog-empty").inner_text())
        page.fill("#catalog-search", "")
        page.wait_for_timeout(150)
        page.locator(".catalog__category", has_text="Herramientas").click()
        page.wait_for_timeout(150)
        check("el filtro por rubro acota la grilla", page.locator(".product-card").count() == 1)
        page.locator(".catalog__category", has_text="Todos").click()
        page.wait_for_timeout(150)

        page.locator("[data-add]").first.click()
        page.locator("[data-add]").nth(1).click()
        check("agregar a la lista actualiza el contador",
              page.locator("#consult-count").inner_text() == "2 artículos"
              and page.locator(".consult__item").count() == 2
              and page.locator("#consult-whatsapp").is_visible())

        href = page.locator("#consult-whatsapp").get_attribute("href")
        decoded = urllib.parse.unquote(href or "")
        check("enlace de WhatsApp con el número y los artículos",
              href.startswith("https://wa.me/541142502865?text=")
              and "Martillo de uña" in decoded and "MH-01" in decoded)

        message = page.evaluate("ALMATECatalog.message()")
        taladro_segment = message.split("- Taladro 650W")[1] if "- Taladro 650W" in message else ""
        check("mensaje con comercio, cantidades y precio solo si está informado",
              "FREN Ferreterías" in message
              and "- Martillo de uña (1 u.)" in message
              and "Precio: " in message.split("- Martillo de uña")[1].split("- ")[0]
              and "- Taladro 650W (1 u.)" in message
              and "Precio" not in taladro_segment.split("- ")[0])

        page.locator("[data-qty]").first.fill("3")
        page.locator("[data-qty]").first.press("Tab")
        page.wait_for_timeout(150)
        check("la cantidad se refleja en el mensaje",
              "Martillo de uña (3 u.)" in page.evaluate("ALMATECatalog.message()"))

        stored = page.evaluate("localStorage.getItem('alma-consulta-a-v1')") or ""
        check("la lista se guarda en almacenamiento local", "mh-01" in stored)
        page.evaluate("items => ALMATECatalog.reload(items)", SAMPLE_ITEMS)
        check("la lista se restaura al volver a cargar",
              page.locator("#consult-count").inner_text() == "2 artículos"
              and page.locator(".consult__item").count() == 2)

        page.locator("[data-remove]").first.click()
        check("quitar un artículo baja el contador", page.locator("#consult-count").inner_text() == "1 artículo")
        page.locator("#consult-clear").click()
        check("vaciar la lista vuelve al estado inicial",
              page.locator("#consult-count").inner_text() == "0 artículos"
              and page.locator("#consult-empty").is_visible()
              and page.locator("#consult-whatsapp").is_hidden())
        check("sin errores JS durante la interacción", not errors and not console_errors, str(errors + console_errors))
        context.close()

        print("\n[4] Configuración inválida e inyección de HTML")
        context, page, errors, console_errors = open_page(browser)
        page.evaluate("""() => {
          ALMATECatalog.load([
            {},
            {name: 5},
            "no-objeto",
            {
              name: '<img src=x onerror="window.__injected=1">',
              price: "caro",
              image: "../secreto.png",
              availability: 123,
              category: "<b>Rubro</b>",
            },
          ]);
          ALMATECatalog.render();
        }""")
        check("solo el artículo válido se renderiza y sin excepciones",
              page.locator(".product-card").count() == 1 and not errors, str(errors))
        check("el HTML se muestra como texto, no se ejecuta",
              "<img src=x onerror=" in page.locator(".product-card h3").inner_text()
              and page.evaluate("window.__injected") is None)
        check("sin imágenes ni precios inválidos",
              page.locator(".product-card img").count() == 0
              and page.locator(".product-card__price.is-consult").count() == 1
              and page.locator(".product-card__availability").count() == 0)
        context.close()

        print("\n[5] Logo: fallback a texto y rutas inseguras")
        context, page, errors, console_errors = open_page(browser)
        page.evaluate("() => { SITE_CONFIG.logo = 'img/no-existe.png'; applyLogo(); }")
        page.wait_for_timeout(600)
        check("si el logo falta, el nombre queda en texto (header y footer)",
              page.locator(".header__logo img").count() == 0
              and page.locator(".header__logo").inner_text().strip() == "FREN Ferreterías"
              and page.locator(".footer__logo img").count() == 0
              and page.locator(".footer__logo").inner_text().strip() == "FREN Ferreterías")
        page.evaluate("() => { SITE_CONFIG.logo = 'javascript:alert(1)'; applyLogo(); }")
        page.wait_for_timeout(200)
        check("una ruta insegura se ignora",
              page.locator(".header__logo img[src^='javascript:']").count() == 0
              and page.evaluate("window.__injected") is None)
        page.evaluate("() => { SITE_CONFIG.logo = 'img/logo_local.png'; applyLogo(); }")
        page.wait_for_timeout(400)
        check("con una ruta válida el logo vuelve a renderizarse",
              page.locator(".header__logo img").count() == 1
              and page.locator(".header__logo img").get_attribute("src").endswith("img/logo_local.png"))
        check("sin errores JS durante los cambios de logo", not errors and not console_errors, str(errors + console_errors))
        context.close()

        print("\n[6] Responsive")
        for width in (320, 390, 768, 1440):
            context, page, errors, console_errors = open_page(browser, width=width, height=900)
            check(f"{width}px: sin scroll horizontal y un solo h1",
                  page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
                  and page.locator("h1").count() == 1)
            check(f"{width}px: sin errores JS", not errors and not console_errors, str(errors + console_errors))
            context.close()

        browser.close()

    server.server_close()
    passed = sum(1 for _, ok, _ in results if ok)
    total = len(results)
    print(f"\n{passed}/{total} comprobaciones correctas.")
    if passed != total:
        for name, ok, detail in results:
            if not ok:
                print(f"  [FAIL] {name} -> {detail}")
        sys.exit(1)


if __name__ == "__main__":
    main()
