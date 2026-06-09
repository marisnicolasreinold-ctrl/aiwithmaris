# AI with Maris — Brand-Intro (Remotion)

Ein ~14 Sekunden langes Intro-Video im Look der Website (dunkel, Cyan/Violett-Glow,
rotierender Orb, animierter Wortmarken- und Tagline-Reveal). Programmatisch in React/Remotion.

## Befehle

```bash
cd remotion
npm install

# Live im Browser ansehen & bearbeiten (Remotion Studio):
npm run studio

# Video rendern -> remotion/out/intro.mp4
npm run render

# Direkt in die Website rendern -> ../assets/intro.mp4 (wird auf der Seite eingebunden)
npm run render-web

# Standbild als Poster -> ../assets/intro-poster.png
npm run poster
```

## Dateien
- `src/Root.tsx` — Composition (1920×1080, 30 fps, 420 Frames)
- `src/Intro.tsx` — die Animation (Szenen: Orb-Boot → Wortmarke → Tagline → Säulen → CTA)

Die gerenderte `assets/intro.mp4` wird auf der Startseite über einen „Intro ansehen"-Button
in einem Overlay abgespielt.
