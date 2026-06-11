# Spiel-Demo „NOVA" — moderner Space-Shooter fürs Showcase

> **Stand: umgesetzt (auf dem Branch, noch nicht live).** Verifiziert per
> Headless-Chromium: Spielstart, Kampf, Director-Kalibrierung, Game Over +
> Neustart, Touch-Steuerung, Galerie 2×4 mit NOVA- und Kontakt-Kachel.
> Ursprünglich: Spielprinzip nach klassischem Weltraum-Shooter-Vorbild
> (Schiff in Draufsicht, Bodengeschütze, Ziel-Aufschaltung, Funk-Kommentare) —
> aber im **modernen Look der Website**: Neon-Glow, weiche Partikel,
> Glas-HUD. Kein Retro/Pixel. Wird die 7. Live-Demo in `apps/` und
> bekommt eine Kachel in der 3D-Kino-Galerie.

## Konzept

**Arbeitstitel:** NOVA — Patrouille mit KI-Wingman.
**Pitch fürs Showcase:** Nicht nur ein Spiel, sondern eine Demo für
„Software, die mitdenkt": Eine **Director-KI** misst live, wie gut du
spielst (Trefferquote, erlittener Schaden, Tempo) und regelt Gegnerwellen
und Drops dynamisch — Anfänger überleben, Profis schwitzen. Ein
**KI-Copilot** kommentiert das Geschehen in einem Holo-Comms-Feed
(„Schilde bei 30 % — links ausweichen!"), passend zur Spiellage —
gleiche Optik wie das ATLAS-Briefing.

## Gameplay (Kern)

- Draufsicht, frei steuerbares Schiff über endlos scrollendem Weltraum
  mit Parallax-Sternenfeld (3 Ebenen), Nebel-Schwaden und leuchtenden
  Energie-Inseln/Stationen statt Retro-Landmasse.
- Gegner: Geschütz-Plattformen auf den Stationen (drehen sich zum
  Spieler, Plasma-Projektile), Drohnen-Schwärme in Wellen, am Ende ein
  Boss mit Phasen.
- **Ziel-Aufschaltung**: animiertes Holo-Reticle (rotierender Ring im
  Stil der Seite) rastet auf den nächsten Gegner ein, Schüsse ziehen
  leicht mit (Aim-Assist).
- 3 Wellen + Boss, Punkte, Schild statt Leben (regeneriert langsam),
  Game Over + Neustart, Highscore im localStorage.
- Steuerung: WASD/Pfeiltasten + Leertaste (Dauerfeuer-Toggle);
  Mobile: virtueller Stick links, Feuer-Button rechts.

## Look & Sound — modern, kein Retro

- **Voll aufgelöstes Canvas** (devicePixelRatio-scharf), Vektor-Shapes
  mit weichen Kanten statt Pixel-Sprites.
- **Neon-Glow überall**: additives Compositing (`lighter`) + Shadow-Blur
  für Triebwerke, Projektile und Explosionen; Partikel mit Motion-Trails
  (Nachzieh-Effekt über halbtransparentes Clearing).
- Farbwelt der Marke: tiefdunkles Blau, Cyan-Triebwerke und Spielerschüsse,
  Violett-Stationen, Pink-Plasma der Gegner — die Farbreise der Seite.
- **Glas-HUD** im Holo-Panel-Stil der Website: Schild als leuchtender
  Bogen ums Schiff + Balken oben, Score mit Mono-Font, Wellen-Anzeige;
  dezente Vignette, leichter Screen-Shake bei Treffern (entfällt bei
  `prefers-reduced-motion`).
- Sound komplett im Code per WebAudio erzeugt (lizenzfrei, gleiche
  Philosophie wie der Intro-Soundtrack aus `make-music.mjs`) — aber
  modern statt 8-Bit: weicher Synth-Ambient-Loop, satte gefilterte
  Laser, tiefe Sub-Bass-Explosionen, sanfter Schild-Alarm.
  Standard aus, Ton-Button wie bei den Videos.

## Technik

- **Eine Datei `apps/nova.html`** im Stil der anderen Demos: Canvas 2D,
  Vanilla JS, kein Framework, keine Assets von außen (alle Formen als
  gezeichnete Pfade mit Glow — kein Asset-Download nötig). Glow-lastige
  Elemente werden auf Offscreen-Canvases vorgerendert, damit die 60 fps
  auch mobil halten.
- Game-Loop mit `requestAnimationFrame` + fester Simulationsrate,
  Objekt-Pools für Projektile/Partikel (stabil 60 fps, auch mobil).
- Pause bei Tab-Wechsel; `prefers-reduced-motion`: weniger Partikel,
  kein Screen-Shake.
- Director-KI & Copilot laufen **komplett im Browser** (Heuristik-Regeln,
  kuratierte Kommentare je Spiellage) — kein API-Call, keine Kosten.
  Optional später (Stufe 2): Copilot-Kommentare live von Gemini über die
  bestehende `ask-maris`-Infrastruktur generieren lassen.

## Einbau in die Seite

- Neue Kachel in der 3D-Kino-Galerie: Galerie von 2×3 auf **2×4 erweitern**
  (Spaltenwinkel von 36° auf ~28° verringern, damit der Halbkreis passt);
  der 8. Platz bekommt eine „Dein Projekt hier?"-Kachel mit Link auf
  /kontakt.
- Neues Key-Visual `kv-nova` über den bestehenden Generator
  (`scripts/og/generate-keyvisuals.mjs`): Schiff-Silhouette mit
  Cyan-Triebwerks-Glow über Sternenfeld und violetter Station —
  passt nahtlos zu den anderen Galerie-Kacheln.
- i18n: DE/EN für Kacheltext, HUD-Begriffe und Funksprüche.
- Hinweis im Spiel: „Demo von AI with Maris — so etwas baue ich auch
  für deinen Anwendungsfall" + Link.

## Tagesplan (~2 Tage)

### Tag 1 — Spielbarer Kern
- [x] Canvas-Setup (dpr-scharf), Glow-Rendering mit Offscreen-Caches,
      Parallax-Sternenfeld + Nebel + Stationen-Generator
- [x] Schiff: Steuerung (Tastatur), Triebwerks-Glow mit Trail,
      Schild-Bogen + Glas-HUD
- [x] Schießen + Objekt-Pools, Geschütz-Plattformen + Drohnen mit
      einfachem Verhalten, Glow-Explosionen mit Partikeln, Punkte
- [x] Ziel-Aufschaltung (Holo-Reticle + Aim-Assist)

### Tag 2 — Spielgefühl & Einbau
- [x] 3 Wellen + Boss mit Phasen, Game Over/Restart, Highscore
- [x] Director-KI (Schwierigkeit) + Copilot-Comms-Feed mit
      Typewriter-Effekt
- [x] WebAudio-Sounds (moderner Synth) + Ton-Button
- [x] Mobile-Steuerung (Touch-Stick + Feuer-Button)
- [x] Galerie auf 2×4, `kv-nova`-Visual, i18n, Verifikation per
      Headless-Chromium (Desktop + Mobile, Steuerung, Game Over-Flow)

**Fertig, wenn:** das Spiel auf Desktop und Handy flüssig läuft, die
Schwierigkeit sich spürbar anpasst, der Copilot zur Spiellage kommentiert
und die Galerie-Kachel die Demo öffnet.
