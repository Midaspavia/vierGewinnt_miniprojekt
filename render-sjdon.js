// render-sjdon.js

function renderSJDON(sjdonNode, parent) {
    if (!Array.isArray(sjdonNode) || sjdonNode.length === 0) {
        throw new Error("renderSJDON: invalid SJDON node");
    }

    const [tag, maybeAttrs, ...rest] = sjdonNode;

    let attrs = {};
    let children = [];

    // 2. Element ist evtl. Attribut-Objekt
    if (
        typeof maybeAttrs === "object" &&
        maybeAttrs !== null &&
        !Array.isArray(maybeAttrs)
    ) {
        attrs = maybeAttrs;
        children = rest;
    } else {
        children = [maybeAttrs, ...rest].filter(c => c !== undefined);
    }

    const el = document.createElement(tag);

    // Attribute setzen
    for (const name of Object.keys(attrs)) {
        el.setAttribute(name, attrs[name]);
    }

    // Kinder
    for (const child of children) {
        if (Array.isArray(child)) {
            // rekursives SJDON-Element
            renderSJDON(child, el);
        } else if (child === null || child === undefined || child === false) {
            continue;
        } else {
            el.appendChild(document.createTextNode(String(child)));
        }
    }

    if (parent) {
        parent.appendChild(el);
    }

    return el;
}