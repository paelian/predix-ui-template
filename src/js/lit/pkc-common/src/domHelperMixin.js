var DomHelpBehavior = {
    _empty(objParent) {
        while (objParent.firstChild) { objParent.removeChild(objParent.firstChild) }
    },
    _getProps(objSrc) {
        let rtn = {};
        for (var key of Object.keys(objSrc)) {
            rtn[key] = objSrc[key];
        }
        return rtn;
    },
    _addNew(objParent, elemType, objProperties, textContent) {
        var elem = document.createElement(elemType);
        if (typeof objProperties === 'object') {
            for (var key of Object.keys(objProperties)) {
                elem[key] = objProperties[key];
            }
        }
        if (typeof textContent == 'string') {
            if (textContent.length > 0) {
                elem.textContent = textContent;
            }
        }
        objParent.appendChild(elem);
        return elem;
    },
    _createElement(elemType, objProperties, textContent) {
        var elem = document.createElement(elemType);
        if (typeof objProperties === 'object') {
            for (var key of Object.keys(objProperties)) {
                let a = document.createAttribute(key);
                a.value = objProperties[key];
                elem.setAttributeNode(a);
                // elem[key] = objProperties[key];
            }
        }
        if (typeof textContent == 'string') {
            if (textContent.length > 0) {
                elem.textContent = textContent;
            }
        }
        return elem;
    }
};

var DomHelperMixin = function (superClass) {
    return class extends superClass {
        constructor() {
            super();
            Object.assign(this, DomHelpBehavior);
        }

    };
};

export { DomHelperMixin };