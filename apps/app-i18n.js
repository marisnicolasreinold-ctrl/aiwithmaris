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
    "Onboarding starten, Erfolg dokumentieren und um eine Referenz bitten.":"Start onboarding, document the win and ask for a reference."
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
    [/als Chart anzeigen/, "as chart"]
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
