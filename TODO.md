# TODO / Ideen

Sammlung von Ideen und offenen Punkten für die Weiterentwicklung von
MeineReise – noch nicht umgesetzt, dient als Backlog für spätere Sessions.

## 1. Aufruf ohne Parameter (Buchungsnummer → HashKey)

Aktuell erwartet die App zwingend eine `travelID` im Hash-Fragment
(`#<travelID>`) – ruft man die App ohne Parameter auf, kommt nur eine
Fehlermeldung (siehe `renderFatalError` in `app.js`).

Idee: eine eigene Einstiegsseite, auf der Buchungsnummer + Reisedatum
eingegeben werden können. Aus diesen Daten wird dann serverseitig ein
HashKey (bzw. die travelID) abgeholt, mit dem anschließend automatisch
auf `#<hashKey>` weitergeleitet wird – die eigentliche App startet dann
wie gewohnt.

Offene Punkte:
- Welche BOSYS-API-Funktion liefert den HashKey/die travelID zu
  Buchungsnummer + Reisedatum? (Name/Parameter aus der UI.SPACE-Doku
  klären, analog zu `GetReiseData`/`GetDokument`.)
- Neue Server-Route (z.B. `/api/hashkey`) + einfache Eingabemaske als
  neue "Startseite" ohne Hash-Fragment.
- Fehlerfall (Buchungsnummer/Datum passt nicht) sauber abfangen.

## 2. Neuer Bereich "Mein Reisebüro" ✅ umgesetzt

Eigener Bottom-Nav-Bereich (`view-office`), der die Daten des Reisebüros
über `GetOffice` anzeigt: Adresse, Öffnungszeiten (Mo–So), Telefon/
Mail/Website als Links sowie das Team (`MyBerater`) als Kartenraster mit
Foto, Funktion und Kontakt. Serverseitig `/api/office`, Token
(`BOSYS_OFFICE_TOKEN` in `.env`) ist der "HashKey", unabhängig von der
travelID – ohne Konfiguration bzw. bei fehlgeschlagenem Live-Aufruf
Demo-Daten (Testagentur Bosys), gleiches Fallback-Muster wie bei
`GetReiseData`.

Noch nicht abgedeckt: `MyOffers`/`MyHolidays`/`MyData` aus der
GetOffice-Antwort (waren im Beispiel leer/0 – bei Bedarf später ergänzen).

## 3. Kontaktmöglichkeit zum Reisebüro ✅ WhatsApp umgesetzt

Möglichkeit, direkt aus der App mit dem Reisebüro zu kommunizieren.
Bewusst mit der einfachsten Variante angefangen (kein Server-Code, kein
neuer API-/SMTP-Zugang nötig, sofort einsatzbereit): ein `wa.me`-Link mit
vorbefüllter Nachricht (Reisetitel + Reise-Nr., siehe
`whatsappTravelMessage()` in `app.js`) – ein prominenter Button oben in
"Mein Reisebüro" sowie ein WhatsApp-Link pro Berater (`MyBerater[].phone`,
nur wenn vorhanden).

Für den Button oben (allgemeiner Büro-Kontakt) liefert `GetOffice`
inzwischen ein eigenes Feld `MyOffice.whatsapp` (ein fertiger,
einsatzbereiter `wa.me`-Link) – das ist jetzt die primäre und
maßgebliche Quelle: ist es vorhanden, gilt WhatsApp als nutzbar und der
Button erscheint (`whatsappUrlFromLink()` in `app.js`). Als Fallback,
falls dieses Feld (noch) nicht geliefert wird, kann weiterhin über
`WHATSAPP_OFFICE_NUMBER` in `.env` eine Nummer hinterlegt werden
(clientseitig normalisiert über `normalizeWhatsAppNumber()`). Ein
Rückgriff auf `MyOffice.phone` (normale Festnetznummer, nicht
zuverlässig WhatsApp-fähig) findet nicht mehr statt – ohne
`MyOffice.whatsapp` und ohne `WHATSAPP_OFFICE_NUMBER` bleibt der Button
einfach weg. Die Berater-Links nutzen weiterhin direkt
`MyBerater[].phone`, da es dort kein eigenes `whatsapp`-Feld gibt.

Zusätzlich: Im Adressbereich von "Mein Reisebüro" wird jetzt eine Reihe
kleiner Social-Media-Icons angezeigt (Facebook, Instagram, YouTube,
TikTok), jeweils nur wenn `GetOffice` das entsprechende Feld
(`facebook`/`instagramm`/`youtube`/`tiktok`) tatsächlich mit einem Wert
liefert (`officeSocialLinks()` in `app.js`, nutzt den bestehenden
Markdown-Link-Parser `offerLinkUrl()`).

Noch offen (mehr Aufwand, nur bei Bedarf): eigenes Kontaktformular mit
serverseitigem E-Mail-Versand (bräuchte SMTP- oder E-Mail-API-Zugang,
ähnlicher Umstand wie zuletzt bei Google Places) sowie ein einfacher
`mailto:`-Link als zusätzliche Alternative für Nutzer ohne WhatsApp.

## 4. Weitere Leistungsarten im Reiseplan

Bisher mit eigener Detail-Darstellung: Flug (F), Hotel (H), Kreuzfahrt
(C), Mietwagen (M) ✅. Mietwagen ist bewusst noch rudimentär (nur
`carCategoryClass`, `pickupDateTime`, `returnDateTime` – keine eigene
Detailseite, nur Timeline-Zeile + "Mietwagen unterwegs"-Kontextkarte an
Tagen dazwischen + Ausschluss der Mietwagen-Angebotsvorschläge an
diesen Tagen). Falls die API später mehr Felder liefert (Stationen,
Preis, Anbieter etc.), kann das erweitert werden.

Für folgende Leistungsarten fehlt noch eine passende, auf echten
Felddaten basierende Darstellung (aktuell nur generischer Fallback bzw.
teilweise nur Basis-Text):
- Parkplatz
- Bahnfahrkarte
- Versicherung (V) – aktuell nur `discription` als Fließtext
- Transfer (T) – aktuell nur `text` als Fließtext

Wie bei Hotel und Kreuzfahrt gilt: erst umsetzen, sobald ein echtes
`GetReiseData`-Beispiel mit den tatsächlichen Feldnamen für den
jeweiligen Typ vorliegt (Schema nicht raten – siehe bisherige
Erfahrung mit `hotelPics`, `ZusatzLeistung` etc.).

## 5. Mehrsprachigkeit

Aktuell ist die gesamte Oberfläche fest auf Deutsch (alle Texte/Labels
direkt im Markup in `app.js`/`index.html`, keine Übersetzungsschicht).

Offene Punkte:
- Liefert die BOSYS-API Texte (z.B. `text`/`discription`-Felder,
  Zusatzleistungen) bereits sprachabhängig, oder nur die feste
  App-Oberfläche (Labels, Buttons, Öffnungszeiten-Wochentage etc.)? Falls
  auch Inhalte übersetzt werden sollen, braucht es eine Sprachangabe im
  API-Aufruf – klären, ob/wie GetReiseData das unterstützt.
- Für die App-Oberfläche: Texte aus dem Code in eine
  Übersetzungstabelle/-datei auslegen (z.B. `de`/`en` als Start),
  Sprachumschaltung (z.B. über Browser-Sprache als Default + manuelle
  Auswahl).
- Betrifft u.a. Wochentage/Datumsformate (`fmtDate`, `DOW`,
  `OFFICE_DOW_LABELS`), alle statischen Labels in `app.js` sowie
  `index.html` (Nav-Beschriftungen).

## 6. "In der Nähe" (Google Places) ✅ umgesetzt / Viator noch offen

Im Reiseplan wird zum Hotel-Standort des jeweiligen Tages
(`locationLatitude`/`locationLongitude`) über die Google Places API
("New", `searchNearby`) eine kleine Auswahl nahegelegener Restaurants und
Sehenswürdigkeiten angezeigt (Name, Bewertung, Kategorie, Link zu Google
Maps). Serverseitig `/api/places`, Key (`GOOGLE_PLACES_API_KEY` in `.env`)
– ohne Konfiguration bzw. bei fehlgeschlagenem Live-Aufruf Demo-Orte
(Beispielorte rund um Taormina), gleiches Fallback-Muster wie bei
`GetReiseData`/`GetOffice`. Ergebnisse werden serverseitig 30 Minuten pro
Standort gecacht (Kostenkontrolle). Bisher nur für den Hotel-Standort –
Kreuzfahrthäfen (nur Portname, keine Koordinaten in `cruiseRouteDet`)
sind noch nicht angebunden.

Noch offen: **Viator API** für buchbare Ausflüge/Touren (statt nur
Empfehlungen anzuzeigen, echte Produkte mit Bildern/Preisen/Buchungslink
passend zum jeweiligen Reisetag). Dafür nötig:
- Bewerbung beim Viator Partner Program (kein sofortiger Self-Service-Key
  wie bei Google) – noch nicht beantragt.
- Server-Route analog zu `/api/places` (z.B. `/api/viator`), die per
  Destination/Standort passende Produkte abruft, mit Demo-Fallback.
- Anzeigeort klären: eigener Abschnitt im Reiseplan (wie "In der Nähe"),
  oder Ergänzung der bestehenden "Passend für heute"-Angebotsvorschläge.

## 7. "Zum Home-Bildschirm hinzufügen" ✅ umgesetzt

Als eine von mehreren Ideen für mehr Nutzungslust/Kundenbindung besprochen
(u.a. Notfall-Kontakt, Live-Flugstatus, Viator-Ausflüge s.o., Feedback nach
der Reise, Wiederkehr-Rabatt) – als erste Maßnahme umgesetzt, da mit wenig
Aufwand direkt wirksam: `manifest.json` + Icons (`public/icons/`) +
Service Worker (`sw.js`, bewusst ohne Offline-Caching) machen die App
installierbar; ein dezenter Banner auf der Startseite
(`renderInstallBanner()` in `app.js`) zeigt Android/Chrome-Nutzern einen
echten "Installieren"-Button (`beforeinstallprompt`), iOS/Safari-Nutzern
eine kurze Anleitung (Safari kann das nicht automatisch auslösen). Details
siehe README.md, Abschnitt "Zum Home-Bildschirm hinzufügen (PWA)".

Die übrigen besprochenen Ideen (Notfall-Kontakt-Button, Live-Flugstatus,
Feedback/Bewertung nach der Reise, Wiederkehr-Rabatt, Reiserückblick zum
Abschluss) sind noch nicht umgesetzt – bei Bedarf einzeln angehen.
