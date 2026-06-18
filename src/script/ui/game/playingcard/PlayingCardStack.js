import AbstractGameElementHolder from "../AbstractGameElementHolder.js";
import PlayingCardStackTypeEnum from "../../../enum/PlayingCardStackTypeEnum.js";
import TPL from "./PlayingCardStack.js.html" with {type: "html"};
import STYLE from "./PlayingCardStack.js.css" with {type: "css"};

export default class PlayingCardStack extends AbstractGameElementHolder {

    #bodyEl;

    #allowDropFn = () => true;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#bodyEl = this.shadowRoot.getElementById("body");
    }

    set type(value) {
        this.setEnumAttribute("type", value, PlayingCardStackTypeEnum);
    }

    get type() {
        return this.getEnumAttribute("type");
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

    set image(value) {
        this.setAttribute("image", value);
    }

    get image() {
        return this.getAttribute("image");
    }

    static get observedAttributes() {
        return ["image"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "image": {
                    this.#setimage(newValue);
                } break;
            }
        }
    }

    #setimage(value) {
        if (value) {
            const src = `url("${value}")`;
            this.#bodyEl.style.backgroundImage = src;
        } else {
            this.#bodyEl.style.backgroundImage = "";
        }
    }

    set allowDrop(value) {
        if (typeof value === "function") {
            this.#allowDropFn = value;
        } else {
            this.#allowDropFn = () => true;
        }
    }

    isDropAllowed(...args) {
        return this.#allowDropFn(this, ...args);
    }

}

customElements.define("sc-playingcard-stack", PlayingCardStack);
