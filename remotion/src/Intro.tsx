import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { loadFont as loadMono } from "@remotion/google-fonts/SpaceMono";

const { fontFamily: SORA } = loadSora();
const { fontFamily: MANROPE } = loadManrope();
const { fontFamily: MONO } = loadMono();

const BG = "#05060c";
const CYAN = "#5ef0ff";
const VIOLET = "#7c5cff";
const GOLD = "#ffd479";
const TEXT = "#eef1fa";
const MUTED = "rgba(238,241,250,.62)";

export type IntroProps = {
  lang: "de" | "en";
};

const STRINGS = {
  de: {
    boot: "ATLAS // Systeme starten",
    sub: "◇ ATLAS · APEX · FLOWOPS ◇",
    tag1: "KI verstehen.",
    tag2: "Software, die für dich arbeitet.",
    tag2GradFrom: 2,
    pillars: ["KI-Coaching", "Software-Entwicklung", "Cloud-nativ"],
    ctaSub: "KI-COACHING · SOFTWARE · MADE IN GERMANY",
  },
  en: {
    boot: "ATLAS // initializing systems",
    sub: "◇ ATLAS · APEX · FLOWOPS ◇",
    tag1: "Understand AI.",
    tag2: "Software that works for you.",
    tag2GradFrom: 2,
    pillars: ["AI Coaching", "Software Development", "Cloud-native"],
    ctaSub: "AI COACHING · SOFTWARE · MADE IN GERMANY",
  },
} as const;

const WORDMARK = "AI with Maris";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const fade = (frame: number, a: number, b: number, c: number, d: number) =>
  interpolate(frame, [a, b, c, d], [0, 1, 1, 0], clamp);

const gradText: React.CSSProperties = {
  background: `linear-gradient(110deg, ${CYAN}, ${VIOLET} 55%, ${GOLD})`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

/* ---------- Background: gradients + grid + drifting particles ---------- */
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = React.useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        x: (i * 53.7) % 100,
        y: (i * 31.3) % 100,
        size: 1 + (i % 3),
        hue: i % 3,
        sp: 0.04 + (i % 5) * 0.012,
        ph: i,
      })),
    []
  );
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(closest-side at 18% 6%, rgba(94,240,255,.20), transparent 55%)," +
            "radial-gradient(closest-side at 84% 4%, rgba(124,92,255,.18), transparent 55%)," +
            "radial-gradient(closest-side at 60% 98%, rgba(255,212,121,.09), transparent 55%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(94,240,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(94,240,255,.05) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse at 50% 42%, #000 32%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 42%, #000 32%, transparent 80%)",
          transform: `translateY(${(frame * 0.35) % 64}px)`,
        }}
      />
      {particles.map((p, i) => {
        const drift = Math.sin(frame / 28 + p.ph) * 10;
        const op = 0.18 + 0.5 * ((Math.sin(frame / 22 + p.ph) + 1) / 2);
        const col = p.hue === 0 ? CYAN : p.hue === 1 ? VIOLET : GOLD;
        const top = (p.y + frame * p.sp) % 100;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x + "%",
              top: top + "%",
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: col,
              opacity: op,
              boxShadow: `0 0 7px ${col}`,
              transform: `translateX(${drift}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- Light streak: a glowing diagonal sweep across the frame ---------- */
const Streak: React.FC<{ start: number; color: string; top: string; tilt: number }> = ({
  start,
  color,
  top,
  tilt,
}) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [start, start + 46], [-30, 130], clamp);
  const op = interpolate(
    frame,
    [start, start + 10, start + 36, start + 46],
    [0, 0.55, 0.55, 0],
    clamp
  );
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: x + "%",
        width: 560,
        height: 3,
        borderRadius: 999,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        boxShadow: `0 0 24px ${color}`,
        opacity: op,
        transform: `rotate(${tilt}deg)`,
      }}
    />
  );
};

/* ---------- Orb: rotating arc rings + glowing core ---------- */
const Orb: React.FC<{ opacity: number; scale: number; y: number }> = ({
  opacity,
  scale,
  y,
}) => {
  const frame = useCurrentFrame();
  const C = 260;
  // Beim "Lock-on" (Boot abgeschlossen) blitzt der Tick-Ring kurz auf
  const lockFlash = interpolate(frame, [76, 84, 100], [0.4, 1, 0.4], clamp);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `translateY(${y}px) scale(${scale})`,
      }}
    >
      <svg width={560} height={560} viewBox="0 0 520 520">
        <defs>
          <radialGradient id="core" cx="40%" cy="34%" r="68%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.4" stopColor={CYAN} />
            <stop offset="1" stopColor={VIOLET} />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[0, 1, 2].map((i) => {
          const r = 140 + i * 56;
          const rot = frame * (i % 2 ? -0.6 : 0.95) * (1 + i * 0.18);
          const segs = 12 + i * 5;
          const stroke = i === 1 ? VIOLET : CYAN;
          return (
            <g
              key={i}
              transform={`rotate(${rot} ${C} ${C})`}
              stroke={stroke}
              strokeWidth={3}
              fill="none"
              opacity={0.55 - i * 0.1}
              filter="url(#glow)"
            >
              {Array.from({ length: segs }).map((_, s) => {
                const a0 = (s / segs) * Math.PI * 2;
                const a1 = a0 + (Math.PI * 2 / segs) * 0.55;
                const x0 = C + Math.cos(a0) * r;
                const y0 = C + Math.sin(a0) * r;
                const x1 = C + Math.cos(a1) * r;
                const y1 = C + Math.sin(a1) * r;
                return (
                  <path
                    key={s}
                    d={`M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`}
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
          );
        })}
        {/* tick ring */}
        <g transform={`rotate(${frame * 0.25} ${C} ${C})`}>
          {Array.from({ length: 48 }).map((_, s) => {
            const a = (s / 48) * Math.PI * 2;
            const r0 = 252;
            const r1 = s % 4 === 0 ? 272 : 262;
            return (
              <line
                key={s}
                x1={C + Math.cos(a) * r0}
                y1={C + Math.sin(a) * r0}
                x2={C + Math.cos(a) * r1}
                y2={C + Math.sin(a) * r1}
                stroke={CYAN}
                strokeWidth={s % 4 === 0 ? 2.2 : 1}
                opacity={lockFlash}
              />
            );
          })}
        </g>
        <circle
          cx={C}
          cy={C}
          r={48}
          fill="url(#core)"
          opacity={0.92}
          filter="url(#glow)"
        />
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- Boot progress ticks ---------- */
const BootTicks: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const frame = useCurrentFrame();
  const TICKS = 24;
  const progress = interpolate(frame, [start, end], [0, TICKS], clamp);
  return (
    <div style={{ display: "flex", gap: 7, marginTop: 22, justifyContent: "center" }}>
      {Array.from({ length: TICKS }).map((_, i) => {
        const on = i < progress;
        return (
          <div
            key={i}
            style={{
              width: 16,
              height: 5,
              borderRadius: 3,
              background: on ? CYAN : "rgba(94,240,255,.16)",
              boxShadow: on ? `0 0 9px ${CYAN}` : "none",
            }}
          />
        );
      })}
    </div>
  );
};

/* ---------- Main composition ---------- */
export const Intro: React.FC<IntroProps> = ({ lang }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = STRINGS[lang];

  /* Scene timings (30 fps) */
  const BOOT_OUT = 118;
  const WM_IN = 104;
  const WM_OUT = 208;
  const TAG_IN = 198;
  const TAG_OUT = 294;
  const PIL_IN = 286;
  const PIL_OUT = 362;
  const CTA_IN = 354;

  /* Cinematic: slow push-in over the whole video + global end fade */
  const cameraScale = 1 + (frame / durationInFrames) * 0.05;
  const endFade = interpolate(
    frame,
    [durationInFrames - 14, durationInFrames - 1],
    [1, 0],
    clamp
  );

  /* Orb lifecycle: boots in, then recedes to a faint background presence */
  const orbScale = interpolate(frame, [0, 40, 110, 150], [0.4, 1, 1, 0.62], {
    extrapolateRight: "clamp",
  });
  const orbOpacity = interpolate(
    frame,
    [0, 30, 110, 150, durationInFrames - 40, durationInFrames],
    [0, 1, 1, 0.16, 0.16, 0],
    { extrapolateRight: "clamp" }
  );
  const orbY = interpolate(frame, [0, 150], [0, -40], {
    extrapolateRight: "clamp",
  });

  /* Scene A — boot caption (typewriter via string slicing) */
  const bootOp = fade(frame, 8, 26, BOOT_OUT - 24, BOOT_OUT);
  const bootChars = Math.floor(
    interpolate(frame, [12, 70], [0, t.boot.length], clamp)
  );

  /* Scene B — wordmark */
  const wmOp = fade(frame, WM_IN, WM_IN + 16, WM_OUT - 14, WM_OUT);
  const subIn = spring({
    frame: frame - (WM_IN + WORDMARK.length * 2 + 6),
    fps,
    config: { damping: 200, mass: 0.8 },
  });

  /* Scene C — tagline */
  const tagOp = fade(frame, TAG_IN, TAG_IN + 12, TAG_OUT - 12, TAG_OUT);
  const tag2Words = t.tag2.split(" ");
  const underline = spring({
    frame: frame - (TAG_IN + 18 + tag2Words.length * 6 + 8),
    fps,
    config: { damping: 200 },
  });

  /* Scene D — pillars */
  const pilOp = fade(frame, PIL_IN, PIL_IN + 14, PIL_OUT - 12, PIL_OUT);

  /* Scene E — CTA */
  const ctaIn = spring({
    frame: frame - CTA_IN,
    fps,
    config: { damping: 13, stiffness: 120, mass: 0.8 },
  });
  const ctaOp = interpolate(frame, [CTA_IN, CTA_IN + 16], [0, 1], clamp);
  const ctaPulse =
    1 + Math.max(0, Math.sin((frame - CTA_IN) / 14)) * 0.06;
  const ctaSubSpacing = interpolate(frame, [CTA_IN + 18, CTA_IN + 52], [20, 8], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  const ctaSubOp = interpolate(frame, [CTA_IN + 18, CTA_IN + 40], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ fontFamily: MANROPE, color: TEXT }}>
      {/* Soundtrack: programmatisch erzeugt (make-music.mjs), lizenzfrei */}
      <Audio src={staticFile("intro-music.wav")} />
      <Background />
      <Orb opacity={orbOpacity} scale={orbScale} y={orbY} />

      {/* light streaks during wordmark + CTA */}
      <Streak start={WM_IN + 16} color={CYAN} top="30%" tilt={-14} />
      <Streak start={WM_IN + 34} color={VIOLET} top="64%" tilt={-14} />
      <Streak start={CTA_IN + 10} color={GOLD} top="46%" tilt={-12} />

      {/* vignette */}
      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 320px 80px rgba(0,0,0,.55)",
          pointerEvents: "none",
        }}
      />

      {/* all scenes share the slow camera push-in + end fade */}
      <AbsoluteFill style={{ transform: `scale(${cameraScale})`, opacity: endFade }}>

        {/* SCENE A — boot caption */}
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: 130,
            opacity: bootOp,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 26,
                letterSpacing: 8,
                color: CYAN,
                textTransform: "uppercase",
              }}
            >
              {t.boot.slice(0, bootChars)}
              <span style={{ opacity: frame % 16 < 8 ? 1 : 0 }}>▍</span>
            </div>
            <BootTicks start={14} end={78} />
          </div>
        </AbsoluteFill>

        {/* SCENE B — wordmark: per-letter spring with blur reveal */}
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            opacity: wmOp,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 24,
                letterSpacing: 14,
                color: "rgba(238,241,250,.6)",
                marginBottom: 18,
                opacity: subIn,
                transform: `translateY(${interpolate(subIn, [0, 1], [16, 0])}px)`,
              }}
            >
              {t.sub}
            </div>
            <div
              style={{
                fontFamily: SORA,
                fontWeight: 800,
                fontSize: 132,
                letterSpacing: -2,
                whiteSpace: "nowrap",
              }}
            >
              {WORDMARK.split("").map((ch, i) => {
                const s = spring({
                  frame: frame - (WM_IN + 4 + i * 2),
                  fps,
                  config: { damping: 13, stiffness: 150, mass: 0.6 },
                });
                const o = interpolate(s, [0, 0.6], [0, 1], clamp);
                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      whiteSpace: "pre",
                      opacity: o,
                      transform: `translateY(${(1 - s) * 70}px) scale(${
                        0.55 + 0.45 * s
                      }) rotate(${(1 - s) * -6}deg)`,
                      filter: `blur(${(1 - s) * 12}px) drop-shadow(0 0 ${
                        26 * s
                      }px rgba(94,240,255,.3))`,
                      ...gradText,
                      backgroundSize: "200% 100%",
                      backgroundPosition: `${
                        interpolate(frame, [WM_IN, WM_OUT], [0, 100], clamp)
                      }% 50%`,
                    }}
                  >
                    {ch}
                  </span>
                );
              })}
            </div>
          </div>
        </AbsoluteFill>

        {/* SCENE C — tagline with word springs + underline draw */}
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            opacity: tagOp,
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 1400 }}>
            <div
              style={{
                fontFamily: SORA,
                fontWeight: 800,
                fontSize: 96,
                letterSpacing: -1.5,
                lineHeight: 1.08,
              }}
            >
              {t.tag1.split(" ").map((w, i) => {
                const s = spring({
                  frame: frame - (TAG_IN + 4 + i * 6),
                  fps,
                  config: { damping: 200, mass: 0.7 },
                });
                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      opacity: s,
                      transform: `translateY(${(1 - s) * 30}px)`,
                      marginRight: 20,
                      filter: `blur(${(1 - s) * 6}px)`,
                    }}
                  >
                    {w}
                  </span>
                );
              })}
            </div>
            <div
              style={{
                fontFamily: SORA,
                fontWeight: 800,
                fontSize: 96,
                letterSpacing: -1.5,
                lineHeight: 1.12,
                marginTop: 6,
                position: "relative",
                display: "inline-block",
              }}
            >
              {tag2Words.map((w, i) => {
                const s = spring({
                  frame: frame - (TAG_IN + 18 + i * 6),
                  fps,
                  config: { damping: 200, mass: 0.7 },
                });
                const grad = i >= t.tag2GradFrom;
                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      opacity: s,
                      transform: `translateY(${(1 - s) * 26}px)`,
                      marginRight: 20,
                      filter: `blur(${(1 - s) * 6}px)`,
                      ...(grad ? gradText : {}),
                    }}
                  >
                    {w}
                  </span>
                );
              })}
              <div
                style={{
                  position: "absolute",
                  left: "8%",
                  right: "8%",
                  bottom: -18,
                  height: 5,
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${CYAN}, ${VIOLET}, ${GOLD})`,
                  boxShadow: `0 0 18px rgba(124,92,255,.5)`,
                  transform: `scaleX(${underline})`,
                  transformOrigin: "left center",
                }}
              />
            </div>
          </div>
        </AbsoluteFill>

        {/* SCENE D — pillars with stagger + shine sweep */}
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            opacity: pilOp,
          }}
        >
          <div style={{ display: "flex", gap: 26 }}>
            {t.pillars.map((p, i) => {
              const start = PIL_IN + 6 + i * 11;
              const s = spring({
                frame: frame - start,
                fps,
                config: { damping: 14, stiffness: 130, mass: 0.7 },
              });
              const shine = interpolate(
                frame,
                [start + 16, start + 44],
                [-60, 160],
                clamp
              );
              return (
                <div
                  key={p}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    opacity: interpolate(s, [0, 0.5], [0, 1], clamp),
                    transform: `translateY(${interpolate(
                      s,
                      [0, 1],
                      [44, 0]
                    )}px) scale(${interpolate(s, [0, 1], [0.8, 1])})`,
                    fontFamily: MONO,
                    fontSize: 34,
                    letterSpacing: 2,
                    padding: "22px 38px",
                    borderRadius: 999,
                    border: "1px solid rgba(94,240,255,.4)",
                    background: "rgba(94,240,255,.06)",
                    color: TEXT,
                    boxShadow: "0 0 40px rgba(124,92,255,.18)",
                  }}
                >
                  {p}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: shine + "%",
                      width: 80,
                      background:
                        "linear-gradient(105deg, transparent, rgba(255,255,255,.22), transparent)",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </AbsoluteFill>

        {/* SCENE E — CTA with overshoot + glow pulse */}
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            opacity: ctaOp,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: SORA,
                fontWeight: 800,
                fontSize: 120,
                letterSpacing: -1,
                transform: `scale(${interpolate(ctaIn, [0, 1], [0.78, 1])})`,
                ...gradText,
                filter: `drop-shadow(0 0 ${40 * ctaPulse}px rgba(124,92,255,.35))`,
              }}
            >
              aiwithmaris.com
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 28,
                letterSpacing: ctaSubSpacing,
                color: MUTED,
                marginTop: 22,
                opacity: ctaSubOp,
              }}
            >
              {t.ctaSub}
            </div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
