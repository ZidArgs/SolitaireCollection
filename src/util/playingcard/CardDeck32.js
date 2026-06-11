import CardDeck from "./CardDeck.js";

const SUITS = ["S", "H", "C", "D"];
const VALUES = ["A", "7", "8", "9", "10", "J", "Q", "K"];

export default class CardDeck32 extends CardDeck {

    constructor() {
        super(CardDeck.createPlayingCards(SUITS, VALUES));
    }

}
