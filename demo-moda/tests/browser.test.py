"""Pruebas funcionales de la Demo Moda con Chromium.
Ejecutar desde la raíz del repositorio: python demo-moda/tests/browser.test.py
Requiere Playwright para Python y su navegador Chromium.
"""
import functools
import http.server
import json
import os
import socketserver
import threading

from playwright.sync_api import sync_playwright

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

OVERRIDE_NO_WHATSAPP = {
    "brand": {"name": "Tienda Sin WhatsApp", "description": "Demo de prueba."},
    "contact": {"whatsapp": "", "email": "hola@demo.example"},
    "sections": ["hero", "catalog"],
    "hero": {"title": "Tienda de prueba", "subtitle": "Demo.", "ctaLabel": "Ver", "ctaAnchor": "#catalogo"},
    "catalog": {"title": "Prendas", "subtitle": "Catálogo."},
    "seo": {"title": "Tienda de prueba"},
}


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


handler = functools.partial(QuietHandler, directory=ROOT)


class ThreadingServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


server = ThreadingServer(("127.0.0.1", 0), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE_URL = f"http://127.0.0.1:{server.server_address[1]}/demo-moda/index.html"
results = []


def check(name, condition, detail=""):
    results.append((name, bool(condition), detail))
    print(("[OK] " if condition else "[FAIL] ") + name + (f" -> {detail}" if detail and not condition else ""))


def open_page(browser, config=None, width=1440, height=950):
    context = browser.new_context(viewport={"width": width, "height": height})
    page = context.new_page()
    page.console_errors = []
    page.page_errors = []
    page.failed_responses = []
    page.on("console", lambda message: page.console_errors.append(message.text) if message.type == "error" else None)
    page.on("pageerror", lambda error: page.page_errors.append(str(error)))
    page.on("response", lambda response: page.failed_responses.append(f"{response.status} {response.url}") if response.status >= 400 else None)
    if config is not None:
        body = "const MODA_CONFIG = " + json.dumps(config, ensure_ascii=False) + ";"
        page.route("**/demo-moda/js/config.moda.js", lambda route: route.fulfill(
            status=200, content_type="application/javascript; charset=utf-8", body=body
        ))
    page.goto(BASE_URL, wait_until="networkidle")
    return context, page


try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()

        print("\n[1] Carga, renderizado y SEO")
        context, page = open_page(browser)
        check("título y meta descripción", page.title() == "ALMATE · Indumentaria contemporánea" and
              page.locator('meta[name="description"]').count() == 1)
        check("un solo h1", page.locator("h1").count() == 1)
        check("catálogo renderiza 8 tarjetas Cutout", page.locator("#catalog-grid .cutout").count() == 8)
        check("navegación principal con 5 enlaces", page.locator("#nav-list li").count() == 5)
        check("JSON-LD estático presente", page.locator("#ld-json").count() == 1)
        check("crédito ALMATE obligatorio",
              page.locator("#footer-credit").text_content() == "Desarrollado por ALMATE · Soluciones digitales.",
              page.locator("#footer-credit").text_content())
        check("sin errores de consola ni de página", not page.console_errors and not page.page_errors,
              (page.console_errors, page.page_errors))
        check("sin respuestas con error HTTP", not page.failed_responses, page.failed_responses[:5])
        context.close()

        print("\n[2] Responsive")
        for width in (360, 390, 768, 1024, 1440):
            context, page = open_page(browser, width=width)
            check(f"{width}px: sin desbordamiento horizontal",
                  page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth"))
            check(f"{width}px: un solo h1 y catálogo visible", page.locator("h1").count() == 1 and
                  page.locator("#catalog-grid .cutout").count() == 8)
            check(f"{width}px: sin errores", not page.page_errors and not page.console_errors,
                  (page.page_errors, page.console_errors))
            context.close()

        print("\n[3] Búsqueda y orden")
        context, page = open_page(browser)
        page.locator("#filter-search").fill("camisa")
        check("búsqueda por nombre", page.locator("#catalog-grid .cutout").count() == 1 and
              "Camisa Oversize" in page.locator("#catalog-grid .cutout__name").first.inner_text())
        page.locator("#filter-search").fill("sin coincidencias")
        check("estado vacío informa", page.locator("#catalog-empty").is_visible())
        page.locator("#filter-search").fill("")
        page.locator("#filter-sort").select_option("price-asc")
        check("orden por precio ascendente", page.locator("#catalog-grid .cutout__name").first.inner_text() == "Bufanda de Lana")
        context.close()

        print("\n[4] Filtros: panel desplegable, combinación, contador y limpieza")
        context, page = open_page(browser)
        check("panel de filtros cerrado por defecto",
              page.locator("#catalog-filters").evaluate("el => el.classList.contains('is-open')") is False)
        page.locator("#filter-toggle").click()
        check("el botón abre el panel",
              page.locator("#catalog-filters").evaluate("el => el.classList.contains('is-open')") is True)
        page.locator('.filter-group[data-filter-group="category"] summary').click()
        page.locator('#filter-categories [data-category="abrigos"]').click()
        check("filtro por categoría", page.locator("#catalog-grid .cutout").count() == 1 and
              "Campera de Abrigo" in page.locator("#catalog-grid .cutout__name").inner_text())
        check("indicador de filtros activos", page.locator("#filter-count").inner_text() == "1" and
              page.locator("#filter-toggle").evaluate("el => el.classList.contains('is-active')") is True)
        page.locator('.filter-group[data-filter-group="gender"] summary').click()
        page.locator('#filter-genders [data-gender="mujer"]').click()
        check("combinación categoría + género", page.locator("#catalog-grid .cutout").count() == 1)
        check("contador refleja dos filtros", page.locator("#filter-count").inner_text() == "2")
        page.locator('#filter-categories [data-category=""]').click()
        check("quitar un filtro conserva el otro", page.locator("#catalog-grid .cutout").count() == 4 and
              page.locator("#filter-count").inner_text() == "1")
        page.locator("#filter-clear").click()
        check("limpiar restaura catálogo y contador", page.locator("#catalog-grid .cutout").count() == 8 and
              page.locator("#filter-count").is_hidden())
        page.locator("#filter-toggle").click()
        page.keyboard.press("Escape")
        check("Escape cierra el panel",
              page.locator("#catalog-filters").evaluate("el => el.classList.contains('is-open')") is False)
        page.locator("#filter-toggle").click()
        page.locator("#catalog-count").click()
        check("clic fuera cierra el panel",
              page.locator("#catalog-filters").evaluate("el => el.classList.contains('is-open')") is False)
        context.close()

        print("\n[5] Ficha, variantes y validación")
        context, page = open_page(browser)
        page.locator('[data-open-product="camisa-oversize"]').click()
        check("se abre la ficha modal", page.locator("#product-modal").evaluate("el => el.open") is True)
        page.locator('#pd-colors [data-color="Negro"]').click()
        page.locator('#pd-sizes [data-size="M"]').click()
        check("disponibilidad informada", "Disponible" in page.locator("#pd-availability").inner_text())
        page.locator('#pd-colors [data-color="Crudo"]').click()
        check("talle no disponible queda deshabilitado", page.locator('#pd-sizes [data-size="XL"]').is_disabled())
        page.locator('#pd-colors [data-color="Negro"]').click()
        page.locator('#pd-sizes [data-size="M"]').click()
        page.locator("#pd-add").click()
        check("agregar suma una unidad al carrito", page.locator("#cart-count").inner_text() == "1")
        context.close()

        print("\n[6] Carrito, WhatsApp y persistencia")
        context, page = open_page(browser)
        page.locator('[data-open-product="camisa-oversize"]').click()
        page.locator('#pd-colors [data-color="Negro"]').click()
        page.locator('#pd-sizes [data-size="M"]').click()
        page.locator("#pd-add").click()
        page.locator("#cart-open").click()
        check("drawer muestra nombre y variante",
              "Camisa Oversize" in page.locator(".cart-item__name").inner_text() and
              "Negro · Talle M" in page.locator(".cart-item__variant").inner_text())
        page.locator('.cart-item__qty [data-qty="1"]').click()
        check("cantidad y total se actualizan", page.locator(".cart-item__qty span").inner_text() == "2" and
              page.locator("#cart-total").inner_text() == "$91.800")
        href = page.locator("#cart-whatsapp").get_attribute("href")
        check("enlace de WhatsApp con número y mensaje", href.startswith("https://wa.me/5491130000000?text=") and
              "Camisa" in href and "Oversize" in href and "TOTAL" in href)
        page.reload(wait_until="networkidle")
        check("persistencia tras recargar", page.locator("#cart-count").inner_text() == "2")
        page.locator("#cart-open").click()
        page.locator(".cart-item__remove").click()
        check("quitar deja el carrito vacío", page.locator("#cart-count").is_hidden() and
              page.locator("#cart-empty").is_visible())
        context.close()

        print("\n[7] Navegación y FAQ")
        context, page = open_page(browser)
        page.locator('.nav-filter[data-sale="true"]').click()
        check("navegación 'Sale' filtra productos en oferta", page.locator("#catalog-grid .cutout").count() == 3)
        page.locator(".faq__item summary").first.click()
        check("FAQ abre con acordeón nativo", page.locator(".faq__item").first.evaluate("el => el.open") is True)
        context.close()

        print("\n[8] Sin WhatsApp configurado")
        context, page = open_page(browser, OVERRIDE_NO_WHATSAPP)
        check("sin número de WhatsApp no se habilita el envío",
              page.locator("#cart-whatsapp").get_attribute("href") is None or
              page.locator("#cart-whatsapp").is_disabled())
        context.close()

        print("\n[9] Footer compacto de tres bloques")
        context, page = open_page(browser)
        check("footer con tres bloques", page.locator(".footer__grid > *").count() == 3)
        check("bloque Explorar integra navegación y categorías",
              page.locator('.footer__nav[aria-label="Explorar"]').count() == 1 and
              page.locator('.footer__nav[aria-label="Explorar"] li').count() >= 5)
        check("sin enlaces de categoría duplicados",
              page.locator('.footer__nav[aria-label="Explorar"]').inner_text().lower().count("accesorios") == 1)
        check("crédito ALMATE en el footer",
              "Desarrollado por ALMATE · Soluciones digitales" in page.locator("#footer-credit").inner_text())
        check("footer sin desbordamiento",
              page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth"))
        context.close()

        browser.close()

finally:
    server.shutdown()
    server.server_close()

total = len(results)
passed = sum(1 for _, ok, _ in results if ok)
print(f"\nRESUMEN: {passed}/{total} comprobaciones aprobadas.")
if passed != total:
    sys.exit(1)
