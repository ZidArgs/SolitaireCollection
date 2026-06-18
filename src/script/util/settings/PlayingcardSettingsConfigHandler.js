import SettingsConfigHandler from "@emcjs/fe/util/settings/SettingsConfigHandler.js";
import PlayingcardSettingsResource from "../../resource/PlayingcardSettingsResource.js";

export const SETTINGS_CONFIG_HANDLER_OPTIONS = Object.freeze({
    getLabel: (label) => `settings[${label}]`,
    getSectionName: (sectionName) => `settings_category[${sectionName}]`
});

const playingcardSettings = PlayingcardSettingsResource.get();
const PlayingcardSettingsConfigHandler = new SettingsConfigHandler(playingcardSettings, SETTINGS_CONFIG_HANDLER_OPTIONS);

export default PlayingcardSettingsConfigHandler;
