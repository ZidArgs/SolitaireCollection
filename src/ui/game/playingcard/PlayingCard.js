import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import SettingsObserver from "../../../util/observer/SettingsObserver.js";
import TPL from "./PlayingCard.js.html" with {type: "html"};
import STYLE from "./PlayingCard.js.css" with {type: "css"};

const playingcardBackImageObserver = new SettingsObserver("playingcard.backImage");
const playingcardBackFillObserver = new SettingsObserver("playingcard.backFill");

export default class PlayingCard extends CustomElement {

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

    set front(value) {
        this.setAttribute("front", value);
    }

    get front() {
        return this.getAttribute("front");
    }

    set revealed(value) {
        this.setBooleanAttribute("revealed", value);
    }

    get revealed() {
        return this.getBooleanAttribute("revealed");
    }

    static get observedAttributes() {
        return ["front", "back"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "front": {
                    this.#setFace(newValue);
                } break;
            }
        }
    }

    #setFace(value) {
        if (value) {
            const src = `url("/img/playing_cards/front/${value}/${this.suit}_${this.value}.svg")`;
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

}

customElements.define("cgc-playingcard", PlayingCard);
