import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import TPL from "./PlayingCardStack.js.html" with {type: "html"};
import STYLE from "./PlayingCardStack.js.css" with {type: "css"};

export default class PlayingCardStack extends CustomElement {

    #bodyEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#bodyEl = this.shadowRoot.getElementById("body");
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

customElements.define("cgc-playingcard-stack", PlayingCardStack);
