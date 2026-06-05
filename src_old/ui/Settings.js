import IDBStorage from "/src/util/IDBStorage.js";
import Template from "/src/util/Template.js";
import Dialog from "/src/ui/Dialog.js";
import "/src/ui/CircleSelect.js";

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
            width: 100dvw;
            height: 100dvh;
            box-sizing: border-box;
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
        <div id="title">SETTINGS</div>
        <div id="body">
        </div>
        <div id="footer">
            <button id="submit" title="submit">
                apply
            </button>
            <button id="cancel" title="cancel">
                close
            </button>
        </div>
    </div>
`);

const SettingsStorage = new IDBStorage("settings");

export default class Settings extends HTMLElement {

    constructor(settings = {}, inGame = false) {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());

        const sbm = this.shadowRoot.getElementById("submit");
        if (inGame) {
            sbm.addEventListener("click", () => {
                this.#dialogSubmit();
            });
        } else {
            sbm.addEventListener("click", () => {
                this.#submit();
            });
        }

        const ccl = this.shadowRoot.getElementById("cancel");
        ccl.addEventListener("click", () => {
            this.#dialogCancel();
        });

        // build settings
        const container = this.shadowRoot.getElementById("body");
        container.innerHTML = "";
        for (const setting of settings) {
            const el = document.createElement("div");
            el.className = "option";

            const name = document.createElement("div");
            name.className = "name";
            name.innerHTML = setting.title;
            el.append(name);

            const select = document.createElement("cgc-circleselect");
            select.className = "select";
            select.dataset.value = setting.value;
            select.dataset.type = setting.type || "string";
            select.dataset.default = setting.default;
            for (const option of setting.options) {
                const opt = document.createElement("option");
                opt.value = option.value;
                opt.innerHTML = option.title;
                select.append(opt);
            }
            el.append(select);

            container.append(el);
        }
    }

    async show() {
        const settings = Array.from(this.shadowRoot.querySelectorAll("cgc-circleselect"));
        for (const el of settings) {
            el.value = await SettingsStorage.get(el.dataset.value, el.dataset.default);
        }
        document.body.append(this);
    }

    close() {
        document.body.removeChild(this);
    }

    async #dialogSubmit() {
        if (await Dialog.confirm("To apply the settings, a new game must be started.<br>Do you want to start a new game?")) {
            this.#submit();
        }
    }

    async #submit() {
        const settings = Array.from(this.shadowRoot.querySelectorAll("cgc-circleselect"));
        const data = {};
        for (const el of settings) {
            let value = el.value;
            switch (el.dataset.type) {
                case "number": value = parseFloat(value); break;
                case "boolean": value = !!value && value != "false"; break;
                default: value = value.toString(); break;
            }
            data[el.dataset.value] = value;
            await SettingsStorage.set(el.dataset.value, value);
        }
        const event = new Event("submit");
        event.data = data;
        this.dispatchEvent(event);
        document.body.removeChild(this);
    }

    #dialogCancel() {
        this.dispatchEvent(new Event("cancel"));
        document.body.removeChild(this);
    }

}

customElements.define("cgc-settings", Settings);
