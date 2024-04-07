import IDBStorage from "/src/util/IDBStorage.js";

const storage = new IDBStorage("games");

const NAME = new WeakMap();
const FIELDS = new WeakMap();
const CARDS = new WeakMap();

function getState(fields) {
    const res = {};
    for (const i of fields) {
        res[i] = [];
        const cards = document.getElementById(i).children;
        Array.from(cards).forEach((el) => res[i].push({
            suit: el.suit,
            value: el.value,
            revealed: el.revealed
        }));
    }
    return res;
}

function setState(fields, cards, state) {
    for (const i of fields) {
        const data = state[i];
        const target = document.getElementById(i);
        if (!data) {
            continue;
        }
        data.forEach((el) => {
            const card = cards.get(`${el.suit}_${el.value}`);
            card.revealed = el.revealed;
            target.append(card);
        });
    }
}

export default class GameStorage {

    constructor(name, fields, cards) {
        NAME.set(this, name);
        FIELDS.set(this, fields);
        CARDS.set(this, cards);
    }

    async get(key) {
        const name = NAME.get(this);
        const savestate = await storage.get(name);
        if (!!savestate && !!savestate.current.data) {
            return savestate.current.data[key];
        }
        return null;
    }

    async save(data = {}) {
        const name = NAME.get(this);
        const fields = FIELDS.get(this);
        let savestate = await storage.get(name);
        if (savestate) {
            savestate.steps.push(savestate.current);
            savestate.current = {
                state: getState(fields),
                data: Object.assign({}, savestate.current.data, data)
            };
        } else {
            savestate = {
                current: {
                    state: getState(fields),
                    data: Object.assign({}, data)
                },
                steps: []
            };
        }
        await storage.set(name, savestate);
    }

    async load() {
        const name = NAME.get(this);
        const fields = FIELDS.get(this);
        const cards = CARDS.get(this);
        const savestate = await storage.get(name);
        if (savestate) {
            if (!savestate.current.state) {
                savestate.current = {
                    state: savestate.current,
                    data: {}
                };
            }
            setState(fields, cards, savestate.current.state);
            return true;
        }
        return false;
    }

    async restart() {
        const name = NAME.get(this);
        const fields = FIELDS.get(this);
        const cards = CARDS.get(this);
        const savestate = await storage.get(name);
        if (savestate.steps.length) {
            savestate.current = savestate.steps[0];
            savestate.steps = [];
            await storage.set(name, savestate);
            setState(fields, cards, savestate.current.state);
        }
    }

    async undo() {
        const name = NAME.get(this);
        const fields = FIELDS.get(this);
        const cards = CARDS.get(this);
        const savestate = await storage.get(name);
        if (savestate.steps.length) {
            savestate.current = savestate.steps.pop();
            await storage.set(name, savestate);
            setState(fields, cards, savestate.current.state);
        }
    }

    async reset() {
        const name = NAME.get(this);
        await storage.set(name, null);
    }

}
