import IDBStorage from "/src/util/IDBStorage.js";
import Template from "/src/util/Template.js";
import DragDrop from "/src/util/DragDrop.js";
import PlayingCardColumn from "/src/ui/PlayingCardColumn.js";
import PlayingCardPlaceholder from "/src/ui/PlayingCardPlaceholder.js";
import PlayingCardGoal from "/src/ui/PlayingCardGoal.js";
import "/src/ui/PlayingCard.js";
import Dialog from "/src/ui/Dialog.js";

const TPL = new Template(`
    <style>
        :host {
            width: 100vw;
            height: 100vh;
            --card-width: 10vw;
        }
        #playground {
            box-sizing: border-box;
            width: 100vw;
            height: 100vh;
            padding: 20px;
        }
        #top-row {
            display: grid;
            justify-content: center;
            justify-items: center;
            grid-template-columns: repeat(4, 10vw) 5vw repeat(4, 10vw);
            grid-gap: 1vw;
        }
        #game-board {
            display: grid;
            justify-content: center;
            justify-items: center;
            grid-template-columns: repeat(8, 10vw);
            grid-gap: 1vw;
            margin-top: 20px;
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
        #menu_wrapper {
            position: absolute;
            display: none;
            align-items: center;
            justify-content: center;
            top: 0px;
            left: 0px;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(2px);
        }
        #menu_wrapper.open {
            display: flex;
        }
        #menu {
            display: inline-flex;
            flex-direction: column;
            padding: 50px;
            background: #a553c7;
            border-radius: calc(1vw * var(--card-scale, 1));
            box-shadow: inset 0px 0px 0px 4px rgba(255,255,255,0.5);
        }
        button {
            padding: 10px;
            margin-bottom: 4px;
            border-radius: calc(1vw * var(--card-scale, 1));
            box-shadow: inset 0px 0px 0px 2px rgba(255,255,255,0.7);
            color: rgba(255,255,255,0.7);
            background-color: transparent;
            border: none;
            -webkit-appearance: none;
            cursor: pointer;
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
    </style>
    <div id="playground">
        <div id="top-row">
            <cgc-playingcardplaceholder id="ph_0"></cgc-playingcardplaceholder>
            <cgc-playingcardplaceholder id="ph_1"></cgc-playingcardplaceholder>
            <cgc-playingcardplaceholder id="ph_2"></cgc-playingcardplaceholder>
            <cgc-playingcardplaceholder id="ph_3"></cgc-playingcardplaceholder>
            <div>
                <button id="menu_button">MENU</button>
                <button id="undo_button">UNDO</button>
            </div>
            <cgc-playingcardgoal id="goal_spades" theme="french" suit="S"></cgc-playingcardgoal>
            <cgc-playingcardgoal id="goal_hearts" theme="french" suit="H"></cgc-playingcardgoal>
            <cgc-playingcardgoal id="goal_clubs" theme="french" suit="C"></cgc-playingcardgoal>
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
    <div id="menu_wrapper">
        <div id="menu">
            <button id="resume_game_button">RESUME</button>
            <button id="restart_game_button">RESTART</button>
            <button id="new_game_button">NEW GAME</button>
            <button id="quit_game_button" disabled>QUIT</button>
        </div>
    </div>
`);

let SettingsStorage = new IDBStorage("settings");
let GameStorage = new IDBStorage("games");

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

export default class FreeCell extends HTMLElement {

    constructor() {
        super();
        CARDS.set(this, {});
        DECK.set(this, []);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());

        let dragDrop = new DragDrop();
        DRAG_DROP.set(this, dragDrop);

        dragDrop.onDropCallback = function(target, stack) {
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
        }.bind(this);

        dragDrop.onDragCallback = function(stack) {
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

        dragDrop.onDropChangedCallback = async function(source, target, stack) {
            let savestate = await GameStorage.get("freecell");
            savestate.steps.push(savestate.current);
            savestate.current = this.getState();
            await GameStorage.set("freecell", savestate);
        }.bind(this);

        // create playground
        let pg_els = [];
        for (let i of PLAYGROUND) {
            pg_els.push(this.shadowRoot.getElementById(i));
        }
        dragDrop.registerDropTarget(pg_els);

        // buttons
        this.shadowRoot.getElementById("new_game_button").addEventListener("click", async function(event) {
            if (await Dialog.confirm("New game?", "Do you want to start a new game?")) {
                await this.newGame();
                this.shadowRoot.getElementById("menu_wrapper").classList.remove('open');
            }
        }.bind(this));
        this.shadowRoot.getElementById("restart_game_button").addEventListener("click", async function(event) {
            if (await Dialog.confirm("Restart game?", "Do you want to restart the current game?")) {
                let savestate = await GameStorage.get("freecell");
                if (!!savestate.steps.length) {
                    savestate.current = savestate.steps[0];
                    savestate.steps = [];
                    await GameStorage.set("freecell", savestate);
                    this.setState(savestate.current);
                }
                this.shadowRoot.getElementById("menu_wrapper").classList.remove('open');
            }
        }.bind(this));
        this.shadowRoot.getElementById("menu_button").addEventListener("click", async function(event) {
            this.shadowRoot.getElementById("menu_wrapper").classList.add('open');
        }.bind(this));
        this.shadowRoot.getElementById("resume_game_button").addEventListener("click", async function(event) {
            this.shadowRoot.getElementById("menu_wrapper").classList.remove('open');
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

}

customElements.define('cgc-freecell', FreeCell);