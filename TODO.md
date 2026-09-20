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

## 3. Kontaktmöglichkeit zum Reisebüro

Möglichkeit, direkt aus der App mit dem Reisebüro zu kommunizieren:
- Kontaktformular (Nachricht an das Büro, z.B. per E-Mail serverseitig
  versendet)
- WhatsApp-Link (`wa.me/<nummer>?text=...`) mit vorbefüllter Nachricht
  (z.B. inkl. travelID)

Telefonnummer/E-Mail sind jetzt über den Bereich "Mein Reisebüro"
(Punkt 2, `MyOffice.phone`/`.mail`) bzw. pro Berater (`MyBerater[].phone`/
`.mail`) verfügbar – Kontaktformular/WhatsApp-Link selbst fehlen noch.

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
