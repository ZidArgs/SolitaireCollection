const CACHE_NAME = 'SolitaireCollection';
const CACHED_FILES = [
    "/",
    "/index.html",
    "/src/index.js",
    "/manifest.json",
    "/img/favicons/48.png",
    "/img/favicons/72.png",
    "/img/favicons/96.png",
    "/img/favicons/144.png",
    "/img/favicons/192.png",
    "/img/favicons/512.png",
];

this.addEventListener('install', function(event) {
    event.waitUntil(registerCachedFiles());
});

this.addEventListener('fetch', async function(event) {
    event.respondWith(getResponse(event.request));
});

async function registerCachedFiles(request) {
    var cache = await caches.open(CACHE_NAME);
    return cache.addAll(CACHED_FILES);
}

async function getResponse(request) {
    var cache = await caches.open(CACHE_NAME);
    let cached = await cache.match(request.url);
    let fetched = await fetch(request);
    if (!cached) {
        cache.put(request, fetched.clone());
    }
    if (!fetched) {
        return cached;
    }
    return fetched;
}