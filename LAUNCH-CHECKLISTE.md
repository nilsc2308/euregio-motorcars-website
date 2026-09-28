# Launch-Checkliste – Euregio-Motorcars GmbH (Stand 28.9.2026, 2. Fassung)

Unbeauftragter Entwurf. Die bisherige Domain euregio-motorcars.de leitet nur auf die mobile.de-Händlerseite um.

## Offen beim Kunden (vor dem Livegang klären)

- [ ] **Einverständnis** des Kunden (GF Stanislaw Michaltschuk) für die Website.
- [ ] **mobile.de-API-Zugang** für die automatische Bestandsaktualisierung: Der Händler beantragt im mobile.de-Händlerbereich Zugangsdaten für die Such-API (Kundennummer 5147416). Die Daten kommen als Secrets `MOBILE_API_USER` / `MOBILE_API_PASS` ins GitHub-Repo. Bis dahin zeigt die Seite den Stand vom 28.9.2026, 18:17 Uhr (35 Pkw). Das Format der API-Antwort ist in `scripts/normalisieren.js` nach Dokumentation umgesetzt – **mit echten Zugangsdaten einmal testen** (`Actions → Bestand aktualisieren → Run workflow`).
- [ ] **Fotorechte:** Alle Fotos stammen aus den mobile.de-Inseraten des Händlers (eigene Fotos auf dem eigenen Hof). Freigabe bestätigen lassen. Fest eingebaut sind nur noch das Hof-Übersichtsfoto und zwei Cockpit-Aufnahmen; alle Auto-Fotos kommen live aus dem Bestand. Schön wäre ein neues Hof-Foto ohne Autos im Vordergrund.
- [ ] **Kfz-Werkstatt auf dem Gelände:** Auf den Fotos steht an der Werkstatt „cardoctor Stolberg“. Klären: Gehört die Werkstatt zu Euregio, oder ist es ein Partner? Die Texte sagen neutral „Service auf dem Gelände / an einer Adresse“. Leistungsliste stammt aus dem mobile.de-Profil (18 Services) – Umfang bestätigen lassen.
- [ ] **Logo als Vektordatei** anfordern. Das Logo ist aus der 150-px-Vorlage bei mobile.de nachgebaut (Dachlinie + Schriftzug in Saira).
- [ ] **Kundenstimmen:** Zitate aus Google (drei Auszüge, von Nils geliefert) und mobile.de (Richard, Alina, Dany – wörtlich, nur Groß-/Kleinschreibung angepasst). Ok für die Nutzung? Namen „Hermann Kuhn“ (Verkauf, aus einer Händlerantwort auf mobile.de) auf „Über uns“ bestätigen.
- [ ] **Leasing, Reifenlager, HU vor Ort:** Laut Profil vorhanden; Konditionen/Ablauf nicht bekannt – Texte sind allgemein gehalten.
- [ ] **Hoster und Formular-Dienst** in der Datenschutzerklärung eintragen (Platzhalter in eckigen Klammern, Abschnitt 3 und 6).
- [ ] **Domain:** euregio-motorcars.de (IONOS, 217.160.0.221) auf das neue Hosting zeigen lassen; die Weiterleitung zu mobile.de entfernen.
- [ ] Wohnmobil (1 Inserat) fehlt im Startbestand – kommt automatisch, sobald die API läuft.

## Technik & Recht – geprüft 28.9.2026

| Punkt | Ergebnis |
|---|---|
| Datenschutz | `datenschutz.html`: keine Cookies, kein Tracking; jsDelivr, Fahrzeugfotos von img.classistatic.de (mobile.de), WhatsApp-Hinweis, OSM erst per Klick. Hoster/Formular-Dienst als Platzhalter. |
| Impressum | `impressum.html` mit Angaben aus dem mobile.de-Impressum: GF, HRB 16576 AG Aachen, USt-ID DE274354580, Tel./Fax/E-Mail. |
| Cookie-Banner | Nicht nötig: Schrift lokal, keine Tracker, Karte erst nach Klick. |
| Mobile | Playwright 390 × 844 (Chromium + WebKit): alle 22 Seiten durchgescrollt, `scrollWidth == clientWidth` überall. |
| JS-Fehler | 0 in Chromium und WebKit, Desktop 1400 px und Handy 390 px, alle Seiten. |
| Meta | Titel ≤ 65, Descriptions ≤ 155 Zeichen je Seite. |
| Favicon | `favicon.svg` + `apple-touch-icon.png` (180 px). |
| Sitemap / Robots | `sitemap.xml` (20 URLs, ohne danke/404/Detailseite), `robots.txt`. |
| Canonical | auf `https://www.euregio-motorcars.de/…` (Zieldomain). |
| 404 | `404.html` („Hier parkt nichts.“), Netlify-Regel vorhanden. Detailseite zeigt „verkauft oder reserviert“, wenn ein Auto nicht mehr im Bestand ist. |
| Broken Links | 80 interne Links auf 22 Seiten: 0 kaputt. Extern: mobile.de, wa.me. |
| Performance | Bis „load“: Desktop 639 KB (Ziel < 900), Handy 469 KB (Ziel < 500). Bestandsfotos lazy. |
| Accessibility | Tastatur: Menü mit Fokusfalle, Galerie mit Pfeiltasten, Gänge mit Pfeiltasten, Skizze und Plakette per Enter/Leertaste. Kontraste: Blau #0c6cae auf Weiß 5,5 : 1, Grau #6e6e73 auf Weiß 4,6 : 1, Weiß auf Anthrazit 13 : 1. Karussell mit Pfeilen, Pfeiltasten, Wischen. Reduzierte Bewegung: Wechsel ohne Animation. |
| Formular | Netlify-Forms-Attribute + Honeypot; Pflichtfelder geprüft (3 Fehler markiert), `?thema=` und `?fahrzeug=` vorbelegt, Wunschtag/Uhrzeit aus den Öffnungszeiten. In der Vorschau (GitHub Pages) springt es direkt auf danke.html – echter Versand erst beim Hosting mit Formular-Dienst. |
| Alt-Texte | alle Fotos beschrieben; Fahrzeugfotos mit Titel des Inserats. |
| Analytics | keins (bewusst). |
| OG | `og.jpg` 1200 × 630 (Hof-Übersicht + Logo + Claim). |
| Lokale SEO | JSON-LD `AutoDealer` mit Adresse, Geo, Öffnungszeiten auf allen Seiten; `FAQPage`, `Article`, `Car` (Detailseite). |
| Indexierung | danke.html `noindex`. |

## Richtwerte / Annahmen (als solche gekennzeichnet)

- Raten-Rechner: Zins aus dem echten Bankbeispiel (Consors Finanz, 6,78 % / 6,99 %); Schlussrate 45 % bei 60 Monaten wie in den Beispielen, für kürzere Laufzeiten angenommen (60 / 54 / 50 %). Kontrolle: Rechner ergibt beim BMW X2 18i 153 €/Monat = Inseratwert.
- Pflege-Intervall (Aufbereitung) und Saison-Kalender: Faustregeln, auf der Seite gekennzeichnet.
- HU-Plakette: Farbfolge 2023 rosa → 2028 braun (ADAC/KÜS).
