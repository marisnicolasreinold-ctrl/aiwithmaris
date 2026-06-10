# Vertrieb & Bewerbung — KI-Guide „Anfangen, wo es zählt"

Stand: 2026-06-10 · Dieser Ordner wird NICHT deployt (.vercelignore).

## ⚠️ Bevor echtes Geld fließen kann (MUSS, alles Maris)

1. **Stripe live schalten** — Account ist noch Sandbox („Aiwithmaris Sandbox").
   Dashboard → „Aktivieren": Identität verifizieren + Bankkonto hinterlegen.
   Danach den Live-Secret-Key im Supabase-Vault ersetzen (Secret `stripe_secret_key`)
   und die drei Live-Price-IDs in der Edge Function `checkout` eintragen.
2. **Impressum mit echten Daten** — steht noch auf Platzhalter. Bei einer
   Verkaufsseite in DE ist das abmahnfähig. Name + ladungsfähige Anschrift rein.
3. **Gewerbe/Steuer** — Einnahmen anmelden; für den Anfang reicht meist die
   Kleinunternehmerregelung (§19 UStG). Kurz mit dem Finanzamt/Steuerberater klären.

Ohne 1–3 bleibt alles im Testmodus — die Technik ist fertig und wartet.

## Kanäle (Empfehlung in dieser Reihenfolge)

| Kanal | Aufwand | Wer macht was |
|---|---|---|
| **1. LinkedIn (organisch)** | niedrig, regelmäßig | Claude: Posts schreiben (3 Entwürfe liegen in `linkedin-posts.md`). Maris: unter eigenem Profil posten, auf Kommentare antworten. Bester Kanal für B2B/Mittelstand. |
| **2. Gumroad** | einmalig ~30 Min | Claude: Listing-Texte fertig (`gumroad-listing.md`). Maris: Account anlegen (gumroad.com), PDFs hochladen, Texte einfügen, Preis setzen. Gumroad übernimmt Zahlung + Auslieferung — unabhängig vom Stripe-Status! |
| **3. Eigene Website** | fertig | Shop läuft technisch komplett (Stripe-Checkout, geschützter Download, Report). Wartet nur auf Live-Schaltung (siehe oben). |
| **4. Lemon Squeezy** | einmalig ~30 Min | Wie Gumroad, aber als Merchant of Record — übernimmt auch die Umsatzsteuer. Gute Alternative, wenn EU-VAT nervt. Maris: Account; Claude: Texte (identisch zu Gumroad). |
| **5. Newsletter/Lead-Magnet** | mittel | Claude kann bauen: Gratis-Kapitel als Leseprobe gegen E-Mail (Supabase + Double-Opt-in), dann Upsell. Sag Bescheid, wenn gewünscht. |
| **6. Google Ads / LinkedIn Ads** | Budget nötig | Erst wenn organisch validiert ist. Maris entscheidet Budget. |

**Eher lassen:** Etsy (falsche Zielgruppe für B2B), Amazon KDP (Preisdruck,
Formataufwand), Udemy (anderes Format).

## Schon erledigt (Claude, 2026-06-10)

- ✅ Produkt-Schema (JSON-LD) auf guide.html — Google kann den Guide als
  Produkt mit Preis anzeigen (Rich Results).
- ✅ Verkaufs-Report unter `/report.html` (Key liegt bei Maris; Funnel:
  gestartete Checkouts vs. bezahlte Käufe, Umsatz, Produkte, 30-Tage-Chart).
- ✅ Listing- und Post-Texte in diesem Ordner.

## Nächste Claude-Aufgaben (auf Zuruf)

- Leseprobe-PDF (1 Kapitel) + Lead-Magnet-Flow bauen
- Eigenes OG-Bild für guide.html (aktuell generisches og-axon.png)
- Stripe Payment Link erstellen, sobald der Account live ist
  (teilbarer Kauf-Link für Social-Profile, ohne Website-Umweg)
