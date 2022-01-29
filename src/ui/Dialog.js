import Template from "../util/Template.js";

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
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            top: 0px;
            left: 0px;
            width: 100vw;
            height: 100vh;
        }
        #body {
            display: block;
            word-wrap: break-word;
            resize: none;
            color: rgba(255,255,255,0.7);
            font-size: 2vmax;
        }
        #footer {
            display: flex;
            margin-top: 2vmax;
            padding: 1vmax 2vmax 1vmax;
            justify-content: space-between;
        }
        #window {
            display: inline-flex;
            flex-direction: column;
            padding: 3vmax;
            background: #a553c7;
            border-radius: 1vmax;
            box-shadow: inset 0px 0px 0px 4px rgba(255,255,255,0.5);
            width: auto;
            min-width: 30vmax;
        }
        button {
            min-width: 10vmax;
            padding: 1vmax;
            margin: .5vmax;
            border-radius: 1vmax;
            box-shadow: inset 0px 0px 0px 2px rgba(255,255,255,0.7);
            color: rgba(255,255,255,0.7);
            background-color: transparent;
            border: none;
            -webkit-appearance: none;
            cursor: pointer;
            font-size: 2vmax;
        }
        button:hover {
            background-color: rgba(255,255,255,0.2);
        }
        button:disabled {
            box-shadow: inset 0px 0px 0px 2px rgba(255,255,255,0.2);
            color: rgba(255,255,255,0.2);
            cursor: default;
            background-color: transparent;
        }
        button:focus {
            outline: none;
        }
    </style>
    <div id="window" role="dialog">
        <div id="body">
        </div>
        <div id="footer">
            <button id="submit" title="submit">
                submit
            </button>
            <button id="cancel" title="cancel">
                cancel
            </button>
        </div>
    </div>
`);

function dialogSubmit() {
    this.dispatchEvent(new Event("submit"));
    document.body.removeChild(this);
}

function dialogCancel() {
    this.dispatchEvent(new Event("cancel"));
    document.body.removeChild(this);
}

export default class Dialog extends HTMLElement {

    constructor(options = {}) {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());

        const bdy = this.shadowRoot.getElementById("body");
        if (!!options.text && typeof options.text === "string") {
            bdy.innerHTML = options.text;
        }
        const footer = this.shadowRoot.getElementById("footer");

        const sbm = this.shadowRoot.getElementById("submit");
        if (options.submit) {
            if (typeof options.submit === "string") {
                sbm.innerHTML = options.submit;
                sbm.setAttribute("title", options.submit);
            }
            sbm.onclick = dialogSubmit.bind(this);
        } else {
            footer.removeChild(sbm);
        }

        const ccl = this.shadowRoot.getElementById("cancel");
        if (options.cancel) {
            if (typeof options.cancel === "string") {
                ccl.innerHTML = options.cancel;
                ccl.setAttribute("title", options.cancel);
            }
            ccl.onclick = dialogCancel.bind(this);
        } else {
            footer.removeChild(ccl);
        }
    }

    static confirm(msg) {
        return new Promise(function(resolve) {
            const d = new Dialog({
                text: msg,
                submit: "YES",
                cancel: "NO"
            });
            d.onsubmit = function() {
                resolve(true);
            }
            d.oncancel = function() {
                resolve(false);
            }
            d.onclose = function() {
                resolve();
            }
            d.show();
        });
    }

    show() {
        document.body.append(this);
    }

    close() {
        document.body.removeChild(this);
    }

}

customElements.define("cgc-dialog", Dialog);
