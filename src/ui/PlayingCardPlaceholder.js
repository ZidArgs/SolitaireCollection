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
            width: calc(8vw * var(--card-scale, 1));
            height: calc(12vw * var(--card-scale, 1));
            border-radius: calc(1vw * var(--card-scale, 1));
            box-shadow: inset 0px 0px 0px 4px rgba(255,255,255,0.5);
        }
    </style>
    <div id="face">
        <slot>
        </slot>
    </div>
`);

export default class PlayingCardPlaceholder extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
    }

}

customElements.define("cgc-playingcardplaceholder", PlayingCardPlaceholder);
