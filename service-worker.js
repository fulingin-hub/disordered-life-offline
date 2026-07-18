importScripts("./offline-assets.js");

const VERSION = `disordered-life-offline-${self.OFFLINE_BUILD_ID || "v4"}-pwa4`;
const CORE_CACHE = `${VERSION}-core`;
const ASSET_CACHE = `${VERSION}-assets`;
const CACHE_CONCURRENCY = 6;
const CACHE_TIMEOUT_MS = 12000;
const CACHE_SKIP = new Set([
  "./DEPLOYMENT.md",
  "./README.txt",
  "./_headers",
  "./_redirects",
  "./netlify.toml",
  "./vercel.json",
]);
let cacheAllTask;
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

async function broadcast(type, detail = {}) {
  const clients = await self.clients.matchAll({ type: "window" });
  clients.forEach((client) => client.postMessage({ type, ...detail }));
}

async function fetchForCache(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CACHE_TIMEOUT_MS);
  try {
    const response = await fetch(new Request(url, {
      cache: "reload",
      signal: controller.signal,
    }));
    if (!response.ok) return null;
    const body = await response.arrayBuffer();
    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function cacheResource(cache, url) {
  if (await cache.match(url, { ignoreSearch: true })) return true;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetchForCache(url);
      if (response) {
        await cache.put(url, response);
        return true;
      }
    } catch (_) {}
  }
  return false;
}

async function runCacheAll() {
  const cache = await caches.open(ASSET_CACHE);
  const resources = (self.OFFLINE_ASSETS || [])
    .filter((url) => !CACHE_SKIP.has(url));
  let next = 0;
  let done = 0;
  let failed = 0;

  async function worker() {
    while (next < resources.length) {
      const url = resources[next];
      next += 1;
      if (!await cacheResource(cache, url)) failed += 1;
      done += 1;
      if (done % 10 === 0 || done === resources.length) {
        await broadcast("CACHE_PROGRESS", {
          done, total: resources.length, failed,
        });
      }
    }
  }

  await Promise.all(Array.from({ length: CACHE_CONCURRENCY }, worker));
  await broadcast("CACHE_READY", { total: resources.length, failed });
}

function cacheAll() {
  if (!cacheAllTask) {
    cacheAllTask = runCacheAll().finally(() => { cacheAllTask = null; });
  }
  return cacheAllTask;
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
