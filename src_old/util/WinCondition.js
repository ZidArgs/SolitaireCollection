let condition = {};

class WinCondition {

    set(value) {
        condition = JSON.parse(JSON.stringify(value));
    }

    check() {
        for (const i in condition) {
            const check = condition[i];
            let el = document.getElementById(i).children[0];
            for (const j of check) {
                if (!el) {
                    return false;
                }
                if (j != `${el.suit}_${el.value}`) {
                    return false;
                }
                el = el.nextElementSibling;
            }
        }
        return true;
    }

}

export default new WinCondition();
