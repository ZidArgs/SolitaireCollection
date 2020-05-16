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
            width: calc(8vw * var(--card-scale, 1));
            height: calc(12vw * var(--card-scale, 1));
        }
        #face {
            background-repeat: no-repeat;
            background-size: contain;
            background-position: center;
            background-origin: content-box;
            width: calc(8vw * var(--card-scale, 1));
            height: calc(12vw * var(--card-scale, 1));
            border-radius: calc(1vw * var(--card-scale, 1));
            box-shadow: inset 0px 0px 0px 4px rgba(255,255,255,0.5);
        }
        ::slotted(cgc-playingcard:not(:last-child)) {
            display: none;
        }
    </style>
    <div id="face">
        <slot>
        </slot>
    </div>
`);

export default class PlayingCardGoal extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
    }

    get theme() {
        return this.getAttribute('theme');
    }

    set theme(val) {
        this.setAttribute('theme', val);
    }

    get suit() {
        return this.getAttribute('suit');
    }

    set suit(val) {
        this.setAttribute('suit', val);
    }

    static get observedAttributes() {
        return ['theme', 'suit'];
    }
      
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'theme':
            case 'suit':
                if (oldValue != newValue) {
                    if (this.theme && this.suit) {
                        let src = `url("/img/playing_cards/goals/${this.theme}/${this.suit}.svg")`;
                        this.shadowRoot.getElementById("face").style.backgroundImage = src;
                    } else {
                        this.shadowRoot.getElementById("face").style.backgroundImage = "";
                    }
                }
                break;
        }
    }

}

customElements.define('cgc-playingcardgoal', PlayingCardGoal);