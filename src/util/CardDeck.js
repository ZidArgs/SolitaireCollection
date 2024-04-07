const CARDS = new WeakMap();
const CURRENT = new WeakMap();

//TODO add theming
//TODO create cards in here (replace add function)

/*
    for (let suit of SUITS) {
        for (let value of VALUES) {
            let el = document.createElement('cgc-playingcard');
            el.back = card_back;
            el.theme = card_theme;
            el.suit = suit;
            el.value = value;
            el.revealed = true;
            DECK.add(el);
            CARDS.set(`${suit}_${value}`, el);
            DRAG_DROP.registerDragElement(el);
        }
    }
*/

export default class CardDeck {

    constructor(cards = []) {
        CARDS.set(this, [...cards]);
        CURRENT.set(this, [...cards]);
    }

    add(card) {
        CARDS.get(this).push(card);
    }

    collect() {
        const cards = CARDS.get(this);
        for (const card of cards) {
            card.remove();
            card.revealed = false;
        }
        CURRENT.set(this, [...cards]);
    }

    shuffle() {
        const old = CARDS.get(this);
        const cards = [];
        while (old.length > 0) {
            cards.push(old.splice(Math.floor(Math.random() * old.length), 1)[0]);
        }
        CARDS.set(this, cards);
        CURRENT.set(this, [...cards]);
    }

    draw() {
        const card = CURRENT.get(this).pop();
        return card;
    }

    peek() {
        const [card] = CURRENT.get(this).slice(-1);
        return card;
    }

    stack(card) {
        CURRENT.get(this).push(card);
    }

    get length() {
        return CARDS.get(this).length;
    }

    get remaining() {
        return CURRENT.get(this).length;
    }

}
