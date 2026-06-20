import Path from "@emcjs/core/util/file/Path.js";
import i18n from "@emcjs/core/util/I18n.js";
import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";
import GameState from "../../script/savestate/GameState.js";
import GameSettingsOverlay from "../../script/ui/settings/GameSettingsOverlay.js";
import SettingsObserver from "../../script/util/observer/SettingsObserver.js";
import CardDeck52 from "../../script/state/playingcard/CardDeck52.js";
import GameElementHolderMap from "../../script/state/GameElementHolderMap.js";
import DragDrop from "../../script/util/DragDrop.js";
import SortGameWinCondition from "../../script/util/wincondition/SortGameWinCondition.js";
import "../../script/ui/game/playingcard/PlayingCardStack.js";
import "../../script/ui/game/playingcard/PlayingCard.js";
import Menu from "../../script/ui/Menu.js";
import MenuActionEnum from "../../script/enum/MenuActionEnum.js";
import ModalDialog from "@emcjs/fe/ui/modal/ModalDialog.js";
import GameSettingsConfigHandler from "../../script/util/settings/GameSettingsConfigHandler.js";
import AppSettingsResource from "../../script/resource/AppSettingsResource.js";
import PlayingcardSettingsResource from "../../script/resource/PlayingcardSettingsResource.js";
import SettingsStorage from "../../script/storage/SettingsStorage.js";

const MODULE_PATH = new Path(import.meta.url);

// === INIT BASE ===
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
}
await i18n.loadTranslations();

const SETTINGS = await (async () => { // settings
    const settingsPath = MODULE_PATH.getAbsolute("./settings.json");
    const gameSettingsResource = await JSONCResource.get(settingsPath);
    const settings = {
        ...AppSettingsResource.get(),
        ...PlayingcardSettingsResource.get(),
        ...gameSettingsResource.get()
    };
    const gameSettingsConfigHandler = new GameSettingsConfigHandler(settings);
    await SettingsStorage.addCustomDefaultValues(gameSettingsConfigHandler.defaultValues);
    const gameSettingsOverlay = new GameSettingsOverlay(gameSettingsConfigHandler);

    gameSettingsOverlay.addEventListener("submit", () => {
        newGame();
    });

    const orientationObserver = new SettingsObserver("general.orientation");
    setOrientation(orientationObserver.value);
    orientationObserver.onChange(() => {
        setOrientation(orientationObserver.value);
    });

    function setOrientation(orientation) {
        if (orientation != "") {
            screen.orientation.lock(orientation);
        } else {
            screen.orientation.unlock();
        }
    }

    return gameSettingsOverlay;
})();

document.body.style.setProperty("--card-scale", "1");
document.body.style.setProperty("--background-color", "#00aa33");

// === INIT MENUS ===
const MENU_PAUSE = new Menu({
    title: "PAUSE",
    buttons: [{
        content: "RESUME",
        action: MenuActionEnum.CLOSE
    }, {
        content: "RESTART",
        handler: async function() {
            if (await ModalDialog.confirm("Do you want to restart the current game?")) {
                gameStorage.restart();
                return true;
            }
            return false;
        }
    }, {
        content: "NEW GAME",
        handler: async function() {
            if (await ModalDialog.confirm("Do you want to start a new game?")) {
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
        action: MenuActionEnum.QUIT_FRAME
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
        action: MenuActionEnum.BACK
    }]
});

// === INIT GAME ===
const GAME_NAME = "klondike";
const AUTOSTACK_DIFF = 2;
const SUITS = ["S", "H", "C", "D"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const PLAYGROUND = [
    "col_0", "col_1", "col_2", "col_3",
    "col_4", "col_5", "col_6"
];
const DECK = "deck";
const DRAWER = "drawer";
const GOALS = [
    "goal_spades", "goal_hearts", "goal_clubs", "goal_diamonds"
];

const DRAG_DROP = new DragDrop();
const CARD_DECK = new CardDeck52();
const GAME_ELEMENT_HOLDER_MAP = new GameElementHolderMap();
for (const i of PLAYGROUND) {
    const el = document.getElementById(i);
    el.allowDrop = allowDropOnPlayground;
    GAME_ELEMENT_HOLDER_MAP.addHolder(i, el);
}
for (const i of GOALS) {
    const el = document.getElementById(i);
    el.allowDrop = allowDropOnGoal;
    GAME_ELEMENT_HOLDER_MAP.addHolder(i, el);
}
DRAG_DROP.setGameElements(CARD_DECK, GAME_ELEMENT_HOLDER_MAP);
{
    const cardDeckEl = document.getElementById(DECK);
    GAME_ELEMENT_HOLDER_MAP.addHolder(DECK, cardDeckEl);
    const cardDrawerEl = document.getElementById(DRAWER);
    GAME_ELEMENT_HOLDER_MAP.addHolder(DRAWER, cardDrawerEl);
}

const gameStorage = new GameState(GAME_NAME, CARD_DECK, GAME_ELEMENT_HOLDER_MAP);
const WIN_CONDITION = new SortGameWinCondition();
WIN_CONDITION.setCondition(GAME_ELEMENT_HOLDER_MAP.getHolder("goal_spades"), VALUES.map((value) => ["S", value]));
WIN_CONDITION.setCondition(GAME_ELEMENT_HOLDER_MAP.getHolder("goal_hearts"), VALUES.map((value) => ["H", value]));
WIN_CONDITION.setCondition(GAME_ELEMENT_HOLDER_MAP.getHolder("goal_clubs"), VALUES.map((value) => ["C", value]));
WIN_CONDITION.setCondition(GAME_ELEMENT_HOLDER_MAP.getHolder("goal_diamonds"), VALUES.map((value) => ["D", value]));

function allowDropOnPlayground(target, stack) {
    const last = target.lastElementChild;
    const first = stack[0];
    if (last) {
        if (SUITS.indexOf(last.suit) % 2 != SUITS.indexOf(first.suit) % 2) {
            if (VALUES.indexOf(last.value) == VALUES.indexOf(first.value) + 1) {
                return true;
            }
        }
    } else if (VALUES.indexOf(first.value) == VALUES.length - 1) {
        return true;
    }
    return false;
}

function allowDropOnGoal(target, stack) {
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
};

// on card starts to drop - return if possibe
DRAG_DROP.onDropCallback = function(source, target, stack) {
    return target.isDropAllowed(stack, source);
};

// on card changed place
DRAG_DROP.onDropChangedCallback = async function(/* source, target, stack */) {
    autoStack();
    if (WIN_CONDITION.check()) {
        await gameStorage.reset();
        MENU_WIN.show();
    } else {
        await gameStorage.save();
    }
};

async function newGame() {
    await gameStorage.reset();
    const cols = [];
    for (const i of PLAYGROUND) {
        cols.push(document.getElementById(i));
    }
    CARD_DECK.collect();
    CARD_DECK.shuffle();
    for (let i = 0; i < cols.length; ++i) {
        for (let j = i; j < cols.length; ++j) {
            cols[j].append(CARD_DECK.draw());
        }
        const last = cols[i].lastElementChild;
        if (last) {
            last.revealed = true;
        }
    }
    while (CARD_DECK.remaining) {
        document.getElementById(DECK).append(CARD_DECK.draw());
    }
    await gameStorage.save({drawn_cards: 1});
}

function autoStack() {
    let changed = false;
    const goals = [];
    for (const i of GOALS) {
        goals.push(document.getElementById(i));
    }
    for (const i of PLAYGROUND.concat([DRAWER])) {
        const col = document.getElementById(i);
        const first = col.lastElementChild;
        if (first) {
            first.revealed = true;
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

// buttons
document.getElementById("menu_button").addEventListener("click", () => {
    MENU_PAUSE.show();
});
document.getElementById("undo_button").addEventListener("click", async () => {
    await gameStorage.undo();
});

if (gameStorage.isNew()) {
    newGame();
}
