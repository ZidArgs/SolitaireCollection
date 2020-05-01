import IDBStorage from "/src/util/IDBStorage.js";
import GameStorage from "/src/util/GameStorage.js";
import DragDrop from "/src/util/DragDrop.js";
import CardDeck from "/src/util/CardDeck.js";
import PlayingCardColumn from "/src/ui/PlayingCardColumn.js";
import PlayingCardPlaceholder from "/src/ui/PlayingCardPlaceholder.js";
import PlayingCardGoal from "/src/ui/PlayingCardGoal.js";
import "/src/ui/PlayingCard.js";
import Menu from "/src/ui/Menu.js";
import Dialog from "/src/ui/Dialog.js";

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}

document.body.style.setProperty("--card-scale", "1");
document.body.style.setProperty("--background-color", "#00aa33");

let SettingsStorage = new IDBStorage("settings");

// create menus
const MENU_PAUSE = new Menu({
    title: "PAUSE",
    buttons: [{
        content: "RESUME",
        action: Menu.CLOSE
    },{
        content: "RESTART",
        handler: async function() {
            if (await Dialog.confirm("Do you want to restart the current game?")) {
                gameStorage.restart();
                return true;
            }
            return false;
        }
    },{
        content: "NEW GAME",
        handler: async function() {
            if (await Dialog.confirm("Do you want to start a new game?")) {
                await newGame();
                return true;
            }
            return false;
        }
    },{
        content: "QUIT",
        action: Menu.BACK
    }]
});
const MENU_WIN = new Menu({
    title: "WIN!",
    buttons: [{
        content: "NEW GAME",
        handler: async function() {
            await newGame();
            return true;
        }
    },{
        content: "QUIT",
        action: Menu.BACK
    }]
});

const GAME_NAME = "klondike";
const AUTOSTACK_DIFF = 2;
const SUITS = ["S", "H", "C", "D"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const PLAYGROUND = [
    "col_0", "col_1", "col_2", "col_3",
    "col_4", "col_5", "col_6"
];
const CELLS = [
    "ph_0", "ph_1"
];
const GOALS = [
    "goal_spades", "goal_hearts", "goal_clubs", "goal_diamonds"
];
const DRAG_DROP = new DragDrop();
const CARDS = new Map();
const DECK = new CardDeck();
let gameStorage = null;

// on card starts to drag - return if possibe
DRAG_DROP.onDragCallback = function(source, stack) {
    let buffer = Array.from(stack);
    let last = buffer.pop();
    while (!!buffer.length) {
        let next = buffer.pop();
        if (SUITS.indexOf(last.suit) % 2 == SUITS.indexOf(next.suit) % 2) {
            return false;
        }
        if (VALUES.indexOf(last.value) != VALUES.indexOf(next.value) - 1) {
            return false;
        }
        last = next;
    }
    return true;
}

// on card starts to drop - return if possibe
DRAG_DROP.onDropCallback = function(source, target, stack) {
    if (target instanceof PlayingCardColumn) {
        let last = target.lastElementChild;
        let first = stack[0];
        if (!!last) {
            if (SUITS.indexOf(last.suit) % 2 != SUITS.indexOf(first.suit) % 2) {
                if (VALUES.indexOf(last.value) == VALUES.indexOf(first.value) + 1) {
                    return true;
                }
            }
        } else {
            return true;
        }
        return false;
    }
    if (target instanceof PlayingCardPlaceholder) {
        if (!target.children.length && stack.length == 1) {
            return true;
        }
        return false;
    }
    if (target instanceof PlayingCardGoal) {
        if (stack.length == 1) {
            let last = target.lastElementChild;
            let first = stack[0];
            if (target.suit == first.suit) {
                if (!!last) {
                    if (VALUES.indexOf(last.value) == VALUES.indexOf(first.value) - 1) {
                        return true;
                    }
                } else if (VALUES.indexOf(first.value) == 0) {
                    return true;
                }
            }
        }
        return false;
    }
}

// on card changed place
DRAG_DROP.onDropChangedCallback = async function(source, target, stack) {
    autoStack();
    if (checkWin()) {
        await gameStorage.reset();
        MENU_WIN.show();
    } else {
        await gameStorage.save();
        let last = source.lastElementChild;
        if (!!last) {
            last.revealed = true;
        }
    }
}

async function startGame() {
    if (!await gameStorage.load()) {
        await newGame();
    }
}

async function newGame() {
    let cols = [];
    for (let i of PLAYGROUND) {
        cols.push(document.getElementById(i));
    }
    DECK.collect();
    DECK.shuffle();
    for (let i = 0; i < cols.length; ++i) {
        for (let j = i; j < cols.length; ++j) {
            cols[j].append(DECK.draw());
        }
        let last = cols[i].lastElementChild;
        if (!!last) {
            last.revealed = true;
        }
    }
    //gameStorage.save();
}

function autoStack() {
    let changed = false;
    let goals = [];
    for (let i of GOALS) {
        goals.push(document.getElementById(i));
    }
    for (let i of PLAYGROUND.concat(CELLS)) {
        let col = document.getElementById(i);
        let first = col.lastElementChild;
        if (!!first) {
            let target = goals[SUITS.indexOf(first.suit)];
            let last = target.lastElementChild;
            if (!last && VALUES.indexOf(first.value) == 0) {
                target.append(first);
                changed = true;
            } else if (!!last && VALUES.indexOf(last.value) + 1 == VALUES.indexOf(first.value)) {
                function checkGoals(goal) {
                    if (!goal.lastElementChild) {
                        return VALUES.indexOf(first.value) < AUTOSTACK_DIFF;
                    } else {
                        return VALUES.indexOf(first.value) <= VALUES.indexOf(goal.lastElementChild.value) + AUTOSTACK_DIFF;
                    }
                }
                if (goals.every(checkGoals)) {
                    target.append(first);
                    changed = true;
                }
            }
        }
    }
    if (changed) {
        autoStack();
    }
}

function checkWin() {
    for (let i of PLAYGROUND.concat(CELLS)) {
        if (document.getElementById(i).children.length != 0) {
            return false;
        }
    }
    return true;
}

!async function() {
    let card_theme = await SettingsStorage.get("card_theme", "french");
    let card_back = await SettingsStorage.get("card_back", "fiber_red");

    let pg_els = [];
    for (let i of PLAYGROUND) {
        pg_els.push(document.getElementById(i));
    }
    for (let i of CELLS) {
        pg_els.push(document.getElementById(i));
    }
    for (let i of GOALS) {
        pg_els.push(document.getElementById(i));
    }
    DRAG_DROP.registerDropTarget(pg_els);

    createDeck(card_back, card_theme);
    gameStorage = new GameStorage(GAME_NAME, PLAYGROUND.concat(CELLS).concat(GOALS), CARDS);
    
    // buttons
    document.getElementById("menu_button").addEventListener("click", function(event) {
        MENU_PAUSE.show();
    });
    document.getElementById("undo_button").addEventListener("click", async function(event) {
        await gameStorage.undo();
    });

    startGame();
}();

function createDeck(card_back, card_theme) {
    for (let suit of SUITS) {
        for (let value of VALUES) {
            let el = document.createElement('cgc-playingcard');
            el.back = card_back;
            el.theme = card_theme;
            el.suit = suit;
            el.value = value;
            el.revealed = false;
            DECK.add(el);
            CARDS.set(`${suit}_${value}`, el);
            DRAG_DROP.registerDragElement(el);
        }
    }
}