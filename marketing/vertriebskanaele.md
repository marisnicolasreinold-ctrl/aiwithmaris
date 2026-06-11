# Vertrieb & Bewerbung — KI-Guide „Anfangen, wo es zählt"

Stand: 2026-06-10 · Dieser Ordner wird NICHT deployt (.vercelignore).

## 🟢 Der Shop ist LIVE (seit 11.06.2026)

1. ~~Stripe live schalten~~ — ✅ erledigt am 2026-06-11: Live-Account aktiviert,
   Live-Produkte/-Preise angelegt, Vault-Secrets umgeschaltet, Live-Checkout
   verifiziert. Details + Payment Links in `pdf-verkauf-todo.md`.
2. ~~Impressum mit echten Daten~~ — ✅ erledigt am 2026-06-10 (Maris Reinold,
   Kortental 10, 44149 Dortmund, in Impressum/Datenschutz/AGB inkl. §19-UStG-Klausel).
3. ~~Gewerbe anmelden~~ — ✅ bestätigt am 2026-06-10. **Noch offen:** ELSTER-Fragebogen
   zur steuerlichen Erfassung mit Kleinunternehmerregelung (§19 UStG).

**Teilbare Payment Links** (für LinkedIn-Profil, E-Mail-Signatur etc.):
- Leitfaden DE (19 €): https://buy.stripe.com/dRmcN43PoggQ5KXdjHfYY00
- Guide EN (19 €): https://buy.stripe.com/cNi6oGclU3u4c9l0wVfYY01
- Bundle DE+EN (29 €): https://buy.stripe.com/4gM14m2Lk1lWa1d3J7fYY02

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
- ~~Stripe Payment Link erstellen~~ — ✅ erledigt 2026-06-11 (alle drei
  Produkte, Links siehe oben; Rechnung + Widerrufshinweis inklusive,
  Download-Auslieferung über /danke funktioniert auch hier)
