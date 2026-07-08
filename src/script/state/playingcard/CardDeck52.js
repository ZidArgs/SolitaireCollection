import CardDeck from "./CardDeck.js";

const SUITS = ["1", "2", "3", "4"];
const VALUES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];

export default class CardDeck52 extends CardDeck {

    constructor() {
        super(CardDeck.createPlayingCards(SUITS, VALUES));
    }

    static get SUITS() {
        return [...SUITS];
    }

    static get VALUES() {
        return [...VALUES];
    }

}
