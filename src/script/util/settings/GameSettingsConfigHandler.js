import SettingsConfigHandler from "@emcjs/fe/util/settings/SettingsConfigHandler.js";
import {SETTINGS_CONFIG_HANDLER_OPTIONS} from "./AppSettingsConfigHandler.js";

export default class GameSettingsConfigHandler extends SettingsConfigHandler {

    constructor(gameSettings) {
        super(gameSettings, SETTINGS_CONFIG_HANDLER_OPTIONS);
    }

}
