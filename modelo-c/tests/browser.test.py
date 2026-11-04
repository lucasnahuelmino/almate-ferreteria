"""Pruebas funcionales del Modelo C con Chromium y Playwright.
Uso desde la raíz: python modelo-c/tests/browser.test.py
Requiere Playwright para Python y Chromium (sin dependencias de producción)."""
import functools
import http.server
import json
import os
import socketserver
import subprocess
import sys
import threading

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
BASE = f"http://127.0.0.1:{server.server_address[1]}/modelo-c/index.html"
results = []


def check(name, condition, detail=""):
    results.append((name, bool(condition), detail))
    print(("[OK] " if condition else "[FAIL] ") + name + (f" -> {detail}" if detail and not condition else ""))


def fixture_config():
    return {
        "sections": [
            "hero", "trust", "services", "differentiators", "gallery", "process",
            "testimonials", "faq", "coverage", "finalCta", "contact",
        ],
        "brand": {"name": "Negocio de prueba", "description": "Contenido de test, no comercial."},
        "seo": {"title": "Negocio de prueba", "description": "Metadatos de prueba."},
        "contact": {
            "phone": "+541142502865",
            "email": "prueba@example.test",
            "whatsapp": "5491112345678",
            "whatsappMessage": "Hola, consulta sobre una solución.",
            "address": "Dirección de prueba 123",
            "locality": "Localidad de prueba",
            "hours": "Horario de prueba",
            "social": {"instagram": "https://instagram.com/example"},
        },
        "navigation": {
            "cta": {"label": "Hablemos", "type": "whatsapp"},
        },
        "hero": {
            "eyebrow": "Prueba",
            "title": "Una propuesta clara",
            "highlight": "para convertir.",
            "description": "Texto de prueba para validar el diseño.",
            "primary": {"label": "Consultar", "type": "whatsapp", "message": "Consulta personalizada."},
            "secondary": {"label": "Ver servicios", "target": "services"},
        },
        "trust": {"items": [{"value": "Dato de prueba", "label": "Indicador de ejemplo"}]},
        "services": {"items": [
            {"name": "Servicio A", "description": "Descripción de prueba."},
            {"name": "Servicio B", "description": "Otra descripción."},
        ]},
        "differentiators": {"items": [
            {"title": "Diferencial uno", "description": "Descripción."},
            {"title": "Diferencial dos", "description": "Descripción."},
            {"title": "Diferencial tres", "description": "Descripción."},
        ]},
        "gallery": {"items": [
            {"src": "galeria-01.jpg", "alt": "Imagen de prueba uno", "category": "Local"},
            {"src": "galeria-02.jpg", "alt": "Imagen de prueba dos", "title": "Proyecto dos"},
            {"src": "galeria-03.jpg", "alt": "Imagen de prueba tres"},
        ]},
        "process": {"steps": [
            {"title": "Contacto", "description": "Paso uno."},
            {"title": "Evaluación", "description": "Paso dos."},
            {"title": "Propuesta", "description": "Paso tres."},
        ]},
        "testimonials": {"items": [{"quote": "Testimonio ficticio de prueba.", "author": "Persona de prueba"}]},
        "faq": {"items": [
            {"question": "¿Pregunta de prueba?", "answer": "Respuesta de prueba."},
        ]},
        "coverage": {
            "localities": ["Localidad de prueba"],
            "area": "Zona de prueba",
            "address": "Ubicación de prueba",
            "mapsUrl": "https://maps.google.com/?q=test",
        },
        "finalCta": {
            "title": "Acción final de prueba",
            "button": {"label": "Escribir", "type": "whatsapp"},
        },
    }


def open_page(browser, config=None, width=1440, height=1000):
    context = browser.new_context(viewport={"width": width, "height": height})
    page = context.new_page()
    page.errors = []
    page.page_errors = []
    page.on("console", lambda message: page.errors.append(message.text) if message.type == "error" else None)
    page.on("pageerror", lambda error: page.page_errors.append(str(error)))
    if config is not None:
        body = "const MODEL_C_CONFIG = " + json.dumps(config, ensure_ascii=False) + ";"
        page.route("**/modelo-c/config.modelo-c.js", lambda route: route.fulfill(
            status=200, content_type="application/javascript; charset=utf-8", body=body,
        ))
        map_url = config.get("coverage", {}).get("mapUrl")
        if map_url:
            page.route(map_url, lambda route: route.fulfill(
                status=200, content_type="text/html; charset=utf-8", body="<title>Mapa de prueba</title>",
            ))
    page.goto(BASE, wait_until="networkidle")
    return context, page


with sync_playwright() as playwright:
    browser = playwright.chromium.launch()
    print("\n[1] Diseño responsive y carga inicial")
    for width in (390, 768, 1024, 1440):
        context, page = open_page(browser, fixture_config(), width)
        check(f"{width}px: carga sin excepciones JS", not page.page_errors, page.page_errors)
        check(f"{width}px: sin desbordamiento horizontal", page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth"))
        check(f"{width}px: secciones conservan el orden configurado",
              page.locator("main > section").evaluate_all("(els) => els.map(el => el.id)") ==
              ["inicio", "confianza", "servicios", "diferenciales", "proyectos", "proceso",
               "testimonios", "preguntas", "cobertura", "consulta", "contacto"])
        check(f"{width}px: un solo h1 y landmarks semánticos",
              page.locator("h1").count() == 1 and page.locator("main").count() == 1 and
              page.locator('nav[aria-label="Navegación principal"]').count() == 1)
        check(f"{width}px: alt en las imágenes de galería",
              page.locator("#proyectos img").evaluate_all("(imgs) => imgs.every(img => img.hasAttribute('alt'))"))
        check(f"{width}px: sin errores de consola", not page.errors, page.errors)
        context.close()

    print("\n[2] Menú, navegación y CTA")
    context, page = open_page(browser, fixture_config(), 390)
    page.locator("#menu-toggle").click()
    check("menú móvil abre y actualiza aria-expanded", page.locator("#menu-toggle").get_attribute("aria-expanded") == "true")
    page.keyboard.press("Escape")
    check("Escape cierra y devuelve el foco al botón", page.locator("#menu-toggle").get_attribute("aria-expanded") == "false" and page.evaluate("document.activeElement.id") == "menu-toggle")
    page.locator("#menu-toggle").click()
    page.locator("#site-nav a[href='#servicios']").click()
    check("navegar por ancla cierra el menú", page.locator("#menu-toggle").get_attribute("aria-expanded") == "false" and page.evaluate("location.hash") == "#servicios")
    check("CTA de WhatsApp codifica mensaje y número", page.locator(".hero__actions a[href^='https://wa.me/']").get_attribute("href") ==
          "https://wa.me/5491112345678?text=Consulta%20personalizada.")
    check("WhatsApp configurado también aparece en contacto", page.locator("#contacto a[href^='https://wa.me/']").count() == 1)
    check("enlaces externos abren de forma segura", page.locator("a[target='_blank']").evaluate_all(
        "(links) => links.every(link => link.rel.includes('noopener') && link.rel.includes('noreferrer'))"))
    context.close()

    print("\n[3] Galería, teclado, FAQ y enlaces de contacto")
    context, page = open_page(browser, fixture_config(), 1440)
    opener = page.locator("[data-gallery-item]").nth(1)
    opener.click()
    check("lightbox abre con foco en cerrar", page.locator("#lightbox").get_attribute("aria-hidden") == "false" and page.evaluate("document.activeElement.id") == "lightbox-close")
    page.keyboard.press("ArrowRight")
    check("lightbox avanza con flecha derecha", page.locator("#lightbox-count").inner_text() == "3 / 3")
    focus_inside = True
    for _ in range(7):
        page.keyboard.press("Tab")
        focus_inside = focus_inside and page.evaluate("document.activeElement.closest('#lightbox') !== null")
    check("lightbox mantiene el foco en el diálogo", focus_inside)
    page.keyboard.press("Escape")
    check("lightbox cierra y devuelve foco a la miniatura", page.locator("#lightbox").get_attribute("aria-hidden") == "true" and page.evaluate("document.activeElement.matches('[data-gallery-item]')"))
    summary = page.locator(".faq-item summary")
    summary.focus()
    page.keyboard.press("Enter")
    check("FAQ nativa abre con teclado", page.locator(".faq-item").get_attribute("open") is not None)
    check("teléfono y email generan enlaces válidos",
          page.locator("#contacto a[href^='tel:']").count() == 1 and
          page.locator("#contacto a[href^='mailto:']").count() == 1)
    check("mapa opcional no se incorpora si no hay mapa embebido", page.locator("#cobertura iframe").count() == 0)
    context.close()
    mapped = fixture_config()
    mapped["coverage"]["mapUrl"] = "https://www.google.com/maps/embed?pb=test"
    context, page = open_page(browser, mapped, 1024)
    check("mapa HTTPS permitido se renderiza con título y carga diferida",
          page.locator("#cobertura iframe").count() == 1 and
          page.locator("#cobertura iframe").get_attribute("loading") == "lazy" and
          "Negocio de prueba" in page.locator("#cobertura iframe").get_attribute("title"))
    context.close()

    print("\n[4] Configuración incompleta, secciones y datos inseguros")
    context, page = open_page(browser, {"brand": {"name": ""}}, 390)
    check("configuración incompleta muestra aviso y renderiza defaults sin excepción",
          page.locator(".config-error[role='alert']").count() == 1 and not page.page_errors and
          page.locator("h1").count() == 1 and page.locator("#brand-link").inner_text() == "Nombre del negocio")
    context.close()
    reordered = fixture_config()
    reordered["sections"] = ["faq", "hero", "services"]
    context, page = open_page(browser, reordered, 768)
    check("secciones deshabilitadas se omiten y el orden cambia", page.locator("main > section").evaluate_all(
        "(els) => els.map(el => el.id)") == ["preguntas", "inicio", "servicios"])
    check("nav y footer no apuntan a secciones deshabilitadas",
          page.locator('#site-nav a[href="#proyectos"]').count() == 0 and
          page.locator('#footer-nav a[href="#contacto"]').count() == 0)
    context.close()

    unsafe = fixture_config()
    unsafe["hero"]["title"] = '<img src=x onerror="window.__injected=1">'
    unsafe["contact"]["social"] = {"instagram": "javascript:alert(1)"}
    unsafe["hero"]["primary"] = {"label": "Abrir", "type": "url", "url": "javascript:alert(2)"}
    context, page = open_page(browser, unsafe, 390)
    check("texto malicioso se muestra como texto, no ejecuta HTML",
          "<img src=x onerror=" in page.locator("h1").inner_text() and
          page.locator("h1 img").count() == 0 and page.evaluate("window.__injected") is None)
    check("URL insegura no genera enlace activo", page.locator('a[href^="javascript:"]').count() == 0)
    context.close()

    print("\n[5] Imágenes faltantes y SEO estático")
    broken = fixture_config()
    broken["gallery"]["items"][0]["src"] = "no-existe.jpg"
    context, page = open_page(browser, broken, 1024)
    page.wait_for_timeout(500)
    check("imagen faltante se retira sin romper la galería", page.locator("[data-gallery-item]").count() == 2 and not page.page_errors)
    check("metadatos SEO estáticos presentes, sin canonical ni schema inventado",
          page.locator("meta[name='description']").count() == 1 and
          page.locator("link[rel='canonical']").count() == 0 and
          page.locator("script[type='application/ld+json']").count() == 0)
    context.close()
    all_broken = fixture_config()
    for index, item in enumerate(all_broken["gallery"]["items"]):
        item["src"] = f"no-existe-{index}.jpg"
    context, page = open_page(browser, all_broken, 1024)
    page.wait_for_timeout(500)
    check("si todas las imágenes fallan, se ocultan galería y anclas",
          page.locator("#proyectos").count() == 0 and page.locator("#site-nav a[href='#proyectos']").count() == 0)
    context.close()

    sync = subprocess.run(
        ["node", os.path.join(ROOT, "modelo-c", "tools", "sync-seo.js"), "--check"],
        capture_output=True, text=True,
    )
    check("SEO estático sincronizado con la configuración", sync.returncode == 0, sync.stdout + sync.stderr)
    browser.close()

server.shutdown()
server.server_close()
failures = [result for result in results if not result[1]]
print(f"\n{len(results) - len(failures)}/{len(results)} comprobaciones correctas.")
if failures:
    raise SystemExit(1)
