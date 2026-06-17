import {isStringNotEmpty} from "@emcjs/core/util/helper/CheckType.js";
import AbstractGameElementPool from "../state/AbstractGameElementPool.js";
import GameStateStorage from "../storage/GameStateStorage.js";
import AbstractGameElement from "../ui/game/AbstractGameElement.js";
import GameElementHolderMap from "../state/GameElementHolderMap.js";

export default class GameState {

    #name;

    #savestate;

    #gameElementHolderMap;

    #gameElementPool;

    #timerTimestamp = new Date();

    constructor(name, gameElementPool, gameElementHolderMap) {
        if (!isStringNotEmpty(name)) {
            throw new TypeError("name has to be a non empty string");
        }
        if (!(gameElementPool instanceof AbstractGameElementPool)) {
            throw new TypeError("gameElementPool has to be an instance of AbstractGameElementPool");
        }
        if (!(gameElementHolderMap instanceof GameElementHolderMap)) {
            throw new TypeError("gameElementHolderMap has to be an instance of GameElementHolderMap");
        }
        this.#name = name;
        this.#gameElementPool = gameElementPool;
        this.#gameElementHolderMap = gameElementHolderMap;
        this.#loadState();
        this.#timerTimestamp = new Date();
    }

    get time() {
        const timestamp = new Date();
        return (this.#savestate.timer || 0) + (timestamp - this.#timerTimestamp);
    }

    get(key) {
        return this.#savestate.current?.data?.[key];
    }

    saveTime() {
        this.#flushTime();
        GameStateStorage.set(this.#name, this.#savestate);
    }

    saveStep(data = {}) {
        this.#savestate.steps.push(this.#savestate.current);
        this.#savestate.current = {
            ...this.#getCurrent(),
            data: Object.assign({}, this.#savestate.current.data, data)
        };
        this.#flushTime();
        GameStateStorage.set(this.#name, this.#savestate);
    }

    restart() {
        if (this.#savestate.steps.length) {
            this.#savestate.current = this.#savestate.steps[0];
            this.#savestate.steps = [];
            GameStateStorage.set(this.#name, this.#savestate);
            this.#applyCurrent();
        }
    }

    undo() {
        if (this.#savestate.steps.length) {
            this.#savestate.current = this.#savestate.steps.pop();
            GameStateStorage.set(this.#name, this.#savestate);
            this.#applyCurrent();
        }
    }

    reset() {
        GameStateStorage.set(this.#name, null);
    }

    #flushTime() {
        const oldTimestamp = this.#timerTimestamp;
        this.#timerTimestamp = new Date();
        this.#savestate.timer += this.#timerTimestamp - oldTimestamp;
    }

    #loadState() {
        this.#savestate = GameStateStorage.get(this.#name);
        if (!this.#savestate) {
            this.#savestate = GameState.#createState();
        }
        this.#applyCurrent();
    }

    #getCurrent() {
        const res = {
            state: {},
            pool: this.#gameElementPool.serialize()
        };
        for (const [name, holder] of this.#gameElementHolderMap) {
            res.state[name] = [];
            const gameElementList = Array.from(holder.children);
            for (const gameElement of gameElementList) {
                if (gameElement instanceof AbstractGameElement) {
                    res.state[name].push(gameElement.serialize());
                }
            }
        }
        return res;
    }

    #applyCurrent() {
        this.#gameElementPool.deserialize(this.#savestate.current.pool);
        const state = this.#savestate.current.state;
        for (const [name, holder] of this.#gameElementHolderMap) {
            const dataList = state[name];
            if (!dataList) {
                continue;
            }
            for (const data of dataList) {
                const gameElement = this.#gameElementPool.getElement(data);
                gameElement.deserialize(data);
                holder.append(gameElement);
            }
        }
    }

    static #createState() {
        return {
            timer: 0,
            current: {
                state: {},
                pool: {},
                data: {}
            },
            steps: []
        };
    }

}
