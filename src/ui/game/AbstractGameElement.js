import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";

export default class AbstractGameElement extends CustomElement {

    constructor() {
        if (new.target === AbstractGameElement) {
            throw new Error("can not construct abstract class");
        }
        super();
    }

    serialize() {
        throw new Error("serialize has not been implemented");
    }

    deserialize() {
        throw new Error("deserialize has not been implemented");
    }

}
