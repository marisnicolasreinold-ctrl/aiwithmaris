// GET /api/download?session_id=cs_...&info=1   -> JSON { paid, files, email }
// GET /api/download?session_id=cs_...&file=de  -> liefert das gekaufte PDF aus
// Gibt Dateien nur heraus, wenn die Stripe-Session tatsächlich bezahlt ist.
// Die PDFs liegen in einem privaten Supabase-Storage-Bucket ("guides"),
// nicht im Repo — Zugriff nur serverseitig über den Service-Role-Key.

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://amrdmnnijbfwtrjcpocl.supabase.co';

const FILES = {
  de: {
    object: 'ki-leitfaden-de.pdf',
    name: 'KI-im-Mittelstand-Leitfaden-DE.pdf'
  },
  en: {
    object: 'ai-guide-en.pdf',
    name: 'AI-in-Mid-Sized-Companies-Guide-EN.pdf'
  }
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY is not configured' });
  }

  const sessionId = String(req.query.session_id || '');
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return res.status(400).json({ error: 'Invalid session id' });
  }

  let session;
  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions/' + sessionId, {
      headers: { Authorization: 'Bearer ' + key }
    });
    session = await r.json();
    if (!r.ok) {
      return res.status(404).json({ error: 'Session not found' });
    }
  } catch (err) {
    console.error('[download]', err.message);
    return res.status(502).json({ error: 'Payment provider unreachable' });
  }

  const paid = session.payment_status === 'paid';
  const files = String((session.metadata && session.metadata.files) || '')
    .split(',')
    .filter(function (f) { return FILES[f]; });

  if (req.query.info) {
    return res.status(200).json({
      paid: paid,
      files: paid ? files : [],
      email: (session.customer_details && session.customer_details.email) || null
    });
  }

  if (!paid) {
    return res.status(403).json({ error: 'Payment not completed' });
  }

  const fileKey = String(req.query.file || '');
  if (!files.includes(fileKey)) {
    return res.status(403).json({ error: 'File not part of this purchase' });
  }

  const file = FILES[fileKey];
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!sbKey) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured' });
  }

  let data;
  try {
    const fr = await fetch(SUPABASE_URL + '/storage/v1/object/guides/' + file.object, {
      headers: { Authorization: 'Bearer ' + sbKey }
    });
    if (!fr.ok) {
      console.error('[download] storage error:', fr.status);
      return res.status(500).json({ error: 'File unavailable, please contact support' });
    }
    data = Buffer.from(await fr.arrayBuffer());
  } catch (err) {
    console.error('[download] storage unreachable:', err.message);
    return res.status(502).json({ error: 'File storage unreachable, please try again' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="' + file.name + '"');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(data);
};
