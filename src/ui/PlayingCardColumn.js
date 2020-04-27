import Template from "/src/util/Template.js";

const TPL = new Template(`
    <style>
        :host {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: calc(8vw * var(--card-scale, 1));
            -webkit-user-select: none;
            -moz-user-select: none;
            user-select: none;
        }
        ::slotted(cgc-playingcard) {
            flex: 1;
            max-height: 2.5vw;
        }
    </style>
    <slot>
    </slot>
`);

export default class PlayingCardColumn extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
    }

}

customElements.define('cgc-playingcardcolumn', PlayingCardColumn);