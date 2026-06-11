# Spiel-Demo „NOVA" — Retro-Space-Shooter fürs Showcase

> **Stand: geplant.** Vorbild: klassischer 16-Bit-Weltraum-Shooter
> (Referenzfotos: Schiff über Sternenfeld + grünen Inseln, Bodengeschütze,
> Ziel-Aufschaltung, Funkspruch-Box unten). Wird die 7. Live-Demo in
> `apps/` und bekommt eine Kachel in der 3D-Kino-Galerie.

## Konzept

**Arbeitstitel:** NOVA — Patrouille mit KI-Wingman.
**Pitch fürs Showcase:** Nicht nur ein Spiel, sondern eine Demo für
„Software, die mitdenkt": Eine **Director-KI** misst live, wie gut du
spielst (Trefferquote, erlittener Schaden, Tempo) und regelt Gegnerwellen
und Drops dynamisch — Anfänger überleben, Profis schwitzen. Ein
**KI-Funker** kommentiert das Geschehen in der Retro-Textbox unten
(„Schilde bei 30 % — links ausweichen!"), passend zur Spiellage.

## Gameplay (Kern)

- Draufsicht, frei steuerbares Schiff über endlos scrollendem Weltraum
  mit Parallax-Sternenfeld (2–3 Ebenen) und grünen Insel-Formationen.
- Gegner: Bodengeschütze auf den Inseln (drehen sich zum Spieler,
  Projektile), fliegende Drohnen in Wellen, am Ende ein Boss.
- **Ziel-Aufschaltung** wie auf den Fotos: grünes Reticle rastet auf den
  nächsten Gegner ein, Schüsse ziehen leicht mit (Aim-Assist).
- 3 Wellen + Boss, Punkte, Schild statt Leben (regeneriert langsam),
  Game Over + Neustart, Highscore im localStorage.
- Steuerung: WASD/Pfeiltasten + Leertaste (Dauerfeuer-Toggle);
  Mobile: virtueller Stick links, Feuer-Button rechts.

## Look & Sound

- Bewusst Retro: niedrig aufgelöstes Canvas (z. B. 480×270), hochskaliert
  mit `image-rendering: pixelated`, dezente CRT-Scanlines als Overlay.
- Farbwelt der Marke: dunkles Blau, Cyan-Triebwerke, grüne Inseln,
  pinke Gegner-Projektile (Farbreise der Seite).
- Sound komplett im Code per WebAudio erzeugt (lizenzfrei, gleiche
  Philosophie wie der Intro-Soundtrack aus `make-music.mjs`):
  Laser-Pew, Treffer-Crunch, Schild-Warnton, kurzer Boss-Jingle.
  Standard aus, Ton-Button wie bei den Videos.

## Technik

- **Eine Datei `apps/nova.html`** im Stil der anderen Demos: Canvas 2D,
  Vanilla JS, kein Framework, keine Assets von außen (Sprites als
  gezeichnete Pfade/Offscreen-Canvas — kein Asset-Download nötig).
- Game-Loop mit `requestAnimationFrame` + fester Simulationsrate,
  Objekt-Pools für Projektile/Partikel (stabil 60 fps, auch mobil).
- Pause bei Tab-Wechsel; `prefers-reduced-motion`: weniger Partikel,
  kein Screen-Shake.
- Director-KI & Funker laufen **komplett im Browser** (Heuristik-Regeln,
  kuratierte Funksprüche je Spiellage) — kein API-Call, keine Kosten.
  Optional später (Stufe 2): Funker-Sprüche live von Gemini über die
  bestehende `ask-maris`-Infrastruktur generieren lassen.

## Einbau in die Seite

- Neue Kachel in der 3D-Kino-Galerie: Galerie von 2×3 auf **2×4 erweitern**
  (Spaltenwinkel von 36° auf ~28° verringern, damit der Halbkreis passt);
  der 8. Platz bekommt eine „Dein Projekt hier?"-Kachel mit Link auf
  /kontakt.
- Neues Key-Visual `kv-nova` über den bestehenden Generator
  (`scripts/og/generate-keyvisuals.mjs`): Schiff-Silhouette mit
  Cyan-Triebwerk über Sternenfeld und grüner Insel.
- i18n: DE/EN für Kacheltext, HUD-Begriffe und Funksprüche.
- Hinweis im Spiel: „Demo von AI with Maris — so etwas baue ich auch
  für deinen Anwendungsfall" + Link.

## Tagesplan (~2 Tage)

### Tag 1 — Spielbarer Kern
- [ ] Canvas-Setup, Pixel-Look, Parallax-Sternenfeld + Insel-Generator
- [ ] Schiff: Steuerung (Tastatur), Triebwerks-Partikel, Schild-HUD
- [ ] Schießen + Objekt-Pools, Bodengeschütze + Drohnen mit einfachem
      Verhalten, Treffer/Explosionen, Punkte
- [ ] Ziel-Aufschaltung (Reticle + Aim-Assist)

### Tag 2 — Spielgefühl & Einbau
- [ ] 3 Wellen + Boss, Game Over/Restart, Highscore
- [ ] Director-KI (Schwierigkeit) + Funker-Textbox mit Typewriter-Effekt
- [ ] WebAudio-Sounds + Ton-Button
- [ ] Mobile-Steuerung (Touch-Stick + Feuer-Button)
- [ ] Galerie auf 2×4, `kv-nova`-Visual, i18n, Verifikation per
      Headless-Chromium (Desktop + Mobile, Steuerung, Game Over-Flow)

**Fertig, wenn:** das Spiel auf Desktop und Handy flüssig läuft, die
Schwierigkeit sich spürbar anpasst, der Funker zur Spiellage kommentiert
und die Galerie-Kachel die Demo öffnet.
