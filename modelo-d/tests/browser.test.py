"""Functional Chromium tests for Model D.
Run from the repository root with: python modelo-d/tests/browser.test.py
Requires Playwright for Python and its Chromium browser.
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
BASE_CONFIG = {
    "sections": ["hero", "categories", "featured", "catalog", "consultation", "about", "process", "faq", "contact"],
    "assetBase": "../img/",
    "brand": {"name": "Comercio de prueba", "short": "TEST", "description": "Configuración funcional de prueba."},
    "theme": {"ink": "#171b20", "paper": "#f5f7fa", "steel": "#252c34", "accent": "#1769ff", "accentInk": "#ffffff", "accentWarm": "#f27632", "accentWarmInk": "#171b20", "muted": "#b5bec8", "mutedInk": "#505b67", "line": "#39434e", "lineLight": "#d5dce4"},
    "seo": {"title": "Comercio de prueba | Catálogo", "description": "Productos de prueba.", "url": "https://catalogo.example/tienda/"},
    "currency": {"locale": "es-AR", "code": "ARS"},
    "display": {"showSku": True, "showBrand": True, "showAvailability": True, "showPrices": True},
    "navigation": {"labels": {"hero": "Inicio", "categories": "Rubros", "catalog": "Catálogo", "consultation": "Mi consulta"}},
    "header": {"cta": {"label": "Ver consulta", "type": "anchor", "value": "#consulta"}},
    "hero": {"titleLines": ["Catálogo de prueba"], "lead": "Contenido temporal de pruebas."},
    "categories": [
        {"id": "herramientas", "name": "Herramientas", "order": 1},
        {"id": "electricidad", "name": "Electricidad", "order": 2},
    ],
    "categoriesSection": {"title": "Categorías"},
    "featured": {"title": "Destacados"},
    "catalog": {
        "title": "Productos",
        "searchPlaceholder": "Buscar por producto, código o marca",
        "emptyText": "No hay productos que coincidan.",
        "products": [
            {
                "id": "taladro-azul", "sku": "T-100", "name": "Taladro Azul", "category": "herramientas",
                "subcategory": "Eléctricas", "brand": "Acme", "shortDescription": "Descripción corta.",
                "description": "Descripción completa de prueba.", "mainImage": "categoria-herramientas-electricas.jpg",
                "mainImageAlt": "Taladro eléctrico de prueba", "gallery": [
                    {"src": "categoria-herramientas-manuales.jpg", "alt": "Detalle de taladro de prueba"}
                ],
                "price": 25000, "previousPrice": 30000, "unit": "unidad",
                "availability": "Consultar disponibilidad", "specifications": [
                    {"name": "Potencia", "value": "Dato técnico de prueba"}
                ],
                "tags": ["Prueba"], "featured": True, "order": 3,
            },
            {
                "id": "martillo-fijo", "sku": "M-05", "name": "Martillo Fijo", "category": "herramientas",
                "subcategory": "Manuales", "brand": "Beta", "shortDescription": "Artículo de prueba sin precio ni imagen.",
                "featured": False, "order": 2,
            },
            {
                "id": "disyuntor", "sku": "D-10", "name": "Disyuntor", "category": "electricidad",
                "subcategory": "Protección", "brand": "Acme", "price": 1500, "featured": True, "order": 1,
                "mainImage": "categoria-electricidad.jpg", "mainImageAlt": "Disyuntor de prueba",
            },
            {
                "id": "amoladora", "sku": "A-20", "name": "Amoladora", "category": "herramientas",
                "subcategory": "Eléctricas", "brand": "Gamma", "price": 5000, "featured": False, "order": 4,
            },
        ],
    },
    "consultation": {"title": "Tu consulta", "storageKey": "modelo-d-browser-tests", "persist": True},
    "about": {"title": "Información comercial"},
    "process": {"title": "Cómo consultar", "items": []},
    "faq": {"title": "Preguntas", "items": []},
    "contact": {"whatsapp": "+54 9 11 1234-5678", "whatsappMessage": "Hola, quiero consultar.", "phone": "", "email": ""},
}


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


handler = functools.partial(QuietHandler, directory=ROOT)
server = socketserver.TCPServer(("127.0.0.1", 0), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE_URL = f"http://127.0.0.1:{server.server_address[1]}/modelo-d/index.html"
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
    page.on("console", lambda message: page.console_errors.append(
        f"{message.text} ({message.location.get('url', '')})"
    ) if message.type == "error" else None)
    page.on("pageerror", lambda error: page.page_errors.append(str(error)))
    page.on("response", lambda response: page.failed_responses.append(
        f"{response.status} {response.url}"
    ) if response.status >= 400 else None)
    if config is not None:
        body = "const MODELO_D_CONFIG = " + json.dumps(config, ensure_ascii=False) + ";"
        page.route("**/modelo-d/config.modelo-d.js", lambda route: route.fulfill(
            status=200, content_type="application/javascript; charset=utf-8", body=body
        ))
    page.goto(BASE_URL, wait_until="networkidle")
    return context, page


try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()

        print("\n[1] Carga inicial, catálogo de ejemplo vacío y SEO")
        context, page = open_page(browser, None)
        check("configuración predeterminada renderiza catálogo sin productos inventados",
              page.locator("#product-grid .product-card").count() == 0 and
              "Todavía no hay productos publicados" in page.locator("#catalog-empty").inner_text())
        check("sin afirmaciones automáticas de stock",
              "stock permanente" not in page.locator("body").inner_text().lower() and
              "+2.000" not in page.locator("body").inner_text())
        check("un h1, navegación y crédito ALMATE", page.locator("h1").count() == 1 and
              page.locator('nav[aria-label="Navegación principal"]').count() == 1 and
              page.locator("#footer-credit").text_content() == "Desarrollado por ALMATE · Soluciones digitales",
              page.locator("#footer-credit").text_content())
        check("metadatos SEO y JSON-LD estáticos", page.title() == "FREN Ferreterías | Catálogo de productos" and
              page.locator('meta[name="description"]').count() == 1 and
              page.locator("#ld-json").count() == 1)
        check("sin errores JavaScript", not page.console_errors and not page.page_errors,
              (page.console_errors, page.page_errors))
        context.close()

        print("\n[2] Responsive con contenido")
        for width in (320, 390, 768, 1024, 1440):
            context, page = open_page(browser, BASE_CONFIG, width=width)
            check(f"{width}px: sin desbordamiento horizontal",
                  page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth"))
            check(f"{width}px: un solo h1 y controles de catálogo", page.locator("h1").count() == 1 and
                  page.locator("#catalog-search").count() == 1 and page.locator("#catalog-category").count() == 1)
            check(f"{width}px: no hay excepciones ni errores de consola",
                  not page.page_errors and not page.console_errors, (page.page_errors, page.console_errors))
            context.close()

        print("\n[3] Productos, categorías, búsqueda y filtros combinados")
        context, page = open_page(browser, BASE_CONFIG)
        check("carga los cuatro productos y categorías", page.locator("#product-grid .product-card").count() == 4 and
              page.locator("#rubros .category-card").count() == 2)
        check("precio opcional: artículo sin precio invita a consultar",
              "Consultar precio" in page.locator('[data-product-id="martillo-fijo"]').inner_text())
        check("producto sin imagen mantiene una ficha utilizable",
              page.locator('[data-product-id="martillo-fijo"] .product-card__media--empty').count() == 1)
        page.locator("#catalog-search").fill("T-100")
        check("búsqueda por SKU", page.locator("#product-grid .product-card:not([hidden])").count() == 1 and
              page.locator("#product-grid .product-card:not([hidden])").get_attribute("data-product-id") == "taladro-azul")
        page.locator("#catalog-search").fill("acme")
        check("búsqueda por marca", page.locator("#product-grid .product-card:not([hidden])").count() == 2)
        page.locator("#catalog-search").fill("")
        page.locator("#catalog-category").select_option("herramientas")
        page.locator("#catalog-subcategory").select_option(label="Eléctricas")
        page.locator("#catalog-search").fill("Amol")
        check("búsqueda, categoría y subcategoría se combinan", page.locator("#product-grid .product-card:not([hidden])").count() == 1 and
              page.locator("#product-grid .product-card:not([hidden])").get_attribute("data-product-id") == "amoladora")
        page.locator("#catalog-search").fill("sin coincidencias")
        check("estado vacío informa que no hay resultados", page.locator("#catalog-empty").is_visible() and
              "No hay productos que coincidan" in page.locator("#catalog-empty").inner_text())
        page.locator("#catalog-search").fill("")
        page.locator("#catalog-category").select_option("")
        page.locator("#catalog-subcategory").select_option("")
        page.locator("#catalog-sort").select_option("alphabetical")
        check("orden alfabético respeta el orden del DOM",
              page.locator("#product-grid .product-card:not([hidden])").evaluate_all(
                  "(cards) => cards.map((card) => card.dataset.productId)") ==
              ["amoladora", "disyuntor", "martillo-fijo", "taladro-azul"])
        page.locator("#catalog-sort").select_option("price-asc")
        check("orden por precio pone los productos sin precio al final",
              page.locator("#product-grid .product-card:not([hidden])").evaluate_all(
                  "(cards) => cards.map((card) => card.dataset.productId)") ==
              ["disyuntor", "amoladora", "taladro-azul", "martillo-fijo"])
        page.locator("#catalog-sort").select_option("featured")
        page.locator("#catalog-min-price").fill("1000")
        page.locator("#catalog-max-price").fill("3000")
        check("rango de precio filtra los artículos sin precio", page.locator("#product-grid .product-card:not([hidden])").count() == 1 and
              page.locator("#product-grid .product-card:not([hidden])").get_attribute("data-product-id") == "disyuntor")
        page.locator("#catalog-min-price").fill("4000")
        check("rango inválido muestra estado accesible", page.locator("#catalog-result-count").inner_text() ==
              "El precio mínimo no puede superar al máximo." and
              page.locator("#catalog-min-price").get_attribute("aria-invalid") == "true")
        page.locator("#catalog-min-price").fill("")
        page.locator("#catalog-max-price").fill("")

        print("\n[4] Destacados, ficha y galería de producto")
        check("destacados usan solo productos marcados", page.locator("#destacados .product-card").count() == 2)
        page.locator('#product-grid [data-product-id="taladro-azul"] [data-product-details]').click()
        check("la ficha modal muestra descripción, SKU y especificaciones",
              page.locator("#product-dialog").evaluate("(el) => el.open") and
              "T-100" in page.locator("#product-dialog").inner_text() and
              "Dato técnico de prueba" in page.locator("#product-dialog").inner_text())
        page.locator("#product-dialog [data-product-gallery-index='1']").click()
        check("galería cambia imagen y alt", page.locator("#product-detail-image").get_attribute("alt") ==
              "Detalle de taladro de prueba")
        page.keyboard.press("Escape")
        check("Escape cierra la ficha y devuelve el foco al activador",
              not page.locator("#product-dialog").evaluate("(el) => el.open") and
              page.evaluate("document.activeElement.matches('[data-product-details]')"))
        page.locator('#product-grid [data-product-id="martillo-fijo"] [data-product-details]').click()
        check("ficha sin imagen ni precio ofrece consulta sin inventar disponibilidad",
              "Consultar precio" in page.locator("#product-dialog").inner_text() and
              "Disponibilidad" not in page.locator("#product-dialog").inner_text())
        page.locator("#product-dialog [data-product-add]").click()
        page.locator('#product-grid [data-product-id="disyuntor"] [data-product-add]').click()
        check("agrega productos y actualiza contador", page.locator("#consultation-count").inner_text() == "2" and
              page.locator("#consultation-list .consultation-item").count() == 2)
        page.locator('[data-consultation-quantity="martillo-fijo"]').fill("3")
        page.locator('[data-consultation-quantity="martillo-fijo"]').press("Tab")
        check("modifica cantidad y resumen", "4 productos" in page.locator("#consultation-summary").inner_text())
        page.locator('[data-consultation-remove="disyuntor"]').click()
        page.locator('#product-grid [data-product-id="taladro-azul"] [data-product-add]').click()
        check("elimina un producto y agrega otro", page.locator("#consultation-list .consultation-item").count() == 2 and
              page.locator("#consultation-count").inner_text() == "4")
        send_href = page.locator("#consultation-send").get_attribute("href")
        decoded = page.evaluate("(href) => new URL(href).searchParams.get('text')", send_href)
        check("WhatsApp codifica nombre, SKU, cantidad, precio y referencia",
              send_href.startswith("https://wa.me/5491112345678?text=") and
              "Comercio de prueba" in decoded and "Martillo Fijo" in decoded and "SKU: M-05" in decoded and
              "Cantidad: 3" in decoded and "Precio informado:" in decoded and "25.000" in decoded and
              "Catálogo: https://catalogo.example/tienda/#catalogo" in decoded and
              page.locator("#consultation-send").get_attribute("target") == "_blank" and
              "noopener" in page.locator("#consultation-send").get_attribute("rel"), decoded)
        page.reload(wait_until="networkidle")
        check("la lista persiste en almacenamiento local", page.locator("#consultation-count").inner_text() == "4" and
              page.locator("#consultation-list .consultation-item").count() == 2)
        page.locator("#consultation-clear").click()
        check("vacía la lista", page.locator("#consultation-count").inner_text() == "0" and
              page.locator("#consultation-empty").is_visible())
        check("sin errores JavaScript durante interacciones", not page.page_errors and not page.console_errors,
              (page.page_errors, page.console_errors))
        context.close()

        print("\n[5] WhatsApp inválido y accesibilidad básica")
        invalid_config = dict(BASE_CONFIG)
        invalid_config["contact"] = {"whatsapp": "texto5491112345678"}
        context, page = open_page(browser, invalid_config)
        page.keyboard.press("Tab")
        check("primer control de teclado salta al contenido",
              page.evaluate("document.activeElement.classList.contains('skip-link')"),
              page.evaluate("document.activeElement.outerHTML"))
        page.locator('#product-grid [data-product-id="martillo-fijo"] [data-product-add]').click()
        check("número inválido no produce enlace de WhatsApp", page.locator("#consultation-send").is_hidden() and
              "Configurá un número de WhatsApp válido" in page.locator("#consultation-feedback").inner_text(),
              (page.locator("#consultation-send").get_attribute("href"),
               page.locator("#consultation-feedback").inner_text()))
        context.close()

        browser.close()
finally:
    server.shutdown()
    server.server_close()

failed = [result for result in results if not result[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} comprobaciones de navegador correctas.")
if failed:
    raise SystemExit(1)
