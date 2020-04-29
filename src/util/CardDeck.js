const CARDS = new WeakMap();

export default class CardDeck {

    constructor(cards = []) {
        CARDS.set(this, [...cards]);
    }

    shuffle() {
        let old = CARDS.get(this);
        let cards = [];
        while (old.length > 0) {
            cards.push(old.splice(Math.floor(Math.random() * old.length), 1)[0]);
        }
        CARDS.set(this, cards);
        return [...cards];
    }

    get() {
        let cards = CARDS.get(this);
        return [...cards];
    }

    set(cards) {
        CARDS.set(this, [...cards]);
    }

    add(card) {
        CARDS.get(this).push(card);
    }

}