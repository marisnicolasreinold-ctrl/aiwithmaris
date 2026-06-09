import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
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

/* ---------- Orb: rotating arc rings + glowing core ---------- */
const Orb: React.FC<{ opacity: number; scale: number; y: number }> = ({
  opacity,
  scale,
  y,
}) => {
  const frame = useCurrentFrame();
  const C = 260;
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
                opacity={0.4}
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

/* ---------- helpers ---------- */
const fade = (frame: number, a: number, b: number, c: number, d: number) =>
  interpolate(frame, [a, b, c, d], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const gradText: React.CSSProperties = {
  background: `linear-gradient(110deg, ${CYAN}, ${VIOLET} 55%, ${GOLD})`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

/* ---------- Main composition ---------- */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Orb lifecycle: boots in, then recedes to a faint background presence
  const orbIn = spring({ frame, fps, config: { damping: 200, mass: 1.1 } });
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

  // Scene captions
  const bootOp = fade(frame, 8, 26, 95, 120);
  const bootChars = Math.floor(
    interpolate(frame, [12, 70], [0, BOOT.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Wordmark
  const wmIn = spring({
    frame: frame - 96,
    fps,
    config: { damping: 200, mass: 0.8 },
  });
  const wmOp = fade(frame, 96, 116, 196, 218);
  const wmY = interpolate(wmIn, [0, 1], [40, 0]);

  // Tagline lines
  const t1Op = fade(frame, 188, 206, 286, 300);
  const t2Words = "Software, die für dich arbeitet.".split(" ");

  // Pillars
  const pills = ["KI-Coaching", "Software-Entwicklung", "Cloud-nativ"];

  // CTA
  const ctaIn = spring({
    frame: frame - 356,
    fps,
    config: { damping: 200, mass: 0.9 },
  });
  const ctaOp = interpolate(frame, [356, 376], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily: MANROPE, color: TEXT }}>
      <Background />
      <Orb opacity={orbOpacity} scale={orbScale} y={orbY} />

      {/* vignette */}
      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 320px 80px rgba(0,0,0,.55)",
          pointerEvents: "none",
        }}
      />

      {/* SCENE A — boot caption */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 150,
          opacity: bootOp,
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 26,
            letterSpacing: 8,
            color: CYAN,
            textTransform: "uppercase",
          }}
        >
          {BOOT.slice(0, bootChars)}
          <span style={{ opacity: frame % 16 < 8 ? 1 : 0 }}>▍</span>
        </div>
      </AbsoluteFill>

      {/* SCENE B — wordmark */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: wmOp,
          transform: `translateY(${wmY - 30}px)`,
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
            }}
          >
            ◇ ATLAS · APEX · FLOWOPS ◇
          </div>
          <div
            style={{
              fontFamily: SORA,
              fontWeight: 800,
              fontSize: 132,
              letterSpacing: -2,
              ...gradText,
              filter: `drop-shadow(0 0 40px rgba(94,240,255,${
                0.25 * wmIn
              }))`,
            }}
          >
            AI with Maris
          </div>
        </div>
      </AbsoluteFill>

      {/* SCENE C — tagline */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: t1Op,
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 1300 }}>
          <div
            style={{
              fontFamily: SORA,
              fontWeight: 800,
              fontSize: 96,
              letterSpacing: -1.5,
              lineHeight: 1.08,
            }}
          >
            KI verstehen.
          </div>
          <div
            style={{
              fontFamily: SORA,
              fontWeight: 800,
              fontSize: 96,
              letterSpacing: -1.5,
              lineHeight: 1.12,
              marginTop: 6,
            }}
          >
            {t2Words.map((w, i) => {
              const start = 214 + i * 7;
              const o = interpolate(frame, [start, start + 12], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const yy = interpolate(frame, [start, start + 12], [22, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const grad = i >= 2; // "für dich arbeitet."
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    opacity: o,
                    transform: `translateY(${yy}px)`,
                    marginRight: 18,
                    ...(grad ? gradText : {}),
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>

      {/* SCENE D — pillars */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: fade(frame, 284, 300, 356, 372),
        }}
      >
        <div style={{ display: "flex", gap: 26 }}>
          {pills.map((p, i) => {
            const start = 290 + i * 12;
            const s = spring({
              frame: frame - start,
              fps,
              config: { damping: 200, mass: 0.7 },
            });
            return (
              <div
                key={p}
                style={{
                  opacity: s,
                  transform: `translateY(${interpolate(
                    s,
                    [0, 1],
                    [40, 0]
                  )}px) scale(${interpolate(s, [0, 1], [0.85, 1])})`,
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
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* SCENE E — CTA */}
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
              transform: `scale(${interpolate(ctaIn, [0, 1], [0.8, 1])})`,
              ...gradText,
              filter: "drop-shadow(0 0 50px rgba(124,92,255,.3))",
            }}
          >
            aiwithmaris.com
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 28,
              letterSpacing: 8,
              color: "rgba(238,241,250,.7)",
              marginTop: 22,
              opacity: interpolate(frame, [378, 398], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            KI-COACHING · SOFTWARE · MADE IN GERMANY
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const BOOT = "ATLAS // initializing systems";
