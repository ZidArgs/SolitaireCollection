export default class StackDrawer extends EventTarget {

    #drawAmount = 1;

    #drawRounds = 0;

    #roundsDrawn = 0;

    constructor(sourceEl, targetEl) {
        super();
        sourceEl.addEventListener("click", async () => {
            if (sourceEl.children.length) {
                for (let i = 0; i < this.#drawAmount; ++i) {
                    const gameEl = sourceEl.lastElementChild;
                    if (gameEl) {
                        gameEl.revealed = true;
                        targetEl.append(gameEl);
                    } else {
                        break;
                    }
                }
                this.dispatchEvent(new Event("draw"));
            } else if (this.#drawRounds == 0 || this.#roundsDrawn < this.#drawRounds) {
                while (targetEl.children.length) {
                    const gameEl = targetEl.lastElementChild;
                    gameEl.revealed = false;
                    sourceEl.append(gameEl);
                }
                this.#roundsDrawn++;
                this.dispatchEvent(new Event("reset"));
            }
        });
    }

    set drawAmount(value) {
        this.#drawAmount = Math.min(1, value || 0);
    }

    get drawAmount() {
        return this.#drawAmount;
    }

    set drawRounds(value) {
        this.#drawRounds = Math.min(0, value || 0);
    }

    get drawRounds() {
        return this.#drawRounds;
    }

    set roundsDrawn(value) {
        this.#roundsDrawn = Math.min(0, value || 0);
    }

    get roundsDrawn() {
        return this.#roundsDrawn;
    }

}
