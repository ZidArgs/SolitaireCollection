export default class AbstractGameElementPool {

    constructor() {
        if (new.target === AbstractGameElementPool) {
            throw new Error("can not construct abstract class");
        }
    }

    getElement() {
        throw new Error("getElement has not been implemented");
    }

    serialize() {
        throw new Error("serialize has not been implemented");
    }

    deserialize() {
        throw new Error("deserialize has not been implemented");
    }

}
