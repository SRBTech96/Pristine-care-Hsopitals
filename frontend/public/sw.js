/**
 * Service Worker for Pristine Hospital
 * Implements caching strategies for offline capability and performance
 * 
 * Cache Strategies:
 * - Static assets: Cache first (versioned files never change)
 * - API calls: Network first with fallback to cache
 * - Pages: Stale while revalidate (serve stale, fetch fresh in background)
 */

const CACHE_VERSION = "v1";
const CACHE_NAMES = {
  STATIC: `pristine-static-${CACHE_VERSION}`,
  DYNAMIC: `pristine-dynamic-${CACHE_VERSION}`,
  API: `pristine-api-${CACHE_VERSION}`,
};

const STATIC_ASSETS = [
  "/",
  "/about",
  "/services",
  "/doctors",
  "/contact",
  "/favicon.ico",
];

/**
 * Install event - cache static assets
 */
self.addEventListener("install", (event: ExtendableEvent) => {
  console.log("Service Worker installing...");

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAMES.STATIC);
        // Cache critical static assets
        await cache.addAll(["/", "/offline.html"]);
        console.log("Static assets cached");
        self.skipWaiting();
      } catch (error) {
        console.error("Cache installation failed:", error);
      }
    })()
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener("activate", (event: ExtendableEvent) => {
  console.log("Service Worker activating...");

  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(
          (name) =>
            !Object.values(CACHE_NAMES).includes(name)
        );

        // Delete old cache versions
        await Promise.all(oldCaches.map((name) => caches.delete(name)));
        console.log(`Cleaned ${oldCaches.length} old caches`);

        // Take control of all clients
        await (self as any).clients.claim();
      } catch (error) {
        console.error("Cache cleanup failed:", error);
      }
    })()
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip non-http(s) requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // API requests - Network first with API cache
  if (url.pathname.startsWith("/api") || url.hostname !== self.location.hostname) {
    event.respondWith(networkFirstStrategy(request, CACHE_NAMES.API));
    return;
  }

  // Static assets (_next, public) - Cache first
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/public") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/i)
  ) {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAMES.STATIC));
    return;
  }

  // HTML pages - Stale while revalidate
  if (
    request.headers.get("accept")?.includes("text/html") ||
    url.pathname === "/" ||
    ["/about", "/services", "/doctors", "/contact"].includes(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidateStrategy(request, CACHE_NAMES.DYNAMIC));
    return;
  }

  // Default - Network first
  event.respondWith(networkFirstStrategy(request, CACHE_NAMES.DYNAMIC));
});

/**
 * Cache first strategy
 * Try cache first, fallback to network
 */
async function cacheFirstStrategy(
  request: Request,
  cacheName: string
): Promise<Response> {
  try {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error("Cache first strategy failed:", error);
    return new Response("Offline - Page not available", { status: 503 });
  }
}

/**
 * Network first strategy
 * Try network first, fallback to cache
 */
async function networkFirstStrategy(
  request: Request,
  cacheName: string
): Promise<Response> {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error("Network request failed, checking cache:", error);
    const cached = await caches.match(request);
    return (
      cached ||
      new Response(JSON.stringify({ error: "Offline" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      })
    );
  }
}

/**
 * Stale while revalidate strategy
 * Return cached immediately, fetch fresh in background
 */
async function staleWhileRevalidateStrategy(
  request: Request,
  cacheName: string
): Promise<Response> {
  try {
    const cached = await caches.match(request);

    // Return cached response immediately
    if (cached) {
      // Fetch fresh version in background
      (async () => {
        try {
          const response = await fetch(request);
          if (response && response.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, response);
          }
        } catch (error) {
          console.debug("Background fetch failed:", error);
        }
      })();

      return cached;
    }

    // No cache, fetch from network
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error("Stale while revalidate strategy failed:", error);
    return new Response("Offline - Page not available", { status: 503 });
  }
}

/**
 * Handle messages from clients
 */
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  const { type } = event.data;

  if (type === "SKIP_WAITING") {
    (self as any).skipWaiting();
  }

  if (type === "GET_CACHE_SIZE") {
    (async () => {
      try {
        const cacheNames = await caches.keys();
        let totalSize = 0;

        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const keys = await cache.keys();

          for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
              const buffer = await response.arrayBuffer();
              totalSize += buffer.byteLength;
            }
          }
        }

        event.ports[0].postMessage({
          type: "CACHE_SIZE",
          size: totalSize,
        });
      } catch (error) {
        console.error("Failed to calculate cache size:", error);
      }
    })();
  }

  if (type === "CLEAR_CACHE") {
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        event.ports[0].postMessage({
          type: "CACHE_CLEARED",
        });
      } catch (error) {
        console.error("Failed to clear cache:", error);
      }
    })();
  }
});

// Prevent TypeScript errors
export {};
