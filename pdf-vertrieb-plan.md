# PDF-Vertrieb — wo wir die eBooks zusätzlich veröffentlichen

> **Stand: geplant (12.06.2026).** Eigener Shop läuft (Stripe, ~97 % Marge).
> Ziel der Zusatzkanäle: **Reichweite und Auffindbarkeit**, nicht Marge —
> verkauft wird am liebsten weiter über /guide. Reihenfolge = Priorität.

## Ausgangslage

| Kanal | Marge | Status |
|---|---|---|
| Eigener Shop (aiwithmaris.com/guide) | ~97 % (nur Stripe-Gebühr) | ✅ live, 8 Produkte DE/EN |

Produkte: Hauptguide (19/29 €), Werkzeugkasten (8/12 €), DSGVO & KI (19/29 €),
Make or Buy (19/29 €), KI-Bibliothek (59 €). Quell-Manuskripte liegen als
Markdown vor, Render-Pipeline (`scripts/og/render-ebook.mjs`) existiert —
andere Formate (EPUB) sind also machbar.

## Kanal 1 — Digistore24 (höchste Priorität, ~1 Tag)

**Warum zuerst:** Deutscher Marktführer für Infoprodukte, exakt unsere
Zielgruppe (Mittelstand). Wirkt als **Reseller** — übernimmt Zahlungsabwicklung,
Rechnungen **und Umsatzsteuer** (kein Mehraufwand für dich). Größter Hebel:
das **Affiliate-Netzwerk** — andere bewerben deine Guides gegen Provision.

- Gebühr: 7,9 % + 1 € pro Verkauf — bei 29 € bleiben ~25,70 €.
- [ ] Account anlegen (Maris), Produkte mit bestehenden PDFs einstellen
- [ ] Affiliate-Provision festlegen (Empfehlung: 30–40 %, Infoprodukt-üblich)
- [ ] Verkaufsseite = bestehende /guide-Texte wiederverwenden
- [ ] Lieferung: PDF-Upload direkt bei Digistore24 (eigene Kopie je Kanal,
      damit der eigene Shop-Download geschützt bleibt)

## Kanal 2 — Amazon KDP (Reichweite, ~1–2 Tage)

**Warum:** Größte Buch-Suchmaschine; „KI für den Mittelstand" wird dort
gesucht. **Aber zwei Haken:**
1. KDP nimmt kein PDF — wir müssen **EPUB** rendern (Erweiterung der
   bestehenden Render-Pipeline, machbar).
2. 70 % Tantieme gibt es nur im Preisband **2,99–9,99 €** — darüber nur 35 %.
   Bei 19 € blieben ~6,65 €. **Strategie:** Kindle-Ausgabe günstiger
   positionieren (z. B. 9,99 €) als „Einstiegsversion" — im Buch klar auf
   die Vollversion mit Vorlagen-Paket im eigenen Shop verweisen
   (Vorlagen/Checklisten als Download-Link auf aiwithmaris.com = Lead-Kanal).
- [x] EPUB-Export gebaut (12.06.2026): `scripts/og/render-epub.mjs` + Edge
      Function `export-epub` — die 6 Vertiefungs-EPUBs (DE/EN) liegen fertig
      im Dokumente-Tab des Cockpits. **Achtung:** Vom Hauptguide existiert
      kein Quell-Manuskript im Storage (nur das fertige PDF) — für die
      Kindle-Ausgabe des Hauptguides muss das Manuskript erst wieder
      hochgeladen oder rekonstruiert werden.
- [ ] KDP-Konto (Maris: Steuerinterview, Bankverbindung)
- [ ] Hauptguide DE + EN als Test, danach die Vertiefungen
- [ ] **Kein** KDP Select (verlangt Exklusivität — kollidiert mit eigenem Shop)

## Kanal 3 — Gumroad (englischer Markt, ~½ Tag)

**Warum:** International Standard für Indie-Digitalprodukte, englischsprachige
Käufer, einfache Einrichtung. 10 % + 0,30 $ Gebühr.
- [ ] EN-Ausgaben (Guide, Library) einstellen, Preise in USD
- [ ] Profil verlinkt auf aiwithmaris.com (EN-Version)

## Flankierend (kostenlos, läuft nebenbei)

- **Lead-Magnet:** 1 Kapitel des Hauptguides als Gratis-PDF gegen
  Newsletter-Anmeldung (Infrastruktur existiert: Brevo + Download-Function).
- **LinkedIn:** Carousel-Posts aus Guide-Kapiteln (Instagram-Generator
  `scripts/og/generate-ig-post.mjs` liefert die Grafiken schon).
- **Blog-SEO:** läuft bereits täglich — Guide-CTAs sind eingebaut.

## Bewusst NICHT (vorerst)

- **Apple Books / Google Play / Tolino** (via Aggregator wie XinXii/BoD):
  geringe Nachfrage für B2B-Ratgeber, Aufwand > Nutzen. Später prüfen.
- **Etsy:** falsche Zielgruppe für B2B-KI-Guides.
- **Udemy & Co.:** wäre ein anderes Produkt (Videokurs) — eigene Überlegung wert,
  aber kein PDF-Kanal.

## Womit anfangen

**Digistore24** — gleiche Sprache, gleiche Zielgruppe, null Steuer-Mehraufwand,
Affiliates als Wachstumshebel, PDFs können unverändert verwendet werden.
Du brauchst dafür nur den Account; Produkttexte und Dateien liegen alle vor.
