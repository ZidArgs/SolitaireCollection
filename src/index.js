const main_menu = document.getElementById("main_menu");

function openGame(event) {
    location.href = `/games/${event.currentTarget.dataset.game}/`;
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
}

(async function() {
    const buttons = Array.from(main_menu.querySelectorAll("[data-game]"));
    for (const button of buttons) {
        button.addEventListener("click", openGame);
    }
})();
