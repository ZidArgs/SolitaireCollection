import Template from "/src/util/Template.js";
import "/src/ui/Option.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-flex;
            width: 200px;
            height: 40px;
            -webkit-user-select: none;
            -moz-user-select: none;
            user-select: none;
        }
        :host(:not([readonly])),
        :host([readonly="false"]) {
            cursor: pointer;
        }
        button {
            display: block;
            width: 40px;
            margin: 0;
            padding: 10px;
            flex-shrink: 0;
            border: none;
            background: none;
            user-select: none;
            color: inherit;
            cursor: pointer;
            opacity: 0.5;
            -webkit-appearance: none;
        }
        button:hover {
            opacity: 1;
        }
        button:focus {
            outline: none;
        }
        button::after {
            display: block;
            border-top: solid 10px transparent;
            border-bottom: solid 10px transparent;
            content: "";
        }
        button#prev::after {
            border-right: solid 20px white;
        }
        button#next::after {
            border-left: solid 20px white;
        }
        slot {
            flex: 1;
            height: 100%;
        }
        ::slotted([value]) {
            display: flex;
            align-items: center;
            width: 100%;
            height: 100%;
            min-height: auto;
            background-repeat: no-repeat;
            background-size: contain;
            background-position: center;
            background-origin: content-box;
        }
        ::slotted(:not([value])),
        ::slotted([value]:not(.active)) {
            display: none !important;
        }
    </style>
    <button id="prev"></button>
    <slot></slot>
    <button id="next"></button>
`);

export default class CircleSelect extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        // button events
        this.shadowRoot.getElementById("next").addEventListener("click", event => {
            this.next(event);
        });
        this.shadowRoot.getElementById("prev").addEventListener("click", event => {
            this.prev(event);
        });
    }

    connectedCallback() {
        if (!this.value) {
            let all = this.querySelectorAll("[value]");
            if (!!all.length) {
                this.value = all[0].value;
            }
        }
    }

    get value() {
        return this.getAttribute('value');
    }

    set value(val) {
        this.setAttribute('value', val);
    }

    get readonly() {
        let val = this.getAttribute('readonly');
        return !!val && val != "false";
    }

    set readonly(val) {
        this.setAttribute('readonly', val);
    }

    static get observedAttributes() {
        return ['value'];
    }
      
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'value':
                if (oldValue != newValue) {
                    let oe = this.querySelector(`.active`);
                    if (!!oe) {
                        oe.classList.remove("active");
                    }
                    let ne = this.querySelector(`[value="${newValue}"]`);
                    if (!!ne) {
                        ne.classList.add("active");
                    }
                    let event = new Event('change');
                    event.oldValue = oldValue;
                    event.newValue = newValue;
                    event.value = newValue;
                    this.dispatchEvent(event);
                }
                break;
        }
    }

    next(ev) {
        if (!this.readonly) {
            let all = this.querySelectorAll("[value]");
            if (!!all.length) {
                let opt = this.querySelector(`[value="${this.value}"]`);
                if (!!opt && !!opt.nextElementSibling) {
                    this.value = opt.nextElementSibling.getAttribute("value");
                } else {
                    this.value = all[0].getAttribute("value");
                }
            }
        }
        ev.preventDefault();
        return false;
    }

    prev(ev) {
        if (!this.readonly) {
            let all = this.querySelectorAll("[value]");
            if (!!all.length) {
                let opt = this.querySelector(`[value="${this.value}"]`);
                if (!!opt && !!opt.previousElementSibling) {
                    this.value = opt.previousElementSibling.getAttribute("value");
                } else {
                    this.value = all[all.length-1].getAttribute("value");
                }
            }
        }
        ev.preventDefault();
        return false;
    }

}

customElements.define('cgc-circleselect', CircleSelect);