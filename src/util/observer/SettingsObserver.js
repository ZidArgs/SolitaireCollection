import ObservableStorageObserver from "@emcjs/core/util/observer/data/storage/ObservableStorageObserver.js";
import SettingsStorage from "../../storage/SettingsStorage.js";

export default class SettingsObserver extends ObservableStorageObserver {

    constructor(key) {
        super(SettingsStorage, key);
    }

}
