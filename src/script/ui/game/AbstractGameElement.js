import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";

export default class AbstractGameElement extends CustomElement {

    constructor() {
        if (new.target === AbstractGameElement) {
            throw new Error("can not construct abstract class");
        }
        super();
    }

    toString() {
        return AbstractGameElement.getIdentifier(this.suit, this.value);
    }

    toJSON() {
        return {
            "@name": AbstractGameElement.getIdentifier(this.suit, this.value),
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
