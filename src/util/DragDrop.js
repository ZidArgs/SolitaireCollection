const DROP_TARGETS = new WeakMap();
const DRAG_ELEMENTS = new WeakMap();

let sourceElement = null;
let dragElement = null;
let isTouch = false;
let shiftX = 0;
let shiftY = 0;

function onDragStart(event) {
    if (!!isTouch) return;
    let moved = event.currentTarget;
    let stack = moved.getStackUp();
    if (this.onDragCallback(sourceElement, stack)) {
        shiftX = event.clientX - moved.getBoundingClientRect().left;
        shiftY = event.clientY - moved.getBoundingClientRect().top;
        sourceElement = moved.parentElement;
        dragElement = document.createElement("cgc-playingcardcolumn");
        dragElement.style.position = 'absolute';
        dragElement.style.zIndex = 1000;
        onDragMove(event);
        dragElement.style.pointerEvents = "none";
        dragElement.style.touchAction = "none";
        Array.from(stack).forEach(el => dragElement.append(el));
        document.body.append(dragElement);
        document.addEventListener('mousemove', this.bound.onDragMove);
        document.body.addEventListener("mouseup", this.bound.onDragEndAnywhere);
    }
}

function onDragMove(event) {
    if (!!isTouch) return;
    if (!!dragElement) {
        dragElement.style.left = event.pageX - shiftX + 'px';
        dragElement.style.top = event.pageY - shiftY + 'px';
    }
}

function onDragEnd(event) {
    if (!!isTouch) return;
    if (!!dragElement) {
        let targetElement = event.currentTarget;
        let movedElements  = dragElement.children;
        if (targetElement != sourceElement && this.onDropCallback(sourceElement, targetElement, movedElements)) {
            Array.from(movedElements).forEach(el => targetElement.append(el));
            dragElement.remove();
            this.onDropChangedCallback(sourceElement, targetElement, movedElements);
        } else {
            Array.from(movedElements).forEach(el => sourceElement.append(el));
            dragElement.remove();
        }
        sourceElement = null;
        dragElement = null;
        document.removeEventListener('mousemove', this.bound.onDragMove);
        document.body.removeEventListener("mouseup", this.bound.onDragEndAnywhere);
    }
}

function onDragEndAnywhere(event) {
    if (!!isTouch) return;
    if (!!dragElement) {
        let movedElements = dragElement.children;
        Array.from(movedElements).forEach(el => sourceElement.append(el));
        dragElement.remove();
        sourceElement = null;
        dragElement = null;
        document.removeEventListener('mousemove', this.bound.onDragMove);
        document.body.removeEventListener("mouseup", this.bound.onDragEndAnywhere);
    }
}

function onTouchCard(event) {
    if (!dragElement) {
        isTouch = true;
        let moved = event.currentTarget;
        let stack = moved.getStackUp();
        if (this.onDragCallback(sourceElement, stack)) {
            sourceElement = moved.parentElement;
            dragElement = document.createElement("cgc-playingcardcolumn");
            dragElement.style.zIndex = 1000;
            dragElement.style.pointerEvents = "none";
            dragElement.style.touchAction = "none";
            dragElement.style.boxShadow = "0px 0px 0px 4px #00ffff";
            dragElement.style.paddingBottom = "calc(12vw * var(--card-scale, 1) - 2.5vmax)";
            dragElement.style.borderRadius = "calc(1vw * var(--card-scale, 1))";
            Array.from(stack).forEach(el => dragElement.append(el));
            sourceElement.append(dragElement);
            document.addEventListener('touchend', this.bound.onTouchOther);
            event.stopPropagation();
        }
    } else {
        isTouch = false;
        let moved = event.currentTarget;
        let movedElements = dragElement.children;
        let targetElement = moved.parentElement;
        if (targetElement != sourceElement && this.onDropCallback(sourceElement, targetElement, movedElements)) {
            Array.from(movedElements).forEach(el => targetElement.append(el));
            dragElement.remove();
            this.onDropChangedCallback(sourceElement, targetElement, movedElements);
        } else {
            Array.from(movedElements).forEach(el => sourceElement.append(el));
            dragElement.remove();
        }
        sourceElement = null;
        dragElement = null;
        document.removeEventListener('touchend', this.bound.onTouchOther);
        event.stopPropagation();
    }
}

function onTouchTarget(event) {
    if (!!dragElement) {
        isTouch = false;
        let movedElements = dragElement.children;
        let targetElement = event.currentTarget;
        if (targetElement != sourceElement && this.onDropCallback(sourceElement, targetElement, movedElements)) {
            Array.from(movedElements).forEach(el => targetElement.append(el));
            dragElement.remove();
            this.onDropChangedCallback(sourceElement, targetElement, movedElements);
        } else {
            Array.from(movedElements).forEach(el => sourceElement.append(el));
            dragElement.remove();
        }
        sourceElement = null;
        dragElement = null;
        document.removeEventListener('touchend', this.bound.onTouchOther);
        event.stopPropagation();
    }
}

function onTouchOther(event) {
    if (!!dragElement) {
        let movedElements = dragElement.children;
        Array.from(movedElements).forEach(el => sourceElement.append(el));
        dragElement.remove();
        sourceElement = null;
        dragElement = null;
        document.removeEventListener('touchend', this.bound.onTouchOther);
        event.stopPropagation();
    }
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
            onTouchCard: onTouchCard.bind(this),
            onTouchTarget: onTouchTarget.bind(this),
            onTouchOther: onTouchOther.bind(this),
        };
    }

    registerDropTarget(element) {
        if (Array.isArray(element)) {
            for(let el of element) {
                this.registerDropTarget(el);
            }
        } else {
            DROP_TARGETS.get(this).add(element);
            element.addEventListener("mouseup", this.bound.onDragEnd);
            element.addEventListener("touchend", this.bound.onTouchTarget);
        }
    }

    registerDragElement(element) {
        if (Array.isArray(element)) {
            for(let el of element) {
                this.registerDragElement(el);
            }
        } else {
            DRAG_ELEMENTS.get(this).add(element);
            element.addEventListener("mousedown", this.bound.onDragStart);
            element.addEventListener("touchend", this.bound.onTouchCard);
        }
    }

    onDragCallback(source, stack) {
        return true;
    }

    onDropCallback(source, target, stack) {
        return true;
    }

    onDropChangedCallback(source, target, stack) {
        return;
    }

}