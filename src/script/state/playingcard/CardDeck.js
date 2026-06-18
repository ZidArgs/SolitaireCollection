import PlayingCard from "../../ui/game/playingcard/PlayingCard.js";
import AbstractGameElementPool from "../AbstractGameElementPool.js";

export default class CardDeck extends AbstractGameElementPool {

    #cardIds = new Map();

    #cards = new Set();

    #current = [];

    constructor(cardEls = []) {
        super();
        if (!Array.isArray(cardEls)) {
            cardEls = [cardEls];
        }
        for (const cardEl of cardEls) {
            if (cardEl instanceof PlayingCard) {
                cardEl.revealed = false;
                this.#cards.add(cardEl);
                this.#current.push(cardEl);
                this.#cardIds.set(cardEl.toString(), cardEl);
            }
        }
    }

    getElement(data) {
        const {
            suit = "",
            value = ""
        } = data ?? {};
        const cardId = PlayingCard.getIdentifier(suit, value);
        return this.#cardIds.get(cardId);
    }

    collect() {
        this.#current = [];
        for (const cardEl of this.#cards) {
            cardEl.remove();
            cardEl.revealed = false;
            this.#current.push(cardEl);
        }
        return this;
    }

    shuffle() {
        this.#current = [];
        const old = [...this.#cards];
        while (old.length > 0) {
            const index = Math.floor(Math.random() * old.length);
            const cardEl = old.splice(index, 1)[0];
            this.#current.push(cardEl);
        }
        return this;
    }

    draw() {
        return this.#current.pop();
    }

    peek() {
        return this.#current.at(-1);
    }

    stack(cardEl) {
        if (this.#cards.has(cardEl)) {
            const index = this.#current.indexOf(cardEl);
            if (index >= 0) {
                this.#current.splice(index, 1);
            }
            this.#current.push(cardEl);
            return true;
        }
        return false;
    }

    get size() {
        return this.#cards.size;
    }

    get remaining() {
        return this.#current.length;
    }

    serialize() {
        return this.#current.map((cardEl) => cardEl.toJSON());
    }

    deserialize(current) {
        this.#current = [];
        for (const cardData of current) {
            const cardEl = this.getElement(cardData.suit, cardData.value);
            if (cardEl != null) {
                cardEl.revealed = cardData.revealed;
                this.#current.push(cardEl);
            }
        }
    }

    [Symbol.iterator]() {
        return this.#cards[Symbol.iterator]();
    }

    static createPlayingCard(suit, value) {
        const cardEl = new PlayingCard();
        cardEl.suit = suit;
        cardEl.value = value;
        cardEl.revealed = false;
        return cardEl;
    }

    static createPlayingCards(suitList, valueList) {
        const cards = [];
        for (const suit of suitList) {
            for (const value of valueList) {
                cards.push(CardDeck.createPlayingCard(suit, value));
            }
        }
        return cards;
    }

}
