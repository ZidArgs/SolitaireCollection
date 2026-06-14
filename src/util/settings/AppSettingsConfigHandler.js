import SettingsConfigHandler from "@emcjs/fe/util/settings/SettingsConfigHandler.js";
import SettingsResource from "../../data/resource/SettingsResource.js";

const options = SettingsResource.get();
const AppSettingsConfigHandler = new SettingsConfigHandler(options, (label) => `setting[${label}]`);
window.settings = AppSettingsConfigHandler;

export default AppSettingsConfigHandler;
