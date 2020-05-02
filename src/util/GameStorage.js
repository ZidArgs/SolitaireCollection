import IDBStorage from "/src/util/IDBStorage.js";

let storage = new IDBStorage("games");

const NAME = new WeakMap();
const FIELDS = new WeakMap();
const CARDS = new WeakMap();

function getState(fields) {
    let res = {};
    for (let i of fields) {
        res[i] = [];
        let cards = document.getElementById(i).children;
        Array.from(cards).forEach(el => res[i].push({
            suit: el.suit,
            value: el.value,
            revealed: el.revealed
        }));
    }
    return res;
}

function setState(fields, cards, state) {
    for (let i of fields) {
        let data = state[i];
        let target = document.getElementById(i);
        if (!data) continue;
        data.forEach(el => {
            let card = cards.get(`${el.suit}_${el.value}`);
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
        let name = NAME.get(this);
        let savestate = await storage.get(name);
        if (!!savestate && !!savestate.current.data) {
            return savestate.current.data[key];
        }
        return null;
    }

    async save(data = {}) {
        let name = NAME.get(this);
        let fields = FIELDS.get(this);
        let savestate = await storage.get(name);
        if (!!savestate) {
            savestate.steps.push(savestate.current);
            savestate.current = {
                state: getState(fields),
                data: Object.assign({}, savestate.current.data, data)
            }
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
        let name = NAME.get(this);
        let fields = FIELDS.get(this);
        let cards = CARDS.get(this);
        let savestate = await storage.get(name);
        if (!!savestate) {
            if (!savestate.current.state) {
                savestate.current = {
                    state: savestate.current,
                    data: {}
                }
            }
            setState(fields, cards, savestate.current.state);
            return true;
        }
        return false;
    }

    async restart() {
        let name = NAME.get(this);
        let fields = FIELDS.get(this);
        let cards = CARDS.get(this);
        let savestate = await storage.get(name);
        if (!!savestate.steps.length) {
            savestate.current = savestate.steps[0];
            savestate.steps = [];
            await storage.set(name, savestate);
            setState(fields, cards, savestate.current.state);
        }
    }

    async undo() {
        let name = NAME.get(this);
        let fields = FIELDS.get(this);
        let cards = CARDS.get(this);
        let savestate = await storage.get(name);
        if (!!savestate.steps.length) {
            savestate.current = savestate.steps.pop();
            await storage.set(name, savestate);
            setState(fields, cards, savestate.current.state);
        }
    }

    async reset() {
        let name = NAME.get(this);
        await storage.set(name, null);
    }

}