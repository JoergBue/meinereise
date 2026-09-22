// MeineReise – Mehrsprachigkeit.
//
// Übersetzt AUSSCHLIESSLICH die selbst generierten Texte der App (Labels,
// Buttons, Überschriften, Statusnamen). Von BOSYS gelieferte Inhalte
// (ReiseGrund.travelTitle, hotel discription, Zusatzleistungen-"text" usw.)
// werden NICHT verändert und bleiben so, wie GetReiseData sie liefert.
//
// Einzige Ausnahme: die Titel der Zusatzleistungen (ZusatzLeistung[].headline,
// z.B. "Mietwagen") werden anhand des Angebots-Typs (type, ein "G0xx"-Code)
// übersetzt – die Headline ist pro Code laut Vorgabe immer identisch, siehe
// OFFER_TYPE_LABELS weiter unten und offerTitle() in app.js. Für Codes ohne
// hinterlegte Übersetzung bleibt die Original-Headline (Deutsch) stehen,
// damit nie ein falscher/erfundener Titel angezeigt wird.
//
// Bewusst ohne externe i18n-Bibliothek (passt zur Philosophie der App: keine
// Abhängigkeiten) – ein einfaches Wörterbuch pro Sprache plus t()/tCount().

(function () {
  "use strict";

  const SUPPORTED_LANGS = ["de", "en", "fr", "it", "tr", "el"];
  const DEFAULT_LANG = "de";

  // Für Intl.DateTimeFormat/NumberFormat (Datums-/Zahlenformate).
  const LOCALE_TAGS = {
    de: "de-DE", en: "en-GB", fr: "fr-FR", it: "it-IT", tr: "tr-TR", el: "el-GR"
  };

  const LANG_NAMES = {
    de: "Deutsch", en: "English", fr: "Français", it: "Italiano", tr: "Türkçe", el: "Ελληνικά"
  };

  // ---------- UI-Wörterbuch ----------
  //
  // {platzhalter}-Syntax für Werte, die zur Laufzeit eingesetzt werden
  // (siehe t()). Reines Chrome der App – keine Reisedaten.

  const TRANSLATIONS = {
    de: {
      "overview.welcomeBack": "Willkommen zurück",
      "overview.yourTrip": "Deine Reise",
      "overview.showAlert": "Meldung anzeigen",
      "overview.close": "Schließen",
      "overview.daysLeftOne": "Noch 1 Tag",
      "overview.daysLeftMany": "Noch {n} Tage",
      "overview.tripOngoing": "Reise läuft",
      "overview.tripEnded": "Reise beendet",
      "overview.nightsOne": "1 Nacht",
      "overview.nightsMany": "{n} Nächte",
      "overview.travelers": "{n} Personen",
      "overview.mediatedBy": "Vermittelt durch {name}, {address}",
      "overview.viewPlan": "Reiseplan ansehen",
      "overview.recommendedForYou": "Für dich empfohlen",
      "overview.seeAll": "Alle ansehen",

      "verlaufType.F": "Flug",
      "verlaufType.H": "Hotel",
      "verlaufType.T": "Transfer",
      "verlaufType.M": "Mietwagen",
      "verlaufType.C": "Kreuzfahrt",
      "verlaufType.V": "Versicherung",
      "verlaufType.S": "Sonstiges",

      "install.appTitle": "App installieren",
      "install.appDesc": "Schneller Zugriff auf deinen Reiseplan direkt vom Home-Bildschirm.",
      "install.appBtn": "Installieren",
      "install.iosTitle": "Zum Home-Bildschirm hinzufügen",
      "install.iosDesc": "Tippe unten auf {shareIcon} „Teilen“ und dann auf „Zum Home-Bildschirm“.",
      "install.close": "Schließen",

      "places.nearby": "In der Nähe",
      "places.loading": "Wird geladen …",
      "places.loadError": "Empfehlungen konnten gerade nicht geladen werden.",
      "places.restaurants": "Restaurants",
      "places.attractions": "Sehenswürdigkeiten",

      "plan.title": "Reiseplan",
      "plan.seaDay": "Seetag",
      "plan.inPort": "Im Hafen: {port}",
      "plan.at": "an {time}",
      "plan.from": "ab {time}",
      "plan.toCruise": "Zur Kreuzfahrt",
      "plan.stayingAt": "Du bist im {hotel}",
      "plan.hotelFallback": "Hotel",
      "plan.noFixedProgram": "Kein festes Programm an diesem Tag",
      "plan.rentalCarOnTheWay": "Mietwagen unterwegs",
      "plan.noProgramToday": "Für diesen Tag sind keine Programmpunkte hinterlegt.",
      "plan.suitableToday": "Passend für heute",
      "plan.outboundFlight": "Hinflug",
      "plan.returnFlight": "Rückflug",
      "plan.checkIn": "Check-in · {hotel}",
      "plan.transfer": "Transfer",
      "plan.pickupCar": "Abholung Mietwagen",
      "plan.returnCar": "Rückgabe Mietwagen",
      "plan.cruiseLine": "Kreuzfahrt · {ship}",
      "plan.insurance": "Versicherung",
      "plan.portFallback": "Hafen",
      "plan.routePlan": "Routenplan",

      "hotel.back": "Zurück zum Reiseplan",
      "hotel.noHotelSelected": "Kein Hotel ausgewählt.",
      "hotel.noCruiseSelected": "Keine Kreuzfahrt ausgewählt.",
      "hotel.hotelFallback": "Hotel",
      "hotel.cruiseFallback": "Kreuzfahrt",
      "hotel.mapTitle": "Lage des Hotels",
      "hotel.openInOSM": "In OpenStreetMap öffnen",
      "hotel.more": "weitere",

      "offers.title": "Zusatzleistungen",
      "offers.subtitle": "Mehr aus deiner Reise machen",
      "offers.filterAll": "Alle",
      "offers.filterCarRental": "Mietwagen",
      "offers.filterInsurance": "Versicherung",
      "offers.filterExcursions": "Ausflüge",
      "offers.filterOther": "Weitere",
      "offers.readMore": "Mehr erfahren",
      "offers.noneInCategory": "Keine Angebote in dieser Kategorie.",
      "offers.weatherFallback": "Wetter",

      "docs.title": "Dokumente",
      "docs.countOne": "1 Reisedokument",
      "docs.countMany": "{n} Reisedokumente",
      "docs.createdOn": "Erstellt am {date}",
      "docs.loading": "Wird geladen …",
      "docs.unknownFormat": "Dokument-Antwort in unbekanntem Format erhalten.",
      "docs.loadError": "Dokument konnte nicht geladen werden.",
      "docs.fallback": "Dokument",

      "office.loadError": "Reisebüro-Daten konnten nicht geladen werden.",
      "office.fallback": "Mein Reisebüro",
      "office.website": "Website",
      "office.contactWhatsapp": "Per WhatsApp kontaktieren",
      "office.openingHours": "Öffnungszeiten",
      "office.closed": "geschlossen",
      "office.team": "Ihre Ansprechpartner",
      "office.whatsapp": "WhatsApp",
      "office.dow1": "Montag", "office.dow2": "Dienstag", "office.dow3": "Mittwoch",
      "office.dow4": "Donnerstag", "office.dow5": "Freitag", "office.dow6": "Samstag", "office.dow7": "Sonntag",
      "office.whatsappMessage": "Hallo, ich habe eine Frage zu meiner Reise{title} ({ref}).",
      "office.whatsappMessageNoRef": "Hallo, ich habe eine Frage zu meiner Reise{title}.",
      "office.travelRefLabel": "Reise-Nr. {ref}",

      "price.title": "Reisepreis",
      "price.itemOne": "1 Buchungsposition",
      "price.itemMany": "{n} Buchungspositionen",
      "price.statusOF": "Offen", "price.statusBE": "Bestätigt", "price.statusOP": "Option", "price.statusST": "Storniert",
      "price.payToAgency": "An Reisebüro zu zahlen: {amount}",
      "price.payDirectToOperator": "Direkt an Veranstalter{operator} zu zahlen",
      "price.summary": "Zusammenfassung",
      "price.totalToAgency": "An Reisebüro zu zahlen",
      "price.totalToOperator": "Direkt an Veranstalter zu zahlen",
      "price.total": "Gesamtsumme",
      "price.noData": "Keine Preisdaten vorhanden.",

      "nav.overview": "Start",
      "nav.plan": "Reiseplan",
      "nav.offers": "Angebote",
      "nav.docs": "Dokumente",
      "nav.price": "Reisepreis",
      "nav.office": "Mein Reisebüro",

      "app.loading": "Reise wird geladen …",
      "app.demoNotice": "Demo-Daten – keine Live-Anbindung konfiguriert",
      "app.noTravelId": "Keine travelID übergeben. Aufruf-Format: {example}",
      "app.loadError": "Reisedaten konnten nicht geladen werden: {message}",
      "app.language": "Sprache",

      "dow0": "SO", "dow1": "MO", "dow2": "DI", "dow3": "MI", "dow4": "DO", "dow5": "FR", "dow6": "SA"
    },

    en: {
      "overview.welcomeBack": "Welcome back",
      "overview.yourTrip": "Your trip",
      "overview.showAlert": "Show notice",
      "overview.close": "Close",
      "overview.daysLeftOne": "1 day to go",
      "overview.daysLeftMany": "{n} days to go",
      "overview.tripOngoing": "Trip in progress",
      "overview.tripEnded": "Trip finished",
      "overview.nightsOne": "1 night",
      "overview.nightsMany": "{n} nights",
      "overview.travelers": "{n} travelers",
      "overview.mediatedBy": "Booked through {name}, {address}",
      "overview.viewPlan": "View itinerary",
      "overview.recommendedForYou": "Recommended for you",
      "overview.seeAll": "See all",

      "verlaufType.F": "Flight",
      "verlaufType.H": "Hotel",
      "verlaufType.T": "Transfer",
      "verlaufType.M": "Rental car",
      "verlaufType.C": "Cruise",
      "verlaufType.V": "Insurance",
      "verlaufType.S": "Other",

      "install.appTitle": "Install app",
      "install.appDesc": "Quicker access to your itinerary right from your home screen.",
      "install.appBtn": "Install",
      "install.iosTitle": "Add to Home Screen",
      "install.iosDesc": "Tap {shareIcon} “Share” below, then “Add to Home Screen”.",
      "install.close": "Close",

      "places.nearby": "Nearby",
      "places.loading": "Loading …",
      "places.loadError": "Recommendations couldn't be loaded right now.",
      "places.restaurants": "Restaurants",
      "places.attractions": "Attractions",

      "plan.title": "Itinerary",
      "plan.seaDay": "Day at sea",
      "plan.inPort": "In port: {port}",
      "plan.at": "arrives {time}",
      "plan.from": "departs {time}",
      "plan.toCruise": "Go to cruise",
      "plan.stayingAt": "You're staying at {hotel}",
      "plan.hotelFallback": "Hotel",
      "plan.noFixedProgram": "No fixed plans for this day",
      "plan.rentalCarOnTheWay": "Rental car in use",
      "plan.noProgramToday": "No activities are scheduled for this day.",
      "plan.suitableToday": "Recommended for today",
      "plan.outboundFlight": "Outbound flight",
      "plan.returnFlight": "Return flight",
      "plan.checkIn": "Check-in · {hotel}",
      "plan.transfer": "Transfer",
      "plan.pickupCar": "Rental car pickup",
      "plan.returnCar": "Rental car return",
      "plan.cruiseLine": "Cruise · {ship}",
      "plan.insurance": "Insurance",
      "plan.portFallback": "Port",
      "plan.routePlan": "Route",

      "hotel.back": "Back to itinerary",
      "hotel.noHotelSelected": "No hotel selected.",
      "hotel.noCruiseSelected": "No cruise selected.",
      "hotel.hotelFallback": "Hotel",
      "hotel.cruiseFallback": "Cruise",
      "hotel.mapTitle": "Hotel location",
      "hotel.openInOSM": "Open in OpenStreetMap",
      "hotel.more": "more",

      "offers.title": "Add-ons",
      "offers.subtitle": "Get more out of your trip",
      "offers.filterAll": "All",
      "offers.filterCarRental": "Rental car",
      "offers.filterInsurance": "Insurance",
      "offers.filterExcursions": "Excursions",
      "offers.filterOther": "Other",
      "offers.readMore": "Learn more",
      "offers.noneInCategory": "No offers in this category.",
      "offers.weatherFallback": "Weather",

      "docs.title": "Documents",
      "docs.countOne": "1 travel document",
      "docs.countMany": "{n} travel documents",
      "docs.createdOn": "Created on {date}",
      "docs.loading": "Loading …",
      "docs.unknownFormat": "Document response received in an unknown format.",
      "docs.loadError": "The document couldn't be loaded.",
      "docs.fallback": "Document",

      "office.loadError": "Travel agency details couldn't be loaded.",
      "office.fallback": "My travel agency",
      "office.website": "Website",
      "office.contactWhatsapp": "Contact via WhatsApp",
      "office.openingHours": "Opening hours",
      "office.closed": "closed",
      "office.team": "Your contacts",
      "office.whatsapp": "WhatsApp",
      "office.dow1": "Monday", "office.dow2": "Tuesday", "office.dow3": "Wednesday",
      "office.dow4": "Thursday", "office.dow5": "Friday", "office.dow6": "Saturday", "office.dow7": "Sunday",
      "office.whatsappMessage": "Hello, I have a question about my trip{title} ({ref}).",
      "office.whatsappMessageNoRef": "Hello, I have a question about my trip{title}.",
      "office.travelRefLabel": "booking no. {ref}",

      "price.title": "Trip price",
      "price.itemOne": "1 booked item",
      "price.itemMany": "{n} booked items",
      "price.statusOF": "Open", "price.statusBE": "Confirmed", "price.statusOP": "Option", "price.statusST": "Cancelled",
      "price.payToAgency": "Payable to travel agency: {amount}",
      "price.payDirectToOperator": "Payable directly to the operator{operator}",
      "price.summary": "Summary",
      "price.totalToAgency": "Payable to travel agency",
      "price.totalToOperator": "Payable directly to operator",
      "price.total": "Total",
      "price.noData": "No price data available.",

      "nav.overview": "Home",
      "nav.plan": "Itinerary",
      "nav.offers": "Add-ons",
      "nav.docs": "Documents",
      "nav.price": "Price",
      "nav.office": "My Agency",

      "app.loading": "Loading your trip …",
      "app.demoNotice": "Demo data – no live connection configured",
      "app.noTravelId": "No travelID provided. Call format: {example}",
      "app.loadError": "The trip data couldn't be loaded: {message}",
      "app.language": "Language",

      "dow0": "SU", "dow1": "MO", "dow2": "TU", "dow3": "WE", "dow4": "TH", "dow5": "FR", "dow6": "SA"
    },

    fr: {
      "overview.welcomeBack": "Bon retour",
      "overview.yourTrip": "Votre voyage",
      "overview.showAlert": "Afficher le message",
      "overview.close": "Fermer",
      "overview.daysLeftOne": "Encore 1 jour",
      "overview.daysLeftMany": "Encore {n} jours",
      "overview.tripOngoing": "Voyage en cours",
      "overview.tripEnded": "Voyage terminé",
      "overview.nightsOne": "1 nuit",
      "overview.nightsMany": "{n} nuits",
      "overview.travelers": "{n} personnes",
      "overview.mediatedBy": "Réservé via {name}, {address}",
      "overview.viewPlan": "Voir l'itinéraire",
      "overview.recommendedForYou": "Recommandé pour vous",
      "overview.seeAll": "Tout voir",

      "verlaufType.F": "Vol",
      "verlaufType.H": "Hôtel",
      "verlaufType.T": "Transfert",
      "verlaufType.M": "Location de voiture",
      "verlaufType.C": "Croisière",
      "verlaufType.V": "Assurance",
      "verlaufType.S": "Autre",

      "install.appTitle": "Installer l'application",
      "install.appDesc": "Accédez plus vite à votre itinéraire depuis l'écran d'accueil.",
      "install.appBtn": "Installer",
      "install.iosTitle": "Ajouter à l'écran d'accueil",
      "install.iosDesc": "Appuyez en bas sur {shareIcon} « Partager », puis sur « Sur l'écran d'accueil ».",
      "install.close": "Fermer",

      "places.nearby": "À proximité",
      "places.loading": "Chargement …",
      "places.loadError": "Impossible de charger les recommandations pour le moment.",
      "places.restaurants": "Restaurants",
      "places.attractions": "Sites à découvrir",

      "plan.title": "Itinéraire",
      "plan.seaDay": "Journée en mer",
      "plan.inPort": "Au port : {port}",
      "plan.at": "arrivée à {time}",
      "plan.from": "départ à {time}",
      "plan.toCruise": "Voir la croisière",
      "plan.stayingAt": "Vous logez à {hotel}",
      "plan.hotelFallback": "Hôtel",
      "plan.noFixedProgram": "Aucun programme prévu ce jour-là",
      "plan.rentalCarOnTheWay": "Location de voiture en cours",
      "plan.noProgramToday": "Aucune activité n'est prévue pour ce jour.",
      "plan.suitableToday": "Recommandé pour aujourd'hui",
      "plan.outboundFlight": "Vol aller",
      "plan.returnFlight": "Vol retour",
      "plan.checkIn": "Arrivée · {hotel}",
      "plan.transfer": "Transfert",
      "plan.pickupCar": "Prise en charge du véhicule",
      "plan.returnCar": "Restitution du véhicule",
      "plan.cruiseLine": "Croisière · {ship}",
      "plan.insurance": "Assurance",
      "plan.portFallback": "Port",
      "plan.routePlan": "Itinéraire de croisière",

      "hotel.back": "Retour à l'itinéraire",
      "hotel.noHotelSelected": "Aucun hôtel sélectionné.",
      "hotel.noCruiseSelected": "Aucune croisière sélectionnée.",
      "hotel.hotelFallback": "Hôtel",
      "hotel.cruiseFallback": "Croisière",
      "hotel.mapTitle": "Emplacement de l'hôtel",
      "hotel.openInOSM": "Ouvrir dans OpenStreetMap",
      "hotel.more": "de plus",

      "offers.title": "Prestations complémentaires",
      "offers.subtitle": "Profitez encore plus de votre voyage",
      "offers.filterAll": "Toutes",
      "offers.filterCarRental": "Location de voiture",
      "offers.filterInsurance": "Assurance",
      "offers.filterExcursions": "Excursions",
      "offers.filterOther": "Autres",
      "offers.readMore": "En savoir plus",
      "offers.noneInCategory": "Aucune offre dans cette catégorie.",
      "offers.weatherFallback": "Météo",

      "docs.title": "Documents",
      "docs.countOne": "1 document de voyage",
      "docs.countMany": "{n} documents de voyage",
      "docs.createdOn": "Créé le {date}",
      "docs.loading": "Chargement …",
      "docs.unknownFormat": "Réponse du document reçue dans un format inconnu.",
      "docs.loadError": "Le document n'a pas pu être chargé.",
      "docs.fallback": "Document",

      "office.loadError": "Les informations de l'agence n'ont pas pu être chargées.",
      "office.fallback": "Mon agence de voyages",
      "office.website": "Site web",
      "office.contactWhatsapp": "Contacter par WhatsApp",
      "office.openingHours": "Horaires d'ouverture",
      "office.closed": "fermé",
      "office.team": "Vos interlocuteurs",
      "office.whatsapp": "WhatsApp",
      "office.dow1": "Lundi", "office.dow2": "Mardi", "office.dow3": "Mercredi",
      "office.dow4": "Jeudi", "office.dow5": "Vendredi", "office.dow6": "Samedi", "office.dow7": "Dimanche",
      "office.whatsappMessage": "Bonjour, j'ai une question concernant mon voyage{title} ({ref}).",
      "office.whatsappMessageNoRef": "Bonjour, j'ai une question concernant mon voyage{title}.",
      "office.travelRefLabel": "n° de dossier {ref}",

      "price.title": "Prix du voyage",
      "price.itemOne": "1 prestation réservée",
      "price.itemMany": "{n} prestations réservées",
      "price.statusOF": "Ouvert", "price.statusBE": "Confirmé", "price.statusOP": "Option", "price.statusST": "Annulé",
      "price.payToAgency": "À régler à l'agence : {amount}",
      "price.payDirectToOperator": "À régler directement à l'organisateur{operator}",
      "price.summary": "Récapitulatif",
      "price.totalToAgency": "À régler à l'agence",
      "price.totalToOperator": "À régler directement à l'organisateur",
      "price.total": "Total",
      "price.noData": "Aucune donnée de prix disponible.",

      "nav.overview": "Accueil",
      "nav.plan": "Itinéraire",
      "nav.offers": "Offres",
      "nav.docs": "Documents",
      "nav.price": "Prix",
      "nav.office": "Mon agence",

      "app.loading": "Chargement du voyage …",
      "app.demoNotice": "Données de démonstration – aucune connexion en direct configurée",
      "app.noTravelId": "Aucun travelID transmis. Format d'appel : {example}",
      "app.loadError": "Les données du voyage n'ont pas pu être chargées : {message}",
      "app.language": "Langue",

      "dow0": "DI", "dow1": "LU", "dow2": "MA", "dow3": "ME", "dow4": "JE", "dow5": "VE", "dow6": "SA"
    },

    it: {
      "overview.welcomeBack": "Bentornato/a",
      "overview.yourTrip": "Il tuo viaggio",
      "overview.showAlert": "Mostra avviso",
      "overview.close": "Chiudi",
      "overview.daysLeftOne": "Manca 1 giorno",
      "overview.daysLeftMany": "Mancano {n} giorni",
      "overview.tripOngoing": "Viaggio in corso",
      "overview.tripEnded": "Viaggio concluso",
      "overview.nightsOne": "1 notte",
      "overview.nightsMany": "{n} notti",
      "overview.travelers": "{n} persone",
      "overview.mediatedBy": "Prenotato tramite {name}, {address}",
      "overview.viewPlan": "Vedi l'itinerario",
      "overview.recommendedForYou": "Consigliato per te",
      "overview.seeAll": "Vedi tutti",

      "verlaufType.F": "Volo",
      "verlaufType.H": "Hotel",
      "verlaufType.T": "Transfer",
      "verlaufType.M": "Autonoleggio",
      "verlaufType.C": "Crociera",
      "verlaufType.V": "Assicurazione",
      "verlaufType.S": "Altro",

      "install.appTitle": "Installa l'app",
      "install.appDesc": "Accesso più rapido al tuo itinerario direttamente dalla schermata Home.",
      "install.appBtn": "Installa",
      "install.iosTitle": "Aggiungi alla schermata Home",
      "install.iosDesc": "Tocca {shareIcon} \"Condividi\" in basso, poi \"Aggiungi a Home\".",
      "install.close": "Chiudi",

      "places.nearby": "Nelle vicinanze",
      "places.loading": "Caricamento …",
      "places.loadError": "Al momento non è possibile caricare i consigli.",
      "places.restaurants": "Ristoranti",
      "places.attractions": "Attrazioni",

      "plan.title": "Itinerario",
      "plan.seaDay": "Giorno in mare",
      "plan.inPort": "In porto: {port}",
      "plan.at": "arrivo alle {time}",
      "plan.from": "partenza alle {time}",
      "plan.toCruise": "Vai alla crociera",
      "plan.stayingAt": "Alloggi presso {hotel}",
      "plan.hotelFallback": "Hotel",
      "plan.noFixedProgram": "Nessun programma fisso per questo giorno",
      "plan.rentalCarOnTheWay": "Auto a noleggio in uso",
      "plan.noProgramToday": "Per questo giorno non sono previste attività.",
      "plan.suitableToday": "Consigliato per oggi",
      "plan.outboundFlight": "Volo di andata",
      "plan.returnFlight": "Volo di ritorno",
      "plan.checkIn": "Check-in · {hotel}",
      "plan.transfer": "Transfer",
      "plan.pickupCar": "Ritiro auto a noleggio",
      "plan.returnCar": "Riconsegna auto a noleggio",
      "plan.cruiseLine": "Crociera · {ship}",
      "plan.insurance": "Assicurazione",
      "plan.portFallback": "Porto",
      "plan.routePlan": "Itinerario di viaggio",

      "hotel.back": "Torna all'itinerario",
      "hotel.noHotelSelected": "Nessun hotel selezionato.",
      "hotel.noCruiseSelected": "Nessuna crociera selezionata.",
      "hotel.hotelFallback": "Hotel",
      "hotel.cruiseFallback": "Crociera",
      "hotel.mapTitle": "Posizione dell'hotel",
      "hotel.openInOSM": "Apri in OpenStreetMap",
      "hotel.more": "altre",

      "offers.title": "Servizi aggiuntivi",
      "offers.subtitle": "Scopri di più dal tuo viaggio",
      "offers.filterAll": "Tutti",
      "offers.filterCarRental": "Autonoleggio",
      "offers.filterInsurance": "Assicurazione",
      "offers.filterExcursions": "Escursioni",
      "offers.filterOther": "Altro",
      "offers.readMore": "Scopri di più",
      "offers.noneInCategory": "Nessuna offerta in questa categoria.",
      "offers.weatherFallback": "Meteo",

      "docs.title": "Documenti",
      "docs.countOne": "1 documento di viaggio",
      "docs.countMany": "{n} documenti di viaggio",
      "docs.createdOn": "Creato il {date}",
      "docs.loading": "Caricamento …",
      "docs.unknownFormat": "Risposta del documento ricevuta in un formato sconosciuto.",
      "docs.loadError": "Non è stato possibile caricare il documento.",
      "docs.fallback": "Documento",

      "office.loadError": "Non è stato possibile caricare i dati dell'agenzia.",
      "office.fallback": "La mia agenzia di viaggi",
      "office.website": "Sito web",
      "office.contactWhatsapp": "Contatta su WhatsApp",
      "office.openingHours": "Orari di apertura",
      "office.closed": "chiuso",
      "office.team": "I tuoi referenti",
      "office.whatsapp": "WhatsApp",
      "office.dow1": "Lunedì", "office.dow2": "Martedì", "office.dow3": "Mercoledì",
      "office.dow4": "Giovedì", "office.dow5": "Venerdì", "office.dow6": "Sabato", "office.dow7": "Domenica",
      "office.whatsappMessage": "Ciao, ho una domanda sul mio viaggio{title} ({ref}).",
      "office.whatsappMessageNoRef": "Ciao, ho una domanda sul mio viaggio{title}.",
      "office.travelRefLabel": "n. pratica {ref}",

      "price.title": "Prezzo del viaggio",
      "price.itemOne": "1 voce prenotata",
      "price.itemMany": "{n} voci prenotate",
      "price.statusOF": "Aperto", "price.statusBE": "Confermato", "price.statusOP": "Opzione", "price.statusST": "Annullato",
      "price.payToAgency": "Da pagare all'agenzia: {amount}",
      "price.payDirectToOperator": "Da pagare direttamente all'operatore{operator}",
      "price.summary": "Riepilogo",
      "price.totalToAgency": "Da pagare all'agenzia",
      "price.totalToOperator": "Da pagare direttamente all'operatore",
      "price.total": "Totale",
      "price.noData": "Nessun dato sul prezzo disponibile.",

      "nav.overview": "Home",
      "nav.plan": "Itinerario",
      "nav.offers": "Servizi",
      "nav.docs": "Documenti",
      "nav.price": "Prezzo",
      "nav.office": "Agenzia",

      "app.loading": "Caricamento del viaggio …",
      "app.demoNotice": "Dati demo – nessuna connessione live configurata",
      "app.noTravelId": "Nessun travelID fornito. Formato: {example}",
      "app.loadError": "Non è stato possibile caricare i dati del viaggio: {message}",
      "app.language": "Lingua",

      "dow0": "DO", "dow1": "LU", "dow2": "MA", "dow3": "ME", "dow4": "GI", "dow5": "VE", "dow6": "SA"
    },

    tr: {
      "overview.welcomeBack": "Tekrar hoş geldin",
      "overview.yourTrip": "Seyahatin",
      "overview.showAlert": "Bildirimi göster",
      "overview.close": "Kapat",
      "overview.daysLeftOne": "{n} gün kaldı",
      "overview.daysLeftMany": "{n} gün kaldı",
      "overview.tripOngoing": "Seyahat devam ediyor",
      "overview.tripEnded": "Seyahat sona erdi",
      "overview.nightsOne": "{n} gece",
      "overview.nightsMany": "{n} gece",
      "overview.travelers": "{n} kişi",
      "overview.mediatedBy": "{name} aracılığıyla ayırtıldı, {address}",
      "overview.viewPlan": "Seyahat planını gör",
      "overview.recommendedForYou": "Sana özel öneriler",
      "overview.seeAll": "Tümünü gör",

      "verlaufType.F": "Uçuş",
      "verlaufType.H": "Otel",
      "verlaufType.T": "Transfer",
      "verlaufType.M": "Kiralık araç",
      "verlaufType.C": "Kruvaziyer",
      "verlaufType.V": "Sigorta",
      "verlaufType.S": "Diğer",

      "install.appTitle": "Uygulamayı yükle",
      "install.appDesc": "Seyahat planına ana ekrandan daha hızlı eriş.",
      "install.appBtn": "Yükle",
      "install.iosTitle": "Ana Ekrana Ekle",
      "install.iosDesc": "Aşağıdan {shareIcon} \"Paylaş\" simgesine, ardından \"Ana Ekrana Ekle\"ye dokun.",
      "install.close": "Kapat",

      "places.nearby": "Yakınında",
      "places.loading": "Yükleniyor …",
      "places.loadError": "Öneriler şu anda yüklenemedi.",
      "places.restaurants": "Restoranlar",
      "places.attractions": "Gezilecek yerler",

      "plan.title": "Seyahat planı",
      "plan.seaDay": "Denizde gün",
      "plan.inPort": "Limanda: {port}",
      "plan.at": "varış {time}",
      "plan.from": "kalkış {time}",
      "plan.toCruise": "Kruvaziyere git",
      "plan.stayingAt": "{hotel} otelinde kalıyorsun",
      "plan.hotelFallback": "Otel",
      "plan.noFixedProgram": "Bu gün için planlanmış bir program yok",
      "plan.rentalCarOnTheWay": "Kiralık araç kullanımda",
      "plan.noProgramToday": "Bu gün için planlanmış bir etkinlik yok.",
      "plan.suitableToday": "Bugün için öneriler",
      "plan.outboundFlight": "Gidiş uçuşu",
      "plan.returnFlight": "Dönüş uçuşu",
      "plan.checkIn": "Giriş · {hotel}",
      "plan.transfer": "Transfer",
      "plan.pickupCar": "Kiralık araç teslim alma",
      "plan.returnCar": "Kiralık araç iade",
      "plan.cruiseLine": "Kruvaziyer · {ship}",
      "plan.insurance": "Sigorta",
      "plan.portFallback": "Liman",
      "plan.routePlan": "Rota planı",

      "hotel.back": "Seyahat planına dön",
      "hotel.noHotelSelected": "Otel seçilmedi.",
      "hotel.noCruiseSelected": "Kruvaziyer seçilmedi.",
      "hotel.hotelFallback": "Otel",
      "hotel.cruiseFallback": "Kruvaziyer",
      "hotel.mapTitle": "Otelin konumu",
      "hotel.openInOSM": "OpenStreetMap'te aç",
      "hotel.more": "daha",

      "offers.title": "Ek hizmetler",
      "offers.subtitle": "Seyahatinden daha fazlasını al",
      "offers.filterAll": "Tümü",
      "offers.filterCarRental": "Kiralık araç",
      "offers.filterInsurance": "Sigorta",
      "offers.filterExcursions": "Turlar",
      "offers.filterOther": "Diğer",
      "offers.readMore": "Daha fazla bilgi",
      "offers.noneInCategory": "Bu kategoride teklif yok.",
      "offers.weatherFallback": "Hava durumu",

      "docs.title": "Belgeler",
      "docs.countOne": "{n} seyahat belgesi",
      "docs.countMany": "{n} seyahat belgesi",
      "docs.createdOn": "Oluşturulma: {date}",
      "docs.loading": "Yükleniyor …",
      "docs.unknownFormat": "Belge yanıtı bilinmeyen bir biçimde alındı.",
      "docs.loadError": "Belge yüklenemedi.",
      "docs.fallback": "Belge",

      "office.loadError": "Seyahat acentesi bilgileri yüklenemedi.",
      "office.fallback": "Seyahat Acentem",
      "office.website": "Web sitesi",
      "office.contactWhatsapp": "WhatsApp ile iletişime geç",
      "office.openingHours": "Çalışma saatleri",
      "office.closed": "kapalı",
      "office.team": "İletişim kişileriniz",
      "office.whatsapp": "WhatsApp",
      "office.dow1": "Pazartesi", "office.dow2": "Salı", "office.dow3": "Çarşamba",
      "office.dow4": "Perşembe", "office.dow5": "Cuma", "office.dow6": "Cumartesi", "office.dow7": "Pazar",
      "office.whatsappMessage": "Merhaba, seyahatim{title} ({ref}) hakkında bir sorum var.",
      "office.whatsappMessageNoRef": "Merhaba, seyahatim{title} hakkında bir sorum var.",
      "office.travelRefLabel": "rezervasyon no. {ref}",

      "price.title": "Seyahat ücreti",
      "price.itemOne": "{n} rezervasyon kalemi",
      "price.itemMany": "{n} rezervasyon kalemi",
      "price.statusOF": "Açık", "price.statusBE": "Onaylandı", "price.statusOP": "Opsiyon", "price.statusST": "İptal edildi",
      "price.payToAgency": "Acenteye ödenecek: {amount}",
      "price.payDirectToOperator": "Doğrudan tur operatörüne{operator} ödenecek",
      "price.summary": "Özet",
      "price.totalToAgency": "Acenteye ödenecek",
      "price.totalToOperator": "Doğrudan operatöre ödenecek",
      "price.total": "Toplam",
      "price.noData": "Fiyat verisi bulunmuyor.",

      "nav.overview": "Anasayfa",
      "nav.plan": "Plan",
      "nav.offers": "Hizmetler",
      "nav.docs": "Belgeler",
      "nav.price": "Ücret",
      "nav.office": "Acentem",

      "app.loading": "Seyahat yükleniyor …",
      "app.demoNotice": "Demo veriler – canlı bağlantı yapılandırılmadı",
      "app.noTravelId": "travelID gönderilmedi. Çağrı biçimi: {example}",
      "app.loadError": "Seyahat verileri yüklenemedi: {message}",
      "app.language": "Dil",

      "dow0": "Paz", "dow1": "Pzt", "dow2": "Sal", "dow3": "Çar", "dow4": "Per", "dow5": "Cum", "dow6": "Cmt"
    },

    el: {
      "overview.welcomeBack": "Καλώς όρισες ξανά",
      "overview.yourTrip": "Το ταξίδι σου",
      "overview.showAlert": "Εμφάνιση ειδοποίησης",
      "overview.close": "Κλείσιμο",
      "overview.daysLeftOne": "Απομένει 1 ημέρα",
      "overview.daysLeftMany": "Απομένουν {n} ημέρες",
      "overview.tripOngoing": "Το ταξίδι βρίσκεται σε εξέλιξη",
      "overview.tripEnded": "Το ταξίδι ολοκληρώθηκε",
      "overview.nightsOne": "1 διανυκτέρευση",
      "overview.nightsMany": "{n} διανυκτερεύσεις",
      "overview.travelers": "{n} άτομα",
      "overview.mediatedBy": "Κράτηση μέσω {name}, {address}",
      "overview.viewPlan": "Προβολή προγράμματος",
      "overview.recommendedForYou": "Προτάσεις για εσένα",
      "overview.seeAll": "Δες τα όλα",

      "verlaufType.F": "Πτήση",
      "verlaufType.H": "Ξενοδοχείο",
      "verlaufType.T": "Μεταφορά",
      "verlaufType.M": "Ενοικίαση αυτοκινήτου",
      "verlaufType.C": "Κρουαζιέρα",
      "verlaufType.V": "Ασφάλεια",
      "verlaufType.S": "Άλλο",

      "install.appTitle": "Εγκατάσταση εφαρμογής",
      "install.appDesc": "Ταχύτερη πρόσβαση στο πρόγραμμα ταξιδιού σου απευθείας από την αρχική οθόνη.",
      "install.appBtn": "Εγκατάσταση",
      "install.iosTitle": "Προσθήκη στην Αρχική Οθόνη",
      "install.iosDesc": "Πάτησε {shareIcon} «Κοινή χρήση» και μετά «Προσθήκη στην Αρχική Οθόνη».",
      "install.close": "Κλείσιμο",

      "places.nearby": "Κοντά σου",
      "places.loading": "Φόρτωση …",
      "places.loadError": "Οι προτάσεις δεν ήταν δυνατό να φορτωθούν αυτή τη στιγμή.",
      "places.restaurants": "Εστιατόρια",
      "places.attractions": "Αξιοθέατα",

      "plan.title": "Πρόγραμμα ταξιδιού",
      "plan.seaDay": "Ημέρα στη θάλασσα",
      "plan.inPort": "Στο λιμάνι: {port}",
      "plan.at": "άφιξη {time}",
      "plan.from": "αναχώρηση {time}",
      "plan.toCruise": "Στοιχεία κρουαζιέρας",
      "plan.stayingAt": "Διαμένεις στο {hotel}",
      "plan.hotelFallback": "Ξενοδοχείο",
      "plan.noFixedProgram": "Δεν υπάρχει προγραμματισμένη δραστηριότητα αυτή την ημέρα",
      "plan.rentalCarOnTheWay": "Ενοικιαζόμενο αυτοκίνητο σε χρήση",
      "plan.noProgramToday": "Δεν υπάρχουν προγραμματισμένες δραστηριότητες για αυτή την ημέρα.",
      "plan.suitableToday": "Προτάσεις για σήμερα",
      "plan.outboundFlight": "Πτήση μετάβασης",
      "plan.returnFlight": "Πτήση επιστροφής",
      "plan.checkIn": "Check-in · {hotel}",
      "plan.transfer": "Μεταφορά",
      "plan.pickupCar": "Παραλαβή ενοικιαζόμενου αυτοκινήτου",
      "plan.returnCar": "Επιστροφή ενοικιαζόμενου αυτοκινήτου",
      "plan.cruiseLine": "Κρουαζιέρα · {ship}",
      "plan.insurance": "Ασφάλεια",
      "plan.portFallback": "Λιμάνι",
      "plan.routePlan": "Δρομολόγιο",

      "hotel.back": "Πίσω στο πρόγραμμα ταξιδιού",
      "hotel.noHotelSelected": "Δεν έχει επιλεγεί ξενοδοχείο.",
      "hotel.noCruiseSelected": "Δεν έχει επιλεγεί κρουαζιέρα.",
      "hotel.hotelFallback": "Ξενοδοχείο",
      "hotel.cruiseFallback": "Κρουαζιέρα",
      "hotel.mapTitle": "Τοποθεσία ξενοδοχείου",
      "hotel.openInOSM": "Άνοιγμα στο OpenStreetMap",
      "hotel.more": "ακόμη",

      "offers.title": "Πρόσθετες υπηρεσίες",
      "offers.subtitle": "Απόλαυσε ακόμα περισσότερα από το ταξίδι σου",
      "offers.filterAll": "Όλα",
      "offers.filterCarRental": "Ενοικίαση αυτοκινήτου",
      "offers.filterInsurance": "Ασφάλεια",
      "offers.filterExcursions": "Εκδρομές",
      "offers.filterOther": "Άλλα",
      "offers.readMore": "Μάθε περισσότερα",
      "offers.noneInCategory": "Καμία προσφορά σε αυτή την κατηγορία.",
      "offers.weatherFallback": "Καιρός",

      "docs.title": "Έγγραφα",
      "docs.countOne": "1 ταξιδιωτικό έγγραφο",
      "docs.countMany": "{n} ταξιδιωτικά έγγραφα",
      "docs.createdOn": "Δημιουργήθηκε στις {date}",
      "docs.loading": "Φόρτωση …",
      "docs.unknownFormat": "Η απάντηση του εγγράφου ελήφθη σε άγνωστη μορφή.",
      "docs.loadError": "Δεν ήταν δυνατή η φόρτωση του εγγράφου.",
      "docs.fallback": "Έγγραφο",

      "office.loadError": "Δεν ήταν δυνατή η φόρτωση των στοιχείων του γραφείου.",
      "office.fallback": "Το ταξιδιωτικό μου γραφείο",
      "office.website": "Ιστότοπος",
      "office.contactWhatsapp": "Επικοινωνία μέσω WhatsApp",
      "office.openingHours": "Ώρες λειτουργίας",
      "office.closed": "κλειστά",
      "office.team": "Οι σύμβουλοί σου",
      "office.whatsapp": "WhatsApp",
      "office.dow1": "Δευτέρα", "office.dow2": "Τρίτη", "office.dow3": "Τετάρτη",
      "office.dow4": "Πέμπτη", "office.dow5": "Παρασκευή", "office.dow6": "Σάββατο", "office.dow7": "Κυριακή",
      "office.whatsappMessage": "Γεια σας, έχω μια ερώτηση σχετικά με το ταξίδι μου{title} ({ref}).",
      "office.whatsappMessageNoRef": "Γεια σας, έχω μια ερώτηση σχετικά με το ταξίδι μου{title}.",
      "office.travelRefLabel": "αρ. ταξιδιού {ref}",

      "price.title": "Τιμή ταξιδιού",
      "price.itemOne": "1 κράτηση",
      "price.itemMany": "{n} κρατήσεις",
      "price.statusOF": "Εκκρεμεί", "price.statusBE": "Επιβεβαιώθηκε", "price.statusOP": "Επιλογή", "price.statusST": "Ακυρώθηκε",
      "price.payToAgency": "Πληρωτέο στο γραφείο: {amount}",
      "price.payDirectToOperator": "Πληρωτέο απευθείας στον διοργανωτή{operator}",
      "price.summary": "Σύνοψη",
      "price.totalToAgency": "Πληρωτέο στο γραφείο",
      "price.totalToOperator": "Πληρωτέο απευθείας στον διοργανωτή",
      "price.total": "Σύνολο",
      "price.noData": "Δεν υπάρχουν διαθέσιμα δεδομένα τιμής.",

      "nav.overview": "Αρχική",
      "nav.plan": "Πρόγραμμα",
      "nav.offers": "Προσφορές",
      "nav.docs": "Έγγραφα",
      "nav.price": "Τιμή",
      "nav.office": "Το γραφείο μου",

      "app.loading": "Φόρτωση ταξιδιού …",
      "app.demoNotice": "Δεδομένα επίδειξης – δεν έχει ρυθμιστεί ζωντανή σύνδεση",
      "app.noTravelId": "Δεν δόθηκε travelID. Μορφή κλήσης: {example}",
      "app.loadError": "Δεν ήταν δυνατή η φόρτωση των δεδομένων ταξιδιού: {message}",
      "app.language": "Γλώσσα",

      "dow0": "ΚΥ", "dow1": "ΔΕ", "dow2": "ΤΡ", "dow3": "ΤΕ", "dow4": "ΠΕ", "dow5": "ΠΑ", "dow6": "ΣΑ"
    }
  };

  // ---------- Zusatzleistungs-Titel nach G-Code (siehe Kommentar oben) ----------
  //
  // NUR für Codes befüllt, deren Bedeutung aus echten/besprochenen Beispielen
  // dieser Session bekannt ist (Mietwagen, Reisekrankenversicherung,
  // Parkplatz, Einreisebestimmungen, Wetter) – alle anderen G-Codes bleiben
  // hier bewusst leer und die App zeigt dann weiterhin die Original-Headline
  // (Deutsch), statt eine Bedeutung zu erraten. Bei Bedarf ergänzen.
  const OFFER_TYPE_LABELS = {
    G002: {
      de: "Reisekrankenversicherung", en: "Travel health insurance", fr: "Assurance maladie voyage",
      it: "Assicurazione sanitaria di viaggio", tr: "Seyahat sağlık sigortası", el: "Ταξιδιωτική ασφάλεια υγείας"
    },
    G003: {
      de: "Einreisebestimmungen", en: "Entry requirements", fr: "Formalités d'entrée",
      it: "Requisiti di ingresso", tr: "Giriş koşulları", el: "Απαιτήσεις εισόδου"
    },
    G004: {
      de: "Mietwagen", en: "Rental car", fr: "Location de voiture",
      it: "Autonoleggio", tr: "Kiralık araç", el: "Ενοικίαση αυτοκινήτου"
    },
    G005: {
      de: "Parkplatz", en: "Parking", fr: "Parking",
      it: "Parcheggio", tr: "Otopark", el: "Πάρκινγκ"
    },
    G007: {
      de: "Wetter", en: "Weather", fr: "Météo",
      it: "Meteo", tr: "Hava durumu", el: "Καιρός"
    }
  };

  // ---------- Helfer ----------

  const LANG_KEY = "meinereise:lang";

  function detectInitialLang() {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
    } catch (e) { /* localStorage evtl. nicht verfügbar */ }

    const candidates = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ""];
    for (const c of candidates) {
      const short = String(c || "").slice(0, 2).toLowerCase();
      if (SUPPORTED_LANGS.includes(short)) return short;
    }
    return DEFAULT_LANG;
  }

  let currentLang = detectInitialLang();

  function getLang() {
    return currentLang;
  }

  function setLang(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    currentLang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignorieren */ }
    document.documentElement.lang = lang;
  }

  // Einfache {platzhalter}-Ersetzung. Unbekannte Keys fallen auf Deutsch
  // zurück, damit ein fehlender Übersetzungseintrag nie zu einer leeren
  // Stelle in der UI führt, sondern höchstens auf Deutsch stehen bleibt.
  function t(key, vars) {
    const dict = TRANSLATIONS[currentLang] || TRANSLATIONS[DEFAULT_LANG];
    let str = dict[key] ?? TRANSLATIONS[DEFAULT_LANG][key] ?? key;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), vars[k]);
      });
    }
    return str;
  }

  // Wählt je nach n die "One"/"Many"-Form (siehe z.B. overview.daysLeftOne/
  // -Many). Für Türkisch sind beide Formen bewusst identisch hinterlegt, da
  // türkische Substantive nach Zahlen nicht dekliniert werden.
  function tCount(baseKey, n, vars) {
    const key = n === 1 ? `${baseKey}One` : `${baseKey}Many`;
    return t(key, Object.assign({ n }, vars));
  }

  function offerTypeLabel(type) {
    const entry = OFFER_TYPE_LABELS[type];
    if (!entry) return null;
    return entry[currentLang] || entry[DEFAULT_LANG] || null;
  }

  function localeTag() {
    return LOCALE_TAGS[currentLang] || LOCALE_TAGS[DEFAULT_LANG];
  }

  // Übersetzt alle statischen (nicht von app.js neu gerenderten) Elemente in
  // index.html, die mit data-i18n markiert sind (Nav-Labels, Lade-Text,
  // Demo-Banner-Standardtext) – siehe applyStaticTranslations() unten.
  function applyStaticTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.documentElement.lang = currentLang;
  }

  window.I18N = {
    SUPPORTED_LANGS, LANG_NAMES,
    getLang, setLang, t, tCount, offerTypeLabel, localeTag,
    applyStaticTranslations
  };
})();
