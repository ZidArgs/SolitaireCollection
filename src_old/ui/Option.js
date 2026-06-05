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
            position: relative;
            box-sizing: border-box;
            display: inline-block;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            background-origin: content-box;
            flex-grow: 0;
            flex-shrink: 0;
            min-height: auto;
            white-space: normal;
            padding: 0;
        }
    </style>
    <slot></slot>
`);

export default class Option extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
    }

    get value() {
        return this.getAttribute("value");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    static createOption(value, content = value, style = {}) {
        const opt = document.createElement("emc-option");
        opt.setAttribute("value", value);
        if (content instanceof HTMLElement) {
            opt.append(content);
        } else {
            opt.innerHTML = content;
        }
        for (const i in style) {
            opt.style[i] = style[i];
        }
        return opt;
    }

}

customElements.define("emc-option", Option);
