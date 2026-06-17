import AbstractGameElementHolder from "../AbstractGameElementHolder.js";
import PlayingCardStackTypeEnum from "../../../enum/PlayingCardStackTypeEnum.js";
import TPL from "./PlayingCardStack.js.html" with {type: "html"};
import STYLE from "./PlayingCardStack.js.css" with {type: "css"};

export default class PlayingCardStack extends AbstractGameElementHolder {

    #bodyEl;

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

}

customElements.define("sc-playingcard-stack", PlayingCardStack);
