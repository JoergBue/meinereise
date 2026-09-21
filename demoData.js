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
        // Optional – nur wenn vorhanden, wird die Glocke auf der
        // Startseite aktiv (siehe app.js renderOverview).
        alarm: {
          text: "Ich bin ein Text für die Glocke"
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
        // Reisepreis-Übersicht (siehe view-price/renderPrice in app.js). Preis-
        // Felder (price/RePreis) sind wie travelPrice Ganzzahlen in Eurocent;
        // priceF/priceF1 sind bereits fertig formatierte Varianten (priceF im
        // deutschen "1.234,56"-Format, priceF1 mit Punkt als Dezimaltrennzeichen
        // – bisher unbenutzt in der App, priceF wird angezeigt). RePreis "0"
        // bedeutet: diese Leistung wird direkt beim Veranstalter bezahlt, nicht
        // über das Reisebüro (siehe fmtLeistungPaymentNote()).
        ReiseLeistung: [
          {
            bookingNo: "0000029192",
            startDate: "20261003",
            endEnd: "20261011",
            text: "Sizilien Rundreise",
            price: "245000",
            priceF: "2.450,00",
            priceF1: "2450.00",
            RePreis: "245000",
            status: "BE",
            touroperatorCode: "ALL",
            touroperatorName: "alltours"
          },
          {
            bookingNo: "0000029193",
            startDate: "20261003",
            endEnd: "20261011",
            text: "Parkplatz Frankfurt Flughafen",
            price: "2500",
            priceF: "25,00",
            priceF1: "25.00",
            RePreis: "0",
            status: "BE",
            touroperatorCode: "HEX",
            touroperatorName: "HEX"
          },
          {
            bookingNo: "0000029194",
            startDate: "20261008",
            endEnd: "20261011",
            text: "Mietwagen Fiat 500X oder ähnlich",
            price: "54400",
            priceF: "544,00",
            priceF1: "544.00",
            RePreis: "0",
            status: "BE",
            touroperatorCode: "SCAR",
            touroperatorName: "SCAR"
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
            checkOutDate: "20261008",
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
            type: "C",
            sortDate: "20261006",
            startDate: "20261006",
            endDate: "20261008",
            cruiseShipID: "TCR",
            cruiseShipIDCrs: "MEINSR",
            cruiseShipName: "Mein Schiff Relax",
            cruiseCompany: "TUIC",
            cruiseCabin: "Kabine",
            cruiseCabinCode: "JKCO",
            cruiseCabinName: "Junior Suite Balkon Kat. C",
            cruiseID: "",
            cruiseMeals: "",
            cruiseRoute: "",
            // "day" ist die Differenz zum Abreisedatum (startDate), nicht
            // zum sortDate – siehe app.js cruiseRouteStops().
            cruiseRouteDet: [
              { day: "0", port: "Taormina", arrival: "-1", departure: "1700" },
              { day: "1", port: "Seetag", arrival: "-1", departure: "-1" },
              { day: "2", port: "Palermo", arrival: "800", departure: "1800" }
            ],
            cruiseDiscription: "Tagesausflug mit der \"Mein Schiff Relax\" entlang der sizilianischen Küste – von Taormina bis zu den Liparischen Inseln.<br><br><strong>An Bord:</strong><ul><li>Sonnendeck &amp; Pool</li><li>Mehrere Restaurants &amp; Bars</li></ul>",
            cruisePics: [
              { picLink: "https://i.giatamedia.com/s.php?uid=204387&source=xml&size=640&cid=3959&iid=134567190", type: "Route" },
              { picLink: "https://i.giatamedia.com/s.php?uid=204387&source=xml&size=640&cid=3959&iid=134567191", type: "Route" },
              { picLink: "https://i.giatamedia.com/s.php?uid=204387&source=xml&size=640&cid=3959&iid=134567192", type: "Route" },
              { picLink: "https://i.giatamedia.com/s.php?uid=204387&source=xml&size=640&cid=3959&iid=134567193", type: "Route" }
            ]
          },
          {
            // Rudimentärer Leistungstyp – bisher nur carCategoryClass +
            // pickupDateTime/returnDateTime (14-stellig "JJJJMMDDHHMMSS")
            // geliefert, siehe app.js renderTimelineRow/rentalCarForDay.
            type: "M",
            sortDate: "20261008",
            carCategoryClass: "Mietwagen Fiat 500X oder ähnlich",
            pickupDateTime: "20261008120000",
            returnDateTime: "20261011090000"
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

// Demo-Antwort für GetOffice ("Mein Reisebüro", siehe TODO.md) – stammt
// bereits aus der BOSYS-Sandbox/Testagentur (PreAbn), daher fast 1:1 als
// Demo-Fallback übernommen, statt selbst ausgedacht.
function demoOfficeData() {
  return {
    bns_response: {
      GetOffice: {
        MyBerater: [
          {
            function: "",
            id: "1014",
            image: "https://preabn.bosys.eu//cgi-bin/sucxessbild.cgi?11=1014&12=49103&13=1&14=2",
            mail: "andreas.mueller-teusler@bosys.info",
            name: "Andreas Müller-Teusler",
            phone: "040",
            sort: 1,
            text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. <br><br>Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis,"
          },
          {
            function: "Kunden- u. Anwendungsberatung ",
            id: "1025",
            image: "https://preabn.bosys.eu//cgi-bin/sucxessbild.cgi?11=1025&12=49103&13=1&14=2",
            mail: "franziska.holtermann@bosys.info",
            name: "Franziska Holtermann",
            phone: "",
            sort: 2,
            text: ""
          },
          {
            function: "",
            id: "12345",
            image: "https://preabn.bosys.eu//cgi-bin/sucxessbild.cgi?11=12345&12=49103&13=1&14=2",
            mail: "patrick.steffen@bosys.info",
            name: "Harald Fünfer",
            phone: "",
            sort: 3,
            text: ""
          },
          {
            function: "",
            id: "1002",
            image: "https://preabn.bosys.eu//cgi-bin/sucxessbild.cgi?11=1002&12=49103&13=1&14=2",
            mail: "harun.guerleyik@bosys.info",
            name: "Harun Gürleyik",
            phone: "",
            sort: 4,
            text: ""
          },
          {
            function: "",
            id: "1062",
            image: "https://preabn.bosys.eu//cgi-bin/sucxessbild.cgi?11=1062&12=49103&13=1&14=2",
            mail: "Julian.Boehmer@bosys.info",
            name: "Julian Böhmer",
            phone: "",
            sort: 5,
            text: ""
          },
          {
            function: "",
            id: "1021",
            image: "https://preabn.bosys.eu//cgi-bin/sucxessbild.cgi?11=1021&12=49103&13=1&14=2",
            mail: "joerg.brandt@bosys.info",
            name: "Jörg Brandt",
            phone: "040 2533220",
            sort: 6,
            text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis,"
          },
          {
            function: "Qualitätssicherung / BOSYS",
            id: "1005",
            image: "https://preabn.bosys.eu//cgi-bin/sucxessbild.cgi?11=1005&12=49103&13=1&14=2",
            mail: "karsten.martin@bosys.info",
            name: "Karsten Martin",
            phone: "",
            sort: 7,
            text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis,"
          },
          {
            function: "",
            id: "1015",
            image: "https://preabn.bosys.eu//cgi-bin/sucxessbild.cgi?11=1015&12=49103&13=1&14=2",
            mail: "katharina.beck@bosys.info",
            name: "Katharina Beck",
            phone: "",
            sort: 8,
            text: ""
          },
          {
            function: "Tester",
            id: "1000",
            image: "https://preabn.bosys.eu//cgi-bin/sucxessbild.cgi?11=1000&12=49103&13=1&14=2",
            mail: "mexiko@bosys.info",
            name: "Mexiko Dicker Hund",
            phone: "112",
            sort: 9,
            text: ""
          },
          {
            function: "",
            id: "1017",
            image: "https://preabn.bosys.eu//cgi-bin/sucxessbild.cgi?11=1017&12=49103&13=1&14=2",
            mail: "olaf.galinski@bosys.info",
            name: "Olaf Galinski",
            phone: "",
            sort: 10,
            text: ""
          },
          {
            function: "Qualitätssicherer",
            id: "1013",
            image: "https://preabn.bosys.eu//cgi-bin/sucxessbild.cgi?11=1013&12=49103&13=1&14=2",
            mail: "patrick.steffen@bosys.info",
            name: "Patrick Steffen",
            phone: " 4940278382884",
            sort: 11,
            text: "Lorem ipsum dolor sit amet,<br>consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.<br><br>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.<br>Donec quam felis, ultricies nec, pellentesque eu, pretium quis,"
          },
          {
            function: "",
            id: "1010",
            image: "https://preabn.bosys.eu//cgi-bin/sucxessbild.cgi?11=1010&12=49103&13=1&14=2",
            mail: "bastian.stoppel@bosys.info",
            name: "PreStoppel Basti",
            phone: "",
            sort: 12,
            text: ""
          },
          {
            function: "",
            id: "1024",
            image: "https://preabn.bosys.eu//cgi-bin/sucxessbild.cgi?11=1024&12=49103&13=1&14=2",
            mail: "sebastian.milcarek@bosys.info",
            name: "Sebastian Milcarek",
            phone: "",
            sort: 13,
            text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis,"
          },
          {
            function: "",
            id: "1012",
            image: "https://preabn.bosys.eu//cgi-bin/sucxessbild.cgi?11=1012&12=49103&13=1&14=2",
            mail: "steffen.prinz@bosys.info",
            name: "Steffen Prinz",
            phone: "",
            sort: 14,
            text: ""
          },
          {
            function: "",
            id: "1004",
            image: "https://preabn.bosys.eu//cgi-bin/sucxessbild.cgi?11=1004&12=49103&13=1&14=2",
            mail: "sven.lindow@bosys.info",
            name: "Sven Lindow",
            phone: "",
            sort: 15,
            text: ""
          },
          {
            function: "",
            id: "1026",
            image: "https://preabn.bosys.eu//cgi-bin/sucxessbild.cgi?11=1026&12=49103&13=1&14=2",
            mail: "valerian.leusmann@bosys.info",
            name: "Valerian Leusmann",
            phone: "",
            sort: 16,
            text: ""
          }
        ],
        MyData: { number: 0 },
        MyHolidays: { number: 0 },
        MyOffers: { Offers: [] },
        MyOffice: {
          Day1From1: "09:30",
          Day1From2: "",
          Day1To1: "19:00",
          Day1To2: "",
          Day2From1: "",
          Day2From2: "",
          Day2To1: "",
          Day2To2: "",
          Day3From1: "09:30",
          Day3From2: "",
          Day3To1: "19:00",
          Day3To2: "",
          Day4From1: "09:30",
          Day4From2: "",
          Day4To1: "20:00",
          Day4To2: "",
          Day5From1: "09:30",
          Day5From2: "",
          Day5To1: "19:00",
          Day5To2: "",
          Day6From1: "09:30",
          Day6From2: "",
          Day6To1: "14:30",
          Day6To2: "",
          Day7From1: "",
          Day7From2: "",
          Day7To1: "",
          Day7To2: "",
          MultipleOffice: 0,
          adresse: "<p><strong>Testagentur Bosys (PreAbn)</strong><br>Normannenweg 28<br>DE 20537 Hamburg<br>Tel.: +49 40 25 33 22 02<br>Fax.: +49 40 25 33 22 499<br>Mail: karsten.martin@bosys.info<br>Internet: https://www.bosys.info</p>",
          code: "20537",
          companyID: "049998103",
          facebook: "[www.facebook.com/bosys](https://www.facebook.com/bosys)",
          header: "Testagentur Bosys 2.2",
          impressum: "<p>BOSYS Software GmbH<br>Normannenweg 28<br>DE 20537 Hamburg</p><p>Tel.: 49 (0)40 &ndash; 25 33 22 &ndash; 0<br>Fax: 49 (0)40 &ndash; 25 33 22 &ndash; 499</p><p>Unternehmenswebseite: [www.bosys.info](https://www.bosys.info)<br>E-Mail: info@bosys.info</p><p>Gesch&auml;ftsf&uuml;hrung: Burkhard Lindow, J&ouml;rg B&uuml;nning</p><p>Handelsregisternummer &ndash; Amtsgericht Hamburg &ndash; eingetragen unter HRB 107083<br>Umsatzsteueridentifikationsnummer: DE 227572951<br>Inhaltlich Verantwortlicher nach &sect; 55 Abs. 2 RStV: Burkhard Lindow, Anschrift s.o.</p><p>&nbsp;</p><p>Dieses Dokument kommt aus Firmenstamm/B&uuml;ros/Online-Impressum</p>",
          instagramm: "[www.instagram.com/profile/bosys](https://www.instagram.com/profile/bosys)",
          land: "DE",
          latitude: "53.5509291",
          logoset: "bosys",
          longitude: "10.0305885",
          mail: "karsten.martin@bosys.info",
          name: "Testagentur Bosys (PreAbn)",
          name2: "",
          openingadd: "Zusätzliche Beratungstermine nach Vereinbarung",
          owner: "Karsten Martin",
          phone: "+49 40 25 33 22 02",
          place: "Hamburg",
          street: "Normannenweg 28",
          subDomain: "360travel",
          teampic: "https://preabn.bosys.eu//cgi-bin/sucxessbild.cgi?11=0&12=49103&13=1&14=3",
          teamtext: "<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula,</p><p>&nbsp;</p><p>Das k&ouml;nnte eine Beschreibung sein</p><p><a href=\"http://www.bosys.info\">http://www.bosys.info</a></p>",
          // tiktok bewusst leer wie im echten Beispiel – testet, dass ein
          // fehlendes Social-Feld korrekt kein Icon rendert (siehe
          // officeSocialLinks() in app.js).
          tiktok: "",
          titleOffers: "Meine Angebote",
          titleOffice: "Mein Reisebüro",
          // whatsapp: natives GetOffice-Feld, ein fertiger wa.me-Link – wenn
          // vorhanden, gilt WhatsApp laut Vorgabe als möglich (siehe
          // renderOffice()/whatsappUrlFromLink() in app.js). Ersetzt die
          // frühere Rate-Logik über MyOffice.phone.
          whatsapp: "https://wa.me/491510",
          www: "https://www.bosys.info",
          youtube: "[www.bosys.info](https://www.bosys.info)",
          zoom: "1.000"
        },
        Session: { sessionID: "" }
      },
      Header: {
        TimeStamp: "",
        Version: "1.01"
      }
    }
  };
}

// "In der Nähe" (Google Places, siehe TODO.md / server.js handlePlaces) –
// lat/lon werden hier bewusst nicht ausgewertet (anders als bei einem
// echten Places-Aufruf): es sind feste Beispielorte rund um Taormina, damit
// sich die Demo-Reise durchgängig konsistent anfühlt, ohne selbst eine
// Nähe-Suche nachzubauen.
function demoPlacesData(lat, lon) {
  return {
    restaurants: [
      { name: "Trattoria da Nino", rating: 4.6, ratingCount: 812, typeLabel: "Italienisches Restaurant", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Trattoria+da+Nino+Taormina" },
      { name: "Ristorante Bella Vista", rating: 4.4, ratingCount: 1203, typeLabel: "Restaurant", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Ristorante+Bella+Vista+Taormina" },
      { name: "Pizzeria Etna", rating: 4.3, ratingCount: 540, typeLabel: "Pizzeria", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pizzeria+Etna+Taormina" }
    ],
    attractions: [
      { name: "Teatro Antico di Taormina", rating: 4.7, ratingCount: 24500, typeLabel: "Sehenswürdigkeit", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Teatro+Antico+di+Taormina" },
      { name: "Isola Bella", rating: 4.6, ratingCount: 18700, typeLabel: "Naturschutzgebiet", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Isola+Bella+Taormina" },
      { name: "Giardini della Villa Comunale", rating: 4.5, ratingCount: 6100, typeLabel: "Park", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Giardini+della+Villa+Comunale+Taormina" }
    ]
  };
}

module.exports = { demoReiseData, demoOfficeData, demoPlacesData };
