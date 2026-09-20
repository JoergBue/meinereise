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
    externalLink: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/>'
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

  const DOW = ["SO", "MO", "DI", "MI", "DO", "FR", "SA"];
  const pad2 = (n) => String(n).padStart(2, "0");

  function fmtDate(s) {
    const d = parseYYYYMMDD(s);
    if (!d) return "";
    return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
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
    activeView: "overview",
    activeDay: null,
    activeOfferFilter: "all"
  };

  function getTravelIDFromURL() {
    // Aufruf-Format: https://.../#291922  (Hash-Fragment, wird nicht an den Server gesendet)
    const hash = window.location.hash.replace(/^#/, "").trim();
    if (hash) return hash;
    // Fallback, falls die App doch mal mit ?travelID=... aufgerufen wird
    const params = new URLSearchParams(window.location.search);
    return params.get("travelID") || "";
  }

  // ---------- Laden ----------

  async function loadReiseData() {
    state.travelID = getTravelIDFromURL();

    if (!state.travelID) {
      renderFatalError("Keine travelID übergeben. Aufruf-Format: <code>" + window.location.origin + window.location.pathname + "#&lt;travelID&gt;</code>");
      return;
    }

    try {
      const res = await fetch(`/api/reisedaten?travelID=${encodeURIComponent(state.travelID)}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || `Serverfehler (${res.status})`);
      }

      state.data = json.data;
      state.source = json.source;
      applyBrandColor(state.data.brandColor);

      const banner = document.getElementById("demoBanner");
      if (json.source === "demo") {
        banner.hidden = false;
        banner.title = json.hinweis || "";
      } else {
        banner.hidden = true;
      }

      renderAll();
    } catch (err) {
      renderFatalError("Reisedaten konnten nicht geladen werden: " + err.message);
    }
  }

  function renderFatalError(html) {
    document.getElementById("view-overview").innerHTML = `<div class="error-box">${html}</div>`;
  }

  // ---------- Ableitungen aus ReiseVerlauf ----------

  const VERLAUF_META = {
    F: { icon: "plane", label: "Flug" },
    H: { icon: "bed", label: "Hotel" },
    T: { icon: "bus", label: "Transfer" },
    M: { icon: "car", label: "Mietwagen" },
    C: { icon: "boat", label: "Kreuzfahrt" },
    V: { icon: "shield", label: "Versicherung" },
    S: { icon: "mountain", label: "Sonstiges" }
  };

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
      if (meta) chips.push(meta);
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

  function verlaufForDay(dayKeyStr) {
    return verlaufList().filter((item) => (item.sortDate || "").startsWith(dayKeyStr));
  }

  // ---------- View: Übersicht ----------

  function renderOverview() {
    const grund = state.data.ReiseGrund || {};
    const checkin = parseYYYYMMDD(grund.checkinDate);
    const checkout = parseYYYYMMDD(grund.checkoutDate);
    const today = new Date();

    let countdown = "";
    if (checkin) {
      const diff = daysBetween(today, checkin);
      if (diff > 0) countdown = `Noch ${diff} ${diff === 1 ? "Tag" : "Tage"}`;
      else if (checkout && daysBetween(today, checkout) >= 0) countdown = "Reise läuft";
      else countdown = "Reise beendet";
    }

    const nights = checkin && checkout ? daysBetween(checkin, checkout) : null;
    const chips = bookedStatusChips();
    const office = officeInfo();
    const price = fmtPriceFromCents(grund.travelPrice, grund.travelCurrency);
    const heroImg = validGrafikUrl(grund.travelPic);

    const offers = zusatzLeistungList().filter((o) => o.type !== "G007" && (o.headline || o.text)).slice(0, 2);

    document.getElementById("view-overview").innerHTML = `
      <div class="greeting-row">
        <div>
          <div class="greeting-eyebrow">Willkommen zurück</div>
          <div class="greeting-name">Deine Reise</div>
        </div>
        <div class="avatar">${icon("bell", 19)}</div>
      </div>

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
            <div class="hero-sub">${fmtDate(grund.checkinDate)} – ${fmtDate(grund.checkoutDate)}${nights != null ? ` · ${nights} Nächte` : ""}</div>
          </div>
          <div class="hero-meta">
            ${grund.travelers ? `<div class="hero-meta-item">${icon("users", 16)} ${escapeHtml(grund.travelers)} Personen</div>` : ""}
            ${nights != null ? `<div class="hero-meta-item">${icon("calendar", 16)} ${nights} Nächte</div>` : ""}
            ${price ? `<div class="hero-meta-item">${icon("receipt", 16)} ${escapeHtml(price)}</div>` : ""}
          </div>
        </div>
      </div>

      ${office ? `<div class="agency-info">Vermittelt durch <strong>${escapeHtml(office.name)}</strong>, ${escapeHtml(office.address)}</div>` : ""}

      ${chips.length ? `
      <div class="status-row">
        ${chips.map((c) => `<div class="status-chip">${icon("checkCircle", 14)} ${c.label}</div>`).join("")}
      </div>` : ""}

      <button class="btn-primary" data-goto="plan">
        Reiseplan ansehen ${icon("arrowRight", 16)}
      </button>

      ${offers.length ? `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="section-head">
          <div class="section-title">Für dich empfohlen</div>
          <button class="section-link" data-goto="offers">Alle ansehen</button>
        </div>
        <div class="mini-cards">
          ${offers.map((o) => `
            <div class="mini-card">
              <div class="mini-card-icon">${icon(offerIcon(o), 16)}</div>
              <div class="mini-card-title">${escapeHtml(o.headline || "")}</div>
            </div>`).join("")}
        </div>
      </div>` : ""}
    `;
  }

  // ---------- View: Reiseplan ----------

  function renderPlan() {
    const days = tripDayList();
    if (!state.activeDay && days.length) state.activeDay = days[0].key;

    const activeItems = state.activeDay ? verlaufForDay(state.activeDay) : [];

    document.getElementById("view-plan").innerHTML = `
      <div>
        <div class="greeting-name" style="font-size:22px;">Reiseplan</div>
        <div class="hero-sub">${escapeHtml((state.data.ReiseGrund || {}).travelRegionText || "")}</div>
      </div>

      <div class="day-tabs">
        ${days.map((d) => `
          <button class="day-tab ${d.key === state.activeDay ? "is-active" : ""}" data-day="${d.key}">
            <span class="dow">${DOW[d.date.getDay()]}</span>
            <span class="num">${d.date.getDate()}</span>
          </button>`).join("")}
      </div>

      <div class="timeline">
        ${activeItems.length ? activeItems.map((item, i) => renderTimelineRow(item, i === activeItems.length - 1)).join("")
          : `<div class="timeline-empty">Für diesen Tag sind keine Programmpunkte hinterlegt.</div>`}
      </div>
    `;

    document.querySelectorAll(".day-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeDay = btn.dataset.day;
        renderPlan();
      });
    });

    document.querySelectorAll("[data-verlauf-idx]").forEach((el) => {
      el.addEventListener("click", () => {
        const item = verlaufList()[Number(el.dataset.verlaufIdx)];
        if (item) openHotelDetail(item);
      });
    });
  }

  function renderTimelineRow(item, isLast) {
    const meta = VERLAUF_META[item.type] || { icon: "mountain", label: item.type };
    let title = meta.label;
    let sub = "";
    let time = "";
    let highlight = false;

    if (item.type === "F") {
      title = `${item.flightType === "R" ? "Rückflug" : "Hinflug"} ${escapeHtml(item.flightCarrier || "")} ${escapeHtml(item.flightNumber || "")}`.trim();
      sub = `${escapeHtml(item.departureAirportCodeTxt || item.departureAirportTxt || "")} (${escapeHtml(item.departureAirportCode || "")}) → ${escapeHtml(item.arrivalAirportCodeTxt || item.arrivalAirportTxt || "")} (${escapeHtml(item.arrivalAirportCode || "")})`;
      const dep = fmtTime(item.departureDateTime);
      const arr = fmtTime(item.arrivalDateTime);
      time = dep && arr ? `${dep} – ${arr}` : dep;
      highlight = true;
    } else if (item.type === "H") {
      title = `Check-in · ${escapeHtml(item.hotelName || "")}`;
      sub = [item.roomCategoryName, item.mealsCategoryName].filter(Boolean).map(escapeHtml).join(" · ");
      time = "";
    } else if (item.type === "T") {
      title = "Transfer";
      sub = escapeHtml(item.text || "");
      time = "";
    } else if (item.type === "M") {
      title = `Mietwagen · ${escapeHtml(item.carOperator || "")}`;
      sub = [item.pickupStation, item.returnStation].filter(Boolean).map(escapeHtml).join(" → ");
      time = fmtTime(item.pickupDateTime);
    } else if (item.type === "C") {
      title = `Kreuzfahrt · ${escapeHtml(item.cruiseShipName || "")}`;
      sub = escapeHtml(item.cruiseRoute || "");
    } else if (item.type === "V") {
      title = "Versicherung";
      // discription kann HTML enthalten (z.B. <br>, Links) und wird daher
      // bewusst nicht escaped, sondern wie bei den Zusatzleistungen als
      // Markup gerendert.
      sub = item.discription || "";
    } else {
      sub = item.discription || escapeHtml(item.text || "");
    }

    const isHotel = item.type === "H";
    const verlaufIdx = isHotel ? verlaufList().indexOf(item) : -1;

    return `
      <div class="timeline-row">
        <div class="timeline-rail">
          <div class="timeline-dot"></div>
          ${isLast ? "" : '<div class="timeline-line"></div>'}
        </div>
        <div class="timeline-body">
          ${time ? `<div class="timeline-time">${time}</div>` : ""}
          <div class="timeline-card ${highlight ? "is-highlight" : ""} ${isHotel ? "is-clickable" : ""}" ${isHotel ? `data-verlauf-idx="${verlaufIdx}"` : ""}>
            ${icon(meta.icon, 17)}
            <div>
              <div class="timeline-card-title">${title}</div>
              ${sub ? `<div class="timeline-card-sub">${sub}</div>` : ""}
            </div>
            ${isHotel ? `<span class="doc-chevron">${icon("chevronRight", 16)}</span>` : ""}
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

  function hotelPicUrls(pics) {
    // Die API liefert hotelPics als Array von Objekten ({picLink: "..."}),
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

  // Der Abruf jedes einzelnen Hotelbilds ist kostenpflichtig – daher werden
  // beim Öffnen der Seite maximal 3 Bilder geladen (1 Hero + 2 in der
  // Strip-Leiste). Weitere Bilder werden nur als Zähler-Kachel "+N weitere"
  // angezeigt und erst per Klick nachgeladen (kein <img src> vorher, damit
  // der Browser sie nicht automatisch abruft).
  const HOTEL_GALLERY_INITIAL_COUNT = 3;

  function renderHotelGallery(pics) {
    const visible = pics.slice(0, HOTEL_GALLERY_INITIAL_COUNT);
    const remaining = pics.slice(HOTEL_GALLERY_INITIAL_COUNT);
    const [heroPic, ...stripPics] = visible;
    return `
      <div class="hotel-gallery-hero">
        <img src="${escapeHtml(heroPic)}" alt="" loading="lazy" onerror="this.closest('.hotel-gallery-hero').remove();">
      </div>
      ${stripPics.length || remaining.length ? `
      <div class="hotel-gallery-strip">
        ${stripPics.map((src) => `<img src="${escapeHtml(src)}" alt="" loading="lazy" onerror="this.remove();">`).join("")}
        ${remaining.length ? `<button type="button" class="hotel-gallery-more" data-remaining-count="${remaining.length}">+${remaining.length}<span>weitere</span></button>` : ""}
      </div>` : ""}
    `;
  }

  function loadRemainingHotelPics(container, remaining) {
    const moreBtn = container.querySelector(".hotel-gallery-more");
    const stripEl = container.querySelector(".hotel-gallery-strip");
    if (!moreBtn || !stripEl) return;
    moreBtn.addEventListener("click", () => {
      remaining.forEach((src) => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "";
        img.loading = "lazy";
        img.addEventListener("error", () => img.remove());
        stripEl.insertBefore(img, moreBtn);
      });
      moreBtn.remove();
    });
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
      container.innerHTML = `<div class="error-box">Kein Hotel ausgewählt.</div>`;
      return;
    }

    const pics = hotelPicUrls(h.hotelPics);
    const mapEmbed = hotelMapEmbedUrl(h.locationLatitude, h.locationLongitude);
    const mapLink = hotelMapLinkUrl(h.locationLatitude, h.locationLongitude);
    const subline = [h.roomCategoryName, h.mealsCategoryName].filter(Boolean).map(escapeHtml).join(" · ");

    container.innerHTML = `
      <button class="back-link" data-back="plan">${icon("chevronLeft", 16)} Zurück zum Reiseplan</button>

      <div class="hotel-detail">
        ${pics.length ? renderHotelGallery(pics) : ""}

        <div>
          <div class="hotel-detail-header">
            <div class="greeting-name" style="font-size:20px;">${escapeHtml(h.hotelName || "Hotel")}</div>
            ${h.hotelStars ? `<div class="hotel-stars">${"★".repeat(Math.min(7, Math.max(0, parseInt(h.hotelStars, 10) || 0)))}</div>` : ""}
          </div>
          ${subline ? `<div class="hero-sub">${subline}</div>` : ""}
        </div>

        ${h.discription ? `<div class="hotel-description">${h.discription}</div>` : ""}

        ${mapEmbed ? `
        <div class="hotel-map">
          <iframe src="${escapeHtml(mapEmbed)}" loading="lazy" title="Lage des Hotels" referrerpolicy="no-referrer-when-downgrade"></iframe>
          <a class="offer-link" href="${escapeHtml(mapLink)}" target="_blank" rel="noopener noreferrer">In OpenStreetMap öffnen ${icon("externalLink", 13)}</a>
        </div>` : ""}
      </div>
    `;

    document.querySelectorAll("[data-back]").forEach((btn) => {
      btn.addEventListener("click", () => showView(btn.dataset.back));
    });

    if (pics.length > HOTEL_GALLERY_INITIAL_COUNT) {
      loadRemainingHotelPics(container, pics.slice(HOTEL_GALLERY_INITIAL_COUNT));
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
      { id: "all", label: "Alle" },
      { id: "mietwagen", label: "Mietwagen" },
      { id: "versicherung", label: "Versicherung" },
      { id: "ausfluege", label: "Ausflüge" },
      { id: "weitere", label: "Weitere" }
    ];

    const visible = offers.filter((o) => {
      if (state.activeOfferFilter === "all") return true;
      return offerFilter(o) === state.activeOfferFilter;
    });

    document.getElementById("view-offers").innerHTML = `
      <div>
        <div class="greeting-name" style="font-size:22px;">Zusatzleistungen</div>
        <div class="hero-sub">Mehr aus deiner Reise machen</div>
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
              <div class="offer-title">${escapeHtml(o.headline || "")}</div>
              ${o.text ? `<div class="offer-sub offer-html">${o.text}</div>` : ""}
              ${grafik ? `<img class="offer-img" src="${escapeHtml(grafik)}" alt="" loading="lazy" onerror="this.remove()">` : ""}
              ${url ? `<a class="offer-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Mehr erfahren ${icon("externalLink", 13)}</a>` : ""}
            </div>
          </div>`;
        }).join("") || `<div class="timeline-empty">Keine Angebote in dieser Kategorie.</div>`}
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
        <div class="weather-title">${icon("sun", 15)} ${escapeHtml(weather.headline || "Wetter")}</div>
        <div class="weather-html">${weather.text || ""}</div>
      </div>`;
  }

  // ---------- View: Dokumente ----------

  // dokTitleText ist die kurze, verlässliche Kategorie ("Reisebestätigung"),
  // dokTitle kann zusätzliche Details enthalten, ist aber nicht immer
  // hübsch formatiert (teils nur ein interner Referenzcode) – deshalb als
  // Haupttitel bevorzugt dokTitleText verwenden.
  function docDisplayTitle(d) {
    return d.dokTitleText || d.dokTitle || "Dokument";
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
        <div class="doc-sub">Erstellt am ${fmtDokDateTime(d.dokDateTime)}</div>
        <div class="doc-status"></div>
      </div>`;
  }

  function renderDocs() {
    const docs = reisedokumenteList();
    const [first, ...restDocs] = docs;

    document.getElementById("view-docs").innerHTML = `
      <div>
        <div class="greeting-name" style="font-size:22px;">Dokumente</div>
        <div class="hero-sub">${docs.length} Reisedokumente</div>
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
    setDocStatus(rowEl, "Wird geladen …");
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
        setDocStatus(rowEl, "Dokument-Antwort in unbekanntem Format erhalten.");
      }
    } catch (err) {
      setDocStatus(rowEl, "Dokument konnte nicht geladen werden.");
    }
  }

  // ---------- Navigation ----------

  function renderAll() {
    renderOverview();
    renderPlan();
    renderOffers();
    renderDocs();
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

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  loadReiseData();
})();
