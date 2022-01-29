function openDB(name) {
    return new Promise(function(resolve, reject) {
        const request = indexedDB.open(name);
        request.onupgradeneeded = function(event) {
            const db = request.result;
            if (!db.objectStoreNames.contains("data")) {
                db.createObjectStore("data");
            }
        };
        request.onsuccess = function() {
            resolve(request.result);
        };
        request.onerror = function(e) {
            reject(e);
        }
    });
}

const NAME = new WeakMap();
const DB_INSTANCE = new WeakMap();

async function getStoreWritable(caller) {
    if (!DB_INSTANCE.has(caller)) {
        DB_INSTANCE.set(caller, await openDB(NAME.get(caller)));
    }
    return DB_INSTANCE.get(caller).transaction("data", "readwrite").objectStore("data");
}

async function getStoreReadonly(caller) {
    if (!DB_INSTANCE.has(caller)) {
        DB_INSTANCE.set(caller, await openDB(NAME.get(caller)));
    }
    return DB_INSTANCE.get(caller).transaction("data", "readonly").objectStore("data");
}

export default class IDBStorage {

    constructor(name) {
        NAME.set(this, name);
    }

    set(key, value) {
        return new Promise(async function(resolve, reject) {
            const transaction = await getStoreWritable(this);
            const request = transaction.put(value, key);
            request.onsuccess = function(e) {
                resolve();
            };
            request.onerror = function(e) {
                reject(e);
            }
        }.bind(this));
    }

    get(key, value) {
        return new Promise(async function(resolve, reject) {
            const transaction = await getStoreReadonly(this);
            const request = transaction.get(key);
            request.onsuccess = function(e) {
                const res = e.target.result;
                if (typeof res == "undefined") {
                    resolve(value);
                } else {
                    resolve(res);
                }
            };
            request.onerror = function(e) {
                reject(e);
            }
        }.bind(this));
    }

    has(key) {
        return new Promise(async function(resolve, reject) {
            const transaction = await getStoreReadonly(this);
            const request = transaction.getKey(key);
            request.onsuccess = function(e) {
                resolve(e.target.result === key);
            };
            request.onerror = function(e) {
                reject(e);
            }
        }.bind(this));
    }

    delete(key) {
        return new Promise(async function(resolve, reject) {
            const transaction = await getStoreWritable(this);
            const request = transaction.delete(key);
            request.onsuccess = function(e) {
                resolve();
            };
            request.onerror = function(e) {
                reject(e);
            }
        }.bind(this));
    }

    clear() {
        return new Promise(async function(resolve, reject) {
            const transaction = await getStoreWritable(this);
            const request = transaction.clear();
            request.onsuccess = function(e) {
                resolve();
            };
            request.onerror = function(e) {
                reject(e);
            }
        }.bind(this));
    }

    keys(filter) {
        return new Promise(async function(resolve, reject) {
            const transaction = await getStoreReadonly(this);
            const request = transaction.getAllKeys();
            request.onsuccess = function(e) {
                const res = e.target.result;
                if (typeof filter == "string") {
                    resolve(res.filter(key => key.startsWith(filter)));
                } else {
                    resolve(res);
                }
            };
            request.onerror = function(e) {
                reject(e);
            }
        }.bind(this));
    }

    getAll(filter) {
        return new Promise(async function(resolve, reject) {
            const transaction = await getStoreReadonly(this);
            const request = transaction.openCursor();
            const res = {};
            request.onsuccess = function(e) {
                const el = e.target.result;
                if (el) {
                    res[el.key] = el.value;
                    el.continue();
                } else if (typeof filter == "string") {
                    resolve(res.filter(key => key.startsWith(filter)));
                } else {
                    resolve(res);
                }
            };
            request.onerror = function(e) {
                reject(e);
            }
        }.bind(this));
    }

    setAll(values) {
        return new Promise(async function(resolve, reject) {
            const transaction = await getStoreWritable(this);
            const all = [];
            for (const key in values) {
                all.push(new Promise(function(res, rej) {
                    const request = transaction.put(values[key], key);
                    request.onsuccess = function(e) {
                        res();
                    };
                    request.onerror = function(e) {
                        rej(e);
                    }
                }));
            }
            Promise.all(all).then(resolve, reject);
        }.bind(this));
    }

}
