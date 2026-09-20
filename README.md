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

## Struktur

```
server.js        Express-Server, Route /api/reisedaten, baut den bns_request
demoData.js       Fallback-Antwort im echten GetReiseData-Format
public/
  index.html      App-Grundgerüst (4 Views + Bottom-Nav)
  styles.css      Design-Tokens "Modern & Minimal"
  app.js          Rendering, Navigation, Datumshelfer – rein clientseitig
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
