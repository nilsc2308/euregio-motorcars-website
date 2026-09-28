// Bringt mobile.de-Daten (Webseite oder Such-API) in ein festes Format für die Website.
// Ergebnis: data/bestand.json (für Menschen und Werkzeuge) + data/bestand.js (für die Seite, läuft auch ohne Server).

const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'data');

const KRAFTSTOFF = { PETROL: 'Benzin', DIESEL: 'Diesel', ELECTRICITY: 'Elektro', HYBRID: 'Hybrid (Benzin/Elektro)', HYBRID_DIESEL: 'Hybrid (Diesel/Elektro)', CNG: 'Erdgas (CNG)', LPG: 'Autogas (LPG)', HYDROGENIUM: 'Wasserstoff', ETHANOL: 'Ethanol', OTHER: 'Andere' };
const GETRIEBE = { AUTOMATIC_GEAR: 'Automatik', MANUAL_GEAR: 'Schaltgetriebe', SEMIAUTOMATIC_GEAR: 'Halbautomatik' };
const KATEGORIE = { Cabrio: 'Cabrio/Roadster', EstateCar: 'Kombi', Limousine: 'Limousine', OffRoad: 'SUV/Geländewagen', SmallCar: 'Kleinwagen', SportsCar: 'Sportwagen/Coupé', Van: 'Van/Minibus', OtherCar: 'Andere', MotorHome: 'Wohnmobil' };
const FARBE = { BLACK: 'Schwarz', WHITE: 'Weiß', GREY: 'Grau', SILVER: 'Silber', BLUE: 'Blau', RED: 'Rot', GREEN: 'Grün', BROWN: 'Braun', BEIGE: 'Beige', ORANGE: 'Orange', YELLOW: 'Gelb', GOLD: 'Gold', PURPLE: 'Violett' };

const zahl = s => s == null ? null : Number(String(s).replace(/[^\d,]/g, '').replace(',', '.')) || null;
const tsd = n => n == null ? '' : Math.round(n).toLocaleString('de-DE');
const bildBasis = u => {
  if (!u) return null;
  u = String(u).replace(/^\/\//, 'https://');
  if (!/^https?:/.test(u)) u = 'https://' + u;
  return u.replace(/\?rule=.*$/, '');
};
const titelSauber = t => String(t || '').replace(/\s*\/+\s*$/g, '').replace(/\s{2,}/g, ' ').trim();

function rateAus(plans) {
  const p = (plans || []).find(x => x && x.offer);
  if (!p) return null;
  const o = p.offer;
  return {
    monat: Math.ceil(o.monthlyInstallment), anzahlung: o.downPayment, laufzeit: o.creditTerm,
    kmJahr: o.yearlyMileage, sollzins: o.interestRateNominal, effzins: o.interestRateEffective,
    schlussrate: o.finalInstallment, kredit: o.creditAmount, gesamt: o.totalAmount,
    art: o.loanType === 'BALLOON' ? 'Ballonfinanzierung' : 'Ratenkredit',
    bank: o.bankName || '', hinweis: (o.localized && o.localized.disclaimer) || ''
  };
}

// ---------- Format der mobile.de-Händlerseite ----------
function normalisiereWeb(liste, details = {}) {
  const fz = liste.map(a => {
    const at = a.attr || {};
    const d = details[a.id] || {};
    const dAttr = Object.fromEntries((d.attributes || []).map(x => [x.tag, x.value]));
    const km = zahl(at.ml);
    const ps = zahl((String(at.pw || '').match(/\((\d+)\s*PS\)/) || [])[1]);
    return {
      id: String(a.id),
      titel: titelSauber(a.title),
      marke: a.make ? a.make.localized : (a.title || '').split(' ')[0],
      modell: a.model ? a.model.localized : '',
      kategorie: a.category || dAttr.category || '',
      preis: a.price && a.price.grs ? a.price.grs.amount : null,
      ez: at.fr || '',
      km, kmText: km != null ? tsd(km) + ' km' : '',
      leistung: at.pw || '', ps,
      kraftstoff: at.ft || '', getriebe: at.tr || '',
      farbe: at.ecol || '', tueren: at.door || '', sitze: at.sc || '',
      hubraum: at.cc || '', schadstoff: at.emc || '', vorbesitzer: at.pvo ? Number(at.pvo) : null,
      unfallfrei: /Unfallfrei/i.test(a.subTitle || '') || /unfallfrei/i.test(dAttr.damageCondition || ''),
      highlights: (a.highlights || []).map(titelSauber).filter(Boolean),
      merkmale: d.features || [],
      beschreibung: (d.beschreibung || '').trim(),
      verbrauch: dAttr['envkv.energyConsumption'] || '',
      bilder: (a.images || []).map(i => bildBasis(i.uri)).filter(Boolean),
      rate: rateAus(a.financePlans),
      preisBewertung: a.priceRating ? a.priceRating.ratingLabel : '',
      url: 'https://suchen.mobile.de/fahrzeuge/details.html?id=' + a.id,
      erstellt: a.created ? new Date(a.created * 1000).toISOString() : null
    };
  });
  return mitKopf(fz, 'mobile.de-Händlerseite');
}

// ---------- Format der mobile.de-Such-API (services.mobile.de/search-api) ----------
function apiBilder(imgs) {
  const out = [];
  (imgs || []).forEach(im => {
    const urls = [];
    (function suche(o) {
      if (!o) return;
      if (typeof o === 'string') { if (/^https?:|^\/\//.test(o)) urls.push(o); return; }
      if (Array.isArray(o)) return o.forEach(suche);
      if (typeof o === 'object') Object.values(o).forEach(suche);
    })(im);
    // größte Fassung bevorzugen (XXL/XXXL/XL), sonst die erste
    const best = urls.find(u => /XXXL|XXL|_57|_27|rule=mo-1600/i.test(u)) || urls[0];
    if (best) out.push(bildBasis(best));
  });
  return out;
}
function ezApi(fr) { // "201808" → "08/2018"
  const s = String(fr || '');
  return s.length >= 6 ? s.slice(4, 6) + '/' + s.slice(0, 4) : s;
}
function normalisiereApi(json) {
  const ads = json.ads || json.searchResult?.ads || [];
  const fz = ads.map(a => {
    const kw = zahl(a.power);
    const ps = kw ? Math.round(kw * 1.35962) : null;
    const km = zahl(a.mileage);
    const preis = a.price ? zahl(a.price.consumerPriceGross || (a.price.grs && a.price.grs.amount)) : null;
    const id = String(a.mobileAdId || a.id);
    return {
      id,
      titel: titelSauber([a.make, a.modelDescription || a.model].filter(Boolean).join(' ')),
      marke: a.make || '', modell: a.model || '',
      kategorie: KATEGORIE[a.category] || a.category || '',
      preis, ez: ezApi(a.firstRegistration), km, kmText: km != null ? tsd(km) + ' km' : '',
      leistung: kw ? `${kw} kW (${ps} PS)` : '', ps,
      kraftstoff: KRAFTSTOFF[a.fuel] || a.fuel || '', getriebe: GETRIEBE[a.gearbox] || a.gearbox || '',
      farbe: FARBE[a.exteriorColor] || a.exteriorColor || '', tueren: a.doors || '', sitze: a.numSeats || '',
      hubraum: a.cubicCapacity ? tsd(a.cubicCapacity) + ' cm³' : '', schadstoff: a.emissionClass || '',
      vorbesitzer: a.numberOfPreviousOwners != null ? Number(a.numberOfPreviousOwners) : null,
      unfallfrei: a.accidentDamaged === false || a.damageUnrepaired === false,
      highlights: [], merkmale: (a.features || []).map(f => typeof f === 'string' ? f : (f.localized || f.key || '')).filter(Boolean),
      beschreibung: String(a.description || '').replace(/\\\\/g, '\n').trim(),
      verbrauch: '', bilder: apiBilder(a.images), rate: null, preisBewertung: '',
      url: a.detailPageUrl || ('https://suchen.mobile.de/fahrzeuge/details.html?id=' + id),
      erstellt: a.creationDate || null
    };
  });
  return mitKopf(fz, 'mobile.de-Such-API');
}

function mitKopf(fahrzeuge, quelle) {
  fahrzeuge = fahrzeuge.filter(f => f.preis && f.bilder.length);
  fahrzeuge.sort((a, b) => String(b.erstellt || '').localeCompare(String(a.erstellt || '')));
  return { stand: new Date().toISOString(), quelle, anzahl: fahrzeuge.length, haendlerseite: 'https://home.mobile.de/EUREGIOMOTORCARSGMBH', fahrzeuge };
}

function schreibeBestand(bestand) {
  fs.mkdirSync(DATA, { recursive: true });
  try { // unveränderter Bestand → Datei nicht anfassen (sonst stündlich ein leerer Commit)
    const alt = JSON.parse(fs.readFileSync(path.join(DATA, 'bestand.json'), 'utf8'));
    if (JSON.stringify(alt.fahrzeuge) === JSON.stringify(bestand.fahrzeuge)) { console.log('Bestand unverändert.'); return; }
  } catch (e) { /* noch keine Datei */ }
  // bestand.js: schlank für alle Seiten (Liste, Startseite, Kopfzeile)
  // bestand-voll.js: mit allen Fotos, Ausstattung und Beschreibung (nur Detailseite)
  const schlank = { ...bestand, hinweise: {}, fahrzeuge: bestand.fahrzeuge.map(f => ({ ...f, bilder: f.bilder.slice(0, 2), bilderAnzahl: f.bilder.length, merkmale: undefined, beschreibung: undefined, rate: f.rate ? { ...f.rate, hinweis: undefined } : null })) };
  bestand.fahrzeuge.forEach(f => { if (f.rate && f.rate.hinweis) schlank.hinweise[f.rate.bank] = f.rate.hinweis; });
  fs.writeFileSync(path.join(DATA, 'bestand.json'), JSON.stringify(bestand, null, 1));
  fs.writeFileSync(path.join(DATA, 'bestand.js'), 'window.EM_BESTAND=' + JSON.stringify(schlank) + ';\n');
  fs.writeFileSync(path.join(DATA, 'bestand-voll.js'), 'window.EM_BESTAND=' + JSON.stringify(bestand) + ';\n');
}

module.exports = { normalisiereWeb, normalisiereApi, schreibeBestand };
