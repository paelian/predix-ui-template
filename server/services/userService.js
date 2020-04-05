var path = require('path');
var BaseService = require('./baseService');

var UserService = class extends BaseService {
    constructor(jwtdata) {
        super();

        this._jwtdata = jwtdata;
    }
    
    get userInfo() {
        return this._jwtdata.body;
    }
};

module.exports = UserService;
