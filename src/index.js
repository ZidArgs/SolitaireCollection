import i18n from "@emcjs/core/util/I18n.js";
import AppSettingsOverlay from "./script/ui/settings/AppSettingsOverlay.js";

{ // init base system
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js");
    }
    await i18n.loadTranslations();
}

const appSettingsOverlay = new AppSettingsOverlay();

const main_menu = document.getElementById("main_menu");

const gameFrame = document.getElementById("game_frame");

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
        appSettingsOverlay.show();
    });
})();
