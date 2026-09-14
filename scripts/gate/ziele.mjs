// Der 404 in der Produktion kam daher, dass die Middleware auf einen Pfad
// umleitete, den es unter `cleanUrls` nicht gibt. Der Gate-Pruefstand stubbt
// rewrite() und vergleicht nur die Zeichenkette — er kann das prinzipiell
// nicht sehen. Diese Pruefung loest jedes Ziel gegen vercel.json und die
// tatsaechlich vorhandenen Dateien auf.
import { readFileSync, existsSync } from 'node:fs'

const REPO = '/home/user/aiwithmaris'
const konfig = JSON.parse(readFileSync(`${REPO}/vercel.json`, 'utf8'))
const cleanUrls = konfig.cleanUrls === true
const quelle = readFileSync(`${REPO}/middleware.js`, 'utf8')

// Alle Ziele einsammeln, die die Middleware ausliefern laesst.
const ziele = [...quelle.matchAll(/rewrite\(new URL\('([^']+)'/g)].map((m) => m[1])
console.log('gefundene Umleitungsziele:', ziele.join(', ') || '(keine)')

let schlecht = 0
const pruefe = (name, ok, hinweis) => {
  if (!ok) schlecht++
  console.log((ok ? 'OK   ' : 'FEHL ') + name + (ok ? '' : '   << ' + hinweis))
}

for (const ziel of ziele) {
  const rein = ziel.replace(/^\//, '').replace(/\/$/, '')

  if (cleanUrls && ziel.endsWith('.html')) {
    pruefe(`${ziel} — Endung unter cleanUrls`, false,
      `cleanUrls ist an: der .html-Pfad liefert 404. Ziel muss "${ziel.replace(/\.html$/, '')}" heissen.`)
    continue
  }
  pruefe(`${ziel} — keine .html-Endung`, true)

  // Wird unter diesem Pfad wirklich etwas ausgeliefert?
  const kandidaten = [`${REPO}/${rein}.html`, `${REPO}/${rein}/index.html`, `${REPO}/${rein}`]
  const treffer = kandidaten.find((k) => existsSync(k))
  pruefe(`${ziel} — es gibt eine Datei dafuer`, !!treffer,
    `keine von: ${kandidaten.map((k) => k.replace(REPO + '/', '')).join(', ')}`)

  // Und faengt die Middleware dieses Ziel nicht selbst wieder ab? Das waere
  // eine Schleife.
  const matcher = quelle.match(/matcher:\s*\[([^\]]*)\]/)[1]
  const gefangen = matcher.includes(`'${ziel}'`)
  pruefe(`${ziel} — laeuft nicht in die eigene Middleware`, !gefangen,
    'Ziel steht im matcher: die Umleitung wuerde sich selbst wieder abfangen')
}

// Gegenprobe: wuerde die Pruefung den echten Fehler von vorhin fangen?
{
  const kaputt = quelle.replace("'/anzeigen-anmeldung'", "'/anzeigen-anmeldung.html'")
  const z = [...kaputt.matchAll(/rewrite\(new URL\('([^']+)'/g)].map((m) => m[1])
  const faengt = cleanUrls && z.some((x) => x.endsWith('.html'))
  pruefe('Gegenprobe: der echte Fehler waere aufgefallen', faengt,
    'die Pruefung haette den 404 nicht bemerkt')
}

console.log(schlecht ? `\n${schlecht} FEHLGESCHLAGEN` : '\nalle bestanden')
process.exit(schlecht ? 1 : 0)
