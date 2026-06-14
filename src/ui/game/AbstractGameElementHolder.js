import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";

export default class AbstractGameElementHolder extends CustomElement {

    constructor() {
        if (new.target === AbstractGameElementHolder) {
            throw new Error("can not construct abstract class");
        }
        super();
    }

}
