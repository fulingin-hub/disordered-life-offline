importScripts("./offline-assets.js");

const VERSION = `disordered-life-offline-${self.OFFLINE_BUILD_ID || "v4"}-pwa3`;
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
  "./offline-i18n-en.js",
  "./offline-i18n-ja.js",
  "./offline-i18n.js",
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

async function cacheCore() {
  const cache = await caches.open(CORE_CACHE);
  await Promise.all(CORE.map(async (url) => {
    const response = await fetch(new Request(url, { cache: "reload" }));
    if (!response.ok) throw new Error(`Core resource unavailable: ${url}`);
    await cache.put(url, response);
  }));
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheCore().then(() => self.skipWaiting()));
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

async function fetchNavigation(request) {
  try {
    const response = await fetch(new Request(request, { cache: "no-store" }));
    if (response.ok) {
      const cache = await caches.open(CORE_CACHE);
      await cache.put("./index.html", response.clone());
    }
    return response;
  } catch (_) {
    return await caches.match("./index.html")
      || new Response("Offline page unavailable", {
        status: 503, statusText: "Offline page unavailable",
      });
  }
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetchNavigation(event.request));
    return;
  }
  event.respondWith(caches.match(event.request, { ignoreSearch: true })
    .then((cached) => cached || fetch(event.request)
    .then((response) => {
      if (response.ok && new URL(event.request.url).origin === location.origin) {
        const copy = response.clone();
        caches.open(ASSET_CACHE).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => new Response("", {
      status: 503, statusText: "Offline resource unavailable",
    }))));
});
