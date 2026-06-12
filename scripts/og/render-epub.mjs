// Rendert ein eBook-Manuskript (gleicher Markdown-Dialekt wie render-ebook.mjs)
// als EPUB 3 — für Amazon KDP & Co. Die gleiche Logik läuft serverseitig in
// der Edge Function export-epub (liest die Manuskripte aus dem privaten
// Storage und legt die EPUBs im Dokumente-Tab des Cockpits ab).
// Aufruf: node scripts/og/render-epub.mjs <input.md> <output.epub>
import { readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { buildEpub } from "./epub-lib.mjs";

const [, , INPUT, OUTPUT] = process.argv;
if (!INPUT || !OUTPUT) {
  console.error("Aufruf: node render-epub.mjs <input.md> <output.epub>");
  process.exit(1);
}

const md = await readFile(INPUT, "utf8");
const { bytes, meta, chapterCount } = buildEpub(md, randomUUID());
await writeFile(OUTPUT, bytes);
console.log(`geschrieben: ${OUTPUT} (${meta.title}, ${chapterCount} Kapitel, ${(bytes.length / 1024).toFixed(1)} KB)`);
