// Demo-Antwort im exakten Format der GetReiseData-Response (siehe API-Doku).
// Wird von server.js ausgeliefert, solange BOSYS_API_URL nicht erreichbar ist
// oder keine echten Zugangsdaten in .env hinterlegt sind – so lässt sich das
// Frontend von Anfang an gegen eine reale Antwortstruktur entwickeln.

function demoReiseData(travelID) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const timeStamp = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  return {
    bns_response: {
      GetReiseData: {
        // Hex-Farbe des vermittelnden Reisebüros – die App leitet daraus
        // ihr Farbschema ab (siehe app.js buildBrandScale/applyBrandColor).
        brandColor: "#1C448C",
        office: {
          name: "Reisebüro Testermann",
          adress: "Normannenweg 28 20537 Hamburg"
        },
        ReiseGrund: {
          bookingDate: "20260615",
          checkinDate: "20261003",
          checkoutDate: "20261011",
          travelID: String(travelID || "291922"),
          travelTitle: "Sizilien Rundreise",
          travelPrice: "245000",
          travelPriceF: "2.450,00",
          travelCurrency: "EUR",
          priceOffice: "245000",
          priceOperator: "0",
          priceOfficeOpen: "0",
          priceOperatorOpen: "0",
          travelPic: "https://i.giatamedia.com/s.php?uid=204387&source=xml&size=640&cid=3959&iid=134567179",
          travelRegionText: "Taormina · Sizilien · Italien",
          travelText: "3.10.2026 bis 11.10.2026<br>ab Frankfurt · Rundreise Sizilien · 2 Erwachsene",
          travelKategorie: "40",
          travelGiataID: "",
          travelers: "2"
        },
        ReiseLeistung: [
          {
            BuchNr: "12957790",
            DatumVon: "20261003",
            DatumBis: "20261011",
            Leistung: "Sizilien Rundreise",
            Preis: "245000",
            RePreis: "0",
            Status: "BU",
            Veran: "ALL",
            touroperatorCode: "ALL",
            touroperatorName: "alltours"
          }
        ],
        ReiseVerlauf: [
          {
            type: "F",
            sortDate: "20261003",
            flightType: "H",
            orderNo: "1",
            flightCarrier: "LH",
            flightCarrierTxt: "Lufthansa",
            flightNumber: "1829",
            flightClass: "Economy",
            departureDate: "20261003",
            departureDateTime: "202610030730",
            departureAirportCode: "FRA",
            departureAirportTxt: "Frankfurt",
            arrivalDateTime: "202610031015",
            arrivalAirportCode: "CTA",
            arrivalAirportTxt: "Catania"
          },
          {
            type: "T",
            sortDate: "20261003",
            startDate: "20261003",
            endDate: "20261003",
            text: "Transfer Flughafen Catania – Taormina"
          },
          {
            type: "H",
            sortDate: "20261003",
            checkInDate: "20261003",
            checkOutDate: "20261011",
            hotelStars: "5",
            hotelName: "Grand Hotel Taormina",
            hotelPics: [
              { picLink: "https://i.giatamedia.com/s.php?uid=204387&source=xml&size=640&cid=3959&iid=134567179" },
              { picLink: "https://i.giatamedia.com/s.php?uid=204387&source=xml&size=640&cid=3959&iid=134567180" },
              { picLink: "https://i.giatamedia.com/s.php?uid=204387&source=xml&size=640&cid=3959&iid=134567181" }
            ],
            roomCategoryCode: "DZM",
            roomCategoryName: "Doppelzimmer Meerblick",
            mealsCategoryCode: "HP",
            mealsCategoryName: "Halbpension",
            locationLatitude: "37.8523",
            locationLongitude: "15.2853",
            discription: "Elegantes Hotel oberhalb der Altstadt mit Blick auf Ätna und Meer.<br><br><strong>Ausstattung:</strong><ul><li>Pool mit Meerblick</li><li>Spa &amp; Wellnessbereich</li></ul>Mehr Infos auf der <a href=\"https://www.grandhotel-taormina.example\" target=\"_blank\" rel=\"noopener\">Hotel-Website</a>.",
            giataID: "2111"
          },
          {
            type: "F",
            sortDate: "20261011",
            flightType: "R",
            orderNo: "2",
            flightCarrier: "LH",
            flightCarrierTxt: "Lufthansa",
            flightNumber: "1830",
            flightClass: "Economy",
            departureDate: "20261011",
            departureDateTime: "202610111100",
            departureAirportCode: "CTA",
            departureAirportTxt: "Catania",
            arrivalDateTime: "202610111340",
            arrivalAirportCode: "FRA",
            arrivalAirportTxt: "Frankfurt"
          }
        ],
        ReiseDokumente: [
          { dokID: "D0491030001271000000f520", dokDateTime: "20260618143200", dokTitle: "Reisebestätigung 03.10.2026 bis 11.10.2026", dokTitleText: "Reisebestätigung" },
          { dokID: "D0491030001271000000f521", dokDateTime: "20260925101500", dokTitle: "Flugticket", dokTitleText: "Flugticket" },
          { dokID: "D0491030001271000000f522", dokDateTime: "20260925101500", dokTitle: "Hotelvoucher", dokTitleText: "Hotelvoucher" },
          { dokID: "D0491030001271000000f523", dokDateTime: "20260925101500", dokTitle: "Transfervoucher", dokTitleText: "Transfervoucher" },
          { dokID: "D0491030001271000000f524", dokDateTime: "20260620120500", dokTitle: "Zahlungsbestätigung", dokTitleText: "Zahlungsbestätigung" }
        ],
        ZusatzLeistung: [
          {
            type: "G004",
            art: "TCAR",
            grafikMail: "https://media.bosys.eu/media/uiplus/RSC_TCAR_SYM_97.png",
            grafikVorg: "https://media.bosys.eu/media/uiplus/RSCVG_TCAR.png",
            headline: "Mietwagen",
            icon: "directions_car",
            link: "",
            text: "Mehr Flexibilität für Ausflüge abseits des Hotels – jetzt SUV oder Kompaktklasse sichern und wunderschöne Orte in deiner Urlaubsregion entdecken."
          },
          {
            type: "G002",
            art: "HMRV2",
            grafikMail: "https://media.bosys.eu/media/uiplus/RSC_HMRV2_SYMg_97.png",
            grafikVorg: "https://media.bosys.eu/media/uiplus/RSCVG_HMRV2.png",
            headline: "Reisekrankenversicherung",
            icon: "local_hospital",
            link: "",
            text: "Schutz im Ausland, weltweit gültig – inklusive Rücktransport."
          },
          {
            type: "G013",
            art: "GYGU",
            grafikMail: "https://media.bosys.eu/media/uiplus/RSC_GYGU_SYM_97.png",
            grafikVorg: "https://media.bosys.eu/media/uiplus/RSCVG_GYGU.png",
            headline: "Ausflug Ätna",
            icon: "tour",
            link: "https://www.getyourguide.de?partner_id=123456&cmp=share_to_earn",
            text: "Wanderung und Kraterbesichtigung mit lokaler Reiseleitung."
          },
          {
            type: "G005",
            art: "HEXA",
            grafikMail: "https://media.bosys.eu/media/uiplus/RSC_HEXA_SYMg_97.png",
            grafikVorg: "https://media.bosys.eu/media/uiplus/RSCVG_HEXA.png",
            headline: "Parkplatz",
            icon: "local_parking",
            link: "",
            text: "Sicher und reserviert ab deinem Abflugtag – stressfreie Anreise garantiert."
          },
          {
            type: "G003",
            art: "EINS",
            grafikMail: "https://media.bosys.eu/media/uiplus/RSC_EINS_SYM_97.png",
            grafikVorg: "https://media.bosys.eu/media/uiplus/RSCVG_EINS.png",
            headline: "Einreisebestimmungen",
            icon: "local_police",
            link: "[www.auswaertigesamt.de](https://www.auswaertigesamt.de)",
            text: "Bevor die Reise beginnt, nochmal kurz prüfen, ob alle notwendigen Informationen vorliegen."
          },
          {
            type: "G007",
            art: "WETTER",
            grafikMail: "https://media.bosys.eu/media/uiplus/",
            grafikVorg: "https://media.bosys.eu/media/uiplus/RSCVG_WETTER.png",
            headline: "Wetter",
            icon: "thermostat",
            link: "",
            text: "Wetter Flughafen Catania<table style='width:100%;font-size:12pt;'><tr><td>Mi 16.09.</td><td>29°/19°</td><td>Sonnig</td></tr><tr><td>Do 17.09.</td><td>28°/19°</td><td>Leicht bewölkt</td></tr><tr><td>Fr 18.09.</td><td>27°/18°</td><td>Sonnig</td></tr></table>"
          }
        ]
      },
      Header: {
        TimeStamp: timeStamp,
        Version: "1.0"
      }
    }
  };
}

module.exports = { demoReiseData };
