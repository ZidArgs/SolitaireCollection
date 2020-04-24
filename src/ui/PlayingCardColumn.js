import Template from "/src/util/Template.js";

const TPL = new Template(`
    <style>
        :host {
            position: relative;
            display: grid;
            justify-content: center;
            grid-template-rows: repeat(20, 2.5vw);
            width: var(--card-width, 60px);
            -webkit-user-select: none;
            -moz-user-select: none;
            user-select: none;
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