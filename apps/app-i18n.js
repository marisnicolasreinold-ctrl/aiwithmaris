// === Zweisprachigkeit DE/EN für die Demo-Apps ===
// Deutsch = Original im Markup. Bei "en" werden Texte über Wörterbuch + Regeln ersetzt;
// ein MutationObserver übersetzt auch dynamisch erzeugte Inhalte. Ein Umschalter-Button
// wird automatisch in die .topbar eingefügt. Sprache wird mit der Hauptseite geteilt.
(function () {
  var KEY = 'aiwm_lang';
  function getLang(){ try { return localStorage.getItem(KEY) || 'de'; } catch (e) { return 'de'; } }
  function norm(s){ return s.replace(/\s+/g, ' ').trim(); }

  // Exakte Treffer (normalisiert)
  var DICT = {
    "← Zurück zu AI with Maris":"← Back to AI with Maris",

    /* FlowOps */
    "· Echtzeit-Anlagenmonitoring":"· Real-time plant monitoring",
    "Schwellwerte zurücksetzen":"Reset thresholds",
    "Takt":"Speed",
    "Letzte 60 Messwerte · Schwellwerte als gestrichelte Linien":"Last 60 readings · thresholds shown as dashed lines",
    "Alarm-Protokoll":"Alarm log",
    "Keine aktiven Alarme":"No active alarms",
    "Noch keine Ereignisse — alles im grünen Bereich.":"No events yet — all in the green.",
    "Demo: Sensordaten werden im Browser simuliert (Random-Walk + Anomalien). Im echten Betrieb kommen sie via MQTT/Modbus/IO-Link aus deiner Anlage — Schwellwerte, Alarme und Eskalation (z. B. Teams-Nachricht) funktionieren identisch.":"Demo: sensor data is simulated in the browser (random walk + anomalies). In real operation it arrives via MQTT/Modbus/IO-Link from your plant — thresholds, alarms and escalation (e.g. a Teams message) work identically.",
    "Temperatur":"Temperature","Durchfluss":"Flow","Druck":"Pressure","Vibration":"Vibration",
    "stabil":"stable","grenzwertig":"near limit","Alarm":"alarm",
    "über oberem Schwellwert":"above upper threshold","unter unterem Schwellwert":"below lower threshold","nähert sich Schwellwert":"approaching threshold",
    "Eintrag entfernen":"Remove entry",

    /* DocFlow */
    "· Dokumenten-Automatisierung":"· Document automation",
    "Dokument einfügen":"Insert document",
    "Wähle ein Beispiel oder füge eigenen Text ein (z. B. aus einer Rechnung). Die Extraktion läuft auf dem echten Text.":"Pick an example or paste your own text (e.g. from an invoice). Extraction runs on the actual text.",
    "Verarbeiten →":"Process →","Leeren":"Clear",
    "Automatische Verarbeitung":"Automatic processing",
    "Eingang → KI-Extraktion → Prüfung → Cloud-Archiv":"Inbox → AI extraction → check → cloud archive",
    "Eingang":"Inbox","KI-Extraktion":"AI extraction","Prüfung":"Check","Cloud-Archiv":"Cloud archive",
    "Noch kein Dokument verarbeitet.":"No document processed yet.",
    "Archiv":"Archive",
    "Lokal gespeichert (Demo) — im Betrieb: revisionssicher in deinem Cloud-Speicher.":"Stored locally (demo) — in production: audit-proof in your cloud storage.",
    "Archiv ist leer.":"Archive is empty.",
    "Als JSON exportieren":"Export as JSON","Archiv leeren":"Clear archive",
    "Rechnung":"Invoice","Lieferschein":"Delivery note","Vertrag / NDA":"Contract / NDA","Vertrag":"Contract","Dokument":"Document",
    "Dokumenttyp":"Document type","Beleg-Nr.":"Document no.","Datum":"Date","Betrag (brutto)":"Amount (gross)","USt-Satz":"VAT rate","Lieferant/Absender":"Supplier / sender","Positionen":"Line items",
    "hoch":"high","mittel":"medium","fehlt":"missing",
    "nicht gefunden":"not found","ohne Datum":"no date",
    "empfangen":"received","vollständig":"complete","archiviert":"archived","wartet":"waiting",
    "Löschen":"Delete","Dokumenttext":"Document text",
    "✓ Vollständig extrahiert & archiviert":"✓ Fully extracted & archived",

    /* PulseCRM */
    "· Vertriebs-Cockpit":"· Sales cockpit",
    "Pipeline offen":"Open pipeline","Gewonnen":"Won","Deals":"Deals",
    "Suchen…":"Search…","Deals durchsuchen":"Search deals",
    "Pipeline nach Phase":"Pipeline by stage",
    "Lead":"Lead","Angebot":"Quote",
    "leer":"empty","KI-Vorschlag:":"AI suggestion:",
    "Bearbeiten":"Edit","Phase zurück":"Move stage back","Phase vor":"Move stage forward",
    "Deal":"Deal","Schließen":"Close",
    "Firma *":"Company *","Ansprechpartner":"Contact","optional":"optional","Wert (€) *":"Value (€) *","Phase":"Stage","Notiz":"Note",
    "Abbrechen":"Cancel","Speichern":"Save","Neuer Deal":"New deal","Deal bearbeiten":"Edit deal",
    "Angebot versendet":"Quote sent",
    "Entscheider identifizieren und Discovery-Sprint anbieten.":"Identify the decision-maker and offer a discovery sprint.",
    "Kostenloses Erstgespräch terminieren.":"Schedule a free intro call.",
    "Nachfassen: offene Rückfragen klären und Entscheidungstermin setzen.":"Follow up: clarify open questions and set a decision date.",
    "Onboarding starten, Erfolg dokumentieren und um eine Referenz bitten.":"Start onboarding, document the win and ask for a reference.",

    /* agent-flow (KI-Agenten-Workflow) */
    "· Kundenanfrage-Triage":"· Customer request triage",
    "KI-Agenten-Workflow":"AI Agent Workflow",
    "1 · Eingang":"1 · Inbox",
    "Wähle eine Beispiel-Anfrage oder schreibe eine eigene. Der Workflow verarbeitet echten Text.":"Pick a sample request or write your own. The workflow processes real text.",
    "Kundenanfrage":"Customer request",
    "Schritt ›":"Step ›","Tempo":"Speed","Ausführungstempo":"Execution speed",
    "Realer Prozess:":"Real process:",
    "Inbound-Anfrage automatisch beantworten — mit menschlicher Freigabe.":"Answer an inbound request automatically — with human approval.",
    "Triage & Extraktion":"Triage & extraction",
    "Klassifizierung & Priorität":"Classification & priority",
    "Wissensabruf (Tool)":"Knowledge retrieval (tool)",
    "Antwort-Entwurf":"Draft reply",
    "QA & Compliance → Revision":"QA & compliance → revision",
    "Freigabe (Mensch)":"Approval (human)",
    "2 · Agenten-Pipeline":"2 · Agent pipeline",
    "3 · Ergebnis":"3 · Result",
    "Klassifizierung":"Classification","noch nichts verarbeitet":"nothing processed yet",
    "Genutzte Wissensquellen":"Knowledge sources used",
    "QA & Compliance":"QA & compliance","Kopieren":"Copy",
    "Live-Modus konfigurieren":"Configure live mode",
    "Live-Modus (eigener LLM)":"Live mode (your own LLM)",
    "Optional: Verbinde ein echtes Sprachmodell (OpenAI-kompatibler /chat/completions-Endpoint). Ohne Eintrag läuft die Demo vollständig regelbasiert (Simulation). Schlüssel bleiben nur lokal im Browser.":"Optional: connect a real language model (OpenAI-compatible /chat/completions endpoint). Without one, the demo runs fully rule-based (simulation). Keys stay only in your browser.",
    "Endpoint-URL":"Endpoint URL","Modell":"Model","API-Key":"API key",
    "Abbrechen":"Cancel","Speichern & aktivieren":"Save & activate","Schließen":"Close",
    "Intake-Agent":"Intake agent","Classifier-Agent":"Classifier agent","Retrieval-Agent":"Retrieval agent",
    "Drafting-Agent":"Drafting agent","QA & Compliance-Agent":"QA & compliance agent",
    "Kategorie & Priorität":"Category & priority","Prüfung & Freigabe-Empfehlung":"Review & approval recommendation",
    "wartet":"pending","läuft …":"running …","fertig":"done","Fehler":"error",
    "bereit":"ready","abgeschlossen":"completed",
    "Vertrieb":"Sales","Support":"Support","Recht & Compliance":"Legal & compliance","Recht":"Legal","Coaching":"Coaching","English":"English",
    "Priorität: Hoch":"Priority: High","Priorität: Normal":"Priority: Normal","Hoch":"High","Normal":"Normal",
    "Lese Nachricht, extrahiere Metadaten …":"Reading message, extracting metadata …",
    "Gleiche Schlüsselbegriffe gegen Kategorien ab …":"Matching keywords against categories …",
    "Rufe Werkzeug auf …":"Calling tool …",
    "Formuliere Antwort aus Kontext + Quellen …":"Composing reply from context + sources …",
    "Überarbeite Entwurf anhand des QA-Feedbacks …":"Revising draft based on QA feedback …",
    "Prüfe Sprache, Tonalität, CTA, DSGVO, Länge …":"Checking language, tone, CTA, GDPR, length …",
    "Keine Beanstandungen":"No issues",
    "Kein klarer nächster Schritt (CTA) enthalten":"No clear next step (CTA) included",
    "Mögliches Überversprechen":"Possible over-promise",
    "Datenstandort/DSGVO nicht adressiert, obwohl gefragt":"Data location/GDPR not addressed despite being asked",
    "Empfehlung: zur Freigabe ✓":"Recommendation: approve ✓",
    "Empfehlung: Revision ↻":"Recommendation: revise ↻",
    "Modus: Simulation":"Mode: Simulation","Modus: Live":"Mode: Live",
    "Kontaktdaten vorhanden: ja":"Contact details present: yes","Kontaktdaten vorhanden: nein":"Contact details present: no",
    "Dringlichkeit: hoch":"Urgency: high","Dringlichkeit: normal":"Urgency: normal",
    "✓ Freigeben & senden":"✓ Approve & send",
    "✓ Antwort freigegeben und zum Versand übergeben (Demo) — im Live-Betrieb ginge sie an die Kund:in bzw. ins Ticketsystem.":"✓ Reply approved and handed off for sending (demo) — in production it would go to the customer or into the ticket system.",
    "✓ Kopiert":"✓ Copied",

    /* NOVA (Spiel-Demo) */
    "· KI-Space-Patrouille":"· AI space patrol",
    "DIRECTOR-KI:":"DIRECTOR AI:",
    "kalibriert…":"calibrating…","ausgewogen":"balanced","fordert dich":"pushing you","entlastet dich":"easing off",
    "Ton: aus":"Sound: off","Ton: an":"Sound: on",
    "SCHILD":"SHIELD","FEUER":"FIRE","KI-COPILOT":"AI COPILOT",
    "Patrouille":"Patrol",
    "Ein Neon-Shooter mit eingebauter Director-KI: Sie beobachtet, wie gut du fliegst, und passt die Gegner live an dein Können an. Dein KI-Copilot funkt dir Lagemeldungen.":"A neon shooter with a built-in director AI: it watches how well you fly and adapts the enemies to your skill in real time. Your AI copilot radios in status reports.",
    "steuern":"steer","feuern":"fire",
    "Mission starten":"Start mission",
    "Schiff":"Ship","verloren":"lost",
    "Die Director-KI merkt sich das — der nächste Anflug wird sanfter beginnen.":"The director AI remembers this — your next run will start out gentler.",
    "PUNKTE":"SCORE","REKORD":"BEST",
    "Nochmal fliegen":"Fly again",
    "Sektor":"Sector","gesichert":"secured",
    "Boss zerstört, Patrouille abgeschlossen. So fühlt sich Software an, die mitdenkt — die Director-KI hat das ganze Spiel über deine Schwierigkeit geregelt.":"Boss destroyed, patrol complete. This is what software that thinks along feels like — the director AI tuned your difficulty throughout the whole game.",
    "Systeme online. Ich beobachte dein Flugverhalten und passe die Gegner an — viel Erfolg!":"Systems online. I'm watching how you fly and will adapt the enemies — good luck!",
    "Welle gesichert. Zweite Welle im Anflug — bleib in Bewegung.":"Wave cleared. Second wave incoming — keep moving.",
    "Stark! Letzte Welle, dann sehen wir uns den Brocken an.":"Strong flying! One last wave, then we'll deal with the big one.",
    "Achtung: großes Signal voraus. Das ist der Wächter — zerstör die pinken Kerne!":"Heads up: large signal ahead. That's the Warden — destroy the pink cores!",
    "Du fliegst stark — ich gebe den Gegnern mehr Schub.":"You're flying strong — I'm giving the enemies more thrust.",
    "Ich nehme etwas Tempo raus, bis die Schilde stehen.":"I'm easing the pace until your shields recover.",
    "Schilde unter 35 % — weich aus, ich regle die Regeneration hoch.":"Shields below 35% — evade, I'm boosting regeneration.",
    "Sechs Abschüsse in Serie — saubere Arbeit!":"Six kills in a row — clean work!",
    "Panzerung bricht — er wird jetzt aggressiver. Weiter so!":"Armor's breaking — he'll get more aggressive now. Keep it up!",
    "Kern liegt frei! Volle Feuerkraft auf die Mitte!":"Core exposed! Full firepower on the centre!",
    "Sektor gesichert. Saubere Patrouille, Pilot!":"Sector secured. Clean patrol, pilot!",
    "BOSS · DER WÄCHTER":"BOSS · THE WARDEN",
    "WELLE 1 / 3":"WAVE 1 / 3","WELLE 2 / 3":"WAVE 2 / 3","WELLE 3 / 3":"WAVE 3 / 3"
  };

  // Regeln für Texte mit eingesetzten Werten (Zahlen etc.)
  var RULES = [
    [/Störung simulieren/, "Simulate fault"],
    [/Fortsetzen/, "Resume"],
    [/ · Verlauf/, " · history"],
    [/Durchfluss/g, "Flow"],
    [/Temperatur/g, "Temperature"],
    [/Druck/g, "Pressure"],
    [/Unterer Schwellwert/, "Lower threshold"],
    [/Oberer Schwellwert/, "Upper threshold"],
    [/^aktuell /, "now "],
    [/(\d+) aktive\(r\) Alarm\(e\)/, "$1 active alarm(s)"],
    [/über oberem Schwellwert/, "above upper threshold"],
    [/unter unterem Schwellwert/, "below lower threshold"],
    [/nähert sich Schwellwert/, "approaching threshold"],
    [/(\d+) archiviert/, "$1 archived"],
    [/(\d+) Felder/, "$1 fields"],
    [/(\d+) offen/, "$1 open"],
    [/Prüfung nötig:/, "Needs review:"],
    [/ fehlt$/, " missing"],
    [/als Chart anzeigen/, "as chart"],
    /* agent-flow */
    [/Sprache erkannt: /, "Language detected: "],
    [/Unternehmensgröße: ~(\d+) Mitarbeiter/, "Company size: ~$1 employees"],
    [/Kategorie: /, "Category: "],
    [/(\d+)% Konfidenz/, "$1% confidence"],
    [/Relevanz (\d+)/, "relevance $1"],
    [/(\d+) relevante Quelle\(n\) gefunden/, "$1 relevant source(s) found"],
    [/Generierung über: Live-Modell/, "Generation via: live model"],
    [/Generierung über: Simulation \(regelbasiert\)/, "Generation via: simulation (rule-based)"],
    [/Entwurf erstellt \((\d+) Zeichen\)/, "Draft created ($1 characters)"],
    [/Qualitäts-Score: (\d+)\/100/, "Quality score: $1/100"],
    [/Sprachabgleich fehlgeschlagen \(Antwort (\w+), Anfrage (\w+)\)/, "Language mismatch (reply $1, request $2)"],
    [/Länge außerhalb Zielbereich \(180–1500\)/, "Length out of target range (180–1500)"],
    [/Live-Modell nicht erreichbar \((.+?)\) → Simulation/, "Live model unreachable ($1) → simulation"],
    [/Sprache: /, "Language: "],
    [/~(\d+) MA/, "~$1 empl."],
    [/Fehler: /, "Error: "],
    [/Recht & Compliance/g, "Legal & compliance"],
    [/Vertrieb/g, "Sales"],
    [/Workflow starten/, "Start workflow"],
    [/Weiter \(auto\)/, "Continue (auto)"]
  ];

  function tText(t) {
    var core = norm(t);
    if (DICT[core] !== undefined) {
      var lead = t.match(/^\s*/)[0], trail = t.match(/\s*$/)[0];
      return lead + DICT[core] + trail;
    }
    var out = t, changed = false;
    for (var i = 0; i < RULES.length; i++) {
      var n = out.replace(RULES[i][0], RULES[i][1]);
      if (n !== out) { out = n; changed = true; }
    }
    return changed ? out : null;
  }

  function tAttrs(root) {
    if (!root.querySelectorAll) return;
    root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(function (el) {
      ['placeholder', 'aria-label', 'title'].forEach(function (a) {
        if (!el.hasAttribute(a)) return;
        var v = el.getAttribute(a), core = norm(v);
        if (DICT[core] !== undefined) { el.setAttribute(a, DICT[core]); return; }
        var o = v, c = false;
        for (var i = 0; i < RULES.length; i++) { var n = o.replace(RULES[i][0], RULES[i][1]); if (n !== o) { o = n; c = true; } }
        if (c) el.setAttribute(a, o);
      });
    });
  }

  function walk(root) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode; if (!p) return NodeFilter.FILTER_REJECT;
        var tg = p.nodeName;
        if (tg === 'SCRIPT' || tg === 'STYLE' || tg === 'TEXTAREA') return NodeFilter.FILTER_REJECT;
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n; while ((n = w.nextNode())) nodes.push(n);
    nodes.forEach(function (nd) { var r = tText(nd.nodeValue); if (r !== null) nd.nodeValue = r; });
    tAttrs(root);
  }

  var obs = null;
  function startObserver() {
    obs = new MutationObserver(function (muts) {
      obs.disconnect();
      muts.forEach(function (m) {
        if (m.type === 'characterData') {
          var r = tText(m.target.nodeValue);
          if (r !== null && r !== m.target.nodeValue) m.target.nodeValue = r;
        } else {
          (m.addedNodes || []).forEach(function (nd) {
            if (nd.nodeType === 3) { var r = tText(nd.nodeValue); if (r !== null) nd.nodeValue = r; }
            else if (nd.nodeType === 1) walk(nd);
          });
        }
      });
      obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function addToggle() {
    var bar = document.querySelector('.topbar');
    if (!bar || document.getElementById('langToggle')) return;
    var b = document.createElement('button');
    b.id = 'langToggle'; b.type = 'button'; b.className = 'aiwm-lang';
    b.textContent = getLang() === 'en' ? 'DE' : 'EN';
    b.setAttribute('aria-label', getLang() === 'en' ? 'Auf Deutsch umschalten' : 'Switch to English');
    b.addEventListener('click', function () {
      try { localStorage.setItem(KEY, getLang() === 'en' ? 'de' : 'en'); } catch (e) {}
      location.reload();
    });
    bar.appendChild(b);
  }

  function injectCss() {
    var s = document.createElement('style');
    s.textContent = '.aiwm-lang{font-family:var(--mono,monospace);font-size:.72rem;font-weight:700;letter-spacing:.08em;padding:7px 12px;border-radius:999px;border:1px solid var(--line,rgba(255,255,255,.12));background:rgba(255,255,255,.05);color:var(--text,#eef1fa);cursor:pointer;transition:border-color .2s,background .2s}.aiwm-lang:hover{border-color:rgba(94,240,255,.5);background:rgba(94,240,255,.08)}';
    document.head.appendChild(s);
  }

  function init() {
    injectCss();
    addToggle();
    document.documentElement.lang = getLang();
    if (getLang() === 'en') {
      walk(document.body);
      var dt = norm(document.title); if (DICT[dt] !== undefined) document.title = DICT[dt];
      startObserver();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

// === Anonyme, cookielose Reichweitenmessung (wie main.js) ===
(function () {
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl) return;
  if (!/(^|\.)aiwithmaris\.(com|de)$/.test(location.hostname)) return;
  var path = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  var payload = { path: path };
  // Quelle: nur die Domain des Verweises (keine vollständige URL), und nur wenn extern
  try {
    if (document.referrer) {
      var rh = new URL(document.referrer).hostname;
      if (rh && !/(^|\.)aiwithmaris\.(com|de)$/.test(rh)) payload.ref = rh;
    }
  } catch (e) { /* egal */ }
  // UTM-Kampagnenparameter (falls in der URL vorhanden)
  try {
    var q = new URLSearchParams(location.search), utm = {};
    if (q.get('utm_source')) utm.source = q.get('utm_source');
    if (q.get('utm_medium')) utm.medium = q.get('utm_medium');
    if (q.get('utm_campaign')) utm.campaign = q.get('utm_campaign');
    if (utm.source || utm.medium || utm.campaign) payload.utm = utm;
  } catch (e) { /* egal */ }
  try {
    fetch('https://amrdmnnijbfwtrjcpocl.supabase.co/functions/v1/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function () { /* Zählung ist optional */ });
  } catch (e) { /* egal */ }
})();
