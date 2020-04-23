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
            background-repeat: no-repeat;
            background-size: contain;
            background-position: center;
            background-origin: content-box;
            background-color: #fffffF;
            border-radius: 1vw;
            box-shadow: inset 0px 0px 2px black;
        }
    </style>
    <div>
        <slot>
        </slot>
    </div>
`);

export default class PlayingCard extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    static get observedAttributes() {
        return ['ref'];
    }
      
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    this.shadowRoot.querySelector('div').style.backgroundImage = `url("/img/playing_cards/${newValue}.svg")`;
                }
                break;
        }
    }

}

customElements.define('cgc-playingcard', PlayingCard);