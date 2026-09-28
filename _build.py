#!/usr/bin/env python3
# Generator für die Website der Euregio-Motorcars GmbH (Stolberg).
# Erzeugt alle HTML-Seiten mit gemeinsamem Kopf und Fuß. Aufruf: python3 _build.py
# Der Fahrzeugbestand steckt NICHT im HTML, sondern in data/bestand.js (wird stündlich aktualisiert).

import json, os, html, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
V = datetime.datetime.now().strftime('%Y%m%d%H%M')
BASE = 'https://www.euregio-motorcars.de/'

FIRMA = 'Euregio-Motorcars GmbH'
STR = 'Eschweilerstraße 167'
PLZ = '52222'
ORT = 'Stolberg (Rheinland)'
TEL = '02402 1247840'
TEL_L = '+4924021247840'
MOBIL = '0157 72567022'
MOBIL_L = '+4915772567022'
WA = 'https://wa.me/4915772567022'
FAX = '02402 1247841'
MAIL = 'info@euregio-motorcars.de'
MOBILE_DE = 'https://home.mobile.de/EUREGIOMOTORCARSGMBH'
GEO = (50.7892563, 6.2225069)

e = html.escape

# ---------------------------------------------------------------- Bausteine
def img(name, alt, cls='', sizes='100vw', eager=False, w=1600, h=1200, extra=''):
    load = 'fetchpriority="high"' if eager else 'loading="lazy" decoding="async"'
    return (f'<img class="{cls}" src="img/{name}-1600.webp" srcset="img/{name}-800.webp 800w, img/{name}-1600.webp 1600w" '
            f'sizes="{sizes}" width="{w}" height="{h}" alt="{e(alt)}" {load} {extra}>')

LOGO = '''<svg class="logo-svg" viewBox="0 0 220 64" role="img" aria-label="Euregio Motorcars GmbH">
<path class="roof" d="M4 30 C40 26 62 24 84 13 C98 6 128 4 150 12 C166 18 176 24 186 27 C198 29 210 30 216 31" fill="none" stroke-width="2.4" stroke-linecap="round"/>
<text x="110" y="46" text-anchor="middle" class="lw">euregio</text>
<text x="110" y="60" text-anchor="middle" class="ls">MOTORCARS GMBH</text></svg>'''

ICON = {
 'phone': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" fill="currentColor"/></svg>',
 'wa': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.25-.12-1.46-.72-1.69-.8s-.39-.12-.55.12-.63.8-.78.96-.29.19-.53.06a6.7 6.7 0 0 1-3.34-2.92c-.25-.43.25-.4.72-1.34a.45.45 0 0 0-.02-.43c-.06-.12-.55-1.33-.76-1.82s-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.7 2.7 0 0 0-.85 2.02 4.7 4.7 0 0 0 1 2.5 10.8 10.8 0 0 0 4.14 3.66c1.54.66 2.14.72 2.91.6a2.5 2.5 0 0 0 1.63-1.15 2 2 0 0 0 .14-1.15c-.06-.1-.22-.16-.47-.28z" fill="currentColor"/></svg>',
 'arrow': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 'pin': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="2.6" fill="currentColor"/></svg>',
 'car': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 15v-3l2-5a2 2 0 0 1 1.9-1.3h10.2A2 2 0 0 1 19 7l2 5v3a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1zm3-4h12l-1.3-3.4H7.3z" fill="currentColor"/></svg>',
}
def arrow(): return '<span class="ar">' + ICON['arrow'] + '</span>'

SERVICE = [
 ('werkstatt.html', 'Werkstatt & Inspektion', 'Reparatur, Inspektion, Klima- und Winter-Check, Ersatzteile – mit Saison-Kalender'),
 ('karosserie-lack.html', 'Karosserie, Lack & Glas', 'Karosserie-Werkstatt, Lackiererei, Autoglas, Scheibentönung – mit Schadenskizze'),
 ('reifen.html', 'Reifen & Einlagerung', 'Reifenwechsel und Reifenlager – mit Reifencode-Leser'),
 ('hu-zulassung.html', 'HU & Zulassung', 'HU vor Ort durch amtlichen Anbieter, Zulassungsservice – mit Plaketten-Prüfer'),
 ('aufbereitung.html', 'Aufbereitung', 'Kfz-Aufbereitung innen und außen – mit Pflege-Intervall'),
]

NAV = [('fahrzeuge.html', 'Fahrzeuge'), ('service', 'Service'), ('finanzierung.html', 'Finanzierung'), ('ueber-uns.html', 'Über uns'), ('kontakt.html', 'Kontakt')]

def header(p):
    items = []
    for href, label in NAV:
        if href == 'service':
            act = ' aria-current="true"' if p.get('group') == 'service' else ''
            cur_attr = ' aria-current="page"'
            sub = ''.join('<li><a href="' + h + '"' + (cur_attr if p['file'] == h else '') + '><b>' + e(t) + '</b><span>' + e(d) + '</span></a></li>' for h, t, d in SERVICE)
            items.append(f'''<li class="has-dd"><button type="button" aria-expanded="false" aria-controls="dd-service"{act}>Service<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button>
<div class="dd" id="dd-service"><ul>{sub}</ul><a class="dd-all" href="service.html">Alle Services im Überblick {arrow()}</a></div></li>''')
        else:
            cur = ' aria-current="page"' if p['file'] == href or p.get('group') == href else ''
            items.append(f'<li><a href="{href}"{cur}>{label}</a></li>')
    return f'''<a class="skip" href="#main">Zum Inhalt springen</a>
<div id="progress" aria-hidden="true"></div>
<header id="head" class="{'over' if p.get('over') else ''}">
 <a class="brand" href="index.html" aria-label="Euregio Motorcars – Startseite">{LOGO}</a>
 <nav class="mainnav" aria-label="Hauptmenü"><ul>{''.join(items)}</ul></nav>
 <div class="head-r">
  <span class="open-state" data-open-state>Mo–Fr 9–19 · Sa 9–14</span>
  <a class="stock-btn mag" href="fahrzeuge.html"><span class="n" data-live-count>36</span><span class="t">Fahrzeuge</span></a>
  <a class="icon-btn" href="tel:{TEL_L}" aria-label="Anrufen: {TEL}">{ICON['phone']}</a>
  <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu"><span class="bars" aria-hidden="true"><i></i><i></i></span><span class="lbl">Menü</span></button>
 </div>
</header>
<div id="menu" class="menu" aria-label="Menü">
 <ul class="menu-main">
  <li><a href="fahrzeuge.html">Fahrzeuge <small data-live-count-text>Aktueller Bestand</small></a></li>
  <li><a href="service.html">Service</a></li>
  {''.join(f'<li class="sub"><a href="{h}">{e(t)}</a></li>' for h, t, d in SERVICE)}
  <li><a href="finanzierung.html">Finanzierung</a></li>
  <li><a href="probefahrt.html">Probefahrt</a></li>
  <li><a href="ueber-uns.html">Über uns</a></li>
  <li><a href="kontakt.html">Kontakt</a></li>
 </ul>
 <div class="menu-foot">
  <a href="tel:{TEL_L}">{ICON['phone']} {TEL}</a>
  <a href="{WA}" target="_blank" rel="noopener">{ICON['wa']} WhatsApp</a>
  <p>{STR}, {PLZ} Stolberg · Mo–Fr 9–19, Sa 9–14 Uhr</p>
 </div>
</div>'''

def footer(p):
    return f'''<footer class="foot">
 <div class="wrap foot-grid">
  <div class="foot-brand">{LOGO}
   <p>Gebrauchtwagen und Service an der Eschweilerstraße in Stolberg – seit 2011 mit dem Bestand bei mobile.de.</p>
   <p class="foot-stand" data-stand>Bestand: wird geladen …</p>
  </div>
  <div><h2>Besuchen</h2><address>{FIRMA}<br>{STR}<br>{PLZ} {ORT}</address>
   <p class="hours">Mo–Fr 9:00–19:00 Uhr<br>Sa 9:00–14:00 Uhr<br>So geschlossen</p></div>
  <div><h2>Erreichen</h2><ul class="foot-c">
   <li><a href="tel:{TEL_L}">Telefon {TEL}</a></li>
   <li><a href="tel:{MOBIL_L}">Mobil {MOBIL}</a></li>
   <li><a href="{WA}" target="_blank" rel="noopener">WhatsApp</a></li>
   <li><a href="mailto:{MAIL}">{MAIL}</a></li></ul></div>
  <div><h2>Seiten</h2><ul class="foot-l">
   <li><a href="fahrzeuge.html">Fahrzeuge</a></li><li><a href="finanzierung.html">Finanzierung</a></li>
   <li><a href="probefahrt.html">Probefahrt</a></li><li><a href="service.html">Service</a></li>
   <li><a href="ratgeber.html">Ratgeber</a></li><li><a href="faq.html">Häufige Fragen</a></li>
   <li><a href="ueber-uns.html">Über uns</a></li><li><a href="kontakt.html">Kontakt</a></li></ul></div>
 </div>
 <div class="wrap foot-bottom"><span>© {datetime.date.today().year} {FIRMA}</span>
  <span><a href="impressum.html">Impressum</a> <a href="datenschutz.html">Datenschutz</a> <a href="{MOBILE_DE}" target="_blank" rel="noopener">Händlerseite bei mobile.de</a></span></div>
</footer>
<a class="sticky-cta" href="fahrzeuge.html"><span data-live-count>36</span> Fahrzeuge ansehen {arrow()}</a>'''

LD_BIZ = {
 "@context": "https://schema.org", "@type": "AutoDealer", "@id": BASE + "#firma",
 "name": FIRMA, "url": BASE, "telephone": "+49 2402 1247840", "faxNumber": "+49 2402 1247841", "email": MAIL,
 "image": BASE + "img/szene-hof-1600.webp", "logo": BASE + "apple-touch-icon.png",
 "address": {"@type": "PostalAddress", "streetAddress": STR, "postalCode": PLZ, "addressLocality": "Stolberg (Rheinland)", "addressRegion": "NRW", "addressCountry": "DE"},
 "geo": {"@type": "GeoCoordinates", "latitude": GEO[0], "longitude": GEO[1]},
 "openingHoursSpecification": [
   {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "09:00", "closes": "19:00"},
   {"@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "14:00"}],
 "areaServed": ["Stolberg", "Aachen", "Eschweiler", "Städteregion Aachen"],
 "knowsLanguage": ["de", "en"],
 "sameAs": [MOBILE_DE],
}

def head(p):
    lds = [LD_BIZ] + p.get('ld', [])
    ld = ''.join('<script type="application/ld+json">' + json.dumps(x, ensure_ascii=False) + '</script>' for x in lds)
    robots = '<meta name="robots" content="noindex">' if p.get('noindex') else ''
    og = p.get('og', 'og.jpg')
    extra_css = p.get('head_extra', '')
    return f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(p['title'])}</title>
<meta name="description" content="{e(p['desc'])}">
{robots}
<link rel="canonical" href="{BASE}{'' if p['file'] == 'index.html' else p['file']}">
<meta property="og:type" content="website">
<meta property="og:locale" content="de_DE">
<meta property="og:site_name" content="Euregio Motorcars">
<meta property="og:title" content="{e(p['title'])}">
<meta property="og:description" content="{e(p['desc'])}">
<meta property="og:url" content="{BASE}{'' if p['file'] == 'index.html' else p['file']}">
<meta property="og:image" content="{BASE}{og}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#2b2f34">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="preload" href="fonts/saira-var.woff2" as="font" type="font/woff2" crossorigin>
{p.get('preload', '')}
<link rel="stylesheet" href="styles.css?v={V}">
{extra_css}
{ld}
</head>
<body class="{p.get('body', '')}" data-page="{p['file'].replace('.html', '')}"{' data-bestand="voll"' if p.get('full') else ''}>
<div class="curtain intro" aria-hidden="true"><div class="intro-in">{LOGO}</div></div>
<div class="curtain leave" aria-hidden="true"></div>
'''

def scripts(p):
    s = [f'<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js" defer></script>',
         f'<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js" defer></script>',
         f'<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.11/dist/lenis.min.js" defer></script>',
         f'<script src="main.js?v={V}" defer></script>']
    if p.get('bestand'):
        s.append(f'<script src="bestand-ui.js?v={V}" defer></script>')
    for x in p.get('js', []):
        s.append(f'<script src="{x}?v={V}" defer></script>')
    return '\n'.join(s)

def page(p, body):
    out = head(p) + header(p) + f'\n<main id="main">\n{body}\n</main>\n' + footer(p) + '\n' + scripts(p) + '\n</body>\n</html>\n'
    with open(os.path.join(ROOT, p['file']), 'w', encoding='utf-8') as f:
        f.write(out)
    PAGES.append(p)

PAGES = []

# ---------------------------------------------------------------- Unterseiten-Kopf „Hof-Kopf“
def hofkopf(title, lead, photo=None, alt=None, kicker=''):
    # Foto: ein aktuelles Auto aus dem Bestand (per Skript), ohne Skript der Hof
    seed = sum(ord(c) for c in title) % 97
    return f'''<section class="hofkopf">
 <div class="wrap hk-grid">
  <div class="hk-text">{f'<p class="kicker">{e(kicker)}</p>' if kicker else ''}<h1 class="split">{e(title)}</h1>
   <p class="lead">{lead}</p>
   <p class="liveline"><span class="dot" aria-hidden="true"></span><span>Heute <b data-live-count>35</b> Fahrzeuge auf dem Hof · <span data-open-state>Mo–Fr 9–19, Sa 9–14</span></span></p></div>
  <figure class="hk-fig" data-live-photo="{seed}">{img('szene-hof', 'Der Hof von Euregio Motorcars mit Halle, Silos und Fahrzeugen', 'hk-img', '(max-width: 800px) 100vw, 45vw', True)}<figcaption hidden></figcaption></figure>
 </div>
</section>'''

def cta(title='Vorbeikommen, anrufen oder schreiben.', text='Probefahrt, Finanzierung oder ein Termin für die Werkstatt – wir melden uns am selben Tag zurück, meistens schneller.', thema=''):
    q = f'?thema={thema}' if thema else ''
    return f'''<section class="cta-end">
 <div class="wrap cta-in">
  <h2 class="split">{e(title)}</h2>
  <p>{e(text)}</p>
  <div class="btns">
   <a class="btn mag" href="kontakt.html{q}">Anfrage senden {arrow()}</a>
   <a class="btn ghost mag" href="tel:{TEL_L}">{ICON['phone']} {TEL}</a>
   <a class="btn ghost mag" href="{WA}" target="_blank" rel="noopener">{ICON['wa']} WhatsApp</a>
  </div>
 </div>
</section>'''

def form(thema_default='', ident='anfrage', fahrzeugwahl=False, titel='Ihre Anfrage'):
    themen = [('probefahrt', 'Probefahrt'), ('fahrzeug', 'Frage zu einem Fahrzeug'), ('finanzierung', 'Finanzierung / Leasing'),
              ('werkstatt', 'Werkstatt / Inspektion'), ('karosserie', 'Karosserie, Lack & Glas'), ('reifen', 'Reifen / Einlagerung'),
              ('hu', 'HU / Zulassung'), ('aufbereitung', 'Aufbereitung'), ('sonstiges', 'Sonstiges')]
    opts = ''.join(f'<option value="{v}"{" selected" if v == thema_default else ""}>{t}</option>' for v, t in themen)
    pick = ''
    if fahrzeugwahl:
        pick = '''<fieldset class="carpick"><legend>Welches Auto?</legend>
   <div class="carpick-strip" data-carpick role="radiogroup" aria-label="Fahrzeug aus dem Bestand wählen"><p class="muted">Bestand wird geladen …</p></div>
  </fieldset>
  <div class="row2">
   <label>Wunschtag<select name="wunschtag" data-days></select></label>
   <label>Uhrzeit<select name="uhrzeit" data-times></select></label>
  </div>'''
    return f'''<form class="form" id="{ident}" name="anfrage" method="POST" action="danke.html" data-netlify="true" netlify-honeypot="firma_web" novalidate>
  <input type="hidden" name="form-name" value="anfrage">
  <input type="hidden" name="fahrzeug" value="">
  <p class="hp"><label>Bitte leer lassen <input name="firma_web" tabindex="-1" autocomplete="off"></label></p>
  <h3>{e(titel)}</h3>
  <label>Anliegen<select name="thema" data-thema>{opts}</select></label>
  {pick}
  <div class="row2">
   <label>Name*<input name="name" autocomplete="name" required></label>
   <label>Telefon<input name="telefon" type="tel" autocomplete="tel"></label>
  </div>
  <label>E-Mail*<input name="email" type="email" autocomplete="email" required></label>
  <label>Nachricht<textarea name="nachricht" rows="4" placeholder="Was dürfen wir vorbereiten?"></textarea></label>
  <label class="check"><input type="checkbox" name="datenschutz" required> <span>Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage gespeichert werden (<a href="datenschutz.html">Datenschutz</a>).*</span></label>
  <p class="form-err" role="alert" hidden></p>
  <button class="btn mag" type="submit">Anfrage senden {arrow()}</button>
  <p class="muted small">Lieber direkt? <a href="tel:{TEL_L}">{TEL}</a> oder <a href="{WA}" target="_blank" rel="noopener" data-wa>WhatsApp</a>.</p>
 </form>'''

def mapbox():
    return f'''<div class="mapbox" data-map data-lat="{GEO[0]}" data-lon="{GEO[1]}">
  <button type="button" class="map-load">{ICON['pin']}<span><b>Karte laden</b><small>Erst beim Klick wird OpenStreetMap geladen (Ihre IP-Adresse geht dabei an die OpenStreetMap Foundation).</small></span></button>
 </div>'''

# ---------------------------------------------------------------- Startseite
GEARS = [
 ('1', 'Kaufen & Probefahrt', 'svr-hof', 'Range Rover Sport SVR auf dem Hof', ['Gebrauchtwagen', 'Probefahrt'], 'Den ganzen Bestand filtern, ein Auto aussuchen, Probefahrt anfragen.', 'fahrzeuge.html', 'Bestand durchsuchen'),
 ('2', 'Finanzierung & Leasing', 'cockpit-840', 'Cockpit eines BMW 840d', ['Finanzierung', 'Leasing'], 'Beispielrate zu jedem Auto aus dem Bestand – mit Anzahlung, Laufzeit und Schlussrate.', 'finanzierung.html#werkzeug', 'Rate ausrechnen'),
 ('3', 'Werkstatt & Inspektion', 'werkstatt-840', 'Gebäude mit der Aufschrift Kfz-Werkstatt', ['Reparaturservice', 'Inspektion', 'Klima-Check', 'Winter-Check', 'Ersatzteile & Zubehör'], 'Was steht diesen Monat an? Der Saison-Kalender sagt es.', 'werkstatt.html#werkzeug', 'Saison-Kalender öffnen'),
 ('4', 'Karosserie, Lack & Glas', 'defender', 'Land Rover Defender, Frontansicht', ['Karosserie-Werkstatt', 'Lackiererei', 'Autoglas', 'Scheibentönung'], 'Schaden am Auto markieren und mit der Skizze anfragen.', 'karosserie-lack.html#werkzeug', 'Schadenskizze öffnen'),
 ('5', 'Reifen & Einlagerung', 'x6', 'BMW X6 M mit großen Felgen', ['Reifenwechsel', 'Reifenlager'], 'Was bedeutet 225/45 R17 94W? Der Reifencode-Leser übersetzt es.', 'reifen.html#werkzeug', 'Reifencode lesen'),
 ('6', 'HU & Zulassung', 'szene-werkstatt', 'Land Rover Defender vor der Kfz-Werkstatt', ['HU vor Ort', 'Zulassungsservice'], 'Plakette anklicken – und sehen, wann die nächste HU fällig ist.', 'hu-zulassung.html#werkzeug', 'Plakette prüfen'),
 ('R', 'Aufbereitung', 'cabrio', 'Mercedes-Benz C 300 Cabrio vor der Halle', ['Kfz-Aufbereitung'], 'Wie oft lohnt sich Innenreinigung, Politur, Versiegelung? Drei Fragen genügen.', 'aufbereitung.html#werkzeug', 'Pflege-Intervall ansehen'),
]
GEAR_POS = {'1': (60, 50), '2': (60, 210), '3': (160, 50), '4': (160, 210), '5': (260, 50), '6': (260, 210), 'R': (320, 50)}

def gear_parts():
    labels = ''.join(f'<text class="gl" data-g="{g}" x="{GEAR_POS[g][0]}" y="{GEAR_POS[g][1] + (-30 if GEAR_POS[g][1] < 100 else 44)}" text-anchor="middle">{g}</text>' for g, *_ in GEARS)
    btns = ''.join(f'<button type="button" role="tab" id="gt-{g}" aria-controls="gp-{g}" aria-selected="{"true" if i == 0 else "false"}" data-g="{g}" title="{e(t)}">{g}</button>' for i, (g, t, *_) in enumerate(GEARS))
    panels = ''.join(f'''<div class="gpanel{" on" if i == 0 else ""}" id="gp-{g}" role="tabpanel" aria-labelledby="gt-{g}" data-g="{g}">
    <p class="g-no">Gang {g}</p><h3>{e(t)}</h3><ul>{"".join("<li>" + e(x) + "</li>" for x in items)}</ul>
    <p>{e(txt)}</p><a class="tool-link" href="{href}">{e(lbl)} {arrow()}</a></div>''' for i, (g, t, ph, alt, items, txt, href, lbl) in enumerate(GEARS))
    return labels, btns, panels

def hero():
    return f'''<section class="hero" id="start" aria-labelledby="hero-h">
 <div class="hero-img">{img('szene-hof', 'Der Hof von Euregio Motorcars an der Eschweilerstraße: anthrazitfarbene Halle, zwei gelbe Silos, davor die Fahrzeuge', 'hero-pic', '100vw', True)}</div>
 <div class="hero-scrim" aria-hidden="true"></div>
 <div class="wrap hero-in">
  <p class="kicker">Eschweilerstraße 167 · Stolberg</p>
  <h1 id="hero-h" class="split">Gute Gebrauchte. Ehrlich beschrieben.</h1>
  <p class="hero-p">BMW, Land Rover, Mercedes-Benz, Porsche und mehr – der aktuelle Bestand, live aus unseren Inseraten. Dazu Werkstatt, Reifen, HU und Zulassung an einer Adresse.</p>
  <form class="quick" action="fahrzeuge.html" method="get" data-quick role="search" aria-label="Bestand durchsuchen">
   <label>Marke<select name="marke" data-quick-make><option value="">Alle Marken</option></select></label>
   <label>Preis<select name="preis"><option value="">Alle Preise</option><option value="0-15000">bis 15.000 €</option><option value="15000-25000">15.000–25.000 €</option><option value="25000-35000">25.000–35.000 €</option><option value="35000-999999">ab 35.000 €</option></select></label>
   <label>Aufbau<select name="kategorie" data-quick-kat><option value="">Alle</option></select></label>
   <button class="btn mag" type="submit"><span data-quick-n>35</span>&nbsp;Autos anzeigen {arrow()}</button>
  </form>
  <p class="hero-meta"><span class="open-state" data-open-state>Mo–Fr 9–19 · Sa 9–14</span><a href="tel:{TEL_L}">{ICON['phone']} {TEL}</a><a href="{WA}" target="_blank" rel="noopener">{ICON['wa']} WhatsApp</a></p>
 </div>
</section>'''

def home():
    GL, GB, GP = gear_parts()
    body = hero() + f'''
<section class="hof" id="hof" aria-labelledby="hof-h">
 <div class="wrap">
  <div class="hof-top">
   <div><p class="kicker">Heute auf dem Hof</p><h2 id="hof-h" class="split">Neu im Bestand.</h2></div>
   <div class="hof-ctrl"><button type="button" class="hof-prev" aria-label="Vorheriges Auto">‹</button><span data-hof-n aria-live="polite"></span><button type="button" class="hof-next" aria-label="Nächstes Auto">›</button></div>
  </div>
  <div class="hof-grid">
   <div class="hof-stage" data-hof-stage tabindex="0" aria-label="Neue Autos – mit Pfeiltasten oder Wischen wechseln"><div class="hof-empty muted">Bestand wird geladen …</div><div class="hof-light" aria-hidden="true"></div></div>
   <article class="tag" data-hof-tag>
    <div class="tag-in">
     <p class="tag-k" data-f="kategorie">&nbsp;</p>
     <h3 data-f="titel">&nbsp;</h3>
     <p class="tag-price" data-f="preis">&nbsp;</p>
     <p class="tag-rate" data-f="rate">&nbsp;</p>
     <dl class="tag-dl">
      <div><dt>Erstzulassung</dt><dd data-f="ez">–</dd></div>
      <div><dt>Kilometer</dt><dd data-f="km">–</dd></div>
      <div><dt>Leistung</dt><dd data-f="leistung">–</dd></div>
      <div><dt>Kraftstoff</dt><dd data-f="kraftstoff">–</dd></div>
      <div><dt>Getriebe</dt><dd data-f="getriebe">–</dd></div>
      <div><dt>Vorbesitzer</dt><dd data-f="vorbesitzer">–</dd></div>
     </dl>
     <a class="btn mag" data-f="link" href="fahrzeuge.html">Zum Fahrzeug {arrow()}</a>
    </div>
   </article>
  </div>
  <div class="hof-thumbs" data-hof-thumbs role="group" aria-label="Auto auswählen"></div>
  <p class="hof-all"><a href="fahrzeuge.html">Alle <span data-live-count>35</span> Fahrzeuge ansehen {arrow()}</a></p>
 </div>
</section>

<section class="marken" id="marken" aria-labelledby="marken-h">
 <div class="wrap">
  <div class="sec-head"><p class="kicker">Was gerade da ist</p><h2 id="marken-h" class="split">Marken im Bestand.</h2>
   <p class="lead">Die Balken zeigen, wie viele Autos jeder Marke heute auf dem Hof stehen. Ein Klick filtert den Bestand.</p></div>
  <ul class="mk-list" data-marken><li class="muted">Bestand wird geladen …</li></ul>
  <div class="price-steps" data-preise aria-label="Nach Preis suchen"></div>
 </div>
</section>

<section class="gears" id="service" aria-labelledby="gears-h">
 <div class="wrap gears-grid">
  <div class="gears-l">
   <p class="kicker">Service rund ums Auto</p>
   <h2 id="gears-h" class="split">Alles in einem Gang.</h2>
   <p class="lead">Vom Kauf bis zur nächsten HU: Wählen Sie einen Gang – jeder führt zu einer Seite mit einem kleinen Werkzeug.</p>
   <svg class="shift" viewBox="0 0 360 260" role="group" aria-label="Schaltkulisse mit sieben Service-Bereichen">
    <path class="gate" d="M60 50 V210 M160 50 V210 M260 50 V210 M60 130 H320 M320 130 V50"/>
    {GL}
    <g class="knob-wrap"><g class="knob"><circle r="22"/><circle r="9" class="knob-in"/></g></g>
   </svg>
   <div class="gear-btns" role="tablist" aria-label="Service-Bereich wählen">{GB}</div>
  </div>
  <div class="gears-r" data-gear-panels>{GP}</div>
 </div>
</section>

<section class="gauges dark" id="bewertungen" aria-labelledby="gauges-h">
 <div class="wrap">
  <div class="sec-head"><p class="kicker">Was Kunden sagen</p><h2 id="gauges-h" class="split">Zwei Instrumente, ein Wert.</h2></div>
  <div class="cluster">
   {gauge_svg('google', 'Google', '4,8', '215 Bewertungen', 4.8)}
   <div class="lcd">
    <p><b>94 %</b> Weiterempfehlung</p>
    <p><b>100 %</b> Fahrzeug wie beschrieben</p>
    <p><b>seit 2011</b> bei mobile.de</p>
    <p class="src">Quelle: mobile.de-Händlerprofil, Google-Unternehmensprofil (Stand 28.9.2026)</p>
   </div>
   {gauge_svg('mobile', 'mobile.de', '4,8', '293 Bewertungen', 4.8)}
  </div>
  <div class="quotes">
   <figure><blockquote>„Sehr hilfsbereiter Händler. Auto 100% wie geschrieben, 1 Hand und mit Scheckheft.“</blockquote><figcaption>Google-Bewertung (Auszug)</figcaption></figure>
   <figure><blockquote>„Most big official dealers can learn a lot from the Herman and the team.“</blockquote><figcaption>Richard · mobile.de, 31.08.2026 · Fahrzeug gekauft</figcaption></figure>
   <figure><blockquote>„Sehr zufrieden, gutes Angebot an Autos und prima Werkstatt.“</blockquote><figcaption>Google-Bewertung</figcaption></figure>
   <figure><blockquote>„Gute Kundenbetreuung und freundliches Personal. Der Kauf lief schnell und reibungslos ab.“</blockquote><figcaption>Alina · mobile.de, 30.03.2025 · Fahrzeug gekauft</figcaption></figure>
   <figure><blockquote>„Ich kann sie ohne Bedenken weiterempfehlen. Danke für meinen Traumwagen und den großartigen Service!“</blockquote><figcaption>Google-Bewertung (Auszug)</figcaption></figure>
   <figure><blockquote>„Der Händler war ehrlich und hilfsbereit! […] Alles war super, danke an diesen Händler.“</blockquote><figcaption>Dany · mobile.de, 24.10.2025 · Fahrzeug gekauft</figcaption></figure>
  </div>
  <p class="quotes-more"><a href="https://www.mobile.de/bewertungen/EUREGIOMOTORCARSGMBH" target="_blank" rel="noopener">Alle 293 Bewertungen auf mobile.de {arrow()}</a></p>
 </div>
</section>

<section class="fin" id="finanzierung" aria-labelledby="fin-h">
 <div class="wrap fin-grid">
  <div class="fin-photo" data-fin-photo></div>
  <div class="fin-text">
   <p class="kicker">Finanzierung</p>
   <h2 id="fin-h" class="fin-sentence" data-fin-sentence>Finanzierung für jedes Auto im Bestand.</h2>
   <div class="fin-switch" data-fin-switch></div>
   <p class="fin-legal muted small" data-fin-legal></p>
   <div class="btns"><a class="btn mag" href="finanzierung.html#werkzeug">Eigene Rate ausrechnen {arrow()}</a><a class="btn ghost mag" href="kontakt.html?thema=finanzierung">Finanzierung anfragen</a></div>
  </div>
 </div>
</section>

<section class="book" id="probefahrt" aria-labelledby="book-h">
 <div class="wrap book-grid">
  <div class="book-l">
   <p class="kicker">Probefahrt</p>
   <h2 id="book-h" class="split">Auto wählen, Tag wählen, fertig.</h2>
   <p class="lead">Wir bestätigen Ihren Termin telefonisch oder per WhatsApp. Bitte Führerschein und Ausweis mitbringen.</p>
   <dl class="facts">
    <div><dt>Adresse</dt><dd>{STR}<br>{PLZ} {ORT}</dd></div>
    <div><dt>Öffnungszeiten</dt><dd>Mo–Fr 9:00–19:00 Uhr<br>Sa 9:00–14:00 Uhr</dd></div>
    <div><dt>Telefon</dt><dd><a href="tel:{TEL_L}">{TEL}</a><br><a href="tel:{MOBIL_L}">{MOBIL}</a> (auch WhatsApp)</dd></div>
    <div><dt>Wir sprechen</dt><dd>Deutsch, English</dd></div>
   </dl>
   {mapbox()}
  </div>
  <div class="book-r">{form('probefahrt', 'anfrage', True, 'Probefahrt anfragen')}</div>
 </div>
</section>'''
    page({'file': 'index.html', 'title': 'Euregio Motorcars Stolberg – Gebrauchtwagen & Service', 'desc': 'Gebrauchtwagen von BMW, Land Rover, Mercedes-Benz & mehr in Stolberg. Aktueller Bestand live, Probefahrt, Finanzierung, Werkstatt, HU vor Ort.',
          'over': True, 'body': 'home', 'bestand': True, 'js': ['home.js'],
          'preload': '<link rel="preload" as="image" href="img/szene-hof-1600.webp" imagesrcset="img/szene-hof-800.webp 800w, img/szene-hof-1600.webp 1600w" imagesizes="100vw" fetchpriority="high">'}, body)

def gauge_svg(k, label, val, sub, v):
    ticks = []
    for i in range(11):
        a = -120 + i * 24  # 0–5 in Halbschritten über 240°
        big = i % 2 == 0
        ticks.append(f'<line class="{"tk-b" if big else "tk"}" x1="0" y1="-86" x2="0" y2="{-72 if big else -78}" transform="rotate({a})"/>')
        if big:
            import math
            rad = math.radians(a - 90)
            ticks.append(f'<text x="{62 * math.cos(rad):.1f}" y="{62 * math.sin(rad) + 5:.1f}" text-anchor="middle">{i // 2}</text>')
    return f'''<figure class="inst inst-{k}" data-val="{v}">
    <svg viewBox="-100 -100 200 170" aria-hidden="true"><g>{''.join(ticks)}</g>
     <path class="arc-bg" d="{arc(-120, 120, 92)}"/><path class="arc-fg" d="{arc(-120, 120, 92)}" pathLength="1"/>
     <g class="needle"><path d="M-3 0 L0 -80 L3 0 Z"/></g><circle r="7" class="hub"/></svg>
    <figcaption><b>{val}</b><span>{label}</span><small>{sub}</small></figcaption>
   </figure>'''

def arc(a1, a2, r):
    import math
    p = lambda a: (r * math.cos(math.radians(a - 90)), r * math.sin(math.radians(a - 90)))
    x1, y1 = p(a1); x2, y2 = p(a2)
    return f'M{x1:.1f} {y1:.1f} A{r} {r} 0 1 1 {x2:.1f} {y2:.1f}'

# ---------------------------------------------------------------- Fahrzeuge
def fahrzeuge():
    body = hofkopf('Fahrzeuge', 'Der komplette Bestand – aktualisiert aus unseren mobile.de-Inseraten. Filtern, vergleichen, Probefahrt anfragen.', 'szene-hof', 'Der Hof von Euregio Motorcars mit Halle und Silos', 'Bestand') + f'''
<section class="stock" id="werkzeug" aria-label="Fahrzeugbestand">
 <div class="wrap">
  <form class="filters" data-filters role="search" aria-label="Bestand filtern" onsubmit="return false">
   <div class="f-makes" data-f-makes role="group" aria-label="Marke"></div>
   <div class="f-row">
    <label>Preis<select name="preis"><option value="">Alle Preise</option><option value="0-15000">bis 15.000 €</option><option value="15000-25000">15.000–25.000 €</option><option value="25000-35000">25.000–35.000 €</option><option value="35000-999999">ab 35.000 €</option></select></label>
    <label>Kraftstoff<select name="kraftstoff" data-f-opt="kraftstoff"><option value="">Alle</option></select></label>
    <label>Getriebe<select name="getriebe" data-f-opt="getriebe"><option value="">Alle</option></select></label>
    <label>Aufbau<select name="kategorie" data-f-opt="kategorie"><option value="">Alle</option></select></label>
    <label>Sortierung<select name="sort"><option value="neu">Neueste zuerst</option><option value="preis-auf">Preis aufsteigend</option><option value="preis-ab">Preis absteigend</option><option value="km-auf">Kilometer aufsteigend</option><option value="ez-ab">Erstzulassung jüngste</option></select></label>
    <label class="f-q">Suche<input type="search" name="q" placeholder="z. B. X3, Panorama, 7-Sitzer"></label>
   </div>
  </form>
  <p class="stock-meta" aria-live="polite"><span data-result-count>Bestand wird geladen …</span> <span class="muted" data-stand-short></span> <button type="button" class="linkbtn" data-reset hidden>Filter zurücksetzen</button></p>
  <div class="grid-cars" data-cars></div>
  <noscript><p>Der Bestand wird per JavaScript angezeigt. Alle Fahrzeuge finden Sie auch auf unserer <a href="{MOBILE_DE}">Händlerseite bei mobile.de</a>.</p></noscript>
  <p class="stock-note muted small">Alle Angaben laut Inserat bei mobile.de. Zwischenverkauf und Irrtümer vorbehalten; verbindlich sind allein Kaufvertrag bzw. Auftragsbestätigung. Reservierte Fahrzeuge bleiben sichtbar, bis sie vollständig bezahlt sind. <a href="{MOBILE_DE}" target="_blank" rel="noopener">Bestand auch auf mobile.de</a></p>
 </div>
</section>''' + cta('Nicht das Richtige dabei?', 'Sagen Sie uns, was Sie suchen – der Bestand wechselt jede Woche, und manches Auto ist schon unterwegs, bevor es online steht.', 'fahrzeug')
    page({'file': 'fahrzeuge.html', 'title': 'Gebrauchtwagen Stolberg – aktueller Bestand | Euregio Motorcars', 'desc': 'Alle Gebrauchtwagen von Euregio Motorcars in Stolberg: BMW, Land Rover, Mercedes-Benz, Porsche & mehr. Täglich aktueller Bestand mit Preisen und Fotos.',
          'bestand': True}, body)

def fahrzeug():
    body = f'''<section class="car" data-car>
 <div class="wrap car-top"><a class="back" href="fahrzeuge.html">← Zurück zum Bestand</a></div>
 <div class="wrap car-grid">
  <div class="gal" data-gal>
   <div class="gal-main" tabindex="0" aria-label="Fotogalerie, mit Pfeiltasten blättern"><div class="gal-empty muted">Fahrzeug wird geladen …</div></div>
   <div class="gal-nav"><button type="button" class="gal-prev" aria-label="Vorheriges Foto">‹</button><span data-gal-count></span><button type="button" class="gal-next" aria-label="Nächstes Foto">›</button></div>
   <div class="gal-thumbs" data-gal-thumbs></div>
  </div>
  <aside class="car-side">
   <div class="car-tag">
    <p class="tag-k" data-c="kategorie"></p>
    <h1 data-c="titel">Fahrzeug</h1>
    <p class="tag-price" data-c="preis"></p>
    <p class="tag-rate" data-c="rate"></p>
    <dl class="tag-dl" data-c="daten"></dl>
    <div class="car-actions">
     <a class="btn mag" data-c="probefahrt" href="probefahrt.html">Probefahrt anfragen {arrow()}</a>
     <a class="btn ghost mag" href="tel:{TEL_L}">{ICON['phone']} {TEL}</a>
     <a class="btn ghost mag" data-c="wa" href="{WA}" target="_blank" rel="noopener">{ICON['wa']} WhatsApp</a>
     <a class="linkbtn" data-c="mobile" href="{MOBILE_DE}" target="_blank" rel="noopener">Inserat auf mobile.de {arrow()}</a>
    </div>
   </div>
  </aside>
 </div>
 <div class="wrap car-more">
  <div class="car-hl" data-c="highlights"></div>
  <div class="car-feat"><h2>Ausstattung</h2><ul class="feat" data-c="merkmale"><li class="muted">Wird geladen …</li></ul></div>
  <div class="car-fin" data-c="fin"></div>
  <details class="car-desc" data-c="beschreibung-wrap"><summary>Beschreibung des Händlers</summary><div data-c="beschreibung"></div></details>
  <p class="stock-note muted small">Alle Angaben laut Inserat. Zwischenverkauf und Irrtümer vorbehalten; die Fahrzeugbeschreibung dient der allgemeinen Identifizierung und stellt keine Gewährleistung im kaufrechtlichen Sinne dar. Verbindlich sind allein Kaufvertrag bzw. Auftragsbestätigung.</p>
 </div>
 <div class="wrap car-sim"><h2>Ähnliche Fahrzeuge</h2><div class="grid-cars small" data-similar></div></div>
</section>'''
    page({'file': 'fahrzeug.html', 'title': 'Fahrzeug im Detail | Euregio Motorcars Stolberg', 'desc': 'Fotos, Daten, Ausstattung und Finanzierungsbeispiel zu einem Gebrauchtwagen von Euregio Motorcars in Stolberg.',
          'bestand': True, 'group': 'fahrzeuge.html', 'full': True}, body)

# ---------------------------------------------------------------- Finanzierung
def finanzierung():
    body = hofkopf('Finanzierung & Leasing', 'Das Auto aus dem Bestand, die Rate für Ihren Monat. Wir vermitteln die Finanzierung direkt beim Kauf – ein Termin, ein Vertrag.', 'cockpit-840', 'Cockpit eines BMW 840d mit Bildschirm und Lenkrad', 'Finanzierung') + f'''
<section class="calc" id="werkzeug" aria-labelledby="calc-h">
 <div class="wrap calc-grid">
  <div>
   <h2 id="calc-h">Raten-Rechner</h2>
   <p class="lead">Wählen Sie ein Auto aus dem Bestand oder geben Sie einen Kaufpreis ein. Der Rechner zeigt eine Beispielrate – ohne Schufa-Abfrage, ohne Anmeldung.</p>
   <div class="calc-form" data-calc>
    <label>Fahrzeug aus dem Bestand<select data-calc-car><option value="">– Kaufpreis selbst eingeben –</option></select></label>
    <label>Kaufpreis in €<input type="text" inputmode="numeric" data-calc-price value="25.000"></label>
    <fieldset><legend>Anzahlung</legend><div class="seg" data-calc-down><button type="button" data-v="0">0 %</button><button type="button" data-v="10">10 %</button><button type="button" data-v="20" aria-pressed="true">20 %</button><button type="button" data-v="30">30 %</button></div></fieldset>
    <fieldset><legend>Laufzeit</legend><div class="seg" data-calc-term><button type="button" data-v="24">24 Mon.</button><button type="button" data-v="36">36 Mon.</button><button type="button" data-v="48">48 Mon.</button><button type="button" data-v="60" aria-pressed="true">60 Mon.</button></div></fieldset>
    <fieldset><legend>Art</legend><div class="seg" data-calc-type><button type="button" data-v="klassisch">Klassisch (ohne Schlussrate)</button><button type="button" data-v="ballon" aria-pressed="true">Mit Schlussrate</button></div></fieldset>
   </div>
  </div>
  <div class="calc-out" aria-live="polite">
   <p class="co-k">Beispielrate</p>
   <p class="co-rate"><span data-out-rate>–</span><small> € / Monat</small></p>
   <dl data-out-dl></dl>
   <p class="muted small" data-out-note></p>
   <a class="btn mag" href="kontakt.html?thema=finanzierung" data-out-link>Diese Finanzierung anfragen {arrow()}</a>
  </div>
 </div>
</section>
<section class="text-sec">
 <div class="wrap cols2">
  <div><h2>Finanzierung beim Kauf</h2><p>Zu den meisten Autos im Bestand steht auf mobile.de ein repräsentatives Finanzierungsbeispiel – aktuell über die Consors Finanz (BNP Paribas). Auf Wunsch rechnen wir mit Ihnen Anzahlung, Laufzeit und Schlussrate durch, bevor Sie sich entscheiden. Die Kreditentscheidung trifft die Bank nach Bonitätsprüfung.</p>
   <p><a href="ratgeber-schlussrate.html">Ratgeber: Was die Schlussrate bedeutet {arrow()}</a></p></div>
  <div><h2>Leasing</h2><p>Leasing bieten wir ebenfalls an. Welche Autos aus dem Bestand sich dafür eignen und zu welchen Konditionen, hängt vom Fahrzeug und von der Leasinggesellschaft ab – fragen Sie uns einfach mit dem Wunschauto an.</p>
   <p><a href="kontakt.html?thema=finanzierung">Leasing anfragen {arrow()}</a></p></div>
 </div>
</section>''' + cta('Ihre Rate, verbindlich gerechnet.', 'Schicken Sie uns Wunschauto, Anzahlung und Laufzeit – wir holen das Angebot der Bank ein und melden uns.', 'finanzierung')
    page({'file': 'finanzierung.html', 'title': 'Autofinanzierung & Leasing in Stolberg | Euregio Motorcars', 'desc': 'Gebrauchtwagen finanzieren oder leasen: Raten-Rechner mit echten Autos aus dem Bestand, Schlussrate, Anzahlung, Laufzeit. Euregio Motorcars Stolberg.',
          'bestand': True, 'js': ['tools.js']}, body)

def probefahrt():
    body = hofkopf('Probefahrt', 'Wählen Sie Ihr Auto und einen Wunschtag. Wir bestätigen den Termin – telefonisch oder per WhatsApp.', 'svr-hof', 'Range Rover Sport SVR auf dem Hof vor der Halle', 'Termin') + f'''
<section class="book" id="werkzeug">
 <div class="wrap book-grid">
  <div class="book-l">
   <h2>Gut zu wissen</h2>
   <ul class="ticks">
    <li>Bitte bringen Sie Ihren <b>Führerschein</b> und einen <b>Personalausweis</b> mit.</li>
    <li>Probefahrten während der Öffnungszeiten: Mo–Fr 9–19 Uhr, Sa 9–14 Uhr.</li>
    <li>Ein Auto ist schon reserviert? Wir sagen es Ihnen sofort – und melden uns, falls es doch wieder frei wird.</li>
    <li>Sie kommen von weiter weg? Schreiben Sie uns vorher per WhatsApp, wir schicken gern weitere Fotos oder ein Video.</li>
   </ul>
   <dl class="facts"><div><dt>Adresse</dt><dd>{STR}<br>{PLZ} {ORT}</dd></div><div><dt>Telefon</dt><dd><a href="tel:{TEL_L}">{TEL}</a></dd></div></dl>
   {mapbox()}
  </div>
  <div class="book-r">{form('probefahrt', 'anfrage', True, 'Probefahrt anfragen')}</div>
 </div>
</section>'''
    page({'file': 'probefahrt.html', 'title': 'Probefahrt vereinbaren | Euregio Motorcars Stolberg', 'desc': 'Probefahrt in Stolberg anfragen: Auto aus dem aktuellen Bestand wählen, Wunschtag angeben, Bestätigung per Telefon oder WhatsApp.',
          'bestand': True, 'group': 'fahrzeuge.html'}, body)

# ---------------------------------------------------------------- Service
def service_page(file, title, desc_meta, lead, photo, alt, kicker, leistungen, tool_html, extra_html, thema, js=None):
    li = ''.join(f'<li><h3>{e(t)}</h3><p>{d}</p></li>' for t, d in leistungen)
    body = hofkopf(title, lead, photo, alt, kicker) + f'''
<section class="svc">
 <div class="wrap svc-grid">
  <div class="svc-l"><h2>Leistungen</h2><p class="muted">Laut unserem Profil bei mobile.de.</p></div>
  <ul class="svc-list">{li}</ul>
 </div>
</section>
<section class="tool" id="werkzeug">
 <div class="wrap">{tool_html}</div>
</section>
{extra_html}''' + cta('Termin für ' + title.split(' ')[0].replace(',', '') + ' anfragen', 'Schreiben Sie kurz, um welches Auto es geht und was zu tun ist – wir melden uns mit einem Termin.', thema)
    page({'file': file, 'title': title + ' in Stolberg | Euregio Motorcars', 'desc': desc_meta, 'group': 'service', 'js': js or ['tools.js']}, body)

def service_all():
    rows = ''.join(f'''<li><a href="{h}"><span class="sa-t">{e(t)}</span><span class="sa-d">{e(d)}</span>{arrow()}</a></li>''' for h, t, d in SERVICE)
    body = hofkopf('Service', 'Neben dem Verkauf kümmern wir uns um alles, was ein Auto im Laufe der Jahre braucht – an einer Adresse in Stolberg.', 'werkstatt-840', 'BMW 840d vor dem Gebäude mit der Aufschrift Kfz-Werkstatt', 'Service rund ums Auto') + f'''
<section class="svc-all">
 <div class="wrap">
  <ul class="sa-list">
   <li><a href="fahrzeuge.html"><span class="sa-t">Gebrauchtwagen</span><span class="sa-d">Der aktuelle Bestand, live aus unseren Inseraten</span>{arrow()}</a></li>
   <li><a href="probefahrt.html"><span class="sa-t">Probefahrt</span><span class="sa-d">Auto und Wunschtag wählen</span>{arrow()}</a></li>
   <li><a href="finanzierung.html"><span class="sa-t">Finanzierung & Leasing</span><span class="sa-d">Beispielrate mit echten Autos ausrechnen</span>{arrow()}</a></li>
   {rows}
  </ul>
  <p class="muted small">Leistungen laut Händlerprofil bei mobile.de: HU vor Ort durch amtlichen Anbieter, Reparaturservice, Karosserie-Werkstatt, Lackiererei, Autoglas, Kfz-Aufbereitung, Reifenwechsel, Scheibentönung, Ersatzteile & Zubehör, Klima-Check, Gebrauchtwagen, Winter-Check, Zulassungsservice, Inspektion, Finanzierung, Leasing, Reifenlager, Probefahrt.</p>
 </div>
</section>''' + cta()
    page({'file': 'service.html', 'title': 'Service: Werkstatt, Reifen, HU & mehr | Euregio Motorcars', 'desc': 'Werkstatt, Inspektion, Karosserie & Lack, Reifenlager, HU vor Ort, Zulassung und Aufbereitung bei Euregio Motorcars in Stolberg.', 'group': 'service'}, body)

MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

def werkstatt():
    months = ''.join(f'<button type="button" data-m="{i}">{m[:3]}</button>' for i, m in enumerate(MONATE))
    tool = f'''<div class="tool-head"><p class="kicker">Werkzeug</p><h2>Saison-Kalender</h2><p class="lead">Welcher Monat ist es bei Ihnen? Der Kalender zeigt, was ums Auto herum jetzt ansteht.</p></div>
 <div class="season" data-season>
  <div class="season-m" role="group" aria-label="Monat wählen">{months}</div>
  <div class="season-out" aria-live="polite"></div>
 </div>
 <p class="muted small">Faustregeln, keine Herstellervorgabe. Maßgeblich sind Serviceheft bzw. Service-Anzeige Ihres Autos.</p>'''
    service_page('werkstatt.html', 'Werkstatt & Inspektion', 'Reparaturservice, Inspektion, Klima-Check, Winter-Check und Ersatzteile in Stolberg. Mit Saison-Kalender: Was ist wann fällig?',
                 'Inspektion nach Herstellervorgabe, Reparaturen, Klima- und Winter-Check – für Autos aus unserem Bestand und für Ihres.', 'werkstatt-840', 'Gebäude mit der Aufschrift Kfz-Werkstatt, davor ein BMW 840d', 'Service',
                 [('Reparaturservice', 'Mechanik und Elektrik, von der Fehlersuche bis zur Reparatur. Sagen Sie uns, was Ihnen aufgefallen ist.'),
                  ('Inspektion', 'Wartung nach Serviceplan des Herstellers – mit Eintrag, damit die Historie lückenlos bleibt.'),
                  ('Klima-Check', 'Kältemittel, Dichtheit, Filter: damit die Anlage im Sommer kühlt und im Winter die Scheiben frei hält.'),
                  ('Winter-Check', 'Batterie, Frostschutz, Licht, Wischer, Reifen – bevor die kalten Tage kommen.'),
                  ('Ersatzteile & Zubehör', 'Teile und Zubehör für Ihr Auto, auf Wunsch gleich mit Einbau.')],
                 tool, '', 'werkstatt')

def karosserie():
    tool = f'''<div class="tool-head"><p class="kicker">Werkzeug</p><h2>Schadenskizze</h2><p class="lead">Tippen Sie an, wo es passiert ist, und wählen Sie die Art des Schadens. Die Skizze geht mit Ihrer Anfrage an uns.</p></div>
 <div class="sketch" data-sketch>
  <div class="sk-car">{car_top_svg()}</div>
  <div class="sk-side">
   <fieldset><legend>Art des Schadens</legend><div class="seg wrap-seg" data-sk-type>
    <button type="button" data-v="Kratzer" aria-pressed="true">Kratzer</button><button type="button" data-v="Delle">Delle / Beule</button><button type="button" data-v="Lackschaden">Lackschaden</button><button type="button" data-v="Steinschlag">Steinschlag</button><button type="button" data-v="Riss / Bruch">Riss / Bruch</button><button type="button" data-v="Tönung gewünscht">Tönung gewünscht</button></div></fieldset>
   <ul class="sk-list" aria-live="polite"><li class="muted">Noch nichts markiert.</li></ul>
   <a class="btn mag" data-sk-send href="kontakt.html?thema=karosserie">Mit dieser Skizze anfragen {arrow()}</a>
  </div>
 </div>'''
    service_page('karosserie-lack.html', 'Karosserie, Lack & Glas', 'Karosserie-Werkstatt, Lackiererei, Autoglas und Scheibentönung in Stolberg. Schaden per Skizze markieren und Termin anfragen.',
                 'Delle, Kratzer, Steinschlag oder einfach getönte Scheiben: Beschreiben Sie den Schaden mit der Skizze – wir melden uns mit einer Einschätzung.', 'defender', 'Land Rover Defender in Grau vor der Halle, Frontansicht', 'Service',
                 [('Karosserie-Werkstatt', 'Dellen, Beulen und Unfallschäden an der Karosserie.'),
                  ('Lackiererei', 'Vom Kratzer bis zum ganzen Bauteil – farbgenau zum Originallack.'),
                  ('Autoglas', 'Steinschlag reparieren oder Scheibe tauschen.'),
                  ('Scheibentönung', 'Getönte Scheiben hinten – nach den Vorgaben der Straßenverkehrs-Zulassungs-Ordnung.')],
                 tool, '', 'karosserie')

def car_top_svg():
    # Auto von oben, Bauteile anklickbar
    parts = [
     ('Frontstoßfänger', 'M70 20 h120 a20 20 0 0 1 20 20 v6 h-160 v-6 a20 20 0 0 1 20 -20z'),
     ('Motorhaube', 'M52 50 h156 v88 h-156z'),
     ('Windschutzscheibe', 'M58 142 h144 l-10 40 h-124z'),
     ('Dach', 'M70 186 h120 v120 h-120z'),
     ('Heckscheibe', 'M68 310 h124 l8 34 h-140z'),
     ('Heckklappe', 'M54 348 h152 v58 h-152z'),
     ('Heckstoßfänger', 'M50 410 h160 v6 a20 20 0 0 1 -20 20 h-120 a20 20 0 0 1 -20 -20z'),
     ('Kotflügel vorn links', 'M20 60 h28 v86 h-28 a8 8 0 0 1 -8 -8 v-70 a8 8 0 0 1 8 -8z'),
     ('Kotflügel vorn rechts', 'M212 60 h28 a8 8 0 0 1 8 8 v70 a8 8 0 0 1 -8 8 h-28z'),
     ('Tür vorn links', 'M20 150 h28 v96 h-36 v-88 a8 8 0 0 1 8 -8z'),
     ('Tür vorn rechts', 'M212 150 h28 a8 8 0 0 1 8 8 v88 h-36z'),
     ('Tür hinten links', 'M12 250 h36 v90 h-28 a8 8 0 0 1 -8 -8z'),
     ('Tür hinten rechts', 'M212 250 h36 v82 a8 8 0 0 1 -8 8 h-28z'),
     ('Seitenwand hinten links', 'M20 344 h28 v62 h-28 a8 8 0 0 1 -8 -8 v-46 a8 8 0 0 1 8 -8z'),
     ('Seitenwand hinten rechts', 'M212 344 h28 a8 8 0 0 1 8 8 v46 a8 8 0 0 1 -8 8 h-28z'),
    ]
    ps = ''.join(f'<path class="pt" d="{d}" data-part="{e(n)}" tabindex="0" role="button" aria-pressed="false" aria-label="{e(n)}"><title>{e(n)}</title></path>' for n, d in parts)
    return f'''<svg viewBox="0 0 260 450" class="cartop" role="group" aria-label="Fahrzeug von oben, Bauteile anklickbar">
 <text x="130" y="12" text-anchor="middle" class="lab">vorn</text>{ps}
 <rect x="2" y="112" width="12" height="30" rx="3" class="mir"/><rect x="246" y="112" width="12" height="30" rx="3" class="mir"/>
 <text x="130" y="448" text-anchor="middle" class="lab">hinten</text></svg>'''

def reifen():
    tool = f'''<div class="tool-head"><p class="kicker">Werkzeug</p><h2>Reifencode-Leser</h2><p class="lead">Die Größe steht auf der Reifenflanke, im Fahrzeugschein (Feld 15) oder im Tankdeckel. Tippen Sie sie ab – der Leser übersetzt jede Stelle.</p></div>
 <div class="tire" data-tire>
  <label class="tire-in">Reifengröße<input type="text" value="225/45 R17 94W" autocomplete="off" spellcheck="false" data-tire-input></label>
  <div class="tire-ex" role="group" aria-label="Beispiele"><button type="button">205/55 R16 91V</button><button type="button">245/40 R19 98Y</button><button type="button">255/55 R19 111H</button><button type="button">195/65 R15 91T</button></div>
  <div class="tire-code" aria-hidden="true" data-tire-code></div>
  <dl class="tire-out" aria-live="polite" data-tire-out></dl>
 </div>'''
    extra = '''<section class="text-sec"><div class="wrap cols2">
 <div><h2>Wann wechseln?</h2><p>Als Faustregel gilt „von O bis O“: Winterreifen von Oktober bis Ostern. Gesetzlich gilt in Deutschland die situative Winterreifenpflicht – bei Glatteis, Schneeglätte, Schneematsch, Eis- oder Reifglätte nur mit Reifen, die das Alpine-Symbol (Bergpiktogramm mit Schneeflocke) tragen.</p></div>
 <div><h2>Reifenlager</h2><p>Die Räder, die gerade nicht drauf sind, lagern bei uns – sauber, trocken und mit Ihrem Namen. Beim nächsten Wechsel sind sie schon da. Fragen Sie beim Termin einfach nach einem Lagerplatz.</p></div>
</div></section>'''
    service_page('reifen.html', 'Reifen & Einlagerung', 'Reifenwechsel und Reifenlager in Stolberg. Mit Reifencode-Leser: Was bedeutet 225/45 R17 94W? Euregio Motorcars.',
                 'Sommer auf Winter, Winter auf Sommer – und dazwischen lagern Ihre Räder bei uns.', 'x6', 'BMW X6 M Competition in Dunkelgrau mit großen Felgen vor der Halle', 'Service',
                 [('Reifenwechsel', 'Räder wechseln, Luftdruck prüfen, auf Wunsch auswuchten.'), ('Reifenlager', 'Einlagerung Ihrer Sommer- oder Winterräder bis zum nächsten Wechsel.')],
                 tool, extra, 'reifen')

def hu():
    tool = f'''<div class="tool-head"><p class="kicker">Werkzeug</p><h2>Plaketten-Prüfer</h2><p class="lead">Schauen Sie aufs hintere Kennzeichen: Welche Farbe hat die Plakette, und welche Zahl steht oben? Klicken Sie beides an.</p></div>
 <div class="plak" data-plak>
  <div class="plak-svg">{plakette_svg()}</div>
  <div class="plak-side">
   <fieldset><legend>Farbe der Plakette</legend><div class="swatches" data-plak-year></div></fieldset>
   <p class="muted small">Die Monatszahl oben auf der Plakette wählen Sie direkt in der Grafik.</p>
   <div class="plak-out" aria-live="polite" data-plak-out></div>
  </div>
 </div>'''
    extra = '''<section class="text-sec"><div class="wrap cols2">
 <div><h2>HU vor Ort</h2><p>Die Hauptuntersuchung nimmt ein amtlich anerkannter Prüfer direkt bei uns ab – Sie müssen nicht zur Prüfstelle fahren. Den Termin stimmen wir mit Ihnen ab; kleine Mängel können wir vorher beheben.</p></div>
 <div><h2>Zulassungsservice</h2><p>An-, Um- und Abmeldung übernehmen wir auf Wunsch – beim Autokauf bei uns sowieso. Welche Unterlagen nötig sind (z. B. Zulassungsbescheinigung Teil I und II, eVB-Nummer der Versicherung, Ausweis, SEPA-Mandat für die Kfz-Steuer), sagen wir Ihnen vorab.</p></div>
</div></section>'''
    service_page('hu-zulassung.html', 'HU & Zulassung', 'HU vor Ort durch amtlich anerkannten Prüfer und Zulassungsservice in Stolberg. Plaketten-Prüfer: Wann ist Ihre HU fällig?',
                 'Hauptuntersuchung direkt auf unserem Hof und die Zulassung gleich dazu – ohne Umweg über die Prüfstelle.', 'szene-werkstatt', 'Land Rover Defender vor dem Gebäude mit der Aufschrift Kfz-Werkstatt', 'Service',
                 [('HU vor Ort', 'Hauptuntersuchung durch einen amtlich anerkannten Anbieter direkt bei uns.'), ('Zulassungsservice', 'An-, Um- und Abmeldung – wir erledigen den Behördengang.')],
                 tool, extra, 'hu')

def plakette_svg():
    import math
    segs = []
    for m in range(1, 13):
        a0 = (m - 1) * 30 - 15 - 90
        a1 = a0 + 30
        r1, r2 = 64, 96
        pt = lambda r, a: (r * math.cos(math.radians(a)), r * math.sin(math.radians(a)))
        x1, y1 = pt(r2, a0); x2, y2 = pt(r2, a1); x3, y3 = pt(r1, a1); x4, y4 = pt(r1, a0)
        tx, ty = pt(80, (a0 + a1) / 2)
        segs.append(f'<g class="pm" data-m="{m}" tabindex="0" role="button" aria-pressed="false" aria-label="Monat {m}"><path d="M{x1:.1f} {y1:.1f} A{r2} {r2} 0 0 1 {x2:.1f} {y2:.1f} L{x3:.1f} {y3:.1f} A{r1} {r1} 0 0 0 {x4:.1f} {y4:.1f}Z"/><text x="{tx:.1f}" y="{ty + 5:.1f}" text-anchor="middle">{m}</text></g>')
    return f'''<svg viewBox="-110 -110 220 220" class="plak-g" role="group" aria-label="HU-Plakette: Monat anklicken">
 <circle r="104" class="pl-rim"/><g class="pl-rot">{''.join(segs)}</g>
 <circle r="60" class="pl-core"/><text y="-12" text-anchor="middle" class="pl-year" data-plak-yeartxt>26</text><text y="22" text-anchor="middle" class="pl-small">HU</text></svg>'''

def aufbereitung():
    tool = f'''<div class="tool-head"><p class="kicker">Werkzeug</p><h2>Pflege-Intervall</h2><p class="lead">Drei Fragen zu Ihrem Alltag – daraus ergibt sich, wie oft sich eine Innenreinigung, eine Politur oder eine Versiegelung lohnt.</p></div>
 <div class="care" data-care>
  <fieldset><legend>Wo steht das Auto meistens?</legend><div class="seg" data-care-q="park"><button type="button" data-v="garage" aria-pressed="true">Garage / Carport</button><button type="button" data-v="draussen">Draußen / Laterne</button></div></fieldset>
  <fieldset><legend>Wer fährt mit?</legend><div class="seg" data-care-q="mit"><button type="button" data-v="erw" aria-pressed="true">Erwachsene</button><button type="button" data-v="kinder">Kinder</button><button type="button" data-v="tiere">Hund / Tiere</button></div></fieldset>
  <fieldset><legend>Kilometer im Jahr</legend><div class="seg" data-care-q="km"><button type="button" data-v="wenig">bis 10.000</button><button type="button" data-v="mittel" aria-pressed="true">10–20.000</button><button type="button" data-v="viel">über 20.000</button></div></fieldset>
  <div class="care-out" aria-live="polite" data-care-out></div>
  <p class="muted small">Richtwerte zur Orientierung, keine feste Regel. Wir schauen uns Ihr Auto gern an und sagen ehrlich, was es braucht.</p>
 </div>'''
    extra = '''<section class="text-sec"><div class="wrap cols2">
 <div><h2>Innen</h2><p>Sitze, Teppiche und Kofferraum gründlich gesaugt und gereinigt, Kunststoffe und Scheiben von innen gepflegt. Genau so bereiten wir auch die Autos in unserem Bestand vor, bevor sie fotografiert werden.</p></div>
 <div><h2>Außen</h2><p>Wäsche, Politur gegen feine Kratzer und Waschstraßen-Schleier, auf Wunsch eine Versiegelung, die den Lack länger schützt. Ideal vor dem Verkauf oder vor der Rückgabe eines Leasingfahrzeugs.</p></div>
</div></section>'''
    service_page('aufbereitung.html', 'Aufbereitung', 'Kfz-Aufbereitung in Stolberg: Innenreinigung, Politur, Versiegelung. Mit Pflege-Intervall – wie oft lohnt sich was?',
                 'Innen wie neu, außen mit Glanz – für den Alltag, vor dem Verkauf oder vor der Leasing-Rückgabe.', 'cabrio', 'Silbernes Mercedes-Benz C 300 Cabrio mit rotem Verdeck vor der Halle', 'Service',
                 [('Kfz-Aufbereitung', 'Innen- und Außenaufbereitung – vom gründlichen Innenraum bis zu Politur und Versiegelung.')],
                 tool, extra, 'aufbereitung')

# ---------------------------------------------------------------- Über uns, Ratgeber, FAQ, Kontakt, Recht
def ueber():
    body = hofkopf('Über uns', 'Ein Hof an der Eschweilerstraße, eine anthrazitfarbene Halle, zwei gelbe Silos dahinter – und ein Team, das Autos so beschreibt, wie sie sind.', 'cayenne-hof', 'Porsche Cayenne vor der Halle von Euregio Motorcars, dahinter die Silos', 'Euregio Motorcars') + f'''
<section class="about">
 <div class="wrap about-grid">
  <div class="about-t">
   <h2 class="split">Gebrauchtwagen aus Stolberg – für die ganze Euregio.</h2>
   <p>Die Euregio-Motorcars GmbH verkauft seit 2011 Gebrauchtwagen über mobile.de – vom kompakten Alltagsauto bis zum Range Rover SVR. Der Name ist Programm: Unsere Kunden kommen aus Stolberg, Aachen und Eschweiler, aber auch aus Belgien, den Niederlanden und von weiter her. Deshalb beraten wir auf Deutsch und Englisch.</p>
   <p>Jedes Auto wird vor unserer Halle fotografiert, innen wie außen, und so beschrieben, wie es ist. Das bestätigen unsere Käufer: Auf mobile.de haben 100 % angegeben, dass das Fahrzeug wie beschrieben war, 94 % empfehlen uns weiter.</p>
   <h3>Wie wir arbeiten</h3>
   <ul class="ticks">
    <li><b>Reservieren mit Anzahlung.</b> Wer sich entschieden hat, kann das Auto mit einer Anzahlung reservieren. Das Inserat bleibt online, bis das Auto vollständig bezahlt ist – falls ein Kauf platzt, melden wir uns bei den nächsten Interessenten.</li>
    <li><b>Offen über Herkunft.</b> Ob Erstbesitz, Scheckheft oder Importfahrzeug: Das sagen wir im Gespräch, bevor Sie fahren.</li>
    <li><b>Schnelle Antworten.</b> Telefon, E-Mail oder WhatsApp – auf mobile.de heben unsere Kunden die kurzen Antwortzeiten hervor.</li>
    <li><b>Service nach dem Kauf.</b> Werkstatt, Reifen, HU und Zulassung an derselben Adresse.</li>
   </ul>
  </div>
  <aside class="about-f">
   <dl class="facts">
    <div><dt>Firma</dt><dd>{FIRMA}</dd></div>
    <div><dt>Geschäftsführer</dt><dd>Stanislaw Michaltschuk</dd></div>
    <div><dt>Im Verkauf</dt><dd>Hermann Kuhn</dd></div>
    <div><dt>Bei mobile.de seit</dt><dd>4. Januar 2011</dd></div>
    <div><dt>Wir sprechen</dt><dd>Deutsch, English</dd></div>
    <div><dt>Adresse</dt><dd>{STR}, {PLZ} {ORT}</dd></div>
   </dl>
   {img('szene-hof', 'Der Hof von Euregio Motorcars unter blauem Himmel', 'about-img', '(max-width: 900px) 100vw, 40vw')}
  </aside>
 </div>
</section>''' + cta()
    page({'file': 'ueber-uns.html', 'title': 'Über uns – Euregio-Motorcars GmbH, Stolberg', 'desc': 'Euregio-Motorcars GmbH: Gebrauchtwagenhändler an der Eschweilerstraße 167 in Stolberg, seit 2011 bei mobile.de, 4,8 Sterne aus über 500 Bewertungen.'}, body)

RATGEBER = [
 ('ratgeber-besichtigung.html', 'Gebrauchtwagen besichtigen: worauf es ankommt', 'Mit dieser Reihenfolge übersehen Sie bei der Besichtigung nichts – von den Papieren bis zur Probefahrt.', 'rr-cockpit', 'Cockpit eines Range Rover Sport mit Lenkrad und Mittelkonsole'),
 ('ratgeber-schlussrate.html', 'Finanzieren mit Schlussrate: so funktioniert es', 'Niedrige Monatsrate, hohe letzte Rate: was eine Ballonfinanzierung ist und wann sie passt – an einem echten Beispiel.', 'cockpit-840', 'Cockpit eines BMW 840d'),
 ('ratgeber-reservierung.html', 'Reserviert, aber noch online? Wie Reservierungen ablaufen', 'Warum ein Inserat manchmal noch zu sehen ist, obwohl das Auto reserviert ist – und wie Sie selbst reservieren.', 'szene-hof', 'Der Hof von Euregio Motorcars mit Halle und Silos'),
]

def ratgeber():
    items = ''.join(f'''<li><a href="{f}">{img(ph, alt, 'rg-img', '(max-width: 900px) 100vw, 33vw')}<span class="rg-t">{e(t)}</span><span class="rg-d">{e(d)}</span></a></li>''' for f, t, d, ph, alt in RATGEBER)
    body = hofkopf('Ratgeber', 'Kurz und ehrlich: was man beim Gebrauchtwagenkauf wissen sollte.', 'rr-cockpit', 'Cockpit eines Range Rover Sport', 'Wissen') + f'''
<section class="rg"><div class="wrap"><ul class="rg-list">{items}</ul></div></section>''' + cta()
    page({'file': 'ratgeber.html', 'title': 'Ratgeber Gebrauchtwagenkauf | Euregio Motorcars Stolberg', 'desc': 'Ratgeber zum Gebrauchtwagenkauf: Besichtigung, Finanzierung mit Schlussrate, Reservierung mit Anzahlung. Von Euregio Motorcars aus Stolberg.'}, body)

SHORT = ['Gebrauchtwagen besichtigen: worauf es ankommt', 'Finanzieren mit Schlussrate', 'Reserviert, aber noch online?']

def artikel(i, content, faq=None):
    f, t, d, ph, alt = RATGEBER[i]
    others = ''.join(f'<li><a href="{x[0]}">{e(x[1])} {arrow()}</a></li>' for j, x in enumerate(RATGEBER) if j != i)
    body = hofkopf(t, d, ph, alt, 'Ratgeber') + f'''
<article class="art"><div class="wrap art-grid"><div class="art-body">{content}</div>
<aside class="art-side"><h2>Weiterlesen</h2><ul>{others}</ul><a class="btn mag" href="fahrzeuge.html">Zum Bestand {arrow()}</a></aside></div></article>''' + cta()
    ld = [{"@context": "https://schema.org", "@type": "Article", "headline": t, "description": d, "datePublished": "2026-09-28", "author": {"@type": "Organization", "name": FIRMA}, "publisher": {"@id": BASE + "#firma"}, "image": BASE + f"img/{ph}-1600.webp", "mainEntityOfPage": BASE + f}]
    page({'file': f, 'title': SHORT[i] + ' | Euregio Motorcars', 'desc': d[:155], 'group': 'ratgeber.html', 'ld': ld, 'js': ['tools.js'] if i == 1 else []}, body)

def artikel_all():
    artikel(0, '''
<p class="lead">Eine Besichtigung dauert eine gute halbe Stunde. Wer in einer festen Reihenfolge vorgeht, vergisst nichts – und kann danach entspannt Probe fahren.</p>
<h2>Erst die Papiere</h2>
<p>Lassen Sie sich Zulassungsbescheinigung Teil I und II zeigen und vergleichen Sie die Fahrzeug-Identifizierungsnummer (FIN) mit der am Auto – meist unten an der Windschutzscheibe und im Motorraum. Dazu gehören das Serviceheft oder der digitale Wartungsnachweis und der letzte HU-Bericht. Die Zahl der Vorbesitzer steht in Teil II.</p>
<h2>Dann einmal ums Auto</h2>
<ul class="ticks"><li><b>Spaltmaße</b> zwischen Türen, Hauben und Kotflügeln: gleichmäßig?</li><li><b>Lack</b> im Streiflicht: Farbunterschiede zwischen Bauteilen deuten auf Nachlackierung.</li><li><b>Reifen</b>: Profiltiefe, gleichmäßige Abnutzung, Alter (DOT-Nummer, z. B. 3222 = 32. Woche 2022).</li><li><b>Scheiben</b>: Steinschläge im Sichtfeld des Fahrers.</li><li><b>Unterboden</b> und Schweller: Rost, Aufsetzspuren.</li></ul>
<h2>Innen</h2>
<p>Passt der Zustand von Lenkrad, Fahrersitz und Pedalen zum Kilometerstand? Alle Schalter einmal ausprobieren: Fensterheber, Sitzheizung, Klimaanlage, Navigation, Kamera. Warnleuchten müssen nach dem Start erlöschen.</p>
<h2>Probefahrt</h2>
<p>Fahren Sie kalt los, wenn möglich. Achten Sie auf Geräusche beim Lenken, gleichmäßiges Schalten der Automatik und geradeaus laufendes Bremsen. Mindestens 20 Minuten, gern auch ein Stück Autobahn.</p>
<h2>Und bei uns?</h2>
<p>Jedes Auto im Bestand ist mit 20 bis 30 Fotos dokumentiert – innen, außen, Details. Fragen Sie vor der Anfahrt ruhig nach weiteren Bildern oder nach dem Serviceheft; wir schicken beides per WhatsApp. <a href="probefahrt.html">Probefahrt vereinbaren</a></p>''')
    artikel(1, '''
<p class="lead">Bei einer Finanzierung mit Schlussrate (auch Ballonfinanzierung) zahlen Sie monatlich weniger, weil ein Teil des Kaufpreises erst am Ende fällig wird. Am besten versteht man das an einem echten Beispiel.</p>
<h2>Das Beispiel</h2>
<p>Das repräsentative Beispiel zu einem Audi A5 Sportback aus unserem Bestand (Stand 28.9.2026, Consors Finanz): Kaufpreis 19.990 €, Anzahlung 3.998 € (20 %), Nettodarlehensbetrag 15.992 €, Laufzeit 60 Monate, 10.000 km pro Jahr, Sollzins 6,78 % p. a. gebunden, effektiver Jahreszins 6,99 %. Daraus ergeben sich 59 Monatsraten von 191,27 € und eine Schlussrate von 8.995,50 €. Gesamtbetrag: 20.280,43 €.</p>
<h2>Was danach passiert</h2>
<p>Am Ende der Laufzeit ist die Schlussrate fällig. Sie können sie auf einmal zahlen, anschlussfinanzieren oder – je nach Vertrag – das Auto verkaufen und die Schlussrate mit dem Erlös ablösen. Das Auto gehört Ihnen von Anfang an (anders als beim Leasing), die Bank hält nur die Zulassungsbescheinigung Teil II als Sicherheit.</p>
<h2>Wann das passt – und wann nicht</h2>
<ul class="ticks"><li><b>Passt</b>, wenn Sie das Auto einige Jahre fahren und die Monatsrate klein halten wollen, oder wenn Sie danach ohnehin wechseln.</li><li><b>Vorsicht</b>, wenn Sie am Ende keine Rücklage für die Schlussrate haben: Eine Anschlussfinanzierung kostet weitere Zinsen.</li><li><b>Vergleichen</b> Sie immer den Gesamtbetrag, nicht nur die Monatsrate.</li></ul>
<p>Mit unserem <a href="finanzierung.html#werkzeug">Raten-Rechner</a> können Sie beide Varianten mit jedem Auto aus dem Bestand vergleichen. Verbindlich ist allein das Angebot der Bank nach Bonitätsprüfung.</p>''')
    artikel(2, '''
<p class="lead">Ein Auto gefällt, der Anruf kommt – und es heißt: reserviert. Warum steht es dann noch im Netz? Die Antwort liegt im Ablauf einer Reservierung.</p>
<h2>So reservieren Sie ein Auto</h2>
<p>Wenn Sie sich entschieden haben, können Sie das Auto mit einer Anzahlung reservieren – auch ohne es vorher gesehen zu haben, wenn Ihnen Fotos und Beschreibung reichen. Wir halten es dann für Sie zurück, bis der Kaufpreis im vereinbarten Zeitraum bezahlt ist.</p>
<h2>Warum das Inserat online bleibt</h2>
<p>Bei uns gilt die Faustregel: Ein Inserat wird erst gelöscht, wenn das Auto vollständig bezahlt ist. Manchmal schafft es ein Käufer nicht, in der vereinbarten Zeit zu zahlen – dann ist das Auto wieder frei, und wir melden uns bei den Interessenten, die danach gefragt haben. Deshalb lohnt sich eine Anfrage auch bei einem reservierten Auto.</p>
<h2>Was die Website zeigt</h2>
<p>Der Bestand auf dieser Website kommt direkt aus unseren mobile.de-Inseraten. Er zeigt also genau das, was dort online ist – mit Stand und Uhrzeit. Ob ein Auto gerade reserviert ist, sagen wir Ihnen am Telefon oder per WhatsApp sofort.</p>
<h2>Importfahrzeuge</h2>
<p>Einige Autos im Bestand sind Importfahrzeuge (etwa aus anderen EU-Ländern). Das ist kein Makel, aber gut zu wissen, etwa für Ausstattung und Service-Historie. Wir sagen es Ihnen im Gespräch, bevor Sie anreisen.</p>''')

FAQ = [
 ('Wie aktuell ist der Bestand auf der Website?', 'Der Bestand kommt direkt aus unseren Inseraten bei mobile.de und wird regelmäßig automatisch aktualisiert. Stand und Uhrzeit stehen jeweils unter der Fahrzeugliste. Ob ein Auto gerade reserviert ist, sagen wir Ihnen am Telefon oder per WhatsApp sofort.'),
 ('Wann haben Sie geöffnet?', 'Montag bis Freitag von 9 bis 19 Uhr, samstags von 9 bis 14 Uhr. Sonntags ist geschlossen.'),
 ('Kann ich ein Auto reservieren?', 'Ja, mit einer Anzahlung. Das Auto wird dann für Sie zurückgehalten, bis der Kaufpreis im vereinbarten Zeitraum bezahlt ist.'),
 ('Warum ist ein reserviertes Auto noch online?', 'Ein Inserat wird bei uns erst gelöscht, wenn das Auto vollständig bezahlt ist. Platzt ein Kauf, melden wir uns bei den nächsten Interessenten.'),
 ('Wie vereinbare ich eine Probefahrt?', 'Über das Formular auf der Seite Probefahrt, per Telefon unter 02402 1247840 oder per WhatsApp an 0157 72567022. Bitte Führerschein und Ausweis mitbringen.'),
 ('Kann ich mein Auto finanzieren oder leasen?', 'Ja. Zu den meisten Autos gibt es ein Finanzierungsbeispiel; eine Beispielrate rechnen Sie mit unserem Raten-Rechner aus. Leasing ist ebenfalls möglich – fragen Sie mit dem Wunschauto an. Die Kreditentscheidung trifft die Bank nach Bonitätsprüfung.'),
 ('Sind Importfahrzeuge dabei?', 'Einzelne Autos im Bestand sind Importfahrzeuge. Das sagen wir Ihnen im Gespräch, bevor Sie anreisen.'),
 ('Sprechen Sie Englisch?', 'Yes – wir beraten auf Deutsch und Englisch. Viele unserer Kunden kommen aus Belgien, den Niederlanden und von weiter her.'),
 ('Machen Sie auch die Zulassung?', 'Ja, unser Zulassungsservice übernimmt An-, Um- und Abmeldung. Welche Unterlagen nötig sind, sagen wir Ihnen vorab.'),
 ('Kann ich die HU bei Ihnen machen lassen?', 'Ja, die Hauptuntersuchung nimmt ein amtlich anerkannter Prüfer direkt bei uns ab. Wann Ihre HU fällig ist, zeigt unser Plaketten-Prüfer.'),
 ('Lagern Sie Reifen ein?', 'Ja, wir wechseln Reifen und lagern die Räder bis zum nächsten Wechsel ein.'),
 ('Wo finde ich Sie?', 'Eschweilerstraße 167 in 52222 Stolberg (Rheinland) – an der Halle mit dem Euregio-Schild und den zwei gelben Silos dahinter.'),
]

def faq():
    items = ''.join(f'<details class="qa"><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in FAQ)
    ld = [{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]
    body = hofkopf('Häufige Fragen', 'Reservierung, Probefahrt, Finanzierung, HU: die Antworten auf das, was wir am häufigsten gefragt werden.', 'schalthebel', 'Wählhebel und Bedienelemente in der Mittelkonsole eines BMW', 'FAQ') + f'''
<section class="faq"><div class="wrap faq-in">{items}</div></section>''' + cta()
    page({'file': 'faq.html', 'title': 'Häufige Fragen | Euregio Motorcars Stolberg', 'desc': 'Antworten zu Reservierung, Probefahrt, Finanzierung, Importfahrzeugen, HU vor Ort, Zulassung und Öffnungszeiten bei Euregio Motorcars.', 'ld': ld}, body)

def kontakt():
    body = hofkopf('Kontakt', 'Anrufen, schreiben oder vorbeikommen – wir antworten schnell, auch per WhatsApp.', 'szene-hof-840', 'BMW 840d vor der Halle von Euregio Motorcars', 'Eschweilerstraße 167') + f'''
<section class="book" id="werkzeug">
 <div class="wrap book-grid">
  <div class="book-l">
   <ul class="contact-list">
    <li><a href="tel:{TEL_L}"><span>Telefon</span><b>{TEL}</b></a></li>
    <li><a href="tel:{MOBIL_L}"><span>Mobil</span><b>{MOBIL}</b></a></li>
    <li><a href="{WA}" target="_blank" rel="noopener"><span>WhatsApp</span><b>{MOBIL}</b></a></li>
    <li><a href="mailto:{MAIL}"><span>E-Mail</span><b>{MAIL}</b></a></li>
    <li><span><span>Fax</span><b>{FAX}</b></span></li>
   </ul>
   <dl class="facts"><div><dt>Adresse</dt><dd>{FIRMA}<br>{STR}<br>{PLZ} {ORT}</dd></div><div><dt>Öffnungszeiten</dt><dd>Mo–Fr 9:00–19:00 Uhr<br>Sa 9:00–14:00 Uhr<br>So geschlossen</dd></div><div><dt>Wir sprechen</dt><dd>Deutsch, English</dd></div></dl>
   {mapbox()}
  </div>
  <div class="book-r">{form('', 'anfrage', False, 'Nachricht an uns')}</div>
 </div>
</section>'''
    page({'file': 'kontakt.html', 'title': 'Kontakt & Anfahrt | Euregio Motorcars Stolberg', 'desc': 'Euregio-Motorcars GmbH, Eschweilerstraße 167, 52222 Stolberg. Tel. 02402 1247840, WhatsApp 0157 72567022. Mo–Fr 9–19, Sa 9–14 Uhr.', 'bestand': True}, body)

def danke():
    body = f'''<section class="simple"><div class="wrap narrow"><p class="kicker">Anfrage gesendet</p><h1>Danke! Wir melden uns.</h1>
<p class="lead">Ihre Nachricht ist bei uns angekommen. Während der Öffnungszeiten (Mo–Fr 9–19, Sa 9–14 Uhr) antworten wir meist innerhalb weniger Stunden.</p>
<div class="btns"><a class="btn mag" href="fahrzeuge.html">Weiter im Bestand stöbern {arrow()}</a><a class="btn ghost mag" href="{WA}" target="_blank" rel="noopener">{ICON['wa']} WhatsApp</a></div></div></section>'''
    page({'file': 'danke.html', 'title': 'Danke für Ihre Anfrage | Euregio Motorcars', 'desc': 'Ihre Anfrage an Euregio Motorcars ist angekommen. Wir melden uns schnellstmöglich.', 'noindex': True}, body)

def notfound():
    body = f'''<section class="simple"><div class="wrap narrow"><p class="kicker">Fehler 404</p><h1>Hier parkt nichts.</h1>
<p class="lead">Diese Seite gibt es nicht (mehr). Vielleicht war es ein Auto, das inzwischen verkauft ist?</p>
<div class="btns"><a class="btn mag" href="fahrzeuge.html">Zum aktuellen Bestand {arrow()}</a><a class="btn ghost mag" href="index.html">Zur Startseite</a></div></div></section>'''
    page({'file': '404.html', 'title': 'Seite nicht gefunden | Euregio Motorcars', 'desc': 'Diese Seite gibt es nicht. Zum aktuellen Fahrzeugbestand von Euregio Motorcars in Stolberg.', 'noindex': True}, body)

def impressum():
    body = f'''<section class="simple legal"><div class="wrap narrow"><h1>Impressum</h1>
<h2>Angaben gemäß § 5 DDG</h2>
<p>{FIRMA}<br>{STR}<br>{PLZ} {ORT}</p>
<p><b>Vertreten durch den Geschäftsführer:</b><br>Stanislaw Michaltschuk</p>
<h2>Kontakt</h2><p>Telefon: {TEL}<br>Fax: {FAX}<br>E-Mail: <a href="mailto:{MAIL}">{MAIL}</a></p>
<h2>Registereintrag</h2><p>Eintragung im Handelsregister<br>Registergericht: Amtsgericht Aachen<br>Registernummer: HRB 16576</p>
<h2>Umsatzsteuer-ID</h2><p>Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: DE274354580</p>
<h2>Verbraucherstreitbeilegung</h2><p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
<h2>Fahrzeugangaben</h2><p>Die Fahrzeugdaten auf dieser Website stammen aus unseren Inseraten bei mobile.de. Zwischenverkauf und Irrtümer vorbehalten. Die Fahrzeugbeschreibung dient lediglich der allgemeinen Identifizierung des Fahrzeugs und stellt keine Gewährleistung im kaufrechtlichen Sinne dar. Ausschlaggebend sind allein die Vereinbarungen in Auftragsbestätigung bzw. Kaufvertrag.</p>
<h2>Bildnachweis</h2><p>Alle Fotos: {FIRMA}.</p>
</div></section>'''
    page({'file': 'impressum.html', 'title': 'Impressum | Euregio-Motorcars GmbH', 'desc': 'Impressum der Euregio-Motorcars GmbH, Eschweilerstraße 167, 52222 Stolberg. Geschäftsführer Stanislaw Michaltschuk, HRB 16576 AG Aachen.', 'noindex': False}, body)

def datenschutz():
    body = f'''<section class="simple legal"><div class="wrap narrow"><h1>Datenschutzerklärung</h1>
<h2>1. Verantwortlicher</h2><p>{FIRMA}, {STR}, {PLZ} {ORT}, Telefon {TEL}, E-Mail <a href="mailto:{MAIL}">{MAIL}</a>. Vertreten durch den Geschäftsführer Stanislaw Michaltschuk.</p>
<h2>2. Grundsätze</h2><p>Diese Website verwendet keine Cookies, kein Tracking und keine Analyse-Werkzeuge. Schriften werden von unserem eigenen Server geladen. Wir verarbeiten personenbezogene Daten nur, soweit es für den Betrieb der Website und die Bearbeitung Ihrer Anfragen nötig ist.</p>
<h2>3. Hosting und Server-Logfiles</h2><p>[Hoster eintragen – z. B. GitHub Pages / Netlify mit Sitz und Auftragsverarbeitungsvertrag.] Beim Aufruf der Website verarbeitet der Hoster technisch notwendige Daten (IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browser). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (sicherer und stabiler Betrieb).</p>
<h2>4. Skript-Bibliotheken (jsDelivr)</h2><p>Für Animationen laden wir die Programmbibliotheken GSAP und Lenis über das Content-Delivery-Netzwerk jsDelivr. Dabei wird Ihre IP-Adresse an die Betreiber des Netzwerks übermittelt. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (schnelle, zuverlässige Auslieferung).</p>
<h2>5. Fahrzeugfotos von mobile.de</h2><p>Die Fotos im Fahrzeugbestand werden direkt vom Bildserver unserer Inserate bei mobile.de geladen (img.classistatic.de, mobile.de GmbH, Albert-Einstein-Ring 2–6, 14532 Kleinmachnow). Dabei wird Ihre IP-Adresse an diesen Server übermittelt; es werden dabei keine Cookies gesetzt. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (aktuelle Darstellung unseres Bestands). Links zu Inseraten auf mobile.de führen auf die Website der mobile.de GmbH, für die deren eigene Datenschutzerklärung gilt.</p>
<h2>6. Kontaktformular, E-Mail, Telefon, WhatsApp</h2><p>Wenn Sie uns über das Formular, per E-Mail oder telefonisch anfragen, verarbeiten wir Ihre Angaben (Name, Kontaktdaten, Nachricht, ggf. gewähltes Fahrzeug und Wunschtermin) zur Bearbeitung der Anfrage und für mögliche Anschlussfragen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) bzw. lit. f. [Formular-Dienst eintragen, z. B. Netlify Forms.] Die Daten löschen wir, sobald die Anfrage erledigt ist und keine gesetzlichen Aufbewahrungspflichten bestehen.</p>
<p>Wenn Sie uns über WhatsApp schreiben, gelten zusätzlich die Datenschutzbestimmungen der WhatsApp Ireland Ltd.; dabei können Daten in Drittländer (USA) übermittelt werden. Nutzen Sie WhatsApp nur, wenn Sie damit einverstanden sind – alternativ erreichen Sie uns jederzeit per Telefon oder E-Mail.</p>
<h2>7. Karte</h2><p>Die Karte auf der Kontaktseite wird erst geladen, wenn Sie auf „Karte laden“ klicken. Dann werden Kartendaten von der OpenStreetMap Foundation (St John’s Innovation Centre, Cowley Road, Cambridge, CB4 0WS, Großbritannien) abgerufen und Ihre IP-Adresse dorthin übermittelt. Rechtsgrundlage ist Ihre Einwilligung durch den Klick (Art. 6 Abs. 1 lit. a DSGVO).</p>
<h2>8. Ihre Rechte</h2><p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch (Art. 15–21 DSGVO) sowie auf Beschwerde bei einer Aufsichtsbehörde, z. B. der Landesbeauftragten für Datenschutz und Informationsfreiheit Nordrhein-Westfalen.</p>
<p class="muted small">Stand: September 2026</p>
</div></section>'''
    page({'file': 'datenschutz.html', 'title': 'Datenschutz | Euregio-Motorcars GmbH', 'desc': 'Datenschutzerklärung der Euregio-Motorcars GmbH: keine Cookies, kein Tracking, Kontaktformular, Fahrzeugfotos von mobile.de, Karte erst per Klick.'}, body)

# ---------------------------------------------------------------- Nebenprodukte
def sitemap():
    urls = [p for p in PAGES if not p.get('noindex') and p['file'] not in ('404.html', 'fahrzeug.html')]
    today = datetime.date.today().isoformat()
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(
        f' <url><loc>{BASE}{"" if p["file"] == "index.html" else p["file"]}</loc><lastmod>{today}</lastmod></url>\n' for p in urls) + '</urlset>\n'
    open(os.path.join(ROOT, 'sitemap.xml'), 'w').write(xml)
    open(os.path.join(ROOT, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\nDisallow: /danke.html\n\nSitemap: {BASE}sitemap.xml\n')

if __name__ == '__main__':
    home(); fahrzeuge(); fahrzeug(); finanzierung(); probefahrt(); service_all()
    werkstatt(); karosserie(); reifen(); hu(); aufbereitung()
    ueber(); ratgeber(); artikel_all(); faq(); kontakt(); danke(); notfound(); impressum(); datenschutz()
    sitemap()
    print(len(PAGES), 'Seiten gebaut, Version', V)
