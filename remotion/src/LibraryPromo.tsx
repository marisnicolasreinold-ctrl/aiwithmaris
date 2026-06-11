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

export type LibraryPromoProps = {
  lang: "de" | "en";
};

const STRINGS = {
  de: {
    eyebrow: "KI · MITTELSTAND",
    hook1: "Ein Guide war der Anfang.",
    hook2: "Jetzt ist es eine Bibliothek.",
    books: [
      { tag: "DER HAUPTGUIDE", title: "Anfangen, wo es zählt", price: "19 €" },
      { tag: "VERTIEFUNG", title: "Der Prompt-Werkzeugkasten", price: "12 €" },
      { tag: "VERTIEFUNG", title: "DSGVO & KI — Praxisleitfaden", price: "29 €" },
      { tag: "VERTIEFUNG", title: "Make or Buy — KI-Software", price: "29 €" },
    ],
    stats: [
      { n: 4, label: "Leitfäden" },
      { n: 8, label: "PDFs (DE + EN)" },
      { n: 40, label: "€ gespart im Paket" },
      { n: 1, label: "Klick zum Download" },
    ],
    ctaA: "Die KI-Bibliothek · Alle 4 Leitfäden",
    ctaB: "59 €",
    ctaC: "einzeln ab 12 €",
    ctaUrl: "aiwithmaris.com/guide",
  },
  en: {
    eyebrow: "AI · SME",
    hook1: "One guide was the start.",
    hook2: "Now it's a library.",
    books: [
      { tag: "THE MAIN GUIDE", title: "Start where it counts", price: "€19" },
      { tag: "DEEP DIVE", title: "The Prompt Toolbox", price: "€12" },
      { tag: "DEEP DIVE", title: "GDPR & AI — Practical Guide", price: "€29" },
      { tag: "DEEP DIVE", title: "Make or Buy — AI Software", price: "€29" },
    ],
    stats: [
      { n: 4, label: "guides" },
      { n: 8, label: "PDFs (DE + EN)" },
      { n: 40, label: "€ saved in the bundle" },
      { n: 1, label: "click to download" },
    ],
    ctaA: "The AI Library · All 4 guides",
    ctaB: "€59",
    ctaC: "single titles from €12",
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

/* ---------- Mini book cover ---------- */
const MiniBook: React.FC<{
  tag: string;
  title: string;
  price: string;
  progress: number;
  tilt: number;
  featured?: boolean;
}> = ({ tag, title, price, progress, tilt, featured }) => {
  return (
    <div
      style={{
        width: 250,
        height: 350,
        borderRadius: 14,
        position: "relative",
        opacity: progress,
        transform: `perspective(1200px) rotateY(${interpolate(
          progress,
          [0, 1],
          [-48, tilt]
        )}deg) translateY(${interpolate(progress, [0, 1], [44, 0])}px) scale(${interpolate(
          progress,
          [0, 1],
          [0.86, 1]
        )})`,
        background: featured
          ? "linear-gradient(160deg, #141031 0%, #171243 55%, #0d0a24 100%)"
          : "linear-gradient(160deg, #0d1020 0%, #11142a 55%, #0a0c18 100%)",
        border: featured
          ? "1px solid rgba(124,92,255,.55)"
          : "1px solid rgba(94,240,255,.28)",
        boxShadow: featured
          ? "0 36px 80px rgba(0,0,0,.55), 0 0 60px rgba(124,92,255,.28)"
          : "0 36px 80px rgba(0,0,0,.55), 0 0 40px rgba(94,240,255,.10)",
        padding: "26px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 10,
          borderRadius: "14px 0 0 14px",
          background: `linear-gradient(90deg, ${
            featured ? "rgba(124,92,255,.5)" : "rgba(94,240,255,.35)"
          }, transparent)`,
        }}
      />
      <div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11.5,
            letterSpacing: 3,
            color: featured ? VIOLET : CYAN,
            textTransform: "uppercase",
          }}
        >
          {tag}
        </div>
        <div
          style={{
            fontFamily: SORA,
            fontWeight: 800,
            fontSize: 25,
            lineHeight: 1.22,
            letterSpacing: -0.5,
            marginTop: 16,
            color: TEXT,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: MONO,
          fontSize: 13,
          color: MUTED,
          borderTop: "1px solid rgba(238,241,250,.14)",
          paddingTop: 14,
        }}
      >
        <span>PDF · DE/EN</span>
        <span style={{ color: GOLD, fontSize: 16 }}>{price}</span>
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
    interpolate(frame, [start, start + 30], [0, n], {
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
export const LibraryPromo: React.FC<LibraryPromoProps> = ({ lang }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = STRINGS[lang];

  /* Scene timings (30 fps) */
  const HOOK_OUT = 104;
  const BOOKS_IN = 96;
  const BOOKS_OUT = 268;
  const STATS_IN = 260;
  const STATS_OUT = 372;
  const CTA_IN = 366;

  /* Scene A — hook lines */
  const hook1In = spring({ frame: frame - 6, fps, config: { damping: 200 } });
  const hook2In = spring({ frame: frame - 30, fps, config: { damping: 200 } });
  const hookOp = fade(frame, 0, 10, HOOK_OUT - 18, HOOK_OUT);

  /* Scene B — four covers, staggered */
  const booksOp = fade(frame, BOOKS_IN, BOOKS_IN + 8, BOOKS_OUT - 16, BOOKS_OUT);

  /* Scene C — stats */
  const statsOp = fade(frame, STATS_IN, STATS_IN + 12, STATS_OUT - 16, STATS_OUT);

  /* Scene D — CTA */
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
              fontSize: 76,
              letterSpacing: -2,
              lineHeight: 1.08,
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
              fontSize: 76,
              letterSpacing: -2,
              lineHeight: 1.08,
              opacity: hook2In,
              transform: `translateY(${interpolate(hook2In, [0, 1], [36, 0])}px)`,
              ...gradText,
            }}
          >
            {t.hook2}
          </div>
        </div>
      </AbsoluteFill>

      {/* SCENE B — four covers */}
      <AbsoluteFill
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          opacity: booksOp,
        }}
      >
        {t.books.map((b, i) => {
          const progress = spring({
            frame: frame - (BOOKS_IN + 4 + i * 11),
            fps,
            config: { damping: 200, mass: 1.05 },
          });
          const tilt = -10 + i * 5 + Math.sin(frame / 38 + i * 1.7) * 2;
          return (
            <MiniBook
              key={b.title}
              tag={b.tag}
              title={b.title}
              price={b.price}
              progress={progress}
              tilt={tilt}
              featured={i === 0}
            />
          );
        })}
      </AbsoluteFill>

      {/* SCENE C — stats */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: statsOp,
        }}
      >
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
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

      {/* SCENE D — CTA */}
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
              fontSize: 18,
              letterSpacing: 3,
              color: MUTED,
              marginTop: 14,
              textTransform: "uppercase",
              opacity: interpolate(frame, [CTA_IN + 8, CTA_IN + 22], [0, 1], clamp),
            }}
          >
            {t.ctaC}
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
