// Click-to-Reveal für E-Mail-Adressen.
//
// Im HTML steht keine Adresse, sondern nur ein Link mit data-contact-mail. Die
// Adresse wird erst geholt, wenn jemand tatsächlich klickt — und zwar von
// /api/reveal, wo sie als Projekt-Variable liegt. Damit findet ein Harvester
// weder im Quelltext noch in diesem Skript etwas, das nach einer Adresse
// aussieht.
//
// Ohne JavaScript bleibt der Link so, wie er im HTML steht: ein Verweis aufs
// Kontaktformular. Kein toter Klick, kein leeres Element.

(function () {
  'use strict';

  const ENDPOINT = '/api/reveal';
  const links = document.querySelectorAll('a[data-contact-mail]');
  if (!links.length) return;

  // Einmal geholt, für alle weiteren Links auf der Seite gültig.
  let cached = '';

  async function fetchAddress() {
    if (cached) return cached;
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!r.ok) throw new Error('reveal ' + r.status);
    const data = await r.json();
    if (!data || !data.mail) throw new Error('reveal empty');
    cached = data.mail;
    return cached;
  }

  function wire(link) {
    const fallback = link.getAttribute('href');

    link.addEventListener('click', async (event) => {
      // Zweiter Klick: Der Link ist bereits ein echtes mailto: und darf normal
      // funktionieren.
      if (link.dataset.revealed === '1') return;

      event.preventDefault();
      const before = link.textContent;
      link.textContent = '…';

      try {
        const mail = await fetchAddress();
        link.setAttribute('href', 'mailto:' + mail);
        link.setAttribute('rel', 'nofollow noreferrer');
        link.dataset.revealed = '1';
        // Adresse stehen lassen, damit man sie auch kopieren kann.
        link.textContent = mail;
        window.location.href = link.getAttribute('href');
      } catch (err) {
        // Endpunkt nicht erreichbar oder nicht konfiguriert: zurück auf den
        // Weg, der ohne JavaScript ohnehin gilt.
        link.textContent = before;
        window.location.href = fallback;
      }
    });
  }

  links.forEach(wire);
})();
