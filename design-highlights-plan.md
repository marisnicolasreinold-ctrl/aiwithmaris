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

> **Stand 11.06.2026: Tag 1 + 2 umgesetzt.** Die Key-Visuals werden
> **generativ erzeugt** (`scripts/og/generate-keyvisuals.mjs`: SVG → resvg
> → sharp, gleiche Pipeline-Idee wie die OG-Bilder) — Neon-Konstellationen
> in der Marken-Farbreise, deterministisch reproduzierbar, 13–41 KB pro
> Datei. Bewusste Abweichungen: die vorhandenen fotorealistischen Bilder
> (`coach-visual`, `dev-visual`, `cloud-network`) bleiben unangetastet —
> neue Visuals füllen die Lücken (Showcase-Karten, Demo-Cover, Über-mich).
> Kein PNG-Fallback: AVIF + WebP decken alle relevanten Browser ab.

**Ziel:** Die Seite lebt aktuell fast nur von UI-Mockups und Verläufen
(`assets/` enthält ~6 Bilder). Eine einheitliche, hochwertige Bildwelt ist der
größte sichtbare Hebel Richtung „Awwwards-Look".

### Tag 1 — Stil festlegen & Bildliste produzieren
- [x] Bildstil definiert: dunkler Grund, Farbreise Cyan → Violett → Pink →
      Türkis (vgl. `motion.js` Farb-Stops), Partikel, Netz-Meshes, Glows —
      als Code-Template im Generator festgehalten.
- [x] Bildliste produziert (7 Motive, je 1600/800 px):
      - je 1 Key-Visual pro App: ATLAS (Jarvis-Kugel), APEX (Pulslinie),
        Agent-Flow (Knoten-Pipeline), DocFlow (Dokumente → Felder),
        FlowOps (Sensor-Mesh mit Alarm), PulseCRM (Pipeline-Trichter)
      - 1 Orbit-Szene für `ueber-uns.html`
- [x] Auswahlrunde: Sichtprüfung aller Motive; ATLAS und PulseCRM
      nachgeschärft (mehr Leuchtkraft, klarerer Trichter).

### Tag 2 — Technisch sauber einbauen
- [x] Export als **AVIF + WebP** nach `assets/img/`, alle Dateien weit
      unter 200 KB (13–41 KB).
- [x] Einbau mit `loading="lazy"`, `srcset`/`sizes`,
      `width`/`height`-Attributen gegen Layout-Shift.
- [x] `beispiele.html`: alle 6 Live-Demo-Cover mit App-Visuals hinterlegt
      (abgedunkelt, Button bleibt im Fokus).
- [x] `index.html`: alle 6 Showcase-Karten mit Bildkopf (Hover-Zoom);
      `ueber-uns.html` mit Orbit-Szene über den Stationen.
- [x] Sichtprüfung per Headless-Chromium-Screenshots (Startseite,
      Beispiele, Über mich).

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

> **Stand 11.06.2026: umgesetzt.** Sektion `#journey` auf der Startseite
> (zwischen Zwei-Säulen und „Lebende Firma"). Wichtig fürs nächste Mal:
> Pins müssen in **Dokument-Reihenfolge** berechnet werden — die Journey
> liegt vor dem Firma-Pin aus `firma.js`, wird aber später registriert,
> daher `refreshPriority: 1` + `ScrollTrigger.sort()` in `motion.js`.

**Ziel:** Eine gepinnte Sektion auf der Startseite, die beim Scrollen in
4 Kapiteln erzählt: **Problem → Coaching → Software → läuft in deiner Cloud.**

### Tag 1 — Storyboard, Markup, statische Stufen
- [x] Storyboard: 4 Kapitel mit Headline, 2 Sätzen, Visual und Kennzahl
      (9+ h Routine · Tag 1 · 82 % · 100 % Datenhoheit). Kapitel 1 nutzt
      das neue Motiv `kv-problem` (Fadengewirr mit pinkem Knoten),
      Kapitel 2–4 die vorhandenen fotorealistischen Bilder.
- [x] Neue Sektion in `index.html`: 4 Panels + Fortschritts-Punkte.
- [x] CSS-Basis in `style.css`: ohne JavaScript stehen die vier Schritte
      einfach untereinander (kein Pinning nötig).

### Tag 2 — Animation, Mobile, Zugänglichkeit
- [x] GSAP-Timeline in `motion.js`: Sektion gepinnt (`pin`, `scrub`),
      Panels per transform/opacity überblendet, Dots zeigen das Kapitel.
- [x] Farbreise läuft weiter über den Gesamt-Scroll (die Journey fügt
      sich ein, eigene Stops waren nicht nötig).
- [x] Mobile (< 981 px): kein Pinning, normale Abfolge mit Reveals.
- [x] `prefers-reduced-motion`: motion.js steigt früh aus → Fallback.
- [x] Übersetzungen in `i18n.js` ergänzt (DE/EN).
- [x] Verifiziert per Headless-Chromium: alle 4 Kapitel auf Desktop,
      Mobile-Fallback, Firma-Pin und Showcase-Galerie danach intakt.

**Fertig, wenn:** die Sektion auf Desktop gepinnt durchläuft, auf Mobile und
mit reduzierter Bewegung sauber degradiert und beide Sprachen abgedeckt sind. ✓

---

## Workstream 3 — KI-Agent „Frag Maris" (~4 Tage)

> **Stand 11.06.2026: live getestet und funktionsfähig — läuft kostenlos
> über Google Gemini.** Der Gemini-Key (Free Tier, AI Studio) liegt als
> Vault-Secret `google_api_key`; die Funktion nutzt Gemini 2.5 Flash
> (~250 Anfragen/Tag gratis, Tageslimit der Funktion: 240). Live-Tests
> bestanden: Preisfragen korrekt, Englisch, Off-Topic-Zurücklenkung,
> Prompt-Injection abgewehrt; Prompt nachgeschärft (duzen, Listen mit
> Gedankenstrich, nur echte Seitenpfade verlinken). Alternativ greift
> weiterhin ein `anthropic_api_key` (Claude) als Fallback.
> Hinweis Free Tier: Google darf Gratis-Anfragen zur Verbesserung nutzen —
> steht in der Datenschutzerklärung, Widget warnt vor persönlichen Daten.
> Letzter Schritt: Branch mergen, damit das Widget auf aiwithmaris.com
> erscheint (Backend ist bereits live).

**Ziel:** Die Seite führt selbst vor, was sie verkauft: ein Chat-Assistent,
der Besucher zu Leistungen, Guide und Demos berät und zur Kontaktaufnahme führt.

### Tag 1 — Backend
- [x] Supabase Edge Function `ask-maris`: Claude-API (`claude-opus-4-8`,
      max. 1024 Output-Tokens) per Streaming, SSE wird ans Widget
      durchgereicht. Key kommt zur Laufzeit per `get_app_secret` aus dem Vault.
- [x] Rate-Limiting: 20 Anfragen pro IP/Stunde + 400 pro Tag global
      (Kostendeckel), atomar über die neue RPC `chat_hit`
      (Migration `chat_rate_limits`, IP nur als gekürzter Hash, TTL ≤ 24 h).
- [x] CORS nur für aiwithmaris.com/-Varianten, Eingaben begrenzt
      (12 Nachrichten Historie, 1500 Zeichen pro Nachricht).

### Tag 2 — Wissensbasis & Verhalten
- [x] Kompakte Wissensbasis im System-Prompt: zwei Säulen, Leistungen,
      4-Phasen-Ablauf, alle 6 Live-Demos, der komplette eBook-Shop mit
      Preisen, Blog/Newsletter, Kontakt. Kein RAG nötig.
- [x] Verhaltensregeln: kurz antworten, passende Seiten verlinken,
      Off-Topic zurücklenken, keine Preise erfinden, keine Rechtsberatung,
      Prompt-Injection-Versuche ignorieren.
- [ ] Testfragen auf der Live-Seite durchgehen, sobald der Key im Vault ist
      (DE/EN, Preisfragen, Off-Topic, Injection-Versuche).

### Tag 3 — Widget-UI
- [x] `chat.js` + Styles in `style.css`: Launcher unten rechts, Panel im
      Seiten-Look, Streaming-Anzeige mit Tipp-Indikator, Vorschlags-Chips,
      Mini-Markdown (nur Links/fett, alles andere escaped — XSS-sicher).
- [x] Zweisprachig über `aiwm_lang` (gleiches Muster wie `firma.js`);
      kein Auto-Popup, öffnet nur auf Klick, Escape schließt.
- [x] Verifiziert per Headless-Chromium mit gemockter SSE-Antwort:
      Stream-Parsing, Link-Rendering, 503-/429-Fehlerfälle.

### Tag 4 — Datenschutz, Härtung, Launch
- [x] `datenschutz.html`: neuer Abschnitt „KI-Chat-Assistent" (Anthropic,
      Supabase, IP-Hash-Speicherdauer, SCC-Hinweis) + Kurzhinweis im Widget.
- [x] Token-Limit pro Antwort (1024), Tageslimit als Kostendeckel.
      Worst case bei vollem Tageslimit: grob 15–20 €/Tag mit Opus —
      günstigere Option: `MODEL` in der Function auf `claude-haiku-4-5`
      stellen (~1/5 der Kosten, für FAQ-Antworten gut genug).
- [x] Nur auf der Startseite eingebunden (`index.html`); Ausrollen auf
      alle Seiten erst nach Beobachtung.

**Fertig, wenn:** der Agent die Testfragen korrekt beantwortet, bei Off-Topic
zurücklenkt, DSGVO-Hinweise stehen und ein Kostenlimit greift.
(Alles erfüllt bis auf den Live-Test — blockiert durch den fehlenden API-Key.)

---

## Nicht in diesem Plan (bewusst)

- **Templates/Toolkits über den bestehenden Stripe-Download-Flow verkaufen** —
  geschäftlich der schnellste Gewinn (Infrastruktur existiert), aber kein
  Design-Thema. Bei Bedarf als eigener Plan ergänzen.
- **Klassische Download-Software (.exe/.dmg)** — verworfen: Signing-, Update-
  und Support-Aufwand passt nicht zur Cloud-Positionierung.
