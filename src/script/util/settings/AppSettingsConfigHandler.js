import SettingsConfigHandler from "@emcjs/fe/util/settings/SettingsConfigHandler.js";
import AppSettingsResource from "../../resource/AppSettingsResource.js";

export const SETTINGS_CONFIG_HANDLER_OPTIONS = Object.freeze({
    getLabel: (label) => `settings[${label}]`,
    getSectionName: (sectionName) => `settings_category[${sectionName}]`
});

const appSettings = AppSettingsResource.get();
const AppSettingsConfigHandler = new SettingsConfigHandler(appSettings, SETTINGS_CONFIG_HANDLER_OPTIONS);
window.settings = AppSettingsConfigHandler;

export default AppSettingsConfigHandler;
