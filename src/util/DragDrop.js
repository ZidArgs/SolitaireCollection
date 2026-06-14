const DROP_TARGETS = new WeakMap();
const DRAG_ELEMENTS = new WeakMap();

let sourceElement = null;
let dragElement = null;
let isTouch = false;
let shiftX = 0;
let shiftY = 0;

function onDragStart(event) {
    if (isTouch) {
        return;
    }
    const moved = event.currentTarget;
    const stack = moved.getStackUp();
    if (!dragElement && this.onDragCallback(sourceElement, stack)) {
        shiftX = event.clientX - moved.getBoundingClientRect().left;
        shiftY = event.clientY - moved.getBoundingClientRect().top;
        sourceElement = moved.parentElement;
        dragElement = document.createElement("cgc-playingcardcolumn");
        dragElement.classList.add("grabbed");
        dragElement.classList.add("floating");
        Array.from(stack).forEach((el) => dragElement.append(el));
        setTimeout(() => {
            onDragMove(event);
            document.body.append(dragElement);
            document.addEventListener("mousemove", this.bound.onDragMove);
            document.body.addEventListener("mouseup", this.bound.onDragEndAnywhere);
            document.addEventListener("mouseout", this.bound.onDragEndLeavePage);
        }, 0);
    }
}

function onDragMove(event) {
    if (isTouch) {
        return;
    }
    if (dragElement) {
        dragElement.style.left = event.pageX - shiftX + "px";
        dragElement.style.top = event.pageY - shiftY + "px";
    }
}

function onDragEnd(event) {
    if (isTouch) {
        return;
    }
    if (dragElement) {
        const targetElement = event.currentTarget;
        const movedElements  = dragElement.children;
        if (targetElement != sourceElement && this.onDropCallback(sourceElement, targetElement, movedElements)) {
            Array.from(movedElements).forEach((el) => targetElement.append(el));
            dragElement.remove();
            this.onDropChangedCallback(sourceElement, targetElement, movedElements);
        } else {
            Array.from(movedElements).forEach((el) => sourceElement.append(el));
            dragElement.remove();
        }
        sourceElement = null;
        dragElement = null;
        document.removeEventListener("mousemove", this.bound.onDragMove);
        document.body.removeEventListener("mouseup", this.bound.onDragEndAnywhere);
        document.removeEventListener("mouseout", this.bound.onDragEndLeavePage);
    }
}

function onDragEndAnywhere(/* event */) {
    if (isTouch) {
        return;
    }
    if (dragElement) {
        const movedElements = dragElement.children;
        Array.from(movedElements).forEach((el) => sourceElement.append(el));
        dragElement.remove();
        sourceElement = null;
        dragElement = null;
        document.removeEventListener("mousemove", this.bound.onDragMove);
        document.body.removeEventListener("mouseup", this.bound.onDragEndAnywhere);
        document.removeEventListener("mouseout", this.bound.onDragEndLeavePage);
    }
}

function onDragEndLeavePage(event) {
    if (!event.relatedTarget || event.relatedTarget.nodeName == "HTML") {
        this.bound.onDragEndAnywhere(event);
    }
}

function onTouchCard(event) {
    if (!dragElement) {
        isTouch = true;
        const moved = event.currentTarget;
        const stack = moved.getStackUp();
        if (this.onDragCallback(sourceElement, stack)) {
            sourceElement = moved.parentElement;
            dragElement = document.createElement("cgc-playingcardcolumn");
            dragElement.classList.add("grabbed");
            dragElement.style.zIndex = 1000;
            dragElement.style.pointerEvents = "none";
            dragElement.style.touchAction = "none";
            dragElement.style.boxShadow = "0px 0px 0px 4px #00ffff";
            dragElement.style.paddingBottom = "calc(12vw * var(--card-scale, 1) - 2.5vmax)";
            dragElement.style.borderRadius = "calc(1vw * var(--card-scale, 1))";
            Array.from(stack).forEach((el) => dragElement.append(el));
            sourceElement.append(dragElement);
            document.addEventListener("touchend", this.bound.onTouchOther);
            event.stopPropagation();
        }
    } else {
        isTouch = false;
        const moved = event.currentTarget;
        const movedElements = dragElement.children;
        const targetElement = moved.parentElement;
        if (targetElement != sourceElement && this.onDropCallback(sourceElement, targetElement, movedElements)) {
            Array.from(movedElements).forEach((el) => targetElement.append(el));
            dragElement.remove();
            this.onDropChangedCallback(sourceElement, targetElement, movedElements);
        } else {
            Array.from(movedElements).forEach((el) => sourceElement.append(el));
            dragElement.remove();
        }
        sourceElement = null;
        dragElement = null;
        document.removeEventListener("touchend", this.bound.onTouchOther);
        event.stopPropagation();
    }
    event.preventDefault();
}

function onTouchTarget(event) {
    if (dragElement) {
        isTouch = false;
        const movedElements = dragElement.children;
        const targetElement = event.currentTarget;
        if (targetElement != sourceElement && this.onDropCallback(sourceElement, targetElement, movedElements)) {
            Array.from(movedElements).forEach((el) => targetElement.append(el));
            dragElement.remove();
            this.onDropChangedCallback(sourceElement, targetElement, movedElements);
        } else {
            Array.from(movedElements).forEach((el) => sourceElement.append(el));
            dragElement.remove();
        }
        sourceElement = null;
        dragElement = null;
        document.removeEventListener("touchend", this.bound.onTouchOther);
        event.stopPropagation();
    }
    event.preventDefault();
}

function onTouchOther(event) {
    if (dragElement) {
        const movedElements = dragElement.children;
        Array.from(movedElements).forEach((el) => sourceElement.append(el));
        dragElement.remove();
        sourceElement = null;
        dragElement = null;
        document.removeEventListener("touchend", this.bound.onTouchOther);
        event.stopPropagation();
    }
    event.preventDefault();
}

export default class DragDrop {

    constructor() {
        DROP_TARGETS.set(this, new Set());
        DRAG_ELEMENTS.set(this, new Set());
        this.bound = {
            onDragStart: onDragStart.bind(this),
            onDragMove: onDragMove.bind(this),
            onDragEnd: onDragEnd.bind(this),
            onDragEndAnywhere: onDragEndAnywhere.bind(this),
            onDragEndLeavePage: onDragEndLeavePage.bind(this),
            onTouchCard: onTouchCard.bind(this),
            onTouchTarget: onTouchTarget.bind(this),
            onTouchOther: onTouchOther.bind(this)
        };
    }

    registerDropTarget(element) {
        if (Array.isArray(element)) {
            for (const el of element) {
                this.registerDropTarget(el);
            }
        } else {
            DROP_TARGETS.get(this).add(element);
            element.addEventListener("mouseup", this.bound.onDragEnd);
            element.addEventListener("touchend", this.bound.onTouchTarget);
            element.addEventListener("touchstart", (event) => {
                event.preventDefault();
            });
        }
    }

    registerDragElement(element) {
        if (Array.isArray(element)) {
            for (const el of element) {
                this.registerDragElement(el);
            }
        } else {
            DRAG_ELEMENTS.get(this).add(element);
            element.addEventListener("mousedown", this.bound.onDragStart);
            element.addEventListener("touchend", this.bound.onTouchCard);
            element.addEventListener("touchstart", (event) => {
                event.preventDefault();
            });
        }
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

}
