// === Die lebende Firma — scroll-getriebene Simulation ===
// Stage 0: Chaos ohne KI · Stage 1: DocFlow · Stage 2: KI-Agent · Stage 3: Cockpit.
// Desktop: Sektion wird gepinnt, Scroll installiert die Module.
// Mobil: kein Pin, die Stufen spielen sich beim ersten Sichtkontakt automatisch durch.
// Reduced Motion / ohne GSAP: statisches Endbild mit allen Schritten untereinander.
(function () {
  const svg = document.getElementById('firmaSvg');
  const section = document.getElementById('firma');
  if (!svg || !section) return;

  const steps = section.querySelectorAll('.firma-step');
  const dots = section.querySelectorAll('.firma-dots i');
  const kpiDur = document.getElementById('kpiDur');
  const kpiAuto = document.getElementById('kpiAuto');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Statischer Fallback: fertige Firma zeigen, Story komplett ausschreiben
  if (reduce || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof MotionPathPlugin === 'undefined') {
    svg.classList.remove('s0');
    svg.classList.add('s3');
    section.classList.add('firma-static');
    steps.forEach(s => s.classList.add('active'));
    dots.forEach(d => d.classList.add('on'));
    if (kpiDur) kpiDur.textContent = '2';
    if (kpiAuto) kpiAuto.textContent = '94';
    const btn = document.getElementById('orderBtn');
    if (btn) btn.hidden = true;
    return;
  }

  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

  // --- Simulation: Auftrags-Tokens auf dem Hauptweg ---
  const simTweens = [];
  const proto = svg.querySelector('#tokenProto');
  const layer = svg.querySelector('#tokenLayer');
  const TOKENS = 5, LAP = 26;
  for (let i = 0; i < TOKENS; i++) {
    const t = proto.cloneNode(true);
    t.removeAttribute('id');
    t.style.visibility = 'visible';
    layer.appendChild(t);
    const tw = gsap.to(t, {
      motionPath: { path: '#orderPath', align: '#orderPath', alignOrigin: [0.5, 0.5] },
      duration: LAP, ease: 'none', repeat: -1
    });
    tw.progress(i / TOKENS);
    simTweens.push(tw);
  }

  // --- Läufer pendeln zwischen den Abteilungen ---
  svg.querySelectorAll('.runner').forEach((r, i) => {
    const path = '#wPath' + (i + 1);
    const walk = gsap.to(r, {
      motionPath: { path: path, align: path, alignOrigin: [0.5, 0.9] },
      duration: 6.5 + i * 1.4, ease: 'sine.inOut', repeat: -1, yoyo: true
    });
    simTweens.push(walk);
    const fig = r.querySelector('.fig');
    if (fig) simTweens.push(gsap.to(fig, { y: -2.5, duration: 0.32, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
  });

  // --- Antwort-Funken des KI-Agenten (Sichtbarkeit regelt CSS ab Stage 2) ---
  gsap.utils.toArray('#boltLayer .bolt').forEach((b, i) => {
    gsap.fromTo(b, { x: 0, opacity: 0 }, {
      x: 130, opacity: 1, duration: 0.8, repeat: -1, repeatDelay: 0.55, delay: i * 0.45, ease: 'power1.in'
    });
  });

  // --- Tempo-Steuerung ---
  const speed = { v: 0.55 };
  simTweens.forEach(t => t.timeScale(speed.v));
  function setSpeed(target) {
    gsap.to(speed, {
      v: target, duration: 1.2, ease: 'power2.out', overwrite: true,
      onUpdate: () => simTweens.forEach(t => t.timeScale(speed.v))
    });
  }

  // --- Module zu Beginn versteckt ---
  gsap.set(['#chipDocflow', '#chipAgent', '#hudCockpit'], { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 50%' });

  const qVertrieb = gsap.utils.toArray('#queueVertrieb .paper');
  const qBuch = gsap.utils.toArray('#queueBuch .paper');
  const KPI = { dur: [14, 9, 5, 2], auto: [12, 38, 71, 94] };
  const kpiState = { d: 14, a: 12 };
  let stage = -1;

  function setStage(n) {
    if (n === stage) return;
    stage = n;
    svg.classList.remove('s0', 's1', 's2', 's3');
    svg.classList.add('s' + n);
    steps.forEach((s, i) => s.classList.toggle('active', i === n));
    dots.forEach((d, i) => d.classList.toggle('on', i <= n));

    gsap.to(kpiState, {
      d: KPI.dur[n], a: KPI.auto[n], duration: 1, ease: 'power2.out', overwrite: true,
      onUpdate: () => {
        if (kpiDur) kpiDur.textContent = Math.round(kpiState.d);
        if (kpiAuto) kpiAuto.textContent = Math.round(kpiState.a);
      }
    });

    setSpeed([0.55, 1, 1.6, 2.4][n]);

    gsap.to('#chipDocflow', { autoAlpha: n >= 1 ? 1 : 0, scale: n >= 1 ? 1 : 0.6, duration: 0.5, ease: 'back.out(2)', overwrite: true });
    gsap.to('#chipAgent', { autoAlpha: n >= 2 ? 1 : 0, scale: n >= 2 ? 1 : 0.6, duration: 0.5, ease: 'back.out(2)', overwrite: true });
    gsap.to('#hudCockpit', { autoAlpha: n >= 3 ? 1 : 0, scale: n >= 3 ? 1 : 0.6, duration: 0.5, ease: 'back.out(2)', overwrite: true });

    // Papierstapel lösen sich auf, sobald das passende Modul da ist
    qBuch.forEach((p, i) => gsap.to(p, {
      autoAlpha: n >= 1 && i >= 2 ? 0 : 1, y: n >= 1 && i >= 2 ? -16 : 0,
      duration: 0.45, delay: i * 0.05, overwrite: true
    }));
    qVertrieb.forEach((p, i) => gsap.to(p, {
      autoAlpha: n >= 2 && i >= 1 ? 0 : 1, y: n >= 2 && i >= 1 ? -16 : 0,
      duration: 0.45, delay: i * 0.05, overwrite: true
    }));
  }

  const mm = gsap.matchMedia();

  // Desktop: pinnen + scrubben
  mm.add('(min-width: 981px)', () => {
    section.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    const st = ScrollTrigger.create({
      trigger: section, start: 'top top', end: '+=2400',
      pin: true, scrub: true, anticipatePin: 1,
      onUpdate: self => setStage(Math.min(3, Math.floor(self.progress * 4)))
    });
    setStage(0);
    return () => st.kill();
  });

  // Mobil: Stufen automatisch durchspielen, sobald die Szene sichtbar wird
  mm.add('(max-width: 980px)', () => {
    setStage(0);
    let iv = null;
    const st = ScrollTrigger.create({
      trigger: section, start: 'top 70%', once: true,
      onEnter: () => {
        let n = 0;
        iv = setInterval(() => { n++; setStage(n); if (n >= 3) clearInterval(iv); }, 2800);
      }
    });
    return () => { st.kill(); if (iv) clearInterval(iv); };
  });

  // === Live-Modus: Supabase Realtime (Broadcast + Presence) ===
  // „Auftrag einwerfen" spawnt einen pinken Eil-Auftrag — bei ALLEN, die die
  // Seite gerade offen haben. Ohne Supabase (CDN down o. Ä.) läuft's lokal weiter.
  const orderBtn = document.getElementById('orderBtn');
  const badge = document.getElementById('liveBadge');
  const countEl = document.getElementById('liveCount');

  function spawnLiveToken() {
    const t = proto.cloneNode(true);
    t.removeAttribute('id');
    t.classList.add('live');
    t.style.visibility = 'visible';
    layer.appendChild(t);
    gsap.to(t, {
      motionPath: { path: '#orderPath', align: '#orderPath', alignOrigin: [0.5, 0.5] },
      duration: 9, ease: 'none',
      onComplete: () => t.remove()
    });
    gsap.from(t, { scale: 2.4, opacity: 0, duration: 0.6, ease: 'back.out(2)' });
  }

  if (orderBtn) {
    let channel = null;
    try {
      if (window.supabase && window.supabase.createClient) {
        const sb = window.supabase.createClient(
          'https://amrdmnnijbfwtrjcpocl.supabase.co',
          'sb_publishable_nfzmqaa3_DHdS7ijNwURVA_5xtSAu40',
          { realtime: { params: { eventsPerSecond: 2 } } }
        );
        channel = sb.channel('firma-live');
        channel
          .on('broadcast', { event: 'auftrag' }, () => spawnLiveToken())
          .on('presence', { event: 'sync' }, () => {
            const n = Object.keys(channel.presenceState()).length;
            if (countEl) countEl.textContent = String(Math.max(1, n));
            if (badge) badge.hidden = n < 1;
          })
          .subscribe(status => {
            if (status === 'SUBSCRIBED') channel.track({ seit: Date.now() });
          });
      }
    } catch (e) { channel = null; }

    let cooldown = false;
    orderBtn.addEventListener('click', () => {
      if (cooldown) return;
      cooldown = true;
      orderBtn.classList.add('cooling');
      setTimeout(() => { cooldown = false; orderBtn.classList.remove('cooling'); }, 2500);
      spawnLiveToken();
      if (channel) channel.send({ type: 'broadcast', event: 'auftrag', payload: {} });
    });
  }
})();
