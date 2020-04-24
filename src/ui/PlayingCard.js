import Template from "/src/util/Template.js";

const TPL = new Template(`
    <style>
        :host {
            position: relative;
            display: block;
            -webkit-user-select: none;
            -moz-user-select: none;
            user-select: none;
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
            background-color: #fffffF;
        }
    </style>
    <div id="face">
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
                    this.shadowRoot.getElementById("face").style.backgroundImage = `url("/img/playing_cards/${newValue}.svg")`;
                }
                break;
        }
    }

}

customElements.define('cgc-playingcard', PlayingCard);