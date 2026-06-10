# Automatischer Tagesblog — so funktioniert er

Jeden Morgen (06:30 Sommerzeit / 05:30 Winterzeit) veröffentlicht GitHub
Actions automatisch einen neuen Artikel auf Deutsch und Englisch. Vercel
deployt den Commit, der Artikel ist sofort live. Du musst nichts tun.

## Einmalige Einrichtung (ein Handgriff)

1. Anthropic-API-Key besorgen: https://platform.claude.com → API Keys
2. In GitHub hinterlegen: Repo → **Settings → Secrets and variables →
   Actions → New repository secret** → Name `ANTHROPIC_API_KEY`,
   Wert = der Key.

Fertig. Der erste Artikel erscheint am nächsten Morgen — oder sofort per
**Actions → „Täglicher Blog-Artikel" → Run workflow**.

## Ablauf pro Tag

1. **Thema:** Mo/Mi/Do/Sa/So nimmt das Skript das oberste offene Thema aus
   `topics.md`. Di + Fr sucht es per Websuche eine aktuelle KI-Nachricht
   und schreibt eine Einordnung dazu. Leere Themenliste füllt sich selbst.
2. **Schreiben:** Claude (Opus) schreibt den Artikel in DE + EN — streng
   nach dem Stilprofil in `styleguide.md`.
3. **Lektorat:** Ein zweiter KI-Durchlauf prüft Stiltreue, Faktentreue und
   HTML. Bei Beanstandung wird einmal überarbeitet.
4. **Veröffentlichen:** Artikelseiten, Blog-Übersicht (DE/EN), RSS-Feeds
   und Sitemap werden aktualisiert und auf `main` gepusht → Vercel deployt.
5. **Absicherung:** Schlägt der Lauf fehl, legt der Workflow automatisch
   ein GitHub-Issue an, damit es nicht unbemerkt bleibt.

## Stellschrauben

| Was du ändern willst | Wo |
| --- | --- |
| Schreibstil | `blog/styleguide.md` — wirkt ab dem nächsten Artikel |
| Themen | `blog/topics.md` — oberstes offenes Thema kommt als Nächstes |
| News-Tage / Uhrzeit | `.github/workflows/daily-blog.yml` (Cron) bzw. `scripts/generate-blog-post.mjs` (Wochentage) |
| Artikel löschen | `blog/<slug>.html` + `blog/en/<slug>.html` löschen und den Eintrag aus `blog/posts.json` entfernen, dann committen (Index/Feed werden beim nächsten Lauf neu erzeugt) |

## Kosten

Ein Artikel/Tag mit Claude Opus: grob 5–15 Cent pro Tag, je nach Länge und
News-Recherche — also wenige Euro im Monat.
