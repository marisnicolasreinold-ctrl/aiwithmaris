// Edge Middleware: öffentliche Info-Seite, nur die internen Dashboards
// (admin.html, report.html) liegen hinter einem Login.
// Alle Info-Seiten sind ohne Anmeldung erreichbar. Login läuft weiterhin
// über den bestehenden Supabase-Auth-Account (wie admin.html): nach dem
// Login werden Access- und Refresh-Token in HttpOnly-Cookies gehalten und
// pro Request direkt gegen Supabase verifiziert (mit automatischem Refresh).
// Es wird KEIN eigenes Secret benötigt.
import { next, rewrite } from '@vercel/edge';

export const config = {
  // Middleware läuft nur noch auf den gegateten Pfaden und den Login-
  // Endpoints — alle öffentlichen Info-Seiten werden gar nicht erst
  // abgefangen (schneller, kein Supabase-Call pro Seitenaufruf).
  matcher: ['/admin', '/admin.html', '/report', '/report.html', '/lsu', '/lsu/', '/__gate/:path*'],
};

const SUPABASE_URL = 'https://amrdmnnijbfwtrjcpocl.supabase.co';
// Öffentlicher anon-Key (kein Geheimnis — steht bereits in admin.html).
const SUPABASE_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtcmRtbm5pamJmd3RyamNwb2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTU0OTcsImV4cCI6MjA5NjQzMTQ5N30.y-9eLzeQKDlHzSG3_ro-ThAnnpnAEKLTWS8NMrpSXCI';

const AT = 'aiwm_at'; // Supabase access token
const RT = 'aiwm_rt'; // Supabase refresh token
const MAXAGE = 60 * 60 * 24 * 30; // 30 Tage (Refresh hält die Session frisch)

// Nur diese Pfade liegen hinter dem Login: die internen Dashboards.
// Wegen cleanUrls können sowohl die saubere als auch die .html-Form
// die Middleware treffen — beide Formen aufführen.
//
// /lsu ist das Backyard-Live-Dashboard (Last Soul Ultra). Gegated wird nur die
// Einstiegsseite, nicht /lsu/assets/* — sonst liefe pro Datei ein Supabase-Call,
// und ohne die Seite ist das Bundle allein nutzlos. Genau wie bei admin.html.
const GATED = new Set(['/admin', '/admin.html', '/report', '/report.html', '/lsu', '/lsu/']);

function isGated(path) {
  return GATED.has(path);
}

function readCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
  }
  return '';
}

function cookie(name, value, maxAge) {
  return `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

function clear(name) {
  return `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

// Nicht-HttpOnly Flag-Cookie: nur ein UI-Hinweis ("eingeloggt"), damit das
// Frontend den Logout-Button zeigen kann. Enthält kein Geheimnis.
function flag(maxAge) {
  return `aiwm_in=1; Path=/; Max-Age=${maxAge}; Secure; SameSite=Lax`;
}
function clearFlag() {
  return `aiwm_in=; Path=/; Max-Age=0; Secure; SameSite=Lax`;
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

// Prüft einen Access-Token direkt bei Supabase und liefert den Nutzer,
// weil für die Rechte nicht nur zählt OB jemand angemeldet ist, sondern WER.
async function verifyAccess(token) {
  if (!token) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

// Welcher Bereich hinter einem Pfad steckt.
function areaOf(path) {
  if (path === '/lsu' || path === '/lsu/') return 'lsu';
  if (path === '/report' || path === '/report.html') return 'report';
  return 'admin';
}

// Darf dieser Nutzer diesen Bereich sehen?
//
// Die Rechte stehen in app_metadata.access des Supabase-Kontos, z. B.
// ["lsu"] für einen Zugang, der nur das Renn-Dashboard sehen soll.
//
// Fehlt das Feld, gilt Vollzugriff. Das ist bewusst so herum: Der Eigentümer-
// Account hat keine Metadaten, und eine Umkehrung würde ihn bei einem Fehler
// aus seiner eigenen Seite aussperren. Wer künftig einen eingeschränkten
// Zugang anlegt, muss access also setzen — sonst darf er alles.
function mayAccess(user, area) {
  const access = user && user.app_metadata && user.app_metadata.access;
  if (!Array.isArray(access)) return true;
  return access.indexOf(area) !== -1;
}

// Tauscht einen Refresh-Token gegen ein frisches Token-Paar.
async function refresh(refreshToken) {
  if (!refreshToken) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON, 'content-type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    if (!data || !data.access_token) return null;
    return { access_token: data.access_token, refresh_token: data.refresh_token || refreshToken };
  } catch {
    return null;
  }
}


// ── Gastzugang fuer das Renn-Dashboard ────────────────────────────────
// /lsu bekommt einen zweiten, einfacheren Weg hinein: ein geteilter
// Benutzername mit Passwort, per HTTP Basic. Supabase-Auth waere hier das
// falsche Werkzeug — es identifiziert ueber E-Mail-Adressen, und fuer einen
// Gast ohne Postfach bliebe davon nur eine verkleidete Kennung uebrig, dafuer
// mit Bestaetigungsmail und einem Passwort-Reset, der ins Leere laeuft.
//
// Die Zugangsdaten stehen in den Projekt-Variablen LSU_USER und LSU_PASSWORD,
// niemals im Repo — das hier ist oeffentlich. Fehlt eine der beiden, ist der
// Gastzugang schlicht aus und es bleibt beim Supabase-Login.

// Zeichenweiser Vergleich ohne fruehen Abbruch, damit die Laufzeit nichts
// ueber einen falschen Versuch verraet.
function safeEqual(a, b) {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

// Zerlegt einen Basic-Header in Name und Passwort.
function readBasic(request) {
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Basic ')) return null;
  let decoded;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return null;
  }
  const sep = decoded.indexOf(':');
  if (sep < 0) return null;
  return { user: decoded.slice(0, sep), pass: decoded.slice(sep + 1) };
}

async function guestOk(request, area) {
  const creds = readBasic(request);
  if (!creds) return false;

  // Variante 1: Zugangsdaten stehen in den Projekt-Variablen.
  const envUser = process.env.LSU_USER;
  const envPass = process.env.LSU_PASSWORD;
  if (envUser && envPass) {
    return safeEqual(creds.user, envUser) && safeEqual(creds.pass, envPass);
  }

  // Variante 2: Prüfung in der Datenbank. Der bcrypt-Hash liegt in einem
  // Schema, das PostgREST nicht ausliefert; der öffentliche anon-Key darf nur
  // die Funktion aufrufen, nie die Tabelle lesen.
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_site_guest`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ u: creds.user, p: creds.pass, a: area }),
    });
    if (!r.ok) return false;
    return (await r.json()) === true;
  } catch {
    return false;
  }
}

function askForGuestLogin() {
  return new Response('Zugang nur mit Anmeldung.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Last Soul Ultra", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  });
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Login-Endpoint: Supabase-Session prüfen -> Token-Cookies setzen.
  if (path === '/__gate/enter') {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }
    let access = '', refreshTok = '';
    try {
      const body = await request.json();
      access = body.access_token || '';
      refreshTok = body.refresh_token || '';
    } catch {
      /* ignore */
    }
    if (!access) return json({ ok: false }, 400);
    if (!(await verifyAccess(access))) return json({ ok: false }, 401);
    // Rechte werden erst beim Seitenaufruf geprüft, nicht hier: ein gültiges
    // Konto darf sich anmelden, sieht danach aber nur seine Bereiche.

    const res = json({ ok: true }, 200);
    res.headers.append('Set-Cookie', cookie(AT, access, MAXAGE));
    if (refreshTok) res.headers.append('Set-Cookie', cookie(RT, refreshTok, MAXAGE));
    res.headers.append('Set-Cookie', flag(MAXAGE));
    return res;
  }

  // Logout: Token-Cookies löschen -> zurück zur Baustelle.
  if (path === '/__gate/leave') {
    const res = rewrite(new URL('/coming-soon', request.url));
    res.headers.append('Set-Cookie', clear(AT));
    res.headers.append('Set-Cookie', clear(RT));
    res.headers.append('Set-Cookie', clearFlag());
    return res;
  }

  // Alles außer den gegateten Dashboards ist öffentlich.
  if (!isGated(path)) return next();

  const area = areaOf(path);

  // Gültiger Access-Token -> ausliefern, sofern der Bereich freigegeben ist.
  const access = readCookie(request, AT);
  const user = await verifyAccess(access);
  if (user) {
    if (mayAccess(user, area)) return next();
    // Angemeldet, aber nicht für diesen Bereich: nichts verraten.
    return rewrite(new URL('/coming-soon', request.url));
  }

  // Kein Supabase-Konto? Für das Dashboard genügt der Gastzugang.
  if (area === 'lsu') {
    return (await guestOk(request, area)) ? next() : askForGuestLogin();
  }

  // Access abgelaufen? Mit Refresh-Token erneuern und durchlassen.
  const refreshTok = readCookie(request, RT);
  if (refreshTok) {
    const fresh = await refresh(refreshTok);
    if (fresh) {
      const refreshed = await verifyAccess(fresh.access_token);
      if (refreshed && !mayAccess(refreshed, area)) {
        return rewrite(new URL('/coming-soon', request.url));
      }
      const res = next();
      res.headers.append('Set-Cookie', cookie(AT, fresh.access_token, MAXAGE));
      res.headers.append('Set-Cookie', cookie(RT, fresh.refresh_token, MAXAGE));
      res.headers.append('Set-Cookie', flag(MAXAGE));
      return res;
    }
  }

  // Sonst: Baustelle zeigen (Inhalt bleibt verborgen).
  return rewrite(new URL('/coming-soon', request.url));
}
