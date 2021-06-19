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
            flex-direction: row;
            align-items: center;
            width: calc(16vw * var(--card-scale, 1));
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
            max-width: .15vw;
        }
        ::slotted(cgc-playingcard:nth-last-child(-n + 3)) {
            max-width: 2.5vw;
        }
    </style>
    <div id="face">
    </div>
    <slot>
    </slot>
`);

export default class PlayingCardDrawer extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
    }

}

customElements.define("cgc-playingcarddrawer", PlayingCardDrawer);
