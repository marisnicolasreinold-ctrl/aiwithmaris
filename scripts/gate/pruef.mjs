// Gate-Pruefung gegen einen nachgebauten Supabase. Kein echter Netzverkehr —
// die Pruefung sagt, was der Code tut, nicht was der Server gerade antwortet.
const GUELTIG = 'b'.repeat(48)          // eine bestehende Anzeigen-Sitzung
const HH_GUELTIG = 'd'.repeat(48)       // eine bestehende Haushalt-Sitzung
const PASSWORT = 'kaktus42'
const HH_PASSWORT = 'geheim-haus'
const GAESTE = [
  { user: 'anzeigen', pass: PASSWORT, area: 'anzeigen' },
  { user: 'wohnen',   pass: HH_PASSWORT, area: 'haushalt' },
  { user: 'renner',   pass: 'geheim-lsu',  area: 'lsu' },
]
let funktionsAufrufe = 0
let anmeldeAufrufe = 0

globalThis.fetch = async (url, init) => {
  const u = String(url)
  const b = init && init.body ? JSON.parse(init.body) : {}
  if (u.endsWith('/rpc/check_site_guest')) {
    const ok = GAESTE.some((g) => g.user === b.u && g.pass === b.p && g.area === b.a)
    return new Response(JSON.stringify(ok), { status: 200 })
  }
  if (u.endsWith('/rpc/anzeigen_sitzung_gueltig')) {
    return new Response(JSON.stringify(b.t === GUELTIG), { status: 200 })
  }
  if (u.endsWith('/rpc/haushalt_sitzung_gueltig')) {
    return new Response(JSON.stringify(b.t === HH_GUELTIG), { status: 200 })
  }
  if (u.endsWith('/rpc/haushalt_anmelden')) {
    anmeldeAufrufe++
    // Wie die echte Funktion: bei falschen Daten `null` mit Status 200 —
    // sie verraet nicht, ob Name oder Passwort danebenlag. Und ohne Ruecksicht
    // auf Gross- und Kleinschreibung beim Namen, genau wie check_site_guest.
    const ok = String(b.u || '').toLowerCase() === 'haushalt' && b.p === HH_PASSWORT
    return new Response(JSON.stringify(ok ? 'e'.repeat(48) : null), { status: 200 })
  }
  if (u.endsWith('/functions/v1/anzeigen')) {
    funktionsAufrufe++
    if (b.op !== 'anmelden') return new Response('{}', { status: 400 })
    if (b.passwort !== PASSWORT) return new Response('{"error":"Passwort stimmt nicht"}', { status: 401 })
    return new Response(JSON.stringify({ token: 'c'.repeat(48), wer: b.wer }), { status: 200 })
  }
  if (u.includes('/auth/v1/')) return new Response('{}', { status: 401 })
  throw new Error('unerwarteter fetch: ' + u)
}

// middleware.js importiert '@vercel/edge'. Das Paket liegt nicht im Repo (npm
// ist hier gesperrt) und waere auch das falsche: gebraucht wird ein Doppel, das
// sichtbar macht, WAS die Middleware entschieden hat — durchlassen oder
// umleiten. Also die Quelle einmal umbiegen und aus dem Zwischenspeicher laden,
// damit `node scripts/gate/pruef.mjs` ohne Vorbereitung laeuft.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const bau = mkdtempSync(join(tmpdir(), 'gate-'))
writeFileSync(join(bau, 'edge.mjs'), [
  "export const next = () => new Response('', { headers: { 'x-stub': 'next' } })",
  "export const rewrite = (ziel) =>",
  "  new Response('', { headers: { 'x-stub': 'rewrite', 'x-stub-ziel': String(ziel) } })",
  '',
].join('\n'))
writeFileSync(join(bau, 'middleware.mjs'),
  readFileSync(join(REPO, 'middleware.js'), 'utf8')
    .replace(/from '@vercel\/edge'/, "from './edge.mjs'"))

const geladen = await import(pathToFileURL(join(bau, 'middleware.mjs')).href)
const mw = geladen.default
const konfig = geladen.config
const basic = (u, p) => 'Basic ' + Buffer.from(u + ':' + p, 'utf8').toString('base64')

async function ruf(pfad, { kopf = {}, methode = 'GET', koerper } = {}) {
  const init = { method: methode, headers: kopf }
  if (koerper) { init.body = JSON.stringify(koerper); init.headers['content-type'] = 'application/json' }
  const res = await mw(new Request('https://aiwithmaris.com' + pfad, init))
  const setzt = res.headers.getSetCookie ? res.headers.getSetCookie() : []
  return {
    status: res.status,
    stub: res.headers.get('x-stub') || '',
    ziel: res.headers.get('x-stub-ziel') || '',
    realm: (res.headers.get('www-authenticate') || '').match(/realm="([^"]*)"/)?.[1] || '',
    cookies: setzt,
    text: await res.text().catch(() => ''),
  }
}

let schlecht = 0
const pruefe = (name, ist, ok, soll) => {
  if (!ok) schlecht++
  console.log((ok ? 'OK   ' : 'FEHL ') + name.padEnd(56) + String(ist).slice(0, 44) + (ok ? '' : `   (soll ${soll})`))
}

// --- Ohne alles: eigene Seite, KEIN Browser-Dialog -----------------------
{
  const r = await ruf('/anzeigen')
  pruefe('ohne Anmeldung: kein 401', r.status, r.status === 200, '200')
  pruefe('ohne Anmeldung: kein WWW-Authenticate', r.realm === '' ? '(keiner)' : r.realm, r.realm === '', 'keiner')
  // OHNE .html — vercel.json steht auf cleanUrls. Mit Endung gab es in der
  // Produktion 404; genau diese Erwartung hat den Fehler mitgetragen.
  pruefe('ohne Anmeldung: eigene Anmeldeseite', r.ziel.replace('https://aiwithmaris.com', ''),
    r.stub === 'rewrite' && /\/anzeigen-anmeldung$/.test(r.ziel), '/anzeigen-anmeldung')
  pruefe('Anmeldeseite nicht zwischengespeichert', r.stub, r.stub === 'rewrite', 'rewrite')
}

// --- Anmelden ------------------------------------------------------------
{
  const r = await ruf('/__gate/anzeigen', { methode: 'POST', koerper: { passwort: PASSWORT, wer: 'Steffi' } })
  const c = r.cookies.join(' | ')
  pruefe('richtiges Passwort -> 200', r.status, r.status === 200, '200')
  pruefe('setzt ein Sitzungscookie', /aiwm_anz=c{10}/.test(c), /aiwm_anz=c{10}/.test(c), 'aiwm_anz=<token>')
  pruefe('Cookie nur unter /anzeigen', /Path=\/anzeigen/.test(c), /Path=\/anzeigen/.test(c), 'Path=/anzeigen')
  pruefe('Cookie nur ueber HTTPS', /Secure/.test(c), /Secure/.test(c), 'Secure')
  pruefe('Cookie fuer die Seite lesbar (kein HttpOnly)', !/HttpOnly/.test(c), !/HttpOnly/.test(c), 'ohne HttpOnly')
}
{
  const r = await ruf('/__gate/anzeigen', { methode: 'POST', koerper: { passwort: 'falsch', wer: 'Maris' } })
  pruefe('falsches Passwort -> 401', r.status, r.status === 401, '401')
  pruefe('falsches Passwort setzt kein Cookie', r.cookies.length, r.cookies.length === 0, '0')
}
{
  const r = await ruf('/__gate/anzeigen', { methode: 'GET' })
  pruefe('Anmeldung nur per POST', r.status, r.status === 405, '405')
}

// --- Mit gueltiger Sitzung ----------------------------------------------
{
  const r = await ruf('/anzeigen', { kopf: { cookie: `aiwm_anz=${GUELTIG}` } })
  pruefe('gueltige Sitzung -> durch', r.stub, r.stub === 'next', 'next')
}
{
  const r = await ruf('/anzeigen', { kopf: { cookie: 'aiwm_anz=' + 'f'.repeat(48) } })
  pruefe('fremdes Token -> Anmeldeseite', r.stub, r.stub === 'rewrite', 'rewrite')
}
{
  const r = await ruf('/anzeigen', { kopf: { cookie: 'aiwm_anz=kurz' } })
  pruefe('zu kurzes Token -> Anmeldeseite', r.stub, r.stub === 'rewrite', 'rewrite')
}
{
  const vorher = funktionsAufrufe
  await ruf('/anzeigen', { kopf: { cookie: 'aiwm_anz=<script>alert(1)</script>' } })
  pruefe('unsauberes Token wird gar nicht erst gefragt', funktionsAufrufe === vorher,
    funktionsAufrufe === vorher, 'kein Aufruf')
}

// --- Basic Auth bleibt als stiller Nebenweg ------------------------------
{
  const r = await ruf('/anzeigen', { kopf: { authorization: basic('anzeigen', PASSWORT) } })
  pruefe('Passwortmanager mit Basic kommt weiterhin durch', r.stub, r.stub === 'next', 'next')
}

// --- Wohnungsplan: dieselbe eigene Anmeldeseite --------------------------
{
  const r = await ruf('/haushalt')
  pruefe('Haushalt ohne Anmeldung: kein 401', r.status, r.status === 200, '200')
  pruefe('Haushalt ohne Anmeldung: kein Browser-Dialog', r.realm === '' ? '(keiner)' : r.realm, r.realm === '', 'keiner')
  pruefe('Haushalt ohne Anmeldung: eigene Anmeldeseite', r.ziel.replace('https://aiwithmaris.com', ''),
    r.stub === 'rewrite' && /\/haushalt-anmeldung$/.test(r.ziel), '/haushalt-anmeldung')
}
{
  const r = await ruf('/__gate/haushalt', { methode: 'POST', koerper: { benutzer: 'Haushalt', passwort: HH_PASSWORT, wer: 'Steffi' } })
  const c = r.cookies.join(' | ')
  pruefe('Haushalt: richtiges Passwort -> 200', r.status, r.status === 200, '200')
  pruefe('Haushalt: setzt ein Sitzungscookie', /aiwm_hh=e{10}/.test(c), /aiwm_hh=e{10}/.test(c), 'aiwm_hh=<token>')
  pruefe('Haushalt: merkt sich, wer davorsitzt', /aiwm_hh_wer=Steffi/.test(c), /aiwm_hh_wer=Steffi/.test(c), 'aiwm_hh_wer=Steffi')
  pruefe('Haushalt: Cookie nur unter /haushalt', /Path=\/haushalt/.test(c), /Path=\/haushalt/.test(c), 'Path=/haushalt')
  pruefe('Haushalt: Cookie fuer die Seite lesbar', !/HttpOnly/.test(c), !/HttpOnly/.test(c), 'ohne HttpOnly')
  pruefe('Haushalt: Cookie nur ueber HTTPS', /Secure/.test(c), /Secure/.test(c), 'Secure')
}
{
  const r = await ruf('/__gate/haushalt', { methode: 'POST', koerper: { benutzer: 'haushalt', passwort: HH_PASSWORT, wer: 'Maris' } })
  pruefe('Haushalt: Name ohne Ruecksicht auf Grossschreibung', r.status, r.status === 200, '200')
}
{
  const r = await ruf('/__gate/haushalt', { methode: 'POST', koerper: { passwort: HH_PASSWORT, wer: 'Maris' } })
  pruefe('Haushalt: ohne Namen gilt Haushalt', r.status, r.status === 200, '200')
}
{
  const r = await ruf('/__gate/haushalt', { methode: 'POST', koerper: { benutzer: 'Haushalt', passwort: 'falsch', wer: 'Maris' } })
  pruefe('Haushalt: falsches Passwort -> 401', r.status, r.status === 401, '401')
  pruefe('Haushalt: falsches Passwort setzt kein Cookie', r.cookies.length, r.cookies.length === 0, '0')
}
{
  const r = await ruf('/__gate/haushalt', { methode: 'GET' })
  pruefe('Haushalt: Anmeldung nur per POST', r.status, r.status === 405, '405')
}
{
  const r = await ruf('/haushalt', { kopf: { cookie: `aiwm_hh=${HH_GUELTIG}` } })
  pruefe('Haushalt: gueltige Sitzung -> durch', r.stub, r.stub === 'next', 'next')
}
{
  const r = await ruf('/haushalt', { kopf: { cookie: 'aiwm_hh=' + 'f'.repeat(48) } })
  pruefe('Haushalt: fremdes Token -> Anmeldeseite', r.stub, r.stub === 'rewrite', 'rewrite')
}
{
  const vorher = anmeldeAufrufe
  await ruf('/haushalt', { kopf: { cookie: 'aiwm_hh=<script>alert(1)</script>' } })
  pruefe('Haushalt: unsauberes Token wird gar nicht erst gefragt', anmeldeAufrufe === vorher,
    anmeldeAufrufe === vorher, 'kein Aufruf')
}

// --- Gegenprobe: die Bereiche bleiben voneinander getrennt ---------------
{
  const r = await ruf('/haushalt', { kopf: { cookie: `aiwm_anz=${GUELTIG}` } })
  pruefe('Anzeigen-Sitzung oeffnet /haushalt NICHT', r.stub, r.stub === 'rewrite', 'Anmeldeseite')
}
{
  const r = await ruf('/anzeigen', { kopf: { cookie: `aiwm_hh=${HH_GUELTIG}` } })
  pruefe('Haushalt-Sitzung oeffnet /anzeigen NICHT', r.stub, r.stub === 'rewrite', 'Anmeldeseite')
}
{
  const r = await ruf('/lsu', { kopf: { cookie: `aiwm_hh=${HH_GUELTIG}` } })
  pruefe('Haushalt-Sitzung oeffnet /lsu NICHT', r.status, r.status === 401, '401')
}
{
  const r = await ruf('/lsu', { kopf: { cookie: `aiwm_anz=${GUELTIG}` } })
  pruefe('Anzeigen-Sitzung oeffnet /lsu NICHT', r.status, r.status === 401, '401')
}
{
  const r = await ruf('/haushalt', { kopf: { authorization: basic('wohnen', HH_PASSWORT) } })
  pruefe('Haushalt-Gast mit Basic kommt weiterhin durch', r.stub, r.stub === 'next', 'next')
}
{
  const r = await ruf('/anzeigen', { kopf: { authorization: basic('wohnen', HH_PASSWORT) } })
  pruefe('Haushalt-Daten oeffnen /anzeigen nicht', r.stub, r.stub === 'rewrite', 'Anmeldeseite')
}
{
  const r = await ruf('/impressum')
  pruefe('oeffentliche Seite bleibt oeffentlich', r.stub, r.stub === 'next', 'next')
}
{
  for (const seite of ['anzeigen-anmeldung', 'haushalt-anmeldung']) {
    const drin = konfig.matcher.some((m) => m.includes(seite))
    pruefe(`Anmeldeseite ${seite} ist nicht gegated`, drin ? 'im matcher' : '(nicht im matcher)',
      !drin, 'nicht im matcher')
  }
}

console.log(schlecht ? `\n${schlecht} FEHLGESCHLAGEN` : '\nalle bestanden')
process.exit(schlecht ? 1 : 0)
