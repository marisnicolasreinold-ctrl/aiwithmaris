// === Die lebende Firma — echte Mini-Simulation ===
// Aufträge durchlaufen die Abteilungen als Stationen mit Warteschlangen.
// Die KPIs (Durchlaufzeit, Automatisierungsgrad) werden aus dem Geschehen
// GEMESSEN statt vorgegeben: Jeder Auftrag merkt sich seine Startzeit, jede
// Station zählt, ob ein Modul oder ein Mensch gearbeitet hat.
// Stage 0: Chaos ohne KI · Stage 1: DocFlow · Stage 2: KI-Agent · Stage 3: Cockpit.
// Desktop: Sektion gepinnt, Scroll installiert die Module. Mobil: Autoplay.
// Reduced Motion / ohne GSAP: statisches Endbild mit ausgeschriebener Story.
(function () {
  const svg = document.getElementById('firmaSvg');
  const section = document.getElementById('firma');
  if (!svg || !section) return;

  const steps = section.querySelectorAll('.firma-step');
  const dots = section.querySelectorAll('.firma-dots i');
  const kpiDur = document.getElementById('kpiDur');
  const kpiAuto = document.getElementById('kpiAuto');
  const logEl = document.getElementById('firmaLog');
  const ctaEl = document.getElementById('firmaCta');
  const tipEl = document.getElementById('firmaTip');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lang = 'de';
  try { lang = (localStorage.getItem('aiwm_lang') === 'en') ? 'en' : 'de'; } catch (e) { /* de */ }

  // Dynamische Texte (Ticker, Tooltips) — i18n.js übersetzt nur statisches HTML.
  const STR = {
    de: {
      logAgent: (n, s) => `Anfrage #${n} in ${s} s beantwortet`,
      logDoc: (n) => `Rechnung #${n} automatisch gelesen & verbucht`,
      logCockpit: () => `Engpass früh erkannt — Route umgeplant`,
      logWaitBuch: (q) => `${q} Rechnungen warten in der Buchhaltung`,
      logWaitVertrieb: (q) => `Posteingang wächst: ${q} offene Anfragen`,
      logDone: (n, d) => `Auftrag #${n} nach ${d} Tagen abgeschlossen`,
      logDoneFast: (n, d) => `Auftrag #${n} in ${d} Tagen durch — Kunde glücklich`,
      logEil: () => `Eil-Auftrag eingeworfen — Priorität gesetzt`,
      logRush: (k) => `Stoßzeit! ${k} Aufträge auf einmal`,
      logInstall: { 1: 'Modul installiert: DocFlow', 2: 'Modul installiert: KI-Agent', 3: 'Modul installiert: ATLAS Cockpit' },
      modManual: 'manuell', modAuto: 'automatisiert',
      tipQueue: (q) => q === 0 ? 'keine Wartenden' : (q === 1 ? '1 Auftrag wartet' : `${q} Aufträge warten`),
      mods: { vertrieb: 'KI-Agent', buchhaltung: 'DocFlow', einkauf: 'Cockpit', lager: 'Scanner', versand: 'Cockpit' },
      rooms: { vertrieb: 'Vertrieb', einkauf: 'Einkauf', lager: 'Lager', buchhaltung: 'Buchhaltung', versand: 'Versand' },
      sysManual: 'Team', staticLog: ['Rechnung #2041 automatisch verbucht', 'Anfrage #1108 in 24 s beantwortet', 'Engpass früh erkannt — Route umgeplant']
    },
    en: {
      logAgent: (n, s) => `Inquiry #${n} answered in ${s} s`,
      logDoc: (n) => `Invoice #${n} read & booked automatically`,
      logCockpit: () => `Bottleneck caught early — route replanned`,
      logWaitBuch: (q) => `${q} invoices waiting in accounting`,
      logWaitVertrieb: (q) => `Inbox piling up: ${q} open inquiries`,
      logDone: (n, d) => `Order #${n} completed after ${d} days`,
      logDoneFast: (n, d) => `Order #${n} done in ${d} days — happy customer`,
      logEil: () => `Rush order dropped in — priority set`,
      logRush: (k) => `Rush hour! ${k} orders at once`,
      logInstall: { 1: 'Module installed: DocFlow', 2: 'Module installed: AI agent', 3: 'Module installed: ATLAS cockpit' },
      modManual: 'manual', modAuto: 'automated',
      tipQueue: (q) => q === 0 ? 'no backlog' : (q === 1 ? '1 order waiting' : `${q} orders waiting`),
      mods: { vertrieb: 'AI agent', buchhaltung: 'DocFlow', einkauf: 'Cockpit', lager: 'Scanner', versand: 'Cockpit' },
      rooms: { vertrieb: 'Sales', einkauf: 'Purchasing', lager: 'Warehouse', buchhaltung: 'Accounting', versand: 'Shipping' },
      sysManual: 'Team', staticLog: ['Invoice #2041 booked automatically', 'Inquiry #1108 answered in 24 s', 'Bottleneck caught early — route replanned']
    }
  }[lang];

  const path = svg.querySelector('#orderPath');
  const pathOk = path && typeof path.getTotalLength === 'function';

  // --- Statischer Fallback: fertige Firma, Story ausgeschrieben ---
  if (reduce || !pathOk || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof MotionPathPlugin === 'undefined') {
    svg.classList.remove('s0');
    svg.classList.add('s3');
    section.classList.add('firma-static');
    steps.forEach(s => s.classList.add('active'));
    dots.forEach(d => d.classList.add('on'));
    if (kpiDur) kpiDur.textContent = '2';
    if (kpiAuto) kpiAuto.textContent = '94';
    if (logEl) STR.staticLog.forEach(t => {
      const line = document.createElement('div');
      line.className = 'firma-log-line';
      line.textContent = t;
      logEl.appendChild(line);
    });
    if (ctaEl) ctaEl.hidden = false;
    const btn = document.getElementById('orderBtn');
    if (btn) btn.hidden = true;
    const rush = document.getElementById('rushBtn');
    if (rush) rush.hidden = true;
    return;
  }

  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

  /* =====================================================================
     ENGINE — Stationen, Warteschlangen, gemessene KPIs
     ===================================================================== */
  const LEN = path.getTotalLength();
  const ptAt = (p) => path.getPointAtLength(Math.max(0, Math.min(1, p)) * LEN);

  // Fortschritt auf dem Pfad finden, der einem Ankerpunkt am nächsten liegt.
  function progressNear(x, y) {
    let best = 0, bestD = Infinity;
    for (let i = 0; i <= 400; i++) {
      const pt = path.getPointAtLength((i / 400) * LEN);
      const d = (pt.x - x) * (pt.x - x) + (pt.y - y) * (pt.y - y);
      if (d < bestD) { bestD = d; best = i / 400; }
    }
    return best;
  }

  // Stationen in Pfadreihenfolge. modStage = ab dieser Stage arbeitet ein Modul.
  const stations = [
    { key: 'vertrieb', at: progressNear(215, 196), room: svg.querySelector('#roomVertrieb'), modStage: 2 },
    { key: 'einkauf', at: progressNear(580, 170), room: svg.querySelector('#roomEinkauf'), modStage: 3 },
    { key: 'lager', at: progressNear(945, 200), room: svg.querySelector('#roomLager'), modStage: 3 },
    { key: 'buchhaltung', at: progressNear(400, 462), room: svg.querySelector('#roomBuchhaltung'), modStage: 1 },
    { key: 'versand', at: progressNear(770, 478), room: svg.querySelector('#roomVersand'), modStage: 3 }
  ];
  stations.sort((a, b) => a.at - b.at);
  stations.forEach(s => { s.queue = []; s.current = null; s.busyUntil = 0; });

  // Bedienzeiten (Sekunden) & Auto-Wahrscheinlichkeit je Stage.
  const PROFILE = [
    { spawnEvery: 2.3, speed: 95, service: { vertrieb: 5.2, einkauf: 1.6, lager: 1.8, buchhaltung: 5.8, versand: 1.6 }, auto: { vertrieb: 0, einkauf: 0, lager: .35, buchhaltung: 0, versand: .2 } },
    { spawnEvery: 2.0, speed: 115, service: { vertrieb: 4.6, einkauf: 1.4, lager: 1.6, buchhaltung: 0.7, versand: 1.4 }, auto: { vertrieb: 0, einkauf: 0, lager: .35, buchhaltung: 1, versand: .2 } },
    { spawnEvery: 1.6, speed: 145, service: { vertrieb: 0.6, einkauf: 1.2, lager: 1.4, buchhaltung: 0.6, versand: 1.2 }, auto: { vertrieb: 1, einkauf: .5, lager: .4, buchhaltung: 1, versand: .3 } },
    { spawnEvery: 1.2, speed: 240, service: { vertrieb: 0.5, einkauf: 0.6, lager: 0.7, buchhaltung: 0.5, versand: 0.6 }, auto: { vertrieb: 1, einkauf: 1, lager: .9, buchhaltung: 1, versand: .9 } }
  ];
  const DAY_FACTOR = 0.21;        // Sim-Sekunden -> "Tage" auf der Anzeige
  const GAP = 26 / LEN;           // Abstand zwischen wartenden Aufträgen
  const MAX_TOKENS = 18;

  const TYPES = [
    { key: 'anfrage', cls: 't-anfrage', w: .5 },
    { key: 'rechnung', cls: 't-rechnung', w: .3 },
    { key: 'lieferung', cls: 't-lieferung', w: .2 }
  ];
  function pickType() {
    let r = Math.random();
    for (const t of TYPES) { if ((r -= t.w) <= 0) return t; }
    return TYPES[0];
  }

  const proto = svg.querySelector('#tokenProto');
  const layer = svg.querySelector('#tokenLayer');
  const tokens = [];
  let simNow = 0, spawnTimer = 0, stage = -1, running = false;
  let orderNo = 1093, invoiceNo = 2031;

  // KPI-Messung: EMA der Durchlaufzeit + rollierendes Fenster für Auto-Quote
  let emaDays = 14;
  const autoWin = [];
  function recordStationDone(automated) {
    autoWin.push(automated ? 1 : 0);
    if (autoWin.length > 60) autoWin.shift();
  }

  function makeToken(type, opts) {
    const el = proto.cloneNode(true);
    el.removeAttribute('id');
    el.classList.add(type.cls);
    if (opts && opts.live) el.classList.add('live');
    el.style.visibility = 'visible';
    layer.appendChild(el);
    const tk = {
      el, type, p: 0, si: 0, state: 'move', born: simNow,
      no: type.key === 'rechnung' ? ++invoiceNo : ++orderNo,
      prio: !!(opts && opts.live)
    };
    if (opts && opts.live) gsap.from(el, { scale: 2.2, opacity: 0, duration: 0.5, ease: 'back.out(2)', transformOrigin: '50% 50%' });
    tokens.push(tk);
    return tk;
  }

  function renderToken(tk) {
    const pt = ptAt(tk.p);
    tk.el.setAttribute('transform', `translate(${pt.x.toFixed(1)},${pt.y.toFixed(1)})`);
  }

  function removeToken(tk) {
    const i = tokens.indexOf(tk);
    if (i >= 0) tokens.splice(i, 1);
    gsap.to(tk.el, { opacity: 0, scale: .4, duration: .35, transformOrigin: '50% 50%', onComplete: () => tk.el.remove() });
  }

  // --- Ticker ---
  let lastLog = -10;
  function log(text, mod, force) {
    if (!logEl) return;
    if (!force && simNow - lastLog < 1.4) return;
    lastLog = simNow;
    const line = document.createElement('div');
    line.className = 'firma-log-line' + (mod ? ' is-auto' : '');
    line.innerHTML = mod ? `<b>${mod}</b> ${text}` : text;
    logEl.prepend(line);
    while (logEl.children.length > 4) logEl.lastChild.remove();
    gsap.from(line, { y: -10, opacity: 0, duration: .4, ease: 'power2.out' });
  }

  function stationDone(st, tk) {
    const prof = PROFILE[Math.max(0, stage)];
    const automated = Math.random() < (prof.auto[st.key] || 0);
    recordStationDone(automated);
    if (automated && Math.random() < .5) {
      if (st.key === 'buchhaltung') log(STR.logDoc(tk.no), STR.mods.buchhaltung);
      else if (st.key === 'vertrieb') log(STR.logAgent(tk.no, (20 + Math.round(Math.random() * 25))), STR.mods.vertrieb);
      else if (stage >= 3 && Math.random() < .4) log(STR.logCockpit(), 'Cockpit');
    }
  }

  function tokenFinished(tk) {
    const days = Math.max(.5, (simNow - tk.born) * DAY_FACTOR);
    emaDays += (days - emaDays) * .22;
    if (Math.random() < .3) {
      const d = (Math.round(days * 10) / 10).toLocaleString(lang === 'de' ? 'de-DE' : 'en-US');
      log(stage >= 2 ? STR.logDoneFast(tk.no, d) : STR.logDone(tk.no, d));
    }
    removeToken(tk);
  }

  // Warteschlangen-Vorbefüllung: Stage 0 sieht sofort nach Stau aus.
  function preseed() {
    [['vertrieb', 3], ['buchhaltung', 3]].forEach(([key, count]) => {
      const sIdx = stations.findIndex(s => s.key === key);
      const st = stations[sIdx];
      for (let i = 0; i < count; i++) {
        const tk = makeToken(pickType());
        tk.state = 'queue';
        tk.si = sIdx;
        tk.born = simNow - (8 + i * 4);
        tk.p = st.at - (i + 1) * GAP;
        st.queue.push(tk);
        renderToken(tk);
      }
    });
  }

  // --- Herzschlag der Simulation ---
  function tick(time, dtMs) {
    if (!running || stage < 0) return;
    const dt = Math.min(dtMs / 1000, .08);
    simNow += dt;
    const prof = PROFILE[stage];

    // Nachschub
    spawnTimer -= dt;
    if (spawnTimer <= 0 && tokens.length < MAX_TOKENS) {
      makeToken(pickType());
      spawnTimer = prof.spawnEvery * (0.75 + Math.random() * .5);
    }

    const dp = (prof.speed * dt) / LEN;

    stations.forEach(st => {
      // Fertig bearbeitet -> weiterschicken
      if (st.current && simNow >= st.busyUntil) {
        const tk = st.current;
        st.current = null;
        stationDone(st, tk);
        tk.state = 'move';
        tk.si++;
      }
      // Nächsten aus der Schlange ziehen
      if (!st.current && st.queue.length) {
        const tk = st.queue.shift();
        st.current = tk;
        tk.state = 'proc';
        const base = prof.service[st.key];
        st.busyUntil = simNow + base * (tk.prio ? .5 : 1) * (0.8 + Math.random() * .4);
      }
      // Überlastungs-Optik
      if (st.room) {
        if (st.queue.length >= 3) st.room.classList.add('overload');
        else if (st.queue.length <= 1) st.room.classList.remove('overload');
      }
    });

    tokens.slice().forEach(tk => {
      if (tk.state === 'move') {
        tk.p += dp;
        const st = stations[tk.si];
        if (st) {
          const stopP = st.at - (st.queue.length + (st.current ? 1 : 0)) * GAP;
          if (tk.p >= stopP) {
            tk.p = Math.max(stopP, st.at - 8 * GAP);
            tk.state = 'queue';
            if (tk.prio) st.queue.unshift(tk); else st.queue.push(tk);
          }
        } else if (tk.p >= 1) {
          tokenFinished(tk);
          return;
        }
        renderToken(tk);
      } else if (tk.state === 'queue') {
        const st = stations[tk.si];
        const idx = st.queue.indexOf(tk);
        const slot = st.at - (idx + 1 + (st.current ? 1 : 0)) * GAP;
        if (tk.p < slot) { tk.p = Math.min(slot, tk.p + dp * 1.4); renderToken(tk); }
      } else if (tk.state === 'proc') {
        const st = stations[tk.si];
        if (tk.p < st.at) { tk.p = Math.min(st.at, tk.p + dp * 1.6); renderToken(tk); }
      }
    });

    // Gelegentliche Chaos-Meldungen in Stage 0/1
    if (stage <= 1 && Math.random() < dt * .25) {
      const buch = stations.find(s => s.key === 'buchhaltung');
      const vert = stations.find(s => s.key === 'vertrieb');
      if (stage === 0 && buch.queue.length >= 3) log(STR.logWaitBuch(buch.queue.length + 30));
      else if (vert.queue.length >= 3 && stage <= 1) log(STR.logWaitVertrieb(vert.queue.length + 12));
    }

    // KPIs anzeigen (gemessen)
    if (kpiDur) kpiDur.textContent = String(Math.max(1, Math.round(emaDays)));
    if (kpiAuto && autoWin.length >= 5) {
      const q = autoWin.reduce((a, b) => a + b, 0) / autoWin.length;
      kpiAuto.textContent = String(Math.max(1, Math.min(99, Math.round(q * 100))));
    }
  }
  gsap.ticker.add(tick);

  // Nur rechnen, wenn die Szene sichtbar ist (Akku, Performance)
  const io = new IntersectionObserver((entries) => {
    running = entries[0].isIntersecting && !document.hidden;
  }, { rootMargin: '120px' });
  io.observe(section);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) running = false;
  });

  /* =====================================================================
     AMBIENTE — Läufer, Funken, Tempo
     ===================================================================== */
  const simTweens = [];
  svg.querySelectorAll('.runner').forEach((r, i) => {
    const wp = '#wPath' + (i + 1);
    const walk = gsap.to(r, {
      motionPath: { path: wp, align: wp, alignOrigin: [0.5, 0.9] },
      duration: 6.5 + i * 1.4, ease: 'sine.inOut', repeat: -1, yoyo: true
    });
    simTweens.push(walk);
    const fig = r.querySelector('.fig');
    if (fig) simTweens.push(gsap.to(fig, { y: -2.5, duration: 0.32, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
  });
  gsap.utils.toArray('#boltLayer .bolt').forEach((b, i) => {
    gsap.fromTo(b, { x: 0, opacity: 0 }, {
      x: 130, opacity: 1, duration: 0.8, repeat: -1, repeatDelay: 0.55, delay: i * 0.45, ease: 'power1.in'
    });
  });
  const speed = { v: 0.55 };
  simTweens.forEach(t => t.timeScale(speed.v));
  function setSpeed(target) {
    gsap.to(speed, {
      v: target, duration: 1.2, ease: 'power2.out', overwrite: true,
      onUpdate: () => simTweens.forEach(t => t.timeScale(speed.v))
    });
  }

  /* =====================================================================
     STAGES — Module installieren
     ===================================================================== */
  gsap.set(['#chipDocflow', '#chipAgent', '#hudCockpit'], { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 50%' });

  const qVertrieb = gsap.utils.toArray('#queueVertrieb .paper');
  const qBuch = gsap.utils.toArray('#queueBuch .paper');
  const CHIP_POS = { 1: [318, 373], 2: [155, 91], 3: [580, 42] };

  function shockwave(x, y) {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('class', 'wave');
    c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 12);
    svg.appendChild(c);
    gsap.fromTo(c, { attr: { r: 12 }, opacity: .9 }, {
      attr: { r: 120 }, opacity: 0, duration: .9, ease: 'power2.out', onComplete: () => c.remove()
    });
  }

  function setStage(n) {
    if (n === stage) return;
    const prev = stage;
    stage = n;
    svg.classList.remove('s0', 's1', 's2', 's3');
    svg.classList.add('s' + n);
    steps.forEach((s, i) => s.classList.toggle('active', i === n));
    dots.forEach((d, i) => d.classList.toggle('on', i <= n));

    setSpeed([0.55, 1, 1.6, 2.4][n]);

    gsap.to('#chipDocflow', { autoAlpha: n >= 1 ? 1 : 0, scale: n >= 1 ? 1 : 0.6, duration: 0.5, ease: 'back.out(2)', overwrite: true });
    gsap.to('#chipAgent', { autoAlpha: n >= 2 ? 1 : 0, scale: n >= 2 ? 1 : 0.6, duration: 0.5, ease: 'back.out(2)', overwrite: true });
    gsap.to('#hudCockpit', { autoAlpha: n >= 3 ? 1 : 0, scale: n >= 3 ? 1 : 0.6, duration: 0.5, ease: 'back.out(2)', overwrite: true });

    // Einrast-Moment beim Installieren (nur vorwärts)
    if (prev >= 0 && n > prev) {
      for (let k = prev + 1; k <= n; k++) {
        if (CHIP_POS[k]) shockwave(CHIP_POS[k][0], CHIP_POS[k][1]);
        if (STR.logInstall[k]) log(STR.logInstall[k], null, true);
      }
    }

    // Papierstapel lösen sich auf, sobald das passende Modul da ist
    qBuch.forEach((p, i) => gsap.to(p, {
      autoAlpha: n >= 1 && i >= 2 ? 0 : 1, y: n >= 1 && i >= 2 ? -16 : 0,
      duration: 0.45, delay: i * 0.05, overwrite: true
    }));
    qVertrieb.forEach((p, i) => gsap.to(p, {
      autoAlpha: n >= 2 && i >= 1 ? 0 : 1, y: n >= 2 && i >= 1 ? -16 : 0,
      duration: 0.45, delay: i * 0.05, overwrite: true
    }));

    // Abschluss-CTA erst, wenn die Firma komplett läuft
    if (ctaEl) {
      if (n >= 3) { ctaEl.hidden = false; gsap.fromTo(ctaEl, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .5 }); }
      else ctaEl.hidden = true;
    }
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
        iv = setInterval(() => { n++; setStage(n); if (n >= 3) clearInterval(iv); }, 3200);
      }
    });
    return () => { st.kill(); if (iv) clearInterval(iv); };
  });

  preseed();

  /* =====================================================================
     TOOLTIPS — Live-Zahlen pro Abteilung (nur mit Maus)
     ===================================================================== */
  if (tipEl && window.matchMedia('(hover: hover)').matches) {
    const scene = section.querySelector('.firma-scene');
    const VB = { w: 1160, h: 660 };
    stations.forEach(st => {
      if (!st.room) return;
      st.room.classList.add('has-tip');
      st.room.addEventListener('pointerenter', () => {
        const bb = st.room.getBBox();
        tipEl.hidden = false;
        st.tipOpen = true;
        tipEl.style.left = ((bb.x + bb.width / 2) / VB.w * 100) + '%';
        tipEl.style.top = ((bb.y) / VB.h * 100) + '%';
        updateTip(st);
      });
      st.room.addEventListener('pointerleave', () => { st.tipOpen = false; tipEl.hidden = true; });
    });
    function updateTip(st) {
      const auto = (PROFILE[Math.max(0, stage)].auto[st.key] || 0) >= .5;
      tipEl.innerHTML = `<b>${STR.rooms[st.key]}</b>${STR.tipQueue(st.queue.length)} · ` +
        (auto ? `${STR.modAuto} <i>(${STR.mods[st.key]})</i>` : `${STR.modManual} (${STR.sysManual})`);
    }
    setInterval(() => {
      const open = stations.find(s => s.tipOpen);
      if (open && !tipEl.hidden) updateTip(open);
    }, 500);
  }

  /* =====================================================================
     LIVE-MODUS — Supabase Realtime (Broadcast + Presence)
     ===================================================================== */
  const orderBtn = document.getElementById('orderBtn');
  const rushBtn = document.getElementById('rushBtn');
  const badge = document.getElementById('liveBadge');
  const countEl = document.getElementById('liveCount');

  function spawnEil() {
    makeToken(TYPES[0], { live: true });
    log(STR.logEil(), null, true);
  }
  function spawnRush() {
    let k = 0;
    const iv = setInterval(() => {
      if (tokens.length < MAX_TOKENS + 6) makeToken(pickType());
      if (++k >= 8) clearInterval(iv);
    }, 320);
    log(STR.logRush(8), null, true);
  }

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
        .on('broadcast', { event: 'auftrag' }, () => spawnEil())
        .on('broadcast', { event: 'rush' }, () => spawnRush())
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

  function wireButton(btn, localFn, event) {
    if (!btn) return;
    let cooldown = false;
    btn.addEventListener('click', () => {
      if (cooldown) return;
      cooldown = true;
      btn.classList.add('cooling');
      setTimeout(() => { cooldown = false; btn.classList.remove('cooling'); }, 3000);
      localFn();
      if (channel) channel.send({ type: 'broadcast', event, payload: {} });
    });
  }
  wireButton(orderBtn, spawnEil, 'auftrag');
  wireButton(rushBtn, spawnRush, 'rush');
})();
