# PDF-Verkauf — Status & Setup

> **Stand: umgesetzt.** Der Shop ist eingebaut: `guide.html` (Verkaufsseite),
> `danke.html` (Download nach Zahlung), `api/checkout.js` + `api/download.js`
> (Stripe Checkout & abgesicherte Auslieferung). Die PDFs liegen in `api/_files/`
> und sind dadurch **nicht** öffentlich abrufbar — nur über eine bezahlte
> Stripe-Session.

## Wie es funktioniert

1. Kunde wählt auf `/guide` eine Ausgabe (DE 19 €, EN 19 €, Bundle 29 €) und
   bestätigt die Checkbox (Widerrufsverzicht bei Sofort-Download).
2. `POST /api/checkout` erstellt eine Stripe-Checkout-Session
   (inkl. Rechnung und Hinweistext zum Widerrufsverzicht) und leitet zu Stripe.
3. Nach Zahlung leitet Stripe auf `/danke?session_id=…`.
4. Die Danke-Seite fragt `GET /api/download?…&info=1` ab und zeigt die
   Download-Buttons. `GET /api/download?…&file=de|en` prüft bei Stripe, ob die
   Session bezahlt ist und welche Dateien zum Kauf gehören — erst dann wird
   das PDF ausgeliefert.

## Stripe (Sandbox / Test-Modus)

Account: `acct_1TgeQIAPD9ukdtqR` („Aiwithmaris Sandbox")

| Produkt | Product-ID | Price-ID | Preis |
|---|---|---|---|
| Leitfaden DE | `prod_Ug19TD0AoKZW6a` | `price_1Tgf7lAPD9ukdtqRQUhRNXUc` | 19 € |
| Guide EN | `prod_Ug19mIxhym0fmH` | `price_1Tgf7mAPD9ukdtqRkoLBzXTx` | 19 € |
| Bundle DE+EN | `prod_Ug196VyIsNZTv5` | `price_1Tgf7mAPD9ukdtqRSf0s9cTO` | 29 € |

Die Price-IDs sind als Default in `api/checkout.js` hinterlegt und können per
Umgebungsvariablen (`STRIPE_PRICE_DE/EN/BUNDLE`) überschrieben werden.

## Stand 10.06.2026 — was schon erledigt ist

- ✅ **Gewerbe angemeldet** (Wirtschafts-Service-Portal.NRW, Bestätigung vom
  10.06.2026 — Verkauf darf ab sofort starten).
- ✅ **Impressum** mit echten Daten gefüllt (Maris Reinold, Kortental 10,
  44149 Dortmund, § 19 UStG-Hinweis).
- ✅ **§ 19 UStG-Rechnungssatz** („Gemäß § 19 UStG wird keine Umsatzsteuer
  berechnet.") fest in der checkout-Edge-Function als Rechnungs-Footer
  (DE + EN) — gilt automatisch auch im Live-Betrieb.
- ✅ **Live-Umschaltung ohne Code-Deploy vorbereitet:** Die checkout-Function
  liest optionale Price-Overrides aus dem Vault-Secret `stripe_price_overrides`
  (JSON: `{"de":"price_…","en":"price_…","bundle":"price_…"}`). Fehlt das
  Secret, gelten die Sandbox-Preise.

## Was noch fehlt für den Live-Gang (nur Maris kann das)

1. **Stripe-Live-Account aktivieren:** dashboard.stripe.com → Live-Modus →
   Identitätsprüfung + Bankkonto (IBAN) hinterlegen. Geschäftsangaben:
   Einzelunternehmer, „AI with Maris", Dortmund.
2. **Live-Secret-Key an Claude geben** (oder selbst im Supabase-Vault das
   Secret `stripe_secret_key` auf `sk_live_…` tauschen).
3. Claude übernimmt dann: Live-Produkte/-Preise anlegen,
   `stripe_price_overrides` im Vault setzen, Testkauf mit echter Karte
   (z. B. 1 €-Testpreis) verifizieren.
4. **ELSTER:** Fragebogen zur steuerlichen Erfassung mit
   Kleinunternehmerregelung § 19 UStG (siehe marketing/gewerbe-checkliste.md).
5. Optional: AGB § 7 (Widerrufsverzicht) rechtlich gegenprüfen lassen.

## Testkauf (Sandbox, jederzeit)

Karte `4242 4242 4242 4242`, beliebiges Zukunftsdatum, beliebige CVC.
Die Rechnung muss im Footer den § 19-Satz zeigen.

## Rückgabe / Widerruf

Digitale Produkte mit Sofort-Download: Im Bestellprozess stimmt der Käufer der
sofortigen Bereitstellung zu und bestätigt das Erlöschen des Widerrufsrechts
(§ 356 Abs. 5 BGB) — Checkbox auf `/guide`, Hinweis im Stripe-Checkout und
Klausel in `agb.html` § 7. **Es werden keine Erstattungen angeboten**; bei
defekter Datei gibt es Ersatz. Hinweis: Käufer können trotzdem Chargebacks
über ihre Bank anstoßen — solche Disputes laufen über das Stripe-Dashboard.
