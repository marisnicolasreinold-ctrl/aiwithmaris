# Launch-Runbook: „Der KI-Workflow für Lehrkräfte" (Produkt-Key `lehrer-de`)

Stand 12.06.2026. Website-Seite (guide.html, danke.html, i18n.js, Blog-Post,
Cover, Produkttexte) ist auf dem Branch fertig. Dieses Runbook enthält die
**Produktions-Schritte**, die bewusst eine Freigabe von Maris brauchen
(Live-Stripe + Supabase-Deploys). Reihenfolge einhalten — die Website darf erst
auf main, wenn Schritt 1–4 erledigt sind, sonst läuft der Kauf-Button ins Leere.

Das Manuskript liegt NICHT im Repo (öffentliches Repo!) — es wurde als Datei in
den Chat geliefert (`lehrer-ki-workflow-de.md`) und gehört nach
`guides/sources/lehrer-ki-workflow-de.md` (privater Bucket).

## 1. Temporäre Setup-Function deployen

Quelle: `scripts/edge/admin-setup-lehrer/` (index.ts + render.ts).
Vorher in index.ts `SETUP_KEY` durch frischen Zufallswert ersetzen
(`openssl rand -hex 24`). Deploy mit `verify_jwt: false` (Auth über den Key,
wie bei den anderen Admin-Functions über eigene Schlüssel).

## 2. Manuskript + PDF einspielen (ohne lokalen Netzzugang: per pg_net)

Das Manuskript in 5 Teile schneiden und je Teil:

```sql
select net.http_post(
  url := 'https://amrdmnnijbfwtrjcpocl.supabase.co/functions/v1/admin-setup-lehrer',
  body := jsonb_build_object('step','chunk','id',1,'content', $MD$ ...Teil 1... $MD$),
  headers := '{"Content-Type":"application/json","x-setup-key":"<KEY>"}'::jsonb,
  timeout_milliseconds := 60000
);
-- Antwort: select status_code, content from net._http_response where id = <request_id>;
```

Dann `{"step":"assemble","count":5}` (erwartet: bytes ≈ 106000, chapters = 21)
und `{"step":"render"}` (erwartet: pages = 68). Referenzwerte aus dem lokalen
Build: PDF 245 KB / 68 Seiten.

## 3. Stripe-Live-Produkt anlegen

`{"step":"stripe","link":true}` → legt idempotent an (Suche über
metadata.key=lehrer-de): Produkt „Der KI-Workflow für Lehrkräfte (DE)",
Preis 19 € (price_…), Payment Link mit metadata[files]=lehrer-de,
§19-Rechnungsfooter und Widerrufsverzicht-Text. **price-ID notieren.**

## 4. checkout- und download-Function erweitern

checkout (PRODUCTS-Map, Live-Price-ID direkt wie bei den anderen eBooks):

```ts
"lehrer-de": { price: "<price_… aus Schritt 3>", files: "lehrer-de" },
```

download (FILES-Map):

```ts
"lehrer-de": { object: "lehrer-ki-workflow-de.pdf", name: "KI-Workflow-fuer-Lehrkraefte-DE.pdf" },
```

Beide redeployen (verify_jwt false, wie bisher). Smoke-Test per pg_net:
POST auf /functions/v1/checkout mit `{"product":"lehrer-de","lang":"de"}`
→ muss `{ url: "https://checkout.stripe.com/…" }` liefern.

## 5. EPUB für KDP bauen

export-epub-Function: BOOKS-Map ergänzen und redeployen:

```ts
"lehrer-ki-workflow-de": "sources/lehrer-ki-workflow-de.md",
```

Dann POST export-epub `{"slug":"lehrer-ki-workflow-de"}` (Auth: x-report-key
oder Login-JWT) → EPUB erscheint im Dokumente-Tab (`epub/lehrer-ki-workflow-de.epub`).

## 6. Cover + Produkttexte in den Dokumente-Tab (optional)

Nach dem Merge auf main liegt das Cover öffentlich im Repo:

```json
{"step":"docs","files":[{
  "url":"https://raw.githubusercontent.com/marisnicolasreinold-ctrl/aiwithmaris/main/marketing/kdp/cover-lehrer-ki-workflow-de.jpg",
  "path":"covers/cover-lehrer-ki-workflow-de.jpg",
  "name":"KDP-Cover · Der KI-Workflow für Lehrkräfte (DE)",
  "mime":"image/jpeg"}]}
```

## 7. Aufräumen + Livegang

- admin-setup-lehrer durch 410-Stub ersetzen (wie import-ebooks):
  `Deno.serve(() => new Response(JSON.stringify({ error: "gone" }), { status: 410 }));`
- Branch `claude/teacher-workflow-ebook-de-p90dcd` auf main mergen → Website live.
- Manuell (nur Maris): Digistore24-Produkt anlegen (Texte:
  `marketing/lehrer-listing.md`), KDP-Upload (EPUB aus Dokumente-Tab + Cover,
  9,99 €), Testkauf 19 € über /guide und wieder erstatten.

## Offene Folge-Aufgaben

- Englische Ausgabe (`lehrer-en`) + Bundle (`lehrer`), dann Edition-Picker im
  Banner nachrüsten (Muster: ed-main).
- Entscheiden: kommt der Titel in die KI-Bibliothek (dann Preis/Texte anpassen)
  oder bleibt er eigenständig? Aktuell: eigenständig.
