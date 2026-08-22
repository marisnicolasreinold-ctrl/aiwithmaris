// Nimmt das Kontaktformular entgegen.
//
// Vorher lief die Benachrichtigung über formsubmit.co, und dafür stand die
// private Adresse als Klartext in kontakt.html — mitten in einer öffentlichen
// URL (fetch('https://formsubmit.co/ajax/' + NOTIFY_EMAIL)). Das war die
// ergiebigste Einzelfundstelle der ganzen Seite: eine Adresse in einer URL
// nimmt jeder Crawler mit, ohne sie überhaupt als Adresse erkennen zu müssen.
//
// Jetzt kennt der Browser nur noch diesen Endpunkt. Zieladresse, Datenbank-
// Schlüssel und Mail-Versand liegen serverseitig.

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5; // Anfragen pro IP und Fenster
const MIN_FILL_MS = 2000; // schneller als 2 s tippt kein Mensch ein Formular aus

const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (!times.length || now - times[times.length - 1] > WINDOW_MS) hits.delete(key);
    }
  }
  return recent.length > MAX_HITS;
}

function originAllowed(origin) {
  if (!origin) return false;
  let host;
  try {
    const url = new URL(origin);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      return false;
    }
    host = url.hostname;
  } catch {
    return false;
  }
  if (host === 'aiwithmaris.com' || host === 'www.aiwithmaris.com') return true;
  if (host === 'localhost' || host === '127.0.0.1') return true;
  return host.endsWith('.vercel.app');
}

function clientIp(request) {
  const forwarded = request.headers['x-forwarded-for'] || '';
  return forwarded.split(',')[0].trim() || request.socket?.remoteAddress || 'unknown';
}

function readBody(request) {
  const body = request.body;
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

function str(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

async function notify(data) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  const from = process.env.MAIL_FROM;

  // Bewusst optional: Ohne Mail-Provider funktioniert das Formular trotzdem,
  // die Anfragen stehen dann in der Tabelle kontaktanfragen und damit im
  // bestehenden Dashboard unter /admin. Kein Provider ist Pflicht.
  if (!key || !to || !from) return;

  const lines = [
    `Name:     ${data.name}`,
    `E-Mail:   ${data.email}`,
    `Firma:    ${data.firma || '—'}`,
    `Telefon:  ${data.telefon || '—'}`,
    '',
    data.nachricht,
  ].join('\n');

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email,
        subject: `Neue Anfrage über aiwithmaris.com — ${data.firma || data.name}`,
        text: lines,
      }),
    });
  } catch (err) {
    // Die Anfrage liegt bereits in der Datenbank. Eine gescheiterte
    // Benachrichtigung darf den Absender nicht mit einem Fehler abweisen.
    console.error('contact: notify failed', err);
  }
}

module.exports = async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'method_not_allowed' });
  }

  if (!originAllowed(request.headers.origin)) {
    return response.status(403).json({ error: 'forbidden' });
  }

  if (rateLimited(clientIp(request))) {
    return response.status(429).json({ error: 'rate_limited' });
  }

  const body = readBody(request);

  // Honigtopf: Das Feld ist für Menschen unsichtbar. Wer es ausfüllt, ist ein
  // Bot. Antwort trotzdem 200 — ein ehrliches "abgelehnt" wäre die Rückmeldung,
  // aus der ein Spammer lernt, was er ändern muss.
  if (str(body.website, 200)) {
    return response.status(200).json({ ok: true });
  }

  // Gleiches Spiel mit der Zeit: Das Formular schickt mit, wann es geladen
  // wurde.
  const elapsed = Number(body.elapsed);
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < MIN_FILL_MS) {
    return response.status(200).json({ ok: true });
  }

  const data = {
    name: str(body.name, 200),
    email: str(body.email, 320),
    firma: str(body.firma, 200) || null,
    telefon: str(body.telefon, 60) || null,
    nachricht: str(body.nachricht, 5000),
    consent: body.consent === true,
  };

  if (data.name.length < 2 || data.nachricht.length < 5 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return response.status(400).json({ error: 'invalid' });
  }
  if (!data.consent) {
    return response.status(400).json({ error: 'consent_required' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || 'https://amrdmnnijbfwtrjcpocl.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
  if (!supabaseKey) {
    console.error('contact: SUPABASE_SERVICE_KEY fehlt');
    return response.status(503).json({ error: 'not_configured' });
  }

  try {
    const r = await fetch(`${supabaseUrl}/rest/v1/kontaktanfragen`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(data),
    });
    if (!r.ok) {
      console.error('contact: supabase', r.status, await r.text());
      return response.status(502).json({ error: 'store_failed' });
    }
  } catch (err) {
    console.error('contact: supabase unreachable', err);
    return response.status(502).json({ error: 'store_failed' });
  }

  await notify(data);

  return response.status(200).json({ ok: true });
};
