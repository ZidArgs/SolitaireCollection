import "/PlayingCard.js";

const SUITS = ["clubs", "diamonds", "hearts", "spades"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

for (let suit of SUITS) {
    for (let value of VALUES) {
        let el = document.createElement('cgc-playingcard');
        el.ref = `front52/${suit}_${value}`;
        el.dataset.suit = suit;
        el.dataset.value = value;
        document.body.append(el);
    }
}