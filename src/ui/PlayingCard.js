import Template from "/src/util/Template.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
            -webkit-user-select: none;
            -moz-user-select: none;
            user-select: none;
        }
        :host {
            display: block;
            cursor: grab;
        }
        #face {
            width: calc(8vw * var(--card-scale, 1));
            height: calc(12vw * var(--card-scale, 1));
            border-radius: calc(1vw * var(--card-scale, 1));
            box-shadow: inset 0px 0px 2px black;
            background-repeat: no-repeat;
            background-size: contain;
            background-position: center;
            background-origin: content-box;
            background-color: #ffffff;
        }
    </style>
    <div id="face">
    </div>
`);

export default class PlayingCard extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
    }

    getStackUp() {
        const idx = Array.from(this.parentNode.children).indexOf(this);
        return this.parentElement.querySelectorAll(`cgc-playingcard:nth-child(n+${idx + 1})`);
    }

    getStackDown() {
        const idx = Array.from(this.parentNode.children).indexOf(this);
        return this.parentElement.querySelectorAll(`cgc-playingcard:nth-child(-n+${idx + 1})`);
    }

    get back() {
        return this.getAttribute("back");
    }

    set back(val) {
        this.setAttribute("back", val);
    }

    get theme() {
        return this.getAttribute("theme");
    }

    set theme(val) {
        this.setAttribute("theme", val);
    }

    get suit() {
        return this.getAttribute("suit");
    }

    set suit(val) {
        this.setAttribute("suit", val);
    }

    get value() {
        return this.getAttribute("value");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    get revealed() {
        return !!this.getAttribute("revealed") && this.getAttribute("revealed") != "false";
    }

    set revealed(val) {
        this.setAttribute("revealed", !!val && val != "false");
    }

    static get observedAttributes() {
        return ["back", "theme", "suit", "value", "revealed"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "back":
                if (!this.revealed && oldValue != newValue) {
                    if (this.back) {
                        const src = `url("/img/playing_cards/back/${this.back}.svg")`;
                        this.shadowRoot.getElementById("face").style.backgroundImage = src;
                    } else {
                        this.shadowRoot.getElementById("face").style.backgroundImage = "";
                    }
                }
                break;
            case "theme":
            case "suit":
            case "value":
                if (!!this.revealed && oldValue != newValue) {
                    if (this.theme && this.suit && this.value) {
                        const src = `url("/img/playing_cards/front/${this.theme}/${this.suit}_${this.value}.svg")`;
                        this.shadowRoot.getElementById("face").style.backgroundImage = src;
                    } else {
                        this.shadowRoot.getElementById("face").style.backgroundImage = "";
                    }
                }
                break;
            case "revealed":
                if (oldValue != newValue) {
                    if (this.revealed) {
                        if (this.theme && this.suit && this.value) {
                            const src = `url("/img/playing_cards/front/${this.theme}/${this.suit}_${this.value}.svg")`;
                            this.shadowRoot.getElementById("face").style.backgroundImage = src;
                        } else {
                            this.shadowRoot.getElementById("face").style.backgroundImage = "";
                        }
                    } else if (this.back) {
                        const src = `url("/img/playing_cards/back/${this.back}.svg")`;
                        this.shadowRoot.getElementById("face").style.backgroundImage = src;
                    } else {
                        this.shadowRoot.getElementById("face").style.backgroundImage = "";
                    }
                }
                break;
        }
    }

}

customElements.define("cgc-playingcard", PlayingCard);
