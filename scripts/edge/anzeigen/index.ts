// /functions/v1/anzeigen — Kleinanzeigen-Werkstatt hinter /anzeigen.
//
// Zugriff: Sitzungstoken (x-anzeigen-token), das `op:'anmelden'` gegen dasselbe
// Gastpasswort ausgibt, das auch das Basic-Auth-Gate der Seite verlangt —
// oder eine eingeloggte Admin-Session als zweite Tuer.
//
// WICHTIG: Das Gate der Website schuetzt diese Function NICHT. Die Middleware
// liegt vor aiwithmaris.com/anzeigen; die Function steht offen im Netz und
// braucht ihre eigene Pruefung. Das Gate schuetzt die Seite, das Token die Daten.
//
// Der Objektpfad wird IMMER hier vergeben, nie vom Browser geschickt. Sonst
// waere eine signierte Upload-URL ein Schreibrecht auf einen frei waehlbaren
// Ort im Bucket.
import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://aiwithmaris.com",
  "https://www.aiwithmaris.com",
  "https://aiwithmaris.de",
  "https://www.aiwithmaris.de",
  "https://aiwithmaris.vercel.app",
  "http://localhost:8099",
];
const ADMIN_EMAILS = ["marisnicolasreinold@googlemail.com", "marisnicolasreinold@gmail.com"];
const BUCKET = "anzeigen";
const BEREICH = "anzeigen";
const TOKEN_LAENGE = 48;
const SITZUNG_TAGE = 180;
const MAX_FOTOS = 50;

// Rohe Postgres-Meldungen sind fuer den Bildschirm unbrauchbar. Die Grenzen,
// die tatsaechlich jemand reisst, bekommen einen lesbaren Satz.
function lesbar(meldung: string): string {
  if (meldung.includes("anzeigen_titel_check")) return "Der Titel ist länger als 65 Zeichen — so viel nimmt Kleinanzeigen nicht.";
  if (meldung.includes("anzeigen_beschreibung_check")) return "Die Beschreibung ist länger als 3.500 Zeichen.";
  if (meldung.includes("anzeigen_preistyp_check")) return "Unbekannter Preistyp.";
  if (meldung.includes("anzeigen_zustand_check")) return "Unbekannter Zustand.";
  if (meldung.includes("anzeigen_versand_check")) return "Unbekannte Versandart.";
  if (meldung.includes("anzeigen_status_check")) return "Unbekannter Status.";
  if (meldung.includes("anzeigen_preis_cent_check")) return "Der Preis darf nicht negativ sein.";
  return "Speichern fehlgeschlagen.";
}

const FELDER = [
  "titel", "beschreibung", "preis_cent", "preistyp", "kategorie", "zustand",
  "versand", "versandkosten_cent", "plz", "ort", "status", "kleinanzeigen_url",
  "eingestellt_am", "verkauft_am", "verkauft_preis_cent", "notiz",
];

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin") ?? "";
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  const cors = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    // `apikey` MUSS hier stehen. Der Browser schickt ihn bei jedem Aufruf mit
    // (anzeigen.html setzt ihn in `ruf()`), und was die Vorabfrage nicht
    // erlaubt, laesst der Browser gar nicht erst raus — die eigentliche
    // POST-Anfrage kommt dann nie an. Genau das ist passiert: im Log standen
    // nur `OPTIONS 204` und kein einziges POST, waehrend die Seite "Passwort
    // stimmt nicht" zeigte. Aus der Datenbank per pg_net faellt das nicht auf,
    // weil es serverseitig gar kein CORS gibt.
    // `x-client-info` setzt supabase-js von sich aus.
    "Access-Control-Allow-Headers":
      "content-type, apikey, authorization, x-anzeigen-token, x-client-info",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: cors });

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json(405, { error: "Nur POST" });

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Drosselung, gemeinsamer Topf mit den anderen Admin-Funktionen.
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const ipHash = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip))),
  ).slice(0, 8).map((b) => b.toString(16).padStart(2, "0")).join("");
  const stunde = new Date().toISOString().slice(0, 13);
  const tor = await db.rpc("chat_hit", {
    bucket_key: `anzeigen:${ipHash}:${stunde}`, max_count: 600, ttl_seconds: 3700,
  });
  if (tor.error) return json(500, { error: "Nicht verfügbar" });
  if (tor.data !== true) return json(429, { error: "Zu viele Anfragen" });

  let koerper: Record<string, unknown> = {};
  try { koerper = await req.json(); } catch { return json(400, { error: "Kein JSON" }); }
  const op = String(koerper.op ?? "");

  /* ------------------------------------------------------------ Anmelden */

  if (op === "anmelden") {
    const passwort = String(koerper.passwort ?? "");
    const wer = String(koerper.wer ?? "").slice(0, 40);
    if (!passwort) return json(400, { error: "Passwort fehlt" });

    const pruef = await db.rpc("check_site_guest", { u: BEREICH, p: passwort, a: BEREICH });
    // Kein Hinweis darauf, was falsch war.
    if (pruef.error || pruef.data !== true) return json(401, { error: "Passwort stimmt nicht" });

    const roh = new Uint8Array(24);
    crypto.getRandomValues(roh);
    const token = Array.from(roh).map((b) => b.toString(16).padStart(2, "0")).join("");

    const ins = await db.from("anzeigen_sitzung").insert({ token, wer }).select().single();
    if (ins.error) return json(500, { error: "Anmeldung fehlgeschlagen" });

    // Lange unbenutzte Sitzungen sammeln sich sonst an.
    const alt = new Date(Date.now() - SITZUNG_TAGE * 86400_000).toISOString();
    await db.from("anzeigen_sitzung").delete().lt("letzte", alt);

    return json(200, { token, wer });
  }

  /* --------------------------------------------------------------- Zugang */

  let wer = "";
  let erlaubt = false;

  const token = req.headers.get("x-anzeigen-token") ?? "";
  if (token.length === TOKEN_LAENGE) {
    const s = await db.from("anzeigen_sitzung").select("wer").eq("token", token).maybeSingle();
    if (s.data) {
      erlaubt = true;
      wer = s.data.wer ?? "";
      await db.from("anzeigen_sitzung").update({ letzte: new Date().toISOString() }).eq("token", token);
    }
  }

  if (!erlaubt) {
    const bearer = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (bearer) {
      const { data: u } = await db.auth.getUser(bearer);
      const mail = (u?.user?.email ?? "").toLowerCase();
      if (ADMIN_EMAILS.includes(mail)) { erlaubt = true; wer = "Maris"; }
    }
  }

  if (!erlaubt) return json(401, { error: "Nicht angemeldet" });

  /* ------------------------------------------------------------- Helfer */

  const signiere = async (pfad: string, sekunden = 300) => {
    const { data } = await db.storage.from(BUCKET).createSignedUrl(pfad, sekunden);
    return data?.signedUrl ?? null;
  };

  const holeAnzeige = async (id: string) => {
    const a = await db.from("anzeigen").select("*").eq("id", id).maybeSingle();
    if (!a.data) return null;
    const f = await db.from("anzeigen_fotos").select("*").eq("anzeige_id", id)
      .order("pos", { ascending: true }).order("lfd", { ascending: true });
    return { anzeige: a.data, fotos: f.data ?? [] };
  };

  // anzeige.json liegt im Ordner, damit die Ablage auch ausserhalb der App
  // erklaert, was sie enthaelt — der Ordnername friert beim Anlegen ein, der
  // Titel darin ist immer der aktuelle.
  const schreibeBegleitzettel = async (id: string) => {
    const daten = await holeAnzeige(id);
    if (!daten) return;
    const inhalt = new TextEncoder().encode(JSON.stringify({
      ...daten.anzeige,
      fotos: daten.fotos.map((f: Record<string, unknown>) => ({ pfad: f.pfad, pos: f.pos, lfd: f.lfd })),
      hinweis: "Erzeugt von aiwithmaris.com/anzeigen. Die Datenbank ist die Wahrheit.",
    }, null, 2));
    const { error } = await db.storage.from(BUCKET).upload(
      `${daten.anzeige.ordner}/anzeige.json`, inhalt,
      { contentType: "application/json", upsert: true },
    );
    // Nicht verschlucken: Genau hier lag der Fehler, dass die MIME-Whitelist
    // des Buckets application/json abwies und der Ordner still leer blieb.
    // Der Begleitzettel ist Beiwerk, sein Ausfall darf die Anzeige nicht
    // kippen — aber er muss im Log stehen.
    if (error) console.error("[anzeigen] anzeige.json:", error.message);
  };

  /* ----------------------------------------------------------------- Ops */

  if (op === "liste") {
    const { data, error } = await db.from("anzeigen").select("*").order("nummer", { ascending: false }).limit(500);
    if (error) return json(500, { error: "Datenbankfehler" });

    const ids = (data ?? []).map((a) => a.id);
    const fotos = ids.length
      ? (await db.from("anzeigen_fotos").select("anzeige_id,pfad,pos,lfd").in("anzeige_id", ids)
          .order("pos", { ascending: true }).order("lfd", { ascending: true })).data ?? []
      : [];

    const liste = await Promise.all((data ?? []).map(async (a) => {
      const meine = fotos.filter((f) => f.anzeige_id === a.id);
      return {
        ...a,
        anzahl_fotos: meine.length,
        titelbild: meine.length ? await signiere(meine[0].pfad) : null,
      };
    }));
    return json(200, { anzeigen: liste, wer });
  }

  if (op === "vorgabe") {
    const { data } = await db.from("anzeigen_vorgabe").select("*").eq("id", "ich").maybeSingle();
    return json(200, { vorgabe: data ?? {} });
  }

  if (op === "vorgabe_speichern") {
    const felder: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const k of ["plz", "ort", "versand", "preistyp", "zustand", "beschreibung_baustein", "kategorien"]) {
      if (k in koerper) felder[k] = koerper[k];
    }
    const { data, error } = await db.from("anzeigen_vorgabe").update(felder).eq("id", "ich").select().single();
    if (error) return json(500, { error: "Speichern fehlgeschlagen" });
    return json(200, { vorgabe: data });
  }

  if (op === "neu") {
    const titel = String(koerper.titel ?? "").trim().slice(0, 65);
    const v = (await db.from("anzeigen_vorgabe").select("*").eq("id", "ich").maybeSingle()).data;
    const { data, error } = await db.from("anzeigen").insert({
      titel,
      erstellt_von: wer || null,
      plz: v?.plz ?? null,
      ort: v?.ort ?? null,
      versand: v?.versand ?? "abholung",
      preistyp: v?.preistyp ?? "vb",
      zustand: v?.zustand ?? null,
      beschreibung: v?.beschreibung_baustein ?? "",
    }).select().single();
    if (error) return json(500, { error: "Anlegen fehlgeschlagen: " + error.message });
    await schreibeBegleitzettel(data.id);
    return json(200, { anzeige: data });
  }

  const id = String(koerper.id ?? "");
  if (!id) return json(400, { error: "id fehlt" });

  if (op === "holen") {
    const daten = await holeAnzeige(id);
    if (!daten) return json(404, { error: "Nicht gefunden" });
    const fotos = await Promise.all(daten.fotos.map(async (f: Record<string, unknown>) => ({
      ...f, url: await signiere(String(f.pfad)),
    })));
    return json(200, { anzeige: daten.anzeige, fotos, wer });
  }

  if (op === "speichern") {
    const felder: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const k of FELDER) if (k in koerper) felder[k] = koerper[k];
    const { data, error } = await db.from("anzeigen").update(felder).eq("id", id).select().single();
    if (error) {
      console.error("[anzeigen] speichern:", error.message);
      return json(400, { error: lesbar(error.message) });
    }
    await schreibeBegleitzettel(id);
    return json(200, { anzeige: data });
  }

  if (op === "loeschen") {
    const a = (await db.from("anzeigen").select("ordner").eq("id", id).maybeSingle()).data;
    if (a?.ordner) {
      const { data: objekte } = await db.storage.from(BUCKET).list(a.ordner, { limit: 200 });
      const pfade = (objekte ?? []).map((o) => `${a.ordner}/${o.name}`);
      if (pfade.length) await db.storage.from(BUCKET).remove(pfade);
    }
    const { error } = await db.from("anzeigen").delete().eq("id", id);
    if (error) return json(500, { error: "Löschen fehlgeschlagen" });
    return json(200, { ok: true });
  }

  if (op === "upload_urls") {
    const a = (await db.from("anzeigen").select("ordner").eq("id", id).maybeSingle()).data;
    if (!a) return json(404, { error: "Nicht gefunden" });

    const dateien = Array.isArray(koerper.dateien) ? koerper.dateien : [];
    if (!dateien.length) return json(400, { error: "Keine Dateien" });

    const vorhanden = (await db.from("anzeigen_fotos").select("lfd,pos").eq("anzeige_id", id)).data ?? [];
    if (vorhanden.length + dateien.length > MAX_FOTOS) {
      return json(400, { error: `Höchstens ${MAX_FOTOS} Fotos je Anzeige` });
    }
    let lfd = vorhanden.reduce((m, f) => Math.max(m, f.lfd), 0);
    let pos = vorhanden.reduce((m, f) => Math.max(m, f.pos), -1);

    const ziele = [];
    for (const _ of dateien) {
      lfd++; pos++;
      const kurz = crypto.randomUUID().slice(0, 6);
      const pfad = `${a.ordner}/${String(lfd).padStart(2, "0")}-${kurz}.jpg`;
      const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(pfad);
      if (error || !data) return json(500, { error: "Upload-URL fehlgeschlagen" });
      ziele.push({ pfad, token: data.token, signedUrl: data.signedUrl, lfd, pos });
    }
    return json(200, { ziele });
  }

  // Die Zeile entsteht erst NACH dem erfolgreichen Upload. Ein Abbruch
  // hinterlaesst darum hoechstens ein Objekt ohne Zeile — dafuer `aufraeumen`.
  if (op === "foto_fertig") {
    const { data, error } = await db.from("anzeigen_fotos").insert({
      anzeige_id: id,
      pfad: String(koerper.pfad ?? ""),
      lfd: Number(koerper.lfd ?? 1),
      pos: Number(koerper.pos ?? 0),
      mime: String(koerper.mime ?? "image/jpeg").slice(0, 60),
      bytes: Number(koerper.bytes ?? 0),
      breite: koerper.breite ? Number(koerper.breite) : null,
      hoehe: koerper.hoehe ? Number(koerper.hoehe) : null,
    }).select().single();
    if (error) return json(500, { error: error.message });
    await schreibeBegleitzettel(id);
    return json(200, { foto: { ...data, url: await signiere(data.pfad) } });
  }

  if (op === "fotos_ordnen") {
    const ids = Array.isArray(koerper.ids) ? koerper.ids.map(String) : [];
    if (!ids.length) return json(400, { error: "Keine Reihenfolge" });
    // Eine Zeile je Foto — bei hoechstens 50 Fotos ist das billiger als eine
    // eigene Datenbankfunktion, und es bleibt hier lesbar.
    for (let i = 0; i < ids.length; i++) {
      await db.from("anzeigen_fotos").update({ pos: i }).eq("id", ids[i]).eq("anzeige_id", id);
    }
    await schreibeBegleitzettel(id);
    return json(200, { ok: true });
  }

  if (op === "foto_weg") {
    const fotoId = String(koerper.foto_id ?? "");
    const f = (await db.from("anzeigen_fotos").select("pfad").eq("id", fotoId).eq("anzeige_id", id).maybeSingle()).data;
    if (!f) return json(404, { error: "Foto nicht gefunden" });
    await db.storage.from(BUCKET).remove([f.pfad]);
    await db.from("anzeigen_fotos").delete().eq("id", fotoId);
    await schreibeBegleitzettel(id);
    return json(200, { ok: true });
  }

  if (op === "aufraeumen") {
    const a = (await db.from("anzeigen").select("ordner").eq("id", id).maybeSingle()).data;
    if (!a) return json(404, { error: "Nicht gefunden" });
    const { data: objekte } = await db.storage.from(BUCKET).list(a.ordner, { limit: 200 });
    const bekannt = new Set(((await db.from("anzeigen_fotos").select("pfad").eq("anzeige_id", id)).data ?? [])
      .map((f) => f.pfad));
    const verwaist = (objekte ?? [])
      .map((o) => `${a.ordner}/${o.name}`)
      .filter((p) => !bekannt.has(p) && !p.endsWith("/anzeige.json"));
    if (verwaist.length) await db.storage.from(BUCKET).remove(verwaist);
    return json(200, { entfernt: verwaist.length });
  }

  if (op === "export") {
    const daten = await holeAnzeige(id);
    if (!daten) return json(404, { error: "Nicht gefunden" });
    return json(200, {
      anzeige: daten.anzeige,
      fotos: daten.fotos.map((f: Record<string, unknown>) => ({ pfad: f.pfad, pos: f.pos, lfd: f.lfd })),
    });
  }

  return json(400, { error: "Unbekannte Operation" });
});
