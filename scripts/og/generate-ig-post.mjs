// Erzeugt Instagram-Post-Bilder (1080×1350, Hochformat) im Marken-Design.
// Gleiche Pipeline wie generate-og-guide.mjs (Satori + resvg, ohne Browser).
// Aufruf: node scripts/og/generate-ig-post.mjs [slug]
// Posts sind unten in POSTS definiert; ohne Argument werden alle gerendert.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const FONT_DIR = path.join(ROOT, "scripts/og/fonts");
const OUT_DIR = path.join(ROOT, "marketing/instagram");

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

// hook: [zeile1, zeile2(gradient)] · points: max 3 · cta: Fußzeile
const POSTS = [
  {
    slug: "falsches-ende",
    eyebrow: "KI · MITTELSTAND",
    hook: ["KI-Projekte scheitern", "am falschen Ende."],
    points: [
      "Nicht die Technik bremst — sondern der Einstieg beim größten statt beim messbarsten Problem.",
      "Der bessere Start: ein Prozess, der wehtut, ein Pilot, 90 Tage, klare Zahlen.",
      "Erst Nutzen beweisen, dann skalieren. Nicht umgekehrt.",
    ],
    cta: "Der komplette Leitfaden: aiwithmaris.com/guide",
  },
  {
    slug: "team-nutzt-ki-nicht",
    eyebrow: "KI · TEAM",
    hook: ["Dein Team nutzt KI nicht?", "Es liegt nicht am Team."],
    points: [
      "Tools einführen ist einfach. Gewohnheiten ändern ist Arbeit.",
      "Was hilft: ein konkreter Use-Case pro Rolle statt »macht mal alle KI«.",
      "Und: Vorleben schlägt Verordnen — jedes Mal.",
    ],
    cta: "Mehr im Blog: aiwithmaris.com/blog",
  },
  {
    slug: "90-tage-pilot",
    eyebrow: "KI · PRAXIS",
    hook: ["90 Tage reichen,", "um es zu wissen."],
    points: [
      "Tag 1–30: einen Prozess wählen, Messlatte definieren, Daten sichten.",
      "Tag 31–60: Pilot bauen, mit echten Fällen testen, Team einbinden.",
      "Tag 61–90: Zahlen ziehen — weitermachen, anpassen oder sauber beenden.",
    ],
    cta: "Vorlagen & Checklisten: aiwithmaris.com/guide",
  },
];

const el = (type, style, ...children) => ({
  type,
  props: { style, children: children.length === 1 ? children[0] : children },
});

const font = (file) => readFile(path.join(FONT_DIR, file));

function buildTree(p) {
  const points = p.points.map((text, i) =>
    el(
      "div",
      { display: "flex", alignItems: "flex-start", marginTop: i === 0 ? 0 : 36 },
      el("div", { fontFamily: "Space Mono", fontSize: 26, color: CYAN, marginRight: 22, marginTop: 4 }, String(i + 1).padStart(2, "0")),
      el("div", { fontFamily: "Manrope", fontSize: 33, lineHeight: 1.45, color: TEXT, width: 800 }, text)
    )
  );
  return el(
    "div",
    {
      width: 1080,
      height: 1350,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "84px 84px 64px",
      backgroundColor: BG,
      backgroundImage:
        "radial-gradient(circle at 12% 0%, rgba(94,240,255,.16), transparent 42%)," +
        "radial-gradient(circle at 95% 18%, rgba(124,92,255,.16), transparent 42%)," +
        "radial-gradient(circle at 55% 105%, rgba(255,212,121,.10), transparent 42%)",
    },
    el(
      "div",
      { display: "flex", flexDirection: "column" },
      el("div", { fontFamily: "Space Mono", fontSize: 24, letterSpacing: 8, color: CYAN }, p.eyebrow),
      el(
        "div",
        { display: "flex", flexDirection: "column", fontFamily: "Sora", fontWeight: 800, fontSize: 76, lineHeight: 1.1, letterSpacing: -2, color: TEXT, marginTop: 36 },
        el("span", {}, p.hook[0]),
        el("span", gradText, p.hook[1])
      )
    ),
    el("div", { display: "flex", flexDirection: "column", marginTop: 40, marginBottom: 40 }, ...points),
    el(
      "div",
      {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid rgba(238,241,250,.16)",
        paddingTop: 30,
      },
      el("div", { fontFamily: "Space Mono", fontSize: 22, letterSpacing: 1, color: MUTED }, p.cta),
      el("div", { fontFamily: "Sora", fontWeight: 800, fontSize: 24, ...gradText }, "AI with Maris")
    )
  );
}

const fonts = [
  { name: "Sora", weight: 800, style: "normal", data: await font("sora-800.ttf") },
  { name: "Manrope", weight: 400, style: "normal", data: await font("manrope-400.ttf") },
  { name: "Space Mono", weight: 400, style: "normal", data: await font("spacemono-400.ttf") },
];

await mkdir(OUT_DIR, { recursive: true });
const only = process.argv[2];
for (const p of POSTS) {
  if (only && p.slug !== only) continue;
  const svg = await satori(buildTree(p), { width: 1080, height: 1350, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1080 } }).render().asPng();
  const out = path.join(OUT_DIR, `ig-${p.slug}.png`);
  await writeFile(out, png);
  console.log("geschrieben:", out);
}
