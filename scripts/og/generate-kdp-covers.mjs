// Erzeugt Marketing-Cover für die eBooks (Amazon KDP: 1600×2560 JPG) im
// Marken-Look — gleiche Satori/resvg-Pipeline wie die OG-Bilder.
// Aufruf: cd scripts/og && node generate-kdp-covers.mjs [ausgabe-ordner]
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const FONT_DIR = path.join(ROOT, "scripts/og/fonts");
const OUT = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, "marketing/kdp");

const W = 1600, H = 2560;
const BG = "#05060c";
const INK = "#eef1fa";
const MUTED = "rgba(238,241,250,.66)";

const BOOKS = [
  {
    slug: "ki-guide-de", lang: "DE", a: "#5ef0ff", b: "#7c5cff", c: "#ffd479",
    kicker: "KI · MITTELSTAND PRAXIS",
    title: ["Der KI-Guide", "für den", "Mittelstand"],
    accentLine: "Anfangen, wo es zählt.",
    subtitle: "Klartext zur KI-Einführung: klein starten, den Nutzen in 90 Tagen beweisen — und erst dann skalieren. Mit 10 sofort nutzbaren Vorlagen.",
    badges: ["17 KAPITEL", "10 VORLAGEN", "90-TAGE-PLAN"],
  },
  {
    slug: "ki-guide-en", lang: "EN", a: "#5ef0ff", b: "#7c5cff", c: "#ffd479",
    kicker: "AI · SMB PRACTICE",
    title: ["The AI Guide", "for Small &", "Mid-Sized Firms"],
    accentLine: "Start where it counts.",
    subtitle: "Plain-talk AI adoption: start small, prove the value in 90 days — then scale. Includes 10 ready-to-use templates.",
    badges: ["17 CHAPTERS", "10 TEMPLATES", "90-DAY PLAN"],
  },
  {
    slug: "prompt-werkzeugkasten-de", lang: "DE", a: "#5ef0ff", b: "#6fb6ff", c: "#64ffd9",
    kicker: "KI · MITTELSTAND PRAXIS",
    title: ["Der Prompt-", "Werkzeugkasten"],
    accentLine: "Bessere Ergebnisse aus jeder KI.",
    subtitle: "Vorlagen, Muster und Routinen, mit denen Prompts im Arbeitsalltag zuverlässig liefern — vom ersten Entwurf bis zur fertigen Antwort.",
    badges: ["14 KAPITEL", "VORLAGEN", "PRAXISNAH"],
  },
  {
    slug: "prompt-toolbox-en", lang: "EN", a: "#5ef0ff", b: "#6fb6ff", c: "#64ffd9",
    kicker: "AI · SMB PRACTICE",
    title: ["The Prompt", "Toolbox"],
    accentLine: "Better results from any AI.",
    subtitle: "Templates, patterns and routines that make prompts deliver reliably at work — from first draft to finished answer.",
    badges: ["14 CHAPTERS", "TEMPLATES", "HANDS-ON"],
  },
  {
    slug: "dsgvo-ki-de", lang: "DE", a: "#7c5cff", b: "#8d6bff", c: "#5ef0ff",
    kicker: "KI · RECHT & PRAXIS",
    title: ["DSGVO", "& KI"],
    accentLine: "Der Praxisleitfaden für Geschäftsführer.",
    subtitle: "KI nutzen, ohne den Datenschutz zu riskieren: was erlaubt ist, was nicht — und wie du beides sauber dokumentierst.",
    badges: ["12 KAPITEL", "CHECKLISTEN", "FÜR ENTSCHEIDER"],
  },
  {
    slug: "gdpr-ai-en", lang: "EN", a: "#7c5cff", b: "#8d6bff", c: "#5ef0ff",
    kicker: "AI · LAW & PRACTICE",
    title: ["GDPR", "& AI"],
    accentLine: "The practical guide for executives.",
    subtitle: "Use AI without risking compliance: what's allowed, what isn't — and how to document both properly.",
    badges: ["12 CHAPTERS", "CHECKLISTS", "FOR EXECUTIVES"],
  },
  {
    slug: "make-or-buy-de", lang: "DE", a: "#ff5ea8", b: "#ff7cc0", c: "#ffd479",
    kicker: "KI · STRATEGIE",
    title: ["Make", "or Buy"],
    accentLine: "KI-Software entscheiden wie ein Profi.",
    subtitle: "Kaufen, mieten oder selbst bauen? Das Entscheidungsraster für KI-Software — mit ehrlichen Kostenrechnungen und Fallstricken.",
    badges: ["10 KAPITEL", "ENTSCHEIDUNGSRASTER", "KOSTENRECHNUNG"],
  },
  {
    slug: "make-or-buy-en", lang: "EN", a: "#ff5ea8", b: "#ff7cc0", c: "#ffd479",
    kicker: "AI · STRATEGY",
    title: ["Make", "or Buy"],
    accentLine: "Deciding on AI software like a pro.",
    subtitle: "Buy, rent or build? The decision framework for AI software — with honest cost math and the pitfalls to avoid.",
    badges: ["10 CHAPTERS", "DECISION FRAMEWORK", "COST MATH"],
  },
];

const font = (f) => readFile(path.join(FONT_DIR, f));
const el = (type, style, ...children) => ({
  type,
  props: { style, children: children.length === 0 ? undefined : children.length === 1 ? children[0] : children },
});

function cover(b) {
  return el("div", {
    width: W, height: H, display: "flex", flexDirection: "column",
    backgroundColor: BG, padding: "150px 130px 130px", position: "relative",
    backgroundImage:
      `radial-gradient(circle at 18% 6%, ${hexA(b.a, 0.20)}, transparent 48%),` +
      `radial-gradient(circle at 88% 30%, ${hexA(b.b, 0.18)}, transparent 50%),` +
      `radial-gradient(circle at 50% 105%, ${hexA(b.c, 0.12)}, transparent 55%)`,
  },
    // Kopf: Kicker + Sprach-Chip
    el("div", { display: "flex", justifyContent: "space-between", alignItems: "center" },
      el("div", { fontFamily: "Space Mono", fontSize: 40, letterSpacing: 14, color: b.a }, b.kicker),
      el("div", {
        fontFamily: "Space Mono", fontSize: 34, letterSpacing: 4, color: BG,
        background: b.a, borderRadius: 999, padding: "10px 30px",
      }, b.lang)
    ),
    // Titelblock
    el("div", { display: "flex", flexDirection: "column", marginTop: 200 },
      el("div", { display: "flex", flexDirection: "column", fontFamily: "Sora", fontWeight: 800, fontSize: 168, lineHeight: 1.06, letterSpacing: -4, color: INK },
        ...b.title.map((line) => el("span", {}, line))
      ),
      el("div", { width: 380, height: 12, borderRadius: 8, marginTop: 70, background: `linear-gradient(90deg, ${b.a}, ${b.b} 60%, ${b.c})` }),
      el("div", {
        fontFamily: "Sora", fontWeight: 800, fontSize: 62, marginTop: 70, letterSpacing: -1,
        backgroundImage: `linear-gradient(100deg, ${b.a}, ${b.b})`, backgroundClip: "text", color: "transparent",
      }, b.accentLine),
      el("div", { fontFamily: "Manrope", fontSize: 46, lineHeight: 1.5, color: MUTED, marginTop: 50, width: 1180 }, b.subtitle)
    ),
    // Badges
    el("div", { display: "flex", gap: 24, marginTop: "auto", marginBottom: 110 },
      ...b.badges.map((t) => el("div", {
        fontFamily: "Space Mono", fontSize: 30, letterSpacing: 3, color: MUTED,
        border: "2px solid rgba(238,241,250,.22)", borderRadius: 999, padding: "14px 32px",
      }, t))
    ),
    // Fuß: Autor + Marke
    el("div", { display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "2px solid rgba(238,241,250,.14)", paddingTop: 56 },
      el("div", { display: "flex", flexDirection: "column" },
        el("span", { fontFamily: "Sora", fontWeight: 800, fontSize: 52, color: INK }, "Maris Reinold"),
        el("span", { fontFamily: "Space Mono", fontSize: 32, color: MUTED, marginTop: 12 },
          b.lang === "EN" ? "M. Eng. · 17 years of hands-on practice" : "M. Eng. · 17 Jahre Praxis")
      ),
      el("div", { display: "flex", flexDirection: "column", alignItems: "flex-end" },
        el("span", { fontFamily: "Sora", fontWeight: 800, fontSize: 44, color: b.a }, "AI with Maris"),
        el("span", { fontFamily: "Space Mono", fontSize: 30, color: MUTED, marginTop: 10 }, "aiwithmaris.com")
      )
    )
  );
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

await mkdir(OUT, { recursive: true });
const fonts = [
  { name: "Sora", weight: 800, style: "normal", data: await font("sora-800.ttf") },
  { name: "Manrope", weight: 400, style: "normal", data: await font("manrope-400.ttf") },
  { name: "Space Mono", weight: 400, style: "normal", data: await font("spacemono-400.ttf") },
];
for (const b of BOOKS) {
  const svg = await satori(cover(b), { width: W, height: H, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng();
  const out = path.join(OUT, `cover-${b.slug}.jpg`);
  await sharp(png).jpeg({ quality: 84 }).toFile(out);
  const size = (await sharp(out).metadata());
  console.log(`geschrieben: ${out} (${size.width}×${size.height})`);
}
