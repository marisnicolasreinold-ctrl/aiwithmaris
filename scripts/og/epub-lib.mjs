// EPUB-Generator für die eBook-Manuskripte (gleicher Markdown-Dialekt wie
// render-ebook.mjs: Front Matter, # Kapitel, ##/###, **fett**, - / 1. Listen,
// > Callouts, ``` Vorlagen-Boxen, | Tabellen, --- Trenner).
// Erzeugt ein valides EPUB 3 (mit NCX für ältere Reader) ohne Abhängigkeiten —
// der ZIP-Container wird von Hand geschrieben (alle Einträge "stored", die
// mimetype-Datei wie gefordert unkomprimiert an erster Stelle).
// Läuft identisch unter Node und Deno (nur Web-APIs + TextEncoder).

/* ---------- ZIP (stored, ohne Kompression) ---------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function zipStore(entries) {
  // feste Zeitangabe, damit der Output deterministisch ist (12.06.2026, 12:00)
  const dosTime = (12 << 11) | (0 << 5) | 0;
  const dosDate = ((2026 - 1980) << 9) | (6 << 5) | 12;
  const enc = new TextEncoder();
  const parts = [];
  const central = [];
  let offset = 0;
  const u16 = (n) => new Uint8Array([n & 255, (n >> 8) & 255]);
  const u32 = (n) => new Uint8Array([n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255]);
  for (const { name, data } of entries) {
    const nameB = enc.encode(name);
    const crc = crc32(data);
    const head = [
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(dosTime), u16(dosDate),
      u32(crc), u32(data.length), u32(data.length), u16(nameB.length), u16(0),
    ];
    const local = concat([...head, nameB, data]);
    parts.push(local);
    central.push(concat([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(dosTime), u16(dosDate),
      u32(crc), u32(data.length), u32(data.length), u16(nameB.length),
      u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), nameB,
    ]));
    offset += local.length;
  }
  const centralBlob = concat(central);
  const end = concat([
    u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length),
    u32(centralBlob.length), u32(offset), u16(0),
  ]);
  return concat([...parts, centralBlob, end]);
}
function concat(arrs) {
  const total = arrs.reduce((a, x) => a + x.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const a of arrs) { out.set(a, o); o += a.length; }
  return out;
}

/* ---------- Markdown-Dialekt parsen (wie render-ebook.mjs) ---------- */
export function parseManuscript(raw) {
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
  return { meta, blocks };
}

/* ---------- XHTML ---------- */
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// **fett** nach dem Escapen in <strong> wandeln
const rich = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

function blockToHtml(b, L) {
  if (b.t === "h2") return `<h2>${rich(b.text)}</h2>`;
  if (b.t === "h3") return `<h3>${rich(b.text)}</h3>`;
  if (b.t === "p") return `<p>${rich(b.text)}</p>`;
  if (b.t === "ul") return `<ul>${b.items.map((x) => `<li>${rich(x)}</li>`).join("")}</ul>`;
  if (b.t === "ol") return `<ol>${b.items.map((x) => `<li>${rich(x)}</li>`).join("")}</ol>`;
  if (b.t === "callout") return `<blockquote class="callout"><p>${rich(b.text)}</p></blockquote>`;
  if (b.t === "code") return `<div class="template"><p class="template-label">${esc(L.template)}</p><pre>${esc(b.text)}</pre></div>`;
  if (b.t === "hr") return `<hr/>`;
  if (b.t === "table") {
    const [head, ...rows] = b.rows;
    return `<table><thead><tr>${head.map((c) => `<th>${rich(c)}</th>`).join("")}</tr></thead>` +
      `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${rich(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }
  return "";
}

function xhtmlDoc(lang, title, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${lang}" lang="${lang}">
<head><meta charset="utf-8"/><title>${esc(title)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head>
<body>
${body}
</body>
</html>
`;
}

const CSS = `body{font-family:serif;line-height:1.55;margin:0.4em 5%;}
h1,h2,h3{font-family:sans-serif;line-height:1.25;color:#1c2030;}
h1{font-size:1.7em;margin:1.4em 0 0.6em;}
h2{font-size:1.25em;margin:1.3em 0 0.4em;color:#4a3bb8;}
h3{font-size:1.05em;margin:1.1em 0 0.3em;}
p{margin:0 0 0.7em;text-align:left;}
.chapnum{font-family:monospace;font-size:0.78em;letter-spacing:0.2em;color:#1186a0;margin:2em 0 0;}
.callout{margin:1em 0;padding:0.7em 1em;border-left:4px solid #1186a0;background:#f2f4fb;}
.callout p{margin:0;}
.template{margin:1em 0;padding:0.7em 1em;border:1px solid #c9cfdd;background:#f7f8fc;}
.template-label{font-family:monospace;font-size:0.7em;letter-spacing:0.18em;color:#4a3bb8;margin:0 0 0.5em;}
.template pre{font-family:monospace;font-size:0.85em;white-space:pre-wrap;margin:0;}
table{border-collapse:collapse;margin:1em 0;width:100%;}
th,td{border:1px solid #c9cfdd;padding:0.4em 0.6em;font-size:0.9em;text-align:left;vertical-align:top;}
th{background:#e8ebf7;}
hr{border:0;border-top:1px solid #dcdfeb;margin:1.5em 0;}
.titlepage{text-align:center;margin-top:18%;}
.titlepage .kicker{font-family:monospace;font-size:0.75em;letter-spacing:0.25em;color:#1186a0;}
.titlepage h1{font-size:2em;margin:0.5em 0 0.4em;}
.titlepage .subtitle{font-size:1.05em;color:#5a6072;margin:0 8%;}
.titlepage .author{margin-top:3em;color:#5a6072;}
.endpage{text-align:center;margin-top:25%;}
.endpage .site{font-family:monospace;color:#1186a0;}
`;

/* ---------- EPUB bauen ---------- */
export function buildEpub(markdown, uuid) {
  const { meta, blocks } = parseManuscript(markdown);
  const lang = meta.lang === "en" ? "en" : "de";
  const L = lang === "en"
    ? { chapter: "CHAPTER", toc: "Contents", intro: "Introduction", template: "TEMPLATE — COPY & ADAPT", kicker: "AI · SMB PRACTICE", end: "Start where it counts.", more: "More guides, the daily blog and a free intro call:" }
    : { chapter: "KAPITEL", toc: "Inhalt", intro: "Einleitung", template: "VORLAGE — KOPIEREN & ANPASSEN", kicker: "KI · MITTELSTAND PRAXIS", end: "Anfangen, wo es zählt.", more: "Mehr Leitfäden, der tägliche Blog und ein kostenloses Erstgespräch:" };

  // Kapitel an h1 teilen; Blöcke vor dem ersten h1 werden zur Einleitung
  const chapters = [];
  let current = null;
  for (const b of blocks) {
    if (b.t === "h1") {
      current = { title: b.text, blocks: [] };
      chapters.push(current);
    } else {
      if (!current) { current = { title: L.intro, blocks: [] }; chapters.push(current); }
      current.blocks.push(b);
    }
  }

  const enc = new TextEncoder();
  const files = [];
  const chapterFiles = chapters.map((c, idx) => {
    const no = String(idx + 1).padStart(2, "0");
    const name = `chapter-${no}.xhtml`;
    const body = `<section epub:type="chapter"><p class="chapnum">${L.chapter} ${no}</p><h1>${rich(c.title)}</h1>\n` +
      c.blocks.map((b) => blockToHtml(b, L)).join("\n") + `\n</section>`;
    files.push({ name: `OEBPS/${name}`, data: enc.encode(xhtmlDoc(lang, c.title, body)) });
    return { name, title: c.title };
  });

  const titleBody = `<section epub:type="titlepage" class="titlepage">
<p class="kicker">${L.kicker}</p>
<h1>${rich(meta.title)}</h1>
<p class="subtitle">${rich(meta.subtitle || "")}</p>
<p class="author">${esc(meta.author)}<br/>AI with Maris · aiwithmaris.com</p>
</section>`;
  files.unshift({ name: "OEBPS/titlepage.xhtml", data: enc.encode(xhtmlDoc(lang, meta.title, titleBody)) });

  const endBody = `<section class="endpage"><h1>${esc(L.end)}</h1><p>${esc(L.more)}</p><p class="site">aiwithmaris.com</p>
<p>© ${new Date().getFullYear()} ${esc(meta.author)} · AI with Maris, Dortmund</p></section>`;
  files.push({ name: "OEBPS/end.xhtml", data: enc.encode(xhtmlDoc(lang, "AI with Maris", endBody)) });

  const navBody = `<nav epub:type="toc" id="toc"><h1>${esc(L.toc)}</h1><ol>
<li><a href="titlepage.xhtml">${rich(meta.title)}</a></li>
${chapterFiles.map((c) => `<li><a href="${c.name}">${rich(c.title)}</a></li>`).join("\n")}
<li><a href="end.xhtml">AI with Maris</a></li>
</ol></nav>
<nav epub:type="landmarks" hidden=""><ol>
<li><a epub:type="titlepage" href="titlepage.xhtml">${esc(meta.title)}</a></li>
<li><a epub:type="bodymatter" href="${chapterFiles[0].name}">${esc(L.toc)}</a></li>
</ol></nav>`;
  files.push({ name: "OEBPS/nav.xhtml", data: enc.encode(xhtmlDoc(lang, L.toc, navBody)) });

  // NCX für ältere Reader
  const ncx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
<head><meta name="dtb:uid" content="urn:uuid:${uuid}"/></head>
<docTitle><text>${esc(meta.title)}</text></docTitle>
<navMap>
${chapterFiles.map((c, i) => `<navPoint id="np-${i + 1}" playOrder="${i + 1}"><navLabel><text>${esc(c.title)}</text></navLabel><content src="${c.name}"/></navPoint>`).join("\n")}
</navMap></ncx>
`;
  files.push({ name: "OEBPS/toc.ncx", data: enc.encode(ncx) });
  files.push({ name: "OEBPS/style.css", data: enc.encode(CSS) });

  const manifest = [
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`,
    `<item id="css" href="style.css" media-type="text/css"/>`,
    `<item id="titlepage" href="titlepage.xhtml" media-type="application/xhtml+xml"/>`,
    ...chapterFiles.map((c, i) => `<item id="ch-${i + 1}" href="${c.name}" media-type="application/xhtml+xml"/>`),
    `<item id="end" href="end.xhtml" media-type="application/xhtml+xml"/>`,
  ].join("\n");
  const spine = [
    `<itemref idref="titlepage"/>`,
    ...chapterFiles.map((c, i) => `<itemref idref="ch-${i + 1}"/>`),
    `<itemref idref="end"/>`,
  ].join("\n");
  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" xml:lang="${lang}">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="uid">urn:uuid:${uuid}</dc:identifier>
<dc:title>${esc(meta.title)}</dc:title>
${meta.subtitle ? `<dc:description>${esc(meta.subtitle)}</dc:description>` : ""}
<dc:creator>${esc(meta.author)}</dc:creator>
<dc:language>${lang}</dc:language>
<dc:publisher>AI with Maris</dc:publisher>
<meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, "Z")}</meta>
</metadata>
<manifest>
${manifest}
</manifest>
<spine toc="ncx">
${spine}
</spine>
</package>
`;
  files.push({ name: "OEBPS/content.opf", data: enc.encode(opf) });

  const container = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>
`;

  const entries = [
    { name: "mimetype", data: enc.encode("application/epub+zip") }, // muss zuerst kommen, unkomprimiert
    { name: "META-INF/container.xml", data: enc.encode(container) },
    ...files,
  ];
  return { bytes: zipStore(entries), meta, chapterCount: chapterFiles.length };
}
