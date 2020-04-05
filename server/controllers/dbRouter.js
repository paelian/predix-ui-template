var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var ViewsController = require('./viewsController');
var os = require('os');
var PgdbService = require(path.join(__base, '/server/services/pgdbService'));

var PgdbController = class extends ViewsController {
    constructor(service, predixConfig) {
        super();

        this._pg = (predixConfig && predixConfig.postgres) ? new PgdbService(predixConfig.postgres) : null;
    }

    async callSP(req, res) {
        var _self = this;
        try {
            if (!_self._pg) throw new Error('Missing postgres data service - probably missing Predix configuration!');

            let key = (req.query && req.query.key) ? req.query.key : null;
            if (!key) throw new Error('Must specify SP to call!');

            let inputs = (req.body && typeof req.body === 'object') ? req.body : null;
            if (!inputs) throw new Error('Must specify input params for SP!');

            let _inputs = Object.assign({ // default values
                // DebugOnlineFlg: 0,
                // UseGlobalDescriptions: 0,
                // LanguageNumber: 0,
                // TimeZone: null
                schema: 'staging',
                orderedInputs: []
            }, inputs);
            let rtn = await _self._pg._processStandardSPCall(_inputs.schema, key, _inputs.orderedInputs);

            res.json(Models.PxaResults.ok(rtn));
        } catch (e) {
            res.json(Models.PxaResults.err(e));
        }
    }

    async callSPLoop(req, res) {
        var _self = this;
        try {
            if (!_self._pg) throw new Error('Missing postgres data service - probably missing Predix configuration!');

            let key = (req.query && req.query.key) ? req.query.key : null;
            if (!key) throw new Error('Must specify SP to call!');

            let inputs = (req.body && typeof req.body === 'object') ? req.body : null;
            if (!key) throw new Error('Must specify input params for SP!');

            let _inputs = Object.assign({ // default values
                // DebugOnlineFlg: 0,
                // UseGlobalDescriptions: 0,
                // LanguageNumber: 0,
                // TimeZone: null
                schema: 'staging',
                orderedInputs: [[]]
            }, inputs);
            let rtn = await _self._pg._processStandardSPCallLoop(_inputs.schema, key, _inputs.orderedInputs);

            res.json(Models.PxaResults.ok(rtn));
        } catch (e) {
            res.json(Models.PxaResults.err(e));
        }
    }

    async copyfrom(req, res, next) {
        var _self = this;
        try {
            if (!_self._pg) throw new Error('Missing postgres data service - probably missing Predix configuration!');

            let inputs = (req.body && typeof req.body === 'object') ? req.body : null;
            if (!inputs) throw new Error('Must specify input params for COPY!');

            let _inputs = Object.assign({ // default values
                headerName: '',
                headerFields: '',
                file: '',
                schema: ''
            }, inputs);
            let rtn = await _self._pg.import_from_csvfile({name: _inputs.headerName, fields: inputs.headerFields}, _inputs.file, _inputs.schema);

            res.json(Models.PxaResults.ok(rtn));
        } catch (e) {
            res.json(Models.PxaResults.err(e));
        }
    }


};

var routerMain = function (obj) {
    var controller = new PgdbController(null, obj);

    router.route('/callsp')
        .post(controller.callSP.bind(controller));

    router.route('/callsploop')
        .post(controller.callSPLoop.bind(controller));

    router.route('/copyfrom')
        .post(controller.copyfrom.bind(controller));

    return router;
};

module.exports = routerMain;
