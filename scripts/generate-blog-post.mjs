// Täglicher Blog-Generator für aiwithmaris.com
//
// Läuft in GitHub Actions (.github/workflows/daily-blog.yml). Drei Modi:
//   queue     (Standard, KEIN API-Key nötig): veröffentlicht den ältesten
//             vorbereiteten Artikel aus blog/queue/*.json — die Entwürfe
//             entstehen wöchentlich im Claude-Chat und werden dort freigegeben
//   evergreen (braucht ANTHROPIC_API_KEY): schreibt selbst einen Artikel zum
//             obersten offenen Thema aus blog/topics.md
//   news      (braucht ANTHROPIC_API_KEY): sucht eine aktuelle KI-Nachricht
//             per Websuche und schreibt eine Einordnung
//
// Veröffentlichen heißt immer: HTML-Seiten (DE+EN), Blog-Index, RSS-Feeds und
// Sitemap erzeugen, topics.md/posts.json fortschreiben — Commit macht der Workflow.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://aiwithmaris.com";
const MODEL = "claude-opus-4-8";

// SDK nur laden, wenn ein KI-Modus es braucht — der Queue-Modus läuft ohne
// Abhängigkeiten und ohne API-Key.
let _client;
async function getClient() {
  if (!_client) {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    _client = new Anthropic();
  }
  return _client;
}

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const write = (p, c) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, p), c);
};

const styleguide = read("blog/styleguide.md");
const template = read("blog/template.html");
const postsDb = JSON.parse(read("blog/posts.json"));

// ---------------------------------------------------------------- Hilfen

function textOf(message) {
  return message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
}

// Erwartet eine Antwort mit output_config.format → erster Text-Block ist JSON
function jsonOf(message) {
  return JSON.parse(textOf(message));
}

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s) {
  return escapeXml(s);
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
}

function readingMinutes(html) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 200));
}

// Server-Tools (Websuche) können mit stop_reason "pause_turn" pausieren —
// dann denselben Verlauf erneut senden, die API macht weiter.
async function createWithContinuation(params, maxContinuations = 6) {
  const client = await getClient();
  let messages = params.messages;
  let response = await client.messages.create({ ...params, messages });
  let rounds = 0;
  while (response.stop_reason === "pause_turn" && rounds < maxContinuations) {
    messages = [...messages, { role: "assistant", content: response.content }];
    response = await client.messages.create({ ...params, messages });
    rounds++;
  }
  return response;
}

// ---------------------------------------------------------------- Schemata

const ARTICLE_SCHEMA = {
  type: "object",
  properties: {
    slug: {
      type: "string",
      description: "URL-Slug aus dem deutschen Titel: nur Kleinbuchstaben a-z, Ziffern und Bindestriche, max. 60 Zeichen",
    },
    de: {
      type: "object",
      properties: {
        title: { type: "string" },
        teaser: { type: "string", description: "1-2 Sätze Anrisstext für Übersichtsseite und Meta-Description (max. 160 Zeichen)" },
        html: { type: "string", description: "Artikeltext als HTML-Fragment. Erlaubte Tags: <p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>, <em>, <a>. Keine <h1>, keine Inline-Styles, keine Scripts." },
      },
      required: ["title", "teaser", "html"],
      additionalProperties: false,
    },
    en: {
      type: "object",
      properties: {
        title: { type: "string" },
        teaser: { type: "string", description: "1-2 sentence teaser, max. 160 characters" },
        html: { type: "string", description: "Article body as HTML fragment. Allowed tags: <p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>, <em>, <a>." },
      },
      required: ["title", "teaser", "html"],
      additionalProperties: false,
    },
  },
  required: ["slug", "de", "en"],
  additionalProperties: false,
};

const REVIEW_SCHEMA = {
  type: "object",
  properties: {
    approved: { type: "boolean" },
    feedback: { type: "string", description: "Konkrete Verbesserungshinweise, falls nicht freigegeben; sonst leer" },
  },
  required: ["approved", "feedback"],
  additionalProperties: false,
};

const TOPICS_SCHEMA = {
  type: "object",
  properties: {
    topics: { type: "array", items: { type: "string" } },
  },
  required: ["topics"],
  additionalProperties: false,
};

// ---------------------------------------------------------------- Themenwahl

const now = new Date();
const weekday = now.getDay(); // 0=So … 6=Sa
// Standard ist "queue" (kein API-Key nötig). "auto" wählt nach Wochentag
// zwischen den KI-Modi (Di+Fr News, sonst Evergreen).
const requested = process.env.BLOG_MODE || "queue";
const mode =
  requested === "auto"
    ? weekday === 2 || weekday === 5
      ? "news"
      : "evergreen"
    : requested;

function ghOutput(key, value) {
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
  }
}

const recentTitles = postsDb.posts.slice(0, 20).map((p) => p.de.title);

function parseOpenTopics(topicsMd) {
  return topicsMd
    .split("\n")
    .filter((l) => l.startsWith("- [ ] "))
    .map((l) => l.slice(6).trim());
}

async function refillTopics(topicsMd) {
  console.log("Themenliste leer — generiere Nachschub …");
  const response = await (await getClient()).messages.create({
    model: MODEL,
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    output_config: { format: { type: "json_schema", schema: TOPICS_SCHEMA } },
    messages: [
      {
        role: "user",
        content:
          `Hier ist das Schreibstil-Profil eines Blogs über KI im deutschen Mittelstand:\n\n${styleguide}\n\n` +
          `Bereits veröffentlichte Artikel:\n${recentTitles.map((t) => `- ${t}`).join("\n") || "- (noch keine)"}\n\n` +
          `Generiere 10 neue, konkrete Evergreen-Blogthemen, die zu Profil und Zielgruppe passen und sich nicht mit den veröffentlichten überschneiden. Jeweils als ein prägnanter Arbeitstitel auf Deutsch.`,
      },
    ],
  });
  const { topics } = jsonOf(response);
  const lines = topics.map((t) => `- [ ] ${t}`).join("\n");
  return topicsMd.replace("## Veröffentlicht", `${lines}\n\n## Veröffentlicht`);
}

async function researchNews() {
  console.log("News-Modus: suche aktuelle KI-Nachricht …");
  const response = await createWithContinuation({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    tools: [{ type: "web_search_20260209", name: "web_search" }],
    messages: [
      {
        role: "user",
        content:
          `Heute ist der ${now.toISOString().slice(0, 10)}. Suche EINE aktuelle KI-Nachricht der letzten 3-4 Tage, ` +
          `die für Entscheider im deutschen Mittelstand relevant ist (neue Modelle/Tools, Regulierung wie der EU AI Act, ` +
          `Preisänderungen, relevante Studien, Sicherheitsthemen). Bevorzuge seriöse Quellen.\n\n` +
          `Bereits behandelte Artikel (nicht wiederholen):\n${recentTitles.map((t) => `- ${t}`).join("\n") || "- (noch keine)"}\n\n` +
          `Antworte mit: (1) Schlagzeile, (2) die wichtigsten Fakten mit Quellenangaben (Name + Datum), ` +
          `(3) warum das für mittelständische Unternehmen relevant ist. Nur belegte Fakten aus den Suchergebnissen verwenden.`,
      },
    ],
  });
  return textOf(response);
}

// ---------------------------------------------------------------- Schreiben & Prüfen

const WRITER_SYSTEM =
  `Du bist der Ghostwriter von Maris Reinold und schreibst Artikel für den Blog auf aiwithmaris.com. ` +
  `Du hältst dich strikt an das folgende Schreibstil-Profil:\n\n${styleguide}\n\n` +
  `Eiserne Regeln:\n` +
  `- Erfinde niemals Fakten, Zahlen, Studien, Kunden oder Zitate. Hypothetische Beispiele klar kennzeichnen („Stell dir vor …“).\n` +
  `- Verlinke sparsam und nur intern (/guide.html, /leistungen.html, /beispiele.html, /kontakt.html) oder auf im Material genannte Quellen.\n` +
  `- Der HTML-Text beginnt direkt mit einem <p>-Absatz (Titel und Teaser stehen separat).\n` +
  `- Die englische Fassung ist derselbe Artikel im selben Ton, kein Wort-für-Wort-Übersetzungston.`;

async function writeArticle(assignment, feedback = "") {
  const client = await getClient();
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    system: WRITER_SYSTEM,
    output_config: { format: { type: "json_schema", schema: ARTICLE_SCHEMA } },
    messages: [
      {
        role: "user",
        content:
          assignment +
          `\n\nBereits veröffentlichte Artikel (keine Dopplung in Titel oder Kernaussage):\n` +
          `${recentTitles.map((t) => `- ${t}`).join("\n") || "- (noch keine)"}` +
          (feedback
            ? `\n\nÜberarbeite deinen vorherigen Entwurf anhand dieses Feedbacks:\n${feedback}`
            : ""),
      },
    ],
  });
  return jsonOf(await stream.finalMessage());
}

async function reviewArticle(article) {
  const response = await (await getClient()).messages.create({
    model: MODEL,
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    output_config: { format: { type: "json_schema", schema: REVIEW_SCHEMA } },
    messages: [
      {
        role: "user",
        content:
          `Du bist Lektor. Prüfe den folgenden Blog-Artikel (DE + EN) gegen das Stil-Profil:\n\n${styleguide}\n\n` +
          `Prüfkriterien: Stiltreue (Du-Form, kurze Sätze, keine Buzzwords), keine erfundenen Fakten/Zahlen/Kunden, ` +
          `Länge 700-1100 Wörter (DE), sauberes HTML (nur erlaubte Tags), Teaser max. 160 Zeichen, ` +
          `EN-Fassung inhaltlich gleichwertig.\n\n` +
          `Artikel:\n${JSON.stringify(article)}\n\n` +
          `Gib approved=true, wenn der Artikel veröffentlicht werden kann. Bei kleineren Stilabweichungen großzügig sein; ` +
          `bei erfundenen Fakten, falschem Ton (Sie-Form, Marketing-Sprech) oder kaputtem HTML ablehnen und konkretes Feedback geben.`,
      },
    ],
  });
  return jsonOf(response);
}

// ---------------------------------------------------------------- Seiten bauen

const UI = {
  de: {
    back: "Alle Artikel",
    eyebrow: "Blog",
    read: "Min. Lesezeit",
    ctaTitle: "Tiefer einsteigen?",
    ctaText: "Im KI-Guide „Anfangen, wo es zählt“ steht der komplette Fahrplan — vom ersten Use Case bis zur Skalierung. Oder schreib mir einfach direkt.",
    ctaGuide: "Zum KI-Guide",
    ctaContact: "Kontakt",
    more: "Weiterlesen →",
    toggle: "EN",
  },
  en: {
    back: "All articles",
    eyebrow: "Blog",
    read: "min read",
    ctaTitle: "Want to go deeper?",
    ctaText: "My AI guide “Start where it counts” lays out the full roadmap — from the first use case to scaling. Or just drop me a line.",
    ctaGuide: "Get the AI guide",
    ctaContact: "Contact",
    more: "Read more →",
    toggle: "DE",
  },
};

function renderArticlePage(post, lang) {
  const t = post[lang];
  const ui = UI[lang];
  const urlDe = `${SITE}/blog/${post.slug}`;
  const urlEn = `${SITE}/blog/en/${post.slug}`;
  const canonical = lang === "de" ? urlDe : urlEn;
  const dateHuman = new Intl.DateTimeFormat(lang === "de" ? "de-DE" : "en-GB", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(post.date));

  const repl = {
    "{{LANG}}": lang,
    "{{ALT_URL}}": lang === "de" ? `/blog/en/${post.slug}` : `/blog/${post.slug}`,
    "{{TITLE}}": escapeXml(t.title),
    "{{TITLE_JSON}}": JSON.stringify(t.title),
    "{{DESCRIPTION}}": escapeAttr(t.teaser),
    "{{DESCRIPTION_JSON}}": JSON.stringify(t.teaser),
    "{{CANONICAL}}": canonical,
    "{{URL_DE}}": urlDe,
    "{{URL_EN}}": urlEn,
    "{{FEED_URL}}": lang === "de" ? `${SITE}/blog/feed.xml` : `${SITE}/blog/en/feed.xml`,
    "{{DATE_ISO}}": post.date,
    "{{DATE_HUMAN}}": dateHuman,
    "{{READ_MIN}}": String(readingMinutes(t.html)),
    "{{CONTENT}}": t.html,
    "{{P}}": "/",
    "{{BLOG_INDEX}}": lang === "de" ? "/blog" : "/blog/en",
    "{{LANG_TOGGLE_LABEL}}": ui.toggle,
    "{{UI_BACK}}": ui.back,
    "{{UI_EYEBROW}}": ui.eyebrow,
    "{{UI_READ}}": ui.read,
    "{{UI_CTA_TITLE}}": ui.ctaTitle,
    "{{UI_CTA_TEXT}}": ui.ctaText,
    "{{UI_CTA_GUIDE}}": ui.ctaGuide,
    "{{UI_CTA_CONTACT}}": ui.ctaContact,
  };
  let html = template;
  for (const [key, value] of Object.entries(repl)) {
    html = html.split(key).join(value);
  }
  return html;
}

function renderIndexCards(posts, lang) {
  if (posts.length === 0) return "";
  return posts
    .map((post) => {
      const t = post[lang];
      const href = lang === "de" ? `/blog/${post.slug}` : `/blog/en/${post.slug}`;
      const dateHuman = new Intl.DateTimeFormat(lang === "de" ? "de-DE" : "en-GB", {
        day: "numeric", month: "long", year: "numeric",
      }).format(new Date(post.date));
      return (
        `      <a class="blog-card" href="${href}" data-hover>\n` +
        `        <time datetime="${post.date}">${dateHuman}</time>\n` +
        `        <h2>${escapeXml(t.title)}</h2>\n` +
        `        <p>${escapeXml(t.teaser)}</p>\n` +
        `        <span class="more">${UI[lang].more}</span>\n` +
        `      </a>`
      );
    })
    .join("\n");
}

function updateIndexPage(file, cards) {
  const html = read(file);
  const updated = html.replace(
    /<!-- BLOG:LIST:START -->[\s\S]*<!-- BLOG:LIST:END -->/,
    `<!-- BLOG:LIST:START -->\n${cards}\n<!-- BLOG:LIST:END -->`,
  );
  write(file, updated);
}

function renderFeed(posts, lang) {
  const base = lang === "de" ? `${SITE}/blog` : `${SITE}/blog/en`;
  const items = posts
    .slice(0, 30)
    .map((post) => {
      const t = post[lang];
      const url = `${base}/${post.slug}`;
      return (
        `    <item>\n` +
        `      <title>${escapeXml(t.title)}</title>\n` +
        `      <link>${url}</link>\n` +
        `      <guid>${url}</guid>\n` +
        `      <pubDate>${new Date(post.date).toUTCString()}</pubDate>\n` +
        `      <description>${escapeXml(t.teaser)}</description>\n` +
        `    </item>`
      );
    })
    .join("\n");
  const title = lang === "de" ? "AI with Maris — Blog" : "AI with Maris — Blog (English)";
  const desc =
    lang === "de"
      ? "Täglich ein neuer Artikel über KI im Mittelstand."
      : "A new article every day about AI in small and mid-sized businesses.";
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0">\n  <channel>\n` +
    `    <title>${title}</title>\n    <link>${base}</link>\n` +
    `    <description>${desc}</description>\n    <language>${lang}</language>\n` +
    `${items}\n  </channel>\n</rss>\n`
  );
}

function renderSitemap(posts) {
  const staticPages = [
    `${SITE}/`, `${SITE}/leistungen`, `${SITE}/beispiele`, `${SITE}/guide`,
    `${SITE}/ueber-uns`, `${SITE}/kontakt`, `${SITE}/blog`, `${SITE}/blog/en`,
  ];
  const urls = [
    ...staticPages.map((u) => `  <url><loc>${u}</loc></url>`),
    ...posts.flatMap((p) => [
      `  <url><loc>${SITE}/blog/${p.slug}</loc><lastmod>${p.date.slice(0, 10)}</lastmod></url>`,
      `  <url><loc>${SITE}/blog/en/${p.slug}</loc><lastmod>${p.date.slice(0, 10)}</lastmod></url>`,
    ]),
  ].join("\n");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
}

// ---------------------------------------------------------------- Hauptablauf

async function main() {
  let topicsMd = read("blog/topics.md");
  let assignment;
  let topicLabel;

  // Testmodus ohne API: BLOG_FAKE_ARTICLE=pfad/zu/artikel.json schickt einen
  // vorgefertigten Artikel durch die komplette Render-Pipeline.
  if (process.env.BLOG_FAKE_ARTICLE) {
    const article = JSON.parse(fs.readFileSync(process.env.BLOG_FAKE_ARTICLE, "utf8"));
    publish(article, topicsMd, "Testlauf");
    return;
  }

  // Queue-Modus: ältesten vorbereiteten Artikel aus blog/queue/ veröffentlichen.
  // Die JSON-Dateien entstehen wöchentlich im Claude-Chat nach Freigabe.
  if (mode === "queue") {
    const qdir = path.join(ROOT, "blog/queue");
    const files = fs.existsSync(qdir)
      ? fs.readdirSync(qdir).filter((f) => f.endsWith(".json")).sort()
      : [];
    ghOutput("remaining", String(Math.max(0, files.length - 1)));
    if (files.length === 0) {
      console.log("Warteschlange leer — heute erscheint kein Artikel.");
      ghOutput("published", "false");
      return;
    }
    const article = JSON.parse(fs.readFileSync(path.join(qdir, files[0]), "utf8"));
    publish(article, topicsMd, article.topic || "Aus der Warteschlange");
    fs.unlinkSync(path.join(qdir, files[0]));
    console.log(`Noch ${files.length - 1} Artikel in der Warteschlange.`);
    return;
  }

  if (mode === "news") {
    const research = await researchNews();
    topicLabel = "News-Kommentar";
    assignment =
      `Schreibe den heutigen Blog-Artikel als Einordnung einer aktuellen KI-Nachricht für den Mittelstand. ` +
      `Hier die Rechercheergebnisse (nur diese Fakten verwenden, Quellen im Text nennen):\n\n${research}\n\n` +
      `Der Artikel ist keine Nachrichtenmeldung, sondern Maris' Einordnung: Was bedeutet das konkret für ein ` +
      `mittelständisches Unternehmen? Was sollte man tun — oder bewusst lassen?`;
  } else {
    let open = parseOpenTopics(topicsMd);
    if (open.length === 0) {
      topicsMd = await refillTopics(topicsMd);
      open = parseOpenTopics(topicsMd);
    }
    topicLabel = open[0];
    assignment = `Schreibe den heutigen Blog-Artikel zum Thema:\n\n„${topicLabel}“`;
  }

  console.log(`Modus: ${mode} — Thema: ${topicLabel}`);

  // Schreiben + Qualitäts-Check (max. eine Überarbeitungsrunde)
  let article = await writeArticle(assignment);
  const review = await reviewArticle(article);
  if (!review.approved) {
    console.log(`Lektorat fordert Überarbeitung: ${review.feedback}`);
    article = await writeArticle(assignment, review.feedback);
  } else {
    console.log("Lektorat: freigegeben.");
  }

  publish(article, topicsMd, topicLabel);
}

function publish(article, topicsMd, topicLabel) {
  // Slug absichern (Format + Eindeutigkeit)
  let slug = slugify(article.slug || article.de.title);
  if (!slug) slug = `artikel-${now.toISOString().slice(0, 10)}`;
  const taken = new Set(postsDb.posts.map((p) => p.slug));
  if (taken.has(slug)) {
    let i = 2;
    while (taken.has(`${slug}-${i}`)) i++;
    slug = `${slug}-${i}`;
  }

  const post = {
    slug,
    date: now.toISOString(),
    mode,
    de: { title: article.de.title, teaser: article.de.teaser, html: article.de.html },
    en: { title: article.en.title, teaser: article.en.teaser, html: article.en.html },
  };

  // Seiten schreiben
  write(`blog/${slug}.html`, renderArticlePage(post, "de"));
  write(`blog/en/${slug}.html`, renderArticlePage(post, "en"));

  // Registry, Index-Seiten, Feeds, Sitemap
  postsDb.posts.unshift(post);
  write("blog/posts.json", JSON.stringify(postsDb, null, 2) + "\n");
  updateIndexPage("blog/index.html", renderIndexCards(postsDb.posts, "de"));
  updateIndexPage("blog/en/index.html", renderIndexCards(postsDb.posts, "en"));
  write("blog/feed.xml", renderFeed(postsDb.posts, "de"));
  write("blog/en/feed.xml", renderFeed(postsDb.posts, "en"));
  write("sitemap.xml", renderSitemap(postsDb.posts));

  // Thema in topics.md als veröffentlicht markieren. Das Abhaken greift,
  // wenn topicLabel ein offenes Thema ist (Evergreen oder Queue-Artikel mit
  // "topic"-Feld) — sonst läuft das replace ins Leere.
  const publishedLine = `- ${now.toISOString().slice(0, 10)} — ${post.de.title} (${mode === "news" ? "News" : topicLabel})`;
  topicsMd = topicsMd.replace(`- [ ] ${topicLabel}\n`, "");
  topicsMd = topicsMd.replace("## Veröffentlicht", `## Veröffentlicht\n\n${publishedLine}`);
  write("blog/topics.md", topicsMd);

  // An den Workflow durchreichen (Commit-Message + Commit-Bedingung)
  ghOutput("title", post.de.title.replace(/\n/g, " "));
  ghOutput("published", "true");
  console.log(`Fertig: /blog/${slug} + /blog/en/${slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
