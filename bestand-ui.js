/* Euregio Motorcars – Bestand: Liste mit Filtern, Detailseite, Fahrzeugwahl im Formular, Marken-Register, Finanzierungs-Satz. */
(() => {
  const EM = window.EM; if (!EM) return;
  const { $, $$, esc, eur, eur2, pic, picSet } = EM;
  const params = new URLSearchParams(location.search);
  const kurz = t => String(t || '').replace(/\s*[-/]+\s*$/, '').replace(/\s+-\s+/g, ' · ');
  const echteFotos = f => (f.bilderAnzahl || f.bilder.length) > 1; // Inserate mit nur einem Bild zeigen meist das Hof-Übersichtsfoto
  const rateTxt = f => f.rate ? `ab ${eur(f.rate.monat)} mtl.` : '';
  const neu = f => f.erstellt && (Date.now() - new Date(f.erstellt)) < 7 * 864e5;

  const card = f => `<article class="cc"><a href="fahrzeug.html?id=${encodeURIComponent(f.id)}">
    <div class="cc-img"><img src="${pic(f.bilder[0], 640)}" alt="${esc(f.titel)}" loading="lazy" decoding="async" width="640" height="480">${f.bilder[1] ? `<img src="${pic(f.bilder[1], 640)}" alt="" loading="lazy" decoding="async" width="640" height="480">` : ''}</div>
    <div class="cc-body"><h3>${esc(kurz(f.titel))}</h3>
     <div class="cc-price"><b>${eur(f.preis)}</b><span>${rateTxt(f)}</span></div>
     <p class="cc-data">EZ ${esc(f.ez)} · ${esc(f.kmText)} · ${f.ps ? f.ps + ' PS' : ''} · ${esc(f.kraftstoff)}${f.getriebe ? ' · ' + esc(f.getriebe) : ''}</p></div></a></article>`;

  EM.bestand.then(b => {
    if (!b) return fail();
    const cars = b.fahrzeuge;
    if ($('[data-cars]')) liste(b, cars);
    if ($('[data-car]')) detail(b, cars);
    $$('[data-carpick]').forEach(el => carpick(el, cars));
    if ($('[data-marken]')) marken(cars);
    if ($('[data-fin-sentence]')) finSatz(b, cars);
    if ($('[data-quick]')) quick(cars);
  });
  function fail() {
    const t = 'Der Bestand kann gerade nicht geladen werden. Alle Fahrzeuge finden Sie auf unserer <a href="https://home.mobile.de/EUREGIOMOTORCARSGMBH">Händlerseite bei mobile.de</a>.';
    $$('[data-cars], [data-marken], [data-carpick], .gal-main, .hof-stage').forEach(el => el.innerHTML = `<p class="muted">${t}</p>`);
    const rc = $('[data-result-count]'); if (rc) rc.textContent = '';
  }

  // ---------- Liste mit Filtern ----------
  function liste(b, cars) {
    const form = $('[data-filters]'), out = $('[data-cars]'), rc = $('[data-result-count]'), reset = $('[data-reset]');
    const st = $('[data-stand-short]'); if (st) st.textContent = '· ' + EM.standText(b) + ' · Quelle mobile.de';
    // Marken-Knöpfe
    const counts = {}; cars.forEach(f => counts[f.marke] = (counts[f.marke] || 0) + 1);
    const makes = Object.keys(counts).sort((a, c) => counts[c] - counts[a] || a.localeCompare(c));
    const mk = $('[data-f-makes]');
    mk.innerHTML = `<button type="button" data-make="" aria-pressed="true">Alle <small>${cars.length}</small></button>` + makes.map(m => `<button type="button" data-make="${esc(m)}" aria-pressed="false">${esc(m)} <small>${counts[m]}</small></button>`).join('');
    // Auswahllisten aus den Daten
    $$('[data-f-opt]', form).forEach(sel => {
      const k = sel.dataset.fOpt; const vals = [...new Set(cars.map(f => f[k]).filter(Boolean))].sort();
      sel.insertAdjacentHTML('beforeend', vals.map(v => `<option>${esc(v)}</option>`).join(''));
    });
    const state = { make: params.get('marke') || '' };
    ['preis', 'kraftstoff', 'getriebe', 'kategorie', 'sort', 'q'].forEach(k => { if (params.get(k) && form.elements[k]) form.elements[k].value = params.get(k); });
    const render = () => {
      const v = k => (form.elements[k].value || '').trim();
      const [pmin, pmax] = (v('preis') || '0-99999999').split('-').map(Number);
      const q = v('q').toLowerCase();
      let r = cars.filter(f => (!state.make || f.marke === state.make) && f.preis >= pmin && f.preis <= pmax &&
        (!v('kraftstoff') || f.kraftstoff === v('kraftstoff')) && (!v('getriebe') || f.getriebe === v('getriebe')) && (!v('kategorie') || f.kategorie === v('kategorie')) &&
        (!q || [f.titel, f.marke, f.modell, f.kategorie, f.farbe, ...(f.highlights || [])].join(' ').toLowerCase().includes(q)));
      const ez = f => { const [m, y] = (f.ez || '0/0').split('/'); return +y * 12 + +m; };
      const s = v('sort');
      r.sort(s === 'preis-auf' ? (a, c) => a.preis - c.preis : s === 'preis-ab' ? (a, c) => c.preis - a.preis : s === 'km-auf' ? (a, c) => a.km - c.km : s === 'ez-ab' ? (a, c) => ez(c) - ez(a) : (a, c) => echteFotos(c) - echteFotos(a));
      out.innerHTML = r.length ? r.map(card).join('') : `<div class="empty"><h3>Kein Auto passt zu diesen Filtern.</h3><p>Probieren Sie eine andere Preisstufe – oder <a href="kontakt.html?thema=fahrzeug">sagen Sie uns, was Sie suchen</a>.</p></div>`;
      rc.textContent = r.length === cars.length ? `${cars.length} Fahrzeuge` : `${r.length} von ${cars.length} Fahrzeugen`;
      const active = state.make || v('preis') || v('kraftstoff') || v('getriebe') || v('kategorie') || q;
      reset.hidden = !active;
      $$('button', mk).forEach(btn => btn.setAttribute('aria-pressed', btn.dataset.make === state.make ? 'true' : 'false'));
      // Adresse mitführen, damit Filter teilbar sind
      const p = new URLSearchParams();
      if (state.make) p.set('marke', state.make);
      ['preis', 'kraftstoff', 'getriebe', 'kategorie', 'q'].forEach(k => v(k) && p.set(k, v(k)));
      if (v('sort') && v('sort') !== 'neu') p.set('sort', v('sort'));
      history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : ''));
      $$('.cc', out).forEach(EM.tilt);
      if (EM.motion) gsap.fromTo($$('.cc', out).slice(0, 12), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .5, stagger: .04, ease: 'power3.out', overwrite: true });
      window.ScrollTrigger && ScrollTrigger.refresh();
    };
    mk.addEventListener('click', e => { const btn = e.target.closest('button'); if (!btn) return; state.make = btn.dataset.make; render(); });
    form.addEventListener('input', render); form.addEventListener('change', render);
    reset.addEventListener('click', () => { state.make = ''; form.reset(); render(); });
    render();
  }

  // ---------- Detailseite ----------
  function detail(b, cars) {
    const id = params.get('id');
    const f = cars.find(x => x.id === id);
    const root = $('[data-car]');
    const set = (k, h) => { const el = $(`[data-c="${k}"]`, root); if (el) el.innerHTML = h; return el; };
    if (!f) {
      root.innerHTML = `<div class="wrap sold"><p class="kicker">Nicht mehr im Bestand</p><h1>Dieses Auto ist verkauft oder reserviert.</h1>
       <p class="lead">Der Bestand ändert sich jede Woche. Vielleicht passt eines dieser Autos – oder wir suchen für Sie.</p>
       <div class="btns"><a class="btn mag" href="fahrzeuge.html">Zum aktuellen Bestand</a><a class="btn ghost mag" href="kontakt.html?thema=fahrzeug">Suchauftrag schicken</a></div>
       <div class="grid-cars small" style="margin-top:48px">${cars.slice(0, 4).map(card).join('')}</div></div>`;
      $$('.mag', root).forEach(EM.magnet);
      return;
    }
    document.title = `${kurz(f.titel)} – ${eur(f.preis)} | Euregio Motorcars Stolberg`;
    set('kategorie', esc(f.kategorie));
    set('titel', esc(kurz(f.titel)));
    set('preis', eur(f.preis));
    set('rate', f.rate ? `Finanzierung ${rateTxt(f)} · <a href="#fin">Beispiel ansehen</a>` : (f.preisBewertung ? esc(f.preisBewertung) + ' laut mobile.de' : ''));
    const rows = [['Erstzulassung', f.ez], ['Kilometer', f.kmText], ['Leistung', f.leistung], ['Kraftstoff', f.kraftstoff], ['Getriebe', f.getriebe], ['Farbe', f.farbe],
      ['Vorbesitzer', f.vorbesitzer], ['Türen / Sitze', [f.tueren, f.sitze].filter(Boolean).join(' / ')], ['Hubraum', f.hubraum], ['Schadstoffklasse', f.schadstoff], ['Verbrauch (komb.)', f.verbrauch], ['Zustand', f.unfallfrei ? 'unfallfrei laut Inserat' : '']]
      .filter(r => r[1] !== '' && r[1] != null);
    set('daten', rows.map(r => `<div><dt>${r[0]}</dt><dd>${esc(r[1])}</dd></div>`).join(''));
    $('[data-c="probefahrt"]').href = `probefahrt.html?fahrzeug=${encodeURIComponent(f.id)}`;
    $('[data-c="wa"]').href = `https://wa.me/4915772567022?text=${encodeURIComponent(`Hallo, ich interessiere mich für den ${kurz(f.titel)} (${eur(f.preis)}), Inserat ${f.id}.`)}`;
    $('[data-c="mobile"]').href = f.url;
    set('highlights', (f.highlights || []).map(h => `<span>${esc(kurz(h))}</span>`).join(''));
    set('merkmale', f.merkmale && f.merkmale.length ? f.merkmale.map(m => `<li>${esc(m)}</li>`).join('') : `<li class="muted">Die vollständige Ausstattungsliste steht im <a href="${esc(f.url)}" target="_blank" rel="noopener">Inserat auf mobile.de</a> – oder fragen Sie uns direkt.</li>`);
    if (f.beschreibung) set('beschreibung', esc(f.beschreibung)); else $('[data-c="beschreibung-wrap"]').remove();
    if (f.rate) {
      const r = f.rate;
      set('fin', `<h2 id="fin">Finanzierungsbeispiel</h2><dl>
        <dt>Kaufpreis</dt><dd>${eur(f.preis)}</dd><dt>Anzahlung</dt><dd>${eur(r.anzahlung)}</dd><dt>Nettodarlehensbetrag</dt><dd>${eur2(r.kredit)}</dd>
        <dt>Laufzeit</dt><dd>${r.laufzeit} Monate</dd><dt>Sollzins (gebunden) p. a.</dt><dd>${String(r.sollzins).replace('.', ',')} %</dd><dt>Effektiver Jahreszins</dt><dd>${String(r.effzins).replace('.', ',')} %</dd>
        <dt>Monatsrate</dt><dd>${eur(r.monat)}</dd>${r.art === 'Ballonfinanzierung' ? `<dt>Schlussrate</dt><dd>${eur2(r.schlussrate)}</dd>` : ''}<dt>Gesamtbetrag</dt><dd>${eur2(r.gesamt)}</dd></dl>
        <p class="muted small">${esc(r.hinweis || (b.hinweise && b.hinweise[r.bank]) || '')}</p>
        <a class="linkbtn" href="finanzierung.html?fahrzeug=${encodeURIComponent(f.id)}#werkzeug">Andere Anzahlung oder Laufzeit rechnen →</a>`);
    } else $('[data-c="fin"]').remove();
    // Galerie
    const main = $('.gal-main'), thumbs = $('[data-gal-thumbs]'), cnt = $('[data-gal-count]');
    const imgs = f.bilder;
    main.innerHTML = imgs.map((u, i) => `<img ${i < 2 ? `src="${pic(u, 1024)}"` : `data-src="${pic(u, 1024)}"`} srcset="" sizes="(max-width: 900px) 100vw, 60vw" alt="${esc(kurz(f.titel))} – Foto ${i + 1} von ${imgs.length}" width="1024" height="768" ${i ? '' : 'class="on" fetchpriority="high"'}>`).join('');
    $$('img', main).forEach((im, i) => { if (picSet(imgs[i])) im.dataset.srcset = picSet(imgs[i]); if (i < 2 && im.dataset.srcset) im.srcset = im.dataset.srcset; });
    thumbs.innerHTML = imgs.map((u, i) => `<button type="button" aria-label="Foto ${i + 1}" ${i ? '' : 'aria-current="true"'}><img src="${pic(u, 240)}" alt="" loading="lazy" width="240" height="180"></button>`).join('');
    let cur = 0;
    const show = i => {
      cur = (i + imgs.length) % imgs.length;
      const ims = $$('img', main);
      [cur, (cur + 1) % imgs.length].forEach(k => { const im = ims[k]; if (im.dataset.src) { im.src = im.dataset.src; if (im.dataset.srcset) im.srcset = im.dataset.srcset; delete im.dataset.src; } });
      ims.forEach((im, k) => im.classList.toggle('on', k === cur));
      $$('button', thumbs).forEach((t, k) => t.setAttribute('aria-current', k === cur ? 'true' : 'false'));
      const tb = $$('button', thumbs)[cur]; tb && tb.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      cnt.textContent = `${cur + 1} / ${imgs.length}`;
    };
    $('.gal-prev').addEventListener('click', () => show(cur - 1));
    $('.gal-next').addEventListener('click', () => show(cur + 1));
    thumbs.addEventListener('click', e => { const t = e.target.closest('button'); if (t) show($$('button', thumbs).indexOf(t)); });
    main.addEventListener('keydown', e => { if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });
    let sx = null; main.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
    main.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); sx = null; });
    show(0);
    // Ähnliche Fahrzeuge
    const sim = cars.filter(x => x.id !== f.id).map(x => ({ x, s: (x.marke === f.marke ? 0 : 1) + Math.abs(x.preis - f.preis) / 15000 })).sort((a, c) => a.s - c.s).slice(0, 4).map(o => o.x);
    $('[data-similar]').innerHTML = sim.map(card).join('');
    $$('.cc', root).forEach(EM.tilt);
    // strukturierte Daten fürs Auto
    const ld = document.createElement('script'); ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Car', name: kurz(f.titel), brand: { '@type': 'Brand', name: f.marke }, model: f.modell,
      mileageFromOdometer: { '@type': 'QuantitativeValue', value: f.km, unitCode: 'KMT' }, image: pic(imgs[0], 1024),
      offers: { '@type': 'Offer', price: f.preis, priceCurrency: 'EUR', availability: 'https://schema.org/InStock', seller: { '@id': 'https://www.euregio-motorcars.de/#firma' } } });
    document.head.appendChild(ld);
  }

  // ---------- Fahrzeugwahl im Formular ----------
  function carpick(el, cars) {
    const form = el.closest('form');
    const pre = params.get('fahrzeug');
    const list = cars.filter(echteFotos).concat(cars.filter(f => !echteFotos(f)));
    el.innerHTML = `<label class="cp cp-none"><input type="radio" name="fahrzeugwahl" value="" ${pre ? '' : 'checked'}><span><b>Noch offen / anderes Auto</b></span></label>` +
      list.map(f => `<label class="cp"><input type="radio" name="fahrzeugwahl" value="${esc(f.id)}" ${pre === f.id ? 'checked' : ''}><span><img src="${pic(f.bilder[0], 240)}" alt="" loading="lazy" width="240" height="180"><b>${esc(kurz(f.titel))}</b><small>${eur(f.preis)}</small></span></label>`).join('');
    const hidden = $('input[name="fahrzeug"]', form), wa = $('[data-wa]', form);
    const upd = () => {
      const id = ($('input[name="fahrzeugwahl"]:checked', el) || {}).value;
      const f = cars.find(x => x.id === id);
      hidden.value = f ? `${kurz(f.titel)} · ${eur(f.preis)} · Inserat ${f.id}` : '';
      if (wa) wa.href = 'https://wa.me/4915772567022?text=' + encodeURIComponent(f ? `Hallo, ich möchte eine Probefahrt mit dem ${kurz(f.titel)} (${eur(f.preis)}) vereinbaren.` : 'Hallo, ich möchte eine Probefahrt vereinbaren.');
    };
    el.addEventListener('change', upd); upd();
    const sel = $('input:checked', el); if (sel && pre) setTimeout(() => sel.closest('.cp').scrollIntoView({ block: 'nearest', inline: 'center' }), 300);
  }

  // ---------- Marken-Register (Startseite) ----------
  function marken(cars) {
    const counts = {}; cars.forEach(f => counts[f.marke] = (counts[f.marke] || 0) + 1);
    const makes = Object.keys(counts).sort((a, c) => counts[c] - counts[a] || a.localeCompare(c));
    const max = Math.max(...Object.values(counts));
    const ul = $('[data-marken]');
    ul.innerHTML = makes.map(m => `<li><a href="fahrzeuge.html?marke=${encodeURIComponent(m)}"><span class="mk-name">${esc(m)}</span><span class="mk-bar" aria-hidden="true"><i style="--v:${(counts[m] / max).toFixed(3)}"></i></span><span class="mk-n">${counts[m]}</span><span class="ar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></a></li>`).join('');
    const steps = [['0-15000', 'bis 15.000 €'], ['15000-25000', '15.000–25.000 €'], ['25000-35000', '25.000–35.000 €'], ['35000-999999', 'ab 35.000 €']];
    $('[data-preise]').innerHTML = steps.map(([k, t]) => { const [a, c] = k.split('-').map(Number); const n = cars.filter(f => f.preis >= a && f.preis <= c).length; return n ? `<a href="fahrzeuge.html?preis=${k}">${t} <small>${n} Autos</small></a>` : ''; }).join('');
    if (EM.motion) {
      $$('li', ul).forEach((li, i) => {
        const bar = $('.mk-bar i', li), v = +bar.style.getPropertyValue('--v');
        gsap.fromTo($('.mk-name', li), { x: -40, opacity: 0 }, { x: 0, opacity: 1, ease: 'power3.out', scrollTrigger: { trigger: li, start: 'top 92%', end: 'top 62%', scrub: .6 } });
        gsap.fromTo(bar, { scaleX: 0 }, { scaleX: v, ease: 'none', scrollTrigger: { trigger: li, start: 'top 90%', end: 'top 55%', scrub: .6 } });
      });
      ScrollTrigger.refresh();
    }
  }

  // ---------- Schnellsuche im Einstieg ----------
  function quick(cars) {
    const f = $('[data-quick]'), n = $('[data-quick-n]', f);
    const fillSel = (sel, key) => {
      const c = {}; cars.forEach(x => x[key] && (c[x[key]] = (c[x[key]] || 0) + 1));
      Object.keys(c).sort((a, b) => c[b] - c[a] || a.localeCompare(b)).forEach(k => sel.insertAdjacentHTML('beforeend', `<option value="${esc(k)}">${esc(k)} (${c[k]})</option>`));
    };
    fillSel($('[data-quick-make]', f), 'marke'); fillSel($('[data-quick-kat]', f), 'kategorie');
    const count = () => {
      const m = f.elements.marke.value, k = f.elements.kategorie.value, [a, c] = (f.elements.preis.value || '0-99999999').split('-').map(Number);
      const r = cars.filter(x => (!m || x.marke === m) && (!k || x.kategorie === k) && x.preis >= a && x.preis <= c).length;
      n.textContent = r;
      $('button', f).disabled = !r;
    };
    f.addEventListener('change', count); count();
    // leere Felder nicht in die Adresse schreiben
    f.addEventListener('submit', () => [...f.elements].forEach(el => { if (el.name && !el.value) el.disabled = true; }));
    addEventListener('pageshow', () => { [...f.elements].forEach(el => { if (el.tagName === 'SELECT') el.disabled = false; }); count(); });
  }

  // ---------- Finanzierung in einem Satz (Startseite) ----------
  function finSatz(b, cars) {
    const pool = cars.filter(f => f.rate && echteFotos(f)).sort((a, c) => c.preis - a.preis);
    const pick = [pool[0], pool[Math.floor(pool.length / 3)], pool[Math.floor(pool.length * 2 / 3)], pool[pool.length - 1]].filter((x, i, a) => x && a.indexOf(x) === i);
    if (!pick.length) return;
    const sw = $('[data-fin-switch]'), s = $('[data-fin-sentence]'), legal = $('[data-fin-legal]'), ph = $('[data-fin-photo]');
    sw.innerHTML = pick.map((f, i) => `<button type="button" aria-pressed="${i ? 'false' : 'true'}" data-i="${i}">${esc(f.marke)} ${esc(f.modell)}</button>`).join('');
    const show = i => {
      const f = pick[i], r = f.rate;
      $$('button', sw).forEach((x, k) => x.setAttribute('aria-pressed', k === i ? 'true' : 'false'));
      const go = () => {
        s.innerHTML = `Der <em>${esc(f.marke)} ${esc(f.modell)}</em> für ${eur(f.preis)} – ab <em>${eur(r.monat)}</em> im Monat.`;
        legal.textContent = `Beispiel laut Inserat: Anzahlung ${eur(r.anzahlung)}, Nettodarlehensbetrag ${eur2(r.kredit)}, ${r.laufzeit} Monate, Sollzins ${String(r.sollzins).replace('.', ',')} % p. a. (gebunden), effektiver Jahreszins ${String(r.effzins).replace('.', ',')} %, ${r.laufzeit - 1} Raten à ${eur2(r.monat)}${r.art === 'Ballonfinanzierung' ? `, Schlussrate ${eur2(r.schlussrate)}` : ''}, Gesamtbetrag ${eur2(r.gesamt)}. ${(b.hinweise && b.hinweise[r.bank]) || r.hinweis || ''}`;
        ph.innerHTML = `<a href="fahrzeug.html?id=${encodeURIComponent(f.id)}" aria-label="${esc(kurz(f.titel))} ansehen"><img src="${pic(f.bilder[0], 1024)}" srcset="${picSet(f.bilder[0])}" sizes="(max-width: 900px) 100vw, 50vw" alt="${esc(kurz(f.titel))}" width="1024" height="768" loading="lazy"></a>`;
        if (EM.motion) { gsap.fromTo([s, ph], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .45, ease: 'power3.out', stagger: .06 });
          gsap.fromTo($('img', ph), { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: ph, start: 'top bottom', end: 'bottom top', scrub: .6 } }); }
      };
      if (EM.motion && s.textContent.includes('€')) gsap.to([s, ph], { opacity: 0, y: -8, duration: .16, ease: 'power2.in', onComplete: go }); else go();
    };
    sw.addEventListener('click', e => { const x = e.target.closest('button'); if (x) show(+x.dataset.i); });
    show(0);
  }
})();
