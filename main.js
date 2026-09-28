/* Euregio Motorcars – gemeinsames Skript. GSAP + ScrollTrigger + Lenis (CDN).
   Tweens nur auf transform/opacity; Blenden per clip-path/mask. Bestand aus data/bestand.js. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const motion = !reduce && hasGsap;
  root.classList.add(motion ? 'js-motion' : 'no-motion');
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const eur = n => n == null ? '' : Math.round(n).toLocaleString('de-DE') + ' €';
  const eur2 = n => n == null ? '' : n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  // Fotos vom mobile.de-Bildserver in passender Größe
  const pic = (u, size = 640) => !u ? '' : /classistatic\.de\/api/.test(u) ? `${u}?rule=mo-${size}` : u;
  const picSet = u => /classistatic\.de\/api/.test(u || '') ? `${pic(u, 640)} 640w, ${pic(u, 1024)} 1024w, ${pic(u, 1600)} 1600w` : '';

  // ---------- Bestand laden (auch ohne Server lauffähig) ----------
  const voll = document.body.dataset.bestand === 'voll';
  const bestand = new Promise(res => {
    if (window.EM_BESTAND) return res(window.EM_BESTAND);
    const s = document.createElement('script');
    s.src = `data/${voll ? 'bestand-voll' : 'bestand'}.js?t=${Math.floor(Date.now() / 300000)}`; // alle 5 Minuten frisch
    s.onload = () => res(window.EM_BESTAND || null);
    s.onerror = () => res(null);
    document.head.appendChild(s);
  });
  const standText = b => {
    const d = new Date(b.stand);
    return `Stand ${d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}, ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr`;
  };
  bestand.then(b => {
    if (!b) { $$('[data-stand]').forEach(el => el.textContent = 'Bestand derzeit nicht erreichbar – siehe mobile.de.'); return; }
    $$('[data-live-count]').forEach(el => el.textContent = b.anzahl);
    $$('[data-live-count-text]').forEach(el => el.textContent = b.anzahl + ' Autos im Bestand');
    $$('[data-stand]').forEach(el => el.textContent = `Bestand: ${b.anzahl} Fahrzeuge · ${standText(b)} · Quelle mobile.de`);
  });

  // ---------- Öffnungszeiten (echte Zeiten, keine erfundene Anzeige) ----------
  const ZEITEN = { 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: [9, 14] };
  const TAGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const openState = (now = new Date()) => {
    // Uhrzeit in Deutschland, unabhängig von der Zeitzone des Besuchers
    const de = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
    const d = de.getDay(), h = de.getHours() + de.getMinutes() / 60;
    const z = ZEITEN[d];
    if (z && h >= z[0] && h < z[1]) return { open: true, text: `Geöffnet bis ${z[1]}:00 Uhr` };
    for (let i = 0; i < 8; i++) {
      const dd = (d + i) % 7, zz = ZEITEN[dd];
      if (!zz) continue;
      if (i === 0 && h < zz[0]) return { open: false, text: `Öffnet heute ${zz[0]}:00 Uhr` };
      if (i === 1) return { open: false, text: `Öffnet morgen ${zz[0]}:00 Uhr` };
      if (i > 1) return { open: false, text: `Öffnet ${TAGE[dd]} ${zz[0]}:00 Uhr` };
    }
    return { open: false, text: 'Mo–Fr 9–19, Sa 9–14 Uhr' };
  };
  const paintOpen = () => { const o = openState(); $$('[data-open-state]').forEach(el => { el.textContent = o.text; el.classList.toggle('is-open', o.open); }); };
  paintOpen(); setInterval(paintOpen, 60000);

  // ---------- Lenis, gekoppelt an ScrollTrigger ----------
  let lenis;
  if (motion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ---------- Kopfzeile ----------
  const head = $('#head');
  const dds = $$('.has-dd');
  const setDd = (li, open) => { li.classList.toggle('open', open); $('button', li).setAttribute('aria-expanded', open ? 'true' : 'false'); };
  const closeDds = except => dds.forEach(li => li !== except && setDd(li, false));
  dds.forEach(li => {
    const b = $('button', li);
    b.addEventListener('click', () => { const o = !li.classList.contains('open'); closeDds(li); setDd(li, o); });
    if (fine) { li.addEventListener('mouseenter', () => { closeDds(li); setDd(li, true); }); li.addEventListener('mouseleave', () => setDd(li, false)); }
    li.addEventListener('focusout', e => { if (!li.contains(e.relatedTarget)) setDd(li, false); });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.has-dd')) closeDds(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { const o = dds.find(li => li.classList.contains('open')); if (o) { setDd(o, false); $('button', o).focus(); } } });
  const sceneEl = $('.hero');
  const overStart = head.classList.contains('over');
  let lastY = scrollY;
  const onScrollHead = () => {
    const y = scrollY;
    const overZone = overStart && sceneEl && y < sceneEl.offsetHeight - 80;
    if (overStart) head.classList.toggle('over', !!overZone && !document.body.classList.contains('menu-open'));
    if (!document.body.classList.contains('menu-open') && !dds.some(li => li.classList.contains('open'))) {
      if (!overZone && y > 300 && y > lastY + 6 && y - lastY < 400) head.classList.add('hide');
      else if (y < lastY - 6 || overZone || y < 300) head.classList.remove('hide');
    }
    document.body.classList.toggle('hide-head', head.classList.contains('hide'));
    lastY = y;
    const sc = $('.sticky-cta');
    if (sc) sc.classList.toggle('show', y > (sceneEl ? sceneEl.offsetHeight * .8 : 480) && !nearEnd() && !blockers.size);
  };
  // Leiste unten nicht über Hof-Preisschild, Formularen und Abschluss legen
  const blockers = new Set();
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => { es.forEach(en => en.isIntersecting ? blockers.add(en.target) : blockers.delete(en.target)); onScrollHead(); }, { rootMargin: '0px 0px -10% 0px' });
    addEventListener('DOMContentLoaded', () => $$('.hof, .form, .cta-end, .calc-out, .car-actions, .filters').forEach(el => io.observe(el)));
  }
  const nearEnd = () => scrollY + innerHeight > document.documentElement.scrollHeight - 700;
  addEventListener('scroll', onScrollHead, { passive: true });
  onScrollHead();

  // ---------- Menü (Handy) ----------
  const menu = $('#menu'), menuBtn = $('.menu-btn');
  $$('li', menu).forEach((li, i) => li.style.setProperty('--i', i));
  let lastFocus;
  const closeMenu = () => {
    if (!menu.classList.contains('open')) return;
    document.body.classList.remove('menu-open'); menu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false'); $('.lbl', menuBtn).textContent = 'Menü';
    lenis && lenis.start(); onScrollHead(); lastFocus && lastFocus.focus();
  };
  const openMenu = () => {
    lastFocus = document.activeElement;
    document.body.classList.add('menu-open'); menu.classList.add('open'); head.classList.remove('hide'); head.classList.remove('over');
    menuBtn.setAttribute('aria-expanded', 'true'); $('.lbl', menuBtn).textContent = 'Schließen';
    lenis && lenis.stop(); setTimeout(() => $('a', menu).focus(), 350);
  };
  menuBtn.addEventListener('click', () => menu.classList.contains('open') ? closeMenu() : openMenu());
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); menuBtn.focus(); }
    if (e.key === 'Tab' && menu.classList.contains('open')) {
      const f = $$('a', menu); const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); menuBtn.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); menuBtn.focus(); }
      else if (!e.shiftKey && document.activeElement === menuBtn) { e.preventDefault(); first.focus(); }
    }
  });
  addEventListener('resize', () => { if (innerWidth > 1020) closeMenu(); });

  // ---------- Wort-für-Wort ----------
  $$('.split').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', words.join(' '));
    el.innerHTML = words.map(w => `<span class="split-line" aria-hidden="true"><span class="w">${esc(w)}</span></span>`).join(' ');
  });

  // ---------- Vorhang: Intro beim ersten Besuch, Blende beim Seitenwechsel ----------
  let seen = false; try { seen = sessionStorage.getItem('em-intro'); } catch (e) {}
  const intro = $('.curtain.intro');
  let introDelay = 0;
  if (!seen && motion) {
    try { sessionStorage.setItem('em-intro', '1'); } catch (e) {}
    document.body.classList.add('intro-on');
    const roof = $('.roof', intro), lw = $('.lw', intro), ls = $('.ls', intro);
    gsap.to(roof, { strokeDashoffset: 0, duration: .8, ease: 'power2.inOut' });
    gsap.fromTo([lw, ls], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .45, stagger: .1, delay: .35, ease: 'power3.out' });
    gsap.to(intro, { yPercent: -101, duration: .7, ease: 'power3.inOut', delay: 1.15, onComplete: () => document.body.classList.remove('intro-on') });
    introDelay = 1.4;
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a || !motion) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:') || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.defaultPrevented) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash && url.search === location.search)) return;
    e.preventDefault(); document.body.classList.add('leaving'); setTimeout(() => location.href = a.href, 420);
  });
  addEventListener('pageshow', e => { if (e.persisted) document.body.classList.remove('leaving'); });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href');
    if (id === '#') { e.preventDefault(); lenis ? lenis.scrollTo(0) : scrollTo({ top: 0 }); return; }
    const t = document.querySelector(id); if (!t) return; e.preventDefault();
    lenis ? lenis.scrollTo(t, { offset: -80, duration: 1.3 }) : t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });
  if (location.hash) {
    const t = document.querySelector(location.hash);
    if (t) addEventListener('load', () => setTimeout(() => { hasGsap && ScrollTrigger.refresh(); lenis ? lenis.scrollTo(t, { offset: -80, immediate: true }) : t.scrollIntoView(); head.classList.remove('hide'); }, 80));
  }

  // ---------- Fortschrittsbalken ----------
  if (hasGsap) gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

  // ---------- Magnetische Buttons mit Lichtreflex ----------
  const magnet = b => {
    if (!fine || !motion || b._mag) return; b._mag = 1;
    const xTo = gsap.quickTo(b, 'x', { duration: .4, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: .4, ease: 'power3' });
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top; b.style.setProperty('--mx', x + 'px'); b.style.setProperty('--my', y + 'px'); xTo((x - r.width / 2) * .18); yTo((y - r.height / 2) * .28); });
    b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  };
  $$('.mag').forEach(magnet);
  // 3D-Neigung auf Karten
  const tilt = c => {
    if (!fine || !motion || c._tilt) return; c._tilt = 1;
    const rx = gsap.quickTo(c, 'rotationX', { duration: .5, ease: 'power3' }), ry = gsap.quickTo(c, 'rotationY', { duration: .5, ease: 'power3' });
    gsap.set(c, { transformPerspective: 900 });
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 5); rx(-((e.clientY - r.top) / r.height - .5) * 5); });
    c.addEventListener('pointerleave', () => { rx(0); ry(0); });
  };

  // ---------- Reveals ----------
  const reveal = () => {
    if (!motion) return;
    $$('.split').forEach(el => {
      if (el._rv) return; el._rv = 1;
      gsap.to($$('.w', el), { y: 0, duration: .9, ease: 'power4.out', stagger: .045, delay: el.closest('.hofkopf') ? introDelay + .15 : 0,
        scrollTrigger: el.closest('.hofkopf') ? null : { trigger: el, start: 'top 88%', once: true } });
    });
    $$('.lead, .kicker, .sec-head p, .svc-list li, .sa-list li, .ticks li, .facts div, .qa, .rg-list li, .form, .cols2 > div, .tool-head, .quotes figure, .contact-list li, .price-steps').forEach(el => {
      if (el._rv || el.closest('.hero') || el.closest('.hof') || el.closest('.menu')) return; el._rv = 1;
      el.classList.add('rv');
      gsap.to(el, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', delay: el.closest('.hofkopf') ? introDelay + .3 : 0,
        scrollTrigger: el.closest('.hofkopf') ? null : { trigger: el, start: 'top 92%', once: true } });
    });
  };
  if (hasGsap && !motion) $$('.split .w').forEach(w => w.style.transform = 'none');

  // ---------- Seitenkopf: aktuelles Auto aus dem Bestand statt festem Foto ----------
  bestand.then(b => {
    if (!b) return;
    const pool = b.fahrzeuge.filter(f => (f.bilderAnzahl || f.bilder.length) > 1);
    $$('[data-live-photo]').forEach(fig => {
      if (!pool.length) return;
      const f = pool[+fig.dataset.livePhoto % pool.length];
      const im = $('img', fig), cap = $('figcaption', fig);
      const kurz = String(f.titel).replace(/\s*[-/]+\s*$/, '').replace(/\s+-\s+/g, ' · ');
      const pre = new Image(); pre.src = pic(f.bilder[0], 1024);
      pre.onload = () => {
        im.style.opacity = 0;
        setTimeout(() => { im.src = pre.src; im.srcset = picSet(f.bilder[0]); im.alt = kurz + ' auf dem Hof von Euregio Motorcars'; im.style.opacity = 1; }, 180);
        cap.innerHTML = `Gerade im Bestand: <a href="fahrzeug.html?id=${encodeURIComponent(f.id)}">${esc(kurz)} · ${eur(f.preis)}</a>`; cap.hidden = false;
      };
    });
  });

  // ---------- Karte erst auf Klick ----------
  $$('[data-map]').forEach(m => $('.map-load', m).addEventListener('click', () => {
    const lat = +m.dataset.lat, lon = +m.dataset.lon, d = .006;
    m.innerHTML = `<iframe title="Karte: Eschweilerstraße 167, Stolberg" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=${lon - d},${lat - d * .6},${lon + d},${lat + d * .6}&layer=mapnik&marker=${lat},${lon}"></iframe>`;
  }));

  // ---------- Formulare ----------
  const params = new URLSearchParams(location.search);
  $$('form.form').forEach(f => {
    const th = $('[data-thema]', f);
    if (th && params.get('thema') && $(`option[value="${CSS.escape(params.get('thema'))}"]`, th)) th.value = params.get('thema');
    const nachricht = $('textarea[name="nachricht"]', f);
    if (nachricht && params.get('details')) nachricht.value = params.get('details');
    // Tage und Uhrzeiten aus den echten Öffnungszeiten
    const days = $('[data-days]', f), times = $('[data-times]', f);
    if (days && times) {
      const opts = []; const t = new Date();
      for (let i = 1; opts.length < 12 && i < 21; i++) {
        const d = new Date(t); d.setDate(t.getDate() + i);
        if (!ZEITEN[d.getDay()]) continue;
        opts.push(`<option value="${d.toISOString().slice(0, 10)}" data-dow="${d.getDay()}">${d.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' })}</option>`);
      }
      days.innerHTML = '<option value="">Tag wählen</option>' + opts.join('');
      const fillTimes = () => {
        const o = days.selectedOptions[0]; const z = o && o.dataset.dow ? ZEITEN[o.dataset.dow] : null;
        const list = [];
        if (z) for (let h = z[0]; h < z[1]; h++) { list.push(`${h}:00`); if (h + .5 < z[1] - .5) list.push(`${h}:30`); }
        times.innerHTML = z ? '<option value="">Uhrzeit</option>' + list.map(x => `<option>${x} Uhr</option>`).join('') : '<option value="">erst Tag wählen</option>';
      };
      days.addEventListener('change', fillTimes); fillTimes();
    }
    f.addEventListener('submit', e => {
      const err = $('.form-err', f);
      const bad = $$('[required]', f).filter(i => i.type === 'checkbox' ? !i.checked : !i.value.trim() || (i.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value)));
      $$('[aria-invalid]', f).forEach(i => i.removeAttribute('aria-invalid'));
      if ($('[name="firma_web"]', f).value) { e.preventDefault(); return; }
      if (bad.length) {
        e.preventDefault(); bad.forEach(i => i.setAttribute('aria-invalid', 'true'));
        err.hidden = false; err.textContent = 'Bitte Name, eine gültige E-Mail-Adresse und die Einwilligung ergänzen.'; bad[0].focus();
        return;
      }
      if (location.protocol === 'file:' || /github\.io$/.test(location.hostname) || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        // Vorschau ohne Formular-Server: direkt zur Danke-Seite
        e.preventDefault(); location.href = 'danke.html';
      }
    });
  });

  // gemeinsamer Zugriff für die Bestands- und Werkzeug-Skripte
  window.EM = { bestand, motion, reduce, fine, lenis: () => lenis, $, $$, esc, eur, eur2, pic, picSet, standText, magnet, tilt, reveal, introDelay: () => introDelay, ZEITEN };

  const init = () => { reveal(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  addEventListener('load', () => { hasGsap && document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh()); });
})();
