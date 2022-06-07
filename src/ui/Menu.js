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
            box-sizing: border-box;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(2px);
        }
        #menu {
            display: inline-flex;
            flex-direction: column;
            padding: 2vmax 5vmax;
            background: #a553c7;
            border-radius: 1vmax;
            box-shadow: inset 0px 0px 0px 4px rgba(255,255,255,0.5);
        }
        #title {
            display: flex;
            padding: 10px;
            justify-content: center;
            font-weight: bold;
            color: rgba(255,255,255,0.7);
            cursor: default;
            user-select: none;
            font-size: 3vmax;
        }
        #buttons {
            display: flex;
            flex-direction: column;
            padding: 10px;
            justify-content: center;
            font-weight: bold;
            color: rgba(255,255,255,0.7);
            cursor: default;
            user-select: none;
            font-size: 3vmax;
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
    <div id="menu"">
        <div id="title"></div>
        <div id="buttons"></div>
    </div>
`);

export default class Menu extends HTMLElement {

    constructor(options = {}) {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        // build menu
        if (options.title) {
            this.shadowRoot.getElementById("title").innerHTML = options.title;
        }
        const buttons = this.shadowRoot.getElementById("buttons");
        buttons.innerHTML = "";
        for (const button of options.buttons) {
            const el = document.createElement("button");
            el.innerHTML = button.content;
            if (typeof button.handler == "function") {
                el.addEventListener("click", async () => {
                    if (await button.handler()) {
                        this.close();
                    }
                });
            }
            if (typeof button.href == "string") {
                el.addEventListener("click", async () => {
                    location.href = `${button.handler}/index.html`;
                });
            }
            if (button.action == Menu.BACK) {
                el.addEventListener("click", async () => {
                    history.back();
                });
            }
            if (button.action == Menu.CLOSE) {
                el.addEventListener("click", async () => {
                    this.close();
                });
            }
            buttons.append(el);
        }
    }

    show() {
        document.body.append(this);
    }

    close() {
        document.body.removeChild(this);
        this.dispatchEvent(new Event("close"));
    }

}

Menu.BACK = "BACK";
Menu.CLOSE = "CLOSE";

customElements.define("cgc-menu", Menu);
