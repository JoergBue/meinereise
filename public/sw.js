// Minimaler Service Worker – wird ausschließlich benötigt, damit die App
// unter Android/Chrome als installierbare PWA erkannt wird ("Zum
// Home-Bildschirm hinzufügen" mit echtem Install-Prompt statt nur einem
// Browser-Lesezeichen, siehe manifest.json + beforeinstallprompt in app.js).
//
// Bewusst OHNE Offline-Caching: Reiseplan, Angebote und Preise ändern sich
// und müssen bei jedem Aufruf frisch vom Server kommen – ein Cache könnte
// sonst veraltete Reisedaten unterwegs anzeigen. Jede Anfrage geht daher
// unverändert ans Netz.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
