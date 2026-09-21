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
nur wenn vorhanden). `GetOffice` liefert keine eigene WhatsApp-Nummer,
daher wird eine Telefonnummer verwendet und clientseitig normalisiert
(`normalizeWhatsAppNumber()`: führende `0` → Landesvorwahl `49`, `+`/`00`
werden entfernt) – funktioniert nur zuverlässig, wenn die Nummer
tatsächlich WhatsApp-fähig ist. Für den Button oben (allgemeiner
Büro-Kontakt) kann über `WHATSAPP_OFFICE_NUMBER` in `.env` die
tatsächliche WhatsApp-Nummer des Büros hinterlegt werden (server.js
liefert sie über `/api/office`s `whatsapp`-Feld) – ohne diese Variable
fällt der Button auf `MyOffice.phone` zurück, das oft eine normale
Festnetznummer ist. Die Berater-Links nutzen weiterhin direkt
`MyBerater[].phone`.

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
