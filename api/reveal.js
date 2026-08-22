// Gibt die Kontaktadresse heraus — und zwar erst dann, wenn jemand auf der
// Seite wirklich darauf geklickt hat.
//
// Der Sinn der Übung: Die Adresse steht in keinem ausgelieferten Byte. Nicht im
// HTML, nicht im JavaScript, nicht im Repo. Sie lebt ausschließlich in der
// Projekt-Variable CONTACT_EMAIL. Wer die Seite bloß ausliest — ein Harvester,
// ein Crawler, ein KI-Agent, der den Quelltext einsammelt — findet schlicht
// nichts zum Abgreifen.
//
// Was das NICHT leistet: Ein Agent, der einen echten Browser steuert und den
// Button tatsächlich anklickt, bekommt die Adresse. Dagegen hilft keine
// Verschleierung, sondern nur, dass die veröffentlichte Adresse wegwerfbar ist.

// Der Endpunkt hat einen Node-Handler statt eines Web-Handlers, weil die
// package.json bewusst kein "type": "module" setzt (middleware.js wird von
// Vercel getrennt gebündelt). CommonJS ist hier die reibungsloseste Variante.

const WINDOW_MS = 10 * 60 * 1000; // 10 Minuten
const MAX_HITS = 20; // pro IP und Fenster — großzügig, weil sich hinter
// einem Firmen-Anschluss viele Leute eine IP teilen und der Endpunkt ohnehin
// immer nur dieselbe eine Adresse herausgibt. Das Limit deckelt Missbrauch,
// es ist nicht der eigentliche Schutz.

// Absichtlich nur im Arbeitsspeicher: Das Limit überlebt keinen Kaltstart und
// gilt pro Instanz. Es soll auch nur den stumpfen Abruf in der Schleife
// ausbremsen — für mehr wäre ein geteilter Speicher nötig, und den holt man
// sich für eine E-Mail-Adresse nicht ins Haus.
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Verhindert, dass die Map über die Lebenszeit der Instanz vollläuft.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (!times.length || now - times[times.length - 1] > WINDOW_MS) hits.delete(key);
    }
  }

  return recent.length > MAX_HITS;
}

// Erlaubt sind die eigene Domain, Vercel-Preview-Deployments und die lokale
// Entwicklung. Ein Aufruf per curl ohne Origin fällt damit durch — der Header
// wird vom Browser bei POST immer gesetzt.
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

module.exports = function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Robots-Tag', 'noindex, nofollow, noai');

  // GET liefert bewusst nichts: Was ein Crawler ohne Zutun abrufen kann, ist
  // kein Schutz mehr.
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'method_not_allowed' });
  }

  if (!originAllowed(request.headers.origin)) {
    return response.status(403).json({ error: 'forbidden' });
  }

  // Zweites Signal aus dem Browser. Fehlt der Header (ältere Browser), lassen
  // wir durch — steht er auf etwas anderem als same-origin, kam der Aufruf
  // nicht von unserer Seite.
  const site = request.headers['sec-fetch-site'];
  if (site && site !== 'same-origin') {
    return response.status(403).json({ error: 'forbidden' });
  }

  if (rateLimited(clientIp(request))) {
    return response.status(429).json({ error: 'rate_limited' });
  }

  const mail = process.env.CONTACT_EMAIL;
  if (!mail) {
    // Nicht konfiguriert. Das Frontend fällt dann auf das Kontaktformular
    // zurück, statt einen toten Klick zu hinterlassen.
    return response.status(503).json({ error: 'not_configured' });
  }

  return response.status(200).json({ mail });
};
