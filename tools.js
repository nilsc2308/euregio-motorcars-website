/* Euregio Motorcars – Werkzeuge der Unterseiten. */
(() => {
  const EM = window.EM; if (!EM) return;
  const { $, $$, esc, eur, eur2 } = EM;
  const params = new URLSearchParams(location.search);
  const segPick = (group, cb) => group && group.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', group).forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    cb(b.dataset.v);
  });
  const segVal = group => ($('[aria-pressed="true"]', group) || {}).dataset?.v;
  const kurz = t => String(t || '').replace(/\s*[-/]+\s*$/, '').replace(/\s+-\s+/g, ' · ');

  // ---------- Raten-Rechner ----------
  const calc = $('[data-calc]');
  if (calc) {
    const carSel = $('[data-calc-car]'), price = $('[data-calc-price]');
    const down = $('[data-calc-down]'), term = $('[data-calc-term]'), type = $('[data-calc-type]');
    const out = { rate: $('[data-out-rate]'), dl: $('[data-out-dl]'), note: $('[data-out-note]'), link: $('[data-out-link]') };
    // Zinssatz aus dem aktuellen Beispiel der Bank (mobile.de-Inserate), sonst 6,78 %
    let soll = 6.78, eff = 6.99, bank = 'Consors Finanz', cars = [];
    const num = s => Number(String(s).replace(/[^\d]/g, '')) || 0;
    const run = () => {
      const P = num(price.value), dp = +segVal(down) / 100, n = +segVal(term), ballon = segVal(type) === 'ballon';
      const A = Math.round(P * dp), K = P - A;
      if (P < 1000) { out.rate.textContent = '–'; out.dl.innerHTML = ''; out.note.textContent = 'Bitte einen Kaufpreis ab 1.000 € eingeben.'; return; }
      const i = soll / 100 / 12;
      // Schlussrate wie in den Bank-Beispielen: rund 45 % des Kaufpreises bei 60 Monaten, kürzer → höher
      const B = ballon ? Math.min(K * .9, P * ({ 24: .6, 36: .54, 48: .5, 60: .45 }[n])) : 0;
      // wie im Bankbeispiel: n−1 Monatsraten, am Ende die Schlussrate
      const m = ballon ? (K - B / Math.pow(1 + i, n)) * i / (1 - Math.pow(1 + i, -(n - 1))) : K * i / (1 - Math.pow(1 + i, -n));
      const raten = ballon ? n - 1 : n;
      const gesamt = m * raten + B;
      out.rate.textContent = Math.ceil(m).toLocaleString('de-DE');
      out.dl.innerHTML = `<dt>Kaufpreis</dt><dd>${eur(P)}</dd><dt>Anzahlung</dt><dd>${eur(A)}</dd><dt>Nettodarlehensbetrag</dt><dd>${eur2(K)}</dd><dt>Laufzeit</dt><dd>${n} Monate</dd>${ballon ? `<dt>Schlussrate</dt><dd>${eur2(B)}</dd>` : ''}<dt>Sollzins p. a.</dt><dd>${String(soll).replace('.', ',')} %</dd><dt>Gesamtbetrag (ohne Anzahlung)</dt><dd>${eur2(gesamt)}</dd>`;
      out.note.textContent = `Rechenbeispiel, kein Angebot: gerechnet mit ${String(soll).replace('.', ',')} % Sollzins (effektiv ${String(eff).replace('.', ',')} %) aus dem aktuellen Finanzierungsbeispiel der ${bank} in unseren Inseraten; ${ballon ? `${raten} Monatsraten plus Schlussrate; Schlussrate angenommen mit 45 % des Kaufpreises bei 60 Monaten wie in den aktuellen Bankbeispielen, bei kürzerer Laufzeit höher.` : `${n} gleiche Monatsraten.`} Verbindlich ist allein das Angebot der Bank nach Bonitätsprüfung.`;
      const c = cars.find(x => x.id === carSel.value);
      out.link.href = 'kontakt.html?thema=finanzierung&details=' + encodeURIComponent(`Finanzierung: ${c ? kurz(c.titel) + ' (' + eur(c.preis) + ')' : 'Kaufpreis ' + eur(P)}, Anzahlung ${eur(A)}, ${n} Monate, ${ballon ? 'mit Schlussrate' : 'ohne Schlussrate'} – Beispielrate ca. ${eur(Math.ceil(m))}/Monat.`);
    };
    [down, term, type].forEach(g => segPick(g, run));
    price.addEventListener('input', () => { carSel.value = ''; run(); });
    price.addEventListener('blur', () => { const n = num(price.value); if (n) price.value = n.toLocaleString('de-DE'); });
    carSel.addEventListener('change', () => { const c = cars.find(x => x.id === carSel.value); if (c) price.value = c.preis.toLocaleString('de-DE'); run(); });
    EM.bestand.then(b => {
      if (b) {
        cars = b.fahrzeuge.slice().sort((a, c) => a.marke.localeCompare(c.marke) || a.preis - c.preis);
        carSel.insertAdjacentHTML('beforeend', cars.map(c => `<option value="${esc(c.id)}">${esc(kurz(c.titel))} – ${eur(c.preis)}</option>`).join(''));
        const r = (b.fahrzeuge.find(f => f.rate) || {}).rate;
        if (r) { soll = r.sollzins; eff = r.effzins; bank = (r.bank || bank).split(',')[0]; }
        const pre = params.get('fahrzeug'); if (pre && cars.find(c => c.id === pre)) { carSel.value = pre; price.value = cars.find(c => c.id === pre).preis.toLocaleString('de-DE'); }
      }
      run();
    });
  }

  // ---------- Saison-Kalender ----------
  const season = $('[data-season]');
  if (season) {
    const M = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    const items = m => {
      const L = [];
      if (m >= 9 && m <= 10) L.push(['hot', 'Winterreifen drauf', 'Faustregel „von O bis O“: ab Oktober auf Winterreifen wechseln – bei Glätte gilt die situative Winterreifenpflicht.', 'reifen.html', 'Reifenwechsel & Reifenlager']);
      if (m >= 2 && m <= 3) L.push(['hot', 'Sommerreifen drauf', 'Ab Ostern ist die Zeit für Sommerreifen. Die Winterräder lagern bis Oktober bei uns.', 'reifen.html', 'Reifenwechsel & Reifenlager']);
      if (m >= 9 && m <= 11) L.push(['hot', 'Winter-Check', 'Batterie, Frostschutz, Licht, Wischerblätter – bevor es kalt wird.', 'werkstatt.html#werkzeug', 'Termin anfragen']);
      if (m === 0 || m === 1) L.push(['', 'Batterie im Blick', 'Kalte Nächte fordern die Batterie. Startet der Motor zäh, lieber jetzt prüfen lassen.', 'kontakt.html?thema=werkstatt', 'Kurz anfragen']);
      if (m >= 3 && m <= 5) L.push(['hot', 'Klima-Check', 'Vor dem ersten heißen Tag: Kältemittel, Dichtheit und Innenraumfilter prüfen.', 'kontakt.html?thema=werkstatt', 'Termin anfragen']);
      if (m >= 2 && m <= 4) L.push(['', 'Frühjahrs-Aufbereitung', 'Streusalz runter, Lack versiegeln, Innenraum auffrischen.', 'aufbereitung.html', 'Zur Aufbereitung']);
      if (m >= 5 && m <= 7) L.push(['', 'Vor der Urlaubsfahrt', 'Reifendruck für volle Beladung, Ölstand, Licht – und ein Blick auf die HU-Plakette.', 'hu-zulassung.html#werkzeug', 'Plakette prüfen']);
      L.push(['', 'Inspektion nach Plan', 'Das ganze Jahr: Inspektion, wenn die Service-Anzeige oder das Serviceheft es sagt.', 'kontakt.html?thema=werkstatt', 'Inspektion anfragen']);
      L.push(['', 'HU alle zwei Jahre', 'Pkw müssen alle 24 Monate zur Hauptuntersuchung (Neuwagen erstmals nach 36). Die HU nimmt bei uns ein amtlich anerkannter Prüfer ab.', 'hu-zulassung.html#werkzeug', 'Fälligkeit prüfen']);
      return L;
    };
    const outEl = $('.season-out', season);
    const show = m => {
      $$('.season-m button', season).forEach((b, i) => b.setAttribute('aria-pressed', i === m ? 'true' : 'false'));
      outEl.innerHTML = items(m).map(([c, t, d, h, l]) => `<article class="${c}"><h3>${t}</h3><p>${d}</p><a href="${h}">${l} →</a></article>`).join('');
      outEl.setAttribute('aria-label', 'Im ' + M[m]);
      if (EM.motion) gsap.fromTo($$('article', outEl), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .4, stagger: .05, ease: 'power3.out' });
    };
    $('.season-m', season).addEventListener('click', e => { const b = e.target.closest('button'); if (b) show(+b.dataset.m); });
    show(new Date().getMonth());
  }

  // ---------- Schadenskizze ----------
  const sketch = $('[data-sketch]');
  if (sketch) {
    const picks = new Map();
    const list = $('.sk-list', sketch), send = $('[data-sk-send]', sketch), typ = $('[data-sk-type]', sketch);
    segPick(typ, () => {});
    const paint = () => {
      $$('.pt', sketch).forEach(p => p.setAttribute('aria-pressed', picks.has(p.dataset.part) ? 'true' : 'false'));
      list.innerHTML = picks.size ? [...picks].map(([k, v]) => `<li><span><b>${esc(k)}</b> – ${esc(v)}</span><button type="button" data-rm="${esc(k)}" aria-label="${esc(k)} entfernen">×</button></li>`).join('') : '<li class="muted">Noch nichts markiert.</li>';
      const txt = picks.size ? 'Schadenskizze: ' + [...picks].map(([k, v]) => `${k} (${v})`).join(', ') : '';
      send.href = 'kontakt.html?thema=karosserie' + (txt ? '&details=' + encodeURIComponent(txt) : '');
    };
    const toggle = p => { const k = p.dataset.part; if (picks.has(k)) picks.delete(k); else picks.set(k, segVal(typ)); paint(); };
    $$('.pt', sketch).forEach(p => {
      p.addEventListener('click', () => toggle(p));
      p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(p); } });
    });
    list.addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) { picks.delete(b.dataset.rm); paint(); } });
    paint();
  }

  // ---------- Reifencode-Leser ----------
  const tire = $('[data-tire]');
  if (tire) {
    const LI = { 70: 335, 71: 345, 72: 355, 73: 365, 74: 375, 75: 387, 76: 400, 77: 412, 78: 425, 79: 437, 80: 450, 81: 462, 82: 475, 83: 487, 84: 500, 85: 515, 86: 530, 87: 545, 88: 560, 89: 580, 90: 600, 91: 615, 92: 630, 93: 650, 94: 670, 95: 690, 96: 710, 97: 730, 98: 750, 99: 775, 100: 800, 101: 825, 102: 850, 103: 875, 104: 900, 105: 925, 106: 950, 107: 975, 108: 1000, 109: 1030, 110: 1060, 111: 1090, 112: 1120, 113: 1150, 114: 1180, 115: 1215, 116: 1250, 117: 1285, 118: 1320, 119: 1360, 120: 1400 };
    const SI = { L: 120, M: 130, N: 140, P: 150, Q: 160, R: 170, S: 180, T: 190, U: 200, H: 210, V: 240, W: 270, Y: 300 };
    const inp = $('[data-tire-input]', tire), codeEl = $('[data-tire-code]', tire), out = $('[data-tire-out]', tire);
    const read = () => {
      const m = inp.value.toUpperCase().replace(/\s+/g, ' ').match(/(\d{3})\s*\/\s*(\d{2})\s*(Z?R|D|B)?\s*(\d{2})\s*(\d{2,3})?\s*([A-Z])?/);
      if (!m) { codeEl.innerHTML = ''; out.innerHTML = '<div><dt>Hinweis</dt><dd>Format z. B. 225/45 R17 94W<small>Breite / Querschnitt, Bauart und Felgengröße, Tragfähigkeit und Geschwindigkeit.</small></dd></div>'; return; }
      const [, b, q, bau, z, li, si] = m;
      const flanke = Math.round(b * q / 100), dm = Math.round(z * 25.4 + 2 * flanke);
      codeEl.innerHTML = [`${b}`, `/${q}`, ` ${bau || 'R'}${z}`, li ? ` ${li}` : '', si || ''].filter(Boolean).map((x, i) => `<span data-k="${i}">${esc(x.trim())}</span>`).join('');
      const rows = [
        ['Reifenbreite', `${b} mm`, 'von Flanke zu Flanke'],
        ['Querschnitt', `${q} %`, `Flankenhöhe ${flanke} mm (${q} % der Breite)`],
        ['Bauart & Felge', `${bau === 'D' ? 'Diagonal' : 'Radial'} · ${z} Zoll`, `Felgendurchmesser ${(z * 2.54).toFixed(1).replace('.', ',')} cm · Reifen gesamt ca. ${dm} mm`],
        li ? ['Tragfähigkeit', `${LI[li] ? LI[li].toLocaleString('de-DE') + ' kg' : 'Index ' + li}`, `Lastindex ${li}: so viel darf ein Reifen tragen`] : null,
        si ? ['Höchstgeschwindigkeit', SI[si] ? `${SI[si]} km/h` : `Index ${si}`, `Geschwindigkeitsindex ${si}${si === 'Y' ? ' (über 300 km/h bei „(Y)“ in Klammern)' : ''}`] : null,
      ].filter(Boolean);
      out.innerHTML = rows.map(r => `<div><dt>${r[0]}</dt><dd>${r[1]}<small>${r[2]}</small></dd></div>`).join('');
    };
    inp.addEventListener('input', read);
    $$('.tire-ex button', tire).forEach(b => b.addEventListener('click', () => { inp.value = b.textContent; read(); inp.focus(); }));
    read();
  }

  // ---------- Plaketten-Prüfer ----------
  const plak = $('[data-plak]');
  if (plak) {
    // Farbfolge der HU-Plakette (wiederholt sich alle 6 Jahre): 2023 rosa, 2024 grün, 2025 orange, 2026 blau, 2027 gelb, 2028 braun
    const FARBE = { rosa: '#f2a5c0', grün: '#5dae5a', orange: '#f28c28', blau: '#3d7fd6', gelb: '#f3d23b', braun: '#9a6b43' };
    const FOLGE = ['rosa', 'grün', 'orange', 'blau', 'gelb', 'braun'];
    const jetzt = new Date(), jahr = jetzt.getFullYear();
    const jahre = []; for (let y = jahr - 2; y <= jahr + 2; y++) jahre.push(y);
    const farbe = y => FOLGE[((y - 2023) % 6 + 6) % 6];
    const sw = $('[data-plak-year]', plak), svg = $('.plak-g', plak), yt = $('[data-plak-yeartxt]', plak), out = $('[data-plak-out]', plak);
    sw.innerHTML = jahre.map(y => `<button type="button" data-y="${y}" aria-pressed="${y === jahr ? 'true' : 'false'}"><i style="background:${FARBE[farbe(y)]}"></i>${farbe(y)} (${y})</button>`).join('');
    let Y = jahr, Mo = null;
    const MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    const paint = () => {
      svg.style.setProperty('--pl', FARBE[farbe(Y)]);
      yt.textContent = String(Y).slice(2);
      $$('.pm', svg).forEach(g => g.setAttribute('aria-pressed', +g.dataset.m === Mo ? 'true' : 'false'));
      // der gewählte Monat dreht nach oben (12 Uhr), wie auf der echten Plakette
      $('.pl-rot', svg).style.transform = Mo ? `rotate(${-(Mo - 1) * 30}deg)` : '';
      $$('.pm text', svg).forEach(t => { const m = +t.parentNode.dataset.m; t.setAttribute('transform', Mo ? `rotate(${(Mo - 1) * 30} ${t.getAttribute('x')} ${+t.getAttribute('y') - 5})` : ''); });
      if (!Mo) { out.className = 'plak-out'; out.innerHTML = '<b>Monat anklicken</b>Welche Zahl steht oben auf der Plakette (in 12-Uhr-Stellung)?'; return; }
      const ende = new Date(Y, Mo, 0), heute = new Date(jahr, jetzt.getMonth(), jetzt.getDate());
      const diff = (Y - jahr) * 12 + (Mo - 1 - jetzt.getMonth());
      const late = ende < heute;
      out.className = 'plak-out' + (late ? ' late' : '');
      const ueber = late ? Math.max(0, -diff) : 0;
      out.innerHTML = late
        ? `<b>Seit ${MON[Mo - 1]} ${Y} fällig</b>Die HU ist überzogen${ueber >= 2 ? ` (${ueber} Monate)` : ''}. Ab zwei Monaten Überziehung wird ein Verwarnungsgeld fällig, und die Prüfung wird um eine Ergänzungsuntersuchung erweitert. <a href="kontakt.html?thema=hu">Jetzt HU-Termin anfragen →</a>`
        : `<b>Fällig bis Ende ${MON[Mo - 1]} ${Y}</b>${diff <= 2 ? 'Das ist bald – ' : 'Noch '}${diff <= 0 ? 'in diesem Monat' : `in ${diff} Monat${diff === 1 ? '' : 'en'}`}. Die HU können Sie direkt bei uns machen lassen. <a href="kontakt.html?thema=hu">HU-Termin anfragen →</a>`;
    };
    sw.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; Y = +b.dataset.y; $$('button', sw).forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); paint(); });
    $$('.pm', svg).forEach(g => {
      g.addEventListener('click', () => { Mo = +g.dataset.m; paint(); });
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); Mo = +g.dataset.m; paint(); } });
    });
    paint();
  }

  // ---------- Pflege-Intervall ----------
  const care = $('[data-care]');
  if (care) {
    const q = k => segVal($(`[data-care-q="${k}"]`, care));
    const out = $('[data-care-out]', care);
    const run = () => {
      const draussen = q('park') === 'draussen', mit = q('mit'), km = q('km');
      let innen = mit === 'tiere' ? 3 : mit === 'kinder' ? 4 : 6;
      if (km === 'viel') innen = Math.max(2, innen - 1);
      const politur = draussen ? 12 : 24, versiegelung = draussen ? 6 : 12;
      out.innerHTML = [['Innenreinigung', `alle ${innen} Monate`, mit === 'tiere' ? 'Tierhaare setzen sich tief in Polster und Teppich' : mit === 'kinder' ? 'Krümel und Flecken lieber regelmäßig raus' : 'für ein gepflegtes Cockpit und frische Luft'],
        ['Versiegelung', `alle ${versiegelung} Monate`, draussen ? 'Laub, Vogelkot und Harz greifen ungeschützten Lack an' : 'in der Garage hält der Schutz länger'],
        ['Politur', `alle ${politur} Monate`, 'gegen feine Kratzer und Waschstraßen-Schleier']]
        .map(([t, v, d]) => `<div><span>${t}</span><b>${v}</b><span>${d}</span></div>`).join('');
    };
    $$('[data-care-q]', care).forEach(g => segPick(g, run));
    run();
  }
})();
