import ObservableIDBProxyStorage from "@emcjs/core/data/storage/observable/ObservableIDBProxyStorage.js";
import AppSettingsConfigHandler from "../util/settings/AppSettingsConfigHandler.js";

const defaultValues = AppSettingsConfigHandler.defaultValues;

class AppSettingsStorage extends ObservableIDBProxyStorage {

    constructor() {
        super("settings");
    }

    set(key, value) {
        if (defaultValues.has(key)) {
            super.set(key, value);
        }
    }

    setAll(values) {
        const res = {};
        for (const key in values) {
            const value = values[key];
            if (defaultValues.has(key)) {
                res[key] = value;
            }
        }
        super.setAll(res);
    }

    get(key) {
        if (defaultValues.has(key)) {
            return super.get(key) ?? defaultValues.get(key);
        }
    }

    getAll() {
        const res = {};
        for (const [key, value] of defaultValues) {
            res[key] = super.get(key) ?? value;
        }
        return res;
    }

    has(key) {
        return defaultValues.has(key);
    }

    keys() {
        return defaultValues.keys();
    }

    deserialize(data = {}) {
        const res = {};
        for (const [key] of defaultValues) {
            const newValue = data[key];
            if (newValue != null) {
                res[key] = newValue;
            }
        }
        super.deserialize(res);
    }

    overwrite(data = {}) {
        const res = {};
        for (const [key] of defaultValues) {
            if (key in data) {
                const newValue = data[key];
                res[key] = newValue;
            }
        }
        super.overwrite(res);
    }

}

const SettingsStorage = await AppSettingsStorage.create();

export default SettingsStorage;
