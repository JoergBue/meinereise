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
const { demoReiseData, demoOfficeData, demoPlacesData, demoPortPlacesData } = require("./demoData");

loadDotEnv(path.join(__dirname, ".env"));

// Produktions-Absicherung: ein einzelner unerwarteter Fehler soll den
// Prozess nicht abschießen (z.B. bei Node-Hosting mit Auto-Restart, wo ein
// Absturz kurzzeitige Downtime bedeutet). Alle Routen fangen ihre eigenen
// Fehler bereits ab (siehe handleReiseData/handleDokument); das hier ist
// nur ein zusätzliches Sicherheitsnetz.
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
});
process.on("unhandledRejection", (err) => {
  console.error("[unhandledRejection]", err);
});

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

// BOSYS_GATEWAY_URL ist der aktuelle Variablenname; BOSYS_API_URL wird als
// Alias unterstützt, falls eine ältere .env noch den alten Namen verwendet.
const BOSYS_API_URL = process.env.BOSYS_GATEWAY_URL || process.env.BOSYS_API_URL || "";
const BOSYS_SOURCE = process.env.BOSYS_SOURCE || "e-confirm";
const BOSYS_TERMINAL = process.env.BOSYS_TERMINAL || "1";
const BOSYS_TOKEN = process.env.BOSYS_TOKEN || "";
const BOSYS_SESSION_ID = process.env.BOSYS_SESSION_ID || "";

// GetOffice.Token – laut Doku wird hier der "HashKey" übergeben, nicht die
// travelID/sessionID. Bis der Punkt "Aufruf ohne Parameter" (siehe TODO.md)
// umgesetzt ist, kommt der HashKey fest aus .env statt aus einem konkreten
// Reise-Kontext – GetOffice hängt ja ohnehin nicht an einer travelID.
const BOSYS_OFFICE_TOKEN = process.env.BOSYS_OFFICE_TOKEN || "";

// WhatsApp-Nummer des Büros für den "Per WhatsApp kontaktieren"-Button
// (siehe TODO.md Punkt 3) – GetOffice liefert inzwischen ein eigenes Feld
// MyOffice.whatsapp (fertiger wa.me-Link), das app.js vorrangig nutzt.
// Diese Variable ist nur noch der Fallback, falls dieses Feld (noch) nicht
// geliefert wird – beliebiges gängiges Format (z.B. "+49 171 1775434",
// "00491711775434" oder "0171 1775434"), wird clientseitig normalisiert
// (siehe normalizeWhatsAppNumber() in app.js). Leer + kein MyOffice.whatsapp:
// der Button bleibt dann weg, es wird nicht mehr anhand von MyOffice.phone
// geraten.
const WHATSAPP_OFFICE_NUMBER = process.env.WHATSAPP_OFFICE_NUMBER || "";

// "In der Nähe" (siehe TODO.md) – unabhängig von BOSYS, ruft die Google
// Places API (New) auf, um Restaurants/Sehenswürdigkeiten rund um den
// Hotel-Standort eines Reisetags anzuzeigen. Ohne Key: Demo-Orte.
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

// Nur URL + sessionID sind zwingend, um einen Live-Aufruf zu versuchen –
// Terminal/Source haben sinnvolle Defaults, und manche Gateways (z.B.
// Test-/Sandbox-Umgebungen) verlangen (noch) keinen Token.
const isLiveConfigured = Boolean(BOSYS_API_URL && BOSYS_SESSION_ID);
// GetOffice braucht keine sessionID (siehe Session.sessionID in der
// Beispiel-Antwort, bleibt leer) – nur URL + der eigene Office-Token.
const isOfficeLiveConfigured = Boolean(BOSYS_API_URL && BOSYS_OFFICE_TOKEN);
const isPlacesLiveConfigured = Boolean(GOOGLE_PLACES_API_KEY);

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

  if (url.pathname === "/api/office") {
    await handleOffice(res);
    return;
  }

  if (url.pathname === "/api/places") {
    await handlePlaces(url, res);
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

// "Mein Reisebüro" (siehe TODO.md) – GetOffice hängt nicht an einer
// travelID, sondern läuft über den fest konfigurierten BOSYS_OFFICE_TOKEN
// (den "HashKey"). Gleiches Fallback-Muster wie handleReiseData: ohne
// Live-Konfiguration bzw. bei einem fehlgeschlagenen Aufruf werden
// Demo-Daten ausgeliefert, statt die App abstürzen zu lassen.
async function handleOffice(res) {
  if (!isOfficeLiveConfigured) {
    sendJson(res, 200, {
      source: "demo",
      hinweis: "BOSYS_OFFICE_TOKEN ist nicht in .env gesetzt – es werden Demo-Reisebüro-Daten angezeigt.",
      data: demoOfficeData().bns_response.GetOffice,
      whatsapp: WHATSAPP_OFFICE_NUMBER
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
        Function: "GetOffice"
      },
      GetOffice: {
        Token: BOSYS_OFFICE_TOKEN
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
    const officeData = json && json.bns_response && json.bns_response.GetOffice;

    if (!officeData) {
      throw new Error("Antwort enthielt kein bns_response.GetOffice");
    }

    sendJson(res, 200, { source: "live", data: officeData, whatsapp: WHATSAPP_OFFICE_NUMBER });
  } catch (err) {
    console.error("[GetOffice] Live-Aufruf fehlgeschlagen, liefere Demo-Daten:", err.message);
    sendJson(res, 200, {
      source: "demo",
      hinweis: `Live-Aufruf fehlgeschlagen (${err.message}) – es werden Demo-Reisebüro-Daten angezeigt.`,
      data: demoOfficeData().bns_response.GetOffice,
      whatsapp: WHATSAPP_OFFICE_NUMBER
    });
  }
}

// "In der Nähe" (siehe TODO.md) – Google Places API (New). Zwei Varianten:
// - Koordinaten (Hotel-Standort): searchNearby, zwei getrennte Aufrufe
//   (Restaurants/Sehenswürdigkeiten) statt einem gemeinsamen mit mehreren
//   includedTypes, damit die Zuordnung eindeutig ist und das Frontend die
//   Antwort nicht selbst nachsortieren muss.
// - Hafenname (Kreuzfahrttag, siehe fetchAttractionsByPortText): cruise-
//   RouteDet liefert nur den Hafennamen, keine Koordinaten (siehe
//   placesQueryForDay() in app.js) – dafür stattdessen searchText mit dem
//   Namen im Suchtext. Nur Sehenswürdigkeiten, bewusst keine Restaurants
//   (an Bord gibt es genug zu essen).
const PLACES_FIELD_MASK = "places.displayName,places.rating,places.userRatingCount,places.primaryTypeDisplayName,places.googleMapsUri";

// Ergebnisse pro Standort (auf ca. 110m gerundete Koordinaten, oder
// normalisierter Hafenname) kurz cachen, damit ein mehrfacher Tageswechsel
// zum selben Ort nicht jedes Mal erneut gegen Google abgerechnet wird. Rein
// In-Memory, geht beim Neustart verloren – für die aktuelle Nutzung (eine
// kleine Reisegruppe) ausreichend.
const placesCache = new Map(); // "lat,lon" bzw. "port:<name>" -> { time, payload }
const PLACES_CACHE_TTL_MS = 30 * 60 * 1000;

function mapPlacesResponse(json) {
  return (json.places || [])
    .map((p) => ({
      name: (p.displayName && p.displayName.text) || "",
      rating: typeof p.rating === "number" ? p.rating : null,
      ratingCount: p.userRatingCount || 0,
      typeLabel: (p.primaryTypeDisplayName && p.primaryTypeDisplayName.text) || "",
      mapsUrl: p.googleMapsUri || ""
    }))
    .filter((p) => p.name);
}

async function fetchPlacesByType(lat, lon, includedType) {
  const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": PLACES_FIELD_MASK
    },
    body: JSON.stringify({
      includedTypes: [includedType],
      maxResultCount: 6,
      languageCode: "de",
      locationRestriction: {
        circle: { center: { latitude: lat, longitude: lon }, radius: 2000.0 }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Places API antwortete mit Status ${response.status}`);
  }

  return mapPlacesResponse(await response.json());
}

// Kreuzfahrthafen ohne Koordinaten: Places-Textsuche statt Umkreissuche, der
// Ortsname steckt direkt im Suchtext ("Sehenswürdigkeiten in <Hafen>").
async function fetchAttractionsByPortText(port) {
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": PLACES_FIELD_MASK
    },
    body: JSON.stringify({
      textQuery: `Sehenswürdigkeiten in ${port}`,
      includedType: "tourist_attraction",
      maxResultCount: 6,
      languageCode: "de"
    })
  });

  if (!response.ok) {
    throw new Error(`Places API antwortete mit Status ${response.status}`);
  }

  return mapPlacesResponse(await response.json());
}

async function handlePlaces(url, res) {
  const lat = parseFloat(url.searchParams.get("lat"));
  const lon = parseFloat(url.searchParams.get("lon"));
  const port = (url.searchParams.get("port") || "").trim();
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);

  if (!hasCoords && !port) {
    sendJson(res, 400, { error: "lat/lon oder port fehlt oder ungültig" });
    return;
  }

  const cacheKey = hasCoords ? `${lat.toFixed(3)},${lon.toFixed(3)}` : `port:${port.toLowerCase()}`;
  const demoFallback = hasCoords ? demoPlacesData(lat, lon) : demoPortPlacesData(port);

  if (!isPlacesLiveConfigured) {
    sendJson(res, 200, {
      source: "demo",
      hinweis: "GOOGLE_PLACES_API_KEY ist nicht in .env gesetzt – es werden Demo-Orte angezeigt.",
      data: demoFallback
    });
    return;
  }

  const cached = placesCache.get(cacheKey);
  if (cached && Date.now() - cached.time < PLACES_CACHE_TTL_MS) {
    sendJson(res, 200, { source: "live", data: cached.payload });
    return;
  }

  try {
    let payload;
    if (hasCoords) {
      const [restaurants, attractions] = await Promise.all([
        fetchPlacesByType(lat, lon, "restaurant"),
        fetchPlacesByType(lat, lon, "tourist_attraction")
      ]);
      payload = { restaurants, attractions };
    } else {
      payload = { restaurants: [], attractions: await fetchAttractionsByPortText(port) };
    }
    placesCache.set(cacheKey, { time: Date.now(), payload });
    sendJson(res, 200, { source: "live", data: payload });
  } catch (err) {
    console.error("[Places] Live-Aufruf fehlgeschlagen, liefere Demo-Orte:", err.message);
    sendJson(res, 200, {
      source: "demo",
      hinweis: `Live-Aufruf fehlgeschlagen (${err.message}) – es werden Demo-Orte angezeigt.`,
      data: demoFallback
    });
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
    // Ohne Cache-Control-Header entscheidet der Browser nach eigenen
    // Heuristiken, wie lange er index.html/app.js/styles.css cached – das
    // hat schon dazu geführt, dass ein Redeploy serverseitig längst aktuell
    // war, der Browser aber weiter eine alte app.js aus dem Cache zeigte.
    // "no-cache" erzwingt bei jedem Laden einen frischen Abruf, statt sich
    // auf Browser-Heuristiken zu verlassen (die App ist klein genug, dass
    // der Performance-Nachteil nicht ins Gewicht fällt).
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": "no-cache" });
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
  console.log(isOfficeLiveConfigured
    ? "Mein Reisebüro (GetOffice): Live-Anbindung aktiv."
    : "Mein Reisebüro (GetOffice): BOSYS_OFFICE_TOKEN nicht gesetzt – Demo-Daten aktiv.");
  console.log(isPlacesLiveConfigured
    ? "In der Nähe (Google Places): Live-Anbindung aktiv."
    : "In der Nähe (Google Places): GOOGLE_PLACES_API_KEY nicht gesetzt – Demo-Orte aktiv.");
  console.log(WHATSAPP_OFFICE_NUMBER
    ? "WhatsApp-Kontakt: WHATSAPP_OFFICE_NUMBER als Fallback konfiguriert (genutzt, falls MyOffice.whatsapp nicht geliefert wird)."
    : "WhatsApp-Kontakt: WHATSAPP_OFFICE_NUMBER nicht gesetzt – nur MyOffice.whatsapp (falls von GetOffice geliefert) aktiviert den Button.");
});
