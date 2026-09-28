// Holt den aktuellen Bestand von der mobile.de-Händlerseite (Übergangslösung, von Hand starten)
// und schreibt data/bestand.json + data/bestand.js.
// Dauerhafte Lösung: scripts/api-holen.js mit den Such-API-Zugangsdaten des Händlers (GitHub-Workflow).
//
// Aufruf im Projektordner:  node scripts/bestand-holen.js
// Braucht Playwright (npm i playwright) – mobile.de lässt nur einen sichtbaren Browser zu.

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { normalisiereWeb, schreibeBestand } = require('./normalisieren');

const HAENDLER = 'https://home.mobile.de/EUREGIOMOTORCARSGMBH';
const ROH = path.join(__dirname, '..', '_quelle');

function flight(html) {
  const chunks = [...html.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)<\/script>/g)].map(m => m[1]);
  return chunks.map(c => JSON.parse('"' + c + '"')).join('');
}
function objekteAb(s, marker) {
  const out = [];
  let i = s.indexOf(marker);
  while (i >= 0) {
    // passendes schließendes } suchen (JSON-sicher, beachtet Strings)
    let tiefe = 0, inStr = false, esc = false, j = i;
    for (; j < s.length; j++) {
      const ch = s[j];
      if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
      if (ch === '"') inStr = true;
      else if (ch === '{') tiefe++;
      else if (ch === '}') { tiefe--; if (tiefe === 0) break; }
    }
    try { out.push(JSON.parse(s.slice(i, j + 1))); } catch (e) { /* überspringen */ }
    i = s.indexOf(marker, j);
  }
  return out;
}

(async () => {
  const browser = await chromium.launch({ headless: false, args: ['--disable-blink-features=AutomationControlled'] });
  const page = await browser.newPage({ viewport: { width: 1300, height: 900 }, locale: 'de-DE' });
  const liste = new Map();
  const kategorien = ['', '?vc=MotorHome'];
  await page.goto(HAENDLER, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  for (const kat of kategorien) {
    for (let seite = 1; seite <= 10; seite++) {
      const sep = kat ? '&' : '?';
      const url = HAENDLER + kat + (seite > 1 ? sep + 'pageNumber=' + seite : '');
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3500);
      const s = flight(await page.content());
      const neu = objekteAb(s, '{"isEyeCatcher"').filter(o => o.id && !liste.has(o.id));
      neu.forEach(o => liste.set(o.id, o));
      console.log(url, '→', neu.length, 'neu');
      if (!neu.length) break;
    }
  }
  const details = {};
  for (const id of liste.keys()) {
    try {
      await page.goto('https://suchen.mobile.de/fahrzeuge/details.html?id=' + id, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      const html = await page.content();
      const s = flight(html);
      const lst = objekteAb(s, '{"attributes":[')[0] || {};
      const feats = [...s.matchAll(/"features":(\[[^\]]*\])/g)].map(m => { try { return JSON.parse(m[1]); } catch (e) { return []; } });
      const feat = feats.sort((a, b) => b.length - a.length)[0];
      const beschr = await page.$eval('[data-testid="vip-vehicle-description-text"]', el => el.innerText).catch(() => '');
      details[id] = { attributes: lst.attributes || [], features: (feat || []).filter(x => typeof x === 'string'), beschreibung: beschr };
      console.log('Details', id, (details[id].features || []).length, 'Merkmale');
    } catch (e) { console.log('Details fehlgeschlagen', id, e.message.slice(0, 80)); }
  }
  await browser.close();
  if (liste.size < 3) { console.error('Weniger als 3 Fahrzeuge gefunden – bestand.json bleibt unverändert.'); process.exit(1); }
  fs.writeFileSync(path.join(ROH, 'roh-liste.json'), JSON.stringify([...liste.values()]));
  fs.writeFileSync(path.join(ROH, 'roh-details.json'), JSON.stringify(details));
  const bestand = normalisiereWeb([...liste.values()], details);
  schreibeBestand(bestand);
  console.log('Fertig:', bestand.fahrzeuge.length, 'Fahrzeuge');
})();
