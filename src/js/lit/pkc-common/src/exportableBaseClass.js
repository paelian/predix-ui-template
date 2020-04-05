export class ExportableBaseClass {
    constructor() {
        this.exportExclusionList = [
            'exportExclusionList', 'export'
        ];

    }

    _getAllPropertyNames() {
        var _self = this;
        let names = [];
        let exclusionList = _self.exportExclusionList;
        do {
            names.push.apply(names, Object.getOwnPropertyNames(_self));
            _self = Object.getPrototypeOf(_self);
        } while (_self !== Object.prototype);
        let rtn = names.filter(name => name !== 'constructor');
        let arr2 = rtn.filter(elem => { return exclusionList.indexOf(elem) === -1; });
        return arr2;
    }

    get export() {
        var _self = this;
        var rtn = {
        };
        for (let key of _self._getAllPropertyNames()) {
            if (key[0] == '_' ||
                typeof _self[key] == 'function'
            ) {
                continue;
            }
            // console.log('key is', key);
            rtn[key] = _self[key];
        }
        return rtn;
    }


}
