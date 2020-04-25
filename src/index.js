import "/src/games/FreeCell.js";

let game = document.getElementById("freecell");

!async function() {
    await game.init();
    game.startGame();
}();
