import IDBStorage from "/src/util/IDBStorage.js";
import Template from "/src/util/Template.js";
import DragDrop from "/src/util/DragDrop.js";
import PlayingCardColumn from "/src/ui/PlayingCardColumn.js";
import PlayingCardPlaceholder from "/src/ui/PlayingCardPlaceholder.js";
import PlayingCardGoal from "/src/ui/PlayingCardGoal.js";
import "/src/ui/PlayingCard.js";

const TPL = new Template(`
    <style>
        :host {
            --card-width: 10vw;
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
        #goal_spades {
            background-image: url("/img/playing_cards/placeholders/spades.svg")
        }
        #goal_hearts {
            background-image: url("/img/playing_cards/placeholders/hearts.svg")
        }
        #goal_clubs {
            background-image: url("/img/playing_cards/placeholders/clubs.svg")
        }
        #goal_diamonds {
            background-image: url("/img/playing_cards/placeholders/diamonds.svg")
        }
    </style>
    <div id="top-row">
        <cgc-playingcardplaceholder></cgc-playingcardplaceholder>
        <cgc-playingcardplaceholder></cgc-playingcardplaceholder>
        <cgc-playingcardplaceholder></cgc-playingcardplaceholder>
        <cgc-playingcardplaceholder></cgc-playingcardplaceholder>
        <div></div>
        <cgc-playingcardgoal id="goal_spades"></cgc-playingcardgoal>
        <cgc-playingcardgoal id="goal_hearts"></cgc-playingcardgoal>
        <cgc-playingcardgoal id="goal_clubs"></cgc-playingcardgoal>
        <cgc-playingcardgoal id="goal_diamonds"></cgc-playingcardgoal>
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
`);

const SUITS = ["spades", "hearts", "clubs", "diamonds"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const DECK = new WeakMap();

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
        let deck = [];
        DECK.set(this, deck);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());

        let dragDrop = new DragDrop();

        dragDrop.onDropCallback = function(target, stack) {
            let last = target.lastElementChild;
            let first = stack[0];
            if (!!last) {
                if (SUITS.indexOf(last.dataset.suit) % 2 != SUITS.indexOf(first.dataset.suit) % 2) {
                    if (VALUES.indexOf(last.dataset.value) == VALUES.indexOf(first.dataset.value) + 1) {
                        return true;
                    }
                }
            } else {
                return true;
            }
            return false;
        }

        dragDrop.onDragCallback = function(stack) {
            let buffer = Array.from(stack);
            let last = buffer.pop();
            while (!!buffer.length) {
                let next = buffer.pop();
                if (SUITS.indexOf(last.dataset.suit) % 2 == SUITS.indexOf(next.dataset.suit) % 2) {
                    return false;
                }
                if (VALUES.indexOf(last.dataset.value) != VALUES.indexOf(next.dataset.value) - 1) {
                    return false;
                }
                last = next;
            }
            return true;
        }

        dragDrop.onDropChangedCallback = function(source, target, stack) {
            let last = source.lastElementChild;
            last.revealed = true;
        }

        // create playground
        let cols = [
            this.shadowRoot.getElementById("col_0"),
            this.shadowRoot.getElementById("col_1"),
            this.shadowRoot.getElementById("col_2"),
            this.shadowRoot.getElementById("col_3"),
            this.shadowRoot.getElementById("col_4"),
            this.shadowRoot.getElementById("col_5"),
            this.shadowRoot.getElementById("col_6"),
            this.shadowRoot.getElementById("col_7")
        ];
        dragDrop.registerDropTarget(cols);

        // create deck
        for (let suit of SUITS) {
            for (let value of VALUES) {
                let el = document.createElement('cgc-playingcard');
                el.ref = `front52/${suit}/${value}`;
                el.dataset.suit = suit;
                el.dataset.value = value;
                deck.push(el);
                dragDrop.registerDragElement(el);
            }
        }
    }

    startGame() {
        let cols = [
            this.shadowRoot.getElementById("col_0"),
            this.shadowRoot.getElementById("col_1"),
            this.shadowRoot.getElementById("col_2"),
            this.shadowRoot.getElementById("col_3"),
            this.shadowRoot.getElementById("col_4"),
            this.shadowRoot.getElementById("col_5"),
            this.shadowRoot.getElementById("col_6"),
            this.shadowRoot.getElementById("col_7")
        ];
        let deck = shuffleDeck(DECK.get(this));
        for (let card of deck) {
            card.revealed = false;
        }
        DECK.set(this, deck);
        for (let i = 0; i < deck.length; ++i) {
            cols[i%8].append(deck[i]);
        }
        for (let col of cols) {
            let last = col.lastElementChild;
            last.revealed = true;
        }
    }

}

customElements.define('cgc-freecell', FreeCell);