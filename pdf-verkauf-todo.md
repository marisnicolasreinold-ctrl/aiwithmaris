# PDF-Verkauf — To-do für später (Phase 2)

> Kurzfassung: **Supabase hat keine Bezahlfunktion.** Zum Verkaufen brauchst du immer
> einen Bezahldienst dazu. Und sobald Geld fließt, wird aus „Spielerei" echtes Business
> mit Steuer- und Rechtspflichten. Deshalb bewusst auf später geschoben.

## Der einfachste Weg (empfohlen): Lemon Squeezy oder Gumroad
Diese Dienste nehmen dir fast alles ab — Hosting der PDF, Bezahlung, Download-Link, und
(bei Lemon Squeezy als „Merchant of Record") sogar die Umsatzsteuer.

1. Account bei **lemonsqueezy.com** (oder **gumroad.com**) anlegen.
2. PDF als Produkt hochladen, Preis festlegen.
3. „Buy"-Button / Link von dort auf eine neue Seite `shop.html` packen.
4. Käufer bezahlt → bekommt automatisch den Download. Fertig, kein eigener Code nötig.

Vorteil: kaum Technik, weniger Rechtskram. Nachteil: kleine Gebühr pro Verkauf.

## Der „alles selbst"-Weg: Supabase + Stripe
Mehr Kontrolle, aber deutlich mehr Aufwand:

1. **PDF speichern:** Supabase Storage, **privater** Bucket (nicht öffentlich!).
2. **Bezahlung:** Stripe-Account + Stripe Checkout.
3. **Ablauf absichern:** Stripe-Webhook → Supabase Edge Function → erzeugt einen
   zeitlich begrenzten, signierten Download-Link (sonst kann jeder das PDF ziehen).
4. Link per E-Mail an den Käufer oder direkt nach dem Kauf anzeigen.

## Rechtliches / Steuer (gilt für beide Wege, in DE)
- **Gewerbe / Kleinunternehmer:** Einnahmen müssen angemeldet & versteuert werden.
  Für den Anfang meist Kleinunternehmerregelung (§19 UStG).
- **Impressum:** mit echten Daten (Name + Anschrift) — Pflicht. (Aktuell noch Platzhalter.)
- **Widerrufsrecht bei digitalen Gütern:** spezielle Klausel/Einwilligung nötig
  (Kunde verzichtet aufs Widerrufsrecht beim sofortigen Download).
- **Rechnung** mit Pflichtangaben.
- Lemon Squeezy nimmt dir den Umsatzsteuer-Teil ab — Gumroad/Stripe nicht automatisch.

## Wenn du so weit bist
Sag Bescheid — dann bauen wir den gewählten Weg konkret ein. Empfehlung: mit Lemon
Squeezy starten, weil am wenigsten Aufwand und Risiko.
