// POST /api/checkout  { product: "de" | "en" | "bundle", lang: "de" | "en" }
// Erstellt eine Stripe-Checkout-Session und liefert { url } zurück.
// Benötigt die Umgebungsvariable STRIPE_SECRET_KEY (in Vercel setzen, NIE committen).

const PRODUCTS = {
  de: {
    price: process.env.STRIPE_PRICE_DE || 'price_1Tgf7lAPD9ukdtqRQUhRNXUc',
    files: 'de'
  },
  en: {
    price: process.env.STRIPE_PRICE_EN || 'price_1Tgf7mAPD9ukdtqRkoLBzXTx',
    files: 'en'
  },
  bundle: {
    price: process.env.STRIPE_PRICE_BUNDLE || 'price_1Tgf7mAPD9ukdtqRSf0s9cTO',
    files: 'de,en'
  }
};

const WAIVER = {
  de: 'Digitales Produkt: Mit dem Kauf verlangst du die sofortige Bereitstellung des Downloads und bestätigst, dass dein Widerrufsrecht damit erlischt. Eine Rückgabe oder Erstattung ist ausgeschlossen.',
  en: 'Digital product: by purchasing you request immediate delivery of the download and acknowledge that your right of withdrawal expires. Returns and refunds are not possible.'
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY is not configured' });
  }

  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  const product = PRODUCTS[body.product];
  const lang = body.lang === 'en' ? 'en' : 'de';
  if (!product) {
    return res.status(400).json({ error: 'Unknown product' });
  }

  const origin = 'https://' + (req.headers['x-forwarded-host'] || req.headers.host);

  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('line_items[0][price]', product.price);
  params.append('line_items[0][quantity]', '1');
  params.append('locale', lang);
  params.append('success_url', origin + '/danke?session_id={CHECKOUT_SESSION_ID}');
  params.append('cancel_url', origin + '/guide#kaufen');
  params.append('metadata[files]', product.files);
  params.append('invoice_creation[enabled]', 'true');
  params.append('custom_text[submit][message]', WAIVER[lang]);

  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });
    const session = await r.json();
    if (!r.ok) {
      console.error('[checkout] Stripe error:', session.error && session.error.message);
      return res.status(502).json({ error: 'Payment provider error' });
    }
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[checkout]', err.message);
    return res.status(502).json({ error: 'Payment provider unreachable' });
  }
};
