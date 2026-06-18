import {isStringNotEmpty} from "@emcjs/core/util/helper/CheckType.js";
import AbstractGameElementHolder from "../ui/game/AbstractGameElementHolder.js";

export default class GameElementHolderMap {

    #gameElementHolders = new Map();

    addHolder(name, holderElement) {
        if (!isStringNotEmpty(name)) {
            throw new TypeError("name has to be a non empty string");
        }
        if (!(holderElement instanceof AbstractGameElementHolder)) {
            throw new TypeError("holderElement has to be an instance of AbstractGameElementHolder");
        }
        if (this.#gameElementHolders.has(name)) {
            throw new Error(`a holder with the name "${name}" has already been registered`);
        }
        this.#gameElementHolders.set(name, holderElement);
    }

    getHolder(name) {
        return this.#gameElementHolders.get(name);
    }

    get holders() {
        return [...this.#gameElementHolders.values()];
    }

    [Symbol.iterator]() {
        return this.#gameElementHolders[Symbol.iterator]();
    }

}
