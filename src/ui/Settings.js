import IDBStorage from "/src/util/IDBStorage.js";
import Template from "/src/util/Template.js";
import Dialog from "/src/ui/Dialog.js";
import "/src/ui/CircleSelect.js";

const TPL = new Template(`
    <style>
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

let SettingsStorage = new IDBStorage("settings");

async function dialogSubmit() {
    if (await Dialog.confirm("To apply the settings, a new game must be started.<br>Do you want to start a new game?")) {
        let settings = Array.from(this.shadowRoot.querySelectorAll("cgc-circleselect"));
        for (let el of settings) {
            let value = el.value;
            switch (el.dataset.type) {
                case "number": value = parseFloat(value); break;
                case "boolean": value = !!value && value != "false"; break;
                default: value = value.toString(); break;
            }
            await SettingsStorage.set(el.dataset.value, value);
        }
        this.dispatchEvent(new Event('submit'));
        document.body.removeChild(this);
    }
}

function dialogCancel() {
    this.dispatchEvent(new Event('cancel'));
    document.body.removeChild(this);
}

export default class Settings extends HTMLElement {

    static BACK = "BACK";
    static CLOSE = "CLOSE";

    constructor(settings = {}) {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());

        let sbm = this.shadowRoot.getElementById('submit');
        sbm.onclick = dialogSubmit.bind(this);

        let ccl = this.shadowRoot.getElementById('cancel');
        ccl.onclick = dialogCancel.bind(this);

        // build settings
        let container = this.shadowRoot.getElementById("body");
        container.innerHTML = "";
        for (let setting of settings) {
            let el = document.createElement("div");
            el.className = "option";

            let name = document.createElement("div");
            name.className = "name";
            name.innerHTML = setting.title;
            el.append(name);

            let select = document.createElement("cgc-circleselect");
            select.className = "select";
            select.dataset.value = setting.value;
            select.dataset.type = setting.type || "string";
            select.dataset.default = setting.default;
            for (let option of setting.options) {
                let opt = document.createElement("option");
                opt.value = option.value;
                opt.innerHTML = option.title;
                select.append(opt);
            }
            el.append(select);

            container.append(el);
        }
    }

    async show() {
        let settings = Array.from(this.shadowRoot.querySelectorAll("cgc-circleselect"));
        for (let el of settings) {
            el.value = await SettingsStorage.get(el.dataset.value, el.dataset.default);
        }
        document.body.append(this);
    }

    close() {
        document.body.removeChild(this);
    }

}

customElements.define('cgc-settings', Settings);