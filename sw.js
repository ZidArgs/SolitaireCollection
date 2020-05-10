const CACHE_NAME = "10.05.2020-03:21:04";
const FILES = [
    "/LICENSE",
    "/games/freecell/index.css",
    "/games/freecell/index.html",
    "/games/freecell/",
    "/games/freecell/index.js",
    "/games/klondike/index.css",
    "/games/klondike/index.html",
    "/games/klondike/",
    "/games/klondike/index.js",
    "/img/favicons/144.png",
    "/img/favicons/192.png",
    "/img/favicons/48.png",
    "/img/favicons/512.png",
    "/img/favicons/72.png",
    "/img/favicons/96.png",
    "/img/favicons/logo.svg",
    "/img/games/freecell.png",
    "/img/games/klondike.png",
    "/img/playing_cards/back/fiber_black.svg",
    "/img/playing_cards/back/fiber_blue.svg",
    "/img/playing_cards/back/fiber_red.svg",
    "/img/playing_cards/blank.svg",
    "/img/playing_cards/cards_template.svg",
    "/img/playing_cards/front/french/C_10.svg",
    "/img/playing_cards/front/french/C_2.svg",
    "/img/playing_cards/front/french/C_3.svg",
    "/img/playing_cards/front/french/C_4.svg",
    "/img/playing_cards/front/french/C_5.svg",
    "/img/playing_cards/front/french/C_6.svg",
    "/img/playing_cards/front/french/C_7.svg",
    "/img/playing_cards/front/french/C_8.svg",
    "/img/playing_cards/front/french/C_9.svg",
    "/img/playing_cards/front/french/C_A.svg",
    "/img/playing_cards/front/french/C_J.svg",
    "/img/playing_cards/front/french/C_K.svg",
    "/img/playing_cards/front/french/C_Q.svg",
    "/img/playing_cards/front/french/D_10.svg",
    "/img/playing_cards/front/french/D_2.svg",
    "/img/playing_cards/front/french/D_3.svg",
    "/img/playing_cards/front/french/D_4.svg",
    "/img/playing_cards/front/french/D_5.svg",
    "/img/playing_cards/front/french/D_6.svg",
    "/img/playing_cards/front/french/D_7.svg",
    "/img/playing_cards/front/french/D_8.svg",
    "/img/playing_cards/front/french/D_9.svg",
    "/img/playing_cards/front/french/D_A.svg",
    "/img/playing_cards/front/french/D_J.svg",
    "/img/playing_cards/front/french/D_K.svg",
    "/img/playing_cards/front/french/D_Q.svg",
    "/img/playing_cards/front/french/H_10.svg",
    "/img/playing_cards/front/french/H_2.svg",
    "/img/playing_cards/front/french/H_3.svg",
    "/img/playing_cards/front/french/H_4.svg",
    "/img/playing_cards/front/french/H_5.svg",
    "/img/playing_cards/front/french/H_6.svg",
    "/img/playing_cards/front/french/H_7.svg",
    "/img/playing_cards/front/french/H_8.svg",
    "/img/playing_cards/front/french/H_9.svg",
    "/img/playing_cards/front/french/H_A.svg",
    "/img/playing_cards/front/french/H_J.svg",
    "/img/playing_cards/front/french/H_K.svg",
    "/img/playing_cards/front/french/H_Q.svg",
    "/img/playing_cards/front/french/S_10.svg",
    "/img/playing_cards/front/french/S_2.svg",
    "/img/playing_cards/front/french/S_3.svg",
    "/img/playing_cards/front/french/S_4.svg",
    "/img/playing_cards/front/french/S_5.svg",
    "/img/playing_cards/front/french/S_6.svg",
    "/img/playing_cards/front/french/S_7.svg",
    "/img/playing_cards/front/french/S_8.svg",
    "/img/playing_cards/front/french/S_9.svg",
    "/img/playing_cards/front/french/S_A.svg",
    "/img/playing_cards/front/french/S_J.svg",
    "/img/playing_cards/front/french/S_K.svg",
    "/img/playing_cards/front/french/S_Q.svg",
    "/img/playing_cards/goals/french/C.svg",
    "/img/playing_cards/goals/french/D.svg",
    "/img/playing_cards/goals/french/H.svg",
    "/img/playing_cards/goals/french/S.svg",
    "/index.css",
    "/index.html",
    "/",
    "/manifest.json",
    "/src/index.js",
    "/src/ui/CircleSelect.js",
    "/src/ui/Dialog.js",
    "/src/ui/Menu.js",
    "/src/ui/Option.js",
    "/src/ui/PlayingCard.js",
    "/src/ui/PlayingCardColumn.js",
    "/src/ui/PlayingCardDeck.js",
    "/src/ui/PlayingCardDrawer.js",
    "/src/ui/PlayingCardGoal.js",
    "/src/ui/PlayingCardPlaceholder.js",
    "/src/ui/Settings.js",
    "/src/util/CardDeck.js",
    "/src/util/DragDrop.js",
    "/src/util/GameStorage.js",
    "/src/util/IDBStorage.js",
    "/src/util/Template.js",
    "/src/util/WinCondition.js",
    "/sw.js"
];

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
}