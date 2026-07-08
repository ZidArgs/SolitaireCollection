import AbstractGameElement from "../AbstractGameElement.js";
import SettingsObserver from "../../../util/observer/SettingsObserver.js";
import TPL from "./PlayingCard.js.html" with {type: "html"};
import STYLE from "./PlayingCard.js.css" with {type: "css"};

const playingcardBackImageObserver = new SettingsObserver("playingcard.backImage");
const playingcardFaceThemeObserver = new SettingsObserver("playingcard.faceTheme");

export default class PlayingCard extends AbstractGameElement {

    #faceEl;

    #backEl;

    constructor(suit, value) {
        super(suit, value);
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
        this.#updateFace();
        playingcardFaceThemeObserver.onChange(() => {
            this.#updateFace();
        });
    }

    getStackUp() {
        const idx = Array.from(this.parentNode.children).indexOf(this);
        return this.parentElement.querySelectorAll(`sc-playingcard:nth-child(n+${idx + 1})`);
    }

    getStackDown() {
        const idx = Array.from(this.parentNode.children).indexOf(this);
        return this.parentElement.querySelectorAll(`sc-playingcard:nth-child(-n+${idx + 1})`);
    }

    set revealed(value) {
        this.setBooleanAttribute("revealed", value);
    }

    get revealed() {
        return this.getBooleanAttribute("revealed");
    }

    #updateFace() {
        const faceTheme = playingcardFaceThemeObserver.value;
        if (faceTheme && this.suit && this.value) {
            const src = `url("/image/playing_cards/front/${faceTheme}/${this.suit}_${this.value}.png")`;
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

    serialize() {
        return {
            suit: this.suit,
            value: this.value,
            instance: this.instance,
            revealed: this.revealed ?? false
        };
    }

    deserialize(data) {
        this.revealed = data.revealed ?? false;
    }

}

customElements.define("sc-playingcard", PlayingCard);
