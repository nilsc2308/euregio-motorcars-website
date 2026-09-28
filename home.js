/* Euregio Motorcars – Startseite: Einstieg, „Heute auf dem Hof“ (Karussell), Schaltkulisse, Instrumente. */
(() => {
  const EM = window.EM; if (!EM) return;
  const { $, $$, esc, eur, pic, picSet } = EM;
  const motion = EM.motion;
  const kurz = t => String(t || '').replace(/\s*[-/]+\s*$/, '').replace(/\s+-\s+/g, ' · ');

  // ---------- Einstieg: ruhiges Hereinkommen, leichter Tiefeneffekt beim Weiterscrollen ----------
  if (motion) {
    gsap.from(['.hero .kicker', '.hero-p', '.quick', '.hero-meta'], { opacity: 0, y: 22, duration: .9, stagger: .09, ease: 'power3.out', delay: EM.introDelay() + .25 });
    gsap.fromTo('.hero-pic', { scale: 1.06 }, { scale: 1, duration: 1.6, ease: 'power2.out', delay: EM.introDelay() });
    gsap.to('.hero-img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 } });
  }

  // ---------- Heute auf dem Hof: von Hand wechseln (Pfeile, Vorschaubilder, Wischen, Tastatur) ----------
  EM.bestand.then(b => {
    const stage = $('[data-hof-stage]'), tag = $('[data-hof-tag]'), thumbs = $('[data-hof-thumbs]');
    if (!b || !stage) return;
    const cars = b.fahrzeuge.filter(f => (f.bilderAnzahl || f.bilder.length) > 1).slice(0, 8);
    if (!cars.length) return;
    $('.hof-empty', stage).remove();
    stage.insertAdjacentHTML('afterbegin', cars.map((f, i) => `<figure data-i="${i}"${i ? '' : ' class="on"'}><img ${i ? 'data-' : ''}src="${pic(f.bilder[0], 1024)}" ${i ? 'data-' : ''}srcset="${picSet(f.bilder[0])}" sizes="(max-width: 900px) 100vw, 60vw" alt="${esc(kurz(f.titel))} auf dem Hof von Euregio Motorcars" width="1024" height="768" loading="lazy"></figure>`).join(''));
    thumbs.innerHTML = cars.map((f, i) => `<button type="button" data-i="${i}" aria-current="${i ? 'false' : 'true'}" aria-label="${esc(kurz(f.titel))}, ${eur(f.preis)}"><img src="${pic(f.bilder[0], 240)}" alt="" loading="lazy" width="240" height="180"><span>${esc(f.marke)} ${esc(f.modell)}</span></button>`).join('');
    const F = k => $(`[data-f="${k}"]`, tag);
    const fill = f => {
      F('kategorie').textContent = f.kategorie || 'Gebrauchtwagen';
      F('titel').textContent = kurz(f.titel);
      F('preis').textContent = eur(f.preis);
      F('rate').textContent = f.rate ? `Finanzierung ab ${eur(f.rate.monat)} im Monat` : (f.preisBewertung ? f.preisBewertung + ' laut mobile.de' : '');
      F('ez').textContent = f.ez || '–'; F('km').textContent = f.kmText || '–'; F('leistung').textContent = f.leistung || '–';
      F('kraftstoff').textContent = f.kraftstoff || '–'; F('getriebe').textContent = f.getriebe || '–'; F('vorbesitzer').textContent = f.vorbesitzer != null ? f.vorbesitzer : '–';
      F('link').href = `fahrzeug.html?id=${encodeURIComponent(f.id)}`;
    };
    const nEl = $('[data-hof-n]');
    const load = i => { const im = $(`figure[data-i="${i}"] img`, stage); if (im && im.dataset.src) { im.src = im.dataset.src; im.srcset = im.dataset.srcset; delete im.dataset.src; } };
    let cur = 0, swapTl;
    fill(cars[0]); nEl.textContent = `1 von ${cars.length}`; load(1);
    const show = i => {
      i = (i + cars.length) % cars.length;
      if (i === cur) return;
      const figs = $$('figure', stage), old = figs[cur], nu = figs[i];
      load(i); load((i + 1) % cars.length);
      cur = i; nEl.textContent = `${i + 1} von ${cars.length}`;
      $$('button', thumbs).forEach((t, k) => t.setAttribute('aria-current', k === i ? 'true' : 'false'));
      const tb = $$('button', thumbs)[i]; tb && thumbs.scrollTo({ left: tb.offsetLeft - thumbs.clientWidth / 2 + tb.offsetWidth / 2, behavior: motion ? 'smooth' : 'auto' });
      if (!motion) { figs.forEach(x => x.classList.toggle('on', x === nu)); fill(cars[i]); return; }
      swapTl && swapTl.progress(1).kill();
      figs.forEach(x => { if (x !== old && x !== nu) { x.classList.remove('on'); gsap.set(x, { opacity: 0 }); } });
      const inner = $('.tag-in', tag);
      // fester Ablauf: Preisschild aus → Auto wechselt → Preisschild mit neuen Daten ein (Texte nie gleichzeitig)
      swapTl = gsap.timeline()
        .to(inner, { opacity: 0, y: -8, duration: .14, ease: 'power2.in' }, 0)
        .fromTo($('.hof-light', stage), { xPercent: -100, opacity: 1 }, { xPercent: 100, opacity: 1, duration: .55, ease: 'power2.inOut' }, 0)
        .to(old, { opacity: 0, duration: .3, ease: 'power2.in' }, .08)
        .fromTo(nu, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: .5, ease: 'power3.out', onStart: () => nu.classList.add('on') }, .1)
        .add(() => { old.classList.remove('on'); fill(cars[i]); }, .15)
        .to(inner, { opacity: 1, y: 0, duration: .26, ease: 'power3.out' }, .17);
    };
    if (motion) gsap.set($$('figure', stage), { opacity: i => i ? 0 : 1 });
    $('.hof-prev').addEventListener('click', () => show(cur - 1));
    $('.hof-next').addEventListener('click', () => show(cur + 1));
    thumbs.addEventListener('click', e => { const t = e.target.closest('button'); if (t) show(+t.dataset.i); });
    stage.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1); } });
    let sx = null, sy = null, swiped = false;
    stage.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiped = false; }, { passive: true });
    stage.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { swiped = true; show(cur + (dx < 0 ? 1 : -1)); } sx = null; });
    stage.addEventListener('click', () => { if (!swiped) location.href = F('link').href; });
    stage.style.cursor = 'pointer';
    if (motion) gsap.from([stage, tag], { y: 40, opacity: 0, duration: .9, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.hof', start: 'top 75%', once: true } });
  });

  // ---------- Schaltkulisse: per Klick; beim ersten Hereinscrollen legt der Knauf einmal den 1. Gang ein ----------
  const gears = $('.gears');
  if (gears) {
    const POS = { N: [160, 130], 1: [60, 50], 2: [60, 210], 3: [160, 50], 4: [160, 210], 5: [260, 50], 6: [260, 210], R: [320, 50] };
    const knob = $('.knob', gears);
    const btns = $$('.gear-btns button', gears), panels = $$('.gpanel', gears), labels = $$('.gl', gears);
    let active = '1';
    const select = g => {
      active = g;
      btns.forEach(b => b.setAttribute('aria-selected', b.dataset.g === g ? 'true' : 'false'));
      labels.forEach(l => l.classList.toggle('on', l.dataset.g === g));
      panels.forEach(p => p.classList.toggle('on', p.dataset.g === g));
    };
    const hasG = typeof gsap !== 'undefined';
    const at = (x, y) => hasG ? gsap.set(knob, { x, y }) : knob.setAttribute('transform', `translate(${x} ${y})`);
    select('1');
    const move = g => {
      const [tx, ty] = POS[g];
      if (!motion) return at(tx, ty);
      const x0 = gsap.getProperty(knob, 'x');
      gsap.timeline().to(knob, { x: x0, y: 130, duration: .16, ease: 'power2.in', overwrite: true }).to(knob, { x: tx, y: 130, duration: .22, ease: 'power2.inOut' }).to(knob, { x: tx, y: ty, duration: .22, ease: 'power3.out' });
    };
    if (motion) {
      at(...POS.N);
      ScrollTrigger.create({ trigger: gears, start: 'top 60%', once: true, onEnter: () => move(active) });
    } else at(...POS['1']);
    const go = g => { move(g); select(g); };
    btns.forEach(b => b.addEventListener('click', () => go(b.dataset.g)));
    labels.forEach(l => l.addEventListener('click', () => go(l.dataset.g)));
    $('.gear-btns', gears).addEventListener('keydown', e => {
      const i = btns.findIndex(b => b.dataset.g === active);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); const n = btns[(i + 1) % btns.length]; go(n.dataset.g); n.focus(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); const n = btns[(i + btns.length - 1) % btns.length]; go(n.dataset.g); n.focus(); }
    });
  }

  // ---------- Instrumente ----------
  $$('.inst').forEach(inst => {
    const v = +inst.dataset.val / 5;
    inst.style.setProperty('--v', v);
    if (!motion) return;
    const nd = $('.needle', inst), o = { a: -120 };
    const setN = () => nd.setAttribute('transform', `rotate(${o.a.toFixed(2)})`);
    setN();
    const tl = gsap.timeline({ scrollTrigger: { trigger: inst, start: 'top 85%', end: 'top 35%', scrub: .7 } });
    tl.fromTo(o, { a: -120 }, { a: v * 240 - 120, ease: 'power2.out', onUpdate: setN }, 0)
      .fromTo($('.arc-fg', inst), { strokeDashoffset: 1 }, { strokeDashoffset: 1 - v, ease: 'power2.out' }, 0)
      .from($('figcaption', inst), { opacity: 0, y: 16, ease: 'power2.out', duration: .5 }, .3);
  });
  if (motion) gsap.from('.lcd p', { opacity: 0, x: -12, stagger: .08, duration: .5, ease: 'power3.out', scrollTrigger: { trigger: '.lcd', start: 'top 85%', once: true } });

  // ---------- Probefahrt: Fotoleiste gleitet beim Hereinscrollen ----------
  if (motion) {
    const strip = $('.book .carpick-strip');
    if (strip) gsap.fromTo(strip, { x: 60 }, { x: 0, ease: 'none', scrollTrigger: { trigger: '.book', start: 'top bottom', end: 'top 30%', scrub: .6 } });
  }
})();
