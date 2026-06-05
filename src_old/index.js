import Settings from "/src/ui/Settings.js";

const main_menu = document.getElementById("main_menu");

const gameFrame = document.getElementById("game_frame");

const SETTINGS = new Settings([{
    title: "Game Orientation",
    type: "string",
    default: "",
    value: "main.orientation",
    options: [{
        title: "rotate",
        value: ""
    }, {
        title: "landscape",
        value: "landscape"
    }, {
        title: "portrait",
        value: "portrait"
    }]
}]);

function quitFrame() {
    gameFrame.removeEventListener("load", mayQuitFrame);
    gameFrame.src = "";
    screen.orientation.unlock();
    document.exitFullscreen();
}

document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
        quitFrame();
    }
});

function mayQuitFrame() {
    if (gameFrame.contentWindow.location.href === "about:blank") {
        quitFrame();
    }
}

window.addEventListener("quit_frame", () => {
    quitFrame();
}, false);

function openGame(game) {
    document.documentElement.requestFullscreen();
    gameFrame.src = `/games/${game}/`;
    gameFrame.addEventListener("load", mayQuitFrame);
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
}

(async function() {
    const buttons = Array.from(main_menu.querySelectorAll("[data-game]"));
    for (const button of buttons) {
        button.addEventListener("click", (event) => {
            openGame(event.currentTarget.dataset.game);
        });
    }
    // ---
    const settingsBtn = document.getElementById("settings_button");
    settingsBtn.addEventListener("click", () => {
        SETTINGS.show();
    });
})();
