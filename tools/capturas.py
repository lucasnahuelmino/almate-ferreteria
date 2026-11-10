"""Regenera las capturas de docs/capturas/ del Modelo A con Playwright.

Uso (desde la raíz del repo):  python tools/capturas.py
"""
import functools
import http.server
import os
import socketserver
import threading

from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "docs", "capturas")

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


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


handler = functools.partial(QuietHandler, directory=ROOT)
server = socketserver.TCPServer(("127.0.0.1", 0), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{server.server_address[1]}/modelo-a/index.html"

os.makedirs(OUT, exist_ok=True)

def reveal_all(page):
    """Recorre la página para disparar los IntersectionObserver (.reveal)
    y cargar las imágenes lazy antes de una captura full-page; sin esto
    las secciones bajas quedan vacías. Se desactiva scroll-behavior:
    smooth durante el pase, si no cada scrollTo se anima y se corta."""
    page.evaluate(
        """async () => {
            const root = document.documentElement;
            const prev = root.style.scrollBehavior;
            root.style.scrollBehavior = 'auto';
            const step = Math.round(window.innerHeight * 0.7);
            for (let y = 0; y < document.body.scrollHeight; y += step) {
                window.scrollTo(0, y);
                await new Promise(r => setTimeout(r, 120));
            }
            window.scrollTo(0, 0);
            root.style.scrollBehavior = prev;
            // Todas las imágenes lazy terminaron de cargar
            await Promise.all(
                Array.from(document.images)
                    .filter(img => !img.complete)
                    .map(img => new Promise(r => {
                        img.addEventListener('load', r, { once: true });
                        img.addEventListener('error', r, { once: true });
                    }))
            );
            await new Promise(r => setTimeout(r, 300));
        }"""
    )
    page.wait_for_timeout(700)


with sync_playwright() as p:
    browser = p.chromium.launch()

    # 1. Escritorio completo (1440)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(600)
    reveal_all(page)
    page.screenshot(path=os.path.join(OUT, "modelo-a-escritorio.png"), full_page=True)
    print("ok: modelo-a-escritorio.png")

    # 3. Sección catálogo con datos de prueba (misma vista escritorio)
    page.evaluate(
        "items => { ALMATECatalog.load(items); ALMATECatalog.render(); }", SAMPLE_ITEMS
    )
    page.wait_for_timeout(400)
    page.locator("#catalogo").scroll_into_view_if_needed()
    page.wait_for_timeout(900)
    page.locator("#catalogo").screenshot(path=os.path.join(OUT, "modelo-a-catalogo.png"))
    print("ok: modelo-a-catalogo.png")

    # 4. Lista de consulta con artículos agregados
    page.evaluate(
        """() => {
            document.querySelectorAll('[data-add]').forEach(b => b.click());
        }"""
    )
    page.wait_for_timeout(400)
    page.locator("#consulta").scroll_into_view_if_needed()
    page.wait_for_timeout(900)
    page.locator("#consulta").screenshot(path=os.path.join(OUT, "modelo-a-lista-consulta.png"))
    print("ok: modelo-a-lista-consulta.png")
    page.close()

    # 2. Móvil (390x844, full page)
    mobile = browser.new_page(
        viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True
    )
    mobile.goto(BASE, wait_until="networkidle")
    mobile.wait_for_timeout(600)
    reveal_all(mobile)
    mobile.screenshot(path=os.path.join(OUT, "modelo-a-movil.png"), full_page=True)
    print("ok: modelo-a-movil.png")
    mobile.close()

    browser.close()

server.shutdown()
print("capturas regeneradas en", OUT)
