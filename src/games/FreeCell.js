import Template from "/src/util/Template.js";
import "/src/ui/PlayingCardPlaceholder.js";
import "/src/ui/PlayingCardColumn.js";
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
        #pl_spades,
        #pl_hearts,
        #pl_clubs,
        #pl_diamonds {
            background-repeat: no-repeat;
            background-size: contain;
            background-position: center;
            background-origin: content-box;
        }
        #pl_spades {
            background-image: url("/img/playing_cards/placeholders/spades.svg")
        }
        #pl_hearts {
            background-image: url("/img/playing_cards/placeholders/hearts.svg")
        }
        #pl_clubs {
            background-image: url("/img/playing_cards/placeholders/clubs.svg")
        }
        #pl_diamonds {
            background-image: url("/img/playing_cards/placeholders/diamonds.svg")
        }
    </style>
    <div id="top-row">
        <cgc-playingcardplaceholder></cgc-playingcardplaceholder>
        <cgc-playingcardplaceholder></cgc-playingcardplaceholder>
        <cgc-playingcardplaceholder></cgc-playingcardplaceholder>
        <cgc-playingcardplaceholder></cgc-playingcardplaceholder>
        <div></div>
        <cgc-playingcardplaceholder id="pl_spades"></cgc-playingcardplaceholder>
        <cgc-playingcardplaceholder id="pl_hearts"></cgc-playingcardplaceholder>
        <cgc-playingcardplaceholder id="pl_clubs"></cgc-playingcardplaceholder>
        <cgc-playingcardplaceholder id="pl_diamonds"></cgc-playingcardplaceholder>
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

const SUITS = ["clubs", "diamonds", "hearts", "spades"];
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

        // create deck
        for (let suit of SUITS) {
            for (let value of VALUES) {
                let el = document.createElement('cgc-playingcard');
                el.ref = `front52/${suit}/${value}`;
                el.dataset.suit = suit;
                el.dataset.value = value;
                deck.push(el);
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
        DECK.set(this, deck);
        for (let i = 0; i < deck.length; ++i) {
            cols[i%8].append(deck[i]);
        }
    }

}

customElements.define('cgc-freecell', FreeCell);