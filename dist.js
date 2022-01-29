const fs = require("fs");
const BLACKLIST = new Set([
    "/dist.js",
    "/package.json",
    "/.git"
]);

function getDate() {
    const date = new Date();
    const Y = date.getFullYear();
    const M = ("0" + (date.getMonth() + 1)).slice(-2);
    const D = ("0" + date.getDate()).slice(-2);
    const h = ("0" + date.getHours()).slice(-2);
    const m = ("0" + date.getMinutes()).slice(-2);
    const s = ("0" + date.getSeconds()).slice(-2);
    return `${D}.${M}.${Y}-${h}:${m}:${s}`;
}

function resolveFiles(currentPath) {
    let result = [];
    const files = fs.readdirSync(currentPath, {withFileTypes: true});
    for (const file of files) {
        const absolutePath = `${currentPath}/${file.name}`;
        const relativePath = absolutePath.replace(__dirname, "");
        if (!BLACKLIST.has(relativePath)) {
            if (file.isDirectory()) {
                const buffer = resolveFiles(absolutePath);
                result = result.concat(buffer);
            } else if (relativePath.length > 1 && file.isFile()) {
                result.push(relativePath);
                if (relativePath.endsWith("index.html")) {
                    result.push(relativePath.replace("index.html", ""));
                }
            }
        }
    }
    return result;
}

const files = resolveFiles(__dirname);

fs.writeFileSync("sw.js",
    `const CACHE_NAME = "${getDate()}";
const FILES = ${JSON.stringify(files, null, 4)};

this.addEventListener("install", function(event) {
    event.waitUntil(registerCachedFiles());
    return self.skipWaiting();
});

self.addEventListener("activate", function(event) {
    self.clients.claim();
    event.waitUntil(removeOldCaches());
});

this.addEventListener("fetch", async function(event) {
    event.respondWith(getResponse(event.request));
});

async function registerCachedFiles(request) {
    const    cache = await caches.open(CACHE_NAME);
    return cache.addAll(FILES);
}

async function getResponse(request) {
    var cache = await caches.open(CACHE_NAME);
    let response = await cache.match(request.url);
    if (!response) {
        response = await fetch(request);
        cache.add(response.clone())
    }
    return response;
}

async function removeOldCaches() {
    const keys = await caches.keys();
    for (const key of keys) {
        if (key != CACHE_NAME) {
            await caches.delete(key);
        }
    }
}

`);
