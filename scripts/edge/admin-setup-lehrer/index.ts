// TEMPORÄRE Setup-Function für das Lehrkräfte-eBook (Muster: import-ebooks /
// admin-setup-editions). Nach Abschluss stilllegen (410-Stub deployen)!
// Auth: Header x-setup-key — vor dem Deploy SETUP_KEY durch einen frischen
// Zufallswert ersetzen (z. B. `openssl rand -hex 24`).
//
// Schritte (POST {step: ...}):
//   chunk    {id, b64}      -> base64(gzip)-Teil nach guides/sources/_lehrer_chunk_<id>.txt
//                             (Antwort enthält sha256 des Teils zur Verifikation)
//   verify   {count}        -> sha256 je gespeichertem Teil (Integritäts-Check)
//   assemble {count}        -> Teile zusammenfügen, base64-dekodieren + gunzip ->
//                             guides/sources/lehrer-ki-workflow-de.md
//                             (Antwort enthält sha256 + Bytezahl der .md)
// Hinweis: Beim Live-Lauf (13.06.2026) wurde render.ts als zweite Bundle-Datei
// mitdeployt (kein Remote-Import); diese Referenz nutzt den statischen Import.
//   render   {}             -> PDF rendern -> guides/lehrer-ki-workflow-de.pdf
//   stripe   {link?}        -> Live-Produkt + Preis 19 € (+ optional Payment Link), idempotent
//   docs     {files:[{url,path,name,mime}]} -> Dateien (z. B. Cover) in den Dokumente-Tab
import { createClient } from "npm:@supabase/supabase-js@2";
import { renderPdf } from "./render.ts";

const SETUP_KEY = "SETUP_KEY_VOR_DEPLOY_ERSETZEN";
const FONT_BASE = "https://raw.githubusercontent.com/marisnicolasreinold-ctrl/aiwithmaris/main/scripts/og/fonts/";
const FONT_FILES: Record<string, string> = {
  display: "sora-800.ttf", head: "sora-600.ttf", body: "manrope-400.ttf",
  bold: "manrope-600.ttf", mono: "spacemono-400.ttf", monobold: "spacemono-700.ttf",
};
const SRC = "sources/lehrer-ki-workflow-de.md";
const PDF_OBJ = "lehrer-ki-workflow-de.pdf";
const WAIVER = "Digitales Produkt: Mit dem Kauf verlangst du die sofortige Bereitstellung des Downloads und bestätigst, dass dein Widerrufsrecht damit erlischt. Eine Rückgabe oder Erstattung ist ausgeschlossen.";
const FOOTER = "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.";

async function sha256Hex(data: Uint8Array | string): Promise<string> {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function gunzip(gz: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream("gzip");
  const stream = new Response(gz).body!.pipeThrough(ds);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

Deno.serve(async (req: Request) => {
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });
  if (req.headers.get("x-setup-key") !== SETUP_KEY) return json(401, { error: "Unauthorized" });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* leer */ }
  const step = String(body.step ?? "");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    if (step === "chunk") {
      const id = Number(body.id);
      const b64 = String(body.b64 ?? "");
      if (id === undefined || Number.isNaN(id) || !b64) return json(400, { error: "id/b64 fehlt" });
      const up = await supabase.storage.from("guides").upload(
        `sources/_lehrer_chunk_${id}.txt`,
        new TextEncoder().encode(b64),
        { contentType: "text/plain; charset=utf-8", upsert: true }
      );
      if (up.error) return json(500, { error: up.error.message });
      return json(200, { ok: true, id, len: b64.length, sha256: await sha256Hex(b64) });
    }

    if (step === "verify") {
      const count = Number(body.count ?? 0);
      const out: { id: number; sha256: string | null; error?: string }[] = [];
      for (let i = 0; i < count; i++) {
        const dl = await supabase.storage.from("guides").download(`sources/_lehrer_chunk_${i}.txt`);
        if (dl.error || !dl.data) { out.push({ id: i, sha256: null, error: dl.error?.message }); continue; }
        out.push({ id: i, sha256: await sha256Hex(await dl.data.text()) });
      }
      return json(200, { ok: true, chunks: out });
    }

    if (step === "assemble") {
      const count = Number(body.count ?? 0);
      let b64 = "";
      for (let i = 0; i < count; i++) {
        const dl = await supabase.storage.from("guides").download(`sources/_lehrer_chunk_${i}.txt`);
        if (dl.error || !dl.data) return json(500, { error: `Chunk ${i} fehlt: ${dl.error?.message}` });
        b64 += await dl.data.text();
      }
      const gz = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const bin = await gunzip(gz);
      const up = await supabase.storage.from("guides").upload(SRC, bin, {
        contentType: "text/markdown; charset=utf-8", upsert: true,
      });
      if (up.error) return json(500, { error: up.error.message });
      await supabase.storage.from("guides").remove(
        Array.from({ length: count }, (_, i) => `sources/_lehrer_chunk_${i}.txt`)
      );
      const md = new TextDecoder().decode(bin);
      const h1 = (md.match(/^# /gm) || []).length;
      return json(200, { ok: true, bytes: bin.length, chapters: h1, sha256: await sha256Hex(bin) });
    }

    if (step === "render") {
      const dl = await supabase.storage.from("guides").download(SRC);
      if (dl.error || !dl.data) return json(500, { error: "Manuskript fehlt: " + dl.error?.message });
      const md = await dl.data.text();
      const fonts: Record<string, Uint8Array> = {};
      for (const [k, f] of Object.entries(FONT_FILES)) {
        const r = await fetch(FONT_BASE + f);
        if (!r.ok) return json(502, { error: `Font ${f}: HTTP ${r.status}` });
        fonts[k] = new Uint8Array(await r.arrayBuffer());
      }
      const { bytes, pages } = await renderPdf(md, fonts);
      const up = await supabase.storage.from("guides").upload(PDF_OBJ, bytes, {
        contentType: "application/pdf", upsert: true,
      });
      if (up.error) return json(500, { error: up.error.message });
      return json(200, { ok: true, pages, kb: Math.round(bytes.length / 1024) });
    }

    if (step === "stripe") {
      const { data: key, error: keyErr } = await supabase.rpc("get_app_secret", { secret_name: "stripe_secret_key" });
      if (keyErr || !key) return json(500, { error: "Stripe key fehlt: " + keyErr?.message });
      const stripe = async (path: string, params?: URLSearchParams) => {
        const r = await fetch("https://api.stripe.com/v1/" + path, {
          method: params ? "POST" : "GET",
          headers: { Authorization: "Bearer " + key, ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {}) },
          body: params?.toString(),
        });
        const j = await r.json();
        if (!r.ok) throw new Error(path + ": " + (j.error?.message ?? r.status));
        return j;
      };
      // idempotent: Produkt über metadata.key suchen statt blind anlegen
      const found = await stripe("products/search?query=" + encodeURIComponent("metadata['key']:'lehrer-de'"));
      let product = found.data?.[0];
      if (!product) {
        const p = new URLSearchParams();
        p.append("name", "Der KI-Workflow für Lehrkräfte (DE)");
        p.append("description", "eBook (PDF, Deutsch): Unterrichtsmaterial automatisch erstellen — lehrplanbasiert, aktuell, für jedes Fach. 68 Seiten, 20 Kapitel, 30+ Vorlagen.");
        p.append("metadata[key]", "lehrer-de");
        product = await stripe("products", p);
      }
      const prices = await stripe("prices?product=" + product.id + "&active=true&limit=10");
      let price = (prices.data || []).find((x: { unit_amount: number; currency: string }) => x.unit_amount === 1900 && x.currency === "eur");
      if (!price) {
        const p = new URLSearchParams();
        p.append("product", product.id);
        p.append("unit_amount", "1900");
        p.append("currency", "eur");
        price = await stripe("prices", p);
      }
      let link = null;
      if (body.link) {
        const p = new URLSearchParams();
        p.append("line_items[0][price]", price.id);
        p.append("line_items[0][quantity]", "1");
        p.append("metadata[files]", "lehrer-de");
        p.append("after_completion[type]", "redirect");
        p.append("after_completion[redirect][url]", "https://aiwithmaris.com/danke?session_id={CHECKOUT_SESSION_ID}");
        p.append("invoice_creation[enabled]", "true");
        p.append("invoice_creation[invoice_data][footer]", FOOTER);
        p.append("custom_text[submit][message]", WAIVER);
        link = await stripe("payment_links", p);
      }
      return json(200, { ok: true, product: product.id, price: price.id, link: link?.url ?? null });
    }

    if (step === "docs") {
      const files = (body.files ?? []) as { url: string; path: string; name: string; mime: string }[];
      const results: unknown[] = [];
      for (const f of files) {
        const r = await fetch(f.url);
        if (!r.ok) { results.push({ path: f.path, error: "HTTP " + r.status }); continue; }
        const bytes = new Uint8Array(await r.arrayBuffer());
        const up = await supabase.storage.from("documents").upload(f.path, bytes, { contentType: f.mime, upsert: true });
        if (up.error) { results.push({ path: f.path, error: up.error.message }); continue; }
        await supabase.from("documents").delete().eq("file_path", f.path);
        const ins = await supabase.from("documents").insert({ name: f.name, mime: f.mime, size_bytes: bytes.length, file_path: f.path });
        results.push({ path: f.path, kb: Math.round(bytes.length / 1024), inserted: !ins.error, err: ins.error?.message });
      }
      return json(200, { ok: true, results });
    }

    return json(400, { error: "Unbekannter step" });
  } catch (err) {
    return json(500, { error: (err as Error).message });
  }
});
