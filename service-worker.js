importScripts("./offline-assets.js");

const VERSION = `disordered-life-offline-${self.OFFLINE_BUILD_ID || "v4"}`;
const CORE_CACHE = `${VERSION}-core`;
const ASSET_CACHE = `${VERSION}-assets`;
const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./offline-assets.js",
  "./base.css",
  "./game.css",
  "./offline.css",
  "./offline-db.js",
  "./offline-game-state.js",
  "./offline-dialogue-engine.js",
  "./offline-runtime.js",
  "./offline-tools.js",
  "./offline-pwa.js",
  "./world-areas.js",
  "./room-entry-copy.js",
  "./room-cards.js",
  "./room-lobby-ui.js",
  "./rooms-ui.js",
  "./rooms.css"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CORE_CACHE)
    .then((cache) => cache.addAll(CORE))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys
    .filter((key) => ![CORE_CACHE, ASSET_CACHE].includes(key))
    .map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

async function cacheAll() {
  const cache = await caches.open(ASSET_CACHE);
  const clients = await self.clients.matchAll({ type: "window" });
  let done = 0;
  for (const url of self.OFFLINE_ASSETS || []) {
    if (!await cache.match(url)) {
      try {
        const response = await fetch(url);
        if (response.ok) await cache.put(url, response);
      } catch (_) {}
    }
    done += 1;
    if (done % 10 === 0 || done === self.OFFLINE_ASSETS.length) {
      clients.forEach((client) => client.postMessage({
        type: "CACHE_PROGRESS", done, total: self.OFFLINE_ASSETS.length,
      }));
    }
  }
  clients.forEach((client) => client.postMessage({ type: "CACHE_READY" }));
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "CACHE_ALL") event.waitUntil(cacheAll());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request, { ignoreSearch: true })
    .then((cached) => cached || fetch(event.request)
    .then((response) => {
      if (response.ok && new URL(event.request.url).origin === location.origin) {
        const copy = response.clone();
        caches.open(ASSET_CACHE).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => event.request.mode === "navigate"
      ? caches.match("./index.html")
      : new Response("", { status: 503, statusText: "Offline resource unavailable" }))));
});
