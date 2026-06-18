import ObservableIDBProxyStorage from "@emcjs/core/data/storage/observable/ObservableIDBProxyStorage.js";
import AppSettingsConfigHandler from "../util/settings/AppSettingsConfigHandler.js";
import SettingsDefaultValues from "@emcjs/fe/data/settings/SettingsDefaultValues.js";

const defaultValues = AppSettingsConfigHandler.defaultValues;

class AppSettingsStorage extends ObservableIDBProxyStorage {

    #customDefaultValues = new Set();

    constructor() {
        super("settings");
    }

    set(key, value) {
        if (this.#defaultValues.has(key)) {
            super.set(key, value);
        }
    }

    setAll(values) {
        const res = {};
        for (const key in values) {
            const value = values[key];
            if (this.#defaultValues.has(key)) {
                res[key] = value;
            }
        }
        super.setAll(res);
    }

    get(key) {
        if (this.#defaultValues.has(key)) {
            return super.get(key) ?? this.#defaultValues.get(key);
        }
    }

    getAll() {
        const res = {};
        for (const [key, value] of this.#defaultValues) {
            res[key] = super.get(key) ?? value;
        }
        return res;
    }

    has(key) {
        return this.#defaultValues.has(key);
    }

    keys() {
        return this.#defaultValues.keys();
    }

    deserialize(data = {}) {
        const res = {};
        for (const [key] of this.#defaultValues) {
            const newValue = data[key];
            if (newValue != null) {
                res[key] = newValue;
            }
        }
        super.deserialize(res);
    }

    overwrite(data = {}) {
        const res = {};
        for (const [key] of this.#defaultValues) {
            if (key in data) {
                const newValue = data[key];
                res[key] = newValue;
            }
        }
        super.overwrite(res);
    }

    addCustomDefaultValues(defVals) {
        if (!(defVals instanceof SettingsDefaultValues)) {
            throw new TypeError("defVals must be an instance of SettingsDefaultValues");
        }
        this.#customDefaultValues.add(defVals);
    }

    clearCustomDefaultValues() {
        this.#customDefaultValues.clear();
    }

    get #defaultValues() {
        const res = [...defaultValues];
        for (const defVals of this.#customDefaultValues) {
            res.splice(-1, 0, ...[...defVals]);
        }
        return new Map(res);
    }

}

const SettingsStorage = await AppSettingsStorage.create();

export default SettingsStorage;
