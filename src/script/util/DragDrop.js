import EventTargetManager from "@emcjs/core/util/event/EventTargetManager.js";
import AbstractGameElementPool from "../state/AbstractGameElementPool.js";
import GameElementHolderMap from "../state/GameElementHolderMap.js";
import "../ui/game/playingcard/PlayingCardStack.js";

export default class DragDrop {

    #dropTargtets = new Set();

    #dragElements = new Set();

    #sourceElement = null;

    #dragElement = null;

    #isTouch = false;

    #shiftX = 0;

    #shiftY = 0;

    #documentDragEventManager = new EventTargetManager(document, false);

    #bodyDragEventManager = new EventTargetManager(document.body, false);

    #documentTouchEventManager = new EventTargetManager(document, false);

    constructor() {
        this.#documentDragEventManager.set("mousemove", (event) => {
            this.onDragMove(event);
        });
        this.#documentDragEventManager.set("mouseout", (event) => {
            this.onDragEndLeavePage(event);
        });
        this.#bodyDragEventManager.set("mouseup", (event) => {
            this.onDragEndAnywhere(event);
        });
        this.#documentTouchEventManager.set("touchend", (event) => {
            this.onTouchOther(event);
        });
    }

    setGameElements(gameElementPool, gameElementHolderMap) {
        this.#dragElements.clear();
        this.#dropTargtets.clear();
        if (gameElementPool instanceof AbstractGameElementPool) {
            for (const el of gameElementPool) {
                this.#registerDragElement(el);
            }
        }
        if (gameElementHolderMap instanceof GameElementHolderMap) {
            for (const [, el] of gameElementHolderMap) {
                this.#registerDropTarget(el);
            }
        }
    }

    #registerDropTarget(element) {
        this.#dropTargtets.add(element);
        element.addEventListener("mouseup", (event) => {
            this.onDragEnd(event);
        });
        element.addEventListener("touchend", (event) => {
            this.onTouchTarget(event);
        });
        element.addEventListener("touchstart", (event) => {
            event.preventDefault();
        });
    }

    #registerDragElement(element) {
        this.#dragElements.add(element);
        element.addEventListener("mousedown", (event) => {
            this.onDragStart(event);
        });
        element.addEventListener("touchend", (event) => {
            this.onTouchCard(event);
        });
        element.addEventListener("touchstart", (event) => {
            event.preventDefault();
        });
    }

    onDragCallback(/* source, stack */) {
        return true;
    }

    onDropCallback(/* source, target, stack */) {
        return true;
    }

    onDropChangedCallback(/* source, target, stack */) {
        return;
    }

    // DRAG EVENTS
    onDragStart(event) {
        if (this.#isTouch) {
            return;
        }
        const moved = event.currentTarget;
        const stack = moved.getStackUp();
        if (!this.#dragElement && this.onDragCallback(this.#sourceElement, stack)) {
            this.#shiftX = event.clientX - moved.getBoundingClientRect().left;
            this.#shiftY = event.clientY - moved.getBoundingClientRect().top;
            this.#sourceElement = moved.parentElement;
            this.#dragElement = document.createElement("sc-playingcard-stack");
            this.#dragElement.classList.add("grabbed");
            this.#dragElement.classList.add("floating");
            for (const el of stack) {
                this.#dragElement.append(el);
            }
            setTimeout(() => {
                this.onDragMove(event);
                document.body.append(this.#dragElement);
                this.#documentDragEventManager.active = true;
                this.#bodyDragEventManager.active = true;
            }, 0);
        }
    }

    onDragMove(event) {
        if (this.#isTouch) {
            return;
        }
        if (this.#dragElement) {
            this.#dragElement.style.left = event.pageX - this.#shiftX + "px";
            this.#dragElement.style.top = event.pageY - this.#shiftY + "px";
        }
    }

    onDragEnd(event) {
        if (this.#isTouch) {
            return;
        }
        if (this.#dragElement) {
            const targetElement = event.currentTarget;
            const movedElements = [...this.#dragElement.children];
            if (targetElement != this.#sourceElement && this.onDropCallback(this.#sourceElement, targetElement, movedElements)) {
                for (const el of movedElements) {
                    targetElement.append(el);
                }
                this.#dragElement.remove();
                this.onDropChangedCallback(this.#sourceElement, targetElement, movedElements);
            } else {
                for (const el of movedElements) {
                    this.#sourceElement.append(el);
                }
                this.#dragElement.remove();
            }
            this.#sourceElement = null;
            this.#dragElement = null;
            this.#documentDragEventManager.active = false;
            this.#bodyDragEventManager.active = false;
        }
    }

    onDragEndAnywhere(/* event */) {
        if (this.#isTouch) {
            return;
        }
        if (this.#dragElement) {
            const movedElements = [...this.#dragElement.children];
            for (const el of movedElements) {
                this.#sourceElement.append(el);
            }
            this.#dragElement.remove();
            this.#sourceElement = null;
            this.#dragElement = null;
            this.#documentDragEventManager.active = false;
            this.#bodyDragEventManager.active = false;
        }
    }

    onDragEndLeavePage(event) {
        if (!event.relatedTarget || event.relatedTarget.nodeName == "HTML") {
            this.onDragEndAnywhere(event);
        }
    }

    onTouchCard(event) {
        if (!this.#dragElement) {
            this.#isTouch = true;
            const moved = event.currentTarget;
            const stack = moved.getStackUp();
            if (this.onDragCallback(this.#sourceElement, stack)) {
                this.#sourceElement = moved.parentElement;
                this.#dragElement = document.createElement("sc-playingcard-stack");
                this.#dragElement.classList.add("grabbed");
                this.#dragElement.style.zIndex = 1000;
                this.#dragElement.style.pointerEvents = "none";
                this.#dragElement.style.touchAction = "none";
                this.#dragElement.style.boxShadow = "0px 0px 0px 4px #00ffff";
                this.#dragElement.style.paddingBottom = "calc(12vw * var(--card-scale, 1) - 2.5vmax)";
                this.#dragElement.style.borderRadius = "calc(1vw * var(--card-scale, 1))";
                for (const el of stack) {
                    this.#dragElement.append(el);
                }
                this.#sourceElement.append(this.#dragElement);
                this.#documentTouchEventManager.active = true;
                event.stopPropagation();
            }
        } else {
            this.#isTouch = false;
            const moved = event.currentTarget;
            const movedElements = [...this.#dragElement.children];
            const targetElement = moved.parentElement;
            if (targetElement != this.#sourceElement && this.onDropCallback(this.#sourceElement, targetElement, movedElements)) {
                for (const el of movedElements) {
                    targetElement.append(el);
                }
                this.#dragElement.remove();
                this.onDropChangedCallback(this.#sourceElement, targetElement, movedElements);
            } else {
                for (const el of movedElements) {
                    this.#sourceElement.append(el);
                }
                this.#dragElement.remove();
            }
            this.#sourceElement = null;
            this.#dragElement = null;
            this.#documentTouchEventManager.active = false;
            event.stopPropagation();
        }
        event.preventDefault();
    }

    onTouchTarget(event) {
        if (this.#dragElement) {
            this.#isTouch = false;
            const movedElements = [...this.#dragElement.children];
            const targetElement = event.currentTarget;
            if (targetElement != this.#sourceElement && this.onDropCallback(this.#sourceElement, targetElement, movedElements)) {
                for (const el of movedElements) {
                    targetElement.append(el);
                }
                this.#dragElement.remove();
                this.onDropChangedCallback(this.#sourceElement, targetElement, movedElements);
            } else {
                for (const el of movedElements) {
                    this.#sourceElement.append(el);
                }
                this.#dragElement.remove();
            }
            this.#sourceElement = null;
            this.#dragElement = null;
            this.#documentTouchEventManager.active = false;
            event.stopPropagation();
        }
        event.preventDefault();
    }

    onTouchOther(event) {
        if (this.#dragElement) {
            const movedElements = [...this.#dragElement.children];
            for (const el of movedElements) {
                this.#sourceElement.append(el);
            }
            this.#dragElement.remove();
            this.#sourceElement = null;
            this.#dragElement = null;
            this.#documentTouchEventManager.active = false;
            event.stopPropagation();
        }
        event.preventDefault();
    }

}
