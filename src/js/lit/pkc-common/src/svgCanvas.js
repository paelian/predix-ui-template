import { ExportableBaseClass } from './exportableBaseClass';
import { DomHelperMixin } from './domHelperMixin';
import { SvgBaseMixin } from './svgBaseClass';

class BaseClass {
    constructor() {
    }
}

export class SvgCanvas extends SvgBaseMixin(DomHelperMixin(BaseClass)) {
    constructor(optionsObj) {
        super();

        let _options = Object.assign({ 'version': '1.1' }, optionsObj);

        this._svg = this._createElement('svg', _options);
    }

    get svg() { return this._svg; }

    group(attachToParent, id, optionsObj) {
        var _self = this;
        let rtn = _self._createElement('g', Object.assign({ id }, optionsObj));
        if (attachToParent && typeof attachToParent === 'object') {
            attachToParent.appendChild(rtn);
        } else {
            _self._svg.appendChild(rtn);
        }
        return rtn;
    }

    rect(attachToParent, x, y, width, height, rx = null, ry = null, optionsObj) {
        var _self = this;
        let _options = { x, y, width, height };
        if (rx) _options.rx = rx;
        if (ry) _options.ry = ry;
        let rtn = _self._createElement('rect', Object.assign(_options, optionsObj));
        if (attachToParent && typeof attachToParent === 'object') {
            attachToParent.appendChild(rtn);
        } else {
            _self._svg.appendChild(rtn);
        }
        return rtn;
    }

    text(attachToParent, x, y, value, optionsObj) {
        var _self = this;
        let rtn = _self._createElement('text', Object.assign({ x, y }, optionsObj));
        rtn.textContent = value;
        if (attachToParent && typeof attachToParent === 'object') {
            attachToParent.appendChild(rtn);
        } else {
            _self._svg.appendChild(rtn);
        }
        return rtn;
    }

    line(attachToParent, x1, y1, x2, y2, optionsObj) {
        var _self = this;
        let rtn = _self._createElement('line', Object.assign({ x1, y1, x2, y2 }, optionsObj));
        if (attachToParent && typeof attachToParent === 'object') {
            attachToParent.appendChild(rtn);
        } else {
            _self._svg.appendChild(rtn);
        }
        return rtn;
    }

    image(attachToParent, x, y, width, height, href, optionsObj) {
        var _self = this;
        let _options = { x, y, width, height, 'xlink:href': href };
        let rtn = _self._createElement('image', Object.assign(_options, optionsObj));
        if (attachToParent && typeof attachToParent === 'object') {
            attachToParent.appendChild(rtn);
        } else {
            _self._svg.appendChild(rtn);
        }
        return rtn;
    }

    polygon(attachToParent, points, optionsObj) {
        var _self = this;
        let _points = null;
        if (typeof points === 'string') {
            _points = points;
        } else {
            if (Array.isArray(points)) {
                points.forEach(p => { // <-- p should also be an array of two values, x and y
                    if (!_points) {
                        _points = p.join(',');
                    } else {
                        _points += ` ${p.join(',')}`;
                    }
                });
            }
        }
        let rtn = _self._createElement('polygon', Object.assign({ points: _points }, optionsObj));
        if (attachToParent && typeof attachToParent === 'object') {
            attachToParent.appendChild(rtn);
        } else {
            _self._svg.appendChild(rtn);
        }
        return rtn;
    }

}