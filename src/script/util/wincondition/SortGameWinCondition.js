import AbstractGameElement from "../../ui/game/AbstractGameElement.js";

export default class SortGameWinCondition {

    #conditions = new Map();

    setCondition(element, condition) {
        const conditionIdentifiers = [];
        for (const el of condition) {
            conditionIdentifiers.push(AbstractGameElement.getIdentifier(...el));
        }
        this.#conditions.set(element, conditionIdentifiers);
    }

    check() {
        for (const [element, check] of this.#conditions) {
            if (check.length) {
                let el = element.children[0];
                for (const j of check) {
                    if (!el) {
                        return false;
                    }
                    if (j !== el.toString()) {
                        return false;
                    }
                    el = el.nextElementSibling;
                }
            } else if (element.children.length) {
                return false;
            }
        }
        return true;
    }

}
