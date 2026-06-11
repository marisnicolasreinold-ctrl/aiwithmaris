// Erzeugt den Intro-Soundtrack (public/intro-music.wav) komplett im Code —
// lizenzfrei, deterministisch, exakt auf die Szenen-Frames des Intros gemappt.
//
//   node make-music.mjs
//
// Szenen (30 fps): Boot 0s · Wordmark-Hit 3.467s (Frame 104) ·
// Tagline 6.6s (198) · Säulen 9.533s (286) · CTA-Hit 11.8s (354) · Ende 15.667s

import { writeFileSync } from "node:fs";

const SR = 44100;
const DUR = 15.667;
const N = Math.floor(SR * DUR);

const HIT1 = 3.467;   // Wordmark
const TAG = 6.6;      // Tagline
const PIL = 9.533;    // Säulen
const HIT2 = 11.8;    // CTA
const END = DUR;

/* ---------- deterministisches Rauschen ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- Noten (Hz) ---------- */
const F = {
  A1: 55, F2: 87.31, A2: 110, C3: 130.81, E3: 164.81, F3: 174.61, G3: 196,
  A3: 220, B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, G4: 392,
  A4: 440, C5: 523.25, D5: 587.33, E5: 659.26, G5: 783.99, A5: 880,
};

/* Akkord-Fahrplan: [Startzeit, Endzeit, Noten] */
const CHORDS = [
  [HIT1, TAG + 0.6, [F.A2, F.E3, F.B3, F.C4, F.E4]],          // Am9
  [TAG, PIL + 0.6, [F.F2, F.C3, F.E3, F.A3, F.C4]],           // Fmaj7
  [PIL, HIT2 + 0.4, [F.C3, F.G3, F.B3, F.D4, F.E4]],          // Cmaj9
  [HIT2, END - 0.4, [F.A2, F.E3, F.A3, F.B3, F.C4, F.E4, F.A4]], // Am(add9) breit
];

/* Arpeggio ab der Tagline: Achtel, A-Moll-Pentatonik, mit Echo */
const ARP_START = TAG + 0.1;
const ARP_STEP = 0.25;
const ARP_NOTES = [F.A4, F.C5, F.E5, F.D5, F.A4, F.G4, F.C5, F.E5];
const ARP_END = HIT2 + 1.6;

/* Bass folgt den Akkorden */
const BASS = [
  [HIT1, TAG, F.A1],
  [TAG, PIL, F.F2 / 2],
  [PIL, HIT2, F.C3 / 2],
  [HIT2, END - 1.4, F.A1],
];

function softSaw(ph) {
  // bandbegrenzte Säge: 6 Teiltöne
  let s = 0;
  for (let k = 1; k <= 6; k++) s += Math.sin(ph * k) / k;
  return s * 0.55;
}

function renderChannel(chan) {
  const out = new Float64Array(N);
  const rnd = mulberry32(1234 + chan * 999);
  const detune = chan === 0 ? 1.0015 : 0.9985;

  /* --- Drone: A1 + A2, langsam atmend --- */
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const env =
      Math.min(1, t / 1.4) *
      (t > END - 1.6 ? Math.max(0, (END - t) / 1.6) : 1);
    const breathe = 0.75 + 0.25 * Math.sin(2 * Math.PI * 0.09 * t + chan);
    out[i] +=
      env * breathe *
      (0.16 * Math.sin(2 * Math.PI * F.A1 * t) +
        0.08 * Math.sin(2 * Math.PI * F.A2 * detune * t) +
        0.035 * softSaw(2 * Math.PI * F.A2 * 1.005 * t));
  }

  /* --- Boot-Ticks (0.5–2.8s, 8 pro Sekunde, sehr leise) --- */
  for (let tick = 0.5; tick < 2.8; tick += 0.125) {
    const start = Math.floor(tick * SR);
    for (let j = 0; j < SR * 0.012; j++) {
      const i = start + j;
      if (i >= N) break;
      const e = Math.exp(-j / (SR * 0.0025));
      out[i] += (rnd() - 0.5) * 0.05 * e;
    }
  }

  /* --- Pads (Akkorde) --- */
  for (const [t0, t1, notes] of CHORDS) {
    for (let v = 0; v < notes.length; v++) {
      const f = notes[v] * (1 + (v % 2 === chan ? 0.0012 : -0.0012));
      const phOff = rnd() * Math.PI * 2;
      const i0 = Math.floor(t0 * SR);
      const i1 = Math.min(N, Math.floor((t1 + 1.3) * SR));
      for (let i = i0; i < i1; i++) {
        const t = i / SR;
        const rel = t - t0;
        const att = Math.min(1, rel / 0.9);
        const relEnd = t1 - t;
        const relGain = relEnd > 0 ? 1 : Math.max(0, 1 + relEnd / 1.3);
        const lfo = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.21 * t + phOff);
        const sig =
          0.6 * Math.sin(2 * Math.PI * f * t + phOff) +
          0.4 * softSaw(2 * Math.PI * f * t + phOff);
        out[i] += sig * 0.052 * att * relGain * lfo;
      }
    }
  }

  /* --- Bass-Puls: weiche Achtel --- */
  for (const [t0, t1, f] of BASS) {
    for (let beat = t0; beat < t1; beat += 0.5) {
      const i0 = Math.floor(beat * SR);
      const len = Math.floor(SR * 0.42);
      for (let j = 0; j < len; j++) {
        const i = i0 + j;
        if (i >= N) break;
        const t = j / SR;
        const e = Math.min(1, t / 0.02) * Math.exp(-t / 0.22);
        out[i] += 0.11 * e * Math.sin(2 * Math.PI * f * (i / SR));
      }
    }
  }

  /* --- Arpeggio-Plucks mit Echo --- */
  const arp = new Float64Array(N);
  let step = 0;
  for (let tNote = ARP_START; tNote < ARP_END; tNote += ARP_STEP, step++) {
    if (step % 8 === 6 || step % 8 === 7) continue; // Luft lassen
    const f = ARP_NOTES[step % ARP_NOTES.length];
    const pan = step % 2 === chan ? 1 : 0.55;
    const i0 = Math.floor(tNote * SR);
    const len = Math.floor(SR * 0.5);
    for (let j = 0; j < len; j++) {
      const i = i0 + j;
      if (i >= N) break;
      const t = j / SR;
      const e = Math.min(1, t / 0.004) * Math.exp(-t / 0.16);
      arp[i] +=
        pan * 0.085 * e *
        (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t));
    }
  }
  // Echo: 0.375s (punktierte Achtel), Feedback 0.4
  const dl = Math.floor(SR * 0.375);
  for (let i = dl; i < N; i++) arp[i] += arp[i - dl] * 0.4;
  for (let i = 0; i < N; i++) out[i] += arp[i];

  /* --- Riser vor den Hits --- */
  const risers = [
    [HIT1 - 1.0, HIT1, 0.10],
    [TAG - 0.5, TAG, 0.05],
    [PIL - 0.5, PIL, 0.05],
    [HIT2 - 1.2, HIT2, 0.14],
  ];
  let lp = 0;
  for (const [r0, r1, gain] of risers) {
    const i0 = Math.floor(r0 * SR);
    const i1 = Math.floor(r1 * SR);
    for (let i = i0; i < i1; i++) {
      const p = (i - i0) / (i1 - i0);
      // Tiefpass-Rauschen mit aufgehender Blende + steigender Sinus
      const cutoff = 0.02 + 0.5 * p * p;
      lp += (((rnd() - 0.5) * 2) - lp) * cutoff;
      const sweep = Math.sin(2 * Math.PI * (180 + 600 * p * p) * (i / SR));
      out[i] += (lp * 0.8 + sweep * 0.25) * gain * p;
    }
  }

  /* --- Hits: Sub-Thump + Noise-Burst --- */
  for (const [tH, gain] of [[HIT1, 1], [HIT2, 1.15]]) {
    const i0 = Math.floor(tH * SR);
    // Sub mit Pitch-Drop 95 -> 42 Hz
    for (let j = 0; j < SR * 0.55; j++) {
      const i = i0 + j;
      if (i >= N) break;
      const t = j / SR;
      const f = 42 + 53 * Math.exp(-t / 0.07);
      const e = Math.exp(-t / 0.2);
      out[i] += gain * 0.34 * e * Math.sin(2 * Math.PI * f * t);
    }
    // Burst
    for (let j = 0; j < SR * 0.3; j++) {
      const i = i0 + j;
      if (i >= N) break;
      const e = Math.exp(-j / (SR * 0.045));
      out[i] += gain * 0.12 * (rnd() - 0.5) * e;
    }
  }

  /* --- Abschluss-Ping (A5) kurz vor Schluss --- */
  {
    const i0 = Math.floor(14.1 * SR);
    for (let j = 0; j < SR * 1.3; j++) {
      const i = i0 + j;
      if (i >= N) break;
      const t = j / SR;
      const e = Math.min(1, t / 0.005) * Math.exp(-t / 0.4);
      out[i] += 0.07 * e * Math.sin(2 * Math.PI * F.A5 * t);
    }
  }

  /* --- Master: Fade-out + Soft-Clip --- */
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const fadeOut = t > END - 1.1 ? Math.max(0, (END - t) / 1.1) : 1;
    out[i] = Math.tanh(out[i] * 1.25) * 0.85 * fadeOut;
  }
  return out;
}

const L = renderChannel(0);
const R = renderChannel(1);

/* Normalisieren auf -1.5 dBFS */
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const norm = peak > 0 ? 0.84 / peak : 1;

/* WAV (16-bit PCM stereo) schreiben */
const dataSize = N * 2 * 2;
const buf = Buffer.alloc(44 + dataSize);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + dataSize, 4); buf.write("WAVE", 8);
buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write("data", 36); buf.writeUInt32LE(dataSize, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), 46 + i * 4);
}
writeFileSync(new URL("./public/intro-music.wav", import.meta.url), buf);
console.log(`OK: public/intro-music.wav (${(buf.length / 1024 / 1024).toFixed(2)} MB, ${DUR}s)`);
