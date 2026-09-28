// Holt den Bestand über die offizielle mobile.de-Such-API (services.mobile.de/search-api)
// und schreibt data/bestand.json + data/bestand.js. Läuft stündlich im GitHub-Workflow.
//
// Zugangsdaten: Der Händler beantragt im mobile.de-Händlerbereich einen API-Zugang
// (Benutzername + Passwort für die Such-API). Im GitHub-Repo unter
// Settings → Secrets → Actions als MOBILE_API_USER und MOBILE_API_PASS hinterlegen.
// Kundennummer bei mobile.de: 5147416.

const { normalisiereApi, schreibeBestand } = require('./normalisieren');
const fs = require('fs');
const path = require('path');

const USER = process.env.MOBILE_API_USER;
const PASS = process.env.MOBILE_API_PASS;
const KUNDE = process.env.MOBILE_CUSTOMER_ID || '5147416';

(async () => {
  if (!USER || !PASS) { console.log('Keine API-Zugangsdaten hinterlegt – Bestand bleibt unverändert.'); return; }
  const auth = 'Basic ' + Buffer.from(USER + ':' + PASS).toString('base64');
  let alle = [], seite = 1, gesamt = Infinity;
  while (alle.length < gesamt && seite <= 20) {
    const url = `https://services.mobile.de/search-api/search?customerId=${KUNDE}&page.size=100&page.number=${seite}`;
    const r = await fetch(url, { headers: { Authorization: auth, Accept: 'application/vnd.de.mobile.api+json', 'Accept-Language': 'de' } });
    if (!r.ok) { console.error('mobile.de antwortet mit', r.status, await r.text()); process.exit(1); }
    const j = await r.json();
    const ads = j.ads || [];
    gesamt = j.total != null ? j.total : ads.length;
    alle = alle.concat(ads);
    if (!ads.length) break;
    seite++;
  }
  const neu = normalisiereApi({ ads: alle });
  // Schutz: nicht auf einen leeren Bestand überschreiben, wenn vorher viele Autos da waren
  try {
    const alt = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'bestand.json'), 'utf8'));
    if (neu.anzahl === 0 && alt.anzahl > 3) { console.error('API lieferte 0 Fahrzeuge – vermutlich Störung. Abbruch.'); process.exit(1); }
  } catch (e) { /* erster Lauf */ }
  schreibeBestand(neu);
  console.log('Bestand aktualisiert:', neu.anzahl, 'Fahrzeuge');
})();
