# Blog — so funktioniert er (ohne API-Key)

An jedem Werktag (Montag bis Freitag, 06:30 Sommerzeit / 05:30 Winterzeit)
veröffentlicht GitHub Actions automatisch den nächsten vorbereiteten Artikel
aus der Warteschlange `blog/queue/` — auf Deutsch und Englisch. Am Wochenende
erscheint nichts. Vercel deployt den Commit, der Artikel ist sofort live.
**Es wird kein Anthropic-API-Key benötigt.**

## Der Wochenrhythmus

1. **Erinnerung:** Ist die Warteschlange fast leer, legt der Workflow
   automatisch ein GitHub-Issue an („Blog-Nachschub: Zeit für 5 neue
   Artikel") — davon bekommst du eine E-Mail.
2. **Schreiben im Chat:** Neuen Claude-Code-Chat für dieses Repo öffnen und
   sagen: **„Neue Blog-Runde — schreib mir 5 Artikel-Vorschläge."**
   Claude schreibt 5 Entwürfe im Maris-Stil (nach `styleguide.md`, Themen
   aus `topics.md`).
3. **Freigeben:** Du liest die Entwürfe im Chat, wünschst Änderungen oder
   gibst frei.
4. **Einreihen:** Claude legt die freigegebenen Artikel als JSON-Dateien in
   `blog/queue/` ab und pusht. Ab dann erscheint automatisch jeden Morgen
   einer davon — eine Woche Tagesrhythmus aus einer Freigabe-Runde.

## Format der Queue-Dateien

`blog/queue/2026-06-11-mein-slug.json` (Dateiname bestimmt die Reihenfolge,
älteste zuerst):

```json
{
  "slug": "mein-slug",
  "topic": "Exakter Wortlaut des Themas aus topics.md (optional, wird abgehakt)",
  "de": { "title": "…", "teaser": "max. 160 Zeichen", "html": "<p>…</p>" },
  "en": { "title": "…", "teaser": "max. 160 characters", "html": "<p>…</p>" }
}
```

Erlaubte HTML-Tags im Artikeltext: `<p> <h2> <h3> <ul> <ol> <li> <strong> <em> <a>`.

## Stellschrauben

| Was du ändern willst | Wo |
| --- | --- |
| Schreibstil | `blog/styleguide.md` — Grundlage jeder Chat-Runde |
| Themen | `blog/topics.md` — oberste offene Themen kommen zuerst dran |
| Reihenfolge der Queue | Dateinamen in `blog/queue/` (alphabetisch = Reihenfolge) |
| Uhrzeit | Cron in `.github/workflows/daily-blog.yml` |
| Artikel löschen | `blog/<slug>.html` + `blog/en/<slug>.html` löschen und Eintrag aus `blog/posts.json` entfernen, committen |

## Optional: vollautomatischer KI-Modus

Der Generator kann Artikel auch selbst schreiben (Claude API). Dafür das
Repo-Secret `ANTHROPIC_API_KEY` hinterlegen und den Workflow manuell mit
`mode=evergreen` oder `mode=news` starten (Actions → Run workflow). Der
tägliche Zeitplan nutzt das nicht — er bedient nur die Warteschlange.
