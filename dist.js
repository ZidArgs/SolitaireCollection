const fs = require('fs');
const BLACKLIST = new Set([
    "/dist.js",
    "/package.json",
    "/.git"
]);
function getDate() {
    let date = new Date();
    let Y = date.getFullYear();
    let M = ("0"+(date.getMonth()+1)).slice(-2);
    let D = ("0"+date.getDate()).slice(-2);
    let h = ("0"+date.getHours()).slice(-2);
    let m = ("0"+date.getMinutes()).slice(-2);
    let s = ("0"+date.getSeconds()).slice(-2);
    return `${D}.${M}.${Y}-${h}:${m}:${s}`;
}
function resolveFiles(currentPath) {
    let result = [];
    let files = fs.readdirSync(currentPath , {withFileTypes: true});
    for (let file of files) {
        let absolutePath = `${currentPath}/${file.name}`;
        var relativePath = absolutePath.replace(__dirname, "");
        if (!BLACKLIST.has(relativePath)) {
            if (file.isDirectory()) {
                let buffer = resolveFiles(absolutePath);
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
let files = resolveFiles(__dirname);

fs.writeFileSync("sw.js",
`const CACHE_NAME = "${getDate()}";
const FILES = ${JSON.stringify(files, null, 4)};

this.addEventListener('install', function(event) {
    event.waitUntil(registerCachedFiles());
    return self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    clients.claim();
    event.waitUntil(removeOldCaches());
});

this.addEventListener('fetch', async function(event) {
    event.respondWith(getResponse(event.request));
});

async function registerCachedFiles(request) {
    var cache = await caches.open(CACHE_NAME);
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
    let keys = await caches.keys();
    for (let key of keys) {
        if (key != CACHE_NAME) {
            await caches.delete(key);
        }
    }
}`);
