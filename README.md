# Euregio Motorcars – Website

Statischer Mehrseiter (22 Seiten), gebaut mit `_build.py`. Gestaltung: siehe `DESIGN.md`, offene Punkte: `LAUNCH-CHECKLISTE.md`.

## Ansehen

Im Projektordner `python3 -m http.server 8773` starten und http://localhost:8773 öffnen.
(Doppelklick auf index.html geht auch – der Bestand steckt in `data/bestand.js` und lädt ohne Server.)

## Seiten ändern

Texte stehen in `_build.py`. Nach einer Änderung `python3 _build.py` ausführen – alle Seiten werden neu erzeugt.

## Wie der Fahrzeugbestand aktuell bleibt

mobile.de erlaubt nicht, die Händlerseite in eine fremde Website einzubetten (geprüft: alle Varianten gesperrt).
Deshalb zeigt die Website den Bestand selbst an – aus den Dateien in `data/`:

- `data/bestand.js` – kurze Fassung für alle Seiten (Liste, Startseite, Zähler oben rechts)
- `data/bestand-voll.js` – mit allen Fotos, Ausstattung, Beschreibung (Detailseite)
- `data/bestand.json` – dieselben Daten zum Nachlesen

**Automatisch (Ziel):** Der GitHub-Workflow `.github/workflows/bestand.yml` holt jede Stunde zwischen 7 und 22 Uhr den Bestand über die offizielle mobile.de-Such-API (`scripts/api-holen.js`). Hat sich etwas geändert, speichert er die neuen Dateien – die Website ist Minuten später aktuell. Dafür braucht es die API-Zugangsdaten des Händlers als GitHub-Secrets `MOBILE_API_USER` und `MOBILE_API_PASS`.

**Von Hand (Übergang):** `node scripts/bestand-holen.js` öffnet einen Browser, liest die mobile.de-Händlerseite und schreibt die Dateien neu. mobile.de sperrt solche Abrufe nach kurzer Zeit („Access denied“) – deshalb nur als Notlösung.

Die Fotos der Autos lädt die Seite direkt vom mobile.de-Bildserver (steht in der Datenschutzerklärung). Verkaufte Autos verschwinden mit der nächsten Aktualisierung; ein alter Link auf ein verkauftes Auto zeigt „verkauft oder reserviert“ und ähnliche Autos.
