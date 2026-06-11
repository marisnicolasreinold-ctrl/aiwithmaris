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

    // --- Newsletter ---
    "Der Blog ins Postfach.": "The blog, in your inbox.",
    "Jeden Tag erscheint hier ein Artikel über KI im Mittelstand — praktisch, ehrlich, ohne Buzzwords. Du entscheidest, wie oft du Post bekommst. Kostenlos und jederzeit mit einem Klick abbestellbar.": "A new article about AI in business appears here every day — practical, honest, no buzzwords. You decide how often you hear from us. Free, unsubscribe any time with one click.",
    "E-Mail-Adresse*": "Email address*",
    "Name (optional)": "Name (optional)",
    "Firma (optional)": "Company (optional)",
    "Wie oft?": "How often?",
    "Jeden Werktag den neuen Artikel": "The new article every weekday",
    "Einmal pro Woche die Zusammenfassung": "A weekly summary",
    "Anmelden": "Subscribe",
    "Mit deiner Anmeldung stimmst du zu, dass wir deine Angaben zum Versand des Newsletters speichern. Du bekommst zuerst eine Bestätigungs-Mail — erst nach deinem Klick darin geht es los. Abmelden geht jederzeit über den Link in jeder Mail. Details in der": "By signing up you agree that we store your details to send the newsletter. You'll first receive a confirmation email — nothing is sent until you click the link inside. Unsubscribe any time via the link in every email. Details in the",
    "Datenschutzerklärung": "privacy policy",

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
    "Intro ansehen": "Watch intro",
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
    "Ein sprechender KI-Assistent im „Jarvis\"-Stil brieft dich morgens: überfällige Aufträge, Engpässe und To-dos auf einen Blick.": "A talking, Jarvis-style AI assistant briefs you each morning: overdue orders, bottlenecks and to-dos at a glance.",
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
    // --- Scrollytelling: So entsteht dein Projekt ---
    "So arbeiten wir zusammen": "How we work together",
    "Vom Problem zur Software, die läuft.": "From problem to software that runs.",
    "Vier Schritte, ein Durchlauf — scroll dich durch.": "Four steps, one journey — scroll your way through.",
    "Schritt 01 · Das Problem": "Step 01 · The problem",
    "Irgendwo klemmt es.": "Something keeps jamming.",
    "Anfragen stapeln sich, Wissen steckt in Köpfen und PDFs, Routine frisst Stunden. Genau da fangen wir an — bei dem Prozess, der am meisten nervt.": "Requests pile up, knowledge is stuck in heads and PDFs, routine eats hours. That's exactly where we start — with the process that hurts the most.",
    "9+ h": "9+ h",
    "Routine pro Woche und Kopf — typisches Einsparpotenzial": "of routine per week and person — typical savings potential",
    "Schritt 02 · Coaching": "Step 02 · Coaching",
    "Wissen in die Köpfe.": "Knowledge into heads.",
    "Dein Team lernt an den eigenen Aufgaben, was KI wirklich kann — und was nicht. Keine Folienschlacht, sondern Prompts, Werkzeuge und Routinen für den Alltag.": "Your team learns on its own tasks what AI can really do — and what it can't. No slide marathons: prompts, tools and routines for everyday work.",
    "Tag 1": "Day 1",
    "arbeiten wir an euren echten Aufgaben — nicht an Beispielen": "we work on your real tasks — not on examples",
    "Schritt 03 · Software": "Step 03 · Software",
    "Software arbeitet es weg.": "Software works it off.",
    "Was sich wiederholt, baue ich als maßgeschneiderte App oder KI-Agenten: Dokumente lesen, Anfragen beantworten, Daten zusammenführen — geprüft von deinem Team.": "Whatever repeats, I build as a custom app or AI agents: reading documents, answering requests, merging data — reviewed by your team.",
    "82 %": "82 %",
    "der wiederkehrenden Schritte laufen danach automatisch": "of recurring steps then run automatically",
    "Schritt 04 · Deine Cloud": "Step 04 · Your cloud",
    "Läuft. Bei dir.": "Running. On your turf.",
    "Die fertige Lösung läuft in deiner Umgebung — Azure, AWS, Google Cloud oder on-premise. Quellcode gehört dir, Daten bleiben bei dir.": "The finished solution runs in your environment — Azure, AWS, Google Cloud or on-premise. The source code is yours, the data stays with you.",
    "100 %": "100 %",
    "Datenhoheit — deine Cloud, dein Quellcode": "data sovereignty — your cloud, your source code",
    // --- Die lebende Firma ---
    "Die lebende Firma": "The living company",
    "Sieh zu, wie KI eine Firma umbaut.": "Watch AI rebuild a company.",
    "Eine Firma ohne KI": "A company without AI",
    "Anfragen stapeln sich im Vertrieb, der Einkauf rennt Bestellungen hinterher und die Buchhaltung ertrinkt in PDFs.": "Inquiries pile up in sales, purchasing chases after orders and accounting drowns in PDFs.",
    "Modul 01 · DocFlow": "Module 01 · DocFlow",
    "DocFlow übernimmt die Papierarbeit": "DocFlow takes over the paperwork",
    "Eingehende Rechnungen und Lieferscheine werden automatisch gelesen, geprüft und verbucht — die Buchhaltung atmet auf.": "Incoming invoices and delivery notes are read, checked and booked automatically — accounting can finally breathe.",
    "Modul 02 · KI-Agent": "Module 02 · AI Agent",
    "Der KI-Agent übernimmt den Posteingang": "The AI agent takes over the inbox",
    "Anfragen werden sofort eingeordnet und beantwortet. Dein Team prüft nur noch — und gibt frei.": "Inquiries are triaged and answered instantly. Your team only reviews — and approves.",
    "Modul 03 · Cockpit": "Module 03 · Cockpit",
    "Das Cockpit behält den Überblick": "The cockpit keeps watch",
    "Engpässe werden gemeldet, bevor sie entstehen. Die Firma läuft — und dein Team hat den Kopf frei.": "Bottlenecks get flagged before they happen. The company hums along — and your team has headspace again.",
    "Durchlaufzeit": "Lead time",
    "Tage": "days",
    "Automatisch erledigt": "Handled automatically",
    "Scroll — und installier die KI-Module ↓": "Scroll — and install the AI modules ↓",
    "Auftrag einwerfen": "Drop in an order",
    "Stoßzeit simulieren": "Simulate rush hour",
    "Reklamation einwerfen": "Drop in a complaint",
    "live dabei": "watching live",
    "Welche Module braucht deine Firma?": "Which modules does your company need?",
    "Kostenloses Erstgespräch →": "Free intro call →",
    "Live-Ereignisse der Simulation": "Live events from the simulation",
    "Alle Preise sind Endpreise. Gemäß § 19 UStG wird keine Umsatzsteuer ausgewiesen.": "All prices are final. In accordance with Sec. 19 of the German VAT Act (UStG), no VAT is shown.",
    "Vertrieb": "Sales",
    "Einkauf": "Purchasing",
    "Lager": "Warehouse",
    "Buchhaltung": "Accounting",
    "Versand": "Shipping",
    "Anfragen": "Inquiries",
    "Kunde": "Customer",
    "KI-Agent": "AI Agent",
    "Animierte Simulation einer Firma, in der KI-Module nach und nach die Abläufe automatisieren": "Animated simulation of a company where AI modules gradually automate the workflows",

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
    "Eine KI-Kugel im „Jarvis\"-Stil brieft deine Produktionsleitung morgens per Sprache: überfällige, gefährdete und in der Fertigung hängende Aufträge, Prioritäten, Engpässe und To-dos auf einen Blick. Live im Browser, ohne Login.": "A Jarvis-style AI orb briefs your production team each morning by voice: overdue, at-risk and stuck orders, priorities, bottlenecks and to-dos at a glance. Live in the browser, no login.",
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
    "Hinter „AI with Maris\" steckt genau eine Person: ich — Maris Reinold, Ingenieur (M. Eng.) mit 17 Jahren Berufserfahrung, gesammelt in mehreren Unternehmen, Abteilungen und Funktionen. Ich bin von KI begeistert, baue Software und probiere ständig aus, was sich automatisieren lässt. Du sprichst also direkt mit dem, der baut und coacht — kein Account-Management-Pingpong, keine Blackbox.": "Behind “AI with Maris” there's exactly one person: me — Maris Reinold, an engineer (M. Eng.) with 17 years of professional experience gathered across several companies, departments and roles. I'm passionate about AI, I build software and I'm constantly trying out what can be automated. So you talk directly to the person who builds and coaches — no account-management ping-pong, no black box.",
    "Aus diesem breiten Blick auf Technik, Prozesse und Menschen ist auch mein KI-Leitfaden für den Mittelstand entstanden — mein Motto steht auf dem Cover:": "That broad view of technology, processes and people is also where my AI guide for mid-sized companies comes from — my motto is right on the cover:",
    "„Anfangen, wo es zählt.\"": "“Start where it counts.”",
    "Ingenieur (M. Eng.) · KI & Software": "Engineer (M. Eng.) · AI & software",
    "Jahre Berufserfahrung": "Years of professional experience",
    "Live-Demos zum Ausprobieren": "Live demos to try out",
    "KI-Leitfaden — DE & EN": "AI guide — DE & EN",
    "Sprachen — Deutsch & Englisch": "Languages — German & English",

    // --- Startseite: Persona-Teaser ---
    "Wer dahinter steckt": "Who's behind this",
    "Ingenieur. Macher. Eine Person.": "Engineer. Maker. One person.",
    "Ich bin Maris Reinold — Ingenieur (M. Eng.) mit 17 Jahren Berufserfahrung, gesammelt in mehreren Unternehmen, Abteilungen und Funktionen. Aus diesem Blick auf Technik, Prozesse und Menschen entstehen diese Seite, die Demos und der KI-Guide.": "I'm Maris Reinold — an engineer (M. Eng.) with 17 years of professional experience gathered across several companies, departments and roles. That view of technology, processes and people is what this site, the demos and the AI guide grow out of.",
    "Mehr über mich": "More about me",

    // --- Guide: Video-Band ---
    "In 15 Sekunden": "In 15 seconds",
    "Der Guide im Schnelldurchlauf.": "The guide, fast-forwarded.",
    "KI-Guide Video-Vorschau": "AI guide video preview",

    // --- Leistungen: Abteilungs-Sektion (ehemals Lösungen) ---
    "Automatisierung für jede deiner Abteilungen.": "Automation for every one of your departments.",
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
    "Ganz ehrlich: Aktuell ist das hier mehr Lern- und Bastelprojekt als Firma. Feste Preise für Projekte gibt's deshalb noch nicht — mit einer Ausnahme: dem KI-Guide als PDF zum Festpreis. Für alles andere gilt: Schreib mir einfach, dann finden wir gemeinsam etwas Faires.": "Honestly: right now this is more a learning and tinkering project than a company. So there are no fixed prices for projects yet — with one exception: the AI guide as a PDF at a fixed price. For everything else: just message me and we'll find something fair together.",
    "Festpreis · PDF": "Fixed price · PDF",
    "Der KI-Guide": "The AI Guide",
    "ab 19 €": "from €19",
    "„Anfangen, wo es zählt\" — der Leitfaden zur KI-Einführung im Mittelstand. 38 Seiten, 17 Kapitel, 10 Vorlagen & Checklisten. Auf Deutsch und Englisch, als Sofort-Download.": "“Start where it counts” — the guide to adopting AI in mid-sized companies. 38 pages, 17 chapters, 10 templates & checklists. In German and English, as an instant download.",
    "Bundle DE + EN für 29 €": "Bundle DE + EN for €29",
    "Zum KI-Guide": "To the AI Guide",
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
    "Hmm, das hat gerade nicht geklappt. Schreib mir gern direkt an": "Hmm, that didn't work just now. Feel free to email me directly at",

    // --- Navigation: Guide ---
    "KI-Guide": "AI Guide",

    // --- Startseite: Intro-Band ---
    "Das Intro": "The intro",
    "In 15 Sekunden: wer hier baut.": "15 seconds: who's building here.",
    "Mit Ton ansehen": "Watch with sound",
    "AI with Maris Intro-Video": "AI with Maris intro video",

    // --- Startseite: Guide-Teaser ---
    "Neu · Als PDF kaufen": "New · Buy as PDF",
    "Der KI-Guide für den Mittelstand: Anfangen, wo es zählt.": "The AI guide for mid-sized companies: start where it counts.",
    "38 Seiten Klartext zur KI-Einführung — ohne Buzzwords: klein anfangen, wo es am meisten klemmt, den Nutzen in 90 Tagen beweisen und erst dann skalieren. Mit 10 sofort nutzbaren Vorlagen & Checklisten, auf Deutsch und Englisch.": "38 pages of straight talk on adopting AI — no buzzwords: start small where it hurts most, prove the value in 90 days and only then scale. With 10 ready-to-use templates & checklists, in German and English.",
    "Zum KI-Guide — ab 19 €": "To the AI guide — from €19",
    "Inhaltsverzeichnis ansehen": "See the table of contents",

    // --- Beispiele: Live-Embeds ---
    "Live-Demo hier laden": "Load live demo here",
    "agent-flow · direkt eingebettet": "agent-flow · embedded right here",
    "atlas · direkt eingebettet": "atlas · embedded right here",
    "apex · direkt eingebettet": "apex · embedded right here",
    "Das komplette Produktions-Cockpit samt sprechendem KI-Assistenten läuft direkt hier auf der Seite. Lade die Demo und lass dich briefen.": "The complete production cockpit including the talking AI assistant runs right here on the page. Load the demo and get your briefing.",
    "Der Garmin-KI-Coach läuft direkt hier auf der Seite — Trainingsbereitschaft, HRV und Schlaf werden zu deinem Tagesplan. Lade die Demo und probier es aus.": "The Garmin AI coach runs right here on the page — training readiness, HRV and sleep become your plan for the day. Load the demo and try it.",
    "Der komplette KI-Agenten-Workflow läuft direkt hier auf der Seite — Anfrage triagieren, Antwort entwerfen, prüfen, freigeben. Lade die Demo und probier es selbst aus.": "The complete AI agent workflow runs right here on the page — triage the request, draft the reply, review, approve. Load the demo and try it yourself.",

    // --- Guide-Seite ---
    "KI-Guide — „Anfangen, wo es zählt\" als PDF — AI with Maris": "AI Guide — “Start where it counts” as a PDF — AI with Maris",
    "PDF · 38 Seiten": "PDF · 38 pages",
    "Deutsch & Englisch": "German & English",
    "Sofort-Download": "Instant download",
    "Anfangen,": "Start where",
    "wo es zählt.": "it counts.",
    "Der umfassende Leitfaden, wie ein mittelständisches Unternehmen KI einführt, ohne sich zu verzetteln: klein anfangen, wo es am meisten klemmt, den Nutzen beweisen — und erst dann in die Breite gehen.": "The complete guide to how a mid-sized company adopts AI without spreading itself thin: start small where it hurts most, prove the value — and only then scale out.",
    "Jetzt kaufen — ab 19 €": "Buy now — from €19",
    "Was drin steckt": "What's inside",
    "17 Kapitel": "17 chapters",
    "10 Vorlagen & Checklisten": "10 templates & checklists",
    "90-Tage-Pilotplan": "90-day pilot plan",
    "ROI-Rechenhilfe": "ROI worksheet",
    "KI · Mittelstand": "AI · SME",
    "Anfangen, wo es zählt": "Start where it counts",
    "Leitfaden & Strategiepapier für Geschäftsführung, Projektleitung und Fachbereiche.": "Guide & strategy paper for executive leadership, project leads and departments.",
    "„Über KI wird gerade viel geredet und wenig gerechnet. In den meisten Häusern liegt irgendwo eine Lizenz, ein paar Kolleginnen und Kollegen probieren etwas aus, und zum Quartalsende kann niemand genau sagen, was dabei herausgekommen ist. Das ist kein Technikproblem. Es ist die Folge davon, dass überall ein bisschen angefangen wird und nirgends richtig.\"": "“There is a lot of talk about AI right now and very little arithmetic. In most organisations a licence sits somewhere, a few colleagues are trying things out, and by the end of the quarter no one can say exactly what came of it. That is not a technology problem. It is the result of starting a little bit everywhere and nowhere properly.”",
    "Auszug · Kapitel 1 — Worum es geht": "Excerpt · Chapter 1 — What this is about",
    "Inhalt": "Contents",
    "17 Kapitel. Ein roter Faden.": "17 chapters. One through-line.",
    "Von der ehrlichen Bestandsaufnahme über Pilot, Recht und Menschen bis zu Werkzeugen und Zahlen — mit konkreten Beispielen und sofort nutzbaren Vorlagen.": "From an honest assessment through pilot, law and people to tools and numbers — with concrete examples and ready-to-use templates.",
    "Worum es geht": "What this is about",
    "Grundsätze": "Principles",
    "Wie wir vorgehen": "How we proceed",
    "Ehrlich anfangen: wo wir stehen": "An honest start: where we stand",
    "Wer das treibt": "Who drives it",
    "Wo es sich lohnt": "Where it pays off",
    "Der erste Schritt: der Pilot": "The first step: the pilot",
    "In die Breite": "Scaling out",
    "Dranbleiben": "Staying with it",
    "Was uns schützt: Recht und Risiko": "What protects us: law and risk",
    "Die Menschen mitnehmen": "Bringing people along",
    "Werkzeuge": "Tools",
    "Was es kostet, was es bringt": "What it costs, what it returns",
    "Woran es meistens scheitert": "Where it usually fails",
    "Die ersten 90 Tage": "The first 90 days",
    "Die Entscheidung": "The decision",
    "Anhang — 10 Vorlagen & Checklisten: Use-Case-Steckbrief, RACI-Matrix, Pilot-Checkliste, Recht- & Compliance-Checkliste, Kick-off-Agenda, Werkzeug-Bewertungsbogen, ROI-Rechenhilfe, Prompt-Spickzettel, Bausteine einer Betriebsvereinbarung, Kurzglossar": "Appendix — 10 templates & checklists: use-case profile, RACI matrix, pilot checklist, legal & compliance checklist, kick-off agenda, tool evaluation scorecard, ROI worksheet, prompt cheat sheet, building blocks of a works agreement, glossary",
    "Für wen": "Who it's for",
    "Geschrieben für Entscheider, nicht für Techniker.": "Written for decision-makers, not for technicians.",
    "Du willst wissen, was KI wirklich bringt, was es kostet und wie du startest, ohne dich zu verzetteln — inklusive Entscheidungsvorlage.": "You want to know what AI really delivers, what it costs and how to start without spreading yourself thin — decision template included.",
    "Projektleitung": "Project lead",
    "Du sollst das Thema treiben und brauchst einen gangbaren Plan: Team, Mandat, Pilot, Messgrößen und die ersten 90 Tage.": "You're meant to drive the topic and need a workable plan: team, mandate, pilot, metrics and the first 90 days.",
    "Fachbereiche": "Departments",
    "Du willst verstehen, wo KI im Alltag hilft, welche Spielregeln gelten und wie ihr eure echten Schmerzpunkte einbringt.": "You want to understand where AI helps day to day, which ground rules apply and how to bring in your real pain points.",
    "Kaufen": "Buy",
    "Wähle deine Ausgabe.": "Choose your edition.",

    // --- Guide-Seite: Shop-Neuaufbau ---
    "4 Leitfäden · PDF": "4 guides · PDF",
    "Zum Shop — ab 8 €": "To the shop — from €8",
    "Vertiefung": "Deep dive",
    "Wähle deinen Leitfaden.": "Choose your guide.",
    "Vier Titel als PDF — jeweils auf Deutsch und Englisch. Sichere Zahlung über Stripe — Download und Rechnung direkt nach dem Kauf.": "Four titles as PDFs — each in German and English. Secure payment via Stripe — download and invoice right after purchase.",
    "Der Hauptguide": "The main guide",
    "Der Leitfaden zur KI-Einführung im Mittelstand — klein anfangen, Nutzen beweisen, dann skalieren.": "The guide to adopting AI in mid-sized companies — start small, prove the value, then scale.",
    "90-Tage-Pilotplan & ROI-Rechenhilfe": "90-day pilot plan & ROI worksheet",
    "Ausgabe wählen": "Choose edition",
    "Englisch": "English",
    "Beide (DE + EN)": "Both (DE + EN)",
    "Vertiefung · DE + EN": "Deep dive · DE + EN",
    "In 17 Sekunden": "In 17 seconds",
    "Vier Leitfäden im Schnelldurchlauf.": "Four guides, fast-forwarded.",
    "KI-Bibliothek Video-Vorschau": "AI library video preview",
    "Was steckt in der KI-Bibliothek?": "What's in the AI Library?",
    "Alle vier Leitfäden — „Anfangen, wo es zählt\", der Prompt-Werkzeugkasten, DSGVO & KI und Make or Buy — jeweils auf Deutsch und Englisch, also 8 PDFs. Du sparst 40 € gegenüber dem Einzelkauf.": "All four guides — “Start where it counts”, the Prompt Toolbox, GDPR & AI and Make or Buy — each in German and English, i.e. 8 PDFs. You save €40 compared to buying them separately.",
    "Bestellung bestätigen": "Confirm your order",
    "Abbrechen": "Cancel",
    "Weiter zur Kasse": "Continue to checkout",
    "Zahlung über Stripe · Download & Rechnung direkt danach": "Payment via Stripe · download & invoice right after",
    "Sichere Zahlung über Stripe. Direkt nach dem Kauf bekommst du deinen Download-Link — plus Rechnung per E-Mail.": "Secure payment via Stripe. Right after purchase you get your download link — plus an invoice by email.",
    "Ich verlange ausdrücklich, dass mit der Bereitstellung des Downloads sofort begonnen wird, und bestätige meine Kenntnis, dass mein Widerrufsrecht mit Beginn des Downloads erlischt. Da es sich um ein digitales Produkt handelt, ist eine Rückgabe oder Erstattung ausgeschlossen. Es gelten die": "I expressly request that delivery of the download begins immediately and confirm that I am aware that my right of withdrawal expires once the download begins. As this is a digital product, returns and refunds are excluded. Subject to the",
    "Deutsch": "German",
    "Der Leitfaden (DE)": "The Guide (DE)",
    "einmalig": "one-time",
    "„Anfangen, wo es zählt\" — die deutsche Ausgabe als PDF.": "“Start where it counts” — the German edition as a PDF.",
    "38 Seiten, 17 Kapitel": "38 pages, 17 chapters",
    "PDF kaufen (DE)": "Buy PDF (DE)",
    "Bundle · Bestes Angebot": "Bundle · Best value",
    "Beide Ausgaben (DE + EN)": "Both editions (DE + EN)",
    "Deutsch und Englisch zusammen — ideal für Teams, die in beiden Sprachen arbeiten.": "German and English together — ideal for teams working in both languages.",
    "Beide PDFs im Paket": "Both PDFs in one package",
    "9 € gespart gegenüber Einzelkauf": "Save €9 vs. buying separately",
    "Bundle kaufen": "Buy bundle",
    "36 Seiten, 17 Kapitel": "36 pages, 17 chapters",
    "PDF kaufen (EN)": "Buy PDF (EN)",
    "Hoppla, das hat nicht geklappt. Versuch es bitte nochmal oder schreib mir.": "Oops, that didn't work. Please try again or message me.",
    "Neu": "New",
    "Die Vertiefungs-Leitfäden.": "The deep-dive guides.",
    "Drei neue eBooks — jeweils Deutsch und Englisch zusammen im Paket. Gleiche sichere Zahlung, gleicher Sofort-Download.": "Three new ebooks — each with German and English bundled together. Same secure payment, same instant download.",
    "Neu · PDF DE+EN": "New · PDF DE+EN",
    "Der Prompt-Werkzeugkasten": "The Prompt Toolbox",
    "50 erprobte KI-Vorlagen für den Alltag — von Vertrieb bis Buchhaltung.": "50 field-tested AI templates for daily work — from sales to accounting.",
    "50 Copy-Paste-Vorlagen in 8 Abteilungen": "50 copy-paste templates across 8 departments",
    "Mit Anpassungstipps & Stolperfallen": "With adaptation tips & pitfalls",
    "Deutsch + Englisch im Paket": "German + English included",
    "Werkzeugkasten kaufen": "Buy the toolbox",
    "DSGVO & KI — Der Praxisleitfaden": "GDPR & AI — The Practical Guide",
    "KI einführen, ohne den Datenschutz zu verlieren — mit fertiger KI-Richtlinie für dein Team.": "Adopt AI without losing control of data protection — incl. a ready-to-use AI policy for your team.",
    "Daten-Ampel & AVV-Checkliste": "Data traffic-light & DPA checklist",
    "KI-Richtlinie als Vorlage + EU AI Act in Klartext": "AI policy template + EU AI Act in plain language",
    "Leitfaden kaufen": "Buy the guide",
    "Make or Buy — KI-Software entscheiden": "Make or Buy — Deciding on AI Software",
    "Fertig kaufen, anpassen oder bauen lassen? Das Framework für die teuerste Entscheidung deines Projekts.": "Buy off the shelf, customize, or build? The framework for the most expensive decision in your project.",
    "Scoring-Framework & 3-Jahres-Kostenmodell": "Scoring framework & 3-year cost model",
    "10 Anbieter-Fragen & Ausschreibungs-Vorlage": "10 vendor questions & RFP template",
    "Entscheidungshilfe kaufen": "Buy the framework",
    "Komplettpaket · Bestes Angebot": "Complete package · Best value",
    "Die KI-Bibliothek — alle 4 Leitfäden": "The AI Library — all 4 guides",
    "„Anfangen, wo es zählt\" plus alle drei Vertiefungs-Leitfäden — jeweils Deutsch und Englisch.": "“Start where it counts” plus all three deep-dive guides — each in German and English.",
    "Alle 4 Titel in beiden Sprachen (8 PDFs)": "All 4 titles in both languages (8 PDFs)",
    "40 € gespart gegenüber Einzelkauf": "Save €40 vs. buying separately",
    "Bibliothek kaufen": "Buy the library",
    "Sichere Zahlung über Stripe": "Secure payment via Stripe",
    "Download direkt nach dem Kauf": "Download right after purchase",
    "Rechnung inklusive": "Invoice included",
    "Gut zu wissen": "Good to know",
    "Kurze Antworten vor dem Kauf.": "Quick answers before you buy.",
    "Wie bekomme ich das PDF nach dem Kauf?": "How do I get the PDF after purchase?",
    "Direkt nach der Zahlung wirst du auf eine Download-Seite weitergeleitet. Dort lädst du dein PDF (beim Paket alle) sofort herunter — und deine Rechnung gleich mit.": "Right after payment you are redirected to a download page where you can download your PDF (all of them, if you bought a package) right away — along with your invoice.",
    "Kann ich den Kauf zurückgeben?": "Can I return my purchase?",
    "Nein. Es handelt sich um ein digitales Produkt mit Sofort-Download. Mit deiner ausdrücklichen Zustimmung vor dem Kauf erlischt dein Widerrufsrecht — eine Rückgabe oder Erstattung ist deshalb ausgeschlossen. Sollte die Datei defekt sein, bekommst du selbstverständlich Ersatz.": "No. This is a digital product with an instant download. With your express consent before purchase your right of withdrawal expires — returns and refunds are therefore excluded. If the file is ever defective, you will of course get a replacement.",
    "Darf ich das PDF im Team weitergeben?": "May I share the PDF with my team?",
    "Der Kauf gilt für deinen eigenen Gebrauch bzw. den internen Gebrauch in deinem Unternehmen. Bitte stell das PDF nicht öffentlich ins Netz. Für größere Teams oder Schulungen schreib mir einfach.": "Your purchase covers your own use or internal use within your company. Please don't post the PDF publicly. For larger teams or trainings, just message me.",
    "Welche Zahlarten gibt es?": "Which payment methods are available?",
    "Die Zahlung läuft über Stripe — je nach Land z. B. Kreditkarte, Apple Pay, Google Pay oder weitere lokale Methoden. Deine Zahlungsdaten sehe ich dabei nie.": "Payment runs via Stripe — depending on your country e.g. credit card, Apple Pay, Google Pay or other local methods. I never see your payment details.",
    "Noch unsicher?": "Still unsure?",
    "Schreib mir, wenn du vor dem Kauf eine Frage hast — ich antworte ehrlich, ob der Guide zu deiner Situation passt.": "Message me if you have a question before buying — I'll tell you honestly whether the guide fits your situation.",
    "Frag mich": "Ask me",

    // --- Danke-Seite ---
    "Danke für deinen Kauf — AI with Maris": "Thank you for your purchase — AI with Maris",
    "Dein Download": "Your download",
    "Einen Moment …": "One moment …",
    "Wir prüfen gerade deine Zahlung.": "We're verifying your payment.",
    "Tipp: Speichere die Dateien direkt ab. Deine Rechnung findest du oben als eigenen Button. Bei Problemen schreib mir an": "Tip: save the files right away. You'll find your invoice as its own button above. If anything goes wrong, email me at"
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

  // Promo-Videos: bei Englisch die EN-Fassung laden (…-de.mp4 → …-en.mp4)
  function swapPromoVideos(lang) {
    if (lang !== 'en') return;
    document.querySelectorAll('video[data-promo-video]').forEach(function (v) {
      var s = v.querySelector('source');
      if (s && /-de\.mp4$/.test(s.getAttribute('src'))) {
        s.setAttribute('src', s.getAttribute('src').replace(/-de\.mp4$/, '-en.mp4'));
        v.load();
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      }
    });
  }

  function applyLang(lang) {
    document.documentElement.lang = lang;
    if (lang === 'en') translate(document.body);
    swapPromoVideos(lang);
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
