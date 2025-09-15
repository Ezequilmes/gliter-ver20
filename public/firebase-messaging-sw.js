/* Firebase Messaging Service Worker (placeholder)
   This file prevents 404 requests during development when the app checks for messaging SW.
   You can implement real FCM handlers later if Push is enabled. */
self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  // Claim clients so it starts controlling open pages
  event.waitUntil(self.clients.claim());
});