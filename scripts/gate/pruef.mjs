// Gate-Pruefung gegen einen nachgebauten Supabase. Kein echter Netzverkehr —
// die Pruefung sagt, was der Code tut, nicht was der Server gerade antwortet.
const GUELTIG = 'b'.repeat(48)          // eine bestehende Sitzung
const PASSWORT = 'kaktus42'
const GAESTE = [
  { user: 'anzeigen', pass: PASSWORT, area: 'anzeigen' },
  { user: 'wohnen',   pass: 'geheim-haus', area: 'haushalt' },
  { user: 'renner',   pass: 'geheim-lsu',  area: 'lsu' },
]
let funktionsAufrufe = 0

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
  if (u.endsWith('/functions/v1/anzeigen')) {
    funktionsAufrufe++
    if (b.op !== 'anmelden') return new Response('{}', { status: 400 })
    if (b.passwort !== PASSWORT) return new Response('{"error":"Passwort stimmt nicht"}', { status: 401 })
    return new Response(JSON.stringify({ token: 'c'.repeat(48), wer: b.wer }), { status: 200 })
  }
  if (u.includes('/auth/v1/')) return new Response('{}', { status: 401 })
  throw new Error('unerwarteter fetch: ' + u)
}

const mw = (await import('./middleware.js')).default
const konfig = (await import('./middleware.js')).config
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

// --- Gegenprobe: die anderen Bereiche sind unberuehrt --------------------
{
  const r = await ruf('/haushalt')
  pruefe('Haushalt fragt weiterhin per Basic', r.status + '/' + r.realm, r.status === 401 && r.realm === 'Wohnungsplan', '401/Wohnungsplan')
}
{
  const r = await ruf('/haushalt', { kopf: { cookie: `aiwm_anz=${GUELTIG}` } })
  pruefe('Anzeigen-Sitzung oeffnet /haushalt NICHT', r.status, r.status === 401, '401')
}
{
  const r = await ruf('/lsu', { kopf: { cookie: `aiwm_anz=${GUELTIG}` } })
  pruefe('Anzeigen-Sitzung oeffnet /lsu NICHT', r.status, r.status === 401, '401')
}
{
  const r = await ruf('/haushalt', { kopf: { authorization: basic('wohnen', 'geheim-haus') } })
  pruefe('Haushalt-Gast kommt weiterhin durch', r.stub, r.stub === 'next', 'next')
}
{
  const r = await ruf('/anzeigen', { kopf: { authorization: basic('wohnen', 'geheim-haus') } })
  pruefe('Haushalt-Daten oeffnen /anzeigen nicht', r.stub, r.stub === 'rewrite', 'Anmeldeseite')
}
{
  const r = await ruf('/impressum')
  pruefe('oeffentliche Seite bleibt oeffentlich', r.stub, r.stub === 'next', 'next')
}
{
  pruefe('Anmeldeseite selbst ist nicht gegated', konfig.matcher.some((m) => m.includes('anzeigen-anmeldung')),
    !konfig.matcher.some((m) => m.includes('anzeigen-anmeldung')), 'nicht im matcher')
}

console.log(schlecht ? `\n${schlecht} FEHLGESCHLAGEN` : '\nalle bestanden')
process.exit(schlecht ? 1 : 0)
