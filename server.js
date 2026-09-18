// MeineReise – kleiner Server, bewusst ohne externe Abhängigkeiten
// (nur Node-Bordmittel: http, fs, path) – läuft mit "node server.js",
// kein "npm install" nötig.
//
// Aufgabe: nimmt vom Frontend eine travelID entgegen, baut daraus den
// bns_request für GetReiseData (Header-Werte + sessionID kommen aus .env,
// NIE aus dem Browser) und ruft die BOSYS UI.SPACE Traveller API auf.
// Ist BOSYS_API_URL/BOSYS_TOKEN nicht gesetzt, oder schlägt der Aufruf fehl,
// liefert die Route stattdessen die Demo-Reise aus demoData.js aus, damit
// das Frontend immer etwas zum Anzeigen hat.

const http = require("http");
const fs = require("fs");
const path = require("path");
const { demoReiseData } = require("./demoData");

loadDotEnv(path.join(__dirname, ".env"));

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

// BOSYS_GATEWAY_URL ist der aktuelle Variablenname; BOSYS_API_URL wird als
// Alias unterstützt, falls eine ältere .env noch den alten Namen verwendet.
const BOSYS_API_URL = process.env.BOSYS_GATEWAY_URL || process.env.BOSYS_API_URL || "";
const BOSYS_SOURCE = process.env.BOSYS_SOURCE || "e-confirm";
const BOSYS_TERMINAL = process.env.BOSYS_TERMINAL || "1";
const BOSYS_TOKEN = process.env.BOSYS_TOKEN || "";
const BOSYS_SESSION_ID = process.env.BOSYS_SESSION_ID || "";

// Nur URL + sessionID sind zwingend, um einen Live-Aufruf zu versuchen –
// Terminal/Source haben sinnvolle Defaults, und manche Gateways (z.B.
// Test-/Sandbox-Umgebungen) verlangen (noch) keinen Token.
const isLiveConfigured = Boolean(BOSYS_API_URL && BOSYS_SESSION_ID);

// GetDokument (Dokument-Abruf) braucht zusätzlich zur travelID eine
// sessionID + officeID – beide liefert GetReiseData in seiner Antwort mit.
// Wir merken uns beide serverseitig pro travelID, sobald ein Live-Aufruf
// von GetReiseData erfolgreich war – GetDokument kann also erst
// funktionieren, nachdem die Reisedaten für diese travelID einmal live
// geladen wurden.
const travelSessionCache = new Map(); // travelID -> { sessionID, officeID }

function extractOfficeSession(reiseData, fallbackSessionID) {
  // Kleinschreib-Varianten als Fallback, falls das Gateway abweicht.
  const officeID = reiseData.officeID || reiseData.OfficeID || reiseData.officeId || "";
  const sessionID = reiseData.sessionID || reiseData.SessionID || fallbackSessionID || "";
  return { sessionID, officeID };
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/reisedaten") {
    await handleReiseData(url, res);
    return;
  }

  if (url.pathname === "/api/dokument") {
    await handleDokument(url, res);
    return;
  }

  serveStatic(url.pathname, res);
});

async function handleReiseData(url, res) {
  const travelID = (url.searchParams.get("travelID") || "").trim();

  if (!travelID) {
    sendJson(res, 400, { error: "travelID fehlt" });
    return;
  }

  if (!isLiveConfigured) {
    sendJson(res, 200, {
      source: "demo",
      hinweis: "BOSYS_GATEWAY_URL / BOSYS_SESSION_ID sind nicht in .env gesetzt – es werden Demo-Daten angezeigt.",
      data: demoReiseData(travelID).bns_response.GetReiseData
    });
    return;
  }

  const bnsRequest = {
    bns_request: {
      Header: {
        Version: "1.0",
        Source: BOSYS_SOURCE,
        BOSYSTerminal: BOSYS_TERMINAL,
        Token: BOSYS_TOKEN,
        Function: "GetReiseData"
      },
      GetReiseData: {
        sessionID: BOSYS_SESSION_ID,
        travelID
      }
    }
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(BOSYS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bnsRequest),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`BOSYS API antwortete mit Status ${response.status}`);
    }

    const json = await response.json();
    const reiseData = json && json.bns_response && json.bns_response.GetReiseData;

    if (!reiseData) {
      throw new Error("Antwort enthielt kein bns_response.GetReiseData");
    }

    // sessionID/officeID für spätere GetDokument-Aufrufe dieser travelID merken.
    const { sessionID, officeID } = extractOfficeSession(reiseData, BOSYS_SESSION_ID);
    if (officeID) {
      travelSessionCache.set(travelID, { sessionID, officeID });
    } else {
      console.warn(`[GetReiseData] Keine officeID in der Antwort gefunden – GetDokument wird für travelID ${travelID} nicht funktionieren.`);
    }

    sendJson(res, 200, { source: "live", data: reiseData });
  } catch (err) {
    console.error("[GetReiseData] Live-Aufruf fehlgeschlagen, liefere Demo-Daten:", err.message);
    sendJson(res, 200, {
      source: "demo",
      hinweis: `Live-Aufruf fehlgeschlagen (${err.message}) – es werden Demo-Daten angezeigt.`,
      data: demoReiseData(travelID).bns_response.GetReiseData
    });
  }
}

async function handleDokument(url, res) {
  const travelID = (url.searchParams.get("travelID") || "").trim();
  const documentID = (url.searchParams.get("documentID") || "").trim();

  if (!travelID || !documentID) {
    sendJson(res, 400, { error: "travelID oder documentID fehlt" });
    return;
  }

  if (!isLiveConfigured) {
    sendJson(res, 200, { error: "Dokumentenabruf ist im Demo-Modus nicht verfügbar (keine Live-Anbindung konfiguriert)." });
    return;
  }

  const cached = travelSessionCache.get(travelID);
  if (!cached || !cached.officeID) {
    sendJson(res, 200, {
      error: "Keine officeID für diese Reise bekannt. Bitte die Reisedaten zuerst live laden (Seite neu laden), dann erneut versuchen."
    });
    return;
  }

  const bnsRequest = {
    bns_request: {
      Header: {
        Version: "1.0",
        Source: BOSYS_SOURCE,
        BOSYSTerminal: BOSYS_TERMINAL,
        Token: BOSYS_TOKEN,
        Function: "GetDokument"
      },
      GetDokument: {
        sessionID: cached.sessionID || BOSYS_SESSION_ID,
        officeID: cached.officeID,
        documentID
      }
    }
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(BOSYS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bnsRequest),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`BOSYS API antwortete mit Status ${response.status}`);
    }

    const json = await response.json();
    const dokument = json && json.bns_response && json.bns_response.GetDokument;

    if (!dokument) {
      throw new Error("Antwort enthielt kein bns_response.GetDokument");
    }

    // Antwort hat die Form { document: "<Base64-PDF>", id, title } – wird
    // unverändert durchgereicht, das Frontend baut daraus einen Blob/PDF.
    sendJson(res, 200, { source: "live", data: dokument });
  } catch (err) {
    console.error("[GetDokument] Aufruf fehlgeschlagen:", err.message);
    sendJson(res, 200, { error: `Dokument konnte nicht geladen werden (${err.message}).` });
  }
}

function serveStatic(pathname, res) {
  let filePath = pathname === "/" ? "/index.html" : pathname;
  // Path-Traversal verhindern und auf PUBLIC_DIR beschränken
  filePath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, "");
  const fullPath = path.join(PUBLIC_DIR, filePath);

  if (!fullPath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  fs.readFile(fullPath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
      return;
    }
    const ext = path.extname(fullPath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(content);
  });
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}

// Minimaler .env-Parser (KEY=VALUE pro Zeile, "#" leitet Kommentare ein) –
// keine externe Abhängigkeit nötig.
function loadDotEnv(envPath) {
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

server.listen(PORT, () => {
  console.log(`MeineReise läuft auf http://localhost:${PORT}`);
  console.log(isLiveConfigured
    ? `Live-Anbindung aktiv: ${BOSYS_API_URL}`
    : "Keine Live-Anbindung konfiguriert (.env prüfen) – Demo-Daten aktiv.");
  if (isLiveConfigured && !BOSYS_TOKEN) {
    console.log("Hinweis: BOSYS_TOKEN ist leer – wird als leerer String im Header.Token mitgeschickt.");
  }
});
