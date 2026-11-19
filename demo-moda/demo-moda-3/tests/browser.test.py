"""Pruebas funcionales de la Demo Moda 3 (PICHONES) con Chromium.
Ejecutar desde la raíz del repositorio: python demo-moda-3/tests/browser.test.py
Requiere Playwright para Python y su navegador Chromium.
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

OVERRIDE_MIN = {
    "brand": {"name": "Tienda Sin WhatsApp", "description": "Demo de prueba."},
    "contact": {"whatsapp": "", "email": "hola@demo.example"},
    "announcement": {"enabled": False},
    "sections": ["hero", "catalog"],
    "hero": {"title": "Tienda de prueba", "subtitle": "Demo.", "ctaLabel": "Ver", "ctaAnchor": "#catalogo"},
    "catalog": {"title": "Prendas", "subtitle": "Catálogo."},
    "seo": {"title": "Tienda de prueba"},
}


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


class ThreadingServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


server = ThreadingServer(("127.0.0.1", 0), functools.partial(QuietHandler, directory=ROOT))
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE_URL = f"http://127.0.0.1:{server.server_address[1]}/demo-moda-3/index.html"
results = []


def check(name, condition, detail=""):
    results.append((name, bool(condition), detail))
    print(("[OK] " if condition else "[FAIL] ") + name + (f" -> {detail}" if detail and not condition else ""))


def open_page(browser, config=None, width=1440, height=950, reduced=False, init_script=None):
    context = browser.new_context(viewport={"width": width, "height": height}, reduced_motion="reduce" if reduced else "no-preference")
    page = context.new_page()
    page.console_errors, page.page_errors, page.failed = [], [], []
    page.on("console", lambda m: page.console_errors.append(m.text) if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: page.page_errors.append(str(e)))
    page.on("response", lambda r: page.failed.append(f"{r.status} {r.url}") if r.status >= 400 else None)
    if config is not None:
        body = "const MODA_CONFIG = " + json.dumps(config, ensure_ascii=False) + ";"
        page.route("**/demo-moda-3/js/config.moda.js", lambda route: route.fulfill(status=200, content_type="application/javascript; charset=utf-8", body=body))
    if init_script:
        page.add_init_script(init_script)
    page.goto(BASE_URL, wait_until="networkidle")
    return context, page


def count(page, selector):
    return page.locator(selector).count()


def names(page):
    return page.locator("#catalog-grid .scard__name").all_inner_texts()


def open_filters(page):
    if not page.locator("#catalog-filters").evaluate("el => el.classList.contains('is-open')"):
        page.click("#filter-toggle")


def pick_variant(page, color, size):
    page.click(f'#pd-colors [data-color="{color}"]')
    page.click(f'#pd-sizes [data-size="{size}"]')


try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch()

        print("\n[1] Carga, renderizado y SEO")
        ctx, page = open_page(browser)
        check("título y meta descripción", page.title() == "Pichones · Ropa piola para chicos" and "Verano 27" in page.locator('meta[name="description"]').get_attribute("content"))
        check("un solo h1 con la palabra resaltada", count(page, "h1") == 1 and page.locator("h1 mark").inner_text() == "pichones")
        check("catálogo renderiza 15 tarjetas", count(page, "#catalog-grid .scard") == 15)
        check("navegación principal con 6 enlaces", count(page, "#nav-list li") == 6)
        check("cinta con mensajes y duplicado oculto a lectores", count(page, ".marquee__group") == 2 and page.locator(".marquee__group").nth(1).get_attribute("aria-hidden") == "true")
        check("JSON-LD estático presente", count(page, "#ld-json") == 1)
        check("crédito ALMATE obligatorio", "Desarrollado por ALMATE · Soluciones digitales." in page.locator("#footer-credit").inner_text())
        check("las 10 secciones se renderizan (incluye la guía de talles)", all(count(page, f"#{i}") == 1 for i in ["inicio", "categorias", "guia", "coleccion", "catalogo", "pilcha", "lookbook", "beneficios", "nosotros", "faq"]))
        check("la guía de talles muestra la tabla", count(page, "#guia table") == 1 and "Edad" in page.locator("#guia table").inner_text())
        check("categorías muestran conteo", "3 prendas" in page.locator(".cat-tile").first.inner_text())
        h = page.evaluate("document.body.scrollHeight")
        for y in range(0, h, 600):
            page.evaluate(f"window.scrollTo(0,{y})")
            page.wait_for_timeout(40)
        page.wait_for_timeout(300)
        broken = page.evaluate("Array.from(document.images).filter(i => i.getAttribute('src') && !(i.complete && i.naturalWidth > 0)).map(i => i.getAttribute('src') || '(sin src)')")
        check("todas las imágenes cargan (sin íconos rotos)", not broken, broken[:5])
        check("sin errores ni avisos de consola ni de página", not page.console_errors and not page.page_errors, page.console_errors[:3] + page.page_errors[:3])
        check("sin respuestas HTTP con error", not page.failed, page.failed[:5])
        check("sin desbordamiento horizontal en el scroll", page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth"))
        ctx.close()

        print("\n[2] Responsive")
        for width, height in [(360, 740), (390, 844), (768, 1024), (1024, 768), (1440, 900)]:
            ctx, page = open_page(browser, width=width, height=height)
            check(f"{width}px: sin desbordamiento horizontal", page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth"), page.evaluate("[document.documentElement.scrollWidth, document.documentElement.clientWidth]"))
            check(f"{width}px: hero, catálogo y carrito accesibles", page.locator("h1").is_visible() and count(page, ".scard") == 15 and page.locator("#cart-open").is_visible())
            cols = page.evaluate("getComputedStyle(document.getElementById('catalog-grid')).gridTemplateColumns.split(' ').length")
            expected = 3 if width > 1024 else (1 if width <= 380 else 2)
            check(f"{width}px: {expected} columna(s) de catálogo", cols == expected, cols)
            nav_visible = page.locator("#nav-list").is_visible()
            check(f"{width}px: menú {'completo' if width > 959 else 'hamburguesa'}", nav_visible == (width > 959) and page.locator("#menu-toggle").is_visible() == (width <= 959))
            check(f"{width}px: sin errores", not page.page_errors and not page.console_errors, page.console_errors[:2] + page.page_errors[:2])
            ctx.close()

        print("\n[3] Búsqueda, orden y filtros")
        ctx, page = open_page(browser)
        page.fill("#filter-search", "buzo")
        check("búsqueda por nombre", count(page, "#catalog-grid .scard") == 2, names(page))
        page.fill("#filter-search", "arcoiris")
        check("búsqueda ignora tildes (arcoiris → Arcoíris)", names(page) == ["Remera Arcoíris"], names(page))
        page.fill("#filter-search", "zzzz")
        check("estado vacío informa y ofrece limpiar", page.locator("#catalog-empty").is_visible() and page.locator("#catalog-grid").is_hidden() and "Uy" in page.locator("#catalog-empty").inner_text())
        page.click("#filter-clear-empty")
        check("limpiar desde el estado vacío restaura", count(page, "#catalog-grid .scard") == 15 and page.input_value("#filter-search") == "")
        page.select_option("#filter-sort", "price-asc")
        check("orden por precio ascendente", names(page)[0] == "Gorra Pibe", names(page)[:2])
        page.select_option("#filter-sort", "price-desc")
        check("orden por precio descendente", names(page)[0] == "Campera de Abrigo", names(page)[:2])
        page.select_option("#filter-sort", "featured")
        page.click('#filter-categories [data-category="buzos"]')
        check("chip de categoría filtra", count(page, "#catalog-grid .scard") == 2 and page.locator("#catalog-count").inner_text() == "2 prendas")
        page.click('#filter-categories [data-category=""]')
        open_filters(page)
        page.click('#filter-genders [data-gender="nena"]')
        check("Nena incluye también las unisex (13)", count(page, "#catalog-grid .scard") == 13)
        page.click('#filter-genders [data-gender="nene"]')
        check("Nene incluye también las unisex (10)", count(page, "#catalog-grid .scard") == 10)
        page.click('#filter-genders [data-gender="unisex"]')
        check("Unisex muestra solo unisex (8)", count(page, "#catalog-grid .scard") == 8)
        page.click('#filter-genders [data-gender=""]')
        page.click('#filter-sizes [data-size="24m"]')
        check("filtro por talle de bebé considera disponibilidad", names(page) == ["Enterito Bebé"], names(page))
        page.click('#filter-sizes [data-size=""]')
        page.click('#filter-colors [data-color="Amarillo"]')
        check("filtro por color (3 prendas amarillas)", set(names(page)) == {"Campera de Abrigo", "Campera Rompeviento", "Vestido de Verano"}, names(page))
        page.click('#filter-colors [data-color=""]')
        page.select_option("#filter-price", "0-30000")
        check("filtro por rango de precio", count(page, "#catalog-grid .scard") == 8)
        check("insignia cuenta filtros del panel y chip activo removible", page.locator("#filter-badge").inner_text() == "1" and count(page, "#catalog-active .chip") == 1)
        page.click("#catalog-active .chip")
        check("quitar un filtro activo lo desactiva", count(page, "#catalog-grid .scard") == 15 and page.locator("#catalog-active").is_hidden())
        page.select_option("#filter-price", "0-30000")
        page.click('#filter-categories [data-category="accesorios"]')
        page.click("#filter-clear")
        check("limpiar filtros restaura todo", count(page, "#catalog-grid .scard") == 15 and page.locator("#filter-badge").is_hidden())
        ctx.close()

        print("\n[4] Navegación y categorías")
        ctx, page = open_page(browser)
        page.click('#nav-list button:has-text("Ofertas")')
        check("'Ofertas' filtra productos en oferta (2)", count(page, "#catalog-grid .scard") == 2, names(page))
        page.click('#nav-list button:has-text("Nena")')
        check("un filtro de navegación reemplaza al anterior (Nena = 13)", count(page, "#catalog-grid .scard") == 13)
        page.click('#nav-list button:has-text("Lo nuevo")')
        check("'Lo nuevo' filtra novedades y ordena por novedades (7)", count(page, "#catalog-grid .scard") == 7 and page.input_value("#filter-sort") == "new", names(page))
        page.click('.cat-tile:has-text("Remeras")')
        check("tarjeta de categoría filtra el catálogo (3)", count(page, "#catalog-grid .scard") == 3 and page.input_value("#filter-sort") == "featured", names(page))
        page.click('#nav-list a:has-text("Armá el conjunto")')
        page.wait_for_timeout(500)
        check("enlace de ancla lleva a los conjuntos", page.evaluate("document.getElementById('pilcha').getBoundingClientRect().top < window.innerHeight"))
        page.fill("#header-search", "vestido")
        check("búsqueda del header filtra el catálogo", names(page) == ["Vestido de Verano"], names(page))
        ctx.close()

        print("\n[5] Ficha, variantes y carrito")
        ctx, page = open_page(browser)
        page.click('.scard__open[data-open-product="remera-dinosaurio"]')
        check("se abre la ficha modal", page.locator("#product-modal").evaluate("el => el.open") is True)
        check("la ficha toma el tono de la tarjeta", "lilac" in page.locator("#product-modal").evaluate("el => el.style.getPropertyValue('--tone')"))
        page.click("#pd-add")
        check("sin elegir variante muestra error y no agrega", page.locator("#pd-error").is_visible() and page.locator("#cart-count").is_hidden())
        src0 = page.get_attribute("#pd-image", "src")
        page.click('#pd-colors [data-color="Celeste"]')
        check("cambiar de color cambia la imagen", page.get_attribute("#pd-image", "src") != src0 and "celeste" in page.get_attribute("#pd-image", "src"))
        check("talle no disponible para ese color queda deshabilitado", page.locator('#pd-sizes [data-size="2"]').is_disabled() and page.locator('#pd-sizes [data-size="4"]').is_enabled())
        pick_variant(page, "Crudo", "8")
        check("disponibilidad informa la combinación", "Hay para consultar" in page.locator("#pd-availability").inner_text())
        page.click("#pd-add")
        page.wait_for_timeout(300)
        check("agregar suma la unidad y cierra la ficha", page.locator("#cart-count").inner_text() == "1" and page.locator("#product-modal").evaluate("el => el.open") is False)
        check("aparece el aviso", page.locator("#toast").is_visible())
        page.click('.scard__open[data-open-product="remera-dinosaurio"]')
        pick_variant(page, "Crudo", "10")
        page.click("#pd-add")
        page.wait_for_timeout(300)
        page.click("#cart-open")
        page.wait_for_timeout(450)
        check("dos talles del mismo producto son líneas distintas", count(page, "#cart-items .cart-item") == 2)
        check("el carrito muestra nombre, color y talle", "Remera Dinosaurio" in page.locator("#cart-items").inner_text() and "Crudo · Talle 8" in page.locator("#cart-items").inner_text())
        check("la miniatura usa la imagen del color elegido", "remera-dinosaurio-crudo" in page.locator(".cart-item__thumb img").first.get_attribute("src"))
        page.locator('.cart-item__qty [data-qty="1"]').first.click()
        check("cantidad y total se actualizan", page.locator("#cart-total").inner_text() == "$44.700" and page.locator("#cart-count").inner_text() == "3", page.locator("#cart-total").inner_text())
        href = page.get_attribute("#cart-whatsapp", "href")
        text = urllib.parse.unquote(href.split("?text=")[1]) if "?text=" in (href or "") else ""
        check("enlace de WhatsApp con número y mensaje", (href or "").startswith("https://wa.me/5491130000000?text=") and "1. Remera Dinosaurio" in text and "Color: Crudo" in text and "Talle: 8" in text and "Cantidad: 2" in text and "TOTAL ESTIMADO: $44.700" in text, text[:200])
        check("el mensaje no tiene saltos sin codificar", "\n" not in href and " " not in href)
        ctx.close()

        ctx, page = open_page(browser)
        page.click('.scard__open[data-open-product="gorra-pibe"]')
        pick_variant(page, "Negro", "Único")
        page.click("#pd-add")
        page.wait_for_timeout(300)
        page.reload(wait_until="networkidle")
        check("persistencia tras recargar", page.locator("#cart-count").inner_text() == "1")
        page.click("#cart-open")
        page.wait_for_timeout(450)
        page.click(".cart-item__remove")
        check("quitar deja el carrito vacío", page.locator("#cart-count").is_hidden() and page.locator("#cart-empty").is_visible() and page.locator("#cart-clear").is_disabled())
        page.keyboard.press("Escape")
        page.wait_for_timeout(450)
        check("Escape cierra el carrito", page.locator("#cart-drawer").is_hidden())
        page.click('.scard__open[data-open-product="gorra-pibe"]')
        page.click('#pd-colors [data-color="Celeste"]')
        check("combinación inexistente: talle deshabilitado", page.locator('#pd-sizes [data-size="Único"]').is_disabled())
        page.click("#pd-add")
        check("agregar sin variante válida muestra error", page.locator("#pd-error").is_visible() and page.locator("#cart-count").is_hidden())
        page.keyboard.press("Escape")
        page.wait_for_timeout(200)
        check("Escape cierra la ficha", page.locator("#product-modal").evaluate("el => el.open") is False)
        ctx.close()

        print("\n[6] Armá el conjunto")
        ctx, page = open_page(browser)
        check("3 filas y una prenda por slot", count(page, ".pilcha__row") == 3 and count(page, ".pilcha__piece") == 3)
        first = page.locator(".pilcha__row").first.locator(".pilcha__item b").inner_text()
        total0 = page.locator(".pilcha__total strong").inner_text()
        page.locator('.pilcha__row [data-slot="0"][data-dir="1"]').click()
        check("la flecha cambia la prenda y el total", page.locator(".pilcha__row").first.locator(".pilcha__item b").inner_text() != first and page.locator(".pilcha__total strong").inner_text() != total0)
        page.locator('.pilcha__row [data-slot="0"][data-dir="-1"]').click()
        check("la flecha anterior vuelve (circular)", page.locator(".pilcha__row").first.locator(".pilcha__item b").inner_text() == first)
        page.click("[data-pilcha-random]")
        check("'Sorprendeme' mantiene una prenda por slot", count(page, ".pilcha__piece") == 3 and count(page, ".pilcha__row") == 3)
        page.click("[data-pilcha-go]")
        page.wait_for_timeout(250)
        check("el conjunto abre la ficha del paso 1 de 3", page.locator("#product-modal").evaluate("el => el.open") is True and page.locator("#pd-step").inner_text().lower() == "paso 1 de 3")
        for step in (1, 2, 3):
            modal = page.locator("#product-modal")
            colors = page.locator("#pd-colors [data-color]").all()
            done = False
            for c in colors:
                c.click()
                for s in page.locator("#pd-sizes [data-size]:not([disabled])").all():
                    s.click()
                    done = True
                    break
                if done:
                    break
            page.click("#pd-add")
            page.wait_for_timeout(500)
            if step < 3:
                check(f"tras agregar se abre el paso {step + 1} de 3", modal.evaluate("el => el.open") is True and page.locator("#pd-step").inner_text().lower() == f"paso {step + 1} de 3")
        check("al terminar suma 3 prendas y abre el pedido", page.locator("#cart-count").inner_text() == "3" and page.locator("#cart-drawer").is_visible())
        page.click("#cart-clear")
        page.keyboard.press("Escape")
        page.wait_for_timeout(450)
        page.click("[data-pilcha-go]")
        page.wait_for_timeout(250)
        page.keyboard.press("Escape")
        page.wait_for_timeout(600)
        check("cerrar la ficha cancela el resto del conjunto", page.locator("#product-modal").evaluate("el => el.open") is False and page.locator("#cart-count").is_hidden())
        ctx.close()

        print("\n[7] Móvil: menú y hoja de filtros")
        ctx, page = open_page(browser, width=390, height=844)
        page.click("#menu-toggle")
        check("el menú se abre con aria-expanded", page.get_attribute("#menu-toggle", "aria-expanded") == "true" and page.locator("#site-nav").is_visible())
        check("el contenido queda inerte detrás del menú", page.locator("#main").evaluate("el => el.inert") is True)
        page.keyboard.press("Escape")
        check("Escape cierra el menú", page.get_attribute("#menu-toggle", "aria-expanded") == "false" and page.locator("#site-nav").is_hidden())
        page.click("#menu-toggle")
        page.click('#nav-list button:has-text("Accesorios")')
        page.wait_for_timeout(300)
        check("elegir un enlace cierra el menú y filtra", page.locator("#site-nav").is_hidden() and count(page, "#catalog-grid .scard") == 2)
        page.click("#filter-toggle")
        page.wait_for_timeout(450)
        check("los filtros se abren como hoja inferior", page.locator("#catalog-filters").is_visible() and page.locator("#filters-backdrop").is_visible() and page.evaluate("document.body.classList.contains('no-scroll')"))
        page.click('#filter-colors [data-color="Negro"]')
        check("filtra desde la hoja", count(page, "#catalog-grid .scard") == 1)
        page.click("#filter-close")
        page.wait_for_timeout(450)
        check("'Listo' cierra la hoja y devuelve el scroll", page.locator("#catalog-filters").is_hidden() and not page.evaluate("document.body.classList.contains('no-scroll')"))
        page.click("#filter-toggle")
        page.wait_for_timeout(400)
        page.keyboard.press("Escape")
        page.wait_for_timeout(450)
        check("Escape cierra la hoja", page.locator("#catalog-filters").is_hidden())
        page.click('.scard__open >> nth=0')
        box = page.locator("#pd-sizes .option").first.bounding_box()
        check("talles cómodos para el pulgar (≥ 44 px)", box and box["height"] >= 44 and box["width"] >= 44, box)
        ctx.close()

        print("\n[8] Configuración, accesibilidad y seguridad")
        ctx, page = open_page(browser, config=OVERRIDE_MIN)
        check("config mínima: solo hero y catálogo", count(page, "#inicio") == 1 and count(page, "#catalogo") == 1 and count(page, "#pilcha") == 0 and count(page, "#faq") == 0 and count(page, "#guia") == 0)
        check("sin franja cuando está desactivada", page.locator("#announcement").is_hidden())
        page.click('.scard__open >> nth=0')
        page.locator("#pd-colors [data-color]").first.click()
        page.locator("#pd-sizes [data-size]:not([disabled])").first.click()
        page.click("#pd-add")
        page.wait_for_timeout(300)
        page.click("#cart-open")
        page.wait_for_timeout(450)
        check("sin número de WhatsApp no se habilita el envío", page.get_attribute("#cart-whatsapp", "href") is None)
        check("sin errores críticos con configuración mínima", not page.page_errors, page.page_errors[:3])
        ctx.close()

        ctx, page = open_page(browser)
        page.locator(".faq__item summary").first.click()
        check("FAQ abre con acordeón nativo", page.locator(".faq__item").first.evaluate("el => el.open") is True)
        check("enlace 'saltar al contenido' presente", page.locator(".skip-link").get_attribute("href") == "#main")
        check("botones de ícono tienen nombre accesible", all(page.get_attribute(s, "aria-label") for s in ["#cart-open", "#menu-toggle", "#pd-close"]))
        check("imágenes con alt", page.evaluate("Array.from(document.images).every(i => i.hasAttribute('alt'))"))
        ctx.close()

        ctx, page = open_page(browser)
        page.keyboard.press("Tab")
        check("el primer Tab llega al enlace 'saltar al contenido'", page.evaluate("document.activeElement && document.activeElement.classList.contains('skip-link')"))
        page.keyboard.press("Enter")
        check("'saltar al contenido' mueve el foco a <main>", page.evaluate("document.activeElement && document.activeElement.id === 'main'"))
        ctx.close()

        ctx, page = open_page(browser, reduced=True)
        check("movimiento reducido: cinta sin duplicado y secciones visibles", page.locator(".marquee__group").nth(1).is_hidden() and page.evaluate("Array.from(document.querySelectorAll('.reveal')).every(e => getComputedStyle(e).opacity === '1')"))
        ctx.close()

        payload = json.dumps([{"key": "x|Negro|8", "productId": "x", "name": "<img src=x onerror=window.__xss=1>", "image": "assets/products/buzo-canguro-negro.svg", "imageAlt": "\" onerror=\"window.__xss=2", "color": "Negro", "colorValue": "red;background:url(javascript:1)", "size": "8", "price": 1000, "qty": 1, "tone": "sun\" onmouseover=\"window.__xss=3"}])
        ctx, page = open_page(browser, init_script=f"localStorage.setItem('pichones-moda-cart-v1', {json.dumps(payload)});")
        page.click("#cart-open")
        page.wait_for_timeout(450)
        check("un carrito manipulado en localStorage no ejecuta código", page.evaluate("window.__xss") is None)
        check("el nombre se muestra como texto", "<img src=x" in page.locator(".cart-item__name").inner_text())
        ctx.close()

        browser.close()
except Exception as error:  # noqa: BLE001
    print("[ERROR] La prueba se interrumpió:", repr(error))
    results.append(("ejecución completa", False, repr(error)))

failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} comprobaciones superadas.")
if failed:
    print("Fallaron:")
    for name, _, detail in failed:
        print(" -", name, "->", detail)
sys.exit(1 if failed else 0)
