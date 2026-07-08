export default class SortGameWinCondition {

    #conditions = new Map();

    setCondition(element, condition) {
        const conditionIdentifiers = [];
        for (const props of condition) {
            conditionIdentifiers.push({...props});
        }
        this.#conditions.set(element, conditionIdentifiers);
    }

    check() {
        for (const [element, check] of this.#conditions) {
            if (check.length) {
                let gameEl = element.children[0];
                for (const props of check) {
                    if (!gameEl) {
                        return false;
                    }
                    for (const name in props) {
                        if (props[name] !== gameEl[name]) {
                            return false;
                        }
                    }
                    gameEl = gameEl.nextElementSibling;
                }
            } else if (element.children.length) {
                return false;
            }
        }
        return true;
    }

}
