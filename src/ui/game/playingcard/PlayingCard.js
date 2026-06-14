import AbstractGameElement from "../AbstractGameElement.js";
import SettingsObserver from "../../../util/observer/SettingsObserver.js";
import TPL from "./PlayingCard.js.html" with {type: "html"};
import STYLE from "./PlayingCard.js.css" with {type: "css"};

const playingcardBackImageObserver = new SettingsObserver("playingcard.backImage");
const playingcardBackFillObserver = new SettingsObserver("playingcard.backFill");
const playingcardFaceThemeObserver = new SettingsObserver("playingcard.faceTheme");

export default class PlayingCard extends AbstractGameElement {

    #faceEl;

    #backEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#faceEl = this.shadowRoot.getElementById("face");
        this.#backEl = this.shadowRoot.getElementById("back");
        /* --- */
        this.#updateBack();
        playingcardBackImageObserver.onChange(() => {
            this.#updateBack();
        });
        this.#updateFill();
        playingcardBackFillObserver.onChange(() => {
            this.#updateFill();
        });
        this.#updateFace();
        playingcardFaceThemeObserver.onChange(() => {
            this.#updateFace();
        });
    }

    getStackUp() {
        const idx = Array.from(this.parentNode.children).indexOf(this);
        return this.parentElement.querySelectorAll(`cgc-playingcard:nth-child(n+${idx + 1})`);
    }

    getStackDown() {
        const idx = Array.from(this.parentNode.children).indexOf(this);
        return this.parentElement.querySelectorAll(`cgc-playingcard:nth-child(-n+${idx + 1})`);
    }

    set suit(value) {
        this.setAttribute("suit", value);
    }

    get suit() {
        return this.getAttribute("suit");
    }

    set value(value) {
        this.setAttribute("value", value);
    }

    get value() {
        return this.getAttribute("value");
    }

    set revealed(value) {
        this.setBooleanAttribute("revealed", value);
    }

    get revealed() {
        return this.getBooleanAttribute("revealed");
    }

    static get observedAttributes() {
        return ["suit", "value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "suit":
                case "value": {
                    this.#updateFace();
                } break;
            }
        }
    }

    #updateFace() {
        const faceTheme = playingcardFaceThemeObserver.value;
        if (faceTheme && this.suit && this.value) {
            const src = `url("/img/playing_cards/front/${faceTheme}/${this.suit}_${this.value}.svg")`;
            this.#faceEl.style.backgroundImage = src;
        } else {
            this.#faceEl.style.backgroundImage = "";
        }
    }

    #updateBack() {
        const value = playingcardBackImageObserver.value;
        if (value) {
            const src = `url("${value}")`;
            this.#backEl.style.backgroundImage = src;
        } else {
            this.#backEl.style.backgroundImage = "";
        }
    }

    #updateFill() {
        const value = playingcardBackFillObserver.value;
        this.#backEl.classList.toggle("fill", !!value);
    }

    toString() {
        return PlayingCard.getCardId(this.suit, this.value);
    }

    toJSON() {
        return {
            "@name": PlayingCard.getCardId(this.suit, this.value),
            ...this.serialize()
        };
    }

    serialize() {
        return {
            suit: this.suit ?? "",
            value: this.value ?? "",
            revealed: this.revealed ?? false
        };
    }

    deserialize(data) {
        this.suit = data.suit ?? "";
        this.value = data.value ?? "";
        this.revealed = data.revealed ?? false;
    }

    static getCardId(suit, value) {
        return `PlayingCard[${suit ?? ""}|${value ?? ""}]`;
    }

}

customElements.define("cgc-playingcard", PlayingCard);
