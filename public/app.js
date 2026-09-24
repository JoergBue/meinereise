// MeineReise – Frontend-Logik.
// Holt die Reisedaten vom eigenen Server (/api/reisedaten), der seinerseits
// GetReiseData beim MidOffice abfragt (oder Demo-Daten liefert), und
// rendert die vier Ansichten (Übersicht, Reiseplan, Zusatzleistungen,
// Dokumente) daraus. Reine Anzeige-Logik, keine Geschäftslogik/Zugangsdaten
// landen hier im Browser.

(function () {
  "use strict";

  const ICONS = {
    plane: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4Z"/>',
    bed: '<path d="M2 19v-7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3"/><path d="M2 19h20v-3a2 2 0 0 0-2-2H10"/><path d="M2 19v2"/><path d="M22 19v2"/>',
    bus: '<rect x="3" y="7" width="15" height="10" rx="2"/><path d="M18 10h1.5l2 2.8V17h-3.5"/><circle cx="7.5" cy="18.3" r="1.4"/><circle cx="16" cy="18.3" r="1.4"/>',
    car: '<path d="M3 15.5V13a2 2 0 0 1 .4-1.2L5 9h14l1.6 2.8c.3.4.4.8.4 1.2v2.5"/><path d="M3 15.5h18"/><circle cx="7.5" cy="16.5" r="1.3"/><circle cx="16.5" cy="16.5" r="1.3"/>',
    boat: '<path d="M2 21c1.6 1 3.4 1 5 0s3.4-1 5 0 3.4 1 5 0 3.4-1 5 0"/><path d="M4 15l1-7h14l1 7"/><path d="M12 8V3h4l-4 5"/>',
    shield: '<path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/>',
    mountain: '<path d="m3 20 6-10 4 6 3-4 5 8Z"/><circle cx="8" cy="7" r="1.5"/>',
    parking: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 8h3.5a2 2 0 0 1 0 4H9V8Zm0 4v4"/>',
    document: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6"/>',
    receipt: '<path d="M6 2h9l4 4v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"/><path d="M9 12h6M9 16h6M9 8h2"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.3 2.3L16 10"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    users: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.2 4.2l2 2M17.8 17.8l2 2M2 12h3M19 12h3M4.2 19.8l2-2M17.8 6.2l2-2"/>',
    cloud: '<path d="M6.5 19a4.5 4.5 0 0 1-.4-9 6 6 0 0 1 11.6-1.5A4 4 0 0 1 17 19H6.5Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    creditCard: '<rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/><path d="M6 15h4"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.3"/>',
    gift: '<rect x="3" y="8" width="18" height="13" rx="1.5"/><path d="M3 8h18v4H3z"/><path d="M12 8v13"/><path d="M12 8c-1.5-4-5-4-5-1.5S9 8 12 8Zm0 0c1.5-4 5-4 5-1.5S15 8 12 8Z"/>',
    suitcase: '<rect x="2" y="7" width="20" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M2 13h20"/>',
    externalLink: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/>',
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4"/><path d="M8 6h1M8 10h1M8 14h1M15 6h1M15 10h1M15 14h1"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/>',
    utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    messageCircle: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
    youtube: '<path d="M2.5 17a24.1 24.1 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.1 24.1 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
    tiktok: '<path d="M9 12a4 4 0 1 0 4 4V2a5 5 0 0 0 5 5"/>',
    download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
    // Stilisiertes iOS-"Teilen"-Symbol (Pfeil aus einem Kasten nach oben) für
    // die Home-Bildschirm-Anleitung unter Safari, siehe renderInstallBanner().
    share: '<path d="M12 3v12"/><path d="m8 7 4-4 4 4"/><rect x="4" y="13" width="16" height="8" rx="2"/>'
  };

  function icon(name, size = 20) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
  }

  // ---------- Datumshelfer (Felder kommen als "JJJJMMDD" / "JJJJMMDDHHMM") ----------

  function parseYYYYMMDD(s) {
    if (!s || s.length < 8) return null;
    const y = +s.slice(0, 4), m = +s.slice(4, 6), d = +s.slice(6, 8);
    return new Date(y, m - 1, d);
  }

  function parseYYYYMMDDHHMM(s) {
    if (!s) return null;
    const date = parseYYYYMMDD(s);
    if (!date) return null;
    if (s.length >= 12) {
      date.setHours(+s.slice(8, 10), +s.slice(10, 12));
    }
    return date;
  }

  // Kurzform des Wochentags für die Tages-Tabs im Reiseplan (siehe dow0..6
  // in i18n.js, Index 0 = Sonntag wie bei Date.getDay()).
  function dowShort(dayIndex) {
    return I18N.t(`dow${dayIndex}`);
  }

  const pad2 = (n) => String(n).padStart(2, "0");

  // Datumsformat ist sprachabhängig (z.B. "03.10.2026" auf Deutsch,
  // "03/10/2026" auf Englisch) – über Intl.DateTimeFormat und die aktuell
  // gewählte Sprache (I18N.localeTag()), damit hier keine Formate von Hand
  // nachgebaut werden müssen.
  function fmtDate(s) {
    const d = parseYYYYMMDD(s);
    if (!d) return "";
    return new Intl.DateTimeFormat(I18N.localeTag(), { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
  }

  function fmtTime(s) {
    const d = parseYYYYMMDDHHMM(s);
    if (!d) return "";
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }

  // travelPrice kommt als Ganzzahl in Eurocent (z.B. "245000" = 2.450,00 €).
  const CURRENCY_SYMBOLS = { EUR: "€", CHF: "CHF", USD: "$", GBP: "£" };

  function fmtPriceFromCents(cents, currency) {
    if (cents === undefined || cents === null || cents === "") return "";
    const n = Number(cents);
    if (!Number.isFinite(n)) return "";
    const amount = (n / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const symbol = CURRENCY_SYMBOLS[currency] || currency || "€";
    return `${amount} ${symbol}`;
  }

  function dayKey(date) {
    return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
  }

  function daysBetween(a, b) {
    const ms = new Date(b.getFullYear(), b.getMonth(), b.getDate()) - new Date(a.getFullYear(), a.getMonth(), a.getDate());
    return Math.round(ms / 86400000);
  }

  // ---------- Farbschema aus brandColor ----------
  //
  // GetReiseData liefert optional eine Hex-Farbe des vermittelnden
  // Reisebüros ("brandColor"). Daraus leiten wir – analog zum
  // "Feedback"-Projekt (lib/colorScale.ts) – eine 10-stufige Skala ab
  // (50 hell … 900 dunkel): die Eingabefarbe landet exakt auf Stufe 600,
  // hellere Stufen werden linear mit Weiß gemischt, dunklere mit Schwarz.
  // Ohne gültige brandColor bleibt die bisherige Standard-Akzentfarbe der
  // App erhalten (DEFAULT_BRAND_COLOR entspricht dem bisherigen --accent).

  const DEFAULT_BRAND_COLOR = "#118186";
  const HEX_COLOR_PATTERN = /^#?[0-9a-fA-F]{3}$|^#?[0-9a-fA-F]{6}$/;

  function isValidHexColor(value) {
    return typeof value === "string" && HEX_COLOR_PATTERN.test(value.trim());
  }

  function hexToRgb(hex) {
    const clean = hex.trim().replace("#", "");
    const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
    const num = parseInt(full, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  function rgbToHex({ r, g, b }) {
    const toHex = (n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function mixRgb(a, b, ratioOfB) {
    return { r: a.r + (b.r - a.r) * ratioOfB, g: a.g + (b.g - a.g) * ratioOfB, b: a.b + (b.b - a.b) * ratioOfB };
  }

  const BRAND_WHITE = { r: 255, g: 255, b: 255 };
  const BRAND_BLACK = { r: 0, g: 0, b: 0 };
  // Stufe 600 fehlt hier bewusst - sie entspricht exakt der Eingabefarbe.
  const BRAND_LIGHT_RATIOS = { "50": 0.95, "100": 0.9, "200": 0.75, "300": 0.6, "400": 0.3, "500": 0.15 };
  const BRAND_DARK_RATIOS = { "700": 0.15, "800": 0.3, "900": 0.45 };

  function buildBrandScale(hex) {
    const base = hexToRgb(hex && isValidHexColor(hex) ? hex : DEFAULT_BRAND_COLOR);
    const scale = { "600": rgbToHex(base) };
    Object.keys(BRAND_LIGHT_RATIOS).forEach((k) => {
      scale[k] = rgbToHex(mixRgb(base, BRAND_WHITE, BRAND_LIGHT_RATIOS[k]));
    });
    Object.keys(BRAND_DARK_RATIOS).forEach((k) => {
      scale[k] = rgbToHex(mixRgb(base, BRAND_BLACK, BRAND_DARK_RATIOS[k]));
    });
    return scale;
  }

  // Setzt die App-Farbtokens (--accent usw.) aus der abgeleiteten Skala.
  function applyBrandColor(brandColor) {
    const scale = buildBrandScale(brandColor);
    const root = document.documentElement.style;
    root.setProperty("--accent", scale["600"]);
    root.setProperty("--accent-ink", scale["700"]);
    root.setProperty("--accent-soft", scale["100"]);
    root.setProperty("--accent-contrast", "#ffffff");
    root.setProperty("--accent-300", scale["300"]);
    root.setProperty("--accent-400", scale["400"]);
  }

  // ---------- Reisebüro (office) ----------
  //
  // office kommt (wie beim "Feedback"-Projekt) optional mit { name, adress }
  // – das Gateway liefert das Adressfeld bewusst als "adress" (ohne
  // zweites "d"), wir normalisieren das intern. Nur anzeigen, wenn beide
  // Felder vorhanden sind – sonst lieber keine unvollständige Angabe.
  function officeInfo() {
    const o = state.data.office || state.data.Office;
    if (!o) return null;
    const name = o.name;
    const address = o.address || o.adress;
    if (!name || !address) return null;
    return { name, address };
  }

  // ---------- App-Status ----------

  const state = {
    travelID: null,
    data: null,
    source: null,
    officeData: null,
    // WhatsApp-Nummer des Büros, falls serverseitig über WHATSAPP_OFFICE_NUMBER
    // konfiguriert (siehe server.js handleOffice) – nur noch Fallback, falls
    // GetOffice kein eigenes MyOffice.whatsapp liefert (siehe renderOffice()).
    officeWhatsapp: "",
    activeView: "overview",
    activeDay: null,
    activeOfferFilter: "all",
    showAlarm: false,
    // "In der Nähe" (Google Places, siehe placesQueryForDay/loadNearbyPlaces):
    // pro Standort ("lat,lon" gerundet, oder "port:<hafenname>" an
    // Kreuzfahrttagen) das Ergebnis (oder "loading"/"error") zwischen-
    // speichern, damit ein Tageswechsel hin und her nicht jedes Mal neu vom
    // Server lädt.
    placesCache: new Map(),
    // "Nächste Reise" – Absende-Status des Formulars (siehe renderNextTrip()):
    // "submitting" blendet den Button auf "Wird gesendet …" um, "submitted"
    // zeigt die Dankeseite statt des Formulars, "error" eine Inline-Meldung
    // (Formularwerte bleiben dabei erhalten, siehe submitNextTripForm()).
    nextTrip: { submitting: false, submitted: false, error: null }
  };

  // Merkt sich die zuletzt geladene travelID lokal im Browser. Grund: Wird
  // die App über "Zum Home-Bildschirm hinzufügen" installiert (siehe
  // renderInstallBanner()), startet Android/Chrome den Shortcut über
  // manifest.json/start_url ("./", ohne Hash-Fragment) statt über den
  // zuletzt aufgerufenen Link "#<travelID>" – ohne diesen Fallback würde
  // die App dann mit "Keine travelID übergeben" fehlschlagen.
  const LAST_TRAVEL_ID_KEY = "meinereise:lastTravelID";

  function rememberTravelID(id) {
    if (!id) return;
    try { localStorage.setItem(LAST_TRAVEL_ID_KEY, id); } catch (e) {
      // localStorage evtl. nicht verfügbar (privater Modus o.ä.) – dann
      // gibt es beim nächsten Aufruf ohne Hash eben keinen Fallback.
    }
  }

  function getTravelIDFromURL() {
    // Aufruf-Format: https://.../#291922  (Hash-Fragment, wird nicht an den Server gesendet)
    const hash = window.location.hash.replace(/^#/, "").trim();
    if (hash) return hash;
    // Fallback, falls die App doch mal mit ?travelID=... aufgerufen wird
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("travelID") || "";
    if (fromQuery) return fromQuery;
    // Letzter Fallback: als Home-Bildschirm-Symbol installierter Shortcut
    // ohne Hash (siehe Kommentar oben bei LAST_TRAVEL_ID_KEY).
    try { return localStorage.getItem(LAST_TRAVEL_ID_KEY) || ""; } catch (e) { return ""; }
  }

  // ---------- Laden ----------

  async function loadReiseData() {
    state.travelID = getTravelIDFromURL();

    if (!state.travelID) {
      renderFatalError(I18N.t("app.noTravelId", {
        example: "<code>" + window.location.origin + window.location.pathname + "#&lt;travelID&gt;</code>"
      }));
      return;
    }
    rememberTravelID(state.travelID);

    try {
      // /api/office ("Mein Reisebüro") läuft unabhängig von der travelID
      // (siehe GetOffice.Token/HashKey in server.js) und darf die
      // eigentlichen Reisedaten nicht blockieren – daher parallel laden und
      // ein Fehlschlag dort bewusst nicht fatal behandeln (die Bürodaten
      // fallen serverseitig ohnehin schon auf Demo-Daten zurück, ein
      // .catch hier fängt nur einen kompletten Netzwerkausfall ab).
      const [res, officeRes] = await Promise.all([
        fetch(`/api/reisedaten?travelID=${encodeURIComponent(state.travelID)}`),
        fetch("/api/office").catch(() => null)
      ]);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || `Serverfehler (${res.status})`);
      }

      state.data = json.data;
      state.source = json.source;
      applyBrandColor(state.data.brandColor);

      if (officeRes && officeRes.ok) {
        const officeJson = await officeRes.json();
        state.officeData = officeJson.data || null;
        state.officeWhatsapp = officeJson.whatsapp || "";
      }

      const banner = document.getElementById("demoBanner");
      if (json.source === "demo") {
        banner.hidden = false;
        banner.title = json.hinweis || "";
      } else {
        banner.hidden = true;
      }

      renderAll();
    } catch (err) {
      renderFatalError(I18N.t("app.loadError", { message: err.message }));
    }
  }

  function renderFatalError(html) {
    document.getElementById("view-overview").innerHTML = `<div class="error-box">${html}</div>`;
  }

  // ---------- Ableitungen aus ReiseVerlauf ----------

  // Nur noch das Icon je Typ – die Bezeichnung kommt sprachabhängig über
  // I18N.t("verlaufType." + type) aus i18n.js (siehe verlaufTypeLabel()).
  const VERLAUF_META = {
    F: { icon: "plane" },
    H: { icon: "bed" },
    T: { icon: "bus" },
    M: { icon: "car" },
    C: { icon: "boat" },
    V: { icon: "shield" },
    S: { icon: "mountain" }
  };

  function verlaufTypeLabel(type) {
    return VERLAUF_META[type] ? I18N.t("verlaufType." + type) : type;
  }

  function verlaufList() {
    // Die API liefert gelegentlich leere Platzhalter-Objekte ({}) im Array,
    // die keinen "type" besitzen – diese werden herausgefiltert, sonst
    // entsteht eine leere "undefined"-Zeile im Reiseplan.
    return (state.data.ReiseVerlauf || [])
      .filter((item) => item && item.type)
      .slice()
      .sort((a, b) => (a.sortDate || "").localeCompare(b.sortDate || ""));
  }

  function bookedStatusChips() {
    const seen = new Set();
    const chips = [];
    verlaufList().forEach((item) => {
      if (seen.has(item.type)) return;
      seen.add(item.type);
      const meta = VERLAUF_META[item.type];
      if (meta) chips.push({ icon: meta.icon, type: item.type });
    });
    return chips;
  }

  function tripDayList() {
    const grund = state.data.ReiseGrund || {};
    const start = parseYYYYMMDD(grund.checkinDate);
    const end = parseYYYYMMDD(grund.checkoutDate);
    const days = [];
    if (!start || !end) return days;
    const cur = new Date(start);
    while (cur <= end) {
      days.push({ key: dayKey(cur), date: new Date(cur) });
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }

  // "upcoming" (Checkin liegt noch vorn), "ongoing" (zwischen Checkin und
  // Checkout, heute eingeschlossen) oder "ended" (Checkout liegt in der
  // Vergangenheit) – dieselbe Einteilung, die schon bisher für den
  // Countdown-Badge auf der Startseite galt (siehe renderOverview()), jetzt
  // hier zentral, da auch der Reiseplan bei bereits beendeten Reisen anders
  // dargestellt wird (siehe renderPlan()): dann nur noch eine Zusammen-
  // fassung statt Tages-Tabs, und keine "In der Nähe"-Abfragen (Google
  // Places) mehr, da für eine vorbei gereiste Reise nichts mehr zu
  // empfehlen ist. Ohne checkinDate (unvollständige Daten) null.
  function tripStatus() {
    const grund = state.data.ReiseGrund || {};
    const checkin = parseYYYYMMDD(grund.checkinDate);
    if (!checkin) return null;
    const checkout = parseYYYYMMDD(grund.checkoutDate);
    const today = new Date();
    if (daysBetween(today, checkin) > 0) return "upcoming";
    if (checkout && daysBetween(today, checkout) >= 0) return "ongoing";
    return "ended";
  }

  // "Nächste Reise" (siehe TODO.md) – Gutschein-Flag aus GetReiseData.
  // ACHTUNG: "voucherAmount" ist ein Platzhalter-Feldname (siehe Kommentar
  // in demoData.js) – der tatsächliche Feldname ist noch nicht bestätigt.
  // Wie travelPrice eine Ganzzahl in Eurocent; 0/fehlend => kein Gutschein.
  function nextTripVoucherAmount() {
    const grund = state.data.ReiseGrund || {};
    const n = Number(grund.voucherAmount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  function verlaufForDay(dayKeyStr) {
    const items = verlaufList().filter((item) => (item.sortDate || "").startsWith(dayKeyStr));
    // Mietwagen (type "M") ist EIN ReiseVerlauf-Eintrag mit sortDate =
    // Abholtag – die Rückgabe (returnDateTime) fällt meist auf einen
    // anderen Tag und wird daher hier separat ergänzt, damit an diesem
    // Tag ebenfalls eine Timeline-Zeile ("Rückgabe Mietwagen", siehe
    // renderTimelineRow) erscheint statt nur die "Mietwagen unterwegs"-
    // Kontextkarte. Fallen Abholung und Rückgabe auf denselben Tag,
    // steckt der Eintrag schon in items (über sortDate) – nicht doppeln.
    verlaufList().forEach((item) => {
      if (item.type === "M" && item.returnDateTime
        && item.returnDateTime.slice(0, 8) === dayKeyStr
        && !items.includes(item)) {
        items.push(item);
      }
    });
    return items;
  }

  // An vielen Reisetagen gibt es keinen eigenen ReiseVerlauf-Eintrag (der
  // Hotelaufenthalt selbst ist nur EIN Eintrag mit checkInDate/checkOutDate,
  // nicht einer pro Nacht) – dann war der Tag bisher einfach leer. Hier statt
  // dessen den Hotel-Kontext für diesen Tag ermitteln (checkInDate <= Tag <=
  // checkOutDate, String-Vergleich funktioniert bei "JJJJMMDD" wie ein
  // Datumsvergleich).
  function hotelForDay(dayKeyStr) {
    return verlaufList().find((item) => item.type === "H"
      && item.checkInDate && item.checkOutDate
      && item.checkInDate <= dayKeyStr && dayKeyStr <= item.checkOutDate) || null;
  }

  // Anfrage für "In der Nähe" (Google Places, siehe loadNearbyPlaces weiter
  // unten) für einen Reisetag – zwei mögliche Formen:
  // - { type: "coords", lat, lon }: Hotel-Standort (locationLatitude/
  //   -Longitude sind dort bereits vorhanden) – wie bisher.
  // - { type: "port", port }: Kreuzfahrttag mit Landgang. cruiseRouteDet
  //   liefert nur den Hafennamen, keine Koordinaten (siehe cruiseRouteStops
  //   weiter unten) – der Server löst den Ort dafür über eine Google-Places-
  //   Textsuche statt einer Koordinaten-Umkreissuche auf (siehe server.js
  //   handlePlaces/fetchAttractionsByPortText). Bewusst nur Sehenswürdig-
  //   keiten, keine Restaurants (an Bord gibt es genug zu essen) – siehe
  //   renderNearbyPlaces().
  // null an Seetagen (kein Hafen) oder ohne Hotel-Koordinaten.
  //
  // Läuft an diesem Tag zusätzlich eine Kreuzfahrt (cruiseForDay), ist der
  // Gast nicht am Hotel, auch wenn checkInDate/checkOutDate den Tag
  // formal mit einschließen (z.B. während eines Landausflugs vom Schiff) –
  // gleiche Priorität Kreuzfahrt > Hotel wie in renderEmptyDay().
  function placesQueryForDay(dayKeyStr) {
    const cruise = cruiseForDay(dayKeyStr);
    if (cruise) {
      const stop = cruiseRouteStopForDay(cruise, dayKeyStr);
      if (!stop || stop.isSeaDay || !stop.port) return null;
      return { type: "port", port: stop.port };
    }
    const hotel = hotelForDay(dayKeyStr);
    if (!hotel) return null;
    const lat = parseFloat(hotel.locationLatitude);
    const lon = parseFloat(hotel.locationLongitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { type: "coords", lat, lon };
  }

  // Analog zu hotelForDay: die Kreuzfahrt selbst ist nur EIN ReiseVerlauf-
  // Eintrag (type "C") mit startDate/endDate über die ganze Fahrt – für
  // jeden einzelnen Tag dazwischen (nicht nur den Einschiffungstag) wird
  // hier der Routenplan-Halt des Tages ermittelt (siehe cruiseRouteStops
  // weiter unten, das den generischen Tages-Hafen liefert).
  function cruiseForDay(dayKeyStr) {
    return verlaufList().find((item) => item.type === "C"
      && item.startDate && item.endDate
      && item.startDate <= dayKeyStr && dayKeyStr <= item.endDate) || null;
  }

  function cruiseRouteStopForDay(item, dayKeyStr) {
    return cruiseRouteStops(item).find((s) => s.date && dayKey(s.date) === dayKeyStr) || null;
  }

  // Analog zu hotelForDay/cruiseForDay: ein gebuchter Mietwagen ist auch nur
  // EIN ReiseVerlauf-Eintrag (type "M") mit pickupDateTime/returnDateTime
  // über den ganzen Mietzeitraum. Die Zeiten kommen als "JJJJMMDDHHMMSS"
  // (14-stellig) – für den Tagesvergleich reichen die ersten 8 Stellen.
  function rentalCarForDay(dayKeyStr) {
    return verlaufList().find((item) => item.type === "M"
      && item.pickupDateTime && item.returnDateTime
      && item.pickupDateTime.slice(0, 8) <= dayKeyStr && dayKeyStr <= item.returnDateTime.slice(0, 8)) || null;
  }

  // Passende Zusatzangebote für einen "freien" Tag – bewusst nur Ausflüge/
  // Mietwagen (keine Versicherung, kein Wetter etc.), da das die Angebote
  // sind, die an einem konkreten Reisetag Sinn ergeben. Ausflüge zuerst.
  // An Seetagen gibt es keine Landausflüge – dort wird "ausfluege" bewusst
  // ausgeschlossen (excludeAusfluege=true); an Tagen mit bereits gebuchtem
  // Mietwagen ergibt der Vorschlag "Mietwagen buchen" keinen Sinn mehr
  // (excludeMietwagen=true) – siehe renderEmptyDay.
  function suggestedOffersForEmptyDay(excludeAusfluege, excludeMietwagen) {
    const order = { ausfluege: 0, mietwagen: 1 };
    return zusatzLeistungList()
      .filter((o) => (o.headline || o.text) && offerFilter(o) in order)
      .filter((o) => !(excludeAusfluege && offerFilter(o) === "ausfluege"))
      .filter((o) => !(excludeMietwagen && offerFilter(o) === "mietwagen"))
      .sort((a, b) => order[offerFilter(a)] - order[offerFilter(b)])
      .slice(0, 2);
  }

  // ---------- View: Übersicht ----------

  function renderOverview() {
    const grund = state.data.ReiseGrund || {};
    const checkin = parseYYYYMMDD(grund.checkinDate);
    const checkout = parseYYYYMMDD(grund.checkoutDate);
    const today = new Date();
    const status = tripStatus();

    let countdown = "";
    if (status === "upcoming") countdown = I18N.tCount("overview.daysLeft", daysBetween(today, checkin));
    else if (status === "ongoing") countdown = I18N.t("overview.tripOngoing");
    else if (status === "ended") countdown = I18N.t("overview.tripEnded");

    const nights = checkin && checkout ? daysBetween(checkin, checkout) : null;
    const chips = bookedStatusChips();
    const office = officeInfo();
    const price = fmtPriceFromCents(grund.travelPrice, grund.travelCurrency);
    const heroImg = validGrafikUrl(grund.travelPic);

    const offers = zusatzLeistungList().filter((o) => o.type !== "G007" && (o.headline || o.text)).slice(0, 2);

    // "alarm.text" ist optional – kommt sie in der Antwort und ist nicht
    // leer, wird die Glocke aktiv (andere Farbe, anklickbar) und zeigt den
    // Text in einer aufklappbaren Meldung darunter an. Ohne alarm.text
    // bleibt die Glocke wie bisher rein dekorativ.
    const alarmText = ((state.data.alarm || {}).text || "").trim();

    document.getElementById("view-overview").innerHTML = `
      <div class="greeting-row">
        <div>
          <div class="greeting-eyebrow">${I18N.t("overview.welcomeBack")}</div>
          <div class="greeting-name">${I18N.t("overview.yourTrip")}</div>
        </div>
        ${alarmText
          ? `<button type="button" class="avatar avatar-alarm" data-alarm-toggle aria-label="${I18N.t("overview.showAlert")}">${icon("bell", 19)}</button>`
          : `<div class="avatar">${icon("bell", 19)}</div>`}
      </div>

      ${alarmText ? `
      <div class="alarm-banner" ${state.showAlarm ? "" : "hidden"}>
        <div class="alarm-banner-icon">${icon("bell", 15)}</div>
        <div class="alarm-banner-text">${escapeHtml(alarmText)}</div>
        <button type="button" class="alarm-banner-close" data-alarm-close aria-label="${I18N.t("overview.close")}">${icon("close", 14)}</button>
      </div>` : ""}

      <div id="installBannerHolder"></div>

      <div class="hero-card">
        <div class="hero-photo">
          ${heroImg
            ? `<img class="hero-photo-img" src="${escapeHtml(heroImg)}" alt="" loading="lazy" onerror="this.remove();">`
            : icon("mountain", 26).replace("<svg", '<svg style="color: oklch(99% 0.01 200)"')}
          ${countdown ? `<div class="hero-badge">${countdown}</div>` : ""}
        </div>
        <div class="hero-body">
          <div>
            <div class="hero-title">${escapeHtml(grund.travelTitle || "")}</div>
            <div class="hero-sub">${escapeHtml(grund.travelRegionText || "")}</div>
            <div class="hero-sub">${fmtDate(grund.checkinDate)} – ${fmtDate(grund.checkoutDate)}${nights != null ? ` · ${I18N.tCount("overview.nights", nights)}` : ""}</div>
          </div>
          <div class="hero-meta">
            ${grund.travelers ? `<div class="hero-meta-item">${icon("users", 16)} ${I18N.t("overview.travelers", { n: escapeHtml(grund.travelers) })}</div>` : ""}
            ${nights != null ? `<div class="hero-meta-item">${icon("calendar", 16)} ${I18N.tCount("overview.nights", nights)}</div>` : ""}
            ${price ? `<div class="hero-meta-item">${icon("receipt", 16)} ${escapeHtml(price)}</div>` : ""}
          </div>
        </div>
      </div>

      ${office ? `<div class="agency-info">${I18N.t("overview.mediatedBy", { name: `<strong>${escapeHtml(office.name)}</strong>`, address: escapeHtml(office.address) })}</div>` : ""}

      ${chips.length ? `
      <div class="status-row">
        ${chips.map((c) => `<div class="status-chip">${icon("checkCircle", 14)} ${I18N.t("verlaufType." + c.type)}</div>`).join("")}
      </div>` : ""}

      <button class="btn-primary" data-goto="plan">
        ${I18N.t("overview.viewPlan")} ${icon("arrowRight", 16)}
      </button>

      ${offers.length ? `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="section-head">
          <div class="section-title">${I18N.t("overview.recommendedForYou")}</div>
          <button class="section-link" data-goto="offers">${I18N.t("overview.seeAll")}</button>
        </div>
        <div class="mini-cards">
          ${offers.map((o) => {
            // Direkter Einsprung in den Angebotslink beim Klick (o.link,
            // gleiche Markdown-/Domain-Erkennung wie in renderOffers()) –
            // fehlt der Link, fällt die Karte wie bisher auf den Sprung zum
            // Tab "Zusatzleistungen" zurück (data-goto, siehe renderAll()).
            const url = offerLinkUrl(o.link);
            // Bei direktem Einsprung in den Angebotslink (öffnet in einem
            // neuen Tab, siehe target="_blank" oben) zusätzlich das externe-
            // Link-Symbol (Kasten mit Pfeil) einblenden, damit klar ist,
            // dass hier die App verlassen wird – ohne Link (Sprung zum Tab
            // "Zusatzleistungen" bleibt in der App) entfällt es.
            return url
              ? `<a class="mini-card" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
                  <div class="mini-card-head">
                    <div class="mini-card-icon">${icon(offerIcon(o), 16)}</div>
                    <span class="mini-card-external">${icon("externalLink", 13)}</span>
                  </div>
                  <div class="mini-card-title">${escapeHtml(offerTitle(o))}</div>
                </a>`
              : `<div class="mini-card" data-goto="offers">
                  <div class="mini-card-icon">${icon(offerIcon(o), 16)}</div>
                  <div class="mini-card-title">${escapeHtml(offerTitle(o))}</div>
                </div>`;
          }).join("")}
        </div>
      </div>` : ""}

      ${status === "ended" ? renderNextTripEntry() : ""}
    `;

    // Bewusst per direktem DOM-Toggle statt renderOverview() erneut
    // aufzurufen: ein Re-Render würde auch die [data-goto]-Buttons dieser
    // Ansicht neu erzeugen, die aber nur einmal (in renderAll()) gebunden
    // werden – ihre Klick-Handler wären danach weg.
    if (alarmText) {
      const bellBtn = document.querySelector("[data-alarm-toggle]");
      const banner = document.querySelector(".alarm-banner");
      const closeBtn = document.querySelector("[data-alarm-close]");
      if (bellBtn && banner) {
        bellBtn.addEventListener("click", () => {
          state.showAlarm = !state.showAlarm;
          banner.hidden = !state.showAlarm;
        });
      }
      if (closeBtn && banner) {
        closeBtn.addEventListener("click", () => {
          state.showAlarm = false;
          banner.hidden = true;
        });
      }
    }

    // #installBannerHolder bleibt als stabiler Platzhalter erhalten (siehe
    // oben) – renderInstallBanner() füllt ihn separat und wird auch von den
    // beforeinstallprompt-/appinstalled-Listenern erneut aufgerufen, ohne
    // dass dafür die ganze Overview neu gerendert werden müsste (gleiches
    // Prinzip wie beim Alarm-Banner oben).
    renderInstallBanner();
  }

  // "Nächste Reise" – Einsprung auf der Startseite, nur bei bereits
  // beendeten Reisen (siehe tripStatus() bei renderOverview()). Nutzt wie
  // die Angebots-Mini-Cards oben data-goto="nexttrip" statt eines eigenen
  // Klick-Handlers – die [data-goto]-Buttons werden ohnehin schon einmalig
  // in renderAll() gebunden (siehe dortigen Kommentar), das gilt auch für
  // diesen Button, da renderOverview() vor dieser Bindung läuft.
  function renderNextTripEntry() {
    const voucher = nextTripVoucherAmount();
    const grund = state.data.ReiseGrund || {};
    const text = voucher
      ? I18N.t("nexttrip.entryTextVoucher", { amount: escapeHtml(fmtPriceFromCents(voucher, grund.travelCurrency)) })
      : I18N.t("nexttrip.entryText");

    return `
      <div class="next-trip-card">
        <div class="next-trip-card-icon">${icon("suitcase", 19)}</div>
        <div class="next-trip-card-body">
          <div class="next-trip-card-title">${I18N.t("nexttrip.entryTitle")}</div>
          <div class="next-trip-card-text">${text}</div>
          <button type="button" class="btn-primary" data-goto="nexttrip">
            ${I18N.t("nexttrip.entryCta")} ${icon("arrowRight", 15)}
          </button>
        </div>
      </div>
    `;
  }

  // ---------- "Zum Home-Bildschirm hinzufügen" ----------
  //
  // Startet die App nicht bereits im Standalone-Modus (also nicht schon vom
  // Home-Bildschirm aus geöffnet) und wurde der Hinweis nicht schon einmal
  // weggeklickt, zeigt ein dezenter Banner auf der Startseite, wie man die
  // App zum Home-Bildschirm hinzufügt:
  // - Android/Chrome & Co.: nutzt das native beforeinstallprompt-Event für
  //   einen echten "Installieren"-Button (siehe Listener weiter unten).
  // - iOS/Safari: kann das Hinzufügen nicht programmatisch anstoßen, daher
  //   nur eine kurze Anleitung (Teilen-Symbol -> "Zum Home-Bildschirm").
  // Einmal weggeklickt, bleibt der Banner dauerhaft (localStorage) verborgen.

  const INSTALL_DISMISS_KEY = "meinereise:installBannerDismissed";
  let deferredInstallPrompt = null;

  function isStandaloneDisplay() {
    return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches)
      || window.navigator.standalone === true;
  }

  function isIOSDevice() {
    // iPadOS meldet sich seit iOS 13 per Default als "MacIntel" – daher
    // zusätzlich über Touch-Unterstützung von einem echten Mac abgrenzen.
    return /iphone|ipad|ipod/i.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function installBannerDismissed() {
    try { return localStorage.getItem(INSTALL_DISMISS_KEY) === "1"; } catch (e) { return false; }
  }

  function dismissInstallBanner() {
    try { localStorage.setItem(INSTALL_DISMISS_KEY, "1"); } catch (e) {
      // localStorage evtl. nicht verfügbar – Banner verschwindet dann nur
      // für die aktuelle Ansicht, taucht beim nächsten Laden wieder auf.
    }
    const holder = document.getElementById("installBannerHolder");
    if (holder) holder.innerHTML = "";
  }

  function renderInstallBanner() {
    const holder = document.getElementById("installBannerHolder");
    if (!holder) return;

    if (isStandaloneDisplay() || installBannerDismissed()) {
      holder.innerHTML = "";
      return;
    }

    if (deferredInstallPrompt) {
      holder.innerHTML = `
        <div class="install-banner">
          <div class="install-banner-icon">${icon("download", 16)}</div>
          <div class="install-banner-text">
            <strong>${I18N.t("install.appTitle")}</strong>
            ${I18N.t("install.appDesc")}
          </div>
          <button type="button" class="install-banner-btn" data-install-action>${I18N.t("install.appBtn")}</button>
          <button type="button" class="install-banner-close" data-install-dismiss aria-label="${I18N.t("install.close")}">${icon("close", 14)}</button>
        </div>`;
      const actionBtn = holder.querySelector("[data-install-action]");
      if (actionBtn) {
        actionBtn.addEventListener("click", async () => {
          if (!deferredInstallPrompt) return;
          deferredInstallPrompt.prompt();
          try { await deferredInstallPrompt.userChoice; } catch (e) {}
          deferredInstallPrompt = null;
          dismissInstallBanner();
        });
      }
    } else if (isIOSDevice()) {
      holder.innerHTML = `
        <div class="install-banner">
          <div class="install-banner-icon">${icon("download", 16)}</div>
          <div class="install-banner-text">
            <strong>${I18N.t("install.iosTitle")}</strong>
            ${I18N.t("install.iosDesc", { shareIcon: icon("share", 12) })}
          </div>
          <button type="button" class="install-banner-close" data-install-dismiss aria-label="${I18N.t("install.close")}">${icon("close", 14)}</button>
        </div>`;
    } else {
      holder.innerHTML = "";
      return;
    }

    const closeBtn = holder.querySelector("[data-install-dismiss]");
    if (closeBtn) closeBtn.addEventListener("click", dismissInstallBanner);
  }

  // ---------- View: Reiseplan ----------

  // ---------- "In der Nähe" (Google Places) ----------
  //
  // Zeigt zum Standort dieses Reisetages (siehe placesQueryForDay) ein paar
  // nahegelegene Restaurants/Sehenswürdigkeiten – serverseitig über
  // /api/places (Google Places API, mit Demo-Fallback ohne API-Key, gleiches
  // Muster wie /api/reisedaten und /api/office). An Kreuzfahrttagen liefert
  // der Server dafür nur Sehenswürdigkeiten (keine Restaurants, siehe
  // handlePlaces() in server.js) – die vorhandene restaurants.length-Prüfung
  // unten blendet die Restaurant-Zeile dann von selbst aus.

  function placesCacheKey(query) {
    // Bei Koordinaten auf 3 Nachkommastellen gerundet (~110m) statt exakter
    // Werte, damit minimale Abweichungen nicht zu unnötig vielen Cache-
    // Einträgen/Serveraufrufen führen. Bei einem Hafennamen (Kreuzfahrttag)
    // reicht der normalisierte Name als Schlüssel.
    return query.type === "port"
      ? `port:${query.port.trim().toLowerCase()}`
      : `${query.lat.toFixed(3)},${query.lon.toFixed(3)}`;
  }

  async function loadNearbyPlaces(query, key) {
    state.placesCache.set(key, "loading");
    try {
      const params = query.type === "port"
        ? `port=${encodeURIComponent(query.port)}`
        : `lat=${encodeURIComponent(query.lat)}&lon=${encodeURIComponent(query.lon)}`;
      const res = await fetch(`/api/places?${params}`);
      const json = await res.json();
      if (!res.ok || !json.data) throw new Error("Unerwartete Antwort");
      state.placesCache.set(key, {
        restaurants: json.data.restaurants || [],
        attractions: json.data.attractions || [],
        hinweis: json.source === "demo" ? json.hinweis : ""
      });
    } catch (err) {
      state.placesCache.set(key, "error");
    }
    // Nur neu rendern, wenn währenddessen nicht die Ansicht oder der Tag
    // gewechselt wurde – sonst würde ein längst verlassener Ladevorgang die
    // Anzeige eines inzwischen anderen Tages/einer anderen View überschreiben.
    const currentQuery = placesQueryForDay(state.activeDay);
    const stillRelevant = state.activeView === "plan"
      && currentQuery
      && placesCacheKey(currentQuery) === key;
    if (stillRelevant) renderPlan();
  }

  function renderPlacesRow(label, iconName, places) {
    return `
      <div class="places-group">
        <div class="places-group-title">${icon(iconName, 14)} ${label}</div>
        <div class="places-scroll">
          ${places.map((p) => `
            <a class="place-card" href="${escapeHtml(p.mapsUrl || "#")}" target="_blank" rel="noopener">
              <div class="place-card-name">${escapeHtml(p.name || "")}</div>
              ${p.rating ? `<div class="place-card-meta">${icon("star", 12)} ${Number(p.rating).toFixed(1)}${p.ratingCount ? ` (${p.ratingCount})` : ""}</div>` : ""}
              ${p.typeLabel ? `<div class="place-card-type">${escapeHtml(p.typeLabel)}</div>` : ""}
            </a>`).join("")}
        </div>
      </div>`;
  }

  function renderNearbyPlaces(query) {
    const key = placesCacheKey(query);
    const cached = state.placesCache.get(key);

    if (!cached || cached === "loading") {
      if (!cached) loadNearbyPlaces(query, key);
      return `
        <div class="places-section">
          <div class="places-title">${icon("pin", 15)} ${I18N.t("places.nearby")}</div>
          <div class="places-loading">${I18N.t("places.loading")}</div>
        </div>`;
    }

    if (cached === "error") {
      return `
        <div class="places-section">
          <div class="places-title">${icon("pin", 15)} ${I18N.t("places.nearby")}</div>
          <div class="places-loading">${I18N.t("places.loadError")}</div>
        </div>`;
    }

    const { restaurants, attractions, hinweis } = cached;
    if (!restaurants.length && !attractions.length) return "";

    return `
      <div class="places-section">
        <div class="places-title">${icon("pin", 15)} ${I18N.t("places.nearby")}</div>
        ${restaurants.length ? renderPlacesRow(I18N.t("places.restaurants"), "utensils", restaurants) : ""}
        ${attractions.length ? renderPlacesRow(I18N.t("places.attractions"), "mountain", attractions) : ""}
        ${hinweis ? `<div class="places-hinweis">${escapeHtml(hinweis)}</div>` : ""}
      </div>`;
  }

  // Ist die Reise schon beendet (tripStatus() === "ended"), zeigt der
  // Reiseplan nur noch eine Zusammenfassung (renderPlanSummary) statt der
  // normalen Tages-Tabs-Ansicht (renderPlanActive) – siehe dort.
  function renderPlan() {
    const days = tripDayList();
    const ended = tripStatus() === "ended";

    document.getElementById("view-plan").innerHTML = ended
      ? renderPlanSummary(days)
      : renderPlanActive(days);

    if (!ended) {
      document.querySelectorAll(".day-tab").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.activeDay = btn.dataset.day;
          renderPlan();
        });
      });
    }

    document.querySelectorAll("[data-verlauf-idx]").forEach((el) => {
      el.addEventListener("click", () => {
        const item = verlaufList()[Number(el.dataset.verlaufIdx)];
        if (!item) return;
        if (item.type === "H") openHotelDetail(item);
        else if (item.type === "C") openCruiseDetail(item);
      });
    });

    document.querySelectorAll("#view-plan [data-goto]").forEach((el) => {
      // Lokal gebunden statt über die globale renderAll()-Bindung, da
      // renderPlan() bei jedem Tageswechsel neu rendert (siehe oben) und
      // damit auch neu erzeugte Elemente wie hier die Angebots-Kacheln.
      el.addEventListener("click", () => showView(el.dataset.goto));
    });
  }

  // Normale Ansicht (Reise steht noch bevor oder läuft gerade): Tages-Tabs
  // zur Auswahl eines einzelnen Tages, dessen Timeline darunter, plus "In
  // der Nähe" (Google Places) zum Standort dieses Tages.
  function renderPlanActive(days) {
    if (!state.activeDay && days.length) state.activeDay = days[0].key;

    const activeItems = state.activeDay ? verlaufForDay(state.activeDay) : [];
    const placesQuery = state.activeDay ? placesQueryForDay(state.activeDay) : null;

    return `
      <div>
        <div class="greeting-name" style="font-size:22px;">${I18N.t("plan.title")}</div>
        <div class="hero-sub">${escapeHtml((state.data.ReiseGrund || {}).travelRegionText || "")}</div>
      </div>

      <div class="day-tabs">
        ${days.map((d) => `
          <button class="day-tab ${d.key === state.activeDay ? "is-active" : ""}" data-day="${d.key}">
            <span class="dow">${dowShort(d.date.getDay())}</span>
            <span class="num">${d.date.getDate()}</span>
          </button>`).join("")}
      </div>

      <div class="timeline">
        ${activeItems.length ? activeItems.map((item, i) => renderTimelineRow(item, i === activeItems.length - 1, state.activeDay)).join("")
          : renderEmptyDay(state.activeDay)}
      </div>

      ${placesQuery ? renderNearbyPlaces(placesQuery) : ""}
    `;
  }

  // Zusammenfassung für bereits beendete Reisen: nur noch ein Rückblick,
  // kein Planungswerkzeug mehr. Deshalb bewusst anders als renderPlanActive:
  // - keine Tages-Tabs/aktiver Tag, stattdessen alle Tage mit mindestens
  //   einem Eintrag direkt untereinander (nicht nebeneinander wählbar),
  // - Tage ganz ohne eigenen Eintrag werden nicht mehr angezeigt (weder als
  //   Leerzeile noch mit Hotel-/Mietwagen-Kontextkarte oder Angebots-
  //   Vorschlägen – für eine vorbei gereiste Reise gibt es nichts mehr zu
  //   empfehlen oder zu planen),
  // - keine "In der Nähe"-Abfrage (Google Places) mehr, weder Aufruf noch
  //   Anzeige – auch das ergibt für einen bereits vergangenen Tag keinen
  //   Sinn mehr und spart unnötige (kostenpflichtige) API-Aufrufe.
  function renderPlanSummary(days) {
    const dayGroups = days
      .map((d) => ({ day: d, items: verlaufForDay(d.key) }))
      .filter((g) => g.items.length);

    return `
      <div>
        <div class="greeting-name" style="font-size:22px;">${I18N.t("plan.title")}</div>
        <div class="hero-sub">${escapeHtml((state.data.ReiseGrund || {}).travelRegionText || "")}</div>
      </div>

      <div class="plan-summary">
        ${dayGroups.length ? dayGroups.map((g) => `
          <div class="plan-summary-day">
            <div class="plan-summary-day-head">
              <span class="dow">${dowShort(g.day.date.getDay())}</span>
              <span>${fmtDate(g.day.key)}</span>
            </div>
            <div class="timeline">
              ${g.items.map((item, i) => renderTimelineRow(item, i === g.items.length - 1, g.day.key)).join("")}
            </div>
          </div>`).join("") : `<div class="timeline-empty">${I18N.t("plan.noProgramToday")}</div>`}
      </div>
    `;
  }

  // Tag ohne eigenen ReiseVerlauf-Eintrag: statt der reinen Leermeldung den
  // Hotel- bzw. Kreuzfahrt-Kontext zeigen (falls der Tag in einen
  // Hotelaufenthalt oder eine laufende Kreuzfahrt fällt) und 1-2 passende
  // Zusatzangebote (Ausflüge/Mietwagen) vorschlagen – macht aus der Lücke
  // eine Gelegenheit statt einer Sackgasse. An Seetagen gibt es keine
  // Landausflüge, daher wird "Ausflüge" dort aus den Vorschlägen entfernt.
  function renderEmptyDay(dayKeyStr) {
    const cruise = cruiseForDay(dayKeyStr);
    const hotel = cruise ? null : hotelForDay(dayKeyStr);
    const rentalCar = rentalCarForDay(dayKeyStr);
    const cruiseStop = cruise ? cruiseRouteStopForDay(cruise, dayKeyStr) : null;
    const isSeaDay = !!(cruiseStop && cruiseStop.isSeaDay);
    const offers = suggestedOffersForEmptyDay(isSeaDay, !!rentalCar);

    let contextCard;
    if (cruise) {
      const idx = verlaufList().indexOf(cruise);
      const times = cruiseStop && !cruiseStop.isSeaDay
        ? [cruiseStop.arrival ? I18N.t("plan.at", { time: cruiseStop.arrival }) : "", cruiseStop.departure ? I18N.t("plan.from", { time: cruiseStop.departure }) : ""].filter(Boolean).join(" · ")
        : "";
      const title = cruiseStop
        ? (cruiseStop.isSeaDay ? I18N.t("plan.seaDay") : I18N.t("plan.inPort", { port: escapeHtml(cruiseStop.port || "") }))
        : escapeHtml(cruise.cruiseShipName || I18N.t("hotel.cruiseFallback"));
      const sub = [escapeHtml(cruise.cruiseShipName || ""), times].filter(Boolean).join(" · ") || I18N.t("plan.toCruise");
      contextCard = `
        <div class="timeline-card is-clickable" data-verlauf-idx="${idx}">
          ${icon(isSeaDay ? "boat" : "pin", 17)}
          <div>
            <div class="timeline-card-title">${title}</div>
            <div class="timeline-card-sub">${sub}</div>
          </div>
          <span class="doc-chevron">${icon("chevronRight", 16)}</span>
        </div>`;
    } else if (hotel) {
      const idx = verlaufList().indexOf(hotel);
      contextCard = `
        <div class="timeline-card is-clickable" data-verlauf-idx="${idx}">
          ${icon("suitcase", 17)}
          <div>
            <div class="timeline-card-title">${I18N.t("plan.stayingAt", { hotel: escapeHtml(hotel.hotelName || I18N.t("plan.hotelFallback")) })}</div>
            <div class="timeline-card-sub">${[hotel.roomCategoryName, hotel.mealsCategoryName].filter(Boolean).map(escapeHtml).join(" · ") || I18N.t("plan.noFixedProgram")}</div>
          </div>
          <span class="doc-chevron">${icon("chevronRight", 16)}</span>
        </div>`;
    } else if (rentalCar) {
      // Kein eigener [data-verlauf-idx]/Detailseite – die Daten sind bisher
      // zu rudimentär (nur carCategoryClass + Zeiten) für eine eigene
      // Unterseite wie bei Hotel/Kreuzfahrt.
      contextCard = `
        <div class="timeline-card">
          ${icon("car", 17)}
          <div>
            <div class="timeline-card-title">${I18N.t("plan.rentalCarOnTheWay")}</div>
            <div class="timeline-card-sub">${escapeHtml(rentalCar.carCategoryClass || "")}</div>
          </div>
        </div>`;
    } else {
      contextCard = `<div class="timeline-empty">${I18N.t("plan.noProgramToday")}</div>`;
    }

    return `
      <div class="day-empty">
        ${contextCard}

        ${offers.length ? `
        <div class="day-suggestions">
          <div class="day-suggestions-title">${I18N.t("plan.suitableToday")}</div>
          <div class="mini-cards">
            ${offers.map((o) => `
              <div class="mini-card" data-goto="offers">
                <div class="mini-card-icon">${icon(offerIcon(o), 16)}</div>
                <div class="mini-card-title">${escapeHtml(offerTitle(o))}</div>
              </div>`).join("")}
          </div>
        </div>` : ""}
      </div>
    `;
  }

  function renderTimelineRow(item, isLast, dayKeyStr) {
    const meta = VERLAUF_META[item.type] || { icon: "mountain" };
    let title = verlaufTypeLabel(item.type);
    let sub = "";
    let time = "";
    let highlight = false;

    if (item.type === "F") {
      title = `${item.flightType === "R" ? I18N.t("plan.returnFlight") : I18N.t("plan.outboundFlight")} ${escapeHtml(item.flightCarrier || "")} ${escapeHtml(item.flightNumber || "")}`.trim();
      sub = `${escapeHtml(item.departureAirportCodeTxt || item.departureAirportTxt || "")} (${escapeHtml(item.departureAirportCode || "")}) → ${escapeHtml(item.arrivalAirportCodeTxt || item.arrivalAirportTxt || "")} (${escapeHtml(item.arrivalAirportCode || "")})`;
      const dep = fmtTime(item.departureDateTime);
      const arr = fmtTime(item.arrivalDateTime);
      time = dep && arr ? `${dep} – ${arr}` : dep;
      highlight = true;
    } else if (item.type === "H") {
      title = I18N.t("plan.checkIn", { hotel: escapeHtml(item.hotelName || "") });
      sub = [item.roomCategoryName, item.mealsCategoryName].filter(Boolean).map(escapeHtml).join(" · ");
      time = "";
    } else if (item.type === "T") {
      title = I18N.t("plan.transfer");
      sub = escapeHtml(item.text || "");
      time = "";
    } else if (item.type === "M") {
      // Ein Mietwagen-Eintrag erscheint an ZWEI Tagen in der Timeline: am
      // Tag von pickupDateTime als "Abholung Mietwagen" und am Tag von
      // returnDateTime als "Rückgabe Mietwagen" (siehe verlaufForDay(),
      // das den Eintrag für den Rückgabetag zusätzlich einblendet). Welcher
      // der beiden Fälle vorliegt, entscheidet der übergebene dayKeyStr.
      // pickupDateTime/returnDateTime kommen als "JJJJMMDDHHMMSS"
      // (14-stellig, die ersten 8 Stellen sind das Datum).
      const pickupDate = (item.pickupDateTime || "").slice(0, 8);
      const returnDate = (item.returnDateTime || "").slice(0, 8);
      const isReturn = !!dayKeyStr && dayKeyStr === returnDate && dayKeyStr !== pickupDate;
      title = isReturn ? I18N.t("plan.returnCar") : I18N.t("plan.pickupCar");
      sub = escapeHtml(item.carCategoryClass || "");
      time = fmtTime(isReturn ? item.returnDateTime : item.pickupDateTime);
    } else if (item.type === "C") {
      title = I18N.t("plan.cruiseLine", { ship: escapeHtml(item.cruiseShipName || "") });
      // Für den Zeilentag (meist der Einschiffungstag) den Routenplan-Halt
      // dieses Tages zeigen, falls cruiseRouteDet einen liefert – sonst auf
      // Kabine/Reederei zurückfallen.
      const stop = cruiseRouteStopForDay(item, item.sortDate);
      if (stop) {
        const times = !stop.isSeaDay
          ? [stop.arrival ? I18N.t("plan.at", { time: stop.arrival }) : "", stop.departure ? I18N.t("plan.from", { time: stop.departure }) : ""].filter(Boolean).join(" · ")
          : "";
        sub = [escapeHtml(stop.isSeaDay ? I18N.t("plan.seaDay") : stop.port || ""), times].filter(Boolean).join(" · ");
      } else {
        sub = [item.cruiseCabinName, item.cruiseCompany].filter(Boolean).map(escapeHtml).join(" · ") || escapeHtml(item.cruiseRoute || "");
      }
    } else if (item.type === "V") {
      title = I18N.t("plan.insurance");
      // discription kann HTML enthalten (z.B. <br>, Links) und wird daher
      // bewusst nicht escaped, sondern wie bei den Zusatzleistungen als
      // Markup gerendert.
      sub = item.discription || "";
    } else {
      sub = item.discription || escapeHtml(item.text || "");
    }

    // Hotel- und Kreuzfahrt-Einträge führen auf eine eigene Detailseite,
    // genau wie Hotel – siehe [data-verlauf-idx]-Bindung in renderPlan().
    const isDetailLink = item.type === "H" || item.type === "C";
    const verlaufIdx = isDetailLink ? verlaufList().indexOf(item) : -1;

    return `
      <div class="timeline-row">
        <div class="timeline-rail">
          <div class="timeline-dot"></div>
          ${isLast ? "" : '<div class="timeline-line"></div>'}
        </div>
        <div class="timeline-body">
          ${time ? `<div class="timeline-time">${time}</div>` : ""}
          <div class="timeline-card ${highlight ? "is-highlight" : ""} ${isDetailLink ? "is-clickable" : ""}" ${isDetailLink ? `data-verlauf-idx="${verlaufIdx}"` : ""}>
            ${icon(meta.icon, 17)}
            <div>
              <div class="timeline-card-title">${title}</div>
              ${sub ? `<div class="timeline-card-sub">${sub}</div>` : ""}
            </div>
            ${isDetailLink ? `<span class="doc-chevron">${icon("chevronRight", 16)}</span>` : ""}
          </div>
        </div>
      </div>`;
  }

  // ---------- View: Hotel-Details ----------
  //
  // Eigene Unterseite (kein Bottom-Nav-Eintrag, nur per Klick auf einen
  // Hotel-Eintrag im Reiseplan erreichbar) für discription, hotelPics[]
  // und die Lage (locationLatitude/locationLongitude).

  function hotelMapEmbedUrl(lat, lon) {
    const la = parseFloat(lat), lo = parseFloat(lon);
    if (!Number.isFinite(la) || !Number.isFinite(lo)) return "";
    const d = 0.012;
    const bbox = `${lo - d},${la - d},${lo + d},${la + d}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${la}%2C${lo}`;
  }

  function hotelMapLinkUrl(lat, lon) {
    const la = parseFloat(lat), lo = parseFloat(lon);
    if (!Number.isFinite(la) || !Number.isFinite(lo)) return "";
    return `https://www.openstreetmap.org/?mlat=${la}&mlon=${lo}#map=15/${la}/${lo}`;
  }

  // Generisch für alle Bild-Arrays im {picLink}-Format – wird sowohl für
  // hotelPics als auch für cruisePics (Kreuzfahrt) verwendet, siehe unten.
  function mediaPicUrls(pics) {
    // Die API liefert Bilder als Array von Objekten ({picLink: "..."}),
    // nicht als Array reiner URL-Strings – daher hier robust beide Formen
    // sowie ein paar alternative Feldnamen abfangen.
    if (!Array.isArray(pics)) return [];
    return pics
      .map((p) => {
        if (typeof p === "string") return p;
        if (p && typeof p === "object") return p.picLink || p.picUrl || p.url || p.link || "";
        return "";
      })
      .filter((url) => typeof url === "string" && url.trim());
  }

  // Der Abruf jedes einzelnen Bilds (Hotel wie Kreuzfahrt) ist kostenpflichtig
  // – daher werden beim Öffnen der Seite maximal 3 Bilder geladen (1 Hero +
  // 2 in der Strip-Leiste). Weitere Bilder werden nur als Zähler-Kachel
  // "+N weitere" angezeigt und erst per Klick nachgeladen (kein <img src>
  // vorher, damit der Browser sie nicht automatisch abruft).
  const GALLERY_INITIAL_COUNT = 3;

  function renderMediaGallery(pics) {
    const visible = pics.slice(0, GALLERY_INITIAL_COUNT);
    const remaining = pics.slice(GALLERY_INITIAL_COUNT);
    const [heroPic, ...stripPics] = visible;
    return `
      <div class="hotel-gallery-hero">
        <img src="${escapeHtml(heroPic)}" alt="" loading="lazy" data-gallery-index="0" onerror="this.closest('.hotel-gallery-hero').remove();">
      </div>
      ${stripPics.length || remaining.length ? `
      <div class="hotel-gallery-strip">
        ${stripPics.map((src, i) => `<img src="${escapeHtml(src)}" alt="" loading="lazy" data-gallery-index="${i + 1}" onerror="this.remove();">`).join("")}
        ${remaining.length ? `<button type="button" class="hotel-gallery-more" data-remaining-count="${remaining.length}">+${remaining.length}<span>${I18N.t("hotel.more")}</span></button>` : ""}
      </div>` : ""}
    `;
  }

  function loadRemainingMediaPics(container, remaining) {
    const moreBtn = container.querySelector(".hotel-gallery-more");
    const stripEl = container.querySelector(".hotel-gallery-strip");
    if (!moreBtn || !stripEl) return;
    moreBtn.addEventListener("click", () => {
      remaining.forEach((src, i) => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "";
        img.loading = "lazy";
        img.dataset.galleryIndex = String(GALLERY_INITIAL_COUNT + i);
        img.addEventListener("error", () => img.remove());
        stripEl.insertBefore(img, moreBtn);
      });
      moreBtn.remove();
    });
  }

  // Klick auf eines der (auch nachgeladenen, siehe loadRemainingMediaPics)
  // Vorschaubilder öffnet ein Vollbild-Karussell über ALLE Bilder (nicht nur
  // die anfangs geladenen 3) – die Anfangsbegrenzung selbst bleibt davon
  // unberührt, geladen wird weiterhin nur, was tatsächlich angeschaut wird
  // (siehe openGalleryLightbox: pro Bild ein eigenes <img loading="lazy">,
  // der Browser holt es erst beim Erreichen des Slides). Per Event-
  // Delegation auf dem gesamten Container statt einzelner Listener pro
  // <img>, damit auch später von loadRemainingMediaPics eingefügte Bilder
  // ohne erneutes Binden funktionieren.
  function wireMediaGallery(container, pics) {
    container.addEventListener("click", (event) => {
      const img = event.target.closest("[data-gallery-index]");
      if (!img) return;
      const idx = parseInt(img.dataset.galleryIndex, 10);
      if (Number.isFinite(idx)) openGalleryLightbox(pics, idx);
    });
  }

  // Vollbild-Bilderkarussell (Hotel-/Kreuzfahrt-Galerie). Horizontales
  // Scroll-Snap statt einer JS-Swipe-Bibliothek (passt zur Zero-Dependency-
  // Philosophie der App, funktioniert nativ per Touch-Wisch wie per
  // Pfeiltasten/Buttons). Jeder Slide bekommt ein eigenes <img
  // loading="lazy">, dadurch lädt der Browser auch hier nur Bilder, die
  // tatsächlich (fast) in Sicht kommen, nicht alle auf einmal.
  function openGalleryLightbox(pics, startIndex) {
    if (!pics.length) return;
    const startIdx = Math.max(0, Math.min(startIndex, pics.length - 1));

    const overlay = document.createElement("div");
    overlay.className = "gallery-lightbox";
    overlay.innerHTML = `
      <button type="button" class="gallery-lightbox-close" aria-label="${I18N.t("overview.close")}">${icon("close", 20)}</button>
      ${pics.length > 1 ? `<div class="gallery-lightbox-counter" aria-live="polite"></div>` : ""}
      <div class="gallery-lightbox-track">
        ${pics.map((src) => `
          <div class="gallery-lightbox-slide">
            <img src="${escapeHtml(src)}" alt="" loading="lazy" onerror="this.closest('.gallery-lightbox-slide').classList.add('is-error')">
          </div>
        `).join("")}
      </div>
      ${pics.length > 1 ? `
      <button type="button" class="gallery-lightbox-nav gallery-lightbox-prev" aria-label="${I18N.t("hotel.galleryPrev")}">${icon("chevronLeft", 22)}</button>
      <button type="button" class="gallery-lightbox-nav gallery-lightbox-next" aria-label="${I18N.t("hotel.galleryNext")}">${icon("chevronRight", 22)}</button>` : ""}
    `;
    document.body.appendChild(overlay);
    document.body.classList.add("gallery-lightbox-open");

    const track = overlay.querySelector(".gallery-lightbox-track");
    const counterEl = overlay.querySelector(".gallery-lightbox-counter");
    const slides = Array.from(overlay.querySelectorAll(".gallery-lightbox-slide"));
    let current = startIdx;

    function updateCounter() {
      if (!counterEl) return;
      counterEl.textContent = `${current + 1} / ${pics.length}`;
      counterEl.setAttribute("aria-label", I18N.t("hotel.galleryImageOf", { current: current + 1, total: pics.length }));
    }

    function scrollToIndex(i, behavior) {
      slides[i].scrollIntoView({ behavior, block: "nearest", inline: "start" });
    }

    function close() {
      document.body.classList.remove("gallery-lightbox-open");
      document.removeEventListener("keydown", onKeydown);
      observer.disconnect();
      overlay.remove();
    }

    function go(delta) {
      current = Math.max(0, Math.min(current + delta, pics.length - 1));
      scrollToIndex(current, "smooth");
      updateCounter();
    }

    function onKeydown(event) {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowLeft") go(-1);
      else if (event.key === "ArrowRight") go(1);
    }

    overlay.querySelector(".gallery-lightbox-close").addEventListener("click", close);
    // Klick auf den dunklen Rand (nicht auf einen Button oder das Bild
    // selbst) schließt ebenfalls, wie bei einem typischen Lightbox-
    // Verhalten – das schließt auch die Padding-Fläche um das Bild herum
    // im jeweiligen Slide mit ein, nicht nur den Track/Overlay selbst.
    overlay.addEventListener("click", (event) => {
      if (event.target.tagName !== "IMG" && !event.target.closest("button")) close();
    });
    const prevBtn = overlay.querySelector(".gallery-lightbox-prev");
    const nextBtn = overlay.querySelector(".gallery-lightbox-next");
    if (prevBtn) prevBtn.addEventListener("click", () => go(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => go(1));
    document.addEventListener("keydown", onKeydown);

    // Zähler bei manuellem Wischen/Scrollen (nicht nur bei den Prev/Next-
    // Buttons) synchron halten.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          current = slides.indexOf(entry.target);
          updateCounter();
        }
      });
    }, { root: track, threshold: [0.5] });
    slides.forEach((slide) => observer.observe(slide));

    // Ohne Animation direkt zum angeklickten Bild springen (kein sichtbares
    // Durchscrollen von Bild 1 zum tatsächlich gewünschten Bild).
    scrollToIndex(startIdx, "instant");
    updateCounter();
  }

  function openHotelDetail(item) {
    state.selectedHotel = item;
    renderHotelDetail();
    showView("hotel");
  }

  function renderHotelDetail() {
    const h = state.selectedHotel;
    const container = document.getElementById("view-hotel");

    if (!h) {
      container.innerHTML = `<div class="error-box">${I18N.t("hotel.noHotelSelected")}</div>`;
      return;
    }

    const pics = mediaPicUrls(h.hotelPics);
    const mapEmbed = hotelMapEmbedUrl(h.locationLatitude, h.locationLongitude);
    const mapLink = hotelMapLinkUrl(h.locationLatitude, h.locationLongitude);
    const subline = [h.roomCategoryName, h.mealsCategoryName].filter(Boolean).map(escapeHtml).join(" · ");

    container.innerHTML = `
      <button class="back-link" data-back="plan">${icon("chevronLeft", 16)} ${I18N.t("hotel.back")}</button>

      <div class="hotel-detail">
        ${pics.length ? renderMediaGallery(pics) : ""}

        <div>
          <div class="hotel-detail-header">
            <div class="greeting-name" style="font-size:20px;">${escapeHtml(h.hotelName || I18N.t("hotel.hotelFallback"))}</div>
            ${h.hotelStars ? `<div class="hotel-stars">${"★".repeat(Math.min(7, Math.max(0, parseInt(h.hotelStars, 10) || 0)))}</div>` : ""}
          </div>
          ${subline ? `<div class="hero-sub">${subline}</div>` : ""}
        </div>

        ${h.discription ? `<div class="hotel-description">${h.discription}</div>` : ""}

        ${mapEmbed ? `
        <div class="hotel-map">
          <iframe src="${escapeHtml(mapEmbed)}" loading="lazy" title="${I18N.t("hotel.mapTitle")}" referrerpolicy="no-referrer-when-downgrade"></iframe>
          <a class="offer-link" href="${escapeHtml(mapLink)}" target="_blank" rel="noopener noreferrer">${I18N.t("hotel.openInOSM")} ${icon("externalLink", 13)}</a>
        </div>` : ""}
      </div>
    `;

    container.querySelectorAll("[data-back]").forEach((btn) => {
      btn.addEventListener("click", () => showView(btn.dataset.back));
    });

    if (pics.length > GALLERY_INITIAL_COUNT) {
      loadRemainingMediaPics(container, pics.slice(GALLERY_INITIAL_COUNT));
    }
    if (pics.length) {
      wireMediaGallery(container, pics);
    }
  }

  // ---------- View: Kreuzfahrt-Details ----------
  //
  // Eigene Unterseite, im Prinzip wie die Hotel-Details: cruiseDiscription
  // (HTML, unescaped – gleiche Begründung wie bei Hotel-discription),
  // cruisePics[] als Galerie (gleiches {picLink}-Format und gleiche
  // Kostenbremse wie bei hotelPics: erst 3 Bilder, Rest per Klick).
  // Nur per Klick auf einen Kreuzfahrt-Eintrag im Reiseplan erreichbar,
  // kein eigener Bottom-Nav-Eintrag.

  function openCruiseDetail(item) {
    state.selectedCruise = item;
    renderCruiseDetail();
    showView("cruise");
  }

  // cruiseRouteDet liefert pro Hafen ein "day" (Differenz in Tagen zum
  // Abreisedatum/startDate, nicht zum sortDate) sowie arrival/departure als
  // Uhrzeit ohne führende Nullen bzw. Trennzeichen (z.B. "700" = 07:00,
  // "1800" = 18:00) – "-1" bedeutet "keine Angabe" (z.B. keine Ankunft am
  // Abreisetag, keine Abfahrt am letzten Tag). Ein Hafen mit Namen "Seetag"
  // ist kein Anlaufhafen, sondern ein Tag auf See.
  function fmtCruiseClock(v) {
    if (v === undefined || v === null) return "";
    const s = String(v).trim();
    if (!s || s === "-1") return "";
    const n = s.padStart(4, "0");
    return `${n.slice(0, 2)}:${n.slice(2, 4)}`;
  }

  function cruiseRouteStops(item) {
    const start = parseYYYYMMDD(item.startDate || item.sortDate);
    const det = Array.isArray(item.cruiseRouteDet) ? item.cruiseRouteDet : [];
    return det
      .slice()
      .sort((a, b) => (parseInt(a.day, 10) || 0) - (parseInt(b.day, 10) || 0))
      .map((stop) => {
        const dayOffset = parseInt(stop.day, 10) || 0;
        let date = null;
        if (start) {
          date = new Date(start);
          date.setDate(date.getDate() + dayOffset);
        }
        const port = (stop.port || "").trim();
        return {
          date,
          port,
          isSeaDay: port.toLowerCase() === "seetag",
          arrival: fmtCruiseClock(stop.arrival),
          departure: fmtCruiseClock(stop.departure)
        };
      });
  }

  function renderCruiseRoute(item) {
    const stops = cruiseRouteStops(item);
    if (!stops.length) return "";

    return `
      <div class="cruise-route">
        <div class="day-suggestions-title">${I18N.t("plan.routePlan")}</div>
        <div class="timeline">
          ${stops.map((s, i) => {
            const times = s.isSeaDay ? "" : [s.arrival ? I18N.t("plan.at", { time: s.arrival }) : "", s.departure ? I18N.t("plan.from", { time: s.departure }) : ""].filter(Boolean).join(" · ");
            return `
            <div class="timeline-row">
              <div class="timeline-rail">
                <div class="timeline-dot"></div>
                ${i === stops.length - 1 ? "" : '<div class="timeline-line"></div>'}
              </div>
              <div class="timeline-body">
                ${s.date ? `<div class="timeline-time">${dowShort(s.date.getDay())} ${fmtDate(dayKey(s.date))}</div>` : ""}
                <div class="timeline-card">
                  ${icon(s.isSeaDay ? "boat" : "pin", 17)}
                  <div>
                    <div class="timeline-card-title">${escapeHtml(s.isSeaDay ? I18N.t("plan.seaDay") : s.port || I18N.t("plan.portFallback"))}</div>
                    ${times ? `<div class="timeline-card-sub">${escapeHtml(times)}</div>` : ""}
                  </div>
                </div>
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>
    `;
  }

  function renderCruiseDetail() {
    const c = state.selectedCruise;
    const container = document.getElementById("view-cruise");

    if (!c) {
      container.innerHTML = `<div class="error-box">${I18N.t("hotel.noCruiseSelected")}</div>`;
      return;
    }

    const pics = mediaPicUrls(c.cruisePics);
    const subline = [c.cruiseCabinName, c.cruiseCompany].filter(Boolean).map(escapeHtml).join(" · ");

    container.innerHTML = `
      <button class="back-link" data-back="plan">${icon("chevronLeft", 16)} ${I18N.t("hotel.back")}</button>

      <div class="hotel-detail">
        ${pics.length ? renderMediaGallery(pics) : ""}

        <div>
          <div class="hotel-detail-header">
            <div class="greeting-name" style="font-size:20px;">${escapeHtml(c.cruiseShipName || I18N.t("hotel.cruiseFallback"))}</div>
          </div>
          ${subline ? `<div class="hero-sub">${subline}</div>` : ""}
        </div>

        ${c.cruiseDiscription ? `<div class="hotel-description">${c.cruiseDiscription}</div>` : ""}

        ${renderCruiseRoute(c)}
      </div>
    `;

    container.querySelectorAll("[data-back]").forEach((btn) => {
      btn.addEventListener("click", () => showView(btn.dataset.back));
    });

    if (pics.length > GALLERY_INITIAL_COUNT) {
      loadRemainingMediaPics(container, pics.slice(GALLERY_INITIAL_COUNT));
    }
    if (pics.length) {
      wireMediaGallery(container, pics);
    }
  }

  // ---------- View: Zusatzleistungen ----------
  //
  // Feld "ZusatzLeistung" (nicht "ZusatzAngebote") liefert die echte API –
  // wir lesen defensiv beide Namen. Jeder Eintrag hat: type (G-Code), art,
  // headline, icon (Material-Symbols-Name), link, text (kann HTML enthalten,
  // z.B. <br>, <table> bei G004/G007), grafikMail/grafikVorg (Bild-URLs).

  // Material-Symbols-Name (Feld "icon" aus der API) -> eigenes SVG-Icon
  const MATERIAL_ICON_MAP = {
    local_hospital: "shield",
    directions_car: "car",
    local_parking: "parking",
    flight: "plane",
    thermostat: "sun",
    grading: "checkCircle",
    credit_card: "creditCard",
    fact_check: "checkCircle",
    calendar_today: "calendar",
    tour: "mountain",
    luggage: "suitcase",
    airplane_ticket: "plane",
    for_you: "gift",
    local_police: "shield"
  };

  // Fallback über den G-Code, falls "icon" fehlt/unbekannt ist, plus
  // Zuordnung zu den Filter-Chips.
  const G_CODE_META = {
    G001: { icon: "shield", filter: "versicherung" },
    G002: { icon: "shield", filter: "versicherung" },
    G003: { icon: "shield", filter: "weitere" },
    G004: { icon: "car", filter: "mietwagen" },
    G005: { icon: "parking", filter: "weitere" },
    G006: { icon: "plane", filter: "weitere" },
    G007: { icon: "sun", filter: "weitere" },
    G009: { icon: "checkCircle", filter: "weitere" },
    G010: { icon: "bell", filter: "weitere" },
    G011: { icon: "checkCircle", filter: "weitere" },
    G012: { icon: "calendar", filter: "weitere" },
    G013: { icon: "mountain", filter: "ausfluege" },
    G014: { icon: "suitcase", filter: "weitere" },
    G015: { icon: "plane", filter: "weitere" },
    G016: { icon: "gift", filter: "weitere" },
    G017: { icon: "gift", filter: "weitere" },
    G018: { icon: "document", filter: "weitere" },
    G019: { icon: "users", filter: "weitere" },
    G020: { icon: "document", filter: "weitere" },
    G021: { icon: "mountain", filter: "ausfluege" },
    G022: { icon: "creditCard", filter: "weitere" },
    G023: { icon: "creditCard", filter: "weitere" }
  };

  function offerIcon(o) {
    return MATERIAL_ICON_MAP[o.icon] || (G_CODE_META[o.type] || {}).icon || "mountain";
  }

  function offerFilter(o) {
    return (G_CODE_META[o.type] || {}).filter || "weitere";
  }

  // Titel einer Zusatzleistung: bevorzugt die anhand des G-Codes übersetzte
  // Kategorie-Bezeichnung (siehe OFFER_TYPE_LABELS in i18n.js – nur für
  // Codes mit gesicherter Bedeutung befüllt), sonst die Original-Headline
  // aus der API (Deutsch) – siehe Kommentar oben bei "View: Zusatzleistungen".
  function offerTitle(o) {
    return I18N.offerTypeLabel(o.type) || o.headline || "";
  }

  // "link" kommt in unterschiedlichen Formen: reine URL, Markdown-Link
  // "[text](ziel)" (mit oder ohne https://), reine Domain ohne Protokoll
  // (z.B. "www.auswaertigesamt.de"), oder leer (""). Fehlt das Protokoll,
  // wird https:// automatisch ergänzt, damit ein gültiger Link entsteht.
  function offerLinkUrl(link) {
    if (!link) return "";
    const md = link.trim().match(/\]\(([^)]+)\)/);
    let target = (md ? md[1] : link).trim();
    if (!target) return "";
    if (/^https?:\/\//i.test(target)) return target;
    // Sieht das wie eine Domain aus (z.B. "www.bosys.info" oder
    // "bosys.info/pfad")? Dann https:// voranstellen statt zu verwerfen.
    if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(target)) return "https://" + target;
    return "";
  }

  function zusatzLeistungList() {
    return state.data.ZusatzLeistung || state.data.ZusatzAngebote || [];
  }

  // grafikMail zeigt teils nur auf einen leeren Ordner (z.B. "…/uiplus/" ohne
  // Dateinamen) statt auf ein echtes Bild – das zählt als "kein Bild".
  function validGrafikUrl(url) {
    if (!url || !/^https?:\/\//.test(url)) return "";
    if (/\/$/.test(url)) return "";
    return url;
  }

  function renderOffers() {
    const all = zusatzLeistungList();
    const weather = all.find((o) => o.type === "G007");
    const offers = all.filter((o) => o.type !== "G007" && (o.headline || o.text));

    const filters = [
      { id: "all", label: I18N.t("offers.filterAll") },
      { id: "mietwagen", label: I18N.t("offers.filterCarRental") },
      { id: "versicherung", label: I18N.t("offers.filterInsurance") },
      { id: "ausfluege", label: I18N.t("offers.filterExcursions") },
      { id: "weitere", label: I18N.t("offers.filterOther") }
    ];

    const visible = offers.filter((o) => {
      if (state.activeOfferFilter === "all") return true;
      return offerFilter(o) === state.activeOfferFilter;
    });

    document.getElementById("view-offers").innerHTML = `
      <div>
        <div class="greeting-name" style="font-size:22px;">${I18N.t("offers.title")}</div>
        <div class="hero-sub">${I18N.t("offers.subtitle")}</div>
      </div>

      ${weather ? renderWeatherWidget(weather) : ""}

      <div class="chip-row">
        ${filters.map((f) => `<button class="chip ${f.id === state.activeOfferFilter ? "is-active" : ""}" data-filter="${f.id}">${f.label}</button>`).join("")}
      </div>

      <div class="offer-list">
        ${visible.map((o) => {
          const url = offerLinkUrl(o.link);
          const grafik = !o.text ? validGrafikUrl(o.grafikMail) : "";
          return `
          <div class="offer-card">
            <div class="offer-icon">${icon(offerIcon(o), 22)}</div>
            <div style="flex:1;min-width:0;">
              <div class="offer-title">${escapeHtml(offerTitle(o))}</div>
              ${o.text ? `<div class="offer-sub offer-html">${o.text}</div>` : ""}
              ${grafik ? `<img class="offer-img" src="${escapeHtml(grafik)}" alt="" loading="lazy" onerror="this.remove()">` : ""}
              ${url ? `<a class="offer-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${I18N.t("offers.readMore")} ${icon("externalLink", 13)}</a>` : ""}
            </div>
          </div>`;
        }).join("") || `<div class="timeline-empty">${I18N.t("offers.noneInCategory")}</div>`}
      </div>
    `;

    document.querySelectorAll("[data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeOfferFilter = btn.dataset.filter;
        renderOffers();
      });
    });
  }

  function renderWeatherWidget(weather) {
    return `
      <div class="weather-card">
        <div class="weather-title">${icon("sun", 15)} ${escapeHtml(offerTitle(weather) || I18N.t("offers.weatherFallback"))}</div>
        <div class="weather-html">${weather.text || ""}</div>
      </div>`;
  }

  // ---------- View: Dokumente ----------

  // dokTitleText ist die kurze, verlässliche Kategorie ("Reisebestätigung"),
  // dokTitle kann zusätzliche Details enthalten, ist aber nicht immer
  // hübsch formatiert (teils nur ein interner Referenzcode) – deshalb als
  // Haupttitel bevorzugt dokTitleText verwenden.
  function docDisplayTitle(d) {
    return d.dokTitleText || d.dokTitle || I18N.t("docs.fallback");
  }

  function docIcon(title) {
    const t = (title || "").toLowerCase();
    if (t.includes("flug")) return "plane";
    if (t.includes("hotel")) return "bed";
    if (t.includes("transfer")) return "bus";
    if (t.includes("mietwagen")) return "car";
    if (t.includes("versicher")) return "shield";
    if (t.includes("zahlung") || t.includes("rechnung")) return "receipt";
    return "document";
  }

  function fmtDokDateTime(s) {
    if (!s || s.length < 8) return "";
    const datePart = fmtDate(s.slice(0, 8));
    if (s.length >= 12) {
      const hh = s.slice(8, 10), mm = s.slice(10, 12);
      return `${datePart}, ${hh}:${mm}`;
    }
    return datePart;
  }

  function reisedokumenteList() {
    return state.data.ReiseDokumente || state.data.Reisedokumente || [];
  }

  function docCardHtml(d, iconSize) {
    return `
      <div class="offer-icon">${icon(docIcon(docDisplayTitle(d)), iconSize)}</div>
      <div style="flex:1;min-width:0;">
        <div class="doc-title">${escapeHtml(docDisplayTitle(d))}</div>
        <div class="doc-sub">${I18N.t("docs.createdOn", { date: fmtDokDateTime(d.dokDateTime) })}</div>
        <div class="doc-status"></div>
      </div>`;
  }

  function renderDocs() {
    const docs = reisedokumenteList();
    const [first, ...restDocs] = docs;

    document.getElementById("view-docs").innerHTML = `
      <div>
        <div class="greeting-name" style="font-size:22px;">${I18N.t("docs.title")}</div>
        <div class="hero-sub">${I18N.tCount("docs.count", docs.length)}</div>
      </div>

      ${first ? `
      <div class="doc-featured" data-dok-id="${escapeHtml(first.dokID || "")}">
        ${docCardHtml(first, 20)}
      </div>` : ""}

      <div class="doc-list">
        ${restDocs.map((d) => `
          <div class="doc-row" data-dok-id="${escapeHtml(d.dokID || "")}">
            ${docCardHtml(d, 18)}
            <span class="doc-chevron">${icon("chevronRight", 16)}</span>
          </div>`).join("")}
      </div>
    `;

    document.querySelectorAll("[data-dok-id]").forEach((el) => {
      if (!el.dataset.dokId) return;
      el.addEventListener("click", () => openDokument(el.dataset.dokId, el));
    });
  }

  // ---------- Dokument abrufen (GetDokument) ----------

  function setDocStatus(rowEl, text) {
    const el = rowEl.querySelector(".doc-status");
    if (el) el.textContent = text || "";
  }

  function base64ToBlob(base64, mime) {
    const byteChars = atob(base64);
    const bytes = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
    return new Blob([bytes], { type: mime || "application/octet-stream" });
  }

  async function openDokument(documentID, rowEl) {
    setDocStatus(rowEl, I18N.t("docs.loading"));
    try {
      const res = await fetch(`/api/dokument?travelID=${encodeURIComponent(state.travelID)}&documentID=${encodeURIComponent(documentID)}`);
      const json = await res.json();

      if (json.error) {
        setDocStatus(rowEl, json.error);
        return;
      }

      const d = json.data || {};
      // GetDokument liefert { document: "<Base64-PDF>", id, title }.
      const base64 = d.document || d.dokument || d.content || d.data || d.file || d.base64;

      if (base64) {
        const blobUrl = URL.createObjectURL(base64ToBlob(base64, "application/pdf"));
        window.open(blobUrl, "_blank", "noopener");
        setDocStatus(rowEl, "");
      } else {
        console.warn("Unbekanntes GetDokument-Antwortformat:", d);
        setDocStatus(rowEl, I18N.t("docs.unknownFormat"));
      }
    } catch (err) {
      setDocStatus(rowEl, I18N.t("docs.loadError"));
    }
  }

  // ---------- View: Mein Reisebüro ----------
  //
  // Kommt über GetOffice (server.js /api/office), unabhängig von den
  // eigentlichen Reisedaten – state.officeData kann daher null sein (z.B.
  // wenn der Aufruf am Netzwerk gescheitert ist), das wird hier abgefangen.

  // Day1..Day7 werden als Mo…So angenommen (passt zu den Beispieldaten:
  // Day2 komplett leer = Ruhetag Dienstag, Day6 kürzere Zeiten = Samstag,
  // Day7 leer = Sonntag geschlossen). Jeweils bis zu zwei Zeitfenster
  // (…From1/To1, …From2/To2, z.B. für eine Mittagspause). Die Wochentags-
  // Bezeichnung kommt sprachabhängig aus i18n.js (office.dow1..dow7).
  function officeOpeningHours(myOffice) {
    const rows = [];
    for (let i = 1; i <= 7; i++) {
      const from1 = myOffice[`Day${i}From1`], to1 = myOffice[`Day${i}To1`];
      const from2 = myOffice[`Day${i}From2`], to2 = myOffice[`Day${i}To2`];
      const ranges = [];
      if (from1 && to1) ranges.push(`${from1}–${to1}`);
      if (from2 && to2) ranges.push(`${from2}–${to2}`);
      rows.push({ label: I18N.t(`office.dow${i}`), hours: ranges.join(", ") || I18N.t("office.closed") });
    }
    return rows;
  }

  // WhatsApp-Kontakt (siehe TODO.md Punkt 3) – bewusst die einfachste
  // Variante: ein wa.me-Link mit vorbefüllter Nachricht statt eines eigenen
  // Kontaktformulars mit serverseitigem Mailversand (kein SMTP/E-Mail-API-
  // Zugang nötig, funktioniert sofort). Für den allgemeinen Büro-Kontakt
  // liefert GetOffice inzwischen ein eigenes Feld MyOffice.whatsapp (ein
  // fertiger wa.me-Link) – wenn vorhanden, gilt WhatsApp als nutzbar (siehe
  // whatsappUrlFromLink()/renderOffice()). Für die Berater (MyBerater[])
  // gibt es kein eigenes whatsapp-Feld, dort wird weiterhin die normale
  // Telefonnummer (phone) verwendet.
  function normalizeWhatsAppNumber(phone) {
    if (!phone) return "";
    let digits = String(phone).replace(/[^\d+]/g, "");
    if (digits.startsWith("+")) digits = digits.slice(1);
    else if (digits.startsWith("00")) digits = digits.slice(2);
    else if (digits.startsWith("0")) digits = `49${digits.slice(1)}`; // deutsche Vorwahl 0 -> Landesvorwahl 49
    return digits;
  }

  function whatsappUrl(phone, message) {
    const digits = normalizeWhatsAppNumber(phone);
    if (!digits) return "";
    return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
  }

  function appendUrlParam(url, key, value) {
    if (!url) return "";
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}${key}=${encodeURIComponent(value)}`;
  }

  // MyOffice.whatsapp liefert die Nummer teils fälschlich mit führender
  // "00"-Auslandsvorwahl-Kennung statt der reinen Landesvorwahl, z.B.
  // "https://wa.me/00491711775434" statt korrekt
  // "https://wa.me/491711775434". wa.me/api.whatsapp.com erwarten die
  // Nummer ausschließlich als Ziffernfolge aus Landesvorwahl+Rufnummer
  // (kein "00", kein "+") – sonst öffnet der Link WhatsApp mit einer
  // ungültigen Nummer. Diese Funktion bereinigt genau diesen Nummernteil,
  // egal ob als wa.me/<nummer> oder als ...?phone=<nummer>-Parameter.
  function fixWhatsAppLinkNumber(url) {
    if (!url) return url;
    try {
      const u = new URL(url);
      if (u.searchParams.has("phone")) {
        u.searchParams.set("phone", normalizeWhatsAppLinkDigits(u.searchParams.get("phone")));
        return u.toString();
      }
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts.length) {
        parts[parts.length - 1] = normalizeWhatsAppLinkDigits(parts[parts.length - 1]);
        u.pathname = "/" + parts.join("/");
        return u.toString();
      }
      return url;
    } catch (e) {
      return url;
    }
  }

  // Wie normalizeWhatsAppNumber(), aber ohne die "einzelne führende 0 ->
  // Landesvorwahl 49"-Umwandlung: Hier steckt die Landesvorwahl bereits im
  // Wert (z.B. "0049..."), eine einzelne "0" davor wäre nur ein weiterer
  // Formatfehler und keine deutsche Ortsvorwahl.
  function normalizeWhatsAppLinkDigits(value) {
    let digits = String(value || "").replace(/\D/g, "");
    if (digits.startsWith("00")) digits = digits.slice(2);
    return digits;
  }

  // MyOffice.whatsapp ist bereits ein fertiger wa.me-Link (kein reiner
  // Telefonnummer-String wie bei normalizeWhatsAppNumber) – offerLinkUrl()
  // übernimmt hier nur die schon vorhandene Markdown-Link-Erkennung
  // ("[text](url)", siehe z.B. facebook/instagramm/youtube), falls das
  // Feld irgendwann ebenso geliefert wird. fixWhatsAppLinkNumber() bereinigt
  // anschließend eine fälschlich vorangestellte "00"-Kennung im Nummernteil
  // (siehe oben). Die vorbefüllte Nachricht wird als text-Parameter
  // angehängt.
  function whatsappUrlFromLink(link, message) {
    const base = fixWhatsAppLinkNumber(offerLinkUrl(link));
    if (!base) return "";
    return message ? appendUrlParam(base, "text", message) : base;
  }

  // Vorbefüllte Nachricht mit Reisekontext, damit das Büro sofort weiß,
  // um welche Reise es geht, ohne dass der Gast das selbst tippen muss.
  function whatsappTravelMessage() {
    const grund = state.data.ReiseGrund || {};
    const title = grund.travelTitle ? ` "${grund.travelTitle}"` : "";
    const ref = grund.travelID || state.travelID || "";
    return ref
      ? I18N.t("office.whatsappMessage", { title, ref: I18N.t("office.travelRefLabel", { ref }) })
      : I18N.t("office.whatsappMessageNoRef", { title });
  }

  // Social-Media-Links im Bereich "Mein Reisebüro" – nur anzeigen, wenn
  // GetOffice das jeweilige Feld tatsächlich liefert (facebook/instagramm/
  // youtube/tiktok sind alle optional und meist leer, siehe Beispieldaten).
  // Die Felder kommen teils als Markdown-Link ("[text](url)", siehe
  // offerLinkUrl()), teils vermutlich später als reine URL – beides wird
  // abgedeckt. "instagramm" ist die tatsächliche (falsch geschriebene)
  // GetOffice-Feldbezeichnung, kein Tippfehler hier im Code.
  const OFFICE_SOCIAL_FIELDS = [
    { field: "facebook", icon: "facebook", label: "Facebook" },
    { field: "instagramm", icon: "instagram", label: "Instagram" },
    { field: "youtube", icon: "youtube", label: "YouTube" },
    { field: "tiktok", icon: "tiktok", label: "TikTok" }
  ];

  function officeSocialLinks(myOffice) {
    return OFFICE_SOCIAL_FIELDS
      .map((s) => ({ ...s, url: offerLinkUrl(myOffice[s.field]) }))
      .filter((s) => s.url);
  }

  function renderOffice() {
    const container = document.getElementById("view-office");
    const office = state.officeData;
    const myOffice = office && office.MyOffice;

    if (!myOffice) {
      container.innerHTML = `<div class="error-box">${I18N.t("office.loadError")}</div>`;
      return;
    }

    const berater = (office.MyBerater || []).slice().sort((a, b) => (a.sort || 0) - (b.sort || 0));
    const hours = officeOpeningHours(myOffice);

    const contactLinks = [];
    if (myOffice.phone) {
      contactLinks.push(`<a class="offer-link" href="tel:${escapeHtml(myOffice.phone.replace(/\s+/g, ""))}">${icon("phone", 13)} ${escapeHtml(myOffice.phone)}</a>`);
    }
    if (myOffice.mail) {
      contactLinks.push(`<a class="offer-link" href="mailto:${escapeHtml(myOffice.mail)}">${icon("mail", 13)} ${escapeHtml(myOffice.mail)}</a>`);
    }
    const wwwUrl = offerLinkUrl(myOffice.www);
    if (wwwUrl) {
      contactLinks.push(`<a class="offer-link" href="${escapeHtml(wwwUrl)}" target="_blank" rel="noopener noreferrer">${icon("globe", 13)} ${I18N.t("office.website")} ${icon("externalLink", 11)}</a>`);
    }

    // Priorität: 1) natives GetOffice-Feld MyOffice.whatsapp (fertiger
    // wa.me-Link – wenn geliefert, gilt WhatsApp laut Vorgabe als möglich),
    // 2) manuell konfigurierte WHATSAPP_OFFICE_NUMBER (.env, siehe
    // server.js) als Fallback, falls das Feld (noch) nicht geliefert wird.
    // Kein Rückgriff mehr auf MyOffice.phone (Festnetz, nicht zuverlässig
    // WhatsApp-fähig) – dann bleibt der Button einfach weg.
    const officeWhatsapp = whatsappUrlFromLink(myOffice.whatsapp, whatsappTravelMessage())
      || whatsappUrl(state.officeWhatsapp, whatsappTravelMessage());

    const socialLinks = officeSocialLinks(myOffice);

    container.innerHTML = `
      <div>
        <div class="greeting-name" style="font-size:22px;">${escapeHtml(myOffice.titleOffice || I18N.t("office.fallback"))}</div>
        <div class="hero-sub">${escapeHtml(myOffice.name || "")}</div>
      </div>

      ${officeWhatsapp ? `
      <a class="btn-primary" href="${escapeHtml(officeWhatsapp)}" target="_blank" rel="noopener noreferrer">
        ${icon("messageCircle", 18)} ${I18N.t("office.contactWhatsapp")}
      </a>` : ""}

      <div class="offer-card">
        <div class="offer-icon">${icon("building", 22)}</div>
        <div style="flex:1;min-width:0;">
          ${myOffice.adresse ? `<div class="hotel-description">${myOffice.adresse}</div>` : ""}
          ${contactLinks.length ? `<div class="office-contact-row">${contactLinks.join("")}</div>` : ""}
          ${socialLinks.length ? `
          <div class="office-social-row">
            ${socialLinks.map((s) => `<a class="office-social-link" href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(s.label)}">${icon(s.icon, 16)}</a>`).join("")}
          </div>` : ""}
        </div>
      </div>

      ${hours.length ? `
      <div class="day-suggestions">
        <div class="day-suggestions-title">${I18N.t("office.openingHours")}</div>
        <div class="office-hours">
          ${hours.map((h) => `
            <div class="office-hours-row">
              <span>${h.label}</span>
              <span>${h.hours}</span>
            </div>`).join("")}
        </div>
        ${myOffice.openingadd ? `<div class="hero-sub">${escapeHtml(myOffice.openingadd)}</div>` : ""}
      </div>` : ""}

      ${myOffice.teampic ? `<div class="hotel-gallery-hero"><img src="${escapeHtml(myOffice.teampic)}" alt="" loading="lazy" onerror="this.closest('.hotel-gallery-hero').remove();"></div>` : ""}

      ${myOffice.teamtext ? `<div class="hotel-description">${myOffice.teamtext}</div>` : ""}

      ${berater.length ? `
      <div class="day-suggestions">
        <div class="day-suggestions-title">${I18N.t("office.team")}</div>
        <div class="office-team-grid">
          ${berater.map((b) => `
            <div class="office-team-card">
              ${b.image ? `<img class="office-team-photo" src="${escapeHtml(b.image)}" alt="" loading="lazy" onerror="this.remove()">` : ""}
              <div class="office-team-name">${escapeHtml(b.name || "")}</div>
              ${b.function ? `<div class="office-team-function">${escapeHtml(b.function)}</div>` : ""}
              <div class="office-team-contact">
                ${b.phone ? `<a href="tel:${escapeHtml(b.phone.replace(/\s+/g, ""))}">${icon("phone", 12)}<span>${escapeHtml(b.phone)}</span></a>` : ""}
                ${b.mail ? `<a href="mailto:${escapeHtml(b.mail)}">${icon("mail", 12)}<span>${escapeHtml(b.mail)}</span></a>` : ""}
                ${whatsappUrl(b.phone, whatsappTravelMessage()) ? `<a href="${escapeHtml(whatsappUrl(b.phone, whatsappTravelMessage()))}" target="_blank" rel="noopener noreferrer">${icon("messageCircle", 12)}<span>${I18N.t("office.whatsapp")}</span></a>` : ""}
              </div>
            </div>`).join("")}
        </div>
      </div>` : ""}
    `;
  }

  // ---------- View: Reisepreis ----------
  //
  // ReiseLeistung enthält pro Buchungsposition (Hauptreise + einzeln
  // gebuchte Zusatzleistungen wie Parkplatz/Mietwagen) die Preis- und
  // Zahlungsinformationen – unabhängig vom Reiseplan (ReiseVerlauf), das
  // ist eine eigene, flache Liste ohne Bezug zu type/sortDate. price/
  // RePreis kommen wie travelPrice als Ganzzahl in Eurocent (siehe
  // fmtPriceFromCents). RePreis "0" bedeutet: der Betrag ist direkt beim
  // Veranstalter fällig, nicht über das Reisebüro (siehe
  // leistungPaymentNote()) – das entscheidet auch die Summenbildung unten.

  // "BU" ist neben "BE" ein weiterer in der Praxis vorkommender Status-Code
  // für "Bestätigt" (gleiche Bedeutung) – daher auf denselben i18n-Key bzw.
  // dieselbe Badge-Farbe wie "BE" abgebildet, statt einen eigenen
  // (übersetzten) Text/eine eigene Farbe dafür zu pflegen.
  const LEISTUNG_STATUS_LABEL_KEYS = {
    OF: "price.statusOF", BE: "price.statusBE", BU: "price.statusBE", OP: "price.statusOP", ST: "price.statusST"
  };
  const LEISTUNG_STATUS_BADGE_CLASS = { OF: "OF", BE: "BE", BU: "BE", OP: "OP", ST: "ST" };

  function leistungStatusLabel(status) {
    const key = LEISTUNG_STATUS_LABEL_KEYS[status];
    return key ? I18N.t(key) : (status || "");
  }

  function leistungStatusBadgeClass(status) {
    return LEISTUNG_STATUS_BADGE_CLASS[status] || status || "";
  }

  function reiseLeistungList() {
    return (state.data.ReiseLeistung || []).filter((item) => item && (item.text || item.bookingNo));
  }

  // Buchungsnummer bis auf die letzten 4 Stellen maskieren
  // (z.B. "0000029192" -> "*******9192").
  function maskBookingNo(bookingNo) {
    const s = String(bookingNo || "");
    if (s.length <= 4) return s;
    return "*".repeat(s.length - 4) + s.slice(-4);
  }

  function leistungPaymentNote(item, currency) {
    if (Number(item.RePreis)) {
      return I18N.t("price.payToAgency", { amount: fmtPriceFromCents(item.RePreis, currency) });
    }
    return I18N.t("price.payDirectToOperator", {
      operator: item.touroperatorName ? ` (${escapeHtml(item.touroperatorName)})` : ""
    });
  }

  function renderPrice() {
    const currency = (state.data.ReiseGrund || {}).travelCurrency;
    const items = reiseLeistungList();

    // Summen: Gesamtpreis über alle Positionen, aufgeteilt danach, ob der
    // Betrag ans Reisebüro geht (RePreis != 0, dann zählt RePreis) oder
    // direkt an den Veranstalter (RePreis == 0, dann zählt der volle price).
    const total = items.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
    const toOffice = items.reduce((sum, i) => sum + (Number(i.RePreis) ? Number(i.RePreis) : 0), 0);
    const toOperator = items.reduce((sum, i) => sum + (Number(i.RePreis) ? 0 : (Number(i.price) || 0)), 0);

    document.getElementById("view-price").innerHTML = `
      <div>
        <div class="greeting-name" style="font-size:22px;">${I18N.t("price.title")}</div>
        <div class="hero-sub">${I18N.tCount("price.item", items.length)}</div>
      </div>

      ${items.length ? `
      <div class="price-list">
        ${items.map((item) => `
          <div class="price-row">
            <div class="price-row-top">
              <div>
                <div class="price-row-operator">${escapeHtml(item.touroperatorName || "")}</div>
                <div class="price-row-text">${escapeHtml(item.text || "")}</div>
              </div>
              <div class="price-status-badge price-status-${escapeHtml(leistungStatusBadgeClass(item.status))}">${escapeHtml(leistungStatusLabel(item.status))}</div>
            </div>
            <div class="price-row-meta">${escapeHtml(maskBookingNo(item.bookingNo))} · ${[fmtDate(item.startDate), fmtDate(item.endEnd)].filter(Boolean).join(" – ")}</div>
            <div class="price-row-bottom">
              <div class="price-row-note">${leistungPaymentNote(item, currency)}</div>
              <div class="price-row-amount">${fmtPriceFromCents(item.price, currency)}</div>
            </div>
          </div>`).join("")}
      </div>

      <div class="price-summary">
        <div class="price-summary-title">${I18N.t("price.summary")}</div>
        <div class="price-summary-row">
          <span>${I18N.t("price.totalToAgency")}</span>
          <span>${fmtPriceFromCents(toOffice, currency)}</span>
        </div>
        <div class="price-summary-row">
          <span>${I18N.t("price.totalToOperator")}</span>
          <span>${fmtPriceFromCents(toOperator, currency)}</span>
        </div>
        <div class="price-summary-row is-total">
          <span>${I18N.t("price.total")}</span>
          <span>${fmtPriceFromCents(total, currency)}</span>
        </div>
      </div>` : `<div class="error-box">${I18N.t("price.noData")}</div>`}
    `;
  }

  // ---------- View: "Nächste Reise" ----------
  //
  // Eigene Unterseite (view-nexttrip), nur per Einsprung von der Startseite
  // erreichbar (renderNextTripEntry(), nur wenn die aktuelle Reise beendet
  // ist), kein eigener Bottom-Nav-Eintrag – analog zu Hotel-/Kreuzfahrt-
  // Details. Sammelt Reisewünsche für ein Folgeangebot und schickt sie an
  // /api/naechste-reise (siehe server.js handleNextTripRequest – pusht,
  // sofern konfiguriert, ans MidOffice-CGI, sonst Log-Fallback ohne
  // Fehleranzeige für den Nutzer).
  //
  // Bewusst ein einzelnes, durchgehendes Formular statt eines mehrstufigen
  // Assistenten: passt zum Rest der App (jede Ansicht wird als Ganzes
  // gerendert), ist robuster (keine verlorenen Eingaben beim Zurückgehen)
  // und kommt ohne zusätzlichen Navigations-/Validierungs-Code pro Schritt
  // aus.

  function renderNextTrip() {
    const container = document.getElementById("view-nexttrip");
    const grund = state.data.ReiseGrund || {};
    const voucher = nextTripVoucherAmount();
    const voucherAmountF = voucher ? fmtPriceFromCents(voucher, grund.travelCurrency) : "";
    const nt = state.nextTrip;

    if (nt.submitted) {
      container.innerHTML = `
        <div class="next-trip-page">
          <div class="next-trip-success">
            ${icon("checkCircle", 34)}
            <div class="greeting-name" style="font-size:18px;">${I18N.t("nexttrip.successTitle")}</div>
            <p>${I18N.t("nexttrip.successText")}</p>
            ${voucher ? `<p class="next-trip-voucher-note">${icon("gift", 15)} ${I18N.t("nexttrip.successVoucherNote", { amount: escapeHtml(voucherAmountF) })}</p>` : ""}
            <button type="button" class="btn-primary" data-back="overview">${I18N.t("nexttrip.backToOverview")}</button>
          </div>
        </div>
      `;
      container.querySelectorAll("[data-back]").forEach((btn) => {
        btn.addEventListener("click", () => showView(btn.dataset.back));
      });
      return;
    }

    const destination = escapeHtml(grund.travelRegionText || grund.travelTitle || "");

    container.innerHTML = `
      <button class="back-link" data-back="overview">${icon("chevronLeft", 16)} ${I18N.t("nexttrip.back")}</button>

      <div class="next-trip-page">
        <div>
          <div class="greeting-name" style="font-size:20px;">${I18N.t("nexttrip.title")}</div>
          <p class="next-trip-intro">${I18N.t("nexttrip.intro")}</p>
        </div>

        ${voucher ? `<div class="next-trip-voucher-note">${icon("gift", 15)} ${I18N.t("nexttrip.voucherNote", { amount: escapeHtml(voucherAmountF) })}</div>` : ""}

        <form id="nextTripForm" class="next-trip-form" novalidate>

          <div class="form-section">
            <label class="form-label">${I18N.t("nexttrip.periodLabel")}</label>
            <div class="form-radio-row">
              <label><input type="radio" name="periodType" value="exact" checked> ${I18N.t("nexttrip.periodExact")}</label>
              <label><input type="radio" name="periodType" value="flexible"> ${I18N.t("nexttrip.periodFlexible")}</label>
            </div>
            <div id="periodExactFields" class="form-row-2">
              <div>
                <label class="form-label-sm" for="ntPeriodFrom">${I18N.t("nexttrip.periodFrom")}</label>
                <input type="date" id="ntPeriodFrom" name="periodFrom">
              </div>
              <div>
                <label class="form-label-sm" for="ntPeriodTo">${I18N.t("nexttrip.periodTo")}</label>
                <input type="date" id="ntPeriodTo" name="periodTo">
              </div>
            </div>
            <div id="periodFlexibleFields" hidden>
              <input type="text" id="ntPeriodFlexible" name="periodFlexible" placeholder="${I18N.t("nexttrip.periodFlexibleHint")}">
            </div>
          </div>

          <div class="form-section">
            <label class="form-label">${I18N.t("nexttrip.destinationLabel")}</label>
            ${destination ? `
            <label class="form-check">
              <input type="checkbox" id="ntDestinationSame" name="destinationSame">
              ${I18N.t("nexttrip.destinationSame", { destination })}
            </label>` : ""}
            <input type="text" id="ntDestinationOther" name="destinationOther" placeholder="${I18N.t("nexttrip.destinationOtherHint")}">
          </div>

          <div class="form-section">
            <label class="form-label" for="ntBudget">${I18N.t("nexttrip.budgetLabel")}</label>
            <input type="number" id="ntBudget" name="budget" min="0" step="50" inputmode="numeric" placeholder="${I18N.t("nexttrip.budgetHint")}">
          </div>

          <div class="form-section">
            <label class="form-label">${I18N.t("nexttrip.travelersLabel")}</label>
            <div class="form-row-2">
              <div>
                <label class="form-label-sm" for="ntAdults">${I18N.t("nexttrip.adultsLabel")}</label>
                <input type="number" id="ntAdults" name="adults" min="1" max="20" value="2" inputmode="numeric">
              </div>
              <div>
                <label class="form-label-sm" for="ntChildren">${I18N.t("nexttrip.childrenLabel")}</label>
                <input type="number" id="ntChildren" name="children" min="0" max="20" value="0" inputmode="numeric">
              </div>
            </div>
          </div>

          <div class="form-section">
            <label class="form-label">${I18N.t("nexttrip.prioritiesLabel")}</label>
            <div class="form-check-grid">
              <label class="form-check"><input type="checkbox" name="priorities" value="beach"> ${I18N.t("nexttrip.priorityBeach")}</label>
              <label class="form-check"><input type="checkbox" name="priorities" value="sun"> ${I18N.t("nexttrip.prioritySun")}</label>
              <label class="form-check"><input type="checkbox" name="priorities" value="mountains"> ${I18N.t("nexttrip.priorityMountains")}</label>
              <label class="form-check"><input type="checkbox" name="priorities" value="sea"> ${I18N.t("nexttrip.prioritySea")}</label>
              <label class="form-check"><input type="checkbox" name="priorities" value="culture"> ${I18N.t("nexttrip.priorityCulture")}</label>
              <label class="form-check"><input type="checkbox" name="priorities" value="relax"> ${I18N.t("nexttrip.priorityRelax")}</label>
              <label class="form-check"><input type="checkbox" name="priorities" value="active"> ${I18N.t("nexttrip.priorityActive")}</label>
              <label class="form-check"><input type="checkbox" name="priorities" value="allInclusive"> ${I18N.t("nexttrip.priorityAllInclusive")}</label>
            </div>
            <input type="text" id="ntPriorityOther" name="priorityOther" placeholder="${I18N.t("nexttrip.priorityOtherHint")}">
          </div>

          <div class="form-section">
            <label class="form-label" for="ntEmail">${I18N.t("nexttrip.emailLabel")}</label>
            <input type="email" id="ntEmail" name="email" required placeholder="${I18N.t("nexttrip.emailHint")}">
          </div>

          <div class="form-section">
            <label class="form-check">
              <input type="checkbox" id="ntConsent" name="consent" required>
              ${I18N.t("nexttrip.consentLabel")}
            </label>
          </div>

          <div id="nextTripFormError" class="error-box" ${nt.error ? "" : "hidden"}>${nt.error ? escapeHtml(nt.error) : ""}</div>

          <button type="submit" class="btn-primary" id="nextTripSubmitBtn" ${nt.submitting ? "disabled" : ""}>
            ${nt.submitting ? I18N.t("nexttrip.submitting") : I18N.t("nexttrip.submit")}
          </button>
        </form>
      </div>
    `;

    container.querySelectorAll("[data-back]").forEach((btn) => {
      btn.addEventListener("click", () => showView(btn.dataset.back));
    });

    // Umschalten zwischen genauem und ungefährem Zeitraum – reines DOM-
    // Toggle statt Re-Render, damit bereits eingegebene Werte in den
    // anderen Feldern erhalten bleiben (gleiches Prinzip wie beim Alarm-
    // Banner in renderOverview()).
    const exactFields = container.querySelector("#periodExactFields");
    const flexibleFields = container.querySelector("#periodFlexibleFields");
    container.querySelectorAll('input[name="periodType"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        const isFlexible = container.querySelector('input[name="periodType"]:checked').value === "flexible";
        exactFields.hidden = isFlexible;
        flexibleFields.hidden = !isFlexible;
      });
    });

    container.querySelector("#nextTripForm").addEventListener("submit", (event) => {
      event.preventDefault();
      submitNextTripForm(container);
    });
  }

  async function submitNextTripForm(container) {
    const grund = state.data.ReiseGrund || {};
    const emailInput = container.querySelector("#ntEmail");
    const consentInput = container.querySelector("#ntConsent");
    const errorBox = container.querySelector("#nextTripFormError");
    const submitBtn = container.querySelector("#nextTripSubmitBtn");

    const email = emailInput.value.trim();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Client-seitige Validierung nur für die beiden Pflichtfelder (E-Mail +
    // Einverständnis) – server.js validiert dieselben zwei Felder zusätzlich
    // serverseitig (siehe handleNextTripRequest), alle anderen Angaben sind
    // freiwillig.
    if (!emailValid) {
      errorBox.textContent = I18N.t("nexttrip.emailRequired");
      errorBox.hidden = false;
      emailInput.focus();
      return;
    }
    if (!consentInput.checked) {
      errorBox.textContent = I18N.t("nexttrip.consentRequired");
      errorBox.hidden = false;
      consentInput.focus();
      return;
    }

    errorBox.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = I18N.t("nexttrip.submitting");

    const periodType = container.querySelector('input[name="periodType"]:checked').value;
    const priorities = Array.from(container.querySelectorAll('input[name="priorities"]:checked')).map((el) => el.value);

    const payload = {
      travelID: state.travelID || "",
      periodType,
      periodFrom: container.querySelector("#ntPeriodFrom").value,
      periodTo: container.querySelector("#ntPeriodTo").value,
      periodFlexible: container.querySelector("#ntPeriodFlexible").value.trim(),
      destinationSame: (container.querySelector("#ntDestinationSame") || {}).checked === true,
      destinationOther: container.querySelector("#ntDestinationOther").value.trim(),
      budget: container.querySelector("#ntBudget").value,
      budgetCurrency: grund.travelCurrency || "EUR",
      adults: container.querySelector("#ntAdults").value,
      children: container.querySelector("#ntChildren").value,
      priorities,
      priorityOther: container.querySelector("#ntPriorityOther").value.trim(),
      email,
      consent: true
    };

    try {
      const response = await fetch("/api/naechste-reise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.ok) {
        throw new Error(json.error || `Status ${response.status}`);
      }
      state.nextTrip = { submitting: false, submitted: true, error: null };
      renderNextTrip();
      document.getElementById("views").scrollTop = 0;
    } catch (err) {
      console.error("[NächsteReise] Absenden fehlgeschlagen:", err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = I18N.t("nexttrip.submit");
      errorBox.textContent = I18N.t("nexttrip.errorGeneric");
      errorBox.hidden = false;
    }
  }

  // ---------- Navigation ----------

  function renderAll() {
    renderOverview();
    renderPlan();
    renderOffers();
    renderDocs();
    renderOffice();
    renderPrice();
    renderNextTrip();
    showView(state.activeView);

    document.querySelectorAll("[data-goto]").forEach((el) => {
      el.addEventListener("click", () => showView(el.dataset.goto));
    });
  }

  function showView(name) {
    state.activeView = name;
    document.querySelectorAll(".view").forEach((el) => {
      el.hidden = el.dataset.view !== name;
    });
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.nav === name);
    });
    document.getElementById("views").scrollTop = 0;
  }

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => showView(btn.dataset.nav));
  });

  window.addEventListener("hashchange", loadReiseData);

  // beforeinstallprompt kommt asynchron vom Browser (Android/Chrome & Co.),
  // meist erst nachdem die Overview schon gerendert wurde – daher hier nur
  // das Event merken und gezielt den Install-Banner-Platzhalter aktualisieren
  // (renderInstallBanner()), statt die ganze Overview neu zu rendern.
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    renderInstallBanner();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    dismissInstallBanner();
  });

  // Service Worker nur fürs Installierbarkeits-Kriterium auf Android/Chrome
  // (siehe sw.js) – ohne Service Worker kein "Zum Home-Bildschirm
  // hinzufügen" mit echtem Install-Prompt, sondern höchstens ein normales
  // Browser-Lesezeichen.
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {
        // Kein harter Fehler nötig – ohne Service Worker gibt es unter
        // iOS/Safari ohnehin nur die manuelle Anleitung (kein
        // beforeinstallprompt), und unter Android bliebe es dann bei einem
        // normalen Lesezeichen statt einer echten Installation.
      });
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  // ---------- Sprachumschaltung ----------
  //
  // #langSelect (siehe index.html, immer sichtbar oben in der App) wird hier
  // mit den unterstützten Sprachen befüllt (Anzeigename jeweils in der
  // Sprache selbst, z.B. "Ελληνικά" – siehe I18N.LANG_NAMES). Ein Wechsel
  // übersetzt sofort: die statischen [data-i18n]-Elemente neu (siehe
  // applyStaticTranslations()) sowie alle bereits geladenen Ansichten per
  // renderAll() (nur wenn schon Reisedaten vorliegen – ohne state.data gibt
  // es außer der Fehleransicht noch nichts Eigenes neu zu rendern).
  function initLangSwitcher() {
    const select = document.getElementById("langSelect");
    if (!select) return;
    select.innerHTML = I18N.SUPPORTED_LANGS
      .map((lang) => `<option value="${lang}">${escapeHtml(I18N.LANG_NAMES[lang])}</option>`)
      .join("");
    select.value = I18N.getLang();
    select.addEventListener("change", () => {
      I18N.setLang(select.value);
      I18N.applyStaticTranslations();
      if (state.data) renderAll();
    });
  }

  I18N.applyStaticTranslations();
  initLangSwitcher();
  loadReiseData();
})();
