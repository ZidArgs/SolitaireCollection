const DROP_TARGETS = new WeakMap();
const DRAG_ELEMENTS = new WeakMap();

let sourceElement = null;
let dragElement = null;
let shiftX = 0;
let shiftY = 0;

function startDrag(event) {
    let moved = event.currentTarget;
    let stack = moved.getStackUp();
    if (this.onDragCallback(stack)) {
        if (!!event.touches) {
            shiftX = event.touches[0].clientX - moved.getBoundingClientRect().left;
            shiftY = event.touches[0].clientY - moved.getBoundingClientRect().top;
        } else {
            shiftX = event.clientX - moved.getBoundingClientRect().left;
            shiftY = event.clientY - moved.getBoundingClientRect().top;
        }
        sourceElement = moved.parentElement;
        dragElement = document.createElement("cgc-playingcardcolumn");
        dragElement.style.position = 'absolute';
        dragElement.style.zIndex = 1000;
        onMouseMove(event);
        dragElement.style.pointerEvents = "none";
        Array.from(stack).forEach(el => dragElement.append(el));
        document.body.append(dragElement);
    }
}
  
function onMouseMove(event) {
    if (!!dragElement) {
        if (!!event.touches) {
            dragElement.style.left = event.touches[0].pageX - shiftX + 'px';
            dragElement.style.top = event.touches[0].pageY - shiftY + 'px';
        } else {
            dragElement.style.left = event.pageX - shiftX + 'px';
            dragElement.style.top = event.pageY - shiftY + 'px';
        }
    }
}

function onDrop(event) {
    if (!!dragElement) {
        let targetElement = event.currentTarget;
        let movedElements  = dragElement.children;
        if (this.onDropCallback(targetElement, movedElements)) {
            Array.from(movedElements).forEach(el => targetElement.append(el));
            this.onDropChangedCallback(sourceElement, targetElement, movedElements);
        } else {
            Array.from(movedElements).forEach(el => sourceElement.append(el));
        }
        dragElement.remove();
        sourceElement = null;
        dragElement = null;
    }
}

function onDropAnywhere(event) {
    if (!!dragElement) {
        let movedElements  = dragElement.children;
        Array.from(movedElements).forEach(el => sourceElement.append(el));
        dragElement.remove();
        sourceElement = null;
        dragElement = null;
    }
}

document.addEventListener('mousemove', onMouseMove);
document.addEventListener('touchmove', onMouseMove);
document.body.addEventListener("mouseup", onDropAnywhere);
document.body.addEventListener("touchend", onDropAnywhere);

export default class DragDrop {

    constructor() {
        DROP_TARGETS.set(this, new Set());
        DRAG_ELEMENTS.set(this, new Set());
    }

    registerDropTarget(element) {
        if (Array.isArray(element)) {
            for(let el of element) {
                this.registerDropTarget(el);
            }
        } else {
            DROP_TARGETS.get(this).add(element);
            element.addEventListener("mouseup", onDrop.bind(this));
            element.addEventListener("touchend", onDrop.bind(this));
        }
    }

    onDropCallback(target, stack) {
        return true;
    }

    onDropChangedCallback(source, target, stack) {
        return;
    }

    registerDragElement(element) {
        if (Array.isArray(element)) {
            for(let el of element) {
                this.registerDragElement(el);
            }
        } else {
            DRAG_ELEMENTS.get(this).add(element);
            element.addEventListener("mousedown", startDrag.bind(this));
            element.addEventListener("touchstart", startDrag.bind(this));
        }
    }

    onDragCallback(stack) {
        return true;
    }

}