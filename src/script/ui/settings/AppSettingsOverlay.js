import BusyIndicatorManager from "@emcjs/fe/util/busy/BusyIndicatorManager.js";
import SettingsOverlay from "@emcjs/fe/ui/settings/SettingsOverlay.js";
import SettingsStorage from "../../storage/SettingsStorage.js";
import AppSettingsConfigHandler from "../../util/settings/AppSettingsConfigHandler.js";

export default class AppSettingsOverlay extends SettingsOverlay {

    constructor() {
        super("Settings");
        /* --- */
        this.loadConfig(AppSettingsConfigHandler.config, AppSettingsConfigHandler.defaultValues.unresolved);
        /* --- */
        this.addEventListener("submit", async (event) => {
            await BusyIndicatorManager.busy();
            /* --- */
            const settings = AppSettingsConfigHandler.convertFromFormData(event.data);
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
        const data = AppSettingsConfigHandler.convertToFormData(values);
        this.setValuesFlat(data);
        await BusyIndicatorManager.unbusy();
    }

    async #loadValues(values) {
        const data = AppSettingsConfigHandler.convertToFormData(values);
        this.setValuesFlat(data, true);
    }

}

customElements.define("sc-overlay-settings", AppSettingsOverlay);
