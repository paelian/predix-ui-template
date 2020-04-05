var express = require('express');
var router = express.Router();
var path = require('path');
let fs = require('fs');
var ViewsController = require('./viewsController');
var sprtDataService = require(path.join(__base, '/server/services/sprtDataService'));
var moment = require('moment');

var SummaryController = class extends ViewsController {
    constructor(service, predixConfig, dataServiceConfig) {
        super();

        // let basic_uaaConfig = { uaaUri: predixConfig.uaa.uri, zoneId: predixConfig.uaa.zoneId, clientCredential: predixConfig.uaa.base64ClientCredential };
        // this._datasvc = (dataServiceConfig && dataServiceConfig.get("UISupportDataService")) ? new sprtDataService(dataServiceConfig.get("UISupportDataService")) : null;

    }

    async _sample_donotuse(req, res, next) {
        var _self = this;
        try {
            var rtn = 'ok';

            let body = (req.query && req.query.encObj) ? JSON.parse((new Buffer(req.query.encObj, 'base64')).toString()) : null;
            if (!body) throw new Error('Must specify input parameters (encObj)!');

            var qry = body.qry;

            try {
                let filter = new Filter(qry);
                let rpn = filter.rpn;
                let tree = filter.tree;
                res.json(Models.PxaResults.ok({ val: 0, rpn, tree, msg: 'Expression parsed ok' }));
                return;
            } catch (er) {
                res.json(Models.PxaResults.ok({ val: -1, msg: 'Error occurred while trying to parse expression', detail: er }));
                return;
            }

        } catch (e) {
            res.json(Models.PxaResults.err(e));
        }
    }
    
};

var routerMain = function (predixConfig, dataServiceConfig) {
    var controller = new SummaryController(null, predixConfig, dataServiceConfig);

    router.route('/')
        .get(controller.index.bind(controller));

    router.route('/page/:id')
        .get(controller.page.bind(controller));


    return router;
};

module.exports = routerMain;
