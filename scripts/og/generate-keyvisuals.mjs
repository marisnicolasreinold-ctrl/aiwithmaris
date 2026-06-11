// Erzeugt die Key-Visuals der Seite (assets/img/) — generative Neon-Grafiken
// im Marken-Look: dunkler Grund, Farbreise Cyan → Violett → Pink → Türkis
// (vgl. motion.js), Partikel, Netz-Meshes, weiche Glows.
// Pipeline wie bei den OG-Bildern: SVG (hier direkt erzeugt) → resvg → PNG
// → sharp → AVIF + WebP in zwei Größen.
// Aufruf: cd scripts/og && node generate-keyvisuals.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "assets/img");

const W = 1600, H = 1000;
const BG = "#05060c";
const C = {
  cyan: "#5ef0ff", blue: "#6fb6ff", violet: "#7c5cff", lilac: "#8d6bff",
  pink: "#ff5ea8", rose: "#ff7cc0", mint: "#64ffd9", gold: "#ffd479",
  ink: "#eef1fa",
};

// Deterministischer Zufall, damit jeder Lauf identische Bilder liefert.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f1 = (n) => Number(n.toFixed(1));

// --- Gemeinsame Bausteine -------------------------------------------------

function defs(accentA, accentB) {
  return `<defs>
  <radialGradient id="glowA" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="${accentA}" stop-opacity=".34"/>
    <stop offset="100%" stop-color="${accentA}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="glowB" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="${accentB}" stop-opacity=".26"/>
    <stop offset="100%" stop-color="${accentB}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${accentA}"/>
    <stop offset="100%" stop-color="${accentB}"/>
  </linearGradient>
  <radialGradient id="core" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity=".95"/>
    <stop offset="28%" stop-color="${accentA}" stop-opacity=".75"/>
    <stop offset="100%" stop-color="${accentA}" stop-opacity="0"/>
  </radialGradient>
  <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="10"/>
  </filter>
  <filter id="haze" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="26"/>
  </filter>
  <radialGradient id="vig" cx="50%" cy="46%" r="72%">
    <stop offset="0%" stop-color="#000" stop-opacity="0"/>
    <stop offset="78%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000" stop-opacity=".55"/>
  </radialGradient>
</defs>`;
}

function backdrop(ax, ay, bx, by) {
  return `<rect width="${W}" height="${H}" fill="${BG}"/>
  <ellipse cx="${ax}" cy="${ay}" rx="760" ry="560" fill="url(#glowA)"/>
  <ellipse cx="${bx}" cy="${by}" rx="700" ry="520" fill="url(#glowB)"/>`;
}

// Feines perspektivisches Bodenraster wie unter der Three.js-Szene.
function grid(color, horizon = 640) {
  let s = `<g stroke="${color}" stroke-opacity=".09" stroke-width="1.4" fill="none">`;
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const y = horizon + (H - horizon) * t * t;
    s += `<line x1="0" y1="${f1(y)}" x2="${W}" y2="${f1(y)}"/>`;
  }
  for (let i = -10; i <= 22; i++) {
    const x0 = (i / 12) * W;
    const xe = W / 2 + (x0 - W / 2) * 2.6;
    s += `<line x1="${f1(x0)}" y1="${horizon}" x2="${f1(xe)}" y2="${H}"/>`;
  }
  return s + `</g>`;
}

function starfield(r, n, colors) {
  let s = `<g>`;
  for (let i = 0; i < n; i++) {
    const x = f1(r() * W), y = f1(r() * H);
    const rad = f1(0.8 + r() * 2.2);
    const c = colors[Math.floor(r() * colors.length)];
    s += `<circle cx="${x}" cy="${y}" r="${rad}" fill="${c}" fill-opacity="${f1(0.12 + r() * 0.5)}"/>`;
  }
  return s + `</g>`;
}

// Neon-Strich: weiche, breite Kopie unten + scharfe Linie oben.
const neon = (d, color, w = 3, op = 1) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w * 3.4}" stroke-opacity="${0.35 * op}" filter="url(#soft)" stroke-linecap="round"/>` +
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-opacity="${op}" stroke-linecap="round"/>`;

const node = (x, y, rad, color, coreOp = 1) =>
  `<circle cx="${x}" cy="${y}" r="${rad * 3}" fill="${color}" fill-opacity=".22" filter="url(#soft)"/>` +
  `<circle cx="${x}" cy="${y}" r="${rad}" fill="${color}" fill-opacity="${coreOp}"/>` +
  `<circle cx="${x}" cy="${y}" r="${rad + 7}" fill="none" stroke="${color}" stroke-opacity=".5" stroke-width="1.6"/>`;

const vignette = () => `<rect width="${W}" height="${H}" fill="url(#vig)"/>`;

const wrap = (inner) => `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

// --- Motive ----------------------------------------------------------------

// 01 · Agent-Flow: Knoten-Pipeline mit Verzweigung, Prüf-Knoten und Freigabe.
function agentFlow() {
  const r = rng(11);
  const lane = 500;
  const xs = [180, 480, 800, 1120, 1430];
  let g = "";
  // Flussbänder
  g += neon(`M${xs[0]} ${lane} C 320 ${lane}, 360 ${lane}, ${xs[1]} ${lane}`, C.lilac, 3);
  g += neon(`M${xs[1]} ${lane} C 600 380, 680 360, ${xs[2]} 380`, C.violet, 2.6, 0.9);
  g += neon(`M${xs[1]} ${lane} C 600 620, 680 640, ${xs[2]} 620`, C.pink, 2.6, 0.9);
  g += neon(`M${xs[2]} 380 C 940 400, 980 460, ${xs[3]} ${lane}`, C.violet, 2.6, 0.9);
  g += neon(`M${xs[2]} 620 C 940 600, 980 540, ${xs[3]} ${lane}`, C.pink, 2.6, 0.9);
  g += neon(`M${xs[3]} ${lane} C 1260 ${lane}, 1300 ${lane}, ${xs[4]} ${lane}`, C.rose, 3);
  // Revisions-Loop um den Prüf-Knoten
  g += neon(`M${xs[3]} ${lane - 18} C 1080 360, 1180 360, ${xs[3] + 22} ${lane - 16}`, C.gold, 2, 0.75);
  // Knoten
  g += node(xs[0], lane, 13, C.lilac);
  g += node(xs[1], lane, 17, C.violet);
  g += node(xs[2], 380, 13, C.violet);
  g += node(xs[2], 620, 13, C.pink);
  g += node(xs[3], lane, 19, C.gold);
  g += node(xs[4], lane, 15, C.rose);
  // Freigabe-Haken im letzten Knoten
  g += `<path d="M${xs[4] - 7} ${lane} l5 6 l10 -13" fill="none" stroke="#05060c" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  // kleine Datenpunkte entlang der Bahnen
  for (let i = 0; i < 14; i++) {
    const x = 200 + r() * 1200, y = lane + (r() - 0.5) * 300;
    g += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(1.6 + r() * 2)}" fill="${r() > 0.5 ? C.lilac : C.rose}" fill-opacity=".5"/>`;
  }
  return wrap(defs(C.violet, C.pink) + backdrop(400, 320, 1250, 700) + grid(C.lilac) +
    starfield(r, 90, [C.lilac, C.rose, C.ink]) + g + vignette());
}

// 02 · ATLAS: „Jarvis"-Kugel — Drahtgitter-Sphäre mit Ringen und Messbalken.
function atlas() {
  const r = rng(22);
  const cx = 800, cy = 470, R = 280;
  let g = `<circle cx="${cx}" cy="${cy}" r="${R * 1.7}" fill="url(#core)" opacity=".7" filter="url(#haze)"/>`;
  // Längengrade
  for (let i = 0; i < 6; i++) {
    const rx = Math.abs(Math.cos((i / 6) * Math.PI)) * R;
    g += `<ellipse cx="${cx}" cy="${cy}" rx="${f1(Math.max(rx, 6))}" ry="${R}" fill="none" stroke="${C.cyan}" stroke-opacity="${i === 0 ? 0.95 : 0.6}" stroke-width="${i === 0 ? 3 : 1.8}"/>`;
  }
  // Breitengrade
  for (let i = 1; i < 6; i++) {
    const t = (i / 6) * 2 - 1;
    const ry = Math.sqrt(Math.max(0, 1 - t * t));
    g += `<ellipse cx="${cx}" cy="${f1(cy + t * R)}" rx="${f1(ry * R)}" ry="${f1(ry * R * 0.22)}" fill="none" stroke="${C.blue}" stroke-opacity=".55" stroke-width="1.8"/>`;
  }
  // Orbit-Ringe (wie der Ring der Three.js-Szene)
  g += `<g transform="rotate(-16 ${cx} ${cy})"><ellipse cx="${cx}" cy="${cy}" rx="${R * 1.45}" ry="${R * 0.4}" fill="none" stroke="${C.violet}" stroke-opacity=".9" stroke-width="3.4"/></g>`;
  g += `<g transform="rotate(-16 ${cx} ${cy})"><ellipse cx="${cx}" cy="${cy}" rx="${R * 1.45}" ry="${R * 0.4}" fill="none" stroke="${C.violet}" stroke-opacity=".4" stroke-width="12" filter="url(#soft)"/></g>`;
  g += `<circle cx="${cx}" cy="${cy}" r="78" fill="url(#core)"/>`;
  g += `<circle cx="${cx}" cy="${cy}" r="26" fill="#fff" fill-opacity=".92"/>`;
  // Status-Punkte auf der Sphäre + schwebende Messbalken links/rechts
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2, rr = R * (0.35 + r() * 0.6);
    g += `<circle cx="${f1(cx + Math.cos(a) * rr)}" cy="${f1(cy + Math.sin(a) * rr * 0.9)}" r="${f1(2.6 + r() * 3.6)}" fill="${r() > 0.7 ? C.gold : C.cyan}" fill-opacity=".95"/>`;
  }
  const bars = (bx, by, vals, col) => vals.map((v, i) =>
    `<rect x="${bx + i * 26}" y="${by - v}" width="14" height="${v}" rx="4" fill="${col}" fill-opacity=".75"/>`).join("");
  g += bars(250, 700, [46, 84, 60, 110, 72], C.cyan);
  g += bars(1230, 420, [90, 52, 120, 70, 96], C.violet);
  g += `<line x1="240" y1="706" x2="384" y2="706" stroke="${C.cyan}" stroke-opacity=".4" stroke-width="1.6"/>`;
  g += `<line x1="1220" y1="426" x2="1364" y2="426" stroke="${C.violet}" stroke-opacity=".4" stroke-width="1.6"/>`;
  return wrap(defs(C.cyan, C.violet) + backdrop(800, 430, 380, 760) + grid(C.cyan) +
    starfield(r, 110, [C.cyan, C.blue, C.ink]) + g + vignette());
}

// 03 · APEX: Pulslinie (HRV) über volle Breite + Bereitschafts-Ring.
function apex() {
  const r = rng(33);
  const mid = 540;
  let d = `M-20 ${mid}`;
  let x = -20;
  while (x < W + 20) {
    const seg = 90 + r() * 130;
    if (r() > 0.45 && x > 150 && x < 1150) {
      // Herzschlag-Ausschlag
      d += ` L${f1(x + seg * 0.30)} ${mid} L${f1(x + seg * 0.42)} ${f1(mid - 140 - r() * 120)} L${f1(x + seg * 0.54)} ${f1(mid + 90 + r() * 60)} L${f1(x + seg * 0.64)} ${mid}`;
    } else {
      d += ` C ${f1(x + seg * 0.3)} ${f1(mid - 24 + r() * 48)}, ${f1(x + seg * 0.7)} ${f1(mid - 24 + r() * 48)}, ${f1(x + seg)} ${mid}`;
    }
    x += seg;
  }
  let g = neon(d, C.mint, 3.4);
  // Bereitschafts-Ring rechts: 78 % Bogen
  const cx = 1240, cy = 350, R = 150;
  g += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.ink}" stroke-opacity=".12" stroke-width="14"/>`;
  const a = -Math.PI / 2 + Math.PI * 2 * 0.78;
  const lx = f1(cx + Math.cos(a) * R), ly = f1(cy + Math.sin(a) * R);
  const arc = `M${cx} ${cy - R} A${R} ${R} 0 1 1 ${lx} ${ly}`;
  g += `<path d="${arc}" fill="none" stroke="${C.mint}" stroke-opacity=".3" stroke-width="30" filter="url(#soft)" stroke-linecap="round"/>`;
  g += `<path d="${arc}" fill="none" stroke="url(#ribbon)" stroke-width="14" stroke-linecap="round"/>`;
  g += `<circle cx="${cx}" cy="${cy}" r="58" fill="url(#core)" opacity=".8"/>`;
  // Schlafphasen-Punkte unten links
  for (let i = 0; i < 7; i++) {
    const px = 200 + i * 64, ph = 760 + Math.sin(i * 1.1) * 26;
    g += `<circle cx="${px}" cy="${f1(ph)}" r="${i === 3 ? 11 : 7}" fill="${i === 3 ? C.cyan : C.mint}" fill-opacity="${i === 3 ? 0.95 : 0.55}"/>`;
    if (i) g += `<line x1="${px - 64}" y1="${f1(760 + Math.sin((i - 1) * 1.1) * 26)}" x2="${px}" y2="${f1(ph)}" stroke="${C.mint}" stroke-opacity=".35" stroke-width="1.6"/>`;
  }
  return wrap(defs(C.mint, C.cyan) + backdrop(1240, 350, 300, 700) + grid(C.mint) +
    starfield(r, 90, [C.mint, C.cyan, C.ink]) + g + vignette());
}

// 04 · FlowOps: Sensor-Mesh mit einem pink eskalierenden Alarm-Knoten.
function flowops() {
  const r = rng(44);
  const pts = [];
  for (let i = 0; i < 26; i++) pts.push([120 + r() * 1360, 160 + r() * 680]);
  let g = "";
  // Kanten zwischen nahen Knoten
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1];
    const dist = Math.hypot(dx, dy);
    if (dist < 300) g += `<line x1="${f1(pts[i][0])}" y1="${f1(pts[i][1])}" x2="${f1(pts[j][0])}" y2="${f1(pts[j][1])}" stroke="${C.blue}" stroke-opacity="${f1(0.34 * (1 - dist / 300))}" stroke-width="1.6"/>`;
  }
  for (const [x, y] of pts) g += node(f1(x), f1(y), f1(4 + r() * 5), r() > 0.75 ? C.cyan : C.blue, 0.9);
  // Alarm-Knoten mit Eskalationsringen
  const ax = 1050, ay = 400;
  for (let i = 1; i <= 3; i++) g += `<circle cx="${ax}" cy="${ay}" r="${30 + i * 34}" fill="none" stroke="${C.pink}" stroke-opacity="${f1(0.5 - i * 0.12)}" stroke-width="2.4"/>`;
  g += node(ax, ay, 14, C.pink);
  g += neon(`M${ax} ${ay} C 1180 300, 1280 280, 1400 250`, C.pink, 2.2, 0.8);
  g += node(1400, 250, 9, C.rose);
  return wrap(defs(C.blue, C.cyan) + backdrop(500, 300, 1200, 650) + grid(C.blue) +
    starfield(r, 80, [C.blue, C.cyan, C.ink]) + g + vignette());
}

// 05 · DocFlow: glühende Dokumente fließen in ein strukturiertes Feld-Raster.
function docflow() {
  const r = rng(55);
  let g = "";
  // drei Dokumente links, leicht gefächert
  const doc = (x, y, rot, op) => `<g transform="rotate(${rot} ${x + 110} ${y + 140})">
    <rect x="${x}" y="${y}" width="220" height="280" rx="14" fill="#0d1020" fill-opacity="${op}" stroke="${C.gold}" stroke-opacity=".55" stroke-width="2"/>
    ${[0, 1, 2, 3, 4].map((i) => `<line x1="${x + 26}" y1="${y + 48 + i * 40}" x2="${x + 26 + (i % 2 ? 120 : 165)}" y2="${y + 48 + i * 40}" stroke="${C.ink}" stroke-opacity=".3" stroke-width="6" stroke-linecap="round"/>`).join("")}
    <circle cx="${x + 180}" cy="${y + 236}" r="14" fill="none" stroke="${C.gold}" stroke-opacity=".8" stroke-width="2.4"/>
    <path d="M${x + 173} ${y + 236} l5 6 l9 -12" fill="none" stroke="${C.gold}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
  g += doc(170, 280, -7, 0.92) + doc(260, 330, 4, 0.96) + doc(360, 290, 12, 1);
  // Extraktions-Bänder zum Raster
  g += neon(`M600 460 C 760 460, 800 380, 980 380`, C.gold, 2.6, 0.9);
  g += neon(`M600 500 C 770 510, 810 500, 980 490`, C.cyan, 2.6, 0.9);
  g += neon(`M600 540 C 760 560, 800 610, 980 600`, C.blue, 2.6, 0.9);
  // Feld-Raster rechts (strukturierte Daten)
  for (let row = 0; row < 4; row++) for (let col = 0; col < 3; col++) {
    const x = 1000 + col * 170, y = 330 + row * 95;
    const hot = (row + col) % 3 === 0;
    g += `<rect x="${x}" y="${y}" width="146" height="64" rx="10" fill="${hot ? C.gold : C.ink}" fill-opacity="${hot ? 0.16 : 0.05}" stroke="${hot ? C.gold : C.cyan}" stroke-opacity="${hot ? 0.7 : 0.3}" stroke-width="1.6"/>`;
    g += `<line x1="${x + 18}" y1="${y + 32}" x2="${x + 18 + 60 + ((row * 3 + col) % 4) * 14}" y2="${y + 32}" stroke="${hot ? C.gold : C.ink}" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/>`;
  }
  // Datenpartikel auf den Bändern
  for (let i = 0; i < 10; i++) {
    g += `<circle cx="${f1(640 + r() * 320)}" cy="${f1(400 + r() * 200)}" r="${f1(2 + r() * 2.4)}" fill="${[C.gold, C.cyan, C.blue][i % 3]}" fill-opacity=".8"/>`;
  }
  return wrap(defs(C.gold, C.cyan) + backdrop(350, 420, 1200, 480) + grid(C.gold) +
    starfield(r, 80, [C.gold, C.cyan, C.ink]) + g + vignette());
}

// 06 · PulseCRM: Pipeline-Trichter — Lead-Punkte bündeln sich zur Abschluss-Bahn.
function pulsecrm() {
  const r = rng(66);
  let g = "";
  // Trichter-Hüllkurven: weites Feld links bündelt sich zur Abschluss-Bahn
  g += neon(`M120 220 C 560 270, 920 420, 1380 490`, C.violet, 4, 0.95);
  g += neon(`M120 500 C 600 500, 940 500, 1380 500`, C.lilac, 4.6);
  g += neon(`M120 780 C 560 730, 920 580, 1380 510`, C.pink, 4, 0.95);
  // drei Spalten-Zonen mit Deal-Punkten, nach rechts dichter an der Mittelbahn
  const lanes = [[300, 250], [720, 150], [1060, 70]];
  for (let li = 0; li < lanes.length; li++) {
    const [lx, spread] = lanes[li];
    for (let i = 0; i < 10 - li * 2; i++) {
      const y = 500 + (r() - 0.5) * spread * 2;
      const col = li === 2 ? C.pink : li === 1 ? C.lilac : C.violet;
      const x = f1(lx + (r() - 0.5) * 150);
      g += `<line x1="${x}" y1="${f1(y)}" x2="${f1(x + 120 + r() * 90)}" y2="${f1(500 + (y - 500) * 0.55)}" stroke="${col}" stroke-opacity=".3" stroke-width="1.6"/>`;
      g += node(x, f1(y), f1(6 + r() * 7 + li * 2), col, 0.95);
    }
    g += `<line x1="${lx + 110}" y1="${500 - spread - 70}" x2="${lx + 110}" y2="${500 + spread + 70}" stroke="${C.ink}" stroke-opacity=".18" stroke-width="1.8" stroke-dasharray="3 9"/>`;
  }
  g += node(1380, 500, 24, C.rose);
  g += `<circle cx="1380" cy="500" r="80" fill="url(#core)" opacity=".85"/>`;
  g += `<path d="M1370 500 l7 8 l14 -18" fill="none" stroke="#05060c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  // Umsatz-Balken unten rechts
  [38, 64, 50, 92, 78, 120].forEach((v, i) => {
    g += `<rect x="${1130 + i * 36}" y="${830 - v}" width="22" height="${v}" rx="6" fill="url(#ribbon)" fill-opacity=".9"/>`;
  });
  return wrap(defs(C.violet, C.pink) + backdrop(450, 650, 1250, 380) + grid(C.lilac) +
    starfield(r, 90, [C.lilac, C.rose, C.ink]) + g + vignette());
}

// 07 · Orbit (Über mich): persönliche Konstellation — Kern mit Bahnen,
// auf denen Projekte als Knoten kreisen. Ruhiger, zentrierter Aufbau.
function orbit() {
  const r = rng(77);
  const cx = 800, cy = 500;
  let g = `<circle cx="${cx}" cy="${cy}" r="300" fill="url(#core)" opacity=".4" filter="url(#haze)"/>`;
  const orbits = [[200, 0.36, -10, C.cyan], [320, 0.4, 6, C.violet], [445, 0.44, -3, C.mint]];
  for (const [R, squash, rot, col] of orbits) {
    g += `<g transform="rotate(${rot} ${cx} ${cy})"><ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${f1(R * squash)}" fill="none" stroke="${col}" stroke-opacity=".5" stroke-width="1.8"/></g>`;
  }
  // Knoten auf den Bahnen
  const sat = (R, squash, rot, angle, col, rad) => {
    const a = (angle * Math.PI) / 180;
    const px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R * squash;
    const ra = (rot * Math.PI) / 180;
    const qx = cx + (px - cx) * Math.cos(ra) - (py - cy) * Math.sin(ra);
    const qy = cy + (px - cx) * Math.sin(ra) + (py - cy) * Math.cos(ra);
    return node(f1(qx), f1(qy), rad, col);
  };
  g += sat(200, 0.36, -10, 215, C.cyan, 11);
  g += sat(320, 0.4, 6, 25, C.violet, 13);
  g += sat(320, 0.4, 6, 150, C.lilac, 9);
  g += sat(445, 0.44, -3, 320, C.mint, 10);
  g += sat(445, 0.44, -3, 100, C.gold, 8);
  g += `<circle cx="${cx}" cy="${cy}" r="64" fill="url(#core)"/>`;
  g += `<circle cx="${cx}" cy="${cy}" r="26" fill="#fff" fill-opacity=".9"/>`;
  return wrap(defs(C.cyan, C.violet) + backdrop(800, 480, 420, 760) + grid(C.cyan) +
    starfield(r, 130, [C.cyan, C.lilac, C.mint, C.ink]) + g + vignette());
}

// 08 · Problem (Scrollytelling Kapitel 1): verhedderte Fäden, gedämpfte
// Farben — der Alltag ohne KI. Ein pinker Knoten markiert, wo es klemmt.
function problem() {
  const r = rng(88);
  let g = "";
  // wirres Geflecht aus Bezier-Fäden in gedeckten Tönen
  for (let i = 0; i < 26; i++) {
    const y0 = 120 + r() * 760, y1 = 120 + r() * 760;
    const c1x = 300 + r() * 1000, c1y = 60 + r() * 880;
    const c2x = 300 + r() * 1000, c2y = 60 + r() * 880;
    const col = r() > 0.82 ? C.pink : r() > 0.5 ? "#5a6486" : "#3c4360";
    const op = col === C.pink ? 0.55 : 0.5;
    g += `<path d="M${f1(-40 + r() * 120)} ${f1(y0)} C ${f1(c1x)} ${f1(c1y)}, ${f1(c2x)} ${f1(c2y)}, ${f1(W + 40 - r() * 120)} ${f1(y1)}" fill="none" stroke="${col}" stroke-opacity="${op}" stroke-width="${f1(1.6 + r() * 2.2)}"/>`;
  }
  // der Knoten, an dem sich alles staut
  const kx = 980, ky = 430;
  for (let i = 0; i < 9; i++) {
    const a0 = r() * Math.PI * 2, a1 = a0 + 2 + r() * 3;
    const rr = 40 + r() * 80;
    g += `<path d="M${f1(kx + Math.cos(a0) * rr)} ${f1(ky + Math.sin(a0) * rr * 0.8)} Q ${kx} ${ky}, ${f1(kx + Math.cos(a1) * rr)} ${f1(ky + Math.sin(a1) * rr * 0.8)}" fill="none" stroke="${C.pink}" stroke-opacity=".6" stroke-width="2.2"/>`;
  }
  g += `<circle cx="${kx}" cy="${ky}" r="90" fill="${C.pink}" fill-opacity=".16" filter="url(#haze)"/>`;
  g += node(kx, ky, 13, C.pink);
  // gestapelte, leicht gekippte "Zettel" unten links
  for (let i = 0; i < 4; i++) {
    g += `<g transform="rotate(${-9 + i * 5} ${300 + i * 26} ${720})"><rect x="${250 + i * 26}" y="${640 + i * 14}" width="170" height="120" rx="10" fill="#0d1020" fill-opacity=".9" stroke="#5a6486" stroke-opacity=".6" stroke-width="1.6"/></g>`;
  }
  return wrap(defs(C.pink, "#5a6486") + backdrop(980, 430, 350, 700) + grid("#5a6486") +
    starfield(r, 70, ["#5a6486", C.rose, C.ink]) + g + vignette());
}

// --- Render & Export --------------------------------------------------------

const MOTIFS = {
  "kv-agent-flow": agentFlow,
  "kv-atlas": atlas,
  "kv-apex": apex,
  "kv-flowops": flowops,
  "kv-docflow": docflow,
  "kv-pulsecrm": pulsecrm,
  "kv-orbit": orbit,
  "kv-problem": problem,
};

await mkdir(OUT, { recursive: true });
const only = process.argv[2];
for (const [name, fn] of Object.entries(MOTIFS)) {
  if (only && name !== only) continue;
  const svg = fn();
  const png = new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng();
  const img = sharp(png);
  const [a, w1, w2] = await Promise.all([
    img.clone().avif({ quality: 52 }).toBuffer(),
    img.clone().webp({ quality: 82 }).toBuffer(),
    img.clone().resize(800).webp({ quality: 80 }).toBuffer(),
  ]);
  await Promise.all([
    writeFile(path.join(OUT, `${name}-1600.avif`), a),
    writeFile(path.join(OUT, `${name}-1600.webp`), w1),
    writeFile(path.join(OUT, `${name}-800.webp`), w2),
  ]);
  console.log(`${name}: avif ${(a.length / 1024).toFixed(0)}K · webp ${(w1.length / 1024).toFixed(0)}K / ${(w2.length / 1024).toFixed(0)}K`);
}
