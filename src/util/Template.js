const TEMPLATE = new WeakMap;

export default class Template {

    constructor(template) {
        if (template instanceof HTMLTemplateElement) {
            TEMPLATE.set(this, template);
        } else {
            let buf = document.createElement('template');
            if (template instanceof HTMLElement) {
                buf.append(template);
            } else if (typeof template === "string") {
                buf.innerHTML = template;
            }
            TEMPLATE.set(this, buf);
        }
    }

    generate() {
        return document.importNode(TEMPLATE.get(this).content, true);
    }

    static generate(template) {
        if (template instanceof HTMLTemplateElement) {
            return document.importNode(template.content, true);
        }
        return "";
    }

}