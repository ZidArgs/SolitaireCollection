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

    gameSettingsOverlay.addEventListener("submit", (event) => {
        const {changes} = event;
        if (Object.keys(changes).some((key) => gameSettingsResource.get(key) != null)) {
            newGame();
        }
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
                newGame();
                return true;
            }
            return false;
        }
    }, {
        content: "SETTINGS",
        handler: function() {
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
        handler: function() {
            newGame();
            return true;
        }
    }, {
        content: "QUIT",
        action: MenuActionEnum.BACK
    }]
});

// === INIT GAME ===
const GAME_NAME = "freecell";
const AUTOSTACK_DIFF = 2;
const CARD_SUITS = CardDeck52.SUITS;
const CARD_VALUES = CardDeck52.VALUES;
const PLAYGROUND = [
    "col_0", "col_1", "col_2", "col_3",
    "col_4", "col_5", "col_6", "col_7"
];
const PLACEHOLDER_CELLS = [
    "ph_0", "ph_1", "ph_2", "ph_3"
];
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
for (const i of PLACEHOLDER_CELLS) {
    const el = document.getElementById(i);
    el.allowDrop = allowDropOnPlaceholder;
    GAME_ELEMENT_HOLDER_MAP.addHolder(i, el);
}
for (const i of GOALS) {
    const el = document.getElementById(i);
    el.allowDrop = allowDropOnGoal;
    GAME_ELEMENT_HOLDER_MAP.addHolder(i, el);
}
DRAG_DROP.setGameElements(CARD_DECK, GAME_ELEMENT_HOLDER_MAP);

const gameStorage = new GameState(GAME_NAME, CARD_DECK, GAME_ELEMENT_HOLDER_MAP);
const WIN_CONDITION = new SortGameWinCondition();
WIN_CONDITION.setCondition(GAME_ELEMENT_HOLDER_MAP.getHolder("goal_spades"), CARD_VALUES.map((value) => ({value})));
WIN_CONDITION.setCondition(GAME_ELEMENT_HOLDER_MAP.getHolder("goal_hearts"), CARD_VALUES.map((value) => ({value})));
WIN_CONDITION.setCondition(GAME_ELEMENT_HOLDER_MAP.getHolder("goal_clubs"), CARD_VALUES.map((value) => ({value})));
WIN_CONDITION.setCondition(GAME_ELEMENT_HOLDER_MAP.getHolder("goal_diamonds"), CARD_VALUES.map((value) => ({value})));

function allowDropOnPlayground(target, stack, source) {
    const last = target.lastElementChild;
    const first = stack[0];
    if (last) {
        if (CARD_SUITS.indexOf(last.suit) % 2 != CARD_SUITS.indexOf(first.suit) % 2) {
            if (CARD_VALUES.indexOf(last.value) == CARD_VALUES.indexOf(first.value) + 1) {
                return isTurnPossible(source, target, stack);
            }
        }
    } else {
        return isTurnPossible(source, target, stack);
    }
    return false;
}

function allowDropOnPlaceholder(target, stack) {
    if (!target.children.length && stack.length == 1) {
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
                if (CARD_VALUES.indexOf(last.value) == CARD_VALUES.indexOf(first.value) - 1) {
                    return true;
                }
            } else if (CARD_VALUES.indexOf(first.value) == 0) {
                return true;
            }
        }
    }
    return false;
}

function isTurnPossible(source, target, stack) {
    let freeCells = 0;
    let freeCols = 0;
    for (const i of PLACEHOLDER_CELLS) {
        const el = GAME_ELEMENT_HOLDER_MAP.getHolder(i);
        if (!el.children.length) {
            freeCells++;
        }
    }
    for (const i of PLAYGROUND) {
        const el = GAME_ELEMENT_HOLDER_MAP.getHolder(i);
        if (!el.children.length && el != source && el != target) {
            freeCols++;
        }
    }
    return stack.length <= (2 ** freeCols) * (freeCells + 1);
}

// on card starts to drag - return if possibe
DRAG_DROP.onDragCallback = function(source, stack) {
    const buffer = Array.from(stack);
    let last = buffer.pop();
    while (buffer.length) {
        const next = buffer.pop();
        if (CARD_SUITS.indexOf(last.suit) % 2 == CARD_SUITS.indexOf(next.suit) % 2) {
            return false;
        }
        if (CARD_VALUES.indexOf(last.value) != CARD_VALUES.indexOf(next.value) - 1) {
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
DRAG_DROP.onDropChangedCallback = function(/* source, target, stack */) {
    autoStack();
    if (WIN_CONDITION.check()) {
        gameStorage.reset();
        MENU_WIN.show();
    } else {
        gameStorage.save();
    }
};

function newGame() {
    gameStorage.reset();
    const cols = [];
    for (const i of PLAYGROUND) {
        cols.push(GAME_ELEMENT_HOLDER_MAP.getHolder(i));
    }
    CARD_DECK.collect();
    CARD_DECK.shuffle();
    for (let i = 0; i < CARD_DECK.size; ++i) {
        const card = CARD_DECK.draw();
        card.revealed = true;
        cols[i % cols.length].append(card);
    }
    gameStorage.save();
}

function autoStack() {
    let changed = false;
    const goals = [];
    for (const i of GOALS) {
        goals.push(GAME_ELEMENT_HOLDER_MAP.getHolder(i));
    }
    for (const i of PLAYGROUND.concat(PLACEHOLDER_CELLS)) {
        const col = GAME_ELEMENT_HOLDER_MAP.getHolder(i);
        const first = col.lastElementChild;
        if (first) {
            const target = goals[CARD_SUITS.indexOf(first.suit)];
            const last = target.lastElementChild;
            if (!last && CARD_VALUES.indexOf(first.value) == 0) {
                target.append(first);
                changed = true;
            } else if (!!last && CARD_VALUES.indexOf(last.value) + 1 == CARD_VALUES.indexOf(first.value)) {
                const checkGoals = (goal) => {
                    if (!goal.lastElementChild) {
                        return CARD_VALUES.indexOf(first.value) < AUTOSTACK_DIFF;
                    } else {
                        return CARD_VALUES.indexOf(first.value) <= CARD_VALUES.indexOf(goal.lastElementChild.value) + AUTOSTACK_DIFF;
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
document.getElementById("undo_button").addEventListener("click", () => {
    gameStorage.undo();
});

if (gameStorage.isNew()) {
    newGame();
}
