// Edge Middleware: stellt die echte Seite hinter einen Login.
// Nicht eingeloggte Besucher sehen nur die Coming-Soon-Baustelle.
// Login läuft über den bestehenden Supabase-Auth-Account (wie admin.html);
// nach erfolgreicher Verifikation setzen wir ein eigenes, signiertes Cookie.
import { next, rewrite } from '@vercel/edge';

export const config = {
  // Middleware läuft auf allen Routen AUSSER statischen Assets
  // (Styles/Skripte/Bilder/Fonts bleiben öffentlich erreichbar — nötig u. a.
  // für Impressum/Datenschutz; gegated wird nur der HTML-Inhalt der Seiten).
  matcher: [
    '/((?!assets/|vendor/|favicon|robots.txt|sitemap.xml|.*\\.(?:css|js|mjs|png|jpg|jpeg|svg|webp|avif|gif|ico|mp4|webmanifest|woff2?|ttf|map)$).*)',
  ],
};

const SUPABASE_URL = 'https://amrdmnnijbfwtrjcpocl.supabase.co';
// Öffentlicher anon-Key (kein Geheimnis — steht bereits in admin.html).
const SUPABASE_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtcmRtbm5pamJmd3RyamNwb2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTU0OTcsImV4cCI6MjA5NjQzMTQ5N30.y-9eLzeQKDlHzSG3_ro-ThAnnpnAEKLTWS8NMrpSXCI';

const COOKIE = 'aiwm_gate';
const TTL = 60 * 60 * 24 * 7; // 7 Tage

// Immer öffentlich, auch ohne Login. (Nur die Baustellen-Seite selbst —
// alles andere, inkl. Impressum/Datenschutz, ist hinter dem Login.)
const PUBLIC = new Set([
  '/coming-soon.html',
]);

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(str) {
  const norm = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(norm);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return b64url(new Uint8Array(sig));
}

async function signToken(secret, exp) {
  const payload = b64url(enc.encode(JSON.stringify({ exp })));
  const sig = await hmac(secret, payload);
  return `${payload}.${sig}`;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyToken(secret, token) {
  if (!secret || !token) return false;
  const dot = token.lastIndexOf('.');
  if (dot < 1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmac(secret, payload);
  if (!timingSafeEqual(sig, expected)) return false;
  try {
    const { exp } = JSON.parse(dec.decode(fromB64url(payload)));
    return typeof exp === 'number' && exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
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

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const secret = process.env.GATE_SECRET || '';

  // Login-Endpoint: Supabase-Token prüfen -> signiertes Cookie setzen.
  if (path === '/__gate/enter') {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }
    if (!secret) return json({ ok: false, error: 'gate_unconfigured' }, 500);

    let token = '';
    try {
      token = (await request.json()).access_token || '';
    } catch {
      /* ignore */
    }
    if (!token) return json({ ok: false }, 400);

    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return json({ ok: false }, 401);

    const value = await signToken(secret, Math.floor(Date.now() / 1000) + TTL);
    const res = json({ ok: true }, 200);
    res.headers.append(
      'Set-Cookie',
      `${COOKIE}=${value}; Path=/; Max-Age=${TTL}; HttpOnly; Secure; SameSite=Lax`,
    );
    return res;
  }

  // Logout: Cookie löschen -> zurück zur Baustelle.
  if (path === '/__gate/leave') {
    const res = rewrite(new URL('/coming-soon.html', request.url));
    res.headers.append(
      'Set-Cookie',
      `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
    );
    return res;
  }

  // Immer öffentliche Seiten.
  if (PUBLIC.has(path)) return next();

  // Gültiges Cookie -> echte Seite ausliefern.
  const cookie = readCookie(request, COOKIE);
  if (await verifyToken(secret, cookie)) return next();

  // Sonst: Baustelle zeigen (Inhalt bleibt verborgen).
  return rewrite(new URL('/coming-soon.html', request.url));
}
