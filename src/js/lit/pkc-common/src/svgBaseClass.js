import { ExportableBaseClass } from './exportableBaseClass';
import { DomHelperMixin } from './domHelperMixin';

var SvgBaseBehavior = {

    __NS: () => { return 'http://www.w3.org/2000/svg'; },

    _createElement(elemType, objProperties, useNSForAttributes = false) {
        var elem = document.createElementNS(this.__NS(), elemType);
        if (typeof objProperties === 'object') {
            for (var key of Object.keys(objProperties)) {
                if (key.toLowerCase().indexOf('xlink:') >= 0) {
                    elem.setAttributeNS('http://www.w3.org/1999/xlink', key, objProperties[key]);
                } else {
                    elem.setAttributeNS((useNSForAttributes) ? this.__NS() : null, key, objProperties[key]);
                }
            }
        }
        return elem;
    }

};

var SvgBaseMixin = function (superClass) {
    return class extends superClass {
        constructor() {
            super();

            Object.assign(this, SvgBaseBehavior);
        }

        get name() { return this._name; } set name(val) { this._name = val; }
    };
};

class SvgBaseClass extends SvgBaseMixin(DomHelperMixin(ExportableBaseClass)) {
    constructor(name) {
        super();
        this.name = name;
        this.layer = this._createElement("g", {});
    }

    // 'public' methods
    get element() { return this.layer; } set element(val) { this.layer = val; }

    get elementCopy() { var rtn = $(this.layer).clone(true); return rtn; }

}

export {SvgBaseClass, SvgBaseMixin};