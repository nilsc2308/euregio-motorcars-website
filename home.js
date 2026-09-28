/* Euregio Motorcars – Startseite: Szene „Der Weg über den Hof“, Signature „Heute auf dem Hof“, Schaltkulisse, Instrumente. */
(() => {
  const EM = window.EM; if (!EM) return;
  const { $, $$, esc, eur, pic, picSet } = EM;
  const motion = EM.motion;

  // ---------- Szenenfotos ab Foto 2 erst nach „load“ ----------
  const lazyScene = () => $$('.scene img[data-src]').forEach(im => { im.src = im.dataset.src; if (im.dataset.srcset) im.srcset = im.dataset.srcset; });
  if (document.readyState === 'complete') lazyScene(); else addEventListener('load', lazyScene);
  if (!motion) lazyScene();

  // ---------- Szene ----------
  const scene = $('.scene');
  if (scene && motion) {
    const sl = i => $('.sl' + i, scene), st = i => $('.st' + i, scene);
    const wiper = $('.wiper', scene), blade = $('.wiper i', scene), beam = $('.beam', scene), plate = $('.plate', scene);
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom bottom', scrub: .8 } });
    const txtOut = (i, t) => tl.to(st(i), { autoAlpha: 0, y: -24, duration: .35, ease: 'power2.in' }, t);
    const txtIn = (i, t) => tl.fromTo(st(i), { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: .4, ease: 'power3.out' }, t);
    // Einstieg: Foto 1 setzt sich leicht
    tl.fromTo($('img', sl(0)), { scale: 1.1 }, { scale: 1, duration: 3 }, 0);

    // 1 → 2: Scheibenwischer (Sektor um einen Drehpunkt unter der Bildmitte)
    const sector = a => { // a in Grad, -90 (links) bis +90 (rechts)
      const pts = ['50% 104%'];
      for (let t = -90; t <= a + .01; t += 6) { const r = t * Math.PI / 180; pts.push(`${(50 + 320 * Math.sin(r)).toFixed(2)}% ${(104 - 320 * Math.cos(r)).toFixed(2)}%`); }
      const r = a * Math.PI / 180; pts.push(`${(50 + 320 * Math.sin(r)).toFixed(2)}% ${(104 - 320 * Math.cos(r)).toFixed(2)}%`);
      return `polygon(${pts.join(',')})`;
    };
    const w = { a: -90 };
    txtOut(0, .8);
    tl.set(sl(1), { autoAlpha: 1, clipPath: sector(-90) }, 1.25)
      .set(wiper, { opacity: 1 }, 1.25)
      .fromTo(w, { a: -90 }, { a: 90, duration: 1.5, ease: 'power1.inOut', onUpdate: () => { sl(1).style.clipPath = sector(w.a); gsap.set(blade, { rotation: w.a }); } }, 1.3)
      .to(wiper, { opacity: 0, duration: .15 }, 2.8)
      .set(sl(1), { clipPath: 'none' }, 2.96)
      .fromTo($('img', sl(1)), { scale: 1.12 }, { scale: 1, duration: 2.2 }, 1.3);
    txtIn(1, 3.0); txtOut(1, 4.2);

    // 2 → 3: Scheinwerfer (zwei Lichtkegel öffnen das nächste Foto)
    const hl = { r: 0 };
    const mask = r => `radial-gradient(ellipse ${r}% ${r * .62}% at 32% 58%, #000 55%, transparent 100%), radial-gradient(ellipse ${r}% ${r * .62}% at 68% 58%, #000 55%, transparent 100%)`;
    tl.set(sl(2), { autoAlpha: 1 }, 4.6)
      .fromTo(hl, { r: 0 }, { r: 190, duration: 1.3, ease: 'power2.in', onUpdate: () => { const m = mask(hl.r); sl(2).style.webkitMaskImage = m; sl(2).style.maskImage = m; } }, 4.6)
      .fromTo(beam, { opacity: 0 }, { opacity: .95, duration: .35, ease: 'power2.out' }, 4.6)
      .to(beam, { opacity: 0, duration: .8, ease: 'power2.in' }, 5.05)
      .set(sl(2), { webkitMaskImage: 'none', maskImage: 'none' }, 5.95)
      .fromTo($('img', sl(2)), { scale: 1.08 }, { scale: 1, duration: 1.8 }, 4.6);
    txtIn(2, 6.0); txtOut(2, 7.0);

    // 3 → 4: Durchfahrt (vorgerechnete Bewegungsunschärfe)
    tl.to(sl(2), { xPercent: -40, duration: .6, ease: 'power2.in' }, 7.4)
      .fromTo(sl('2b'), { autoAlpha: 0, xPercent: 0 }, { autoAlpha: 1, xPercent: -70, duration: .6, ease: 'power2.in' }, 7.4)
      .set(sl(2), { autoAlpha: 0 }, 8.0)
      .fromTo(sl('3b'), { autoAlpha: 0, xPercent: 70 }, { autoAlpha: 1, xPercent: 0, duration: .55, ease: 'power2.out' }, 7.85)
      .set(sl('2b'), { autoAlpha: 0 }, 8.05)
      .fromTo(sl(3), { autoAlpha: 0 }, { autoAlpha: 1, duration: .35 }, 8.35)
      .set(sl('3b'), { autoAlpha: 0 }, 8.75);
    txtIn(3, 8.8); txtOut(3, 9.7);

    // 4 → 5: Kennzeichen (das Schlussbild erscheint im Nummernschild und wächst)
    const pl = { p: 0 };
    const plateRect = () => { const W = innerWidth, H = innerHeight; const w = Math.min(520, W * .76), h = w * 112 / 520; return { t: (H - h) / 2, l: (W - w) / 2 }; };
    const inset = p => { const r = plateRect(); return `inset(${(r.t * (1 - p)).toFixed(1)}px ${(r.l * (1 - p)).toFixed(1)}px ${(r.t * (1 - p)).toFixed(1)}px ${(r.l * (1 - p)).toFixed(1)}px round ${(10 * (1 - p)).toFixed(1)}px)`; };
    tl.fromTo(plate, { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .35, ease: 'power3.out' }, 10.05)
      .set(sl(4), { autoAlpha: 1, clipPath: inset(0) }, 10.45)
      .to(plate, { opacity: 0, scale: 1.05, duration: .25 }, 10.45)
      .fromTo(pl, { p: 0 }, { p: 1, duration: 1.0, ease: 'power2.inOut', onUpdate: () => sl(4).style.clipPath = inset(pl.p) }, 10.55)
      .set(sl(4), { clipPath: 'none' }, 11.56)
      .fromTo($('img', sl(4)), { scale: 1.25 }, { scale: 1, duration: 1.4, ease: 'power2.out' }, 10.45);
    txtIn(4, 11.7);
    tl.to({}, { duration: .9 }, 12.1);
    // Fortschritt als Tacho
    const gn = $('.g-needle', scene), ga = { a: -90 };
    const setG = () => gn.setAttribute('transform', `rotate(${ga.a.toFixed(2)} 60 62)`);
    setG();
    tl.fromTo(ga, { a: -90 }, { a: 90, duration: tl.duration(), onUpdate: setG }, 0)
      .fromTo('.g-fg', { strokeDashoffset: 158 }, { strokeDashoffset: 0, duration: tl.duration() }, 0);
    // Szenentext 1 beim Laden hereinholen
    gsap.from($$('.st0 > *'), { opacity: 0, y: 24, duration: .9, stagger: .1, ease: 'power3.out', delay: EM.introDelay() + .1 });
    addEventListener('resize', () => ScrollTrigger.refresh());
  }

  // ---------- Heute auf dem Hof (Signature) ----------
  EM.bestand.then(b => {
    const stage = $('[data-hof-stage]'), tag = $('[data-hof-tag]');
    if (!b || !stage) return;
    const kurz = t => String(t || '').replace(/\s*[-/]+\s*$/, '').replace(/\s+-\s+/g, ' · ');
    const cars = b.fahrzeuge.filter(f => (f.bilderAnzahl || f.bilder.length) > 1).slice(0, 6);
    if (!cars.length) return;
    $('.hof-empty', stage).remove();
    stage.insertAdjacentHTML('afterbegin', cars.map((f, i) => `<figure data-i="${i}"${i ? '' : ' class="on"'}><img ${i < 2 ? '' : 'data-'}src="${pic(f.bilder[0], 1024)}" ${i < 2 ? '' : 'data-'}srcset="${picSet(f.bilder[0])}" sizes="(max-width: 900px) 100vw, 60vw" alt="${esc(kurz(f.titel))} auf dem Hof von Euregio Motorcars" width="1024" height="768" loading="lazy"></figure>`).join(''));
    addEventListener('load', () => $$('img[data-src]', stage).forEach(im => { im.src = im.dataset.src; im.srcset = im.dataset.srcset; }));
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
    let cur = 0, swapTl;
    fill(cars[0]); nEl.textContent = `1 / ${cars.length}`;
    const swap = i => {
      if (i === cur) return;
      const figs = $$('figure', stage), old = figs[cur], nu = figs[i];
      const im = $('img', nu); if (im.dataset.src) { im.src = im.dataset.src; im.srcset = im.dataset.srcset; }
      cur = i; nEl.textContent = `${i + 1} / ${cars.length}`;
      if (!motion) { figs.forEach(x => x.classList.toggle('on', x === nu)); fill(cars[i]); return; }
      swapTl && swapTl.progress(1).kill();
      figs.forEach(x => { if (x !== old && x !== nu) { x.classList.remove('on'); gsap.set(x, { opacity: 0 }); } });
      const inner = $('.tag-in', tag);
      swapTl = gsap.timeline()
        .to(inner, { opacity: 0, y: -8, duration: .14, ease: 'power2.in' }, 0)
        .fromTo($('.hof-light', stage), { xPercent: -100, opacity: 1 }, { xPercent: 100, opacity: 1, duration: .55, ease: 'power2.inOut' }, 0)
        .to(old, { opacity: 0, duration: .3, ease: 'power2.in' }, .1)
        .fromTo(nu, { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: .55, ease: 'power3.out', onStart: () => nu.classList.add('on') }, .12)
        .add(() => { old.classList.remove('on'); fill(cars[i]); }, .15)
        .to(inner, { opacity: 1, y: 0, duration: .26, ease: 'power3.out' }, .17);
    };
    if (motion) {
      gsap.set($$('figure', stage), { opacity: i => i ? 0 : 1 });
      ScrollTrigger.create({ trigger: '.hof-pin', start: 'top top', end: () => '+=' + Math.round(innerHeight * (cars.length - 1) * .42), pin: true, scrub: true,
        onUpdate: s => swap(Math.min(cars.length - 1, Math.floor(s.progress * cars.length * .999))) });
      gsap.from([stage, tag], { y: 40, opacity: 0, duration: .9, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.hof', start: 'top 75%', once: true } });
      ScrollTrigger.refresh();
    } else {
      // ohne Bewegung: Vor/Zurück-Knöpfe statt Scrollen
      tag.insertAdjacentHTML('beforeend', '<div class="btns"><button class="btn ghost" type="button" data-p>Vorheriges</button><button class="btn ghost" type="button" data-n>Nächstes</button></div>');
      $('[data-p]', tag).addEventListener('click', () => swap((cur + cars.length - 1) % cars.length));
      $('[data-n]', tag).addEventListener('click', () => swap((cur + 1) % cars.length));
    }
  });

  // ---------- Schaltkulisse ----------
  const gears = $('.gears');
  if (gears) {
    const POS = { N: [160, 130], 1: [60, 50], 2: [60, 210], 3: [160, 50], 4: [160, 210], 5: [260, 50], 6: [260, 210], R: [320, 50] };
    const knob = $('.knob', gears);
    const btns = $$('.gear-btns button', gears), panels = $$('.gpanel', gears), labels = $$('.gl', gears);
    let active = '1', manual = false;
    const select = g => {
      if (g === active) return; active = g;
      btns.forEach(b => b.setAttribute('aria-selected', b.dataset.g === g ? 'true' : 'false'));
      labels.forEach(l => l.classList.toggle('on', l.dataset.g === g));
      panels.forEach(p => p.classList.toggle('on', p.dataset.g === g));
    };
    labels.forEach(l => l.classList.toggle('on', l.dataset.g === '1'));
    const hasG = typeof gsap !== 'undefined';
    const at = (x, y) => hasG ? gsap.set(knob, { x, y }) : knob.setAttribute('transform', `translate(${x} ${y})`);
    at(...POS[motion ? 'N' : '1']);
    // Weg durch die Gassen: N → 1 → 2 → 3 → 4 → 5 → 6 → R
    const path = [['N'], [60, 130], ['1'], ['2'], [60, 130], [160, 130], ['3'], ['4'], [160, 130], [260, 130], ['5'], ['6'], [260, 130], [320, 130], ['R']];
    let scrollTl;
    if (motion) {
      scrollTl = gsap.timeline({ scrollTrigger: { trigger: gears, start: 'top 65%', end: 'bottom 75%', scrub: .6 } });
      let t = 0;
      path.slice(1).forEach(p => {
        const [x, y] = p.length === 1 ? POS[p[0]] : p;
        scrollTl.to(knob, { x, y, duration: 1, ease: 'power1.inOut' }, t);
        if (p.length === 1) scrollTl.add(() => { if (!manual) select(p[0]); }, t + .9);
        t += 1;
      });
      // rückwärts: Gang passend zur Knopf-Position
      scrollTl.eventCallback('onUpdate', () => {
        if (manual) return;
        const x = gsap.getProperty(knob, 'x'), y = gsap.getProperty(knob, 'y');
        const near = Object.entries(POS).filter(([k]) => k !== 'N').find(([, [px, py]]) => Math.abs(px - x) < 6 && Math.abs(py - y) < 6);
        if (near) select(near[0]);
      });
    }
    const go = g => {
      manual = true; if (scrollTl) { scrollTl.scrollTrigger && scrollTl.scrollTrigger.kill(); scrollTl.kill(); scrollTl = null; }
      const [tx, ty] = POS[g];
      if (motion) {
        const x0 = gsap.getProperty(knob, 'x');
        gsap.timeline().to(knob, { x: x0, y: 130, duration: .18, ease: 'power2.in' }).to(knob, { x: tx === 320 ? 320 : tx, y: 130, duration: .22, ease: 'power2.inOut' }).to(knob, { x: tx, y: ty, duration: .22, ease: 'power3.out' });
      } else at(tx, ty);
      select(g);
    };
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

  // ---------- Probefahrt: Fotoleiste gleitet beim Scrollen ----------
  if (motion) {
    const strip = $('.book .carpick-strip');
    if (strip) gsap.fromTo(strip, { x: 60 }, { x: 0, ease: 'none', scrollTrigger: { trigger: '.book', start: 'top bottom', end: 'top 30%', scrub: .6 } });
  }
})();
