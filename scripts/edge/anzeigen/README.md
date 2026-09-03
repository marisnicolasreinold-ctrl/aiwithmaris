# Anzeigen-Werkstatt (`/anzeigen`)

Vorbereitung von Kleinanzeigen-Inseraten: Fotos hochladen, Angaben erfassen,
Produkt für Produkt in Supabase ablegen, und am Ende alles zum Kopieren
nebeneinander haben.

## Teile

| Wo | Was |
| --- | --- |
| `anzeigen.html` (Wurzel) | die Seite, erreichbar als `/anzeigen` (cleanUrls) |
| `middleware.js` | vier Stellen: `matcher`, `GATED`, `areaOf()`, `GAST` |
| `scripts/edge/anzeigen/index.ts` | Edge Function `anzeigen`, `verify_jwt: false` |
| Bucket `anzeigen` | privat, 15 MB je Datei, nur Bildformate + `application/json` |
| `public.anzeigen`, `public.anzeigen_fotos`, `public.anzeigen_vorgabe`, `public.anzeigen_sitzung` | RLS an, **keine** Policies |

## Warum es so gebaut ist

**Tabellen in `public` mit RLS und ohne Policy.** Ohne Policy liefert RLS null
Zeilen an `anon` und `authenticated`; der `service_role`-Key der Edge Function
umgeht RLS. Das ist derselbe Weg wie bei `public.documents`. Das Schema
`private` wäre hier falsch: PostgREST liefert es nicht aus, auch nicht dem
`service_role`-Key, mit dem die Function arbeitet.

**Das Gate schützt die Function nicht.** Die Vercel-Middleware liegt vor
`aiwithmaris.com/anzeigen`. Die Function steht unter
`…supabase.co/functions/v1/anzeigen` offen im Netz und braucht ihre eigene
Prüfung. Das Gate schützt die Seite, das Token die Daten.

**Der Objektpfad wird immer serverseitig vergeben.** Käme er aus dem Browser,
wäre eine signierte Upload-URL ein Schreibrecht auf einen frei wählbaren Ort im
Bucket.

**Direkt-Upload statt base64 durch die Function.** Der Hausbrauch (`docs`)
schickt Dateien als base64 durch die Function. Für Handyfotos ist das das
falsche Lastprofil: 3–12 MB je Bild, base64 bläht um ein Drittel, und alles
läuft durch die Function statt daran vorbei. Stattdessen verkleinert der
Browser auf 2000 px und lädt über eine signierte URL direkt in den Bucket.
Die serverseitige Bremse dafür sind `file_size_limit` und
`allowed_mime_types` am Bucket.

**Der Ordnername friert beim Anlegen ein.** Storage ist nicht transaktional;
ein Rename bei jeder Titeländerung müsste N Objekte verschieben und N Zeilen
nachziehen — bricht das ab, ist die Anzeige halb kaputt. Der aktuelle Titel
steht in `anzeige.json` im Ordner, und der Foto-Download benennt ohnehin frisch.

**`pos` und `lfd` sind getrennt.** `pos` ist die Anzeigereihenfolge (0 =
Titelbild) und ändert sich beim Umsortieren; `lfd` steckt im Dateinamen und
ändert sich nie. Sonst müsste jede Umsortierung Dateien umbenennen.

**Die Zeichengrenzen stehen als CHECK in der Datenbank**, nicht nur als Zähler
in der Oberfläche: Was Kleinanzeigen später ablehnen würde, soll gar nicht
erst speicherbar sein.

## Zwei Fristen, die aus Fehlern stammen

Beides wurde beim Testen gefunden, nicht vorher gedacht:

1. **`createImageBitmap` kann hängen statt zu werfen.** Ohne Frist bliebe die
   ganze Warteschlange bei „verkleinern …" stehen. Jetzt: 15 s, danach wird die
   Datei unverändert hochgeladen.
2. **Die MIME-Whitelist des Buckets wies `application/json` ab**, wodurch
   `anzeige.json` nie geschrieben wurde — und die Function schluckte den
   Fehler. Jetzt ist JSON erlaubt und ein Fehlschlag landet im Log.

## Operationen

`anmelden`, `liste`, `vorgabe`, `vorgabe_speichern`, `neu`, `holen`,
`speichern`, `loeschen`, `upload_urls`, `foto_fertig`, `fotos_ordnen`,
`foto_weg`, `aufraeumen`, `export`.

`aufraeumen` gibt es, weil die Fotozeile erst **nach** dem erfolgreichen Upload
entsteht: Ein abgebrochener Upload hinterlässt höchstens ein Objekt ohne Zeile.

## Prüfen ohne Browser

Wie im Runbook nebenan, per `pg_net` aus SQL:

```sql
select net.http_post(
  url := 'https://amrdmnnijbfwtrjcpocl.supabase.co/functions/v1/anzeigen',
  body := jsonb_build_object('op','anmelden','passwort','<Passwort>','wer','Maris'),
  headers := '{"Content-Type":"application/json"}'::jsonb);
-- Antwort: select status_code, content from net._http_response where id = <id>;
```

## Grenzen von Kleinanzeigen

Titel 65 Zeichen, Beschreibung 3.500 Zeichen, Bilder jpg/png/gif/heic bis 12 MB,
mindestens eins. Die **maximale Bildanzahl ist nicht belegt** — die Hilfeseite
war nicht erreichbar, eine ältere Quelle nennt 12. Die Seite weist ab 12 auf
die Unsicherheit hin und sperrt bei 50.

## Automatisierung

Die Nutzungsbedingungen von Kleinanzeigen verbieten Crawler, Scraper und andere
automatisierte Mechanismen ohne ausdrückliche Erlaubnis; die Folge sind IP- und
Kontosperren. Hier wird deshalb **nichts** automatisiert eingestellt. Das
Datenmodell hält aber alles einzeln vor (`export` liefert es maschinenlesbar),
und `kleinanzeigen_url`, `eingestellt_am`, `verkauft_am` und
`verkauft_preis_cent` erlauben es, eine bestehende Anzeige nachzuverfolgen.
