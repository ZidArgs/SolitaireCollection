import Template from "../util/Template.js";

const TPL = new Template(`
    <style>
        :host {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            width: 100vw;
            height: 100vh;
        }
        #body {
            display: block;
            word-wrap: break-word;
            resize: none;
            color: rgba(255,255,255,0.7);
        }
        #footer {
            display: flex;
            height: 50px;
            margin-top: 20px;
            padding: 10px 30px 10px;
            justify-content: space-between;
        }
        #window {
            display: inline-flex;
            flex-direction: column;
            padding: 50px;
            background: #a553c7;
            border-radius: calc(1vw * var(--card-scale, 1));
            box-shadow: inset 0px 0px 0px 4px rgba(255,255,255,0.5);
            width: auto;
            min-width: 20vw;
        }
        button {
            min-width: 100px;
            padding: 10px;
            margin-bottom: 4px;
            border-radius: calc(1vw * var(--card-scale, 1));
            box-shadow: inset 0px 0px 0px 2px rgba(255,255,255,0.7);
            color: rgba(255,255,255,0.7);
            background-color: transparent;
            border: none;
            -webkit-appearance: none;
            cursor: pointer;
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
    <div id="window" role="dialog" aria-modal="true" aria-labelledby="title" aria-describedby="title">
        <div id="header">
            <div id="title"></div>
        </div>
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
    this.dispatchEvent(new Event('submit'));
    document.body.removeChild(this);
}

function dialogCancel() {
    this.dispatchEvent(new Event('cancel'));
    document.body.removeChild(this);
}

export default class Dialog extends HTMLElement {

    constructor(options = {}) {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        
        let ttl = this.shadowRoot.getElementById('title');
        if (!!options.title && typeof title === "string") {
            ttl.innerHTML = title;
        }

        let bdy = this.shadowRoot.getElementById('body');
        if (!!options.text && typeof options.text === "string") {
            bdy.innerHTML = options.text;
        }
        let footer = this.shadowRoot.getElementById('footer');

        let sbm = this.shadowRoot.getElementById('submit');
        if (!!options.submit) {
            if (typeof options.submit === "string") {
                sbm.innerHTML = options.submit;
                sbm.setAttribute("title", options.submit);
            }
            sbm.onclick = dialogSubmit.bind(this);
        } else {
            footer.removeChild(sbm);
        }

        let ccl = this.shadowRoot.getElementById('cancel');
        if (!!options.cancel) {
            if (typeof options.cancel === "string") {
                ccl.innerHTML = options.cancel;
                ccl.setAttribute("title", options.cancel);
            }
            ccl.onclick = dialogCancel.bind(this);
        } else {
            footer.removeChild(ccl);
        }
    }
    
    static confirm(ttl, msg) {
        return new Promise(function(resolve) {
            let d = new Dialog({
                title: ttl,
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
        this.dispatchEvent(new Event('close'));
    }

}

customElements.define('cgc-dialog', Dialog);