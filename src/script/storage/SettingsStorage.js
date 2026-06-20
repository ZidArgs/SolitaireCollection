import ObservableIDBProxyStorage from "@emcjs/core/data/storage/observable/ObservableIDBProxyStorage.js";
import AppSettingsConfigHandler from "../util/settings/AppSettingsConfigHandler.js";
import SettingsDefaultValues from "@emcjs/fe/data/settings/SettingsDefaultValues.js";

const defaultValues = AppSettingsConfigHandler.defaultValues;

class AppSettingsStorage extends ObservableIDBProxyStorage {

    #customDefaultValues = new Set();

    #defaultValueCache = new Map();

    constructor() {
        super("settings");
        this.#updateDefaultValueCache();
    }

    set(key, value) {
        if (this.has(key)) {
            super.set(key, value);
        }
    }

    setAll(values) {
        const res = {};
        for (const key in values) {
            const value = values[key];
            if (this.has(key)) {
                res[key] = value;
            }
        }
        super.setAll(res);
    }

    get(key) {
        if (this.has(key)) {
            return super.get(key) ?? this.#defaultValueCache.get(key);
        }
    }

    getAll() {
        const res = {};
        for (const [key, value] of this.#defaultValueCache) {
            res[key] = super.get(key) ?? value;
        }
        return res;
    }

    has(key) {
        return this.#defaultValueCache.has(key);
    }

    keys() {
        return this.#defaultValueCache.keys();
    }

    deserialize(data = {}) {
        const res = {};
        for (const [key] of this.#defaultValueCache) {
            const newValue = data[key];
            if (newValue != null) {
                res[key] = newValue;
            }
        }
        super.deserialize(res);
    }

    overwrite(data = {}) {
        const res = {};
        for (const [key] of this.#defaultValueCache) {
            if (key in data) {
                const newValue = data[key];
                res[key] = newValue;
            }
        }
        super.overwrite(res);
    }

    async addCustomDefaultValues(defVals) {
        if (!(defVals instanceof SettingsDefaultValues)) {
            throw new TypeError("defVals must be an instance of SettingsDefaultValues");
        }
        this.#customDefaultValues.add(defVals);
        this.#updateDefaultValueCache();
        await this.resync();
    }

    async clearCustomDefaultValues() {
        this.#customDefaultValues.clear();
        this.#updateDefaultValueCache();
        await this.resync();
    }

    #updateDefaultValueCache() {
        const res = [...defaultValues];
        for (const defVals of this.#customDefaultValues) {
            res.splice(-1, 0, ...[...defVals]);
        }
        this.#defaultValueCache = new Map(res);
    }

}

const SettingsStorage = await AppSettingsStorage.create();

export default SettingsStorage;
