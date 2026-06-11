// Rendert ein eBook-Manuskript (Markdown-Dialekt, siehe Agent-Briefing) als
// gesetztes Marken-PDF — browserlos mit pdfkit und den lokalen TTF-Fonts.
// Aufruf: node scripts/og/render-ebook.mjs <input.md> <output.pdf>
//
// Unterstützter Dialekt: Front Matter (--- title/subtitle/author/lang ---),
// # Kapitel (neue Seite), ## / ### Überschriften, Absätze mit **fett**,
// - Listen, 1. Listen, > Callout-Boxen, ``` Vorlagen-Boxen (mono),
// | einfache Tabellen (max 3 Spalten).
import { readFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import PDFDocument from "pdfkit";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const F = (f) => path.join(ROOT, "scripts/og/fonts", f);

const [, , INPUT, OUTPUT] = process.argv;
if (!INPUT || !OUTPUT) {
  console.error("Aufruf: node render-ebook.mjs <input.md> <output.pdf>");
  process.exit(1);
}

/* ---------- Farben & Maße ---------- */
const DARK = "#05060c";
const INK = "#1c2030";
const MUTED2 = "#5a6072";
const CYAN = "#19b8cf";      // print-tauglich abgedunkelt
const VIOLET = "#6c50e8";
const GOLD = "#d9a23c";
const BOX_BG = "#f2f4fb";
const CODE_BG = "#0d1020";
const PAGE = { w: 595.28, h: 841.89 };          // A4
const M = { top: 76, bottom: 78, left: 68, right: 68 };
const CW = PAGE.w - M.left - M.right;            // Satzspiegel-Breite

/* ---------- Markdown light parsen ---------- */
const raw = await readFile(INPUT, "utf8");
let src = raw.replace(/\r\n/g, "\n");
const meta = { title: "", subtitle: "", author: "Maris Reinold", lang: "de" };
const fm = src.match(/^---\n([\s\S]*?)\n---\n/);
if (fm) {
  fm[1].split("\n").forEach((l) => {
    const m = l.match(/^(\w+):\s*(.+)$/);
    if (m) meta[m[1]] = m[2].trim();
  });
  src = src.slice(fm[0].length);
}

const lines = src.split("\n");
const blocks = [];
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  if (/^```/.test(line)) {
    const buf = [];
    i++;
    while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
    i++;
    blocks.push({ t: "code", text: buf.join("\n") });
  } else if (/^# /.test(line)) { blocks.push({ t: "h1", text: line.slice(2).trim() }); i++; }
  else if (/^## /.test(line)) { blocks.push({ t: "h2", text: line.slice(3).trim() }); i++; }
  else if (/^### /.test(line)) { blocks.push({ t: "h3", text: line.slice(4).trim() }); i++; }
  else if (/^> ?/.test(line)) {
    const buf = [];
    while (i < lines.length && /^> ?/.test(lines[i])) buf.push(lines[i++].replace(/^> ?/, ""));
    blocks.push({ t: "callout", text: buf.join(" ").trim() });
  } else if (/^- /.test(line)) {
    const items = [];
    while (i < lines.length && /^- /.test(lines[i])) {
      let item = lines[i++].slice(2);
      while (i < lines.length && /^ {2,}\S/.test(lines[i]) && !/^ *- /.test(lines[i])) item += " " + lines[i++].trim();
      items.push(item.trim());
    }
    blocks.push({ t: "ul", items });
  } else if (/^\d+\. /.test(line)) {
    const items = [];
    while (i < lines.length && /^\d+\. /.test(lines[i])) {
      let item = lines[i++].replace(/^\d+\. /, "");
      while (i < lines.length && /^ {2,}\S/.test(lines[i]) && !/^ *\d+\. /.test(lines[i])) item += " " + lines[i++].trim();
      items.push(item.trim());
    }
    blocks.push({ t: "ol", items });
  } else if (/^\|/.test(line)) {
    const rows = [];
    while (i < lines.length && /^\|/.test(lines[i])) {
      const cells = lines[i].split("|").slice(1, -1).map((c) => c.trim());
      if (!cells.every((c) => /^[-: ]+$/.test(c))) rows.push(cells);
      i++;
    }
    blocks.push({ t: "table", rows });
  } else if (/^---+$/.test(line.trim())) { blocks.push({ t: "hr" }); i++; }
  else if (line.trim() === "") { i++; }
  else {
    let buf = line;
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !/^(#|>|-|\d+\. |\||```)/.test(lines[i])) buf += " " + lines[i++];
    blocks.push({ t: "p", text: buf.trim() });
  }
}

/* ---------- PDF aufsetzen ---------- */
const doc = new PDFDocument({ size: "A4", margins: M, autoFirstPage: false, bufferPages: true, info: { Title: meta.title, Author: meta.author } });
doc.pipe(createWriteStream(OUTPUT));
doc.registerFont("display", F("sora-800.ttf"));
doc.registerFont("head", F("sora-600.ttf"));
doc.registerFont("body", F("manrope-400.ttf"));
doc.registerFont("bold", F("manrope-600.ttf"));
doc.registerFont("mono", F("spacemono-400.ttf"));
doc.registerFont("monobold", F("spacemono-700.ttf"));

const L = meta.lang === "en"
  ? { chapter: "CHAPTER", toc: "Contents", page: "Page", cover: "AI · SMB PRACTICE" }
  : { chapter: "KAPITEL", toc: "Inhalt", page: "Seite", cover: "KI · MITTELSTAND PRAXIS" };

// **fett** in Segmente zerlegen und als fortlaufenden Text setzen
function richText(text, opts = {}) {
  const segs = text.split(/(\*\*[^*]+\*\*)/).filter(Boolean);
  const baseFont = opts.font || "body";
  const size = opts.size || 10.5;
  const color = opts.color || INK;
  segs.forEach((seg, idx) => {
    const isBold = /^\*\*.*\*\*$/.test(seg);
    const t = isBold ? seg.slice(2, -2) : seg;
    doc.font(isBold ? "bold" : baseFont).fontSize(size).fillColor(isBold ? (opts.boldColor || color) : color)
      .text(t, opts.x ?? undefined, idx === 0 ? opts.y ?? undefined : undefined, {
        width: opts.width || CW, align: opts.align || "left", lineGap: opts.lineGap ?? 3.4,
        continued: idx < segs.length - 1, indent: 0, features: [],
      });
  });
}

function richHeight(text, { size = 10.5, width = CW, lineGap = 3.4, font = "body" } = {}) {
  // Näherung: fett/normal sind ähnlich breit — mit bold messen (worst case)
  doc.font(font).fontSize(size);
  return doc.heightOfString(text.replace(/\*\*/g, ""), { width, lineGap });
}

function ensure(h) {
  if (doc.y + h > PAGE.h - M.bottom) doc.addPage();
}

/* ---------- Cover ---------- */
doc.addPage();
doc.rect(0, 0, PAGE.w, PAGE.h).fill(DARK);
const grad = doc.linearGradient(M.left, 0, PAGE.w - M.right, 0);
grad.stop(0, "#5ef0ff").stop(0.55, "#7c5cff").stop(1, "#ffd479");
doc.font("monobold").fontSize(11).fillColor("#5ef0ff").text(L.cover, M.left, 150, { characterSpacing: 4 });
doc.font("display").fontSize(40).fillColor("#eef1fa").text(meta.title, M.left, 200, { width: CW, lineGap: 4, features: [] });
doc.rect(M.left, doc.y + 18, 140, 3).fill(grad);
doc.font("body").fontSize(14).fillColor("#c9cfdd")
  .text(meta.subtitle, M.left, doc.y + 40, { width: CW - 60, lineGap: 4, features: [] });
doc.font("mono").fontSize(11).fillColor("#9aa1b5").text(meta.author, M.left, PAGE.h - 170);
doc.font("display").fontSize(13);
doc.fillColor("#5ef0ff").text("AI with Maris", M.left, PAGE.h - 148);
doc.font("mono").fontSize(9.5).fillColor("#6b7186").text("aiwithmaris.com", M.left, PAGE.h - 126);

/* ---------- Inhaltsverzeichnis (aus h1) ---------- */
const chapters = blocks.filter((b) => b.t === "h1").map((b) => b.text);
doc.addPage();
doc.font("monobold").fontSize(10).fillColor(CYAN).text(L.toc.toUpperCase(), M.left, M.top, { characterSpacing: 3 });
doc.moveDown(1.2);
chapters.forEach((c, idx) => {
  ensure(26);
  const y = doc.y;
  doc.font("mono").fontSize(10).fillColor(VIOLET).text(String(idx + 1).padStart(2, "0"), M.left, y);
  doc.font("bold").fontSize(11.5).fillColor(INK).text(c, M.left + 34, y, { width: CW - 34, lineGap: 2, features: [] });
  doc.y += 9;
});

/* ---------- Inhalt ---------- */
let chapterNo = 0;
for (const b of blocks) {
  if (b.t === "h1") {
    chapterNo++;
    doc.addPage();
    doc.font("monobold").fontSize(9.5).fillColor(CYAN)
      .text(`${L.chapter} ${String(chapterNo).padStart(2, "0")}`, M.left, M.top, { characterSpacing: 3 });
    doc.moveDown(0.5);
    doc.font("display").fontSize(23).fillColor(INK).text(b.text, { width: CW, lineGap: 3, features: [] });
    const g2 = doc.linearGradient(M.left, 0, M.left + 120, 0);
    g2.stop(0, "#19b8cf").stop(1, "#6c50e8");
    doc.rect(M.left, doc.y + 10, 120, 2.5).fill(g2);
    doc.y += 30;
    doc.x = M.left;
  } else if (b.t === "h2") {
    ensure(60);
    doc.moveDown(0.9);
    doc.font("head").fontSize(14.5).fillColor(VIOLET).text(b.text, M.left, doc.y, { width: CW, lineGap: 2, features: [] });
    doc.moveDown(0.35);
  } else if (b.t === "h3") {
    ensure(48);
    doc.moveDown(0.7);
    doc.font("bold").fontSize(11.5).fillColor(INK).text(b.text, M.left, doc.y, { width: CW, features: [] });
    doc.moveDown(0.25);
  } else if (b.t === "p") {
    ensure(Math.min(richHeight(b.text), 60));
    richText(b.text, { x: M.left });
    doc.moveDown(0.55);
  } else if (b.t === "ul" || b.t === "ol") {
    b.items.forEach((item, idx) => {
      const h = richHeight(item, { width: CW - 22 });
      ensure(h + 6);
      const y = doc.y;
      if (b.t === "ul") {
        doc.circle(M.left + 4, y + 5.4, 1.8).fill(CYAN);
      } else {
        doc.font("monobold").fontSize(9.5).fillColor(VIOLET).text(String(idx + 1) + ".", M.left, y + 0.5, { lineBreak: false });
      }
      richText(item, { x: M.left + 22, y, width: CW - 22 });
      doc.y += 5;
    });
    doc.moveDown(0.45);
  } else if (b.t === "callout") {
    const pad = 13;
    const h = richHeight(b.text, { width: CW - pad * 2 - 4 }) + pad * 2;
    ensure(h + 8);
    const y = doc.y;
    doc.roundedRect(M.left, y, CW, h, 7).fill(BOX_BG);
    doc.rect(M.left, y + 7, 3, h - 14).fill(CYAN);
    richText(b.text, { x: M.left + pad + 4, y: y + pad, width: CW - pad * 2 - 4, boldColor: VIOLET });
    doc.y = y + h + 12;
    doc.x = M.left;
  } else if (b.t === "code") {
    const pad = 14;
    doc.font("mono").fontSize(8.6);
    const codeLines = b.text.split("\n");
    // Vorlagen-Box darf über Seiten laufen: in Segmente schneiden
    let seg = [];
    const flush = (first) => {
      if (!seg.length) return;
      const textSeg = seg.join("\n");
      const h = doc.font("mono").fontSize(8.6).heightOfString(textSeg, { width: CW - pad * 2, lineGap: 2.4 }) + pad * 2;
      ensure(Math.min(h, PAGE.h - M.top - M.bottom));
      const y = doc.y;
      doc.roundedRect(M.left, y, CW, h, 8).fill(CODE_BG);
      if (first) doc.font("monobold").fontSize(7).fillColor("#5ef0ff").text(meta.lang === "en" ? "TEMPLATE — COPY & ADAPT" : "VORLAGE — KOPIEREN & ANPASSEN", M.left + pad, y + 6, { characterSpacing: 2 });
      doc.font("mono").fontSize(8.6).fillColor("#d9e0f2").text(textSeg, M.left + pad, y + (first ? 20 : pad), { width: CW - pad * 2, lineGap: 2.4, features: [] });
      doc.y = y + h + (first ? 8 : 0) + 10;
      doc.x = M.left;
      seg = [];
    };
    let first = true;
    let budget = PAGE.h - M.bottom - doc.y - pad * 2 - 24;
    for (const cl of codeLines) {
      const lh = doc.heightOfString(cl || " ", { width: CW - pad * 2, lineGap: 2.4 });
      if (lh > budget && seg.length) {
        flush(first);
        first = false;
        budget = PAGE.h - M.bottom - doc.y - pad * 2;
      }
      seg.push(cl);
      budget -= lh;
    }
    flush(first);
  } else if (b.t === "table") {
    const cols = Math.max(...b.rows.map((r) => r.length));
    const colW = CW / cols;
    b.rows.forEach((row, ri) => {
      const cellHs = row.map((c) => richHeight(c, { width: colW - 16, size: 9.3, lineGap: 2 }));
      const rh = Math.max(...cellHs) + 12;
      ensure(rh + 4);
      const y = doc.y;
      if (ri === 0) { doc.rect(M.left, y, CW, rh).fill("#e8ebf7"); }
      else if (ri % 2 === 0) { doc.rect(M.left, y, CW, rh).fill("#f7f8fc"); }
      row.forEach((cell, ci) => {
        richText(cell, { x: M.left + ci * colW + 8, y: y + 6, width: colW - 16, size: 9.3, lineGap: 2, font: ri === 0 ? "bold" : "body", color: ri === 0 ? VIOLET : INK });
      });
      doc.y = y + rh;
      doc.x = M.left;
    });
    doc.moveDown(0.6);
  } else if (b.t === "hr") {
    ensure(24);
    doc.moveDown(0.4);
    doc.rect(M.left, doc.y, CW, 0.7).fill("#dcdfeb");
    doc.moveDown(0.8);
  }
}

/* ---------- Schlussseite ---------- */
doc.addPage();
doc.rect(0, 0, PAGE.w, PAGE.h).fill(DARK);
doc.font("display").fontSize(22).fillColor("#eef1fa").text(meta.lang === "en" ? "Start where it counts." : "Anfangen, wo es zählt.", M.left, 300, { width: CW });
doc.font("body").fontSize(11.5).fillColor("#aab0c4").text(
  meta.lang === "en"
    ? "More guides, the daily blog and a free intro call:"
    : "Mehr Leitfäden, der tägliche Blog und ein kostenloses Erstgespräch:",
  M.left, doc.y + 16, { width: CW });
doc.font("monobold").fontSize(12).fillColor("#5ef0ff").text("aiwithmaris.com", M.left, doc.y + 14);
doc.font("mono").fontSize(8.5).fillColor("#6b7186").text(`© ${new Date().getFullYear()} ${meta.author} · AI with Maris, Dortmund`, M.left, PAGE.h - 120, { width: CW });

/* ---------- Fußzeilen (außer Cover/Schluss) ---------- */
const range = doc.bufferedPageRange();
for (let p = 1; p < range.count - 1; p++) {
  doc.switchToPage(p);
  // Fußzeile liegt unter dem Satzspiegel — bottom-Margin kurz auf 0,
  // sonst legt pdfkit automatisch neue Seiten an.
  const oldBottom = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  doc.font("mono").fontSize(7.5).fillColor(MUTED2);
  doc.text(meta.title, M.left, PAGE.h - 46, { width: CW / 2, lineBreak: false, features: [] });
  doc.text(`${L.page} ${p + 1}`, M.left + CW - 80, PAGE.h - 46, { width: 80, align: "right", lineBreak: false, features: [] });
  doc.page.margins.bottom = oldBottom;
}

doc.end();
await new Promise((res) => doc.on("end", res));
console.log("geschrieben:", OUTPUT, "Seiten:", range.count);
