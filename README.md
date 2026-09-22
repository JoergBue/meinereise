# MeineReise – App (Design: Modern & Minimal)

Kleine Node-App (bewusst ohne Express oder andere Abhängigkeiten – nur
Node-Bordmittel: `http`, `fs`, `path`), die eine gebuchte Reise (aus der
BOSYS UI.SPACE Traveller API, Funktion `GetReiseData`) im Design "Modern &
Minimal" darstellt: Reiseübersicht, Reiseplan, Zusatzleistungen und
Dokumente. Ab ~900px Fensterbreite schaltet die App automatisch auf ein
breiteres Desktop-Layout mit Seitennavigation um.

Repository: https://github.com/JoergBue/meinereise

## Aufruf-URL

Die App erwartet die `travelID` als Hash-Fragment:

```
https://<deine-domain>/#291922
```

Das Hash-Fragment wird nicht an den Server gesendet – der Browser liest es
per JavaScript aus und ruft dann `/api/reisedaten?travelID=291922` auf der
eigenen App auf.

## Setup

```bash
npm install
cp .env.example .env
# .env mit den echten Werten befüllen (siehe unten)
npm start
```

Die App läuft danach auf `http://localhost:3000`.

## .env

Alle Zugangsdaten für die BOSYS-Schnittstelle stehen ausschließlich in
`.env` (wird serverseitig von `server.js` gelesen, landet nie im Browser):

| Variable            | Bedeutung                                             |
|---------------------|--------------------------------------------------------|
| `BOSYS_GATEWAY_URL`  | Endpunkt der Traveller API (POST, JSON). `BOSYS_API_URL` wird als älterer Alias weiterhin gelesen. |
| `BOSYS_SOURCE`       | Header.Source, Standard: `e-confirm`                   |
| `BOSYS_TERMINAL`     | Header.BOSYSTerminal, Standard: `1`                      |
| `BOSYS_TOKEN`        | Header.Token (Authentifizierungstoken) – optional, falls das Gateway (noch) keinen verlangt |
| `BOSYS_SESSION_ID`   | GetReiseData.sessionID (daraus liest BOSYS Firma/Büro/Kunde) |
| `BOSYS_OFFICE_TOKEN` | GetOffice.Token (der "HashKey") für den Bereich "Mein Reisebüro" – unabhängig von `BOSYS_SESSION_ID`/travelID |
| `GOOGLE_PLACES_API_KEY` | API-Key für "In der Nähe" (Google Places API "New") – unabhängig von BOSYS |
| `WHATSAPP_OFFICE_NUMBER` | WhatsApp-Nummer des Büros für den Kontakt-Button in "Mein Reisebüro" – unabhängig von BOSYS |
| `PORT`               | lokaler Port, Standard `3000`                           |

Zwingend für den Live-Modus sind nur `BOSYS_GATEWAY_URL` und
`BOSYS_SESSION_ID`. Fehlt eines der beiden, oder schlägt der Live-Aufruf
fehl (Netzwerkfehler, Timeout, Fehlerstatus), liefert `/api/reisedaten`
automatisch die Demo-Reise aus `demoData.js` aus (Sizilien-Beispiel) – im
Frontend erscheint dann ein Hinweisbanner "Demo-Daten". So lässt sich die
App sofort ausprobieren, ohne dass die echte Schnittstelle schon erreichbar
ist. `BOSYS_TERMINAL`, `BOSYS_TOKEN` und `BOSYS_SOURCE` werden, wenn leer,
einfach als leerer String bzw. Standardwert mitgeschickt – falls das
Ziel-Gateway sie zwingend verlangt, meldet es das über einen Fehlerstatus,
und die App fällt auf Demo-Daten zurück (mit Fehlermeldung in der
Server-Konsole).

Der Bereich "Mein Reisebüro" (`/api/office`, Funktion `GetOffice`) läuft
unabhängig davon über `BOSYS_OFFICE_TOKEN`: Fehlt dieser, oder schlägt der
Live-Aufruf fehl, liefert `/api/office` Demo-Reisebüro-Daten (Team,
Öffnungszeiten, Kontakt) – ohne dass dafür `BOSYS_SESSION_ID` gesetzt sein
muss.

"In der Nähe" im Reiseplan (`/api/places`) ist komplett unabhängig von
BOSYS: Zum Standort des Hotels eines Reisetags (`locationLatitude`/
`locationLongitude`, sofern vorhanden) werden über die Google Places API
("New", `searchNearby`) nahegelegene Restaurants und Sehenswürdigkeiten
angezeigt. Ohne `GOOGLE_PLACES_API_KEY`, oder wenn der Live-Aufruf
fehlschlägt, liefert `/api/places` feste Demo-Orte statt eines Fehlers.
Ergebnisse werden serverseitig 30 Minuten pro Standort gecacht, um die
Anzahl kostenpflichtiger Places-Aufrufe gering zu halten. Voraussetzung für
den Live-Betrieb: in der Google Cloud Console ein Projekt mit aktivierter
"Places API (New)" und eingerichtetem Billing, der API-Key sollte auf HTTP-
Referrer bzw. IP der eigenen Domain eingeschränkt werden.

Der "Per WhatsApp kontaktieren"-Button in "Mein Reisebüro" (`/api/office`
liefert dafür das Feld `whatsapp`) nutzt `WHATSAPP_OFFICE_NUMBER`, falls
gesetzt – GetOffice liefert selbst keine WhatsApp-Nummer. Ohne diese
Variable fällt der Button auf `MyOffice.phone` zurück, was oft eine normale
Festnetznummer und damit nicht WhatsApp-fähig ist. Format ist beliebig
(mit/ohne `+`, mit/ohne führende `00`/`0`) – wird automatisch normalisiert.

## Deployment auf Hostinger (hPanel, Node.js-App)

Voraussetzung: Die Subdomain `meinereise.trueluff.de` existiert bereits bei
Hostinger. Die App liegt komplett in diesem GitHub-Repository
(`JoergBue/meinereise`), Hostinger kann direkt von dort deployen.

1. **hPanel öffnen** → Websites → die passende Domain (`trueluff.de`)
   auswählen → **Node.js** (unter "Erweitert"/"Advanced").
2. **Neue App anlegen** → "Node.js-App erstellen" bzw. "Website hinzufügen".
3. Als Quelle **"Git-Repository importieren"** wählen und die Repo-URL
   `https://github.com/JoergBue/meinereise` angeben (bei Bedarf GitHub-Konto
   verbinden/autorisieren). Branch: `main`.
4. Framework: **"Other"/"Sonstiges"** wählen (kein Next.js/Nuxt o.ä.).
   **Entry-/Startdatei:** `server.js`.
5. **Node.js-Version**: 18, 20, 22 oder 24 – alle unterstützt
   (`package.json` verlangt nur `>=18`), 20 oder 22 (aktuelle LTS)
   empfohlen.
6. **Domain/Subdomain zuweisen**: `meinereise.trueluff.de` als Domain für
   diese Node.js-App eintragen. SSL (Let's Encrypt) in hPanel für die
   Subdomain aktivieren, falls nicht automatisch geschehen.
7. **Umgebungsvariablen** in hPanel unter "Environment Variables" eintragen
   (Werte aus dem echten BOSYS-Zugang, siehe Tabelle oben – **niemals**
   `.env` selbst hochladen, sie ist absichtlich nicht im Repo):

   ```
   BOSYS_GATEWAY_URL=<echte Gateway-URL>
   BOSYS_TERMINAL=<Terminal-Wert>
   BOSYS_TOKEN=<Token, falls vorhanden>
   BOSYS_SOURCE=e-confirm
   BOSYS_SESSION_ID=<echte sessionID>
   BOSYS_OFFICE_TOKEN=<HashKey für Mein Reisebüro, falls vorhanden>
   GOOGLE_PLACES_API_KEY=<Google-Places-API-Key, falls vorhanden>
   WHATSAPP_OFFICE_NUMBER=<WhatsApp-Nummer des Büros, falls vorhanden>
   ```

   `PORT` nicht selbst setzen – Hostinger gibt den Port über die Umgebung
   vor, `server.js` liest ihn automatisch aus `process.env.PORT`. Solange
   `BOSYS_GATEWAY_URL`/`BOSYS_SESSION_ID` noch fehlen, läuft die App
   trotzdem – dann eben mit Demo-Daten und Hinweisbanner, bis die echten
   Werte eingetragen sind.
8. **Deploy** anstoßen. hPanel führt `npm install` (keine Abhängigkeiten
   vorhanden, geht schnell) und dann `npm start` (→ `node server.js`) aus.
9. Nach erfolgreichem Deploy: `https://meinereise.trueluff.de/#<travelID>`
   aufrufen und prüfen, ob die Reise (live oder Demo) korrekt angezeigt
   wird.

**Updates ausrollen:** Änderungen lokal committen und zu
`JoergBue/meinereise` (Branch `main`) pushen, dann in hPanel bei der
Node.js-App auf "Redeploy" klicken (bzw. Auto-Deploy aktivieren, falls
hPanel das anbietet).

**Troubleshooting:** hPanel zeigt Build-/Runtime-Logs der Node.js-App an
(Menüpunkt "Logs"). Fehler bei einem Live-Aufruf landen dort als
`[GetReiseData] Live-Aufruf fehlgeschlagen: …` bzw.
`[GetDokument] Aufruf fehlgeschlagen: …` – die App fällt in dem Fall auf
Demo-Daten zurück statt abzustürzen.

## Zum Home-Bildschirm hinzufügen (PWA)

Die App lässt sich auf dem Smartphone installieren (eigenes Icon, läuft im
Vollbild ohne Browser-Leiste): `public/manifest.json` (Name, Icons unter
`public/icons/`, `display: standalone`) plus die `apple-mobile-web-app-*`-
Meta-Tags in `index.html` für Safari sowie ein bewusst minimaler Service
Worker (`public/sw.js`, **ohne** Offline-Caching – Reisedaten sollen bei
jedem Aufruf frisch vom Server kommen, kein veralteter Stand unterwegs).

In der App selbst zeigt ein dezenter Banner auf der Startseite, wie man die
App hinzufügt (`renderInstallBanner()` in `app.js`):
- **Android/Chrome & Co.**: nutzt das native `beforeinstallprompt`-Event für
  einen echten "Installieren"-Button.
- **iOS/Safari**: kann das nicht programmatisch auslösen, zeigt daher nur
  die Anleitung ("Teilen" → "Zum Home-Bildschirm").

Einmal weggeklickt bleibt der Banner dauerhaft (im Browser, `localStorage`)
verborgen.

Da ein als Homescreen-Icon installierter Shortcut ohne das `#<travelID>`-
Hash-Fragment startet (die Installation merkt sich nur `manifest.json`s
`start_url`, siehe oben "Aufruf-URL"), merkt sich die App zusätzlich die
zuletzt geladene `travelID` in `localStorage` (`getTravelIDFromURL()`) und
verwendet sie als Fallback, wenn kein Hash/Query-Parameter übergeben wurde.

## Struktur

```
server.js         Node-Server (nur Bordmittel), Routen /api/*, baut den bns_request
demoData.js        Fallback-Antworten im echten API-Format (Demo-Daten)
public/
  index.html       App-Grundgerüst (Views + Bottom-Nav), PWA-Meta-Tags
  styles.css       Design-Tokens "Modern & Minimal"
  app.js           Rendering, Navigation, Datumshelfer – rein clientseitig
  manifest.json    Web App Manifest ("Zum Home-Bildschirm hinzufügen")
  sw.js            Service Worker (nur Installierbarkeit, kein Caching)
  icons/           App-Icons (192/512/512-maskable/apple-touch)
```

## Bekannte Annahmen / offene Punkte

- Es wird angenommen, dass `GetReiseData` per **POST** mit dem `bns_request`
  als JSON-Body aufgerufen wird. Falls die reale Schnittstelle das anders
  erwartet (z.B. GET mit Query-Parametern, anderer Content-Type), muss nur
  der `fetch(...)`-Aufruf in `server.js` angepasst werden.
- Die Doku beschreibt keine Fehlerantwort-Struktur – `server.js` fängt
  Netzwerk-/HTTP-Fehler ab und fällt auf Demo-Daten zurück, statt die App
  abstürzen zu lassen.
- `ReiseVerlauf`-Einträge ohne erkannten `type` (F/H/T/M/C/V/S) werden mit
  einem generischen Symbol dargestellt, damit die App auch bei künftig neuen
  Typen nicht bricht.
- Die `sessionID` `#GTRBOSYDIRECTNUDANS#` (Testpush-Sandbox) wird 1:1 aus
  `.env` übernommen; ob das Gateway ein anderes Format erwartet, zeigt erst
  der echte Aufruf (siehe Server-Konsole bzw. `hinweis`-Feld der Antwort,
  falls der Aufruf fehlschlägt).
