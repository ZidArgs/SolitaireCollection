/**
 * A ServiceWorker providing a manual update mechanism to control
 * when to get the latest version of the application.
 */

const CACHE_INDEX = "/index.json";
const CACHE_NAME = "my-cache-name";
const HEADER_CONFIG = new Headers({
    "Content-Type": "text/plain",
    "Pragma": "no-cache",
    "Cache-Control": "no-cache"
});

const REMOTE_PATHS = [
    "/remote/",
    "/rtc/"
];

const cmd = {
    start: install,
    check: checkUpdateAvailable,
    update: updateFiles,
    forceupdate: updateFilesForced,
    purge: purgeCache
};

self.addEventListener("install", () => {
    return self.skipWaiting();
});

self.addEventListener("activate", () => {
    return self.clients.claim();
});

self.addEventListener("fetch", function(event) {
    const url = new URL(event.request.url);
    if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") {
        return;
    }
    if (url.searchParams.get("nosw") !== null) {
        return;
    }
    if (REMOTE_PATHS.some((pathEntry) => url.pathname.startsWith(pathEntry))) {
        return;
    }
    if (event.request.url == self.location.origin + "/version.json") {
        event.respondWith(getVersion(event.request));
    } else {
        event.respondWith(getResponse(event.request));
    }
});

async function getResponse(request) {
    const cache = await caches.open(CACHE_NAME);
    let response = await cache.match(request.url);
    if (!response) {
        try {
            response = await fetch(request);
        } catch {
            return new Response("", {
                "status": 500,
                "statusText": "offline"
            });
        }
    }
    return response;
}

async function getVersion(request) {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(CACHE_INDEX);
    const version = await cache.match(request.url);
    if (response != null) {
        const ver = await version.json();
        ver.date = new Date(response.headers.get("Last-Modified"));
        return new Response(JSON.stringify(ver));
    }
    return version;
}

self.addEventListener("message", async (event) => {
    const src = event.source;
    const dta = event.data;
    if (!src) {
        return;
    }
    if (cmd[dta] != null) {
        try {
            await cmd[dta](src);
        } catch (e) {
            src.postMessage({
                type: "error",
                cmd: dta,
                msg: e.message,
                stack: e.stack
            });
        }
    } else {
        src.postMessage({
            type: "error",
            cmd: dta,
            msg: "command not found"
        });
    }
});

async function fetchFile(url, method = "GET") {
    try {
        const r = await fetch(url, {
            method: method,
            headers: HEADER_CONFIG,
            mode: "cors"
        });
        if (r.status < 200 || r.status >= 300) {
            throw new Error(`error fetching file "${url}" - status: ${r.status}`);
        }
        return r;
    } catch {
        return new Response("", {
            "status": 500,
            "statusText": "offline"
        });
    }
}

async function overwriteCachedFile(cache, request, file) {
    try {
        await cache.delete(request);
        await cache.add(request, file);
    } catch (err) {
        console.log("error caching:", request, file);
        throw err;
    }
}

async function purgeCache(client) {
    caches.keys().then(function(names) {
        for (const name of names) {
            caches.delete(name);
        }
    });
    client.postMessage({
        type: "state",
        msg: "purged"
    });
}

async function install(client) {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(CACHE_INDEX);
    if (response != null) {
        client.postMessage({
            type: "state",
            msg: "start"
        });
    } else {
        const filelist = await fetchFile(CACHE_INDEX);
        const downloadlist = await filelist.clone().json();
        client.postMessage({
            type: "state",
            msg: "need_download",
            total: downloadlist.length
        });
        await updateFileList(client, cache, downloadlist);
        await overwriteCachedFile(cache, CACHE_INDEX, filelist);
        client.postMessage({
            type: "state",
            msg: "start"
        });
    }
}

async function checkUpdateAvailable(client) {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(CACHE_INDEX);
    let message = "update_available";
    if (response != null) {
        const loc = new Date(response.headers.get("Last-Modified"));
        if (loc > new Date(0)) {
            const rem = new Date((await fetchFile(CACHE_INDEX, "HEAD")).headers.get("Last-Modified"));
            if (rem <= loc) {
                message = "update_unavailable";
            }
        }
    }
    client.postMessage({
        type: "state",
        msg: message
    });
}

async function removeUnusedFiles(client, cache, downloadlist) {
    client.postMessage({
        type: "state",
        msg: "cleaning"
    });
    const downloaded = downloadlist.map((e) =>  (new Request(e)).url);
    const filelist = (await cache.keys()).map((e) => e.url);
    const removelist = diff(filelist, downloaded);
    const w = [];
    for (const i in removelist) {
        w.push(await cache.delete(removelist[i]));
    }
    await Promise.all(w);
}

async function updateFiles(client) {
    const cache = await caches.open(CACHE_NAME);
    const filelist = await fetchFile(CACHE_INDEX);
    client.postMessage({
        type: "state",
        msg: "check_update"
    });
    const allfileslist = await filelist.clone().json();
    const downloadlist = await checkUpdateNeeded(cache, allfileslist);
    client.postMessage({
        type: "state",
        msg: "need_download",
        total: downloadlist.length
    });
    await updateFileList(client, cache, downloadlist);
    await removeUnusedFiles(client, cache, allfileslist);
    await overwriteCachedFile(cache, CACHE_INDEX, filelist);
    client.postMessage({
        type: "state",
        msg: "update_finished"
    });
}

async function updateFilesForced(client) {
    const cache = await caches.open(CACHE_NAME);
    const filelist = await fetchFile(CACHE_INDEX);
    client.postMessage({
        type: "state",
        msg: "check_update"
    });
    const downloadlist = await filelist.clone().json();
    client.postMessage({
        type: "state",
        msg: "need_download",
        total: downloadlist.length
    });
    await updateFileList(client, cache, downloadlist);
    await removeUnusedFiles(client, cache, downloadlist);
    await overwriteCachedFile(cache, CACHE_INDEX, filelist);
    client.postMessage({
        type: "state",
        msg: "update_finished"
    });
}

async function checkUpdateNeeded(cache, filelist) {
    const r = [], p = [];
    for (const element of filelist) {
        p.push(addFileIfNeeded(cache, element, r));
    }
    await Promise.all(p);
    return r;
}

async function addFileIfNeeded(cache, element, arr) {
    if (await checkFile(cache, element)) {
        arr.push(element);
    }
}

async function checkFile(cache, url) {
    const response = await cache.match(url);
    if (response != null) {
        const local = new Date(response.headers.get("Last-Modified"));
        const remote = new Date((await fetchFile(url, "HEAD")).headers.get("Last-Modified"));
        return remote > local;
    } else {
        return true;
    }
}

async function updateFileList(client, cache, filelist) {
    const r = [];
    let loaded = 0;
    for (const url of filelist) {
        r.push(updateFile(cache, url).then((/* file */) => {
            loaded++;
            client.postMessage({
                type: "state",
                msg: "file_downloaded",
                url,
                loaded,
                total: filelist.length
            });
        }));
    }
    await Promise.all(r);
}

async function updateFile(cache, url) {
    const file = await downloadFile(url);
    await overwriteCachedFile(cache, url, file);
}

async function downloadFile(url, tries = 3) {
    if (!tries) {
        throw new Error("could not load file " + url);
    }
    try {
        return await fetchFile(url);
    } catch (err) {
        console.error(err);
        return await downloadFile(url, tries - 1);
    }
}

function diff(a, b) {
    const c = new Set(b);
    return a.filter((d) => !c.has(d));
}
