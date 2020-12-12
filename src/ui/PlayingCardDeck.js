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
            display: flex;
            flex-direction: column;
            align-items: center;
            width: calc(8vw * var(--card-scale, 1));
            transform: rotate(180deg);
        }
        #face {
            position: absolute;
            width: calc(8vw * var(--card-scale, 1));
            height: calc(12vw * var(--card-scale, 1));
            border-radius: calc(1vw * var(--card-scale, 1));
            box-shadow: inset 0px 0px 0px 4px rgba(255,255,255,0.5);
        }
        ::slotted(cgc-playingcard) {
            flex: 1;
            top: calc(12vw * var(--card-scale, 1) - .1vmax);
            max-height: 0.08vw;
            pointer-events: none;
        }
    </style>
    <div id="face">
    </div>
    <slot>
    </slot>
`);

export default class PlayingCardDeck extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
    }

}

customElements.define('cgc-playingcarddeck', PlayingCardDeck);
