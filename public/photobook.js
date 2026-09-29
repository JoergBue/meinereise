// MeineReise – "Mein Reisebuch" (Fotobuch-Prototyp)
//
// Nach Reiseende wählt der Gast seine Urlaubsfotos aus; daraus entsteht
// automatisch ein Buchentwurf: Titelseite, Reise im Überblick (Stationen,
// An-/Abreise aus GetReiseData), eine oder mehrere Seiten pro Reisetag
// (Fotos nach Aufnahmedatum aus den EXIF-Daten zugeordnet, Ort und
// Bildtext aus dem Reiseverlauf), "Weitere Momente" für Fotos außerhalb des
// Reisezeitraums und eine Abschlussseite mit Collage und dem Reisebüro.
//
// Prototyp-Umfang (bewusst):
// - Fotos bleiben NUR auf dem Gerät (IndexedDB, verkleinerte Kopien) – es
//   wird nichts hochgeladen. Ohne IndexedDB (z.B. privater Modus) läuft
//   alles im Speicher weiter, der Entwurf geht dann beim Schließen verloren.
// - Kein Druck/keine Bestellung – stattdessen "Als PDF speichern" über den
//   Druckdialog des Browsers (gleiche Seitenvorlagen wie in der Vorschau).
//
// Greift nur über window.MeineReiseApp (siehe Ende von app.js) auf die App
// zu; app.js ruft Photobook.render() in renderAll() auf und bindet die
// Einstiegskarte (Photobook.entryCard()) auf der Startseite ein.
(function () {
  "use strict";

  const MR = window.MeineReiseApp;
  if (!MR) return;
  const { state, icon, escapeHtml, fmtDate, parseYYYYMMDD, dayKey } = MR;

  const NEW_ICONS = {
    book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>',
    imageIcon: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>'
  };
  Object.keys(NEW_ICONS).forEach((k) => { if (!MR.ICONS[k]) MR.ICONS[k] = NEW_ICONS[k]; });

  const MAX_EDGE = 1600;      // längste Kante der gespeicherten Kopie (px)
  const JPEG_QUALITY = 0.85;
  const PHOTOS_PER_PAGE = 4;  // max. Fotos pro Tagesseite
  const COLLAGE_MAX = 9;

  // ---------- Modulzustand ----------

  const pb = {
    trip: null,          // travelID, zu der die geladenen Daten gehören
    loading: false,
    photos: [],          // { id, trip, blob, w, h, taken: "JJJJMMTTHHMM"|null, name, added }
    book: null,          // { trip, title?, subtitle?, cover?, texts: {dayKey: text}, closing?, removed: [id] }
    urls: new Map(),     // photo id -> object URL
    busy: null,          // { done, total } während des Einlesens
    failed: 0,
    persist: true,       // false, wenn IndexedDB nicht nutzbar ist
    page: 0,             // aktuell sichtbare Seite in der Vorschau
    selected: null,      // angetipptes Foto (Aktionsleiste)
    confirmReset: false
  };

  const grund = () => (state.data && state.data.ReiseGrund) || {};
  const pad2 = (n) => String(n).padStart(2, "0");

  // ---------- IndexedDB (nur auf dem Gerät) ----------

  const DB_NAME = "meinereise-photobook";
  let dbPromise = null;

  function db() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        if (!window.indexedDB) { reject(new Error("no indexedDB")); return; }
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
          const d = req.result;
          d.createObjectStore("photos", { keyPath: "id" }).createIndex("trip", "trip");
          d.createObjectStore("books", { keyPath: "trip" });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  }

  function idb(storeName, mode, fn) {
    return db().then((d) => new Promise((resolve, reject) => {
      const t = d.transaction(storeName, mode);
      const req = fn(t.objectStore(storeName));
      t.oncomplete = () => resolve(req ? req.result : undefined);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    }));
  }

  async function persist(fn) {
    if (!pb.persist) return;
    try { await fn(); } catch (e) { pb.persist = false; }
  }

  let saveTimer = null;
  function saveBookSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => persist(() => idb("books", "readwrite", (s) => s.put(pb.book))), 400);
  }

  // ---------- Laden / Zurücksetzen ----------

  function emptyBook(trip) {
    return { trip, texts: {}, removed: [] };
  }

  function revokeUrls() {
    pb.urls.forEach((u) => URL.revokeObjectURL(u));
    pb.urls.clear();
  }

  function photoUrl(p) {
    let u = pb.urls.get(p.id);
    if (!u) { u = URL.createObjectURL(p.blob); pb.urls.set(p.id, u); }
    return u;
  }

  async function ensureLoaded() {
    const trip = state.travelID;
    if (!trip || pb.trip === trip || pb.loading) return;
    revokeUrls();
    Object.assign(pb, { trip, loading: true, photos: [], book: emptyBook(trip), page: 0, selected: null, failed: 0, confirmReset: false });
    try {
      const [photos, book] = await Promise.all([
        idb("photos", "readonly", (s) => s.index("trip").getAll(trip)),
        idb("books", "readonly", (s) => s.get(trip))
      ]);
      if (pb.trip !== trip) return;
      pb.photos = photos || [];
      pb.book = Object.assign(emptyBook(trip), book || {});
    } catch (e) {
      pb.persist = false;
    }
    pb.loading = false;
    render();
  }

  // ---------- Fotos einlesen ----------

  // Aufnahmedatum aus den EXIF-Daten einer JPEG-Datei (DateTimeOriginal,
  // sonst DateTimeDigitized bzw. DateTime) als "JJJJMMTTHHMM". Nur die
  // ersten 256 KB werden gelesen – dort liegt der EXIF-Block (APP1).
  async function readTakenDate(file) {
    try {
      const buf = await file.slice(0, 256 * 1024).arrayBuffer();
      const v = new DataView(buf);
      if (v.byteLength < 4 || v.getUint16(0) !== 0xFFD8) return null;
      let off = 2;
      while (off + 10 < v.byteLength) {
        const marker = v.getUint16(off);
        if ((marker & 0xFF00) !== 0xFF00) break;
        const len = v.getUint16(off + 2);
        if (marker === 0xFFE1 && v.getUint32(off + 4) === 0x45786966) return parseExifDate(v, off + 10);
        off += 2 + len;
      }
    } catch (e) { /* kein/kaputtes EXIF */ }
    return null;
  }

  function parseExifDate(v, tiff) {
    const le = v.getUint16(tiff) === 0x4949;
    const u16 = (o) => v.getUint16(o, le);
    const u32 = (o) => v.getUint32(o, le);
    const readIfd = (ifdOff) => {
      const entries = {};
      const n = u16(tiff + ifdOff);
      for (let i = 0; i < n; i++) {
        const e = tiff + ifdOff + 2 + i * 12;
        entries[u16(e)] = e;
      }
      return entries;
    };
    const ascii = (e) => {
      const count = u32(e + 4);
      const valOff = count > 4 ? tiff + u32(e + 8) : e + 8;
      let s = "";
      for (let i = 0; i < count - 1 && valOff + i < v.byteLength; i++) s += String.fromCharCode(v.getUint8(valOff + i));
      return s;
    };
    const ifd0 = readIfd(u32(tiff + 4));
    let str = "";
    if (ifd0[0x8769]) {
      const exif = readIfd(u32(ifd0[0x8769] + 8));
      if (exif[0x9003]) str = ascii(exif[0x9003]);
      else if (exif[0x9004]) str = ascii(exif[0x9004]);
    }
    if (!str && ifd0[0x0132]) str = ascii(ifd0[0x0132]);
    const m = str.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2})/);
    return m ? `${m[1]}${m[2]}${m[3]}${m[4]}${m[5]}` : null;
  }

  // Verkleinerte JPEG-Kopie (längste Kante MAX_EDGE). createImageBitmap
  // richtet das Bild anhand der EXIF-Ausrichtung aus; Fallback über <img>.
  async function downscale(file) {
    let src; let w; let h; let cleanup = () => {};
    try {
      src = await createImageBitmap(file, { imageOrientation: "from-image" });
      w = src.width; h = src.height;
      cleanup = () => { if (src.close) src.close(); };
    } catch (e) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      try { await img.decode(); } catch (err) { URL.revokeObjectURL(url); throw err; }
      src = img; w = img.naturalWidth; h = img.naturalHeight;
      cleanup = () => URL.revokeObjectURL(url);
    }
    const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
    const cw = Math.max(1, Math.round(w * scale));
    const ch = Math.max(1, Math.round(h * scale));
    const canvas = document.createElement("canvas");
    canvas.width = cw; canvas.height = ch;
    canvas.getContext("2d").drawImage(src, 0, 0, cw, ch);
    cleanup();
    const blob = await new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob"))), "image/jpeg", JPEG_QUALITY));
    return { blob, w: cw, h: ch };
  }

  function tripRange() {
    const g = grund();
    return g.checkinDate && g.checkoutDate ? { from: g.checkinDate.slice(0, 8), to: g.checkoutDate.slice(0, 8) } : null;
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) => /^image\//.test(f.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name));
    if (!files.length) return;
    pb.busy = { done: 0, total: files.length };
    pb.failed = 0;
    pb.selected = null;
    render();
    const range = tripRange();
    for (const f of files) {
      try {
        let taken = await readTakenDate(f);
        // Ohne EXIF: Änderungsdatum der Datei nur verwenden, wenn es in den
        // Reisezeitraum fällt (sonst ist es meist das Datum der Auswahl).
        if (!taken && f.lastModified && range) {
          const d = new Date(f.lastModified);
          const k = dayKey(d);
          if (k >= range.from && k <= range.to) taken = `${k}${pad2(d.getHours())}${pad2(d.getMinutes())}`;
        }
        const duplicate = pb.photos.some((p) => p.name === f.name && p.taken === taken);
        if (!duplicate) {
          const { blob, w, h } = await downscale(f);
          const photo = {
            id: `${pb.trip}:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
            trip: pb.trip, blob, w, h, taken, name: f.name, added: Date.now()
          };
          pb.photos.push(photo);
          await persist(() => idb("photos", "readwrite", (s) => s.put(photo)));
        }
      } catch (e) {
        pb.failed++;
      }
      pb.busy.done++;
      updateProgress();
    }
    pb.busy = null;
    pb.page = 0;
    render();
  }

  function updateProgress() {
    const el = document.querySelector("#view-photobook .pb-progress");
    if (!el || !pb.busy) return;
    el.querySelector(".pb-progress-text").textContent = I18N.t("pb.preparing", { done: pb.busy.done, total: pb.busy.total });
    el.querySelector(".pb-progress-bar span").style.width = `${Math.round(100 * pb.busy.done / Math.max(1, pb.busy.total))}%`;
  }

  async function resetAll() {
    const ids = pb.photos.map((p) => p.id);
    const trip = pb.trip;
    revokeUrls();
    pb.photos = [];
    pb.book = emptyBook(trip);
    pb.page = 0; pb.selected = null; pb.confirmReset = false; pb.failed = 0;
    await persist(() => idb("photos", "readwrite", (s) => { ids.forEach((id) => s.delete(id)); return null; }));
    await persist(() => idb("books", "readwrite", (s) => s.delete(trip)));
    render();
  }

  // ---------- Inhalte aus den Reisedaten ----------

  function stripHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = html || "";
    return (div.textContent || "").replace(/\s+/g, " ").trim();
  }

  function dayCaption(key) {
    const parts = [];
    MR.verlaufForDay(key).forEach((item) => {
      if (item.type === "F") {
        parts.push(I18N.t(item.flightType === "R" ? "pb.capReturnFlight" : "pb.capOutboundFlight", {
          from: item.departureAirportTxt || item.departureAirportCode || "",
          to: item.arrivalAirportTxt || item.arrivalAirportCode || ""
        }));
      } else if (item.type === "H" && item.hotelName && item.checkInDate === key) {
        parts.push(I18N.t("pb.capHotel", { hotel: item.hotelName }));
      } else if (item.type === "C" && item.cruiseShipName && (item.startDate || item.sortDate) === key) {
        parts.push(I18N.t("pb.capCruise", { ship: item.cruiseShipName }));
      } else if (item.type === "T" && item.text) {
        parts.push(stripHtml(item.text));
      } else if (item.type === "M" && (item.pickupDateTime || "").slice(0, 8) === key) {
        parts.push(I18N.t("pb.capCar"));
      } else if (item.type === "S") {
        const t = stripHtml(item.text || item.discription || "");
        if (t) parts.push(t.length > 90 ? `${t.slice(0, 88)}…` : t);
      }
    });
    return parts.join(" · ");
  }

  function dayPlace(key) {
    const cruise = MR.cruiseForDay(key);
    if (cruise) {
      const stop = MR.cruiseRouteStopForDay(cruise, key);
      if (stop && stop.isSeaDay) return [I18N.t("pb.seaDay"), cruise.cruiseShipName].filter(Boolean).join(" · ");
      if (stop && stop.port) return stop.port;
      return cruise.cruiseShipName || "";
    }
    const hotel = MR.hotelForDay(key);
    return (hotel && hotel.hotelName) || "";
  }

  function dayText(key) {
    const t = pb.book.texts[key];
    return typeof t === "string" ? t : dayCaption(key);
  }

  function stations() {
    const out = [];
    MR.verlaufList().forEach((item) => {
      if (item.type === "H" && item.hotelName) {
        out.push({ icon: "bed", text: item.hotelName, sub: [fmtDate(item.checkInDate), fmtDate(item.checkOutDate)].filter(Boolean).join(" – ") });
      } else if (item.type === "C" && item.cruiseShipName) {
        const ports = (Array.isArray(item.cruiseRouteDet) ? item.cruiseRouteDet : [])
          .map((s) => (s.port || "").trim()).filter((p) => p && p.toLowerCase() !== "seetag");
        out.push({ icon: "boat", text: item.cruiseShipName, sub: ports.join(" → ") });
      } else if (item.type === "M" && item.carCategoryClass) {
        out.push({ icon: "car", text: item.carCategoryClass, sub: [fmtDate((item.pickupDateTime || "").slice(0, 8)), fmtDate((item.returnDateTime || "").slice(0, 8))].filter(Boolean).join(" – ") });
      }
    });
    return out;
  }

  function journeys() {
    return MR.verlaufList().filter((i) => i.type === "F").map((item) => ({
      icon: "plane",
      text: `${I18N.t(item.flightType === "R" ? "plan.returnFlight" : "plan.outboundFlight")} ${item.flightCarrier || ""} ${item.flightNumber || ""}`.trim(),
      sub: [`${item.departureAirportTxt || item.departureAirportCode || ""} → ${item.arrivalAirportTxt || item.arrivalAirportCode || ""}`, fmtDate(item.departureDate || item.sortDate)].filter(Boolean).join(" · ")
    }));
  }

  function longDate(date) {
    return new Intl.DateTimeFormat(I18N.localeTag(), { weekday: "long", day: "numeric", month: "long" }).format(date);
  }

  function periodText() {
    const g = grund();
    return [fmtDate(g.checkinDate), fmtDate(g.checkoutDate)].filter(Boolean).join(" – ");
  }

  // ---------- Buchentwurf ----------

  function visiblePhotos() {
    const removed = new Set(pb.book.removed || []);
    return pb.photos
      .filter((p) => !removed.has(p.id))
      .sort((a, b) => (a.taken || "99999999").localeCompare(b.taken || "99999999") || a.added - b.added);
  }

  // Fotos gleichmäßig auf Seiten verteilen (max. PHOTOS_PER_PAGE je Seite):
  // 5 -> 3+2, 6 -> 3+3, 9 -> 3+3+3 statt 4+4+1.
  function chunk(list) {
    const pages = Math.ceil(list.length / PHOTOS_PER_PAGE);
    const out = [];
    let i = 0;
    for (let p = 0; p < pages; p++) {
      const size = Math.ceil((list.length - i) / (pages - p));
      out.push(list.slice(i, i + size));
      i += size;
    }
    return out;
  }

  function pickCollage(photos) {
    if (photos.length <= COLLAGE_MAX) return photos.slice();
    const step = photos.length / COLLAGE_MAX;
    return Array.from({ length: COLLAGE_MAX }, (_, i) => photos[Math.floor(i * step)]);
  }

  function buildPages() {
    const photos = visiblePhotos();
    const days = MR.tripDayList();
    const dayKeys = new Set(days.map((d) => d.key));
    const byDay = new Map();
    const extra = [];
    photos.forEach((p) => {
      const k = p.taken ? p.taken.slice(0, 8) : null;
      if (k && dayKeys.has(k)) {
        if (!byDay.has(k)) byDay.set(k, []);
        byDay.get(k).push(p);
      } else {
        extra.push(p);
      }
    });

    // Titelbild: selbst gewählt, sonst das erste Querformat aus dem
    // Reisezeitraum (nicht aus "Weitere Momente").
    const inTrip = photos.filter((p) => !extra.includes(p));
    const cover = photos.find((p) => p.id === pb.book.cover)
      || inTrip.find((p) => p.w >= p.h) || inTrip[0] || photos[0] || null;

    const pages = [{ kind: "cover", photo: cover }, { kind: "overview" }];
    const places = new Set();
    days.forEach((d, i) => {
      // Für die Statistik nur echte Orte zählen (kein Seetag).
      const cruise = MR.cruiseForDay(d.key);
      const stop = cruise && MR.cruiseRouteStopForDay(cruise, d.key);
      const place = stop && stop.isSeaDay ? "" : dayPlace(d.key);
      if (place) places.add(place);
      const list = byDay.get(d.key);
      if (!list) return;
      chunk(list).forEach((photosOfPage, j) => pages.push({
        kind: "day", key: d.key, date: d.date, index: i + 1, first: j === 0, photos: photosOfPage
      }));
    });
    if (extra.length) {
      chunk(extra).forEach((photosOfPage, j) => pages.push({ kind: "extra", first: j === 0, photos: photosOfPage }));
    }
    pages.push({
      kind: "closing", photos: pickCollage(photos),
      stats: { days: days.length, photos: photos.length, places: places.size }
    });
    return { pages, photos, extraCount: extra.length };
  }

  // ---------- Seiten-Vorlagen ----------
  //
  // Alle Größen in cqw (Prozent der Seitenbreite, .pb-page ist ein
  // Container) – dadurch sieht die Seite in der Handy-Vorschau und im
  // PDF (210 × 280 mm) gleich aus.

  function photoEl(p, extraClass) {
    if (!p) return `<div class="pb-photo pb-photo-empty ${extraClass || ""}">${icon("imageIcon", 28)}</div>`;
    const sel = pb.selected === p.id ? " is-selected" : "";
    return `<button type="button" class="pb-photo ${extraClass || ""}${sel}" data-photo="${escapeHtml(p.id)}"><img src="${photoUrl(p)}" alt=""></button>`;
  }

  function photoGrid(photos) {
    const n = photos.length;
    const layout = n === 2 && photos.every((p) => p.w >= p.h) ? "2r" : String(Math.min(n, 4));
    return `<div class="pb-grid pb-grid-${layout}">${photos.map((p) => photoEl(p)).join("")}</div>`;
  }

  function pageFooter(num) {
    return `<div class="pb-page-num">${num}</div>`;
  }

  function renderPage(page, num) {
    const g = grund();
    const office = MR.officeInfo();
    if (page.kind === "cover") {
      const title = pb.book.title || g.travelTitle || I18N.t("pb.defaultTitle");
      const subtitle = typeof pb.book.subtitle === "string" ? pb.book.subtitle : (g.travelRegionText || "");
      return `
        <div class="pb-page pb-cover">
          ${photoEl(page.photo, "pb-cover-photo")}
          <div class="pb-cover-band">
            <div class="pb-cover-title">${escapeHtml(title)}</div>
            ${subtitle ? `<div class="pb-cover-sub">${escapeHtml(subtitle)}</div>` : ""}
            <div class="pb-cover-date">${escapeHtml(periodText())}</div>
          </div>
        </div>`;
    }
    if (page.kind === "overview") {
      const checkin = parseYYYYMMDD(g.checkinDate);
      const checkout = parseYYYYMMDD(g.checkoutDate);
      const nights = checkin && checkout ? MR.daysBetween(checkin, checkout) : null;
      const facts = [
        [I18N.t("pb.factPeriod"), periodText()],
        nights != null ? [I18N.t("pb.factNights"), String(nights)] : null,
        g.travelers ? [I18N.t("pb.factTravelers"), String(g.travelers)] : null,
        [I18N.t("pb.factPhotos"), String(visiblePhotos().length)]
      ].filter(Boolean);
      const list = (items) => items.map((s) => `
        <div class="pb-line">${icon(s.icon, 14)}<div><div class="pb-line-text">${escapeHtml(s.text)}</div>${s.sub ? `<div class="pb-line-sub">${escapeHtml(s.sub)}</div>` : ""}</div></div>`).join("");
      const st = stations();
      const jr = journeys();
      return `
        <div class="pb-page pb-overview">
          <div class="pb-eyebrow">${escapeHtml(g.travelTitle || "")}</div>
          <div class="pb-h1">${I18N.t("pb.pageOverview")}</div>
          ${g.travelRegionText ? `<div class="pb-lead">${escapeHtml(g.travelRegionText)}</div>` : ""}
          <div class="pb-facts">${facts.map(([k, v]) => `<div class="pb-fact"><div class="pb-fact-v">${escapeHtml(v)}</div><div class="pb-fact-k">${escapeHtml(k)}</div></div>`).join("")}</div>
          ${st.length ? `<div class="pb-h2">${I18N.t("pb.stations")}</div>${list(st)}` : ""}
          ${jr.length ? `<div class="pb-h2">${I18N.t("pb.journey")}</div>${list(jr)}` : ""}
          ${pageFooter(num)}
        </div>`;
    }
    if (page.kind === "day") {
      const place = dayPlace(page.key);
      const text = page.first ? dayText(page.key) : "";
      return `
        <div class="pb-page pb-day ${page.first ? "" : "is-continued"}">
          <div class="pb-day-head">
            <div class="pb-eyebrow">${I18N.t("pb.dayLabel", { n: page.index })}${page.first ? "" : ` · ${I18N.t("pb.continued")}`}</div>
            ${page.first ? `<div class="pb-h1">${escapeHtml(longDate(page.date))}</div>` : ""}
            ${page.first && place ? `<div class="pb-lead">${icon("pin", 13)} ${escapeHtml(place)}</div>` : ""}
            ${text ? `<div class="pb-text">${escapeHtml(text)}</div>` : ""}
          </div>
          ${photoGrid(page.photos)}
          ${pageFooter(num)}
        </div>`;
    }
    if (page.kind === "extra") {
      return `
        <div class="pb-page pb-day">
          <div class="pb-day-head">
            ${page.first ? `<div class="pb-h1">${I18N.t("pb.extraTitle")}</div>` : `<div class="pb-eyebrow">${I18N.t("pb.extraTitle")} · ${I18N.t("pb.continued")}</div>`}
          </div>
          ${photoGrid(page.photos)}
          ${pageFooter(num)}
        </div>`;
    }
    // closing
    const closing = typeof pb.book.closing === "string" ? pb.book.closing : I18N.t("pb.closingDefault");
    return `
      <div class="pb-page pb-closing">
        <div class="pb-collage pb-collage-${Math.min(page.photos.length, COLLAGE_MAX)}">${page.photos.map((p) => photoEl(p)).join("")}</div>
        <div class="pb-closing-text">${escapeHtml(closing)}</div>
        <div class="pb-closing-stats">${I18N.t("pb.closingStats", page.stats)}</div>
        <div class="pb-imprint">
          ${office ? `<div>${I18N.t("pb.bookedWith", { office: `<strong>${escapeHtml(office.name)}</strong>` })}</div><div>${escapeHtml(office.address)}</div>` : ""}
          <div class="pb-madewith">${I18N.t("pb.madeWith")}</div>
        </div>
        ${pageFooter(num)}
      </div>`;
  }

  // ---------- Einstiegskarte (Startseite, nur nach Reiseende) ----------

  function entryCard() {
    return `
      <div class="next-trip-card pb-entry">
        <div class="next-trip-card-icon">${icon("book", 19)}</div>
        <div class="next-trip-card-body">
          <div class="next-trip-card-title">${I18N.t("pb.entryTitle")}</div>
          <div class="next-trip-card-text">${I18N.t("pb.entryText")}</div>
          <button type="button" class="btn-primary" data-goto="photobook">
            ${I18N.t("pb.entryCta")} ${icon("arrowRight", 15)}
          </button>
        </div>
      </div>`;
  }

  // ---------- Ansicht ----------

  let current = { pages: [], photos: [], extraCount: 0 };

  function fileButton(labelKey, iconName, primary) {
    return `
      <label class="${primary ? "btn-primary" : "pb-btn"} pb-file-btn">
        ${icon(iconName, 16)} <span>${I18N.t(labelKey)}</span>
        <input type="file" accept="image/*" multiple hidden data-pb-files>
      </label>`;
  }

  function render() {
    const container = document.getElementById("view-photobook");
    if (!container || !state.data) return;
    if (pb.trip !== state.travelID) { ensureLoaded(); }

    const head = `
      <button class="back-link" data-pb-back>${icon("chevronLeft", 16)} ${I18N.t("pb.back")}</button>
      <div>
        <div class="greeting-name" style="font-size:20px;">${I18N.t("pb.title")}</div>
      </div>`;

    if (pb.loading || pb.trip !== state.travelID) {
      container.innerHTML = `${head}<div class="loading">${I18N.t("places.loading")}</div>`;
      bind(container);
      return;
    }

    const storageNote = pb.persist ? "" : `<div class="pb-note is-warn">${I18N.t("pb.noStorage")}</div>`;
    const privacy = `<div class="pb-privacy">${icon("shield", 14)} ${I18N.t("pb.privacy")}</div>`;

    if (pb.busy) {
      container.innerHTML = `${head}
        <div class="pb-progress">
          <div class="pb-progress-text">${I18N.t("pb.preparing", { done: pb.busy.done, total: pb.busy.total })}</div>
          <div class="pb-progress-bar"><span style="width:${Math.round(100 * pb.busy.done / Math.max(1, pb.busy.total))}%"></span></div>
        </div>
        ${privacy}`;
      bind(container);
      return;
    }

    if (!pb.photos.length) {
      container.innerHTML = `${head}
        <div class="pb-intro">
          <p class="next-trip-intro">${I18N.t("pb.intro")}</p>
          <ol class="pb-steps">
            <li>${icon("camera", 16)} ${I18N.t("pb.step1")}</li>
            <li>${icon("book", 16)} ${I18N.t("pb.step2")}</li>
            <li>${icon("imageIcon", 16)} ${I18N.t("pb.step3")}</li>
          </ol>
          ${pb.failed ? `<div class="pb-note is-warn">${I18N.tCount("pb.failed", pb.failed)}</div>` : ""}
          ${fileButton("pb.choose", "camera", true)}
          ${privacy}
          ${storageNote}
        </div>`;
      bind(container);
      return;
    }

    current = buildPages();
    const total = current.pages.length;
    pb.page = Math.min(pb.page, total - 1);
    const removedCount = (pb.book.removed || []).length;

    container.innerHTML = `${head}
      <div class="pb-summary">${I18N.t("pb.summary", { photos: current.photos.length, pages: total })}</div>
      ${pb.failed ? `<div class="pb-note is-warn">${I18N.tCount("pb.failed", pb.failed)}</div>` : ""}
      ${current.extraCount ? `<div class="pb-note">${I18N.tCount("pb.outside", current.extraCount)}</div>` : ""}

      <div class="pb-pager" data-pb-pager>
        ${current.pages.map((p, i) => `<div class="pb-slide" data-pb-slide="${i}">${renderPage(p, i + 1)}</div>`).join("")}
      </div>
      <div class="pb-pager-nav">
        <button type="button" class="pb-nav-btn" data-pb-prev aria-label="${escapeHtml(I18N.t("pb.prev"))}">${icon("chevronLeft", 18)}</button>
        <div class="pb-page-indicator" data-pb-indicator>${I18N.t("pb.pageOf", { n: pb.page + 1, total })}</div>
        <button type="button" class="pb-nav-btn" data-pb-next aria-label="${escapeHtml(I18N.t("pb.next"))}"><span class="pb-flip">${icon("chevronLeft", 18)}</span></button>
      </div>

      <div class="pb-actionbar" data-pb-actionbar></div>
      <div class="pb-editor" data-pb-editor></div>

      <div class="pb-actions">
        ${fileButton("pb.add", "plus", false)}
        <button type="button" class="pb-btn" data-pb-print>${icon("printer", 16)} <span>${I18N.t("pb.pdf")}</span></button>
        ${removedCount ? `<button type="button" class="pb-btn" data-pb-restore>${icon("undo", 16)} <span>${I18N.t("pb.restoreRemoved", { n: removedCount })}</span></button>` : ""}
        <button type="button" class="pb-btn pb-btn-danger" data-pb-reset>${icon("trash", 16)} <span>${I18N.t(pb.confirmReset ? "pb.resetConfirm" : "pb.reset")}</span></button>
      </div>

      <div class="pb-order">
        <div class="next-trip-card-title">${I18N.t("pb.orderTitle")}</div>
        <div class="next-trip-card-text">${I18N.t("pb.orderText")}</div>
      </div>
      ${privacy}
      ${storageNote}`;

    bind(container);
    const pager = container.querySelector("[data-pb-pager]");
    if (pager && pb.page) pager.scrollLeft = pb.page * pager.clientWidth;
    renderActionbar();
    renderEditor();
  }

  function rerenderPage(index) {
    const slide = document.querySelector(`#view-photobook [data-pb-slide="${index}"]`);
    if (!slide || !current.pages[index]) return;
    slide.innerHTML = renderPage(current.pages[index], index + 1);
  }

  function renderActionbar() {
    const bar = document.querySelector("#view-photobook [data-pb-actionbar]");
    if (!bar) return;
    const p = pb.selected && pb.photos.find((x) => x.id === pb.selected);
    if (!p) {
      bar.innerHTML = `<div class="pb-hint">${I18N.t("pb.tapHint")}</div>`;
      return;
    }
    bar.innerHTML = `
      <div class="pb-selected">
        <img src="${photoUrl(p)}" alt="">
        <button type="button" class="pb-btn" data-pb-cover>${icon("book", 15)} ${I18N.t("pb.photoCover")}</button>
        <button type="button" class="pb-btn pb-btn-danger" data-pb-remove>${icon("trash", 15)} ${I18N.t("pb.photoRemove")}</button>
        <button type="button" class="pb-btn pb-btn-plain" data-pb-deselect>${I18N.t("pb.photoCancel")}</button>
      </div>`;
    bar.querySelector("[data-pb-cover]").addEventListener("click", () => {
      pb.book.cover = p.id; pb.selected = null; saveBookSoon(); render();
    });
    bar.querySelector("[data-pb-remove]").addEventListener("click", () => {
      pb.book.removed = (pb.book.removed || []).concat(p.id);
      if (pb.book.cover === p.id) delete pb.book.cover;
      pb.selected = null; saveBookSoon(); render();
    });
    bar.querySelector("[data-pb-deselect]").addEventListener("click", () => {
      pb.selected = null; render();
    });
  }

  function renderEditor() {
    const box = document.querySelector("#view-photobook [data-pb-editor]");
    if (!box) return;
    const page = current.pages[pb.page];
    if (!page) { box.innerHTML = ""; return; }
    const g = grund();
    let html = "";
    if (page.kind === "cover") {
      html = `
        <label class="pb-field"><span>${I18N.t("pb.editTitle")}</span>
          <input type="text" data-pb-edit="title" value="${escapeHtml(pb.book.title || g.travelTitle || I18N.t("pb.defaultTitle"))}"></label>
        <label class="pb-field"><span>${I18N.t("pb.editSubtitle")}</span>
          <input type="text" data-pb-edit="subtitle" value="${escapeHtml(typeof pb.book.subtitle === "string" ? pb.book.subtitle : (g.travelRegionText || ""))}"></label>`;
    } else if (page.kind === "day" && page.first) {
      const edited = typeof pb.book.texts[page.key] === "string";
      html = `
        <label class="pb-field"><span>${I18N.t("pb.editDayText", { n: page.index })}</span>
          <textarea rows="3" data-pb-edit="day" data-key="${page.key}">${escapeHtml(dayText(page.key))}</textarea></label>
        ${edited ? `<button type="button" class="pb-link" data-pb-resettext="${page.key}">${icon("undo", 13)} ${I18N.t("pb.resetText")}</button>` : ""}`;
    } else if (page.kind === "closing") {
      html = `
        <label class="pb-field"><span>${I18N.t("pb.editClosing")}</span>
          <textarea rows="3" data-pb-edit="closing">${escapeHtml(typeof pb.book.closing === "string" ? pb.book.closing : I18N.t("pb.closingDefault"))}</textarea></label>`;
    }
    box.innerHTML = html;
    box.querySelectorAll("[data-pb-edit]").forEach((el) => {
      el.addEventListener("input", () => {
        const kind = el.dataset.pbEdit;
        if (kind === "title") pb.book.title = el.value;
        else if (kind === "subtitle") pb.book.subtitle = el.value;
        else if (kind === "day") pb.book.texts[el.dataset.key] = el.value;
        else if (kind === "closing") pb.book.closing = el.value;
        saveBookSoon();
        rerenderPage(pb.page);
      });
    });
    const resetBtn = box.querySelector("[data-pb-resettext]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        delete pb.book.texts[resetBtn.dataset.pbResettext];
        saveBookSoon(); rerenderPage(pb.page); renderEditor();
      });
    }
  }

  function goToPage(i) {
    const pager = document.querySelector("#view-photobook [data-pb-pager]");
    if (!pager) return;
    const idx = Math.max(0, Math.min(current.pages.length - 1, i));
    pager.scrollTo({ left: idx * pager.clientWidth, behavior: "smooth" });
  }

  function bind(container) {
    const back = container.querySelector("[data-pb-back]");
    if (back) back.addEventListener("click", () => MR.showView("overview"));

    container.querySelectorAll("[data-pb-files]").forEach((input) => {
      input.addEventListener("change", () => {
        const files = input.files;
        addFiles(files);
      });
    });

    const pager = container.querySelector("[data-pb-pager]");
    if (pager) {
      let t = null;
      pager.addEventListener("scroll", () => {
        clearTimeout(t);
        t = setTimeout(() => {
          const idx = Math.round(pager.scrollLeft / Math.max(1, pager.clientWidth));
          if (idx !== pb.page) {
            pb.page = idx;
            const ind = container.querySelector("[data-pb-indicator]");
            if (ind) ind.textContent = I18N.t("pb.pageOf", { n: idx + 1, total: current.pages.length });
            renderEditor();
          }
        }, 80);
      });
      pager.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-photo]");
        if (!btn) return;
        pb.selected = pb.selected === btn.dataset.photo ? null : btn.dataset.photo;
        container.querySelectorAll(".pb-photo.is-selected").forEach((el) => el.classList.remove("is-selected"));
        if (pb.selected) container.querySelectorAll(`[data-photo="${CSS.escape(pb.selected)}"]`).forEach((el) => el.classList.add("is-selected"));
        renderActionbar();
      });
    }
    const prev = container.querySelector("[data-pb-prev]");
    if (prev) prev.addEventListener("click", () => goToPage(pb.page - 1));
    const next = container.querySelector("[data-pb-next]");
    if (next) next.addEventListener("click", () => goToPage(pb.page + 1));

    const printBtn = container.querySelector("[data-pb-print]");
    if (printBtn) printBtn.addEventListener("click", printBook);

    const restore = container.querySelector("[data-pb-restore]");
    if (restore) restore.addEventListener("click", () => { pb.book.removed = []; saveBookSoon(); render(); });

    const reset = container.querySelector("[data-pb-reset]");
    if (reset) {
      reset.addEventListener("click", () => {
        if (!pb.confirmReset) { pb.confirmReset = true; render(); return; }
        resetAll();
      });
    }
  }

  // ---------- PDF (Druckdialog des Browsers) ----------

  async function printBook() {
    const old = document.getElementById("pb-print");
    if (old) old.remove();
    const root = document.createElement("div");
    root.id = "pb-print";
    root.className = "pb-print";
    const saved = pb.selected;
    pb.selected = null;
    root.innerHTML = current.pages.map((p, i) => renderPage(p, i + 1)).join("");
    pb.selected = saved;
    document.body.appendChild(root);
    document.documentElement.classList.add("pb-printing");
    await Promise.all(Array.from(root.querySelectorAll("img")).map((img) => img.decode().catch(() => {})));
    const cleanup = () => {
      document.documentElement.classList.remove("pb-printing");
      root.remove();
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  }

  window.Photobook = { render, entryCard, _state: pb };
})();
