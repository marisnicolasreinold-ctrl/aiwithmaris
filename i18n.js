// === Zweisprachigkeit DE/EN ===
// Deutsch ist das Original im HTML. Bei "en" werden die deutschen Texte über das
// Wörterbuch unten ersetzt. Sprache wird in localStorage gemerkt. Umschalten lädt neu.
(function () {
  var KEY = 'aiwm_lang';

  // Deutsch -> Englisch. Schlüssel = normalisierter (Whitespace zusammengefasst) deutscher Text.
  var EN = {
    // --- Navigation / geteilt ---
    "Leistungen": "Services",
    "Lösungen": "Solutions",
    "Beispiele": "Examples",
    "Über uns": "About",
    "Preise & FAQ": "Pricing & FAQ",
    "Kontakt": "Contact",
    "Zum Inhalt springen": "Skip to content",
    "Hauptnavigation": "Main navigation",
    "Menü öffnen": "Open menu",
    "Menü schließen": "Close menu",
    "AI with Maris — zur Startseite": "AI with Maris — home",

    // --- Footer ---
    "KI-Coaching & maßgeschneiderte Software-Entwicklung — cloud-neutral, datensouverän, ohne Lock-in.": "AI coaching & custom software development — cloud-neutral, data-sovereign, no lock-in.",
    "Angebot": "Offer",
    "Rechtliches": "Legal",
    "Preise": "Pricing",
    "Impressum": "Imprint",
    "Datenschutz": "Privacy",
    "AGB": "Terms",

    // --- Seitentitel (document.title) ---
    "AI with Maris — KI-Coaching & maßgeschneiderte Software in deiner Cloud": "AI with Maris — AI coaching & custom software in your cloud",
    "Kontakt — AI with Maris": "Contact — AI with Maris",
    "Über mich — AI with Maris": "About me — AI with Maris",
    "Preise & FAQ — AI with Maris": "Pricing & FAQ — AI with Maris",
    "Leistungen — AI with Maris KI-Coaching & Software-Entwicklung": "Services — AI with Maris AI coaching & software development",
    "Branchenlösungen nach Abteilungen — AI with Maris": "Solutions by department — AI with Maris",
    "Anwendungsbeispiele — AI with Maris Live-Mockups & Showcase": "Examples — AI with Maris live mockups & showcase",

    // --- Startseite ---
    "KI-Coaching": "AI Coaching",
    "Software-Entwicklung": "Software Development",
    "Cloud-nativ": "Cloud-native",
    "KI verstehen.": "Understand AI.",
    "Software, die": "Software that",
    "für dich arbeitet.": "works for you.",
    "Hi, ich bin Maris. Ich experimentiere mit KI und baue Software, die echte Arbeit abnimmt — von kleinen Automatisierungen bis zu Apps, die sicher in der Cloud laufen. Hier zeige ich, was damit so geht.": "Hi, I'm Maris. I experiment with AI and build software that takes real work off your plate — from small automations to apps that run safely in the cloud. Here's a taste of what's possible.",
    "Sag Hallo": "Say hello",
    "Beispiele ansehen": "See examples",
    "Automatisierte Prozesse": "Automated processes",
    "Zeitersparnis / Woche": "Time saved / week",
    "Datenhoheit (eigene Cloud)": "Data ownership (your cloud)",
    "Zwei Säulen, ein Ziel": "Two pillars, one goal",
    "Ich mach dich KI-souverän — und bau die Software dazu.": "I make you AI-savvy — and build the software to match.",
    "Coaching bringt das Wissen in den Kopf. Eigene Software bringt es in den Alltag. Beides aus einer Hand.": "Coaching puts the knowledge in your head. Your own software puts it into everyday use. Both from one person.",
    "Säule 01 · Befähigen": "Pillar 01 · Enable",
    "Damit dein Team KI nicht nur ausprobiert, sondern souverän einsetzt.": "So your team doesn't just dabble with AI but uses it with confidence.",
    "1:1 & Team-Coaching": "1:1 & team coaching",
    "— an euren echten Aufgaben": "— on your real tasks",
    "Prompt Engineering": "Prompt engineering",
    "& wiederverwendbare Bibliotheken": "& reusable libraries",
    "Mehr erfahren": "Learn more",
    "Säule 02 · Bauen": "Pillar 02 · Build",
    "Maßgeschneiderte Anwendungen, die automatisieren und in deiner Cloud laufen.": "Custom applications that automate and run in your cloud.",
    "Custom Web- & Cloud-Apps": "Custom web & cloud apps",
    "auf modernem Stack": "on a modern stack",
    "Prozess-Automatisierung": "Process automation",
    "mit KI-Agenten": "with AI agents",
    "Deine Infrastruktur, deine Regeln": "Your infrastructure, your rules",
    "Cloud-agnostisch entwickelt. Du bestimmst, wo deine Daten liegen.": "Built cloud-agnostic. You decide where your data lives.",
    "Ich baue unabhängig vom Anbieter. Deine Software läuft dort, wo deine Daten hingehören — zum Beispiel in deiner": "I build independent of any provider. Your software runs where your data belongs — for example in your",
    "eigenen Azure-Umgebung": "own Azure environment",
    ", genauso aber in AWS, Google Cloud oder on-premise.": ", but just as well in AWS, Google Cloud or on-premise.",
    "Volle Datenhoheit": "Full data sovereignty",
    "dsgvo-konform in deiner Cloud.": "GDPR-compliant in your cloud.",
    "Kein Vendor-Lock-in": "No vendor lock-in",
    "Quellcode gehört vollständig dir.": "The source code is entirely yours.",
    "Spielwiese": "Playground",
    "Lieber zeigen als behaupten.": "Show, don't tell.",
    "Statt großer Versprechen findest du hier echte, klickbare Mini-Apps, die ich gebaut habe — alle laufen live im Browser, ganz ohne Login.": "Instead of big promises, here are real, clickable mini-apps I've built — all running live in your browser, no login needed.",
    "KI-Agenten-Workflow": "AI Agent Workflow",
    "Eine Kundenanfrage wird automatisch eingeordnet, beantwortet und geprüft — mit echtem Revisions-Loop und menschlicher Freigabe.": "A customer request is automatically triaged, answered and reviewed — with a real revision loop and human approval.",
    "ATLAS Produktions-Cockpit": "ATLAS Production Cockpit",
    "Ein sprechender KI-Assistent im „Jarvis“-Stil brieft dich morgens: überfällige Aufträge, Engpässe und To-dos auf einen Blick.": "A talking, Jarvis-style AI assistant briefs you each morning: overdue orders, bottlenecks and to-dos at a glance.",
    "FlowOps IoT-Monitoring": "FlowOps IoT Monitoring",
    "Live-Überwachung von Maschinen- und Sensordaten mit Schwellwert-Alarmen und automatischer Eskalation.": "Live monitoring of machine and sensor data with threshold alarms and automatic escalation.",
    "DocFlow Dokumenten-Automatisierung": "DocFlow Document Automation",
    "Eingehende PDFs werden von einem Sprachmodell gelesen, geprüft und revisionssicher archiviert.": "Incoming PDFs are read by a language model, checked and archived audit-proof.",
    "PulseCRM Vertriebs-Cockpit": "PulseCRM Sales Cockpit",
    "Leads, Angebote und Umsätze in einer Pipeline — KI fasst die Historie zusammen und schlägt den nächsten Schritt vor.": "Leads, quotes and revenue in one pipeline — AI summarizes the history and suggests the next step.",
    "Live-Demo öffnen": "Open live demo",
    "Alle Beispiele ansehen": "See all examples",
    "APEX Garmin-KI-Coach": "APEX Garmin AI Coach",
    "Liest deine Garmin-Werte (Trainingsbereitschaft, HRV, Schlaf, VO₂max) und baut daraus ein tagesaktuelles, auf dein Ziel abgestimmtes Training.": "Reads your Garmin data (training readiness, HRV, sleep, VO₂max) and builds a daily workout tailored to your goal.",
    "Neugierig geworden?": "Curious?",
    "Egal ob konkrete Idee oder nur lose Frage — schreib mir einfach. Ich beiß nicht und freu mich über jeden Austausch rund um KI.": "Whether it's a concrete idea or just a loose question — drop me a line. I don't bite, and I enjoy every chat about AI.",
    "Schreib mir": "Message me",

    // --- Leistungen ---
    "Was ich mache": "What I do",
    "Befähigen durch Coaching.": "Enable through coaching.",
    "Bauen durch Software.": "Build through software.",
    "Ich begleite dich auf dem Weg zur KI-Souveränität und baue maßgeschneiderte Software, die datensouverän in deiner eigenen Cloud läuft.": "I guide you toward AI sovereignty and build custom software that runs data-sovereign in your own cloud.",
    "Damit dein Team KI nicht nur ausprobiert, sondern gewinnbringend und sicher im Arbeitsalltag einsetzt.": "So your team doesn't just try AI but uses it profitably and safely day to day.",
    "— Lernen an euren echten, alltäglichen Business-Aufgaben.": "— learning on your real, everyday business tasks.",
    "— Aufbau wiederverwendbarer interner Prompt-Bibliotheken.": "— building reusable internal prompt libraries.",
    "KI-Strategie & Governance": "AI strategy & governance",
    "— DSGVO-konforme Sicherheitsrichtlinien für dein Team.": "— GDPR-compliant security guidelines for your team.",
    "Maßgeschneiderte Anwendungen, die zeitaufwendige Workflows automatisieren und in deiner Cloud laufen.": "Custom applications that automate time-consuming workflows and run in your cloud.",
    "— Entwickelt auf einem schnellen, modernen Tech-Stack.": "— built on a fast, modern tech stack.",
    "— Schnittstellen-Verbindungen & autonome KI-Agenten.": "— API integrations & autonomous AI agents.",
    "Cloud Deployment": "Cloud deployment",
    "— Direkte Installation in deiner IT-Umgebung (voller Code-Besitz).": "— direct installation in your IT environment (full code ownership).",
    "Der AI with Maris Prompt-Optimierer": "The AI with Maris Prompt Optimizer",
    "Erlebe echtes Prompt Engineering live. Gib einen einfachen Prompt ein, wähle deine Abteilung, und sieh zu, wie unsere integrierte Logik daraus eine präzise B2B-Anweisung baut.": "Experience real prompt engineering live. Enter a simple prompt, pick your department, and watch the built-in logic turn it into a precise instruction.",
    "Dein einfacher Prompt": "Your simple prompt",
    "Deine Abteilung / Anwendungsfall": "Your department / use case",
    "Vertrieb & Sales (Angebotsnachfassungen, Leads)": "Sales (quote follow-ups, leads)",
    "Marketing (Social Media Posts, Copywriting)": "Marketing (social media posts, copywriting)",
    "Personal & HR (Mitarbeiterkommunikation, Stellenanzeigen)": "HR (employee comms, job ads)",
    "Prompt optimieren": "Optimize prompt",
    "Kopieren": "Copy",
    "Entwicklungs-Fokus": "Development focus",
    "Moderne Software, die Dinge erledigt.": "Modern software that gets things done.",
    "Wiederkehrende Abläufe — Datenerfassung, Reporting, Freigaben — laufen automatisch. Gewinne wertvolle Stunden zurück.": "Recurring tasks — data entry, reporting, approvals — run automatically. Win back valuable hours.",
    "Cloud-Datenplattformen": "Cloud data platforms",
    "Alle Daten zentral, sicher und durchsuchbar — gespeichert dort, wo es zu dir passt: Azure, AWS, Google Cloud oder on-premise.": "All data central, secure and searchable — stored wherever suits you: Azure, AWS, Google Cloud or on-premise.",
    "IoT- & Echtzeit-Dashboards": "IoT & real-time dashboards",
    "Maschinen- und Sensordaten live visualisiert. Wir holen die Daten dort ab, wo sie entstehen, z. B. via MQTT oder Modbus.": "Machine and sensor data visualized live. The data is collected right where it's generated, e.g. via MQTT or Modbus.",
    "KI-Funktionen integriert": "AI features built in",
    "Dokumentenverständnis, Texterzeugung, Datenklassifizierung — LLMs direkt in deine Anwendung eingebettet.": "Document understanding, text generation, data classification — LLMs embedded right into your application.",
    "System-Integrationen": "System integrations",
    "Verbindung vorhandener ERP-, CRM- und Kommunikationswerkzeuge (Teams, Slack) über saubere, stabile APIs.": "Connecting existing ERP, CRM and communication tools (Teams, Slack) via clean, stable APIs.",
    "Betrieb & Wartung": "Operations & maintenance",
    "Monitoring, Updates und Support — oder saubere Übergabe des Codes an dein eigenes Entwickler-Team.": "Monitoring, updates and support — or a clean handover of the code to your own dev team.",
    "Unser Workflow": "My workflow",
    "In vier Phasen zur passgenauen Cloud-Lösung.": "Four phases to a tailored cloud solution.",
    "ANALYSE": "ANALYSIS",
    "KONZEPT": "CONCEPT",
    "Verstehen": "Understand",
    "Ich schaue mir deine bestehenden Abläufe, Datenquellen und Ziele an — und finde die lohnendsten Quick Wins.": "I look at your existing processes, data sources and goals — and find the most worthwhile quick wins.",
    "Architektur": "Architecture",
    "Erstellung eines Lösungsdesigns inklusive IT-Infrastruktur, Datensicherheitskonzept und präzisem Aufwandsrahmen.": "Creating a solution design including IT infrastructure, data security concept and a precise effort estimate.",
    "Entwickeln": "Build",
    "Iterative Agile-Entwicklung in Sprints. Regelmäßige nutzbare Zwischenstände laufen direkt in deiner Cloud-Umgebung.": "Iterative agile development in sprints. Regular usable increments run directly in your cloud environment.",
    "Betrieb & Coaching": "Operations & coaching",
    "Go-Live, umfassende Befähigung deines Teams durch gezielte Coachings sowie verlässlicher Support im Betrieb.": "Go-live, thorough enablement of your team through targeted coaching, plus reliable support in operation.",
    "Hast du eine Idee?": "Got an idea?",
    "Erzähl mir davon — ich sag dir ehrlich, ob und wie sich das umsetzen lässt. Auch kleine Spielereien sind völlig willkommen.": "Tell me about it — I'll honestly say whether and how it can be done. Small playful experiments are very welcome too.",

    // --- Lösungen ---
    "Automatisierung für": "Automation for",
    "jede deiner Abteilungen.": "every one of your departments.",
    "Hier ein paar typische Ideen, was sich pro Bereich automatisieren lässt — vom Vertrieb bis zur IT. Gedacht als Inspiration, nicht als Verkaufskatalog.": "Here are a few typical ideas of what can be automated per area — from sales to IT. Meant as inspiration, not a sales catalog.",
    "Alle Lösungen sind direkt in deiner bestehenden IT-Infrastruktur realisierbar": "Every solution can be built directly into your existing IT infrastructure",
    "Vertrieb & Sales": "Sales",
    "Finanzen & Buchhaltung": "Finance & accounting",
    "Personal & HR": "HR & people",
    "Einkauf & Beschaffung": "Purchasing & procurement",
    "Produktion & Betrieb": "Production & operations",
    "Kundenservice": "Customer service",
    "Geschäftsführung": "Management",
    "IT & Entwicklung": "IT & development",
    "Angebote automatisch aus CRM-Daten generieren": "Generate quotes automatically from CRM data",
    "Lead-Scoring & Priorisierung mittels KI-Modell": "Lead scoring & prioritization via AI model",
    "Gesprächsnotizen → direkter E-Mail-Entwurf": "Call notes → instant email draft",
    "Content-Erstellung für Social Media & Newsletter": "Content creation for social media & newsletters",
    "Kampagnen-Erfolge automatisiert zusammengefasst": "Campaign results summarized automatically",
    "Text- & Bildvarianten für A/B-Tests": "Text & image variants for A/B tests",
    "Eingangsrechnungen automatisiert auslesen": "Read incoming invoices automatically",
    "Automatisiertes Mahnwesen & Zahlungsprüfung": "Automated dunning & payment checks",
    "Finanzberichte & Monatsabschluss auf Knopfdruck": "Financial reports & month-end close at the push of a button",
    "Bewerber-Lebensläufe filtern & zusammenfassen": "Filter & summarize applicant CVs",
    "Automatische Erstellung von Onboarding-Unterlagen": "Automatic creation of onboarding documents",
    "Interner Wissens-Chatbot für Mitarbeiterfragen": "Internal knowledge chatbot for employee questions",
    "Angebote vergleichen & Bestellungen vorschlagen": "Compare quotes & suggest orders",
    "Lieferanten-Stammdaten automatisiert abgleichen": "Automatically reconcile supplier master data",
    "Lieferzeiten & Warenbestand autonom überwachen": "Autonomously monitor delivery times & stock",
    "Echtzeit-Überwachung kritischer Sensorwerte": "Real-time monitoring of critical sensor values",
    "Predictive Maintenance (Wartungsprognosen)": "Predictive maintenance (maintenance forecasts)",
    "Automatisierte Produktions- & Schichtberichte": "Automated production & shift reports",
    "Klassifizierung & Weiterleitung von Anfragen": "Classification & routing of requests",
    "KI-Entwurf für Antworten aus eurer Wissensbasis": "AI-drafted replies from your knowledge base",
    "Self-Service-Chatbot für einfache Standardfragen": "Self-service chatbot for simple standard questions",
    "Zentrales Live-Dashboard für Unternehmens-KPIs": "Central live dashboard for company KPIs",
    "Automatisierte wöchentliche Statusberichte": "Automated weekly status reports",
    "Datengestützte Entscheidungsvorlagen per KI": "Data-driven decision templates via AI",
    "Automatisierte API-Verbindungen & Script-Jobs": "Automated API connections & script jobs",
    "KI-Auswertung technischer Logs & Systemalarme": "AI analysis of technical logs & system alarms",
    "Automatisierte Generierung von Dokumentation": "Automated documentation generation",
    "Was würdest du gern loswerden?": "What would you love to get rid of?",
    "Sag mir, welche nervige Aufgabe dich am meisten Zeit kostet — vielleicht lässt sie sich ja automatisieren.": "Tell me which annoying task eats the most of your time — maybe it can be automated.",

    // --- Beispiele ---
    "Eine Plattform, viele": "One platform, many",
    "digitale Gesichter.": "digital faces.",
    "Das hier sind echte, klickbare Mini-Apps, die ich gebaut habe — von robust-industriellen Dashboards bis zu warm-minimalistischen Dokumenten-Pipelines. Klick dich einfach durch.": "These are real, clickable mini-apps I've built — from rugged industrial dashboards to warm, minimalist document pipelines. Just click through.",
    "Alles live ausprobieren — ohne Login": "Try everything live — no login",
    "Jedes Beispiel unten gibt es als echte, klickbare App. Neu: ein KI-Agenten-Workflow, der eine Kundenanfrage automatisch triagiert, beantwortet und prüft.": "Every example below is a real, clickable app. New: an AI agent workflow that automatically triages, answers and checks a customer request.",
    "KI-Agenten-Workflow öffnen": "Open AI agent workflow",
    "Neu: ATLAS — Produktions-Cockpit mit sprechendem KI-Assistenten": "New: ATLAS — production cockpit with a talking AI assistant",
    "Eine KI-Kugel im „Jarvis“-Stil brieft deine Produktionsleitung morgens per Sprache: überfällige, gefährdete und in der Fertigung hängende Aufträge, Prioritäten, Engpässe und To-dos auf einen Blick. Live im Browser, ohne Login.": "A Jarvis-style AI orb briefs your production team each morning by voice: overdue, at-risk and stuck orders, priorities, bottlenecks and to-dos at a glance. Live in the browser, no login.",
    "ATLAS Live-Demo öffnen": "Open ATLAS live demo",
    "Neu: APEX — KI-Trainingscoach mit Garmin (MCP)": "New: APEX — AI training coach with Garmin (MCP)",
    "Verbindet Garmin und KI: liest Trainingsbereitschaft, HRV, Schlaf, Body Battery und VO₂max und baut daraus ein tagesaktuelles, auf dein Ziel abgestimmtes Training. Live im Browser, ohne Login.": "Connects Garmin and AI: reads training readiness, HRV, sleep, Body Battery and VO₂max and builds a daily workout tailored to your goal. Live in the browser, no login.",
    "APEX Live-Demo öffnen": "Open APEX live demo",
    "IoT-Monitoring": "IoT Monitoring",
    "Dokumenten-Automatisierung": "Document Automation",
    "Vertriebs-Cockpit": "Sales Cockpit",
    "FlowOps — Echtzeit-Anlagenüberwachung": "FlowOps — real-time plant monitoring",
    "Sensordaten via MQTT, Live-Dashboard mit Schwellwert-Alarmen und automatischer Eskalation per Teams-Nachricht. Läuft in der Cloud deiner Wahl.": "Sensor data via MQTT, a live dashboard with threshold alarms and automatic escalation via Teams message. Runs in the cloud of your choice.",
    "DocFlow — Dokumente automatisch verstehen": "DocFlow — understand documents automatically",
    "Eingehende PDFs und Mails werden von einem Sprachmodell gelesen, relevante Felder extrahiert, geprüft und revisionssicher in deinem Cloud-Speicher abgelegt.": "Incoming PDFs and emails are read by a language model, relevant fields extracted, checked and stored audit-proof in your cloud storage.",
    "PulseCRM — Vertrieb auf einen Blick": "PulseCRM — sales at a glance",
    "Leads, Angebote und Umsätze in einer Pipeline. KI fasst die Kundenhistorie zusammen und schlägt den nächsten Schritt vor — alle Daten in deiner eigenen Datenbank.": "Leads, quotes and revenue in one pipeline. AI summarizes the customer history and suggests the next step — all data in your own database.",
    "Idee, die ich mal durchspielen soll?": "An idea you'd like me to play through?",
    "Wenn du etwas Ähnliches im Kopf hast oder einfach wissen willst, ob sich was automatisieren lässt — schreib mir, ich bastel gern.": "If you have something similar in mind or just want to know whether something can be automated — message me, I love tinkering.",

    // --- Über mich ---
    "Über mich": "About me",
    "Eine Person, kein Konzern.": "One person, not a corporation.",
    "Hinter „AI with Maris“ steckt genau eine Person: ich. Ich bin von KI begeistert, baue Software und probiere ständig aus, was sich automatisieren lässt. Du sprichst also direkt mit dem, der baut und coacht — kein Account-Management-Pingpong, keine Blackbox. Aktuell ist das vor allem Spielwiese und Lernprojekt: ehrlich, neugierig, ohne großes Brimborium.": "Behind “AI with Maris” there's exactly one person: me. I'm passionate about AI, I build software and I'm constantly trying out what can be automated. So you talk directly to the person who builds and coaches — no account-management ping-pong, no black box. Right now it's mostly a playground and learning project: honest, curious, without the fuss.",
    "Hands-on statt Hochglanz": "Hands-on, not glossy",
    "Ich baue lieber lauffähige kleine Dinge als perfekte Foliensätze.": "I'd rather build small working things than perfect slide decks.",
    "Datenschutz von Anfang an": "Privacy from day one",
    "DSGVO und Datenhoheit sind für mich Teil des Designs, kein Nachgedanke.": "For me, GDPR and data sovereignty are part of the design, not an afterthought.",
    "Auf Augenhöhe": "On equal footing",
    "Ich erkläre, was ich tue — verständlich, ohne Fachchinesisch.": "I explain what I do — clearly, without jargon.",
    "Macher · KI & Software": "Maker · AI & software",
    "Probiert aus, baut, lernt — und teilt hier, was dabei rauskommt.": "Tries things, builds, learns — and shares the results here.",
    "Made in Germany. Remote-first und überwiegend Feierabend-Projekt — du erreichst immer mich direkt.": "Made in Germany. Remote-first and mostly an after-hours project — you always reach me directly.",
    "Lern mich kennen": "Get to know me",
    "Lass uns einfach mal quatschen — über deine Idee, über KI oder darüber, was sich bei dir automatisieren ließe.": "Let's just have a chat — about your idea, about AI, or about what could be automated for you.",
    "Kontakt aufnehmen": "Get in touch",

    // --- Preise ---
    "Noch keine Preisliste.": "No price list yet.",
    "Erstmal Spielwiese.": "Just a playground for now.",
    "Ganz ehrlich: Aktuell ist das hier mehr Lern- und Bastelprojekt als Firma. Feste Preise gibt's deshalb noch nicht. Wenn du eine Idee hast, schreib mir einfach — dann finden wir gemeinsam etwas Faires.": "Honestly: right now this is more a learning and tinkering project than a company. So there are no fixed prices yet. If you have an idea, just message me — and we'll find something fair together.",
    "Lass uns einfach reden": "Let's just talk",
    "Ich hab noch keine Firma und keine Preisliste — das hier ist erstmal Lern- und Bastelprojekt. Wenn dich etwas interessiert (ein Coaching, eine kleine App oder einfach eine KI-Frage), schreib mir. Dann schauen wir, ob's passt, und finden gemeinsam etwas Faires.": "I don't have a company or a price list yet — this is a learning and tinkering project for now. If something interests you (coaching, a small app, or just an AI question), message me. We'll see if it's a fit and find something fair together.",
    "Unverbindlich & ohne Verkaufsdruck": "No obligation, no sales pressure",
    "Kleine Projekte & Experimente willkommen": "Small projects & experiments welcome",
    "Alles Weitere klären wir direkt miteinander": "We'll sort out everything else directly together",
    "Häufige Fragen": "FAQ",
    "FAQ — Antworten auf deine Fragen.": "FAQ — answers to your questions.",
    "Was unterscheidet AI with Maris von einer klassischen Agentur?": "What makes AI with Maris different from a traditional agency?",
    "Ganz einfach: Hier gibt's keine Agentur, sondern nur mich. Du sprichst direkt mit dem, der baut und coacht — und bekommst nicht nur ein Tool, sondern auch das Wissen, es selbst zu nutzen.": "Simple: there's no agency here, just me. You talk directly to the person who builds and coaches — and you don't just get a tool, but also the know-how to use it yourself.",
    "Wo werden meine Daten gespeichert?": "Where is my data stored?",
    "Ausschließlich in deiner eigenen Cloud-Umgebung — Azure, AWS, Google Cloud oder on-premise. Du behältst die volle Datenhoheit, DSGVO-konform mit wählbarer EU-Region.": "Exclusively in your own cloud environment — Azure, AWS, Google Cloud or on-premise. You keep full data sovereignty, GDPR-compliant with a selectable EU region.",
    "Wie schnell sehen wir erste Ergebnisse?": "How quickly do we see first results?",
    "Im Coaching oft schon ab dem ersten Gespräch. Bei kleinen Software-Ideen baue ich gern schnell einen ersten klickbaren Stand, damit du früh siehst, ob's in die richtige Richtung geht.": "In coaching, often from the very first conversation. For small software ideas I like to quickly build a first clickable version so you can see early whether it's heading the right way.",
    "Was kostet ein Projekt?": "What does a project cost?",
    "Aktuell gibt's keine feste Preisliste — das hier ist noch Lern- und Bastelprojekt. Schreib mir einfach, was du vorhast, dann finden wir gemeinsam etwas Faires. Ein erstes Kennenlernen ist natürlich kostenlos.": "There's no fixed price list right now — this is still a learning and tinkering project. Just tell me what you have in mind and we'll find something fair together. A first chat is of course free.",
    "Sind Cloud- und Lizenzkosten enthalten?": "Are cloud and license costs included?",
    "Falls mal externe Cloud- oder Lizenzkosten anfallen (z. B. für Azure, AWS oder GCP), laufen die transparent über deinen eigenen Account — ohne Aufschlag von mir. Ich schätze sie vorher ehrlich mit dir ab.": "If external cloud or license costs ever come up (e.g. for Azure, AWS or GCP), they run transparently through your own account — with no markup from me. I'll estimate them honestly with you beforehand.",
    "Was passiert, wenn wir die Zusammenarbeit beenden?": "What happens if we end our collaboration?",
    "Du erhältst den vollständigen Quellcode samt Dokumentation. Dein Team kann jederzeit selbst weiterbauen — kein Vendor-Lock-in, kein Stillstand.": "You get the complete source code plus documentation. Your team can keep building anytime — no vendor lock-in, no standstill.",

    // --- Kontakt ---
    "Sag einfach": "Just say",
    "Hallo.": "Hello.",
    "Du hast eine Idee, eine Frage rund um KI oder willst einfach quatschen, was sich automatisieren lässt? Schreib mir — ich freu mich über jede Nachricht.": "Got an idea, a question about AI, or just want to chat about what could be automated? Message me — I'm happy to hear from you.",
    "Direkt schreiben": "Write directly",
    "Schreib mir kurz, worum's geht — ich melde mich mit ehrlichen ersten Gedanken. Kein Verkaufsgelaber, versprochen.": "Tell me briefly what it's about — I'll reply with honest first thoughts. No sales talk, promise.",
    "E-Mail": "Email",
    "Meist schnelle Antwort": "Usually a quick reply",
    "Ich mach das nebenbei — aber lange warten lasse ich dich nicht.": "I do this on the side — but I won't keep you waiting long.",
    "Unverbindlich & vertraulich": "No obligation & confidential",
    "Kein Druck. Deine Angaben behandle ich vertraulich.": "No pressure. I treat your details confidentially.",
    "Unternehmen": "Company",
    "Telefon": "Phone",
    "Worum geht's?": "What's it about?",
    "Optional": "Optional",
    "Vor- und Nachname": "First and last name",
    "du@firma.de": "you@company.com",
    "Beschreibe kurz deinen Use-Case oder deine Frage…": "Briefly describe your use case or question…",
    "Ich bin einverstanden, dass meine Angaben zur Bearbeitung meiner Anfrage gespeichert werden. Mehr dazu in der": "I agree that my details may be stored to process my request. More in the",
    "Datenschutzerklärung": "privacy policy",
    "Bitte bestätige die Einwilligung, damit wir dich kontaktieren dürfen.": "Please confirm your consent so I may contact you.",
    "Bitte gib deinen Namen an.": "Please enter your name.",
    "Bitte gib eine gültige E-Mail-Adresse an.": "Please enter a valid email address.",
    "Bitte schreib uns ein, zwei Sätze.": "Please write a sentence or two.",
    "Nachricht senden": "Send message",
    "Bitte prüfe die markierten Felder.": "Please check the highlighted fields.",
    "Wird gesendet …": "Sending …",
    "Danke! Deine Nachricht ist angekommen — ich melde mich. ✦": "Thanks! Your message arrived — I'll be in touch. ✦",
    "Hmm, das hat gerade nicht geklappt. Schreib mir gern direkt an": "Hmm, that didn't work just now. Feel free to email me directly at"
  };

  function getLang() {
    try { return localStorage.getItem(KEY) || 'de'; } catch (e) { return 'de'; }
  }
  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }

  function translate(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE') return NodeFilter.FILTER_REJECT;
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var t = node.nodeValue;
      var core = norm(t);
      if (EN[core] !== undefined) {
        var lead = t.match(/^\s*/)[0], trail = t.match(/\s*$/)[0];
        node.nodeValue = lead + EN[core] + trail;
      }
    });
    root.querySelectorAll('[placeholder]').forEach(function (el) {
      var v = norm(el.getAttribute('placeholder'));
      if (EN[v] !== undefined) el.setAttribute('placeholder', EN[v]);
    });
    root.querySelectorAll('[aria-label]').forEach(function (el) {
      var v = norm(el.getAttribute('aria-label'));
      if (EN[v] !== undefined) el.setAttribute('aria-label', EN[v]);
    });
    var dt = norm(document.title);
    if (EN[dt] !== undefined) document.title = EN[dt];
  }

  function applyLang(lang) {
    document.documentElement.lang = lang;
    if (lang === 'en') translate(document.body);
    var btn = document.getElementById('langToggle');
    if (btn) {
      btn.textContent = lang === 'en' ? 'DE' : 'EN';
      btn.setAttribute('aria-label', lang === 'en' ? 'Auf Deutsch umschalten' : 'Switch to English');
    }
  }

  function init() {
    applyLang(getLang());
    var btn = document.getElementById('langToggle');
    if (btn) btn.addEventListener('click', function () {
      var next = getLang() === 'en' ? 'de' : 'en';
      try { localStorage.setItem(KEY, next); } catch (e) {}
      location.reload();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.aiwmLang = getLang;
  window.AIWM_EN = EN;
})();
