import IDBStorage from "/src/util/IDBStorage.js";
import Template from "/src/util/Template.js";
import DragDrop from "/src/util/DragDrop.js";
import PlayingCardColumn from "/src/ui/PlayingCardColumn.js";
import PlayingCardPlaceholder from "/src/ui/PlayingCardPlaceholder.js";
import PlayingCardGoal from "/src/ui/PlayingCardGoal.js";
import "/src/ui/PlayingCard.js";
import Menu from "/src/ui/Menu.js";
import Dialog from "/src/ui/Dialog.js";

const TPL = new Template(`
    <style>
        :host {
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            --card-scale: 1;
        }
        #playground {
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            width: 100vw;
            height: 100vh;
            padding: 2vw;
        }
        #top-row {
            display: grid;
            justify-content: center;
            justify-items: center;
            grid-template-columns: repeat(4, calc(8vw * var(--card-scale, 1))) 10vw repeat(4, calc(8vw * var(--card-scale, 1)));
            grid-gap: 2vw;
            height: calc(12vw * var(--card-scale, 1));
        }
        #game-board {
            display: grid;
            justify-content: center;
            justify-items: center;
            grid-template-columns: repeat(8, calc(8vw * var(--card-scale, 1)));
            grid-gap: 2vw;
            flex: 1;
            margin-top: 2vw;
        }
        #goal_spades,
        #goal_hearts,
        #goal_clubs,
        #goal_diamonds {
            background-repeat: no-repeat;
            background-size: contain;
            background-position: center;
            background-origin: content-box;
        }
        .game-buttons {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        button {
            padding: 1vw;
            margin: .5vw;
            border-radius: 1vw;
            box-shadow: inset 0px 0px 0px 2px rgba(255,255,255,0.7);
            color: rgba(255,255,255,0.7);
            background-color: transparent;
            border: none;
            -webkit-appearance: none;
            cursor: pointer;
            font-size: 2vw;
        }
        button.hide {
            display: none;
        }
        button:hover {
            background-color: rgba(255,255,255,0.2);
        }
        button:disabled {
            box-shadow: inset 0px 0px 0px 2px rgba(255,255,255,0.2);
            color: rgba(255,255,255,0.2);
            cursor: default;
            background-color: transparent;
        }
        button:focus {
            outline: none;
        }
        #top-row button {
            width: 10vw;
        }
        #top-row button {
            width: 10vw;
        }
    </style>
    <div id="playground">
        <div id="top-row">
            <cgc-playingcardplaceholder id="ph_0"></cgc-playingcardplaceholder>
            <cgc-playingcardplaceholder id="ph_1"></cgc-playingcardplaceholder>
            <cgc-playingcardplaceholder id="ph_2"></cgc-playingcardplaceholder>
            <cgc-playingcardplaceholder id="ph_3"></cgc-playingcardplaceholder>
            <div class="game-buttons">
                <button id="menu_button">MENU</button>
                <button id="undo_button">UNDO</button>
            </div>
            <cgc-playingcardgoal id="goal_clubs" theme="french" suit="C"></cgc-playingcardgoal>
            <cgc-playingcardgoal id="goal_spades" theme="french" suit="S"></cgc-playingcardgoal>
            <cgc-playingcardgoal id="goal_hearts" theme="french" suit="H"></cgc-playingcardgoal>
            <cgc-playingcardgoal id="goal_diamonds" theme="french" suit="D"></cgc-playingcardgoal>
        </div>
        <div id="game-board">
            <cgc-playingcardcolumn id="col_0"></cgc-playingcardcolumn>
            <cgc-playingcardcolumn id="col_1"></cgc-playingcardcolumn>
            <cgc-playingcardcolumn id="col_2"></cgc-playingcardcolumn>
            <cgc-playingcardcolumn id="col_3"></cgc-playingcardcolumn>
            <cgc-playingcardcolumn id="col_4"></cgc-playingcardcolumn>
            <cgc-playingcardcolumn id="col_5"></cgc-playingcardcolumn>
            <cgc-playingcardcolumn id="col_6"></cgc-playingcardcolumn>
            <cgc-playingcardcolumn id="col_7"></cgc-playingcardcolumn>
        </div>
    </div>
`);

let SettingsStorage = new IDBStorage("settings");
let GameStorage = new IDBStorage("games");

const MENU_PAUSE = new WeakMap();
const MENU_WIN = new WeakMap();

const AUTOSTACK_DIFF = 2;
const SUITS = ["S", "H", "C", "D"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const PLAYGROUND = [
    "col_0", "col_1", "col_2", "col_3",
    "col_4", "col_5", "col_6", "col_7",
    "ph_0", "ph_1", "ph_2", "ph_3",
    "goal_spades", "goal_hearts", "goal_clubs", "goal_diamonds"
];

const CARDS = new WeakMap();
const DECK = new WeakMap();
const DRAG_DROP = new WeakMap();

function shuffleDeck(arr) {
    let res = [];
    while (arr.length > 0) {
        let card = arr.splice(Math.floor(Math.random() * arr.length), 1)[0];
        res.push(card);
    }
    return res;
}

async function onRestartGame() {
    if (await Dialog.confirm("Do you want to restart the current game?")) {
        let savestate = await GameStorage.get("freecell");
        if (!!savestate.steps.length) {
            savestate.current = savestate.steps[0];
            savestate.steps = [];
            await GameStorage.set("freecell", savestate);
            this.setState(savestate.current);
        }
        return true;
    }
    return false;
}

async function onNewGame() {
    if (await Dialog.confirm("Do you want to start a new game?")) {
        await this.newGame();
        return true;
    }
    return false;
}

async function onNextGame() {
    await this.newGame();
    return true;
}

async function onQuitGame() {
    this.dispatchEvent(new Event('close'));
    return true;
}

export default class FreeCell extends HTMLElement {

    constructor() {
        super();
        CARDS.set(this, {});
        DECK.set(this, []);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());

        let dragDrop = new DragDrop();
        DRAG_DROP.set(this, dragDrop);

        // on card starts to drag - return if possibe
        dragDrop.onDragCallback = function(source, stack) {
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
        }.bind(this);

        // on card starts to drop - return if possibe
        dragDrop.onDropCallback = function(source, target, stack) {
            if (target instanceof PlayingCardColumn) {
                let last = target.lastElementChild;
                let first = stack[0];
                if (!!last) {
                    if (SUITS.indexOf(last.suit) % 2 != SUITS.indexOf(first.suit) % 2) {
                        if (VALUES.indexOf(last.value) == VALUES.indexOf(first.value) + 1) {
                            return this.isTurnPossible(source, target, stack);
                        }
                    }
                } else {
                    return this.isTurnPossible(source, target, stack);
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
        }.bind(this);

        // on card changed place
        dragDrop.onDropChangedCallback = async function(source, target, stack) {
            this.autoStack();
            if (this.checkWin()) {
                await GameStorage.set("freecell", null);
                MENU_WIN.get(this).show();
            } else {
                let savestate = await GameStorage.get("freecell");
                savestate.steps.push(savestate.current);
                savestate.current = this.getState();
                await GameStorage.set("freecell", savestate);
            }
        }.bind(this);

        // create playground
        let pg_els = [];
        for (let i of PLAYGROUND) {
            pg_els.push(this.shadowRoot.getElementById(i));
        }
        dragDrop.registerDropTarget(pg_els);

        // create menus
        MENU_PAUSE.set(this, new Menu({
            title: "PAUSE",
            buttons: [{
                content: "RESUME",
                handler: true
            },{
                content: "RESTART",
                handler: onRestartGame.bind(this)
            },{
                content: "NEW GAME",
                handler: onNewGame.bind(this)
            },{
                content: "QUIT",
                handler: onQuitGame.bind(this)
            }]
        }));
        MENU_WIN.set(this, new Menu({
            title: "WIN!",
            buttons: [{
                content: "NEW GAME",
                handler: onNextGame.bind(this)
            },{
                content: "QUIT",
                handler: onQuitGame.bind(this)
            }]
        }));

        // buttons
        this.shadowRoot.getElementById("menu_button").addEventListener("click", function(event) {
            MENU_PAUSE.get(this).show();
        }.bind(this));
        this.shadowRoot.getElementById("undo_button").addEventListener("click", async function(event) {
            let savestate = await GameStorage.get("freecell");
            if (!!savestate.steps.length) {
                savestate.current = savestate.steps.pop();
                await GameStorage.set("freecell", savestate);
                this.setState(savestate.current);
            }
        }.bind(this));
    }

    async init() {
        let dragDrop = DRAG_DROP.get(this);
        let cards = CARDS.get(this);
        let deck = DECK.get(this);
        let card_theme = await SettingsStorage.get("card_theme", "french");
        let card_back = await SettingsStorage.get("card_back", "fiber_red");
        for (let suit of SUITS) {
            for (let value of VALUES) {
                let el = document.createElement('cgc-playingcard');
                el.back = card_back;
                el.theme = card_theme;
                el.suit = suit;
                el.value = value;
                el.revealed = true;
                deck.push(el);
                cards[`${suit}_${value}`] = el;
                dragDrop.registerDragElement(el);
            }
        }
    }

    async startGame() {
        let savestate = await GameStorage.get("freecell");
        if (!!savestate) {
            this.setState(savestate.current);
        } else {
            await this.newGame();
        }
    }

    async newGame() {
        let cols = [];
        for (let i of PLAYGROUND.slice(0,8)) {
            cols.push(this.shadowRoot.getElementById(i));
        }
        let deck = shuffleDeck(DECK.get(this));
        DECK.set(this, deck);
        for (let i = 0; i < deck.length; ++i) {
            cols[i%8].append(deck[i]);
        }
        await GameStorage.set("freecell", {
            current: this.getState(),
            steps: []
        });
    }
    
    getState() {
        let res = {};
        for (let i of PLAYGROUND) {
            res[i] = [];
            let cards = this.shadowRoot.getElementById(i).children;
            Array.from(cards).forEach(el => res[i].push({
                suit: el.suit,
                value: el.value,
                revealed: el.revealed
            }));
        }
        return res;
    }

    setState(state) {
        let cards = CARDS.get(this);
        for (let i of PLAYGROUND) {
            let data = state[i];
            let target = this.shadowRoot.getElementById(i);
            data.forEach(el => {
                let card = cards[`${el.suit}_${el.value}`];
                card.revealed = el.revealed;
                target.append(card);
            });
        }
    }
    
    autoStack() {
        let changed = false;
        let goals = [];
        for (let i of PLAYGROUND.slice(12,16)) {
            goals.push(this.shadowRoot.getElementById(i));
        }
        for (let i of PLAYGROUND.slice(0,12)) {
            let col = this.shadowRoot.getElementById(i);
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
            this.autoStack();
        }
    }

    checkWin() {
        for (let i of PLAYGROUND.slice(0,12)) {
            if (this.shadowRoot.getElementById(i).children.length != 0) {
                return false;
            }
        }
        return true;
    }
    
    isTurnPossible(source, target, stack) {
        let freeCells = 0;
        let freeCols = 0;
        for (let i of PLAYGROUND.slice(8,12)) {
            let el = this.shadowRoot.getElementById(i);
            if (!el.children.length) {
                freeCells++;
            }
        }
        for (let i of PLAYGROUND.slice(0,8)) {
            let el = this.shadowRoot.getElementById(i);
            if (!el.children.length && el != source && el != target) {
                freeCols++;
            }
        }
        return stack.length <= (2 ** freeCols) * (freeCells + 1);
    }

}

customElements.define('cgc-freecell', FreeCell);