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
const MUTED = "rgba(238,241,250,.62)";

export type GuidePromoProps = {
  lang: "de" | "en";
};

const STRINGS = {
  de: {
    eyebrow: "KI · MITTELSTAND",
    hook1: "Viel geredet.",
    hook2: "Wenig gerechnet.",
    hook3: "Zeit, anzufangen — wo es zählt.",
    title1: "Anfangen,",
    title2: "wo es zählt",
    sub: "Der Leitfaden zur KI-Einführung im Mittelstand",
    author: "Maris Reinold · M. Eng. · 17 Jahre Berufserfahrung",
    stats: [
      { n: 38, label: "Seiten Klartext" },
      { n: 17, label: "Kapitel" },
      { n: 10, label: "Vorlagen & Checklisten" },
      { n: 90, label: "Tage Pilotplan" },
    ],
    chapters: [
      "Ehrlich anfangen: wo wir stehen",
      "Wo es sich lohnt",
      "Der erste Schritt: der Pilot",
      "Recht und Risiko",
      "Die Menschen mitnehmen",
      "Was es kostet, was es bringt",
      "Die ersten 90 Tage",
    ],
    ctaA: "Als PDF · Deutsch & Englisch",
    ctaB: "ab 19 €",
    ctaUrl: "aiwithmaris.com/guide",
  },
  en: {
    eyebrow: "AI · SME",
    hook1: "Lots of talk.",
    hook2: "Little arithmetic.",
    hook3: "Time to start — where it counts.",
    title1: "Start where",
    title2: "it counts",
    sub: "The guide to adopting AI in mid-sized companies",
    author: "Maris Reinold · M. Eng. · 17 years of experience",
    stats: [
      { n: 36, label: "pages, no buzzwords" },
      { n: 17, label: "chapters" },
      { n: 10, label: "templates & checklists" },
      { n: 90, label: "day pilot plan" },
    ],
    chapters: [
      "An honest start: where we stand",
      "Where it pays off",
      "The first step: the pilot",
      "Law and risk",
      "Bringing people along",
      "What it costs, what it returns",
      "The first 90 days",
    ],
    ctaA: "As a PDF · German & English",
    ctaB: "from €19",
    ctaUrl: "aiwithmaris.com/guide",
  },
} as const;

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
      Array.from({ length: 50 }, (_, i) => ({
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
            "radial-gradient(closest-side at 18% 6%, rgba(94,240,255,.18), transparent 55%)," +
            "radial-gradient(closest-side at 84% 4%, rgba(124,92,255,.16), transparent 55%)," +
            "radial-gradient(closest-side at 60% 98%, rgba(255,212,121,.08), transparent 55%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(94,240,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(94,240,255,.05) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at 50% 42%, #000 32%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 42%, #000 32%, transparent 80%)",
          transform: `translateY(${(frame * 0.3) % 56}px)`,
        }}
      />
      {particles.map((p, i) => {
        const drift = Math.sin(frame / 28 + p.ph) * 9;
        const op = 0.16 + 0.45 * ((Math.sin(frame / 22 + p.ph) + 1) / 2);
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
      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 240px 60px rgba(0,0,0,.55)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- 3D book cover ---------- */
const BookCover: React.FC<{
  t: (typeof STRINGS)[keyof typeof STRINGS];
  progress: number;
  settleTilt: number;
}> = ({ t, progress, settleTilt }) => {
  return (
    <div
      style={{
        width: 420,
        height: 570,
        borderRadius: 16,
        position: "relative",
        transform: `perspective(1400px) rotateY(${interpolate(
          progress,
          [0, 1],
          [-58, settleTilt]
        )}deg) rotateX(${interpolate(progress, [0, 1], [10, 4])}deg) scale(${interpolate(
          progress,
          [0, 1],
          [0.82, 1]
        )})`,
        opacity: progress,
        background:
          "linear-gradient(160deg, #0d1020 0%, #11142a 55%, #0a0c18 100%)",
        border: "1px solid rgba(94,240,255,.28)",
        boxShadow:
          "0 50px 100px rgba(0,0,0,.6), 0 0 80px rgba(124,92,255,.18), inset 0 1px 0 rgba(255,255,255,.08)",
        padding: "44px 40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* spine highlight */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 14,
          borderRadius: "16px 0 0 16px",
          background:
            "linear-gradient(90deg, rgba(94,240,255,.35), transparent)",
        }}
      />
      <div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 17,
            letterSpacing: 5,
            color: CYAN,
            textTransform: "uppercase",
          }}
        >
          {t.eyebrow}
        </div>
        <div
          style={{
            fontFamily: SORA,
            fontWeight: 800,
            fontSize: 52,
            lineHeight: 1.12,
            letterSpacing: -1,
            marginTop: 26,
            color: TEXT,
          }}
        >
          {t.title1}
          <br />
          <span style={gradText}>{t.title2}</span>
        </div>
        <div
          style={{
            fontFamily: MANROPE,
            fontSize: 20,
            lineHeight: 1.5,
            color: MUTED,
            marginTop: 22,
            maxWidth: 320,
          }}
        >
          {t.sub}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: MONO,
          fontSize: 15,
          color: MUTED,
          borderTop: "1px solid rgba(238,241,250,.14)",
          paddingTop: 18,
        }}
      >
        <span>Maris Reinold</span>
        <span style={{ color: GOLD }}>PDF · DE/EN</span>
      </div>
    </div>
  );
};

/* ---------- Count-up stat ---------- */
const Stat: React.FC<{
  n: number;
  label: string;
  frame: number;
  start: number;
  fps: number;
}> = ({ n, label, frame, start, fps }) => {
  const s = spring({ frame: frame - start, fps, config: { damping: 200 } });
  const value = Math.round(
    interpolate(frame, [start, start + 34], [0, n], {
      ...clamp,
      easing: Easing.out(Easing.quad),
    })
  );
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [36, 0])}px)`,
        textAlign: "center",
        width: 272,
      }}
    >
      <div
        style={{
          fontFamily: SORA,
          fontWeight: 800,
          fontSize: 84,
          letterSpacing: -2,
          ...gradText,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 15,
          letterSpacing: 1.2,
          color: MUTED,
          textTransform: "uppercase",
          marginTop: 6,
        }}
      >
        {label}
      </div>
    </div>
  );
};

/* ---------- Main composition ---------- */
export const GuidePromo: React.FC<GuidePromoProps> = ({ lang }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = STRINGS[lang];

  /* Scene timings (30 fps) */
  const HOOK_OUT = 96;
  const BOOK_IN = 86;
  const BOOK_OUT = 226;
  const STATS_IN = 218;
  const STATS_OUT = 320;
  const CHAP_IN = 312;
  const CHAP_OUT = 392;
  const CTA_IN = 384;

  /* Scene A — hook lines */
  const hook1In = spring({ frame: frame - 6, fps, config: { damping: 200 } });
  const hook2In = spring({ frame: frame - 26, fps, config: { damping: 200 } });
  const hookOp = fade(frame, 0, 10, HOOK_OUT - 18, HOOK_OUT);

  /* Scene B — book + author */
  const bookProgress =
    spring({
      frame: frame - BOOK_IN,
      fps,
      config: { damping: 200, mass: 1.05 },
    }) * fade(frame, BOOK_IN, BOOK_IN + 8, BOOK_OUT - 16, BOOK_OUT);
  const settleTilt = -16 + Math.sin(frame / 36) * 2.5;
  const authorOp = fade(frame, BOOK_IN + 26, BOOK_IN + 44, BOOK_OUT - 16, BOOK_OUT);

  /* Scene C — stats */
  const statsOp = fade(frame, STATS_IN, STATS_IN + 12, STATS_OUT - 16, STATS_OUT);

  /* Scene D — chapter roll */
  const chapOp = fade(frame, CHAP_IN, CHAP_IN + 12, CHAP_OUT - 14, CHAP_OUT);
  const ROW = 70;
  const roll = interpolate(
    frame,
    [CHAP_IN + 8, CHAP_OUT - 10],
    [0, (t.chapters.length - 1) * ROW],
    { ...clamp, easing: Easing.inOut(Easing.quad) }
  );

  /* Scene E — CTA */
  const ctaIn = spring({ frame: frame - CTA_IN, fps, config: { damping: 200 } });
  const ctaOp = interpolate(frame, [CTA_IN, CTA_IN + 14], [0, 1], clamp);
  const endFade = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames - 1],
    [1, 0],
    clamp
  );

  return (
    <AbsoluteFill style={{ fontFamily: MANROPE, color: TEXT }}>
      <Background />

      {/* SCENE A — hook */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: hookOp,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 20,
              letterSpacing: 8,
              color: CYAN,
              textTransform: "uppercase",
              marginBottom: 26,
              opacity: hook1In,
            }}
          >
            {t.eyebrow}
          </div>
          <div
            style={{
              fontFamily: SORA,
              fontWeight: 800,
              fontSize: 88,
              letterSpacing: -2,
              lineHeight: 1.06,
              opacity: hook1In,
              transform: `translateY(${interpolate(hook1In, [0, 1], [36, 0])}px)`,
            }}
          >
            {t.hook1}
          </div>
          <div
            style={{
              fontFamily: SORA,
              fontWeight: 800,
              fontSize: 88,
              letterSpacing: -2,
              lineHeight: 1.06,
              opacity: hook2In,
              transform: `translateY(${interpolate(hook2In, [0, 1], [36, 0])}px)`,
              ...gradText,
            }}
          >
            {t.hook2}
          </div>
        </div>
      </AbsoluteFill>

      {/* SCENE B — book cover + author */}
      <AbsoluteFill
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 72,
        }}
      >
        <BookCover t={t} progress={bookProgress} settleTilt={settleTilt} />
        <div style={{ opacity: authorOp, maxWidth: 540 }}>
          <div
            style={{
              fontFamily: SORA,
              fontWeight: 800,
              fontSize: 52,
              letterSpacing: -1,
              lineHeight: 1.14,
            }}
          >
            {t.hook3}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 18,
              letterSpacing: 1.2,
              color: MUTED,
              marginTop: 26,
              borderLeft: `3px solid ${CYAN}`,
              paddingLeft: 20,
            }}
          >
            {t.author}
          </div>
        </div>
      </AbsoluteFill>

      {/* SCENE C — stats */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: statsOp,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "flex-start",
          }}
        >
          {t.stats.map((s, i) => (
            <Stat
              key={s.label}
              n={s.n}
              label={s.label}
              frame={frame}
              start={STATS_IN + 6 + i * 9}
              fps={fps}
            />
          ))}
        </div>
      </AbsoluteFill>

      {/* SCENE D — chapter roll */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: chapOp,
        }}
      >
        <div
          style={{
            height: ROW * 3,
            overflow: "hidden",
            maskImage:
              "linear-gradient(transparent, #000 32%, #000 68%, transparent)",
            WebkitMaskImage:
              "linear-gradient(transparent, #000 32%, #000 68%, transparent)",
          }}
        >
          <div style={{ transform: `translateY(${ROW - roll}px)` }}>
            {t.chapters.map((c, i) => {
              const center = Math.abs(roll - i * ROW) < ROW / 2;
              return (
                <div
                  key={c}
                  style={{
                    height: ROW,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 20,
                    fontFamily: SORA,
                    fontWeight: center ? 800 : 400,
                    fontSize: center ? 40 : 28,
                    color: center ? TEXT : "rgba(238,241,250,.3)",
                    whiteSpace: "nowrap",
                    transition: "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 17,
                      color: center ? CYAN : "rgba(94,240,255,.35)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {c}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>

      {/* SCENE E — CTA */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: ctaOp * endFade,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 20,
              letterSpacing: 4,
              color: MUTED,
              textTransform: "uppercase",
            }}
          >
            {t.ctaA}
          </div>
          <div
            style={{
              fontFamily: SORA,
              fontWeight: 800,
              fontSize: 104,
              letterSpacing: -2,
              marginTop: 16,
              transform: `scale(${interpolate(ctaIn, [0, 1], [0.85, 1])})`,
              ...gradText,
              filter: "drop-shadow(0 0 50px rgba(124,92,255,.3))",
            }}
          >
            {t.ctaB}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 24,
              letterSpacing: 4,
              color: TEXT,
              marginTop: 22,
              opacity: interpolate(frame, [CTA_IN + 12, CTA_IN + 26], [0, 1], clamp),
            }}
          >
            {t.ctaUrl}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
