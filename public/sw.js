// Minimal service worker. Registers silently. Nothing cached yet.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Network-only for now. We add caching in a later step.
self.addEventListener('fetch', () => {
  // no-op
});