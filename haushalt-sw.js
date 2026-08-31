/*
  Service Worker fuer den Wohnungsplan.

  Liegt im Zielrepo bewusst in der Wurzel als /haushalt-sw.js und nicht unter
  /haushalt/: Ein Worker darf nur ueber sein eigenes Verzeichnis herrschen.
  Aus /haushalt/sw.js waere der Geltungsbereich /haushalt/ — und die Seite
  selbst liegt unter /haushalt, ohne Schraegstrich, also knapp daneben.

  Der Push kommt ohne Nutzlast. Er weckt nur; den Text holt sich der Worker
  aus dem gemeinsamen Stand. So gibt es keinen zweiten Kryptopfad, der still
  falsch sein koennte.
*/

const DB = 'https://amrdmnnijbfwtrjcpocl.supabase.co'
const DB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtcmRtbm5pamJmd3RyamNwb2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTU0OTcsImV4cCI6MjA5NjQzMTQ5N30.y-9eLzeQKDlHzSG3_ro-ThAnnpnAEKLTWS8NMrpSXCI'

const IDB_NAME = 'zimmer-fuer-zimmer'
const IDB_LAGER = 'sitzung'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

// Mit Frist: Ein blockierter Speicher (privater Modus, gesperrte Website-Daten)
// laesst die Anfrage sonst einfach offen. Der Push-Handler haenge dann ewig,
// und der Browser zeigt statt der Meldung seinen eigenen Platzhalter.
function mitFrist(versprechen, ms, ersatz) {
  return Promise.race([
    versprechen,
    new Promise((fertig) => setTimeout(() => fertig(ersatz), ms)),
  ])
}

function idb() {
  return new Promise((fertig, schief) => {
    const anfrage = indexedDB.open(IDB_NAME, 1)
    anfrage.onupgradeneeded = () => {
      if (!anfrage.result.objectStoreNames.contains(IDB_LAGER)) {
        anfrage.result.createObjectStore(IDB_LAGER)
      }
    }
    anfrage.onsuccess = () => fertig(anfrage.result)
    anfrage.onerror = () => schief(anfrage.error)
  })
}

async function lies() {
  try {
    const db = await mitFrist(idb(), 1500, null)
    if (!db) return null
    return await mitFrist(new Promise((fertig) => {
      const a = db.transaction(IDB_LAGER, 'readonly').objectStore(IDB_LAGER).get('aktuell')
      a.onsuccess = () => fertig(a.result || null)
      a.onerror = () => fertig(null)
    }), 1500, null)
  } catch (_) {
    return null
  }
}

async function schreib(wert) {
  try {
    const db = await mitFrist(idb(), 1500, null)
    if (!db) return
    await mitFrist(new Promise((fertig) => {
      const a = db.transaction(IDB_LAGER, 'readwrite').objectStore(IDB_LAGER).put(wert, 'aktuell')
      a.onsuccess = () => fertig()
      a.onerror = () => fertig()
    }), 1500, null)
  } catch (_) {
    /* ohne Gedaechtnis wird die Meldung eben zweimal gezeigt */
  }
}

// Die Seite reicht Token und Namen herein, sobald sie verbunden ist.
self.addEventListener('message', (ev) => {
  if (ev.data && ev.data.art === 'sitzung') {
    ev.waitUntil(schreib({ token: ev.data.token, wer: ev.data.wer, gesehen: 0 }))
  }
  if (ev.data && ev.data.art === 'abmelden') {
    ev.waitUntil(schreib(null))
  }
})

self.addEventListener('push', (ev) => {
  ev.waitUntil((async () => {
    const allgemein = { titel: 'Zimmer für Zimmer', text: 'Es gibt etwas Neues im Plan.' }
    let zeigen = allgemein

    const sitzung = await lies()
    if (sitzung && sitzung.token) {
      try {
        const antwort = await fetch(DB + '/rest/v1/rpc/haushalt_lesen', {
          method: 'POST',
          headers: { apikey: DB_KEY, Authorization: 'Bearer ' + DB_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ t: sitzung.token }),
        })
        if (antwort.ok) {
          const stand = await antwort.json()
          const m = stand && stand.daten && stand.daten.meldung
          // Nur zeigen, was an mich gerichtet und neuer als das zuletzt
          // Gezeigte ist — sonst wiederholt sich dieselbe Meldung.
          if (m && m.an === sitzung.wer && (m.zeit || 0) > (sitzung.gesehen || 0)) {
            zeigen = { titel: m.titel || 'Zimmer für Zimmer', text: m.text || allgemein.text }
            await schreib({ ...sitzung, gesehen: m.zeit })
          } else if (m && m.an !== sitzung.wer) {
            // Die Meldung galt der anderen Person. Ein Push muss trotzdem
            // sichtbar werden, sonst meckert der Browser — also knapp halten.
            zeigen = { titel: 'Zimmer für Zimmer', text: 'Im Plan hat sich etwas geändert.' }
          }
        }
      } catch (_) {
        /* offline: es bleibt bei der allgemeinen Meldung */
      }
    }

    await self.registration.showNotification(zeigen.titel, {
      body: zeigen.text,
      tag: 'wohnungsplan',
      renotify: true,
      badge: undefined,
      data: { url: '/haushalt' },
    })
  })())
})

self.addEventListener('notificationclick', (ev) => {
  ev.notification.close()
  ev.waitUntil((async () => {
    const ziel = (ev.notification.data && ev.notification.data.url) || '/haushalt'
    const fenster = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const f of fenster) {
      if (f.url.includes('/haushalt')) return f.focus()
    }
    return self.clients.openWindow(ziel)
  })())
})
