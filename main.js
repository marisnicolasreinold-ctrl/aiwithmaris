const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.innerWidth < 860;

// === 1. WebGL Three.js Hintergrund-Partikel-Szene ===
(function () {
  if (reduceMotion) return;
  if (typeof THREE === 'undefined') return;
  const canvas = document.getElementById('scene');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05060c, 0.055);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 14);

  const sprite = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.3, 'rgba(255,255,255,.6)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();

  const COUNT = isMobile ? 2200 : 5200;
  const pos = new Float32Array(COUNT * 3), col = new Float32Array(COUNT * 3);
  const cA = new THREE.Color(0x5ef0ff), cB = new THREE.Color(0x7c5cff), cC = new THREE.Color(0xff5ea8);

  for (let i = 0; i < COUNT; i++) {
    const r = 4 + Math.random() * 16, t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(p) * Math.cos(t);
    pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t) * 0.7;
    pos[i * 3 + 2] = r * Math.cos(p);
    const m = Math.random(), c = m < 0.55 ? cA : (m < 0.9 ? cB : cC);
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }

  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pg.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const points = new THREE.Points(pg, new THREE.PointsMaterial({
    size: 0.13,
    map: sprite,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.9
  }));
  scene.add(points);

  const ico = new THREE.IcosahedronGeometry(3.2, 1);
  const mesh = new THREE.LineSegments(new THREE.WireframeGeometry(ico), new THREE.LineBasicMaterial({
    color: 0x6fb6ff,
    transparent: true,
    opacity: 0.32
  }));
  scene.add(mesh);

  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 2), new THREE.MeshBasicMaterial({
    color: 0x9fd8ff,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending
  }));
  scene.add(core);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(5.4, 0.012, 8, 160), new THREE.MeshBasicMaterial({
    color: 0x7c5cff,
    transparent: true,
    opacity: 0.5
  }));
  ring.rotation.x = Math.PI * 0.5;
  scene.add(ring);

  // Szene für scroll-getriebene Farbreise nach außen reichen (motion.js)
  window.AXON_SCENE = { points, mesh, core, ring };

  let mx = 0, my = 0, tx = 0, ty = 0, sy = 0;
  addEventListener('mousemove', e => {
    tx = e.clientX / innerWidth - 0.5;
    ty = e.clientY / innerHeight - 0.5;
  });
  addEventListener('scroll', () => sy = window.scrollY);

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    mx += (tx - mx) * 0.04;
    my += (ty - my) * 0.04;
    points.rotation.y = t * 0.022 + mx * 0.4;
    points.rotation.x = my * 0.3;
    mesh.rotation.y = t * 0.12 + mx * 0.5;
    mesh.rotation.x = t * 0.05 + my * 0.4;
    mesh.scale.setScalar(1 + Math.sin(t * 0.9) * 0.04);
    core.rotation.y = -t * 0.2;
    core.rotation.x = t * 0.15;
    core.material.opacity = 0.1 + Math.sin(t * 1.4) * 0.05;
    ring.rotation.z = t * 0.1;
    ring.rotation.x = Math.PI * 0.5 + Math.sin(t * 0.3) * 0.25 + my * 0.5;
    camera.position.z = 14 + Math.min(sy * 0.004, 6);
    camera.position.x += (mx * 1.6 - camera.position.x) * 0.05;
    camera.position.y += (-my * 1.2 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  })();

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
})();

// === 2. Custom Cursor: entfernt (11.06.2026) — die Maus bleibt der normale
// Systemzeiger. Die .cursor-dot/.cursor-ring-Divs in den Seiten sind inert
// und werden per CSS ausgeblendet.

// === 3. Mobile Navigation Menü (Burger) ===
const nav = document.getElementById('nav');
if (nav) {
  addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40));
}

const burger = document.getElementById('burger');
const navlinks = document.getElementById('navlinks');
if (burger && navlinks) {
  function setMenu(open) {
    navlinks.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  }
  burger.addEventListener('click', () => setMenu(!navlinks.classList.contains('open')));
  navlinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navlinks.classList.contains('open')) setMenu(false);
  });
}

// === 4. Scroll Reveal IntersectionObserver ===
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) {
    e.target.classList.add('in');
    io.unobserve(e.target);
  }
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// === 5. Metrics / Counter Animation Observer ===
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target;
  const target = +el.dataset.count;
  const sfx = el.dataset.suffix || '';
  let cur = 0, step = target / 60;
  (function tick() {
    cur += step;
    if (cur >= target) el.textContent = target + sfx;
    else {
      el.textContent = Math.floor(cur) + sfx;
      requestAnimationFrame(tick);
    }
  })();
  cio.unobserve(el);
}), { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(c => cio.observe(c));

// === 6. Card & Panel Parallax Tilt Effects ===
if (!isMobile) {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', px * 100 + '%');
      card.style.setProperty('--my', py * 100 + '%');
      card.style.transform = `perspective(900px) rotateY(${(px - 0.5) * 8}deg) rotateX(${(0.5 - py) * 8}deg) translateZ(6px)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });

  const panel = document.getElementById('tiltPanel');
  if (panel) {
    addEventListener('mousemove', e => {
      const px = e.clientX / window.innerWidth - 0.5;
      const py = e.clientY / window.innerHeight - 0.5;
      panel.style.transform = `perspective(1000px) rotateY(${px * -6}deg) rotateX(${py * 6}deg)`;
    });
  }
}

// === 7. FAQ Akkordeon ===
document.querySelectorAll('.faq-q').forEach(btn => {
  const panel = document.getElementById(btn.getAttribute('aria-controls'));
  if (btn && panel) {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.style.maxHeight = open ? null : panel.scrollHeight + 'px';
    });
  }
});
window.addEventListener('resize', () => {
  document.querySelectorAll('.faq-q[aria-expanded="true"]').forEach(btn => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
  });
});

// === 8. Dekorative Icons konsequent vor Screenreadern verbergen ===
document.querySelectorAll('svg').forEach(s => {
  s.setAttribute('aria-hidden', 'true');
  s.setAttribute('focusable', 'false');
});

// Promo-Videos: bei reduzierter Bewegung nicht automatisch abspielen
(function () {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('video[data-promo-video]').forEach(function (v) {
    v.removeAttribute('autoplay');
    v.setAttribute('controls', '');
    try { v.pause(); } catch (e) {}
  });
})();

// === Anonyme, cookielose Reichweitenmessung ===
// Zählt nur Seitenaufrufe (Pfad + Tag) — keine Cookies, kein Profil.
// Respektiert "Do Not Track" und zählt nur auf den echten Domains.
(function () {
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl) return;
  if (!/(^|\.)aiwithmaris\.(com|de)$/.test(location.hostname)) return;
  var path = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  try {
    fetch('https://amrdmnnijbfwtrjcpocl.supabase.co/functions/v1/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: path }),
      keepalive: true
    }).catch(function () { /* Zählung ist optional */ });
  } catch (e) { /* egal */ }
})();
