# OG-Bild-Generator

Erzeugt Open-Graph-Bilder (1200×630) ohne Browser: Satori (JSX-ähnlicher
Baum → SVG) + resvg (SVG → PNG). Stil = Marken-Design aus
`remotion/src/GuidePromo.tsx` (Farben, Sora/Manrope/Space Mono).

```
cd scripts/og && npm install
node generate-og-guide.mjs   # schreibt assets/og-guide.png
```

## Fonts

Satori kann die woff2-Webfonts der Seite nicht direkt lesen (Sora und
Manrope sind Variable Fonts, deren fvar-Tabelle Satoris Parser bricht).
In `fonts/` liegen deshalb einmalig erzeugte statische TTF-Instanzen —
generiert mit fontTools aus `assets/fonts/*.woff2`:

```python
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
f = TTFont("assets/fonts/sora-800-latin.woff2")  # braucht: pip install fonttools brotli
f = instancer.instantiateVariableFont(f, {"wght": 800})
f.flavor = None
f.save("scripts/og/fonts/sora-800.ttf")
```

Lizenz der Schriften: SIL OFL (wie in `assets/fonts/fonts.css` vermerkt).

## Ideen für später

- Generator für Blog-Artikel-OG-Bilder (Titel aus `blog/posts.json`,
  gleiche Vorlage, in `generate-blog-post.mjs` einhängen).
