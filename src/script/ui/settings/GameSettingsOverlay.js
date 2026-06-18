import BusyIndicatorManager from "@emcjs/fe/util/busy/BusyIndicatorManager.js";
import SettingsOverlay from "@emcjs/fe/ui/settings/SettingsOverlay.js";
import SettingsStorage from "../../storage/SettingsStorage.js";

export default class GameSettingsOverlay extends SettingsOverlay {

    #settingsConfigHandler;

    constructor(settingsConfigHandler) {
        super("Settings");
        this.#settingsConfigHandler = settingsConfigHandler;
        /* --- */
        this.loadConfig(this.#settingsConfigHandler.config, this.#settingsConfigHandler.defaultValues.unresolved);
        /* --- */
        this.addEventListener("submit", async (event) => {
            await BusyIndicatorManager.busy();
            /* --- */
            const settings = this.#settingsConfigHandler.convertFromFormData(event.data);
            SettingsStorage.setAll(settings);
            /* --- */
            await BusyIndicatorManager.unbusy();
        });
        /* --- */
        this.#initValues();
        SettingsStorage.addEventListener("clear", () => {
            this.#initValues();
        });
        SettingsStorage.addEventListener("load", () => {
            this.#initValues();
        });
        SettingsStorage.addEventListener("change", (event) => {
            this.#loadValues(event.data);
        });
    }

    async #initValues() {
        await BusyIndicatorManager.busy();
        const values = SettingsStorage.getAll();
        const data = this.#settingsConfigHandler.convertToFormData(values);
        this.setValuesFlat(data);
        await BusyIndicatorManager.unbusy();
    }

    async #loadValues(values) {
        const data = this.#settingsConfigHandler.convertToFormData(values);
        this.setValuesFlat(data, true);
    }

}

customElements.define("sc-overlay-game", GameSettingsOverlay);
