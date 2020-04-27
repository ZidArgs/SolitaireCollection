import "/src/games/FreeCell.js";

let main_menu = document.getElementById("main_menu");

let games = {
    freecell: document.getElementById("freecell")
};

function openGame(event) {
    main_menu.style.display = "none";
    games[event.currentTarget.dataset.game].style.display = "";
    games[event.currentTarget.dataset.game].startGame();
}

function quitGame(event) {
    event.currentTarget.style.display = "none";
    main_menu.style.display = "";
}

!async function() {
    for (let name in games) {
        games[name].addEventListener('close', quitGame);
        await games[name].init();
    }

    let buttons = Array.from(main_menu.querySelectorAll("[data-game]"));
    for (let button of buttons) {
        button.addEventListener('click', openGame);
    }
}();
