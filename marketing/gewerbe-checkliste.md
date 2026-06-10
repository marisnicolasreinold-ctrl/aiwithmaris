# Gewerbe-Checkliste — Maris Reinold (Kleinunternehmer)

Stand: 2026-06-10 · Interner Ordner, wird nicht deployt.

## Schritt 1: Gewerbeanmeldung Stadt Dortmund — ✅ ERLEDIGT 10.06.2026
- [x] **Anmeldung über Wirtschafts-Service-Portal.NRW eingereicht** — Bestätigungsmail
      vom 10.06.2026, 17:17 Uhr: erfolgreich eingegangen, an zuständige Stelle
      weitergeleitet. **Du darfst ab sofort mit dem Gewerbe starten** (Anzeige wirkt
      wie der Gewerbeschein, keine zusätzliche Bescheinigung nötig).
- [ ] Empfangsbescheinigung herunterladen (für die Unterlagen): WSP-Konto unter
      https://service.wirtschaft.nrw/antraege → „Eingereichte Anträge" → Details
      → Dokumente → Download
- [ ] Bestätigungsmail + Empfangsbescheinigung im Steuer-Ordner ablegen

## Schritt 2 — JETZT DRAN: Fragebogen zur steuerlichen Erfassung (ELSTER)
- [ ] Auf elster.de registrieren (falls noch nicht) — Freischaltung dauert ein paar Tage
- [ ] Fragebogen zur steuerlichen Erfassung ausfüllen
- [ ] **Kleinunternehmerregelung § 19 UStG ankreuzen** (Grenzen seit 2025:
      25.000 € Vorjahr / 100.000 € laufendes Jahr)
- [ ] Umsatz-/Gewinnschätzung konservativ (z. B. 1.000–2.000 € im 1. Jahr, unverbindlich)
- [ ] Neue Steuernummer notieren → wird auf Rechnungen gebraucht

## Schritt 3: Automatische Folgepost (kein Stress)
- [ ] IHK Dortmund: Pflichtmitgliedschaft, bei kleinem Gewinn meist beitragsbefreit —
      deren Fragebogen wahrheitsgemäß zurückschicken
- [ ] Berufsgenossenschaft (VBG): als Solo ohne Angestellte i. d. R. nicht
      pflichtversichert — Brief beantworten
- [ ] Falls angestellt: Arbeitsvertrag auf Nebentätigkeits-Meldepflicht prüfen
- [ ] Falls familien-/studentisch krankenversichert: Einkommensgrenzen beachten,
      Krankenkasse informieren, sobald regelmäßig Einnahmen kommen

## Laufend (Minimum)
- [ ] Alle Belege sammeln (Stripe-/Gumroad-Auszahlungen, Domain, Hosting …)
- [ ] Jährlich: Steuererklärung mit Anlage EÜR + Anlage G
- [x] Rechnungssatz Pflicht: „Gemäß § 19 UStG wird keine Umsatzsteuer berechnet."
      → ✅ Seit 10.06.2026 fest in der checkout-Edge-Function hinterlegt
      (`invoice_creation[invoice_data][footer]`, DE + EN) — gilt automatisch
      auch im Live-Betrieb, kein Dashboard-Eintrag mehr nötig.

## Danach (Claude übernimmt, sobald der Live-Key da ist)
- Vorbereitet am 10.06.2026: Die checkout-Function liest optionale Live-Price-IDs
  aus dem Vault-Secret `stripe_price_overrides`
  (JSON: `{"de":"price_…","en":"price_…","bundle":"price_…"}`) — Live-Gang
  braucht damit kein Code-Deploy mehr, nur zwei Vault-Updates.
- Offen: Stripe-Live-Account aktivieren (Identität + Bankkonto, kann nur Maris),
  dann `stripe_secret_key` im Vault auf `sk_live_…` tauschen, Produkte im
  Live-Modus anlegen und deren Price-IDs als `stripe_price_overrides` setzen.
- Verkaufs-Report zeigt dann automatisch Live-Daten statt Sandbox.

> Hinweis: Sorgfältig zusammengestellt, aber keine Steuer-/Rechtsberatung.
