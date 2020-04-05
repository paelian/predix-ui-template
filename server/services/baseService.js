var path = require('path');
var EmitterBase = require(path.join(__base, './server/lib/EmitterBase'));
var DiagnosticsService = require(path.join(__base, './server/services/diagnosticsService'));

var BaseService = class extends EmitterBase  {
    constructor() {
        super();

        this._diag = new DiagnosticsService();
    }
    
};

module.exports = BaseService;
