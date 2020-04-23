import Template from "/Template.js";

const TPL = new Template(`
    <style>
        :host {
            position: relative;
            display: block;
            width: 60px;
            height: 90px;
            -webkit-user-select: none;
            -moz-user-select: none;
            user-select: none;
        }
        div {
            width: 100%;
            height: 100%;
            border-radius: 1vw;
            box-shadow: inset 0px 0px 0px 4px rgba(255,255,255,0.5);
        }
    </style>
    <div>
        <slot>
        </slot>
    </div>
`);

export default class PlayingCardPlaceholder extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
    }

}

customElements.define('cgc-playingcardplaceholder', PlayingCardPlaceholder);