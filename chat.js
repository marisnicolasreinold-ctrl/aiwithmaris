// === „Frag Maris" — KI-Chat-Widget ===
// Spricht mit der Supabase Edge Function ask-maris (Claude-API, SSE-Stream).
// Zweisprachig über localStorage aiwm_lang (i18n.js übersetzt nur statisches HTML).
// Öffnet sich nur auf Klick, Verlauf lebt für die Dauer der Seite.
(function () {
  var FN = 'https://amrdmnnijbfwtrjcpocl.supabase.co/functions/v1/ask-maris';
  var MAX_HISTORY = 10;

  var lang = 'de';
  try { lang = (localStorage.getItem('aiwm_lang') === 'en') ? 'en' : 'de'; } catch (e) { /* de */ }

  var STR = {
    de: {
      open: 'KI-Chat öffnen', close: 'Chat schließen', title: 'Frag Maris',
      sub: 'KI-Assistent · antwortet sofort',
      hello: 'Hi! Ich bin der KI-Assistent dieser Seite. Frag mich zum Coaching, zur Software-Entwicklung, zu den Live-Demos oder zum KI-Guide.',
      placeholder: 'Deine Frage …', send: 'Senden',
      chips: ['Was kostet der KI-Guide?', 'Zeig mir eine Live-Demo', 'Wie läuft ein Projekt ab?'],
      privacy: 'Deine Nachrichten werden zur Beantwortung an einen KI-Dienst (z. B. Google Gemini) übermittelt und von uns nicht dauerhaft gespeichert. Keine persönlichen Daten eingeben. Details: ',
      privacyLink: 'Datenschutz',
      errRate: 'Gerade sind viele Anfragen unterwegs — probier es in ein paar Minuten nochmal oder schreib direkt über die Kontaktseite.',
      errOff: 'Der Assistent ist gerade nicht verfügbar. Schreib gern direkt über die Kontaktseite.',
      errNet: 'Verbindung fehlgeschlagen — bitte nochmal versuchen.'
    },
    en: {
      open: 'Open AI chat', close: 'Close chat', title: 'Ask Maris',
      sub: 'AI assistant · instant answers',
      hello: "Hi! I'm this site's AI assistant. Ask me about coaching, software development, the live demos or the AI guide.",
      placeholder: 'Your question …', send: 'Send',
      chips: ['How much is the AI guide?', 'Show me a live demo', 'How does a project work?'],
      privacy: 'Your messages are sent to an AI service (e.g. Google Gemini) to generate answers and are not stored by us permanently. Please do not enter personal data. Details: ',
      privacyLink: 'Privacy policy',
      errRate: 'Lots of requests right now — please try again in a few minutes or reach out via the contact page.',
      errOff: 'The assistant is unavailable right now. Feel free to reach out via the contact page.',
      errNet: 'Connection failed — please try again.'
    }
  };
  var T = STR[lang];

  // --- Markup ---
  var root = document.createElement('div');
  root.className = 'fm-root';
  root.innerHTML =
    '<button type="button" class="fm-launch" aria-expanded="false" aria-label="' + T.open + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-3.7-.8L3 20l1-4.1a8.3 8.3 0 0 1-1-4A8.4 8.4 0 0 1 12 3.5a8.4 8.4 0 0 1 9 8z"/><circle cx="8.5" cy="11.5" r=".8" fill="currentColor"/><circle cx="12" cy="11.5" r=".8" fill="currentColor"/><circle cx="15.5" cy="11.5" r=".8" fill="currentColor"/></svg>' +
    '</button>' +
    '<section class="fm-panel" role="dialog" aria-label="' + T.title + '" hidden>' +
      '<header class="fm-head"><div><strong>' + T.title + '</strong><span>' + T.sub + '</span></div>' +
        '<button type="button" class="fm-close" aria-label="' + T.close + '">×</button></header>' +
      '<div class="fm-msgs" aria-live="polite"></div>' +
      '<div class="fm-chips"></div>' +
      '<form class="fm-form"><input type="text" maxlength="500" placeholder="' + T.placeholder + '" aria-label="' + T.placeholder + '" />' +
        '<button type="submit" aria-label="' + T.send + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></svg></button></form>' +
      '<p class="fm-note">' + T.privacy + '<a href="datenschutz.html">' + T.privacyLink + '</a></p>' +
    '</section>';
  document.body.appendChild(root);

  var launch = root.querySelector('.fm-launch');
  var panel = root.querySelector('.fm-panel');
  var msgsEl = root.querySelector('.fm-msgs');
  var chipsEl = root.querySelector('.fm-chips');
  var form = root.querySelector('.fm-form');
  var input = form.querySelector('input');
  var history = [];
  var busy = false;

  // --- Mini-Markdown: nur Links + Zeilenumbrüche, alles andere escaped ---
  function render(text) {
    var safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    safe = safe.replace(/\[([^\]]+)\]\((\/[a-z0-9\-\/#]*)\)/gi, '<a href="$2">$1</a>');
    safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return safe.replace(/\n/g, '<br>');
  }

  function addMsg(role, text) {
    var el = document.createElement('div');
    el.className = 'fm-msg ' + role;
    el.innerHTML = render(text);
    msgsEl.appendChild(el);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return el;
  }

  function setChips(show) {
    chipsEl.innerHTML = '';
    if (!show) return;
    T.chips.forEach(function (q) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = q;
      b.addEventListener('click', function () { send(q); });
      chipsEl.appendChild(b);
    });
  }

  function open() {
    panel.hidden = false;
    launch.setAttribute('aria-expanded', 'true');
    root.classList.add('open');
    if (!msgsEl.children.length) { addMsg('bot', T.hello); setChips(true); }
    input.focus();
  }
  function close() {
    panel.hidden = true;
    launch.setAttribute('aria-expanded', 'false');
    root.classList.remove('open');
  }

  launch.addEventListener('click', function () { panel.hidden ? open() : close(); });
  root.querySelector('.fm-close').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) close(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (q) send(q);
  });

  function send(question) {
    if (busy) return;
    busy = true;
    setChips(false);
    input.value = '';
    addMsg('user', question);
    history.push({ role: 'user', content: question });

    var botEl = addMsg('bot', '');
    botEl.classList.add('typing');
    var answer = '';

    fetch(FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-MAX_HISTORY), lang: lang })
    }).then(function (res) {
      if (!res.ok) {
        botEl.classList.remove('typing');
        botEl.innerHTML = render(res.status === 429 ? T.errRate : T.errOff);
        busy = false;
        return;
      }
      var reader = res.body.getReader();
      var dec = new TextDecoder();
      var buf = '';
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) { finish(); return; }
          buf += dec.decode(r.value, { stream: true });
          var lines = buf.split('\n');
          buf = lines.pop();
          lines.forEach(function (line) {
            if (line.indexOf('data: ') !== 0) return;
            var ev;
            try { ev = JSON.parse(line.slice(6)); } catch (err) { return; }
            if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta') {
              answer += ev.delta.text;
              botEl.classList.remove('typing');
              botEl.innerHTML = render(answer);
              msgsEl.scrollTop = msgsEl.scrollHeight;
            }
          });
          return pump();
        });
      }
      function finish() {
        botEl.classList.remove('typing');
        if (answer) { history.push({ role: 'assistant', content: answer }); }
        else { botEl.innerHTML = render(T.errOff); }
        busy = false;
      }
      return pump();
    }).catch(function () {
      botEl.classList.remove('typing');
      botEl.innerHTML = render(T.errNet);
      busy = false;
    });
  }
})();
