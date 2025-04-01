// Service Worker for caching assets
const CACHE_NAME = "ily-quest-cache-v1"
const urlsToCache = ["/", "/logo.svg", "/mascot.png", "/iLy.svg", "/favicon.svg", "/success.mp3"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and requests to external domains
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin) ||
    event.request.url.includes("/api/")
  ) {
    return
  }

  // For static assets, try the cache first, then network
  if (
    event.request.url.match(/\.(js|css|svg|png|jpg|jpeg|gif|webp|avif|mp3|woff2?)$/) ||
    event.request.url.includes("/providers/")
  ) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response
        }

        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response as it's a stream and can only be consumed once
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
      }),
    )
  }
})

// Clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

