import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import MenuActionEnum from "../enum/MenuActionEnum.js";
import TPL from "./Menu.js.html" with {type: "html"};
import STYLE from "./Menu.js.css" with {type: "css"};

export default class Menu extends CustomElement {

    #titleEl;

    #buttonsEl;

    constructor(options = {}) {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        // ---
        this.#titleEl = this.shadowRoot.getElementById("title");
        this.#titleEl = this.shadowRoot.getElementById("title");
        // build menu
        if (options.title) {
            this.#titleEl.innerHTML = options.title;
        }
        this.#buttonsEl = this.shadowRoot.getElementById("buttons");
        this.#buttonsEl.innerHTML = "";
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
            if (button.action == MenuActionEnum.QUIT_FRAME) {
                el.addEventListener("click", async () => {
                    window.parent.dispatchEvent(new Event("quit_frame"));
                });
            }
            if (button.action == MenuActionEnum.QUIT) {
                el.addEventListener("click", async () => {
                    window.close();
                });
            }
            if (button.action == MenuActionEnum.BACK) {
                el.addEventListener("click", async () => {
                    history.back();
                });
            }
            if (button.action == MenuActionEnum.CLOSE) {
                el.addEventListener("click", async () => {
                    this.close();
                });
            }
            this.#buttonsEl.append(el);
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

customElements.define("cgc-menu", Menu);
