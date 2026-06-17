import SettingsConfigHandler from "@emcjs/fe/util/settings/SettingsConfigHandler.js";
import AppSettingsResource from "../../resource/AppSettingsResource.js";

const appSettings = AppSettingsResource.get();
const AppSettingsConfigHandler = new SettingsConfigHandler(appSettings, {
    getLabel: (label) => `settings[${label}]`,
    getSectionName: (sectionName) => `settings_category[${sectionName}]`
});
window.settings = AppSettingsConfigHandler;

export default AppSettingsConfigHandler;
