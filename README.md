# MeineReise – App (Design: Modern & Minimal)

Kleine Node/Express-App, die eine gebuchte Reise (aus der BOSYS UI.SPACE
Traveller API, Funktion `GetReiseData`) im Design "Modern & Minimal"
darstellt: Reiseübersicht, Reiseplan, Zusatzleistungen und Dokumente.

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
