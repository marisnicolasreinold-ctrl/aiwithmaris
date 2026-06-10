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

## Was du noch tun musst (einmalig)

1. **Vercel → Project → Settings → Environment Variables:**
   `STRIPE_SECRET_KEY` = dein Stripe **Secret Key** (Test: `sk_test_…`).
   Den Key niemals committen — `.env` ist in `.gitignore`, Vorlage in `.env.example`.
2. Deployen und einen Testkauf machen: Karte `4242 4242 4242 4242`,
   beliebiges Zukunftsdatum, beliebige CVC.
3. **Vor dem Live-Gang:**
   - Im Stripe-Dashboard auf Live-Modus umstellen, Produkte/Preise dort neu
     anlegen (oder per Dashboard kopieren) und die Live-`price_…`-IDs als
     `STRIPE_PRICE_*`-Env-Vars setzen; `STRIPE_SECRET_KEY` auf `sk_live_…` tauschen.
   - Da der Test-Secret-Key im Chat geteilt wurde: im Stripe-Dashboard unter
     „API-Schlüssel" **rotieren** (gute Hygiene, auch wenn es nur ein Test-Key ist).
   - Impressum mit echten Daten füllen (Pflicht beim Verkauf!) und die
     AGB (§ 7 Digitale Inhalte, Widerrufsverzicht) rechtlich gegenprüfen lassen.
   - Steuer: Einnahmen anmelden (Kleinunternehmer § 19 UStG prüfen).

## Rückgabe / Widerruf

Digitale Produkte mit Sofort-Download: Im Bestellprozess stimmt der Käufer der
sofortigen Bereitstellung zu und bestätigt das Erlöschen des Widerrufsrechts
(§ 356 Abs. 5 BGB) — Checkbox auf `/guide`, Hinweis im Stripe-Checkout und
Klausel in `agb.html` § 7. **Es werden keine Erstattungen angeboten**; bei
defekter Datei gibt es Ersatz. Hinweis: Käufer können trotzdem Chargebacks
über ihre Bank anstoßen — solche Disputes laufen über das Stripe-Dashboard.
