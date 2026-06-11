// Erzeugt das Open-Graph-Bild für guide.html (1200×630, assets/og-guide.png).
// Stil und Texte spiegeln den Remotion-Promo (remotion/src/GuidePromo.tsx).
// Aufruf: node scripts/og/generate-og-guide.mjs
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
// Statische TTF-Instanzen der Marken-Webfonts (Sora/Manrope sind als woff2
// Variable Fonts, die Satori nicht parsen kann — einmalig mit fontTools
// instanziert, siehe README in diesem Ordner).
const FONT_DIR = path.join(ROOT, "scripts/og/fonts");

const BG = "#05060c";
const CYAN = "#5ef0ff";
const VIOLET = "#7c5cff";
const GOLD = "#ffd479";
const TEXT = "#eef1fa";
const MUTED = "rgba(238,241,250,.62)";

const gradText = {
  backgroundImage: `linear-gradient(110deg, ${CYAN}, ${VIOLET} 55%, ${GOLD})`,
  backgroundClip: "text",
  color: "transparent",
};

const font = (file) => readFile(path.join(FONT_DIR, file));

const el = (type, style, ...children) => ({
  type,
  props: { style, children: children.length === 1 ? children[0] : children },
});

const bookCover = el(
  "div",
  {
    width: 340,
    height: 460,
    borderRadius: 16,
    background: "linear-gradient(160deg, #0d1020 0%, #11142a 55%, #0a0c18 100%)",
    border: "1px solid rgba(94,240,255,.28)",
    boxShadow: "0 40px 80px rgba(0,0,0,.6), 0 0 70px rgba(124,92,255,.22)",
    padding: "36px 32px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transform: "rotate(-2deg)",
  },
  el(
    "div",
    { display: "flex", flexDirection: "column" },
    el("div", { fontFamily: "Space Mono", fontSize: 15, letterSpacing: 5, color: CYAN }, "KI · MITTELSTAND"),
    el(
      "div",
      { display: "flex", flexDirection: "column", fontFamily: "Sora", fontWeight: 800, fontSize: 42, lineHeight: 1.12, letterSpacing: -1, marginTop: 22, color: TEXT },
      el("span", {}, "Anfangen,"),
      el("span", gradText, "wo es zählt")
    ),
    el(
      "div",
      { fontFamily: "Manrope", fontSize: 17, lineHeight: 1.5, color: MUTED, marginTop: 18, width: 260 },
      "Der Leitfaden zur KI-Einführung im Mittelstand"
    )
  ),
  el(
    "div",
    {
      display: "flex",
      justifyContent: "space-between",
      fontFamily: "Space Mono",
      fontSize: 13,
      color: MUTED,
      borderTop: "1px solid rgba(238,241,250,.14)",
      paddingTop: 16,
    },
    el("span", {}, "Maris Reinold"),
    el("span", { color: GOLD }, "PDF · DE/EN")
  )
);

const statChip = (n, label) =>
  el(
    "div",
    { display: "flex", flexDirection: "column", marginRight: 38 },
    el("div", { fontFamily: "Sora", fontWeight: 800, fontSize: 44, letterSpacing: -1, ...gradText }, n),
    el("div", { fontFamily: "Space Mono", fontSize: 13, letterSpacing: 1, color: MUTED, marginTop: 2 }, label)
  );

const rightSide = el(
  "div",
  { display: "flex", flexDirection: "column", width: 600 },
  el(
    "div",
    { display: "flex", flexDirection: "column", fontFamily: "Sora", fontWeight: 800, fontSize: 54, letterSpacing: -1.5, lineHeight: 1.12, color: TEXT },
    el("span", {}, "Zeit, anzufangen —"),
    el("span", gradText, "wo es zählt.")
  ),
  el(
    "div",
    {
      fontFamily: "Space Mono",
      fontSize: 16,
      letterSpacing: 1,
      color: MUTED,
      marginTop: 24,
      borderLeft: `3px solid ${CYAN}`,
      paddingLeft: 18,
    },
    "Maris Reinold · M. Eng. · 17 Jahre Berufserfahrung"
  ),
  el(
    "div",
    { display: "flex", marginTop: 40 },
    statChip("38", "Seiten"),
    statChip("17", "Kapitel"),
    statChip("10", "Vorlagen"),
    statChip("90", "Tage Pilotplan")
  ),
  el(
    "div",
    { display: "flex", alignItems: "center", marginTop: 44 },
    el(
      "div",
      {
        fontFamily: "Sora",
        fontWeight: 800,
        fontSize: 22,
        whiteSpace: "nowrap",
        color: "#05060c",
        background: `linear-gradient(110deg, ${CYAN}, ${VIOLET})`,
        borderRadius: 999,
        padding: "12px 26px",
      },
      "ab 19 € — Sofort-Download"
    ),
    el(
      "div",
      { fontFamily: "Space Mono", fontSize: 16, letterSpacing: 1, whiteSpace: "nowrap", color: MUTED, marginLeft: 24 },
      "aiwithmaris.com/guide"
    )
  )
);

const tree = el(
  "div",
  {
    width: 1200,
    height: 630,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG,
    backgroundImage:
      "radial-gradient(circle at 15% 0%, rgba(94,240,255,.16), transparent 45%)," +
      "radial-gradient(circle at 90% 10%, rgba(124,92,255,.18), transparent 45%)," +
      "radial-gradient(circle at 60% 110%, rgba(255,212,121,.10), transparent 45%)",
  },
  el(
    "div",
    { display: "flex", alignItems: "center" },
    el("div", { display: "flex", marginRight: 70 }, bookCover),
    rightSide
  )
);

const svg = await satori(tree, {
  width: 1200,
  height: 630,
  fonts: [
    { name: "Sora", weight: 800, style: "normal", data: await font("sora-800.ttf") },
    { name: "Manrope", weight: 400, style: "normal", data: await font("manrope-400.ttf") },
    { name: "Space Mono", weight: 400, style: "normal", data: await font("spacemono-400.ttf") },
  ],
});

const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
const out = path.join(ROOT, "assets/og-guide.png");
await writeFile(out, png);
console.log("geschrieben:", out, png.length, "bytes");
