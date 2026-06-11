# PDF-Verkauf — Status & Setup

> **🟢 LIVE seit 11.06.2026.** Stripe-Live-Account ist aktiviert (Zahlungen +
> Auszahlungen freigeschaltet), Live-Produkte/-Preise angelegt, Vault-Secrets
> (`stripe_secret_key` auf `sk_live_…`, `stripe_price_overrides` mit den
> Live-Price-IDs) gesetzt und per Live-Checkout-Session verifiziert.
> Der Shop nimmt echtes Geld an.

> **Stand: umgesetzt.** Der Shop ist eingebaut: `guide.html` (Verkaufsseite),
> `danke.html` (Download nach Zahlung), `api/checkout.js` + `api/download.js`
> (Stripe Checkout & abgesicherte Auslieferung). Die PDFs liegen in `api/_files/`
> und sind dadurch **nicht** öffentlich abrufbar — nur über eine bezahlte
> Stripe-Session.

## Wie es funktioniert

1. Kunde wählt auf `/guide` ein Produkt: Hauptguide (DE/EN 19 €, Bundle 29 €
   über die Ausgaben-Wahl in der Karte), Vertiefungs-Guides (12–29 €) oder
   KI-Bibliothek (59 €, Banner ganz oben im Shop). Der Klick auf „Kaufen"
   öffnet einen Bestätigungs-Dialog, in dem die Widerrufsverzicht-Checkbox
   direkt neben „Weiter zur Kasse" sitzt (Shop-Neuaufbau 11.06.2026 — vorher
   lag die Checkbox global über allen Karten und die Buttons waren deaktiviert).
2. `POST /api/checkout` erstellt eine Stripe-Checkout-Session
   (inkl. Rechnung und Hinweistext zum Widerrufsverzicht) und leitet zu Stripe.
3. Nach Zahlung leitet Stripe auf `/danke?session_id=…`.
4. Die Danke-Seite fragt `GET /api/download?…&info=1` ab und zeigt die
   Download-Buttons. `GET /api/download?…&file=de|en` prüft bei Stripe, ob die
   Session bezahlt ist und welche Dateien zum Kauf gehören — erst dann wird
   das PDF ausgeliefert.

## Stripe LIVE (aktiv seit 11.06.2026)

Account: `acct_1TgeQ8AYfMthwvew` — charges_enabled ✅, payouts_enabled ✅

| Produkt | Live-Price-ID | Preis | Payment Link |
|---|---|---|---|
| Leitfaden DE | `price_1Th2MFAYfMthwvewldk10B2o` | 19 € | https://buy.stripe.com/dRmcN43PoggQ5KXdjHfYY00 |
| Guide EN | `price_1Th2MGAYfMthwvewKLHTiiH8` | 19 € | https://buy.stripe.com/cNi6oGclU3u4c9l0wVfYY01 |
| Bundle DE+EN | `price_1Th2MGAYfMthwvewpNw0OH7X` | 29 € | https://buy.stripe.com/4gM14m2Lk1lWa1d3J7fYY02 |

Die Live-Price-IDs liegen im Vault-Secret `stripe_price_overrides` und
überschreiben die Sandbox-Defaults in der checkout-Edge-Function — kein
Code-Deploy nötig. Die Payment Links sind teilbar (Social-Profile, E-Mail),
setzen `metadata[files]`, leiten nach Zahlung auf `/danke?session_id=…`
(Download funktioniert wie beim Website-Checkout) und enthalten Rechnung
mit § 19-Footer + Widerrufsverzicht-Hinweis.

## Die eBook-Reihe (live seit 11.06.2026)

Drei neue eBooks (je DE+EN im Paket) + Komplett-Bundle. PDFs und
Quell-Manuskripte liegen im privaten Storage-Bucket `guides` (Manuskripte
unter `sources/` — NICHT im öffentlichen Repo!). Produktion: Manuskripte als
Markdown, gesetzt mit `scripts/og/render-ebook.mjs`.

| Produkt (product-Key) | Preis | Live-Price-ID | Payment Link |
|---|---|---|---|
| Prompt-Werkzeugkasten Bundle (`prompts`) | 12 € | `price_1Th4fzAYfMthwvewLi7hCOBS` | https://buy.stripe.com/aFa9ASdpYfcMddp7ZnfYY03 |
| Prompt-Werkzeugkasten DE (`prompts-de`) | 8 € | `price_1Th7dAAYfMthwvewI8WFdSC7` | — (nur Website) |
| Prompt-Werkzeugkasten EN (`prompts-en`) | 8 € | `price_1Th7dBAYfMthwvew20QT2jjy` | — (nur Website) |
| DSGVO & KI Bundle (`dsgvo`) | 29 € | `price_1Th4g0AYfMthwvewHswam7tF` | https://buy.stripe.com/cNi5kCdpY1lW0qD0wVfYY04 |
| DSGVO & KI DE (`dsgvo-de`) | 19 € | `price_1Th7dBAYfMthwvewROelRC6f` | — (nur Website) |
| DSGVO & KI EN (`dsgvo-en`) | 19 € | `price_1Th7dCAYfMthwvew4Z3sDzRu` | — (nur Website) |
| Make or Buy Bundle (`makeorbuy`) | 29 € | `price_1Th4g0AYfMthwvewKlOa2DIR` | https://buy.stripe.com/4gM00ify6fcMa1d1AZfYY05 |
| Make or Buy DE (`makeorbuy-de`) | 19 € | `price_1Th7dCAYfMthwvewKOzSB3eJ` | — (nur Website) |
| Make or Buy EN (`makeorbuy-en`) | 19 € | `price_1Th7dDAYfMthwvewu8aCQKG3` | — (nur Website) |
| KI-Bibliothek, alle 4 (`library`) | 59 € | `price_1Th4g1AYfMthwvew4k7tl8F7` | https://buy.stripe.com/fZueVc0DcggQddp1AZfYY06 |

Einzelsprach-Editionen (11.06.2026): angelegt per temporärer Edge-Function
`admin-setup-editions` (stillgelegt, antwortet 410). Preislogik wie beim
Hauptguide (einzeln ≈ ⅔ vom Bundle). Auf guide.html haben alle 4 Karten
denselben Ausgaben-Wähler (Deutsch / Englisch / Beide).

**Rechnungsnummern:** Stripe vergibt automatisch eine Nummer beim
Finalisieren (steht auf jedem Rechnungs-PDF; die Danke-Seite zeigt sie am
Rechnungs-Button mit an). Standard ist KUNDEN-bezogene Nummerierung
(z. B. `ABC123-0001`). Für klassische fortlaufende Nummern über alle Kunden:
Dashboard → Settings → Billing/Invoicing → Invoice numbering →
**Sequentially across your account** umstellen (geht nicht per API).

Datei-Schlüssel in `metadata[files]` (Download-Function):
`prompts-de`, `prompts-en`, `dsgvo-de`, `dsgvo-en`, `makeorbuy-de`,
`makeorbuy-en` (+ bestehend `de`, `en`). Verkaufsseite: guide.html
(Abschnitt „Die Vertiefungs-Leitfäden"), Download-Labels: danke.html.

## Stripe (Sandbox / Test-Modus — historisch)

Sandbox-Account: `acct_1TgeQIAPD9ukdtqR` („Aiwithmaris Sandbox")

| Produkt | Product-ID | Price-ID | Preis |
|---|---|---|---|
| Leitfaden DE | `prod_Ug19TD0AoKZW6a` | `price_1Tgf7lAPD9ukdtqRQUhRNXUc` | 19 € |
| Guide EN | `prod_Ug19mIxhym0fmH` | `price_1Tgf7mAPD9ukdtqRkoLBzXTx` | 19 € |
| Bundle DE+EN | `prod_Ug196VyIsNZTv5` | `price_1Tgf7mAPD9ukdtqRSf0s9cTO` | 29 € |

Diese Sandbox-Price-IDs sind weiterhin als Default im Code der
checkout-Edge-Function hinterlegt, werden aber durch das Vault-Secret
`stripe_price_overrides` (live) überschrieben.

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

## Live-Gang am 11.06.2026 — was erledigt wurde

1. ✅ **Stripe-Live-Account aktiviert** (Maris): Identität + IBAN hinterlegt,
   charges_enabled und payouts_enabled bestätigt.
2. ✅ **Live-Produkte/-Preise angelegt** (Claude, per temporärer
   Supabase-Edge-Function — inzwischen stillgelegt).
3. ✅ **Vault umgeschaltet:** `stripe_secret_key` → `sk_live_…`,
   `stripe_price_overrides` mit den drei Live-Price-IDs gesetzt.
4. ✅ **Verifiziert:** Live-Checkout-Session (`cs_live_…`) erfolgreich über
   die checkout-Edge-Function erstellt.
5. ✅ **Payment Links** für alle drei Produkte erstellt (siehe Tabelle oben).

## Was noch offen ist (nur Maris kann das)

1. ✅ **Echter Testkauf erledigt (11.06.2026)** — Kauf über den neuen
   Checkout-Dialog hat funktioniert (damit ist der ganze Live-Flow
   Dialog → Stripe → Download end-to-end bestätigt). Falls noch nicht
   geschehen: Betrag im Stripe-Dashboard an sich selbst erstatten.
2. **Stripe-E-Mails einschalten (Live-Dashboard):** Beim Testkauf kam keine
   Rechnungs-Mail an — Stripe ERSTELLT die Rechnung zwar (invoice_creation in
   der checkout-Function, § 19-Footer), VERSCHICKT sie aber nur, wenn im
   Dashboard aktiviert. Zwei Schalter:
   - Settings → Customer emails → **Successful payments** (Zahlungsbeleg)
   - Settings → Billing/Invoicing → **Email finalized invoices to customers**
   Hinweis Apple Pay: Die Mail geht an die im Apple-Wallet hinterlegte
   Adresse (oft iCloud) — im Dashboard beim Payment unter „Customer" sichtbar.
   **Workaround ist live (11.06.2026):** Die Danke-Seite zeigt jetzt einen
   eigenen „Rechnung herunterladen (PDF)"-Button (download-Function v3 liefert
   `invoice_pdf`/`invoice_url` via `expand[]=invoice`) — funktioniert auch
   rückwirkend für alte danke-Links.
3. **ELSTER:** Fragebogen zur steuerlichen Erfassung mit
   Kleinunternehmerregelung § 19 UStG (siehe marketing/gewerbe-checkliste.md).
4. Optional: AGB § 7 (Widerrufsverzicht) rechtlich gegenprüfen lassen.

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
