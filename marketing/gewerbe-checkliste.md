# Gewerbe-Checkliste — Maris Reinold (Kleinunternehmer)

Stand: 2026-06-10 · Interner Ordner, wird nicht deployt.

## Schritt 1: Gewerbeanmeldung Stadt Dortmund
- [ ] **NUR über die offizielle Seite dortmund.de** („Gewerbeanmeldung" suchen)!
      Offizielle Gebühr: **26 € für Einzelunternehmer**. Wege: Online-Portal der Stadt,
      per E-Mail an gewerbe@stadtdo.de, oder Termin bei der Gewerbemeldestelle
      (Ordnungsamt). Personalausweis reicht.
- [ ] ⚠️ ABZOCK-FALLE: Seiten wie „gewerbeanmeldung.de" / „gewerbe-anmelden.info"
      sind PRIVATE Vermittler und verlangen ~80 € (50 € Servicegebühr für nichts).
      Erkennbar: offizielle Behördenseiten enden auf dortmund.de.
- [ ] Tätigkeitsbeschreibung (deckt Coaching + Software + PDF-Verkauf ab):
      „Dienstleistungen im Bereich Software-Entwicklung, IT-Beratung und Coaching zu
      Künstlicher Intelligenz sowie Vertrieb digitaler Produkte (PDF-Leitfäden) über
      das Internet"
- [ ] Haupt-/Nebenerwerb: bei Anstellung/Studium → Nebenerwerb ankreuzen
- [ ] Beginn: Datum der Anmeldung (Shop ist noch im Testmodus → sauber)

## Schritt 2: Fragebogen zur steuerlichen Erfassung (ELSTER)
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
- [ ] Rechnungssatz Pflicht: „Gemäß § 19 UStG wird keine Umsatzsteuer berechnet."
      → Bei Stripe-Live-Schaltung: Claude trägt den Satz in die
      Stripe-Rechnungseinstellungen ein (Rechnungs-Footer)

## Danach (Claude übernimmt)
- Stripe-Live-Key in Supabase-Vault tauschen + Live-Price-IDs in der
  checkout-Edge-Function + Rechnungs-Footer mit §19-Satz konfigurieren
- Verkaufs-Report zeigt dann automatisch Live-Daten statt Sandbox

> Hinweis: Sorgfältig zusammengestellt, aber keine Steuer-/Rechtsberatung.
