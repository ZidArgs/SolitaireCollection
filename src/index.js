let main_menu = document.getElementById("main_menu");

function openGame(event) {
    location.href = `/games/${event.currentTarget.dataset.game}/index.html`;
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}

!async function() {
    let buttons = Array.from(main_menu.querySelectorAll("[data-game]"));
    for (let button of buttons) {
        button.addEventListener('click', openGame);
    }
}();
