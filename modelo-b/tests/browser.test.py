"""Pruebas de navegador (Chromium + Playwright) de los Modelos A y B.
Uso (desde la raíz del repo):  python modelo-b/tests/browser.test.py
Levanta su propio servidor local. Requiere: pip install playwright && playwright install chromium"""
import http.server, socketserver, threading, os, sys, json, functools, subprocess
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a, **k): pass
Handler = functools.partial(Quiet, directory=ROOT)
srv = socketserver.TCPServer(("127.0.0.1", 0), Handler); PORT = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{PORT}"
RES = []
def check(name, cond, detail=""):
    RES.append((name, bool(cond), detail)); print(("  ✔ " if cond else "  ✘ ") + name + (f"  → {detail}" if (detail and not cond) else ""))

DESK = {"width": 1440, "height": 900}; MOB = {"width": 390, "height": 844}
def ignore(m): return any(x in m for x in ("ERR_", "Failed to load resource"))

def open_page(p, url, vp, mobile=False, cfg=None, append=None):
    b = p.chromium.launch(); ctx = b.new_context(viewport=vp, is_mobile=mobile, has_touch=mobile); pg = ctx.new_page()
    pg.errors, pg.warns, pg.pageerrors = [], [], []
    pg.on("console", lambda m: (pg.errors if m.type == "error" else pg.warns if m.type == "warning" else []).append(m.text))
    pg.on("pageerror", lambda e: pg.pageerrors.append(str(e)))
    if cfg is not None:
        pg.route("**/config.premium.js", lambda r: r.fulfill(status=200, content_type="application/javascript", body=cfg))
    elif append:
        def h(r):
            resp = r.fetch(); r.fulfill(response=resp, body=resp.text() + "\n" + append)
        pg.route("**/config.premium.js", h)
    pg.goto(url); pg.wait_for_timeout(700)
    pg.evaluate("document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-visible'))")
    pg._b = b
    return pg
def hscroll(pg): return pg.evaluate("document.documentElement.scrollWidth>document.documentElement.clientWidth")
def real_errors(pg): return [e for e in pg.errors if not ignore(e)] + pg.pageerrors
B = BASE + "/modelo-b/index.html"; A = BASE + "/modelo-a/index.html"

with sync_playwright() as p:
    print("\n[1-4] Modelos A y B · escritorio y móvil")
    for name, url in (("A", A), ("B", B)):
        for vn, vp, mob in (("escritorio", DESK, False), ("móvil", MOB, True)):
            pg = open_page(p, url, vp, mob)
            check(f"Modelo {name} {vn}: sin errores JS", not real_errors(pg), real_errors(pg))
            check(f"Modelo {name} {vn}: sin scroll horizontal", not hscroll(pg))
            if name == "A":
                html = pg.content()
                check(f"Modelo A {vn}: sin testimonios ficticios", all(x not in html for x in ("Rodrigo Paz", "Estela Gómez", "Facundo Ibarra")) and pg.locator(".testimonials").count() == 0)
                check(f"Modelo A {vn}: meta description íntegra", pg.locator('meta[name="description"]').count() == 1 and pg.get_attribute('meta[name="description"]', "content").startswith("FREN Ferreterías"))
            else:
                check(f"Modelo B {vn}: secciones esperadas", pg.evaluate("[...document.querySelectorAll('main>section')].map(s=>s.id)") == ["inicio","nosotros","rubros","galeria","contacto"])
                check(f"Modelo B {vn}: sin avisos de configuración", not pg.evaluate("window.__PREMIUM_ISSUES__").__len__(), pg.evaluate("window.__PREMIUM_ISSUES__"))
                check(f"Modelo B {vn}: fuentes autoalojadas cargadas", pg.evaluate("document.fonts.check('500 20px \"Cormorant Garamond\"') && document.fonts.check('400 16px Inter')"))
                if vn == "escritorio": pg.screenshot(path="/tmp/B-desk.png")
            pg._b.close()

    print("\n[5] Menú móvil · [7] teclado")
    pg = open_page(p, B, MOB, True)
    pg.tap("#menu-toggle"); pg.wait_for_timeout(500)
    check("menú: abre (aria-expanded=true)", pg.get_attribute("#menu-toggle", "aria-expanded") == "true")
    seen = set()
    for _ in range(9):
        pg.keyboard.press("Tab"); seen.add(pg.evaluate("document.activeElement.id || document.activeElement.textContent.trim()"))
    inside = pg.evaluate("document.activeElement.closest('#site-header')!==null")
    check("menú: el foco queda atrapado en el menú abierto", inside, seen)
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    check("menú: Escape cierra y devuelve el foco al botón", pg.get_attribute("#menu-toggle", "aria-expanded") == "false" and pg.evaluate("document.activeElement.id") == "menu-toggle")
    pg.tap("#menu-toggle"); pg.tap("#site-nav a >> nth=1"); pg.wait_for_timeout(500)
    check("menú: tocar un enlace lo cierra", pg.get_attribute("#menu-toggle", "aria-expanded") == "false")
    pg._b.close()

    print("\n[6][7] Lightbox y teclado (escritorio)")
    pg = open_page(p, B, DESK)
    pg.keyboard.press("Tab"); check("teclado: primer Tab = enlace 'Saltar al contenido'", pg.evaluate("document.activeElement.className") == "skip")
    pg.evaluate("document.querySelector('#galeria').scrollIntoView()"); pg.wait_for_timeout(500)
    pg.focus(".mosaic__item >> nth=1"); pg.keyboard.press("Enter"); pg.wait_for_timeout(400)
    check("lightbox: abre con Enter", pg.evaluate("document.querySelector('#lightbox').classList.contains('is-open')"))
    check("lightbox: foco inicial en Cerrar", pg.evaluate("document.activeElement.id") == "lb-close")
    pg.keyboard.press("ArrowRight"); check("lightbox: flecha derecha avanza", pg.inner_text("#lb-count") == "3 / 6", pg.inner_text("#lb-count"))
    ok = True
    for _ in range(8):
        pg.keyboard.press("Tab"); ok = ok and pg.evaluate("document.activeElement.closest('#lightbox')!==null")
    check("lightbox: trampa de foco (8 Tab seguidos)", ok)
    pg.keyboard.press("Shift+Tab"); check("lightbox: Shift+Tab también atrapado", pg.evaluate("document.activeElement.closest('#lightbox')!==null"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    check("lightbox: Escape cierra y devuelve el foco a la miniatura", (not pg.evaluate("document.querySelector('#lightbox').classList.contains('is-open')")) and pg.evaluate("document.activeElement.classList.contains('mosaic__item')"))
    check("lightbox: sin errores JS", not real_errors(pg), real_errors(pg))
    pg._b.close()

    print("\n[8] Configuración incompleta / vacía / ausente")
    pg = open_page(p, B, DESK, cfg='const PREMIUM_CONFIG = {brand:{name:"Solo Nombre"}, hero:{title:"Hola"}, services:{items:[{name:"A"},{},"x",null,{name:5}]}};')
    check("incompleta: no lanza excepciones", not pg.pageerrors, pg.pageerrors)
    check("incompleta: renderiza hero + 1 rubro válido", pg.evaluate("[...document.querySelectorAll('main>section')].map(s=>s.id)") == ["inicio","rubros"] and pg.locator(".svc").count() == 1)
    check("incompleta: sin textos 'undefined'/'null' en pantalla", not any(x in pg.inner_text("body") for x in ("undefined", "null", "NaN")))
    check("incompleta: avisos claros en consola", any("[ALMATE Premium]" in w for w in pg.warns), pg.warns[:2])
    check("incompleta: sin scroll horizontal", not hscroll(pg)); pg._b.close()
    pg = open_page(p, B, DESK, cfg="const PREMIUM_CONFIG = {};")
    check("config {}: error crítico visible en consola y mensaje en pantalla", any("brand.name" in e for e in pg.errors) and pg.locator(".config-error").count() == 1 and not pg.pageerrors, (pg.errors[:2], pg.pageerrors)); pg._b.close()
    pg = open_page(p, B, DESK, cfg="/* vacío */")
    check("config ausente: no rompe y lo informa", not pg.pageerrors and any("[ALMATE Premium]" in e for e in pg.errors) and pg.locator(".config-error").count() == 1, (pg.errors[:2], pg.pageerrors)); pg._b.close()

    print("\n[9] Secciones deshabilitadas / inexistentes")
    pg = open_page(p, B, DESK, append='PREMIUM_CONFIG.sections=["hero","inexistente","location","hero"];')
    check("secciones: solo las habilitadas (hero, contacto)", pg.evaluate("[...document.querySelectorAll('main>section')].map(s=>s.id)") == ["inicio","contacto"])
    check("secciones: nav y footer sin enlaces a secciones ocultas", pg.locator('#nav-list a[href="#rubros"]').count() == 0 and pg.locator('#footer-nav a[href="#galeria"]').count() == 0)
    check("secciones: inexistente/duplicada → aviso", any("inexistente" in w for w in pg.warns) and any("repetida" in w for w in pg.warns), pg.warns[:3]); pg._b.close()
    pg = open_page(p, B, DESK, append='PREMIUM_CONFIG.sections=["hero","testimonials"]; PREMIUM_CONFIG.hero.ctaSecondaryTarget="services";')
    check("secciones: testimonios vacíos no se muestran; CTA secundario sin destino se omite", pg.locator("#opiniones").count() == 0 and pg.locator(".btn--ghost").count() == 0); pg._b.close()

    print("\n[10] Enlaces/URLs inválidos e inyección")
    bad = '''PREMIUM_CONFIG.contact.social={instagram:"javascript:alert(1)",facebook:"https://facebook.com/ok"};
PREMIUM_CONFIG.contact.phoneHref="javascript:alert(2)"; PREMIUM_CONFIG.contact.email="no es mail";
PREMIUM_CONFIG.contact.whatsapp="abc"; PREMIUM_CONFIG.contact.map.externalUrl="javascript:alert(3)"; PREMIUM_CONFIG.contact.map.embedUrl="http://inseguro.com";
PREMIUM_CONFIG.footer.creditUrl="javascript:alert(4)";
PREMIUM_CONFIG.hero.title='<img src=x onerror="window.__xss=1">'; PREMIUM_CONFIG.hero.image="javascript:alert(5)";
PREMIUM_CONFIG.services.items[0].name='<script>window.__xss=2</script>"><b>x</b>'; PREMIUM_CONFIG.services.items[0].image="data:image/svg+xml,<svg onload=alert(6)>";
PREMIUM_CONFIG.gallery.items[0].src="//evil.com/x.png"; PREMIUM_CONFIG.gallery.items[1].src="../../etc/passwd"; PREMIUM_CONFIG.gallery.items[2].alt='" onload="window.__xss=3';'''
    pg = open_page(p, B, DESK, append=bad)
    html = pg.content()
    check("inyección: ningún XSS se ejecutó", pg.evaluate("window.__xss") is None)
    check("inyección: el HTML de la config se muestra como texto", "<img src=x onerror" in pg.inner_text("h1") and "<script>window.__xss=2" in pg.inner_text(".svc >> nth=0"), pg.inner_text("h1"))
    check("inyección: ningún href/src con javascript:/data:/// externo", pg.evaluate("[...document.querySelectorAll('[href],[src]')].filter(e=>/^\\s*(javascript:|data:|\\/\\/)/i.test(e.getAttribute('href')||e.getAttribute('src')||'')).length") == 0)
    check("enlaces inválidos: redes/teléfono/email/mapa descartados, válidos conservados", pg.locator('a[href*="javascript"]').count() == 0 and pg.locator('a[href^="mailto:"]').count() == 0 and pg.locator('a[href^="https://facebook.com/ok"]').count() == 1 and pg.locator("iframe").count() == 1 and "google.com/maps" in pg.get_attribute("iframe", "src"))
    check("WhatsApp inválido: sin botones ni flotante", pg.locator('a[href*="wa.me"]').count() == 0 and pg.locator("#wa-float").count() == 0)
    check("rel=noopener noreferrer en todo target=_blank", pg.evaluate("[...document.querySelectorAll('a[target=_blank]')].every(a=>/noopener/.test(a.rel)&&/noreferrer/.test(a.rel))") and pg.locator("a[target=_blank]").count() >= 1)
    check("inyección: avisos en consola por cada valor descartado", len([w for w in pg.warns if "[ALMATE Premium]" in w]) >= 8, len(pg.warns))
    check("inyección: sin errores JS", not pg.pageerrors, pg.pageerrors); pg._b.close()

    print("\n[11] Imágenes inexistentes")
    pg = open_page(p, B, DESK, append='PREMIUM_CONFIG.hero.image="no-existe-hero.jpg"; PREMIUM_CONFIG.about.image="no-existe-about.jpg"; PREMIUM_CONFIG.services.items[1].image="no-existe-svc.jpg"; PREMIUM_CONFIG.gallery.items[0].src="no-existe-g1.jpg"; PREMIUM_CONFIG.gallery.items[3].src="no-existe-g4.jpg";')
    pg.evaluate("window.scrollTo({top:document.body.scrollHeight,behavior:'instant'})"); pg.wait_for_timeout(1200)
    check("imágenes rotas: sin excepciones JS", not pg.pageerrors, pg.pageerrors)
    check("imágenes rotas: hero sin imagen sigue con título y botones", pg.locator(".hero--noimage h1").count() == 1 and pg.locator(".hero .btn").count() >= 1)
    check("imágenes rotas: about/rubro degradan sin hueco", pg.locator(".about--noimg").count() == 1 and pg.locator(".svc--noimg").count() == 1)
    check("imágenes rotas: se quitan solo las miniaturas rotas (6 → 4)", pg.locator(".mosaic__item").count() == 4, pg.locator(".mosaic__item").count())
    check("imágenes rotas: aviso con la ruta en consola", any("no-existe-g1.jpg" in w for w in pg.warns), pg.warns[:3])
    check("imágenes rotas: sin scroll horizontal", not hscroll(pg)); pg.screenshot(path="/tmp/B-broken.png", full_page=False); pg._b.close()
    all_bad = 'PREMIUM_CONFIG.gallery.items.forEach((g,i)=>g.src="nope"+i+".jpg");'
    pg = open_page(p, B, DESK, append=all_bad); pg.evaluate("document.querySelector('#galeria')&&document.querySelector('#galeria').scrollIntoView()"); pg.wait_for_timeout(1500)
    check("imágenes rotas: si fallan todas, la galería y su enlace desaparecen", pg.locator("#galeria").count() == 0 and pg.locator('a[href="#galeria"]').count() == 0 and not pg.pageerrors); pg._b.close()

    print("\n[12] WhatsApp y mapa configurable")
    pg = open_page(p, B, DESK)
    wa = pg.get_attribute("#wa-float", "href")
    check("WhatsApp: formato wa.me con mensaje codificado", wa.startswith("https://wa.me/541142502865?text=Hola%2C") , wa)
    check("WhatsApp: hero + contacto + flotante apuntan al mismo enlace", pg.evaluate("[...document.querySelectorAll('a[href*=\"wa.me\"]')].every(a=>a.href===document.querySelector('#wa-float').href)") and pg.locator('a[href*="wa.me"]').count() == 3)
    pg.evaluate("window.scrollTo({top:0,behavior:'instant'})"); pg.wait_for_timeout(300)
    check("WhatsApp flotante: oculto sobre el hero, visible al bajar", pg.evaluate("getComputedStyle(document.querySelector('#wa-float')).visibility")=="hidden")
    pg.evaluate("window.scrollTo({top:1500,behavior:'instant'})"); pg.wait_for_timeout(500)
    check("WhatsApp flotante: visible tras el hero", pg.evaluate("getComputedStyle(document.querySelector('#wa-float')).visibility")=="visible"); pg._b.close()
    pg = open_page(p, B, DESK, append='PREMIUM_CONFIG.contact.map.show=false; PREMIUM_CONFIG.contact.map.externalUrl="https://maps.google.com/?q=x";')
    check("mapa oculto: sin iframe, con enlace 'Cómo llegar' seguro, layout de una columna", pg.locator("iframe").count() == 0 and pg.locator(".contact--nomap").count() == 1 and pg.locator('a.link-line[rel~="noopener"]').count() == 1 and not hscroll(pg)); pg.screenshot(path="/tmp/B-nomap.png"); pg._b.close()
    pg = open_page(p, B, DESK, append='PREMIUM_CONFIG.contact.map.query="";')
    check("mapa sin query/embed: no se renderiza", pg.locator("iframe").count() == 0 and pg.locator(".contact--nomap").count() == 1); pg._b.close()
    pg = open_page(p, B, DESK, append='PREMIUM_CONFIG.contact.map.embedUrl="https://www.openstreetmap.org/export/embed.html?bbox=-58.3,-34.8,-58.2,-34.7";')
    check("mapa: embedUrl https propio reemplaza al de Google", "openstreetmap.org" in pg.get_attribute("iframe", "src")); pg._b.close()

    print("\n[13] SEO estático")
    r = subprocess.run(["node", os.path.join(ROOT, "modelo-b/tools/sync-seo.js"), "--check"], capture_output=True, text=True)
    check("sync-seo --check: head coincide con la config", r.returncode == 0, r.stdout + r.stderr)
    html = open(os.path.join(ROOT, "modelo-b/index.html"), encoding="utf-8").read()
    check("HTML estático: title, description, og:title, twitter:card, preload y JSON-LD presentes", all(x in html for x in ("<title>FREN", 'name="description"', 'property="og:title"', 'name="twitter:card"', 'rel="preload" as="image"', 'application/ld+json')))
    check("HTML estático: sin canonical/og:image inventados (seo.url vacío)", 'rel="canonical"' not in html and 'og:image' not in html)
    pg = open_page(p, B, DESK)
    ld = pg.evaluate("JSON.parse(document.getElementById('ld-json').textContent)")
    check("JSON-LD válido, solo con datos de la config", ld["@type"] == "HardwareStore" and ld["telephone"] == "(011) 4250-2865" and "aggregateRating" not in ld and "priceRange" not in ld)
    check("head al día: el motor no avisa de desincronización", pg.evaluate("window.__PREMIUM_SEO_STALE__") == [] and not any("no coincide" in w for w in pg.warns)); pg._b.close()
    pg = open_page(p, B, DESK, append='PREMIUM_CONFIG.seo.title="Otro título";')
    check("head desactualizado: el motor avisa en consola", any("no coincide" in w and "title" in w for w in pg.warns), pg.warns[:2]); pg._b.close()
    # Portabilidad: el comando original usaba cp/sed que no existen en cmd.exe
    # (Windows). Se hace lo mismo en Python: alterar el <head>, comprobar que
    # --check sale con 1 y restaurar el archivo byte a byte.
    idx_path = os.path.join(ROOT, "modelo-b", "index.html")
    with open(idx_path, "rb") as fh:
        original = fh.read()
    altered = original.replace(b"<title>FREN", b"<title>XX", 1)
    with open(idx_path, "wb") as fh:
        fh.write(altered)
    try:
        s = subprocess.run(["node", os.path.join(ROOT, "modelo-b", "tools", "sync-seo.js"), "--check"], capture_output=True, text=True)
        code, out = s.returncode, (s.stdout + s.stderr).strip()
    finally:
        with open(idx_path, "wb") as fh:
            fh.write(original)
    check("sync-seo --check detecta un head alterado (exit 1)", code == 1, f"exit={code} {out}")
    check("index.html se restauró byte a byte", open(idx_path, "rb").read() == original)

    print("\n[14-15] Sin scroll horizontal ni errores JS en configuraciones extremas")
    long_txt = "Palabra" + "extremadamentelarga" * 12
    pg = open_page(p, B, MOB, True, append=f'PREMIUM_CONFIG.hero.title="{long_txt}"; PREMIUM_CONFIG.services.items[0].name="{long_txt}"; PREMIUM_CONFIG.contact.email="{"a"*60}@{"b"*60}.com";')
    check("móvil con textos larguísimos: sin scroll horizontal", not hscroll(pg), pg.evaluate("document.documentElement.scrollWidth")); pg.screenshot(path="/tmp/B-long.png"); pg._b.close()
    pg = open_page(p, B, {"width": 320, "height": 640}, True)
    check("320 px de ancho: sin scroll horizontal ni errores", not hscroll(pg) and not real_errors(pg)); pg._b.close()
    pg = open_page(p, B, {"width": 820, "height": 1180}, True)
    check("tablet 820 px: sin scroll horizontal ni errores", not hscroll(pg) and not real_errors(pg)); pg._b.close()
    pg = open_page(p, B, MOB, True, append='PREMIUM_CONFIG.sections=["hero","about","services","gallery","testimonials","location"]; PREMIUM_CONFIG.testimonials.items=[{text:"Opinión de prueba autorizada.",author:"Cliente Real",role:"Rol"}];')
    check("testimonios reales: se muestran cuando existen", pg.locator(".quote").count() == 1 and not hscroll(pg) and not real_errors(pg)); pg._b.close()

srv.shutdown()
fails = [r for r in RES if not r[1]]
print(f"\n{len(RES)-len(fails)}/{len(RES)} pruebas aprobadas"); sys.exit(1 if fails else 0)
