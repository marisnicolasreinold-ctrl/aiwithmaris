# Design-Highlights — Tagespläne für die nächsten drei Ausbaustufen

> **Stand: geplant (11.06.2026).** Drei Workstreams, jeweils als Tagesplan
> heruntergebrochen. Empfohlene Reihenfolge: **1 → 2 → 3**, weil die neuen
> Visuals aus Workstream 1 direkt in die Scrollytelling-Sektion (Workstream 2)
> einfließen. Workstream 3 (KI-Agent) ist unabhängig und kann parallel laufen.

| # | Highlight | Aufwand | Hängt ab von |
|---|---|---|---|
| 1 | Echte Bildwelt / Visuals | ~2–3 Tage | — |
| 2 | Scrollytelling „So entsteht dein Projekt" | ~2 Tage | idealerweise 1 |
| 3 | KI-Agent auf der Seite („Frag Maris") | ~4 Tage | — |

---

## Workstream 1 — Echte Bildwelt (~2–3 Tage)

**Ziel:** Die Seite lebt aktuell fast nur von UI-Mockups und Verläufen
(`assets/` enthält ~6 Bilder). Eine einheitliche, hochwertige Bildwelt ist der
größte sichtbare Hebel Richtung „Awwwards-Look".

### Tag 1 — Stil festlegen & Bildliste produzieren
- [ ] Bildstil definieren, der zur bestehenden Farbreise passt
      (dunkel, Cyan → Violett → Pink → Türkis, vgl. `motion.js` Farb-Stops).
      Ein Stil-Prompt/Template festhalten, damit alle Bilder konsistent sind.
- [ ] Bildliste produzieren (KI-generiert oder 3D-Rendering), pro Motiv
      Quer- und Hochformat:
      - 1 Hero-Key-Visual (Startseite)
      - je 1 Key-Visual pro App: ATLAS, APEX/Garmin-Coach, Agent-Flow,
        DocFlow, FlowOps, PulseCRM (für die Karten in `beispiele.html`)
      - 1 Visual „Coaching" + 1 Visual „Software" (Zwei-Säulen-Sektion)
      - 1–2 Szenen für `ueber-uns.html`
- [ ] Auswahlrunde: pro Motiv 3–4 Varianten erzeugen, beste behalten.

### Tag 2 — Technisch sauber einbauen
- [ ] Bilder als **AVIF/WebP** exportieren (Fallback PNG), Zielgröße
      < 200 KB pro Bild; in `assets/img/` ablegen.
- [ ] Einbau mit `loading="lazy"`, `srcset`/`sizes` für Mobile,
      `width`/`height`-Attribute gegen Layout-Shift.
- [ ] `beispiele.html`: Karten und Live-Demo-Cover mit den App-Visuals
      hinterlegen (statt reiner Verläufe).
- [ ] `index.html`: Hero- und Säulen-Sektion mit Visuals anreichern;
      bestehende `reveal`-Klassen für den Einblend-Effekt weiterverwenden.

### Tag 3 (optional) — Feinschliff & Meta
- [ ] `og-axon.png` / `og-guide.png` im neuen Look neu erzeugen
      (Pipeline in `scripts/og/` existiert bereits).
- [ ] Poster-Frames der Videos (`intro-poster.png`, `guide-promo-poster.png`)
      an den neuen Look angleichen — ggf. über die bestehende
      Remotion-Pipeline (`remotion/`) neu rendern.
- [ ] Lighthouse-Check: Performance darf nicht unter den aktuellen Stand fallen.

**Fertig, wenn:** jede Hauptseite mindestens ein echtes Key-Visual hat,
alle Bilder im einheitlichen Stil sind und Lighthouse-Performance stabil bleibt.

---

## Workstream 2 — Scrollytelling-Sektion „So entsteht dein Projekt" (~2 Tage)

**Ziel:** Eine gepinnte Sektion auf der Startseite, die beim Scrollen in
4 Kapiteln erzählt: **Problem → Coaching → Software → läuft in deiner Cloud.**
Das ist der Effekt der „ausgefallenen, geil animierten" Seiten — und GSAP
ScrollTrigger liegt schon in `vendor/` (inkl. MotionPathPlugin).

### Tag 1 — Storyboard, Markup, statische Stufen
- [ ] Storyboard: pro Kapitel eine Headline, 2 Sätze, 1 Visual
      (aus Workstream 1) und eine Kennzahl/Aussage.
- [ ] Neue Sektion in `index.html` zwischen Zwei-Säulen und Showcase:
      gepinnter Container, 4 Panels, Fortschrittsanzeige (Kapitel-Punkte).
- [ ] CSS in `style.css`: Layout steht auch **ohne** JavaScript sauber
      untereinander (Fallback = normale Sektionen).

### Tag 2 — Animation, Mobile, Zugänglichkeit
- [ ] GSAP-Timeline in `motion.js`: Sektion pinnen (`pin: true`,
      `scrub`), Panels per transform/opacity überblenden — Hausregel aus
      `motion.js` beibehalten: **nur transform/opacity animieren**.
- [ ] Die bestehende Farbreise der Three.js-Szene auf die 4 Kapitel
      abstimmen (die Farb-Stops liegen schon in `motion.js`).
- [ ] Mobile: leichte Variante ohne Pinning (einfache Reveals), wie beim
      restlichen Motion-System.
- [ ] `prefers-reduced-motion` respektieren (Mechanik existiert bereits).
- [ ] Übersetzungen in `i18n.js` ergänzen (DE/EN).

**Fertig, wenn:** die Sektion auf Desktop gepinnt durchläuft, auf Mobile und
mit reduzierter Bewegung sauber degradiert und beide Sprachen abgedeckt sind.

---

## Workstream 3 — KI-Agent „Frag Maris" (~4 Tage)

**Ziel:** Die Seite führt selbst vor, was sie verkauft: ein Chat-Assistent,
der Besucher zu Leistungen, Guide und Demos berät und zur Kontaktaufnahme
führt. Stärkstes Differenzierungsmerkmal für eine Seite namens „AI with Maris".

### Tag 1 — Backend
- [ ] Supabase Edge Function `ask-maris` (Supabase ist bereits im Stack,
      API-Key ins Vault — gleiches Muster wie beim Stripe-Setup).
- [ ] Anbindung an die Claude-API mit Streaming; System-Prompt mit klarer
      Rolle („Assistent von AI with Maris") und Themenbindung.
- [ ] Rate-Limiting pro IP/Session (Schutz vor Missbrauch und Kosten).

### Tag 2 — Wissensbasis & Verhalten
- [ ] Inhalte von `leistungen.html`, `guide.html`, `beispiele.html`,
      `ueber-uns.html` und Blog als kompakte Wissensbasis in den
      System-Prompt aufnehmen (bei dem Umfang reicht das — kein RAG nötig).
- [ ] Handlungsziele definieren: auf Guide (`/guide`), passende Live-Demo
      oder `kontakt.html` verlinken; bei Off-Topic freundlich zurücklenken.
- [ ] Testfragen-Katalog schreiben (20–30 Fragen DE/EN inkl. Grenzfälle).

### Tag 3 — Widget-UI
- [ ] Chat-Widget im bestehenden Look (Holo-Panel-Stil, `data-hover`-
      Interaktionen), als eigenes `chat.js` + Abschnitt in `style.css`.
- [ ] Streaming-Anzeige, Vorschlags-Chips für Einstiegsfragen
      („Was kostet der Guide?", „Zeig mir eine Demo").
- [ ] Zweisprachig über `i18n.js`; öffnet sich dezent (kein Auto-Popup).

### Tag 4 — Datenschutz, Härtung, Launch
- [ ] `datenschutz.html` ergänzen: Hinweis auf KI-Chat, Datenverarbeitung,
      keine Speicherung ohne Einwilligung; Hinweistext im Widget selbst.
- [ ] Missbrauchstests (Prompt-Injection-Versuche, sehr lange Eingaben),
      Token-/Kostenlimit pro Antwort.
- [ ] Erst nur auf der Startseite live schalten, Nutzung beobachten,
      dann auf alle Seiten ausrollen.

**Fertig, wenn:** der Agent die Testfragen korrekt beantwortet, bei Off-Topic
zurücklenkt, DSGVO-Hinweise stehen und ein Kostenlimit greift.

---

## Nicht in diesem Plan (bewusst)

- **Templates/Toolkits über den bestehenden Stripe-Download-Flow verkaufen** —
  geschäftlich der schnellste Gewinn (Infrastruktur existiert), aber kein
  Design-Thema. Bei Bedarf als eigener Plan ergänzen.
- **Klassische Download-Software (.exe/.dmg)** — verworfen: Signing-, Update-
  und Support-Aufwand passt nicht zur Cloud-Positionierung.
