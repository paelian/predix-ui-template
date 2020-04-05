var BaseController = class {
    constructor() {
        this.isSubclass = false;
    }
    
    get testForBase() {
        return !this.isSubclass;
    }

    get defaultResultsResponse() { return { status: 200, results: '' }; }
};

module.exports = BaseController;
