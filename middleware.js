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
  matcher: ['/admin', '/admin.html', '/report', '/report.html', '/__gate/:path*'],
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
const GATED = new Set(['/admin', '/admin.html', '/report', '/report.html']);

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

// Prüft einen Access-Token direkt bei Supabase.
async function verifyAccess(token) {
  if (!token) return false;
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
    });
    return r.ok;
  } catch {
    return false;
  }
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

  // Gültiger Access-Token -> echte Seite ausliefern.
  const access = readCookie(request, AT);
  if (await verifyAccess(access)) return next();

  // Access abgelaufen? Mit Refresh-Token erneuern und durchlassen.
  const refreshTok = readCookie(request, RT);
  if (refreshTok) {
    const fresh = await refresh(refreshTok);
    if (fresh) {
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
