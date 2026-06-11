// === Scroll-Motion-System (GSAP ScrollTrigger) — nur Startseite ===
// Prinzipien: nur transform/opacity animieren, prefers-reduced-motion respektieren,
// Mobile bekommt die leichte Variante. Fällt ohne GSAP sauber auf main.js zurück.
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  // --- 1. Scroll-Fortschrittsbalken ---
  const progress = document.querySelector('.scroll-progress');
  if (progress) {
    gsap.to(progress, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.4 }
    });
  }

  // --- 2. Farbreise: Three.js-Szene + Hintergrund-Glow wandern mit dem Scroll ---
  // Cyan (Hero) → Violett (Firma) → Pink (Showcase) → Türkis (CTA)
  const S = window.AXON_SCENE;
  if (S && typeof THREE !== 'undefined') {
    const stops = [
      { pts: 0xffffff, line: 0x6fb6ff, ring: 0x7c5cff, core: 0x9fd8ff, hue: 0 },
      { pts: 0xd9ccff, line: 0x8d6bff, ring: 0xb08cff, core: 0xc3aaff, hue: 38 },
      { pts: 0xffd2e6, line: 0xff5ea8, ring: 0xff7cc0, core: 0xffc4e0, hue: 92 },
      { pts: 0xc8fff1, line: 0x5ef0ff, ring: 0x64ffd9, core: 0xbdfff0, hue: 150 }
    ];
    const mats = {
      pts: S.points.material.color,
      line: S.mesh.material.color,
      ring: S.ring.material.color,
      core: S.core.material.color
    };
    const hueProxy = { h: 0 };
    const glow = document.querySelector('.bg-glow');
    const tl = gsap.timeline({
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.8 }
    });
    stops.slice(1).forEach((stop, i) => {
      const at = i; // gleichmäßige Abschnitte
      Object.keys(mats).forEach(k => {
        const c = new THREE.Color(stop[k]);
        tl.to(mats[k], { r: c.r, g: c.g, b: c.b, duration: 1, ease: 'none' }, at);
      });
      tl.to(hueProxy, {
        h: stop.hue, duration: 1, ease: 'none',
        onUpdate: () => { if (glow) glow.style.filter = 'hue-rotate(' + hueProxy.h.toFixed(1) + 'deg)'; }
      }, at);
    });
  }

  // --- 3. Hero: sanftes Heraus-Parallaxen beim Wegscrollen ---
  const hero = document.querySelector('.hero');
  if (hero) {
    gsap.to('.hero-grid', {
      yPercent: -10, opacity: 0.15, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.scroll-hint', {
      opacity: 0, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: '30% top', scrub: true }
    });
  }

  // --- 4. Holo-Panel: Balken wachsen beim ersten Sichtkontakt ---
  document.querySelectorAll('.holo-panel .bar i').forEach(bar => {
    const w = bar.style.width || '100%';
    gsap.fromTo(bar, { width: 0 }, {
      width: w, duration: 1.4, ease: 'power3.out',
      scrollTrigger: { trigger: bar, start: 'top 90%', once: true }
    });
  });

  // --- 5. Scrollytelling „So entsteht dein Projekt" (nur Desktop) ---
  // Mobile/ohne JS: die vier Schritte stehen einfach untereinander (CSS-Basis).
  const mm = gsap.matchMedia();
  mm.add('(min-width: 981px)', () => {
    const sec = document.getElementById('journey');
    if (!sec) return;
    const stage = sec.querySelector('.journey');
    const steps = gsap.utils.toArray('.journey-step', stage);
    const dots = gsap.utils.toArray('.journey-dots i', stage);
    if (steps.length < 2) return;

    stage.classList.add('pinned');
    stage.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    gsap.set(steps.slice(1), { autoAlpha: 0 });

    const setDot = (i) => dots.forEach((d, j) => d.classList.toggle('active', j === i));
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage, start: 'top top',
        end: '+=' + (steps.length * 85) + '%',
        pin: true, scrub: 0.5, anticipatePin: 1,
        // Die Journey liegt im Dokument VOR dem Firma-Pin (firma.js, früher
        // registriert) — höhere Priorität + sort(), damit die Pin-Abstände
        // in Dokument-Reihenfolge berechnet werden und sich nichts überlappt.
        refreshPriority: 1,
        onUpdate: (st) => setDot(Math.min(steps.length - 1, Math.floor(st.progress * steps.length)))
      }
    });
    ScrollTrigger.sort();
    steps.slice(1).forEach((step, i) => {
      tl.to(steps[i], { autoAlpha: 0, y: -36, duration: 0.45, ease: 'power1.in' }, i + 0.55);
      tl.fromTo(step, { autoAlpha: 0, y: 42 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power1.out' }, i + 1);
    });
    tl.set({}, {}, steps.length); // Halte-Zeit fürs letzte Kapitel

    return () => {
      stage.classList.remove('pinned');
      tl.scrollTrigger && tl.scrollTrigger.kill();
      tl.kill();
      gsap.set(steps, { clearProps: 'all' });
    };
  });

  // --- 6. Horizontale Showcase-Galerie (nur Desktop mit Maus/Trackpad) ---
  mm.add('(min-width: 981px)', () => {
    const sec = document.getElementById('referenzen');
    if (!sec) return;
    const track = sec.querySelector('.cards');
    const container = sec.querySelector('.container');
    if (!track || !container) return;

    sec.classList.add('hscroll');
    // Reveals im Track sofort sichtbar — die Galerie selbst ist die Show
    sec.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));

    const dist = () => Math.max(0, track.scrollWidth - container.clientWidth);
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: sec, start: 'top top',
        end: () => '+=' + (dist() + window.innerHeight * 0.25),
        pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1
      }
    });
    return () => { sec.classList.remove('hscroll'); tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill(); };
  });

  // --- 7. CTA: leichtes Aufziehen ---
  const cta = document.querySelector('.cta');
  if (cta) {
    gsap.from(cta, {
      scale: 0.94, ease: 'none',
      scrollTrigger: { trigger: cta, start: 'top 95%', end: 'top 45%', scrub: 0.5 }
    });
  }
})();
