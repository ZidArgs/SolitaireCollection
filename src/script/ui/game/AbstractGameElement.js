import Counter from "@emcjs/core/util/counter/Counter.js";
import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";

const INSTANCE_COUNTERS = new Map();

function getInstanceNumber(name) {
    if (INSTANCE_COUNTERS.has(name)) {
        return INSTANCE_COUNTERS.get(name).next;
    }
    const counter = new Counter();
    INSTANCE_COUNTERS.set(name, counter);
    return counter.next;
}

export default class AbstractGameElement extends CustomElement {

    #suit;

    #value;

    #instance;

    constructor(suit, value) {
        if (new.target === AbstractGameElement) {
            throw new Error("can not construct abstract class");
        }
        super();
        /* --- */
        this.#suit = suit;
        this.#value = value;
        this.#instance = getInstanceNumber(`${this.suit}_${this.value}`);
    }

    get suit() {
        return this.#suit;
    }

    get value() {
        return this.#value;
    }

    get instance() {
        return this.#instance;
    }

    toString() {
        return AbstractGameElement.getIdentifier(this.suit, this.value, this.instance);
    }

    toJSON() {
        return {
            "@name": this.toString(),
            ...this.serialize()
        };
    }

    serialize() {
        throw new Error("serialize has not been implemented");
    }

    deserialize() {
        throw new Error("deserialize has not been implemented");
    }

    static getIdentifier(...values) {
        return `GameElement[${values.join("|")}]`;
    }

}
