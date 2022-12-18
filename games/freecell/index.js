import IDBStorage from "/src/util/IDBStorage.js";
import GameStorage from "/src/util/GameStorage.js";
import DragDrop from "/src/util/DragDrop.js";
import CardDeck from "/src/util/CardDeck.js";
import WinCondition from "/src/util/WinCondition.js";
import PlayingCardColumn from "/src/ui/PlayingCardColumn.js";
import PlayingCardPlaceholder from "/src/ui/PlayingCardPlaceholder.js";
import PlayingCardGoal from "/src/ui/PlayingCardGoal.js";
import "/src/ui/PlayingCard.js";
import Menu from "/src/ui/Menu.js";
import Dialog from "/src/ui/Dialog.js";
import Settings from "/src/ui/Settings.js";

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
}

document.body.style.setProperty("--card-scale", "1");
document.body.style.setProperty("--background-color", "#00aa33");

const SettingsStorage = new IDBStorage("settings");

// create menus
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
}], true);
const MENU_PAUSE = new Menu({
    title: "PAUSE",
    buttons: [{
        content: "RESUME",
        action: Menu.CLOSE
    }, {
        content: "RESTART",
        handler: async function() {
            if (await Dialog.confirm("Do you want to restart the current game?")) {
                await gameStorage.restart();
                return true;
            }
            return false;
        }
    }, {
        content: "NEW GAME",
        handler: async function() {
            if (await Dialog.confirm("Do you want to start a new game?")) {
                await newGame();
                return true;
            }
            return false;
        }
    }, {
        content: "SETTINGS",
        handler: async function() {
            SETTINGS.show();
            return false;
        }
    }, {
        content: "QUIT",
        action: Menu.QUIT_FRAME
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
    }, {
        content: "QUIT",
        action: Menu.BACK
    }]
});

const GAME_NAME = "freecell";
const AUTOSTACK_DIFF = 2;
const SUITS = ["S", "H", "C", "D"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const PLAYGROUND = [
    "col_0", "col_1", "col_2", "col_3",
    "col_4", "col_5", "col_6", "col_7"
];
const CELLS = [
    "ph_0", "ph_1", "ph_2", "ph_3"
];
const GOALS = [
    "goal_spades", "goal_hearts", "goal_clubs", "goal_diamonds"
];
const DRAG_DROP = new DragDrop();
const CARDS = new Map();
const DECK = new CardDeck();
let gameStorage = null;

WinCondition.set({
    goal_spades:   ["S_A", "S_2", "S_3", "S_4", "S_5", "S_6", "S_7", "S_8", "S_9", "S_10", "S_J", "S_Q", "S_K"],
    goal_hearts:   ["H_A", "H_2", "H_3", "H_4", "H_5", "H_6", "H_7", "H_8", "H_9", "H_10", "H_J", "H_Q", "H_K"],
    goal_clubs:    ["C_A", "C_2", "C_3", "C_4", "C_5", "C_6", "C_7", "C_8", "C_9", "C_10", "C_J", "C_Q", "C_K"],
    goal_diamonds: ["D_A", "D_2", "D_3", "D_4", "D_5", "D_6", "D_7", "D_8", "D_9", "D_10", "D_J", "D_Q", "D_K"]
});

// on card starts to drag - return if possibe
DRAG_DROP.onDragCallback = function(source, stack) {
    const buffer = Array.from(stack);
    let last = buffer.pop();
    while (buffer.length) {
        const next = buffer.pop();
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
        const last = target.lastElementChild;
        const first = stack[0];
        if (last) {
            if (SUITS.indexOf(last.suit) % 2 != SUITS.indexOf(first.suit) % 2) {
                if (VALUES.indexOf(last.value) == VALUES.indexOf(first.value) + 1) {
                    return isTurnPossible(source, target, stack);
                }
            }
        } else {
            return isTurnPossible(source, target, stack);
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
            const last = target.lastElementChild;
            const first = stack[0];
            if (target.suit == first.suit) {
                if (last) {
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
DRAG_DROP.onDropChangedCallback = async function(/* source, target, stack */) {
    autoStack();
    if (WinCondition.check()) {
        await gameStorage.reset();
        MENU_WIN.show();
    } else {
        await gameStorage.save();
    }
}

async function startGame() {
    if (!await gameStorage.load()) {
        await newGame();
    }
}

async function newGame() {
    await gameStorage.reset();
    const cols = [];
    for (const i of PLAYGROUND) {
        cols.push(document.getElementById(i));
    }
    DECK.shuffle();
    for (let i = 0; i < DECK.length; ++i) {
        const card = DECK.draw();
        card.revealed = true;
        cols[i % cols.length].append(card);
    }
    await gameStorage.save();
}

function autoStack() {
    let changed = false;
    const goals = [];
    for (const i of GOALS) {
        goals.push(document.getElementById(i));
    }
    for (const i of PLAYGROUND.concat(CELLS)) {
        const col = document.getElementById(i);
        const first = col.lastElementChild;
        if (first) {
            const target = goals[SUITS.indexOf(first.suit)];
            const last = target.lastElementChild;
            if (!last && VALUES.indexOf(first.value) == 0) {
                target.append(first);
                changed = true;
            } else if (!!last && VALUES.indexOf(last.value) + 1 == VALUES.indexOf(first.value)) {
                const checkGoals = (goal) => {
                    if (!goal.lastElementChild) {
                        return VALUES.indexOf(first.value) < AUTOSTACK_DIFF;
                    } else {
                        return VALUES.indexOf(first.value) <= VALUES.indexOf(goal.lastElementChild.value) + AUTOSTACK_DIFF;
                    }
                };
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

function isTurnPossible(source, target, stack) {
    let freeCells = 0;
    let freeCols = 0;
    for (const i of CELLS) {
        const el = document.getElementById(i);
        if (!el.children.length) {
            freeCells++;
        }
    }
    for (const i of PLAYGROUND) {
        const el = document.getElementById(i);
        if (!el.children.length && el != source && el != target) {
            freeCols++;
        }
    }
    return stack.length <= (2 ** freeCols) * (freeCells + 1);
}

SETTINGS.addEventListener("submit", (event) =>{
    const orientation = event.data["main.orientation"] ?? "";
    if (orientation != "") {
        screen.orientation.lock(orientation);
    } else {
        screen.orientation.unlock();
    }
});

(async function() {
    const card_theme = await SettingsStorage.get("main.card_theme", "french");
    const card_back = await SettingsStorage.get("main.ard_back", "fiber_red");
    const orientation = await SettingsStorage.get("main.orientation", "");
    if (orientation != "") {
        screen.orientation.lock(orientation);
    } else {
        screen.orientation.unlock();
    }

    const pg_els = [];
    for (const i of PLAYGROUND) {
        pg_els.push(document.getElementById(i));
    }
    for (const i of CELLS) {
        pg_els.push(document.getElementById(i));
    }
    for (const i of GOALS) {
        pg_els.push(document.getElementById(i));
    }
    DRAG_DROP.registerDropTarget(pg_els);

    createDeck(card_back, card_theme);
    gameStorage = new GameStorage(GAME_NAME, PLAYGROUND.concat(CELLS).concat(GOALS), CARDS);

    // buttons
    document.getElementById("menu_button").addEventListener("click", () => {
        MENU_PAUSE.show();
    });
    document.getElementById("undo_button").addEventListener("click", async () => {
        await gameStorage.undo();
    });

    startGame();
})();

function createDeck(card_back, card_theme) {
    for (const suit of SUITS) {
        for (const value of VALUES) {
            const el = document.createElement("cgc-playingcard");
            el.back = card_back;
            el.theme = card_theme;
            el.suit = suit;
            el.value = value;
            el.revealed = true;
            DECK.add(el);
            CARDS.set(`${suit}_${value}`, el);
            DRAG_DROP.registerDragElement(el);
        }
    }
}
