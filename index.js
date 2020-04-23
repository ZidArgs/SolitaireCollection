import "/PlayingCardPlaceholder.js";
import "/PlayingCard.js";

const SUITS = ["clubs", "diamonds", "hearts", "spades"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

for (let suit of SUITS) {
    let cnt = document.getElementById(`${suit}_stack`);
    for (let value of VALUES) {
        let el = document.createElement('cgc-playingcard');
        el.ref = `front52/${suit}_${value}`;
        el.dataset.suit = suit;
        el.dataset.value = value;
        cnt.append(el);
        cnt = el;
    }
}

let stack_2 = document.getElementById("stack_2");
let stack_3 = document.getElementById("stack_3");
let stack_4 = document.getElementById("stack_4");

for (let i = 0; i < 4; ++i) {
    let el = document.createElement('cgc-playingcard');
    el.ref = "back_red";
    stack_2.append(el);
    stack_2 = el;
}

for (let i = 0; i < 20; ++i) {
    let el = document.createElement('cgc-playingcard');
    el.ref = "back_red";
    stack_3.append(el);
    stack_3 = el;
}

for (let i = 0; i < 52; ++i) {
    let el = document.createElement('cgc-playingcard');
    el.ref = "back_red";
    stack_4.append(el);
    stack_4 = el;
}