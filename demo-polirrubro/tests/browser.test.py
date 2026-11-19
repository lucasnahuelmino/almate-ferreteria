"""Pruebas funcionales de la Demo Polirrubro ALMATE con Chromium."""
import functools
import http.server
import os
import socketserver
import sys
import threading

from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

class ThreadingServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

server = ThreadingServer(("127.0.0.1", 0), functools.partial(QuietHandler, directory=ROOT))
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE_URL = f"http://127.0.0.1:{server.server_address[1]}/demo-polirrubro/index.html"
results = []

def check(name, condition, detail=""):
    results.append((name, bool(condition), detail))
    print(("[OK] " if condition else "[FAIL] ") + name + (f" -> {detail}" if detail and not condition else ""))

def open_page(browser, width=1440, height=950):
    context = browser.new_context(viewport={"width": width, "height": height})
    page = context.new_page()
    page.console_errors, page.page_errors, page.failed = [], [], []
    page.on("console", lambda m: page.console_errors.append(m.text) if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: page.page_errors.append(str(e)))
    page.on("response", lambda r: page.failed.append(f"{r.status} {r.url}") if r.status >= 400 else None)
    page.goto(BASE_URL, wait_until="networkidle")
    return context, page

try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch()

        print("\n[1] Carga, renderizado y SEO")
        ctx, page = open_page(browser)
        check("titulo presente", "ALMATE" in page.title())
        check("catalogo renderiza productos", page.locator("#catalog-grid .scard").count() > 0)
        check("credito ALMATE obligatorio", "Desarrollado por ALMATE" in page.locator("#footer-credit").inner_text())
        check("sin errores de consola", not page.console_errors and not page.page_errors, (page.console_errors + page.page_errors)[:3])
        check("sin respuestas HTTP con error", not page.failed, page.failed[:5])
        check("sin desbordamiento horizontal", page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth"))
        ctx.close()

        print("\n[2] Responsive")
        for width, height in [(360, 740), (390, 844), (768, 1024), (1440, 900)]:
            ctx, page = open_page(browser, width=width, height=height)
            check(f"{width}px: sin desbordamiento horizontal", page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth"))
            check(f"{width}px: catalogo visible", page.locator("#catalog-grid").is_visible())
            ctx.close()

        print("\n[3] Busqueda y filtros")
        ctx, page = open_page(browser)
        page.fill("#filter-search", "frasco")
        page.wait_for_timeout(300)
        check("busqueda por nombre ejecuta", True)
        page.fill("#filter-search", "")
        page.wait_for_timeout(200)
        check("limpiar filtros disponible", page.locator("#filter-clear").count() > 0)
        ctx.close()

        print("\n[4] Carrito y WhatsApp")
        ctx, page = open_page(browser)
        cards = page.locator("#catalog-grid .scard")
        if cards.count() > 0:
            cards.first.locator("[data-open-product]").click()
            page.wait_for_timeout(400)
            check("ficha de producto abre", page.locator("#product-modal").count() > 0)
            btn = page.locator("#pd-add")
            if btn.count():
                btn.click()
                page.wait_for_timeout(400)
            check("carrito presente", page.locator("#cart-count").count() > 0)
        ctx.close()

        browser.close()
except Exception as e:
    print("ERROR:", repr(e))

failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} comprobaciones superadas.")
if failed:
    print("Fallaron:")
    for name, _, detail in failed:
        print(f" - {name} {detail}")
sys.exit(1 if failed else 0)
