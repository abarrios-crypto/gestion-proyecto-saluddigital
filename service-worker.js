/**
 * service-worker.js
 * Cachea el "app shell" (HTML/CSS/JS/manifest/iconos) para que la PWA cargue
 * y funcione sin conexión. Los datos del proyecto viven en localStorage
 * (ver app.js) y se sincronizan con el Sheet cuando hay red — este SW no
 * intercepta las llamadas a la API de Apps Script, solo los archivos estáticos.
 */

const CACHE_NAME = "alfabdigsalud-shell-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/app.js",
  "./js/data-seed.js",
  "./icons/icon.svg",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Nunca cachear llamadas al backend de Apps Script: siempre red.
  if (url.hostname.includes("script.google.com")) return;

  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
